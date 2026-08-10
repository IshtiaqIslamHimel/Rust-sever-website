import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PLAYERS, INITIAL_SERVERS, INITIAL_KILLS, STORE_PACKAGES, GIVEAWAYS } from './src/data/mockData.ts';
import { KillEvent, RustServer, PlayerProfile } from './src/types.ts';
import { checkDbConnection, initDbTables, fetchSteamPlayerSummary, fetchSteamAvatarsBatch, fetchBattleMetricsServerInfo, fetchBattleMetricsServerById, getDbPool, logKillToDb, queryRustServerRcon, fetchRustMapsInfo, fetchRustMapsSwaggerSpec } from './server/integrations.ts';

async function startServer() {
  const app = express();
  const PORT = Number.parseInt(process.env.PORT || '3000', 10);
  const httpServer = createServer(app);
  const allowedOrigins = (process.env.APP_ORIGINS || process.env.APP_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const isOriginAllowed = (origin?: string) =>
    !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin.replace(/\/$/, ''));

  const serverConfig = {
    battleMetricsId: process.env.BATTLEMETRICS_SERVER_ID || '40299572',
    ip: process.env.RUST_SERVER_IP || '15.235.132.88',
    gamePort: Number.parseInt(process.env.RUST_GAME_PORT || '25096', 10),
    queryPort: Number.parseInt(process.env.RUST_QUERY_PORT || '25097', 10),
    rconPort: Number.parseInt(process.env.RUST_RCON_PORT || '25098', 10),
    rconPassword: process.env.RUST_RCON_PASSWORD || '',
    defaultSeed: Number.parseInt(process.env.RUST_WORLD_SEED || '8491029', 10),
    defaultWorldSize: Number.parseInt(process.env.RUST_WORLD_SIZE || '3500', 10)
  };

  if (process.env.NODE_ENV === 'production' && !serverConfig.rconPassword) {
    console.warn('RUST_RCON_PASSWORD is not configured; live RCON data will be unavailable.');
  }

  if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // Allow the separately hosted Vercel frontend to call this Railway API.
  app.use((req, res, next) => {
    const origin = req.header('origin');
    if (origin && isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    if (req.method === 'OPTIONS') {
      return isOriginAllowed(origin) ? res.sendStatus(204) : res.sendStatus(403);
    }
    next();
  });

  const rateLimits = new Map<string, { count: number; resetAt: number }>();
  app.use('/api', (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const current = rateLimits.get(key);
    const windowMs = 60_000;
    const maxRequests = 120;
    if (rateLimits.size > 10_000) {
      for (const [storedKey, value] of rateLimits) {
        if (value.resetAt <= now) rateLimits.delete(storedKey);
      }
    }
    if (!current || current.resetAt <= now) {
      rateLimits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  });

  const requireAdmin: express.RequestHandler = (req, res, next) => {
    const expected = process.env.ADMIN_API_TOKEN;
    const supplied = req.header('authorization');
    if (!expected || supplied !== `Bearer ${expected}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };

  app.use(express.json({ limit: '32kb' }));

  // Test MySQL connection & initialize schema
  checkDbConnection().then(async status => {
    console.log('MySQL Status:', status);
    if (status.connected) {
      await initDbTables();
    }
  });

  // Mutable state in server
  let serversState: RustServer[] = [...INITIAL_SERVERS];
  let playersState: PlayerProfile[] = [...INITIAL_PLAYERS];
  let killfeedState: KillEvent[] = [...INITIAL_KILLS];

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Integrations Health Status Endpoint
  app.get('/api/integrations/status', requireAdmin, async (req, res) => {
    const dbStatus = await checkDbConnection();
    const bmStatus = await fetchBattleMetricsServerInfo('SEAB3X');
    
    res.json({
      mysql: { connected: dbStatus.connected },
      steamApi: {
        configured: Boolean(process.env.STEAM_API_KEY),
        status: process.env.STEAM_API_KEY ? 'active' : 'fallback (mock/public mode)'
      },
      battleMetrics: {
        connected: bmStatus.success,
        serversFound: bmStatus.servers?.length || 0,
        error: bmStatus.success ? null : 'Unavailable'
      }
    });
  });

  // Steam API Player Lookup Endpoint
  app.get('/api/steam/player/:steamId', async (req, res) => {
    const { steamId } = req.params;
    if (!/^\d{17}$/.test(steamId)) {
      return res.status(400).json({ error: 'Invalid Steam ID' });
    }
    const summary = await fetchSteamPlayerSummary(steamId);
    res.json(summary);
  });

  // BattleMetrics Live Rust Server Search Endpoint
  app.get('/api/battlemetrics/servers', async (req, res) => {
    const query = String(req.query.q || 'SEAB3X').trim().slice(0, 64);
    const result = await fetchBattleMetricsServerInfo(query);
    res.json(result);
  });

  // Live Server & Map Details combined Endpoint (BattleMetrics + RCON + RustMaps)
  app.get('/api/servers/live-map-info', async (req, res) => {
    const serverId = serverConfig.battleMetricsId;
    const rconIp = serverConfig.ip;
    const rconPort = serverConfig.rconPort;
    const gamePort = serverConfig.gamePort;

    let bmData: any = null;
    let rconData: any = null;

    // 1. Fetch BattleMetrics Data
    try {
      bmData = await fetchBattleMetricsServerById(serverId);
    } catch (e) {}

    // 2. Fetch RCON Data if available
    try {
      if (serverConfig.rconPassword) {
        rconData = await queryRustServerRcon(rconIp, rconPort, serverConfig.rconPassword, 3000);
      }
    } catch (e) {}

    const serverInfo = bmData?.server || {};
    const seed = rconData?.seed || serverInfo.seed || serverConfig.defaultSeed;
    const worldSize = rconData?.worldSize || serverInfo.worldSize || serverConfig.defaultWorldSize;

    // 3. Fetch RustMaps info for exact seed & size
    const rustMapsData = await fetchRustMapsInfo(seed, worldSize);

    res.json({
      success: true,
      serverId,
      serverName: rconData?.hostname || serverInfo.name || 'SEAB3X',
      description: rconData?.description || serverInfo.description || 'SEAB3X Rust Server',
      ip: rconIp || serverInfo.ip || '15.235.132.88',
      port: gamePort,
      queryPort: serverConfig.queryPort,
      status: (rconData?.connected || serverInfo.status === 'online') ? 'online' : 'online',
      players: rconData?.players ?? serverInfo.players ?? 142,
      maxPlayers: rconData?.maxPlayers ?? serverInfo.maxPlayers ?? 200,
      // Never label a hardcoded fallback as live server FPS. RCON is the
      // authoritative source; BattleMetrics is used only when it supplied a
      // real (non-fallback) value.
      fps: rconData?.fps ?? (!bmData?.isFallback ? serverInfo.rustFps ?? null : null),
      fpsSource: rconData?.fps != null
        ? 'rcon'
        : (!bmData?.isFallback && serverInfo.rustFps != null ? 'battlemetrics' : null),
      pve: serverInfo.pve ?? false,
      rank: serverInfo.rank || 12,
      mapName: serverInfo.map || rconData?.level || 'Procedural Map',
      seed,
      worldSize,
      rustHeaderImage: rconData?.headerImage || serverInfo.rustHeaderImage,
      mapImageUrl: (rustMapsData.mapImageUrl && !rustMapsData.mapImageUrl.endsWith(`/map/${worldSize}_${seed}`)) 
        ? rustMapsData.mapImageUrl 
        : `https://maps.rustmaps.com/${worldSize}_${seed}_icon.png`,
      rustMapsUrl: `https://rustmaps.com/map/${worldSize}_${seed}`,
      monuments: rustMapsData.monuments || [],
      rconConnected: rconData?.connected || false
    });
  });

  // RustMaps API Configurator Endpoint
  app.get('/api/rustmaps/info', async (req, res) => {
    const seed = parseInt((req.query.seed as string) || '8491029', 10);
    const size = parseInt((req.query.size as string) || '3500', 10);
    if (!Number.isInteger(seed) || seed < 0 || seed > 2_147_483_647) {
      return res.status(400).json({ error: 'Invalid map seed' });
    }
    if (!Number.isInteger(size) || size < 1000 || size > 6000) {
      return res.status(400).json({ error: 'Invalid map size' });
    }
    const mapData = await fetchRustMapsInfo(seed, size);
    res.json(mapData);
  });

  // RustMaps OpenAPI v4 Swagger Endpoint
  app.get('/api/rustmaps/v4-swagger', async (req, res) => {
    const swaggerData = await fetchRustMapsSwaggerSpec();
    res.json(swaggerData);
  });

  app.get('/api/servers', async (req, res) => {
    const pool = getDbPool();

    // Check MySQL for saved server configuration
    if (pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM server_config WHERE id = ?', ['srv-1']);
        if (Array.isArray(rows) && rows.length > 0) {
          const cfg = rows[0];
          serversState[0] = {
            ...serversState[0],
            name: cfg.name || serversState[0].name,
            ip: cfg.ip || serversState[0].ip,
            port: cfg.port || serversState[0].port,
            multiplier: cfg.multiplier || serversState[0].multiplier,
            maxGroupSize: cfg.max_group_size || serversState[0].maxGroupSize,
            wipeSchedule: cfg.wipe_schedule || serversState[0].wipeSchedule,
            location: cfg.location || serversState[0].location,
            description: cfg.description || serversState[0].description
          };
        }
      } catch (err: any) {
        console.warn('MySQL server_config load note:', err.message);
      }
    }

    // Attempt to enrich with BattleMetrics live player count if available
    try {
      const bmQuery = serversState[0].ip && serversState[0].ip !== '192.168.1.101' 
        ? serversState[0].ip 
        : (serversState[0].name.split(' ')[0] || 'SEAB3X');

      const bmResult = await fetchBattleMetricsServerInfo(bmQuery);
      if (bmResult.success && bmResult.servers && bmResult.servers.length > 0) {
        const topBm = bmResult.servers[0];
        serversState[0] = {
          ...serversState[0],
          name: topBm.name || serversState[0].name,
          currentPlayers: topBm.players,
          maxPlayers: topBm.maxPlayers,
          queuedPlayers: topBm.queued || serversState[0].queuedPlayers,
          mapName: topBm.map || serversState[0].mapName
        };
      }
    } catch (e) {
      // Keep state fallback
    }

    res.json({ servers: serversState });
  });

  // Update Server Configuration Endpoint (Saved to MySQL & Memory)
  app.post('/api/server/config', requireAdmin, async (req, res) => {
    const { name, ip, port, battlemetricsId, multiplier, maxGroupSize, wipeSchedule, location, description } = req.body;

    if (!name || !ip) {
      return res.status(400).json({ error: 'Server name and IP address are required.' });
    }

    // Update in-memory state
    serversState[0] = {
      ...serversState[0],
      name: name || serversState[0].name,
      ip: ip || serversState[0].ip,
      port: port ? parseInt(port, 10) : serversState[0].port,
      multiplier: multiplier || serversState[0].multiplier,
      maxGroupSize: maxGroupSize ? parseInt(maxGroupSize, 10) : serversState[0].maxGroupSize,
      wipeSchedule: wipeSchedule || serversState[0].wipeSchedule,
      location: location || serversState[0].location,
      description: description || serversState[0].description
    };

    // Save into MySQL server_config table
    const pool = getDbPool();
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO server_config (id, name, ip, port, battlemetrics_id, multiplier, max_group_size, wipe_schedule, location, description)
           VALUES ('srv-1', ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             ip = VALUES(ip),
             port = VALUES(port),
             battlemetrics_id = VALUES(battlemetrics_id),
             multiplier = VALUES(multiplier),
             max_group_size = VALUES(max_group_size),
             wipe_schedule = VALUES(wipe_schedule),
             location = VALUES(location),
             description = VALUES(description)`,
          [
            serversState[0].name,
            serversState[0].ip,
            serversState[0].port,
            battlemetricsId || null,
            serversState[0].multiplier,
            serversState[0].maxGroupSize,
            serversState[0].wipeSchedule,
            serversState[0].location,
            serversState[0].description
          ]
        );
      } catch (err: any) {
        console.error('Failed to save server config to MySQL:', err.message);
      }
    }

    res.json({ success: true, server: serversState[0] });
  });

  app.get('/api/leaderboard', async (req, res) => {
    const { group, serverId, search, sortBy, sortOrder } = req.query;
    const isAsc = sortOrder === 'asc';
    const sortByStr = sortBy ? String(sortBy) : undefined;
    let filtered: PlayerProfile[] = [];
    const toNumber = (value: unknown): number => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const pool = getDbPool();
    if (pool) {
      try {
        // Query playerranksdb (standard Rust PlayerRanks plugin table in MySQL)
        const [prRows]: any = await pool.query(`
          SELECT pr.*, p.avatar_url, p.username as p_username
          FROM playerranksdb pr
          LEFT JOIN players p ON pr.UserID = p.steam_id
          ORDER BY pr.PVPKills DESC LIMIT 100
        `);

        if (Array.isArray(prRows) && prRows.length > 0) {
          filtered = prRows.map((r: any, idx: number) => {
            const kills = toNumber(r.PVPKills);
            const deaths = toNumber(r.Deaths);
            const kdr = r.KDR != null
              ? toNumber(r.KDR)
              : (deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills);

            let hours = 0;
            if (r.TimePlayed) {
              const parts = String(r.TimePlayed).split(':').map((num: string) => parseInt(num, 10) || 0);
              if (parts.length === 4) {
                hours = (parts[0] * 24) + parts[1];
              } else if (parts.length === 3) {
                hours = parts[0];
              }
            }

            return {
              id: 'pr-' + r.UserID,
              rank: idx + 1,
              name: r.Name || r.p_username || ('Player ' + String(r.UserID).slice(-4)),
              avatar: r.avatar_url || `https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80`,
              steamId: String(r.UserID),
              isSteamGroupLinked: true,
              isDiscordLinked: true,
              lastActive: r.Status === 'online' ? 'Online Now' : 'Recently Active',
              onlineServerId: 'srv-1',
              pvp: {
                kills,
                pvpDistance: toNumber(r.PVPDistance),
                headshots: toNumber(r.HeadShots),
                deaths,
                suicides: toNumber(r.Suicides),
                kdr,
                sdr: toNumber(r.SDR),
                sleeperKills: toNumber(r.SleepersKilled)
              },
              pve: {
                pveKills: toNumber(r.PVEKills),
                pveDistance: toNumber(r.PVEDistance),
                npcKills: toNumber(r.NPCKills),
                heliHits: toNumber(r.HeliHits),
                heliKills: toNumber(r.HeliKills),
                apcKills: toNumber(r.APCKills)
              },
              raiding: {
                explosivesThrown: toNumber(r.ExplosivesThrown),
                rocketsLaunched: toNumber(r.RocketsLaunched),
                mlrsFired: toNumber(r.MLRSFired),
                bulletsFired: toNumber(r.BulletsFired),
                arrowsFired: toNumber(r.ArrowsFired)
              },
              farming: {
                resourcesGathered: toNumber(r.ResourcesGathered),
                plantsGathered: toNumber(r.PlantsGathered),
                fishCaught: toNumber(r.FishCaught),
                barrelsDestroyed: toNumber(r.BarrelsDestroyed),
                dropsLooted: toNumber(r.DropsLooted)
              },
              economy: {
                economics: toNumber(r.Economics),
                serverRewards: toNumber(r.ServerRewards)
              },
              misc: {
                playtimeHours: hours,
                timesWounded: toNumber(r.TimesWounded),
                timesHealed: toNumber(r.TimesHealed),
                itemsCrafted: toNumber(r.ItemsCrafted),
                itemsDeployed: toNumber(r.ItemsDeployed)
              }
            };
          });
        } else {
          // Query player_stats table directly
          const [psRows]: any = await pool.query('SELECT * FROM player_stats ORDER BY kills DESC LIMIT 100');
          if (Array.isArray(psRows) && psRows.length > 0) {
            filtered = psRows.map((r: any, idx: number) => {
              const kills = r.kills || 0;
              const deaths = r.deaths || 0;
              const kdr = deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills;
              const wood = Number(r.wood_gathered || 0);
              const stone = Number(r.stone_gathered || 0);
              const metalOre = Number(r.metal_gathered || 0);
              const highQual = Number(r.high_qual_gathered || 0);
              const sulfurOre = Number(r.sulfur_gathered || 0);
              const totalGathered = wood + stone + metalOre + highQual + sulfurOre;

              return {
                id: 'db-' + r.steam_id,
                rank: idx + 1,
                name: r.player_name,
                avatar: r.avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
                steamId: r.steam_id,
                isSteamGroupLinked: true,
                isDiscordLinked: true,
                lastActive: 'Just now',
                onlineServerId: 'srv-1',
                pvp: {
                  kills,
                  pvpDistance: toNumber(r.pvp_distance),
                  headshots: r.headshots || 0,
                  deaths,
                  suicides: r.suicides || 0,
                  kdr,
                  sdr: r.sdr || 100,
                  sleeperKills: r.sleeper_kills || 0
                },
                pve: {
                  pveKills: r.pve_kills || 0,
                  pveDistance: toNumber(r.pve_distance),
                  npcKills: r.npc_kills || 0,
                  heliHits: r.heli_hits || 0,
                  heliKills: r.heli_kills || 0,
                  apcKills: r.apc_kills || 0
                },
                raiding: {
                  explosivesThrown: r.c4_thrown || 0,
                  rocketsLaunched: r.rockets_fired || 0,
                  mlrsFired: r.mlrs_fired || 0,
                  bulletsFired: r.bullets_fired || 0,
                  arrowsFired: r.arrows_fired || 0
                },
                farming: {
                  resourcesGathered: r.total_gathered || totalGathered,
                  plantsGathered: r.plants_gathered || 0,
                  fishCaught: r.fish_caught || 0,
                  barrelsDestroyed: r.barrels_destroyed || 0,
                  dropsLooted: r.drops_looted || 0
                },
                economy: {
                  economics: r.economics || r.scrap_balance || 0,
                  serverRewards: r.server_rewards || 0
                },
                misc: {
                  playtimeHours: toNumber(r.playtime_hours),
                  timesWounded: r.times_wounded || 0,
                  timesHealed: r.times_healed || 0,
                  itemsCrafted: r.items_crafted || 0,
                  itemsDeployed: r.items_deployed || 0
                }
              };
            });
          }
        }
      } catch (err: any) {
        console.warn('MySQL leaderboard query note:', err.message);
      }
    }

    if (filtered.length === 0) {
      filtered = [...playersState];
    }

    if (search && typeof search === 'string') {
      const query = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.steamId.includes(query));
    }

    if (serverId && typeof serverId === 'string' && serverId !== 'all') {
      filtered = filtered.filter(p => p.onlineServerId === serverId);
    }

    // Helper to get stat value dynamically for any column
    const getStatVal = (p: PlayerProfile, key?: string): number => {
      if (!key) return 0;
      if (key in p.pvp) return (p.pvp as any)[key] ?? 0;
      if (key in p.pve) return (p.pve as any)[key] ?? 0;
      if (key in p.raiding) return (p.raiding as any)[key] ?? 0;
      if (key in p.farming) return (p.farming as any)[key] ?? 0;
      if (key in p.economy) return (p.economy as any)[key] ?? 0;
      if (key in p.misc) return (p.misc as any)[key] ?? 0;
      return 0;
    };

    if (sortByStr) {
      filtered.sort((a, b) => {
        const valA = getStatVal(a, sortByStr);
        const valB = getStatVal(b, sortByStr);
        return isAsc ? valA - valB : valB - valA;
      });
    } else if (group === 'PVE') {
      filtered.sort((a, b) => isAsc ? a.pve.pveKills - b.pve.pveKills : b.pve.pveKills - a.pve.pveKills);
    } else if (group === 'RAIDING') {
      filtered.sort((a, b) => isAsc ? a.raiding.rocketsLaunched - b.raiding.rocketsLaunched : b.raiding.rocketsLaunched - a.raiding.rocketsLaunched);
    } else if (group === 'FARMING') {
      filtered.sort((a, b) => isAsc ? a.farming.resourcesGathered - b.farming.resourcesGathered : b.farming.resourcesGathered - a.farming.resourcesGathered);
    } else if (group === 'ECONOMY') {
      filtered.sort((a, b) => isAsc ? a.economy.economics - b.economy.economics : b.economy.economics - a.economy.economics);
    } else if (group === 'MISC') {
      filtered.sort((a, b) => isAsc ? a.misc.playtimeHours - b.misc.playtimeHours : b.misc.playtimeHours - a.misc.playtimeHours);
    } else {
      filtered.sort((a, b) => isAsc ? a.pvp.kills - b.pvp.kills : b.pvp.kills - a.pvp.kills);
    }

    // Fetch Steam avatars in batch using Steam Web API
    const steamIds = filtered.map(p => p.steamId).filter(id => id && id.length > 5);
    if (steamIds.length > 0) {
      try {
        const avatarMap = await fetchSteamAvatarsBatch(steamIds);
        filtered = filtered.map(p => {
          const steamData = avatarMap[p.steamId];
          if (steamData?.avatar) {
            return {
              ...p,
              avatar: steamData.avatar,
              name: (p.name.startsWith('Player ') || !p.name) && steamData.name ? steamData.name : p.name
            };
          }
          return p;
        });
      } catch (e) {
        // Silently preserve existing avatar
      }
    }

    // Re-assign ranks for filtered view
    filtered = filtered.map((p, index) => ({
      ...p,
      rank: index + 1
    }));

    res.json({
      players: filtered,
      totalPlayersTracked: filtered.length || 91681
    });
  });

  app.get('/api/killfeed', async (req, res) => {
    const pool = getDbPool();
    if (pool) {
      try {
        const [kfRows]: any = await pool.query('SELECT * FROM kill_feed ORDER BY timestamp DESC LIMIT 20');
        if (Array.isArray(kfRows) && kfRows.length > 0) {
          const kfSteamIds = Array.from(new Set(kfRows.flatMap((r: any) => [r.killer_id, r.victim_id]).filter(Boolean)));
          const kfAvatarMap = await fetchSteamAvatarsBatch(kfSteamIds);

          const kills = kfRows.map((r: any) => ({
            id: 'kf-' + r.id,
            timestamp: r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : 'Just now',
            killerName: r.killer_name || kfAvatarMap[r.killer_id]?.name || 'Unknown',
            killerAvatar: kfAvatarMap[r.killer_id]?.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
            victimName: r.victim_name || kfAvatarMap[r.victim_id]?.name || 'Unknown',
            victimAvatar: kfAvatarMap[r.victim_id]?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            weapon: r.weapon || 'AK-47 Rifle',
            distanceMeters: Math.round(r.distance || 0),
            isHeadshot: Boolean(r.headshot),
            serverId: 'srv-1',
            serverShortName: 'SEAB3X'
          }));
          return res.json({ kills });
        }

        const [klRows]: any = await pool.query('SELECT * FROM kill_logs ORDER BY created_at DESC LIMIT 20');
        if (Array.isArray(klRows) && klRows.length > 0) {
          const klSteamIds = Array.from(new Set(klRows.flatMap((r: any) => [r.killer_steam_id, r.victim_steam_id]).filter(Boolean)));
          const klAvatarMap = await fetchSteamAvatarsBatch(klSteamIds);

          const kills = klRows.map((r: any) => ({
            id: r.id,
            timestamp: 'Just now',
            killerName: r.killer_name || klAvatarMap[r.killer_steam_id]?.name || 'Unknown',
            killerAvatar: klAvatarMap[r.killer_steam_id]?.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
            victimName: r.victim_name || klAvatarMap[r.victim_steam_id]?.name || 'Unknown',
            victimAvatar: klAvatarMap[r.victim_steam_id]?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            weapon: r.weapon || 'AK-47 Rifle',
            distanceMeters: r.distance_meters || 0,
            isHeadshot: Boolean(r.is_headshot),
            serverId: r.server_id || 'srv-1',
            serverShortName: 'SEAB3X'
          }));
          return res.json({ kills });
        }
      } catch (err: any) {
        console.warn('MySQL killfeed query note:', err.message);
      }
    }

    res.json({ kills: killfeedState });
  });

  app.get('/api/players/:id', async (req, res) => {
    const targetId = req.params.id.replace(/^pr-|^db-/, '');
    const pool = getDbPool();

    if (pool) {
      try {
        const [prRows]: any = await pool.query(
          `SELECT pr.*, p.avatar_url, p.username as p_username
           FROM playerranksdb pr
           LEFT JOIN players p ON pr.UserID = p.steam_id
           WHERE pr.UserID = ? OR pr.Name = ?`,
          [targetId, targetId]
        );
        if (Array.isArray(prRows) && prRows.length > 0) {
          const r = prRows[0];
          const kills = r.PVPKills || 0;
          const deaths = r.Deaths || 0;
          const kdr = deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills;

          let hours = 0;
          if (r.TimePlayed) {
            const parts = String(r.TimePlayed).split(':').map((num: string) => parseInt(num, 10) || 0);
            if (parts.length === 4) {
              hours = (parts[0] * 24) + parts[1];
            } else if (parts.length === 3) {
              hours = parts[0];
            }
          }

          const playerProfile: PlayerProfile = {
            id: 'pr-' + r.UserID,
            rank: 1,
            name: r.Name || r.p_username || ('Player ' + String(r.UserID).slice(-4)),
            avatar: r.avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
            steamId: String(r.UserID),
            isSteamGroupLinked: true,
            isDiscordLinked: true,
            lastActive: r.Status === 'online' ? 'Online Now' : 'Recently Active',
            onlineServerId: 'srv-1',
            pvp: {
              kills,
              pvpDistance: r.PVPDistance || 0,
              headshots: r.HeadShots || 0,
              deaths,
              suicides: r.Suicides || 0,
              kdr,
              sdr: r.SDR || 0,
              sleeperKills: r.SleepersKilled || 0
            },
            pve: {
              pveKills: r.PVEKills || 0,
              pveDistance: r.PVEDistance || 0,
              npcKills: r.NPCKills || 0,
              heliHits: r.HeliHits || 0,
              heliKills: r.HeliKills || 0,
              apcKills: r.APCKills || 0
            },
            raiding: {
              explosivesThrown: r.ExplosivesThrown || 0,
              rocketsLaunched: r.RocketsLaunched || 0,
              mlrsFired: r.MLRSFired || 0,
              bulletsFired: r.BulletsFired || 0,
              arrowsFired: r.ArrowsFired || 0
            },
            farming: {
              resourcesGathered: r.ResourcesGathered || 0,
              plantsGathered: r.PlantsGathered || 0,
              fishCaught: r.FishCaught || 0,
              barrelsDestroyed: r.BarrelsDestroyed || 0,
              dropsLooted: r.DropsLooted || 0
            },
            economy: {
              economics: Number(r.Economics || 0),
              serverRewards: Number(r.ServerRewards || 0)
            },
            misc: {
              playtimeHours: hours,
              timesWounded: r.TimesWounded || 0,
              timesHealed: r.TimesHealed || 0,
              itemsCrafted: r.ItemsCrafted || 0,
              itemsDeployed: r.ItemsDeployed || 0
            }
          };

          try {
            const avatarMap = await fetchSteamAvatarsBatch([String(r.UserID)]);
            if (avatarMap[String(r.UserID)]?.avatar) {
              playerProfile.avatar = avatarMap[String(r.UserID)].avatar;
              if (avatarMap[String(r.UserID)].name && playerProfile.name.startsWith('Player ')) {
                playerProfile.name = avatarMap[String(r.UserID)].name!;
              }
            }
          } catch (e) {
            // ignore error
          }

          return res.json({ player: playerProfile });
        }

        // Try player_stats table fallback
        const [psRows]: any = await pool.query(
          'SELECT * FROM player_stats WHERE steam_id = ? OR player_name = ?',
          [targetId, targetId]
        );
        if (Array.isArray(psRows) && psRows.length > 0) {
          const r = psRows[0];
          const playerProfile: PlayerProfile = {
            id: 'db-' + r.steam_id,
            rank: 1,
            name: r.player_name,
            avatar: r.avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
            steamId: r.steam_id,
            isSteamGroupLinked: true,
            isDiscordLinked: true,
            lastActive: 'Just now',
            onlineServerId: 'srv-1',
            pvp: {
              kills: r.kills || 0,
              pvpDistance: r.pvp_distance || 0,
              headshots: r.headshots || 0,
              deaths: r.deaths || 0,
              suicides: r.suicides || 0,
              kdr: r.deaths > 0 ? parseFloat((r.kills / r.deaths).toFixed(2)) : r.kills,
              sdr: r.sdr || 0,
              sleeperKills: r.sleeper_kills || 0
            },
            pve: {
              pveKills: r.pve_kills || 0,
              pveDistance: r.pve_distance || 0,
              npcKills: r.npc_kills || 0,
              heliHits: r.heli_hits || 0,
              heliKills: r.heli_kills || 0,
              apcKills: r.apc_kills || 0
            },
            raiding: {
              explosivesThrown: r.c4_thrown || 0,
              rocketsLaunched: r.rockets_fired || 0,
              mlrsFired: r.mlrs_fired || 0,
              bulletsFired: r.bullets_fired || 0,
              arrowsFired: r.arrows_fired || 0
            },
            farming: {
              resourcesGathered: Number(r.wood_gathered || 0) + Number(r.stone_gathered || 0) + Number(r.metal_gathered || 0) + Number(r.high_qual_gathered || 0) + Number(r.sulfur_gathered || 0),
              plantsGathered: r.plants_gathered || 0,
              fishCaught: r.fish_caught || 0,
              barrelsDestroyed: r.barrels_destroyed || 0,
              dropsLooted: r.drops_looted || 0
            },
            economy: {
              economics: r.economics || 0,
              serverRewards: r.server_rewards || 0
            },
            misc: {
              playtimeHours: r.playtime_hours || 0,
              timesWounded: r.times_wounded || 0,
              timesHealed: r.times_healed || 0,
              itemsCrafted: r.items_crafted || 0,
              itemsDeployed: r.items_deployed || 0
            }
          };
          return res.json({ player: playerProfile });
        }
      } catch (err: any) {
        console.warn('MySQL player fetch error:', err.message);
      }
    }

    const player = playersState.find(p => p.id === targetId || p.steamId === targetId || p.name.toLowerCase() === targetId.toLowerCase());
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ player });
  });

  app.get('/api/store', (req, res) => {
    res.json({ packages: STORE_PACKAGES });
  });

  app.get('/api/giveaways', (req, res) => {
    res.json({ giveaways: GIVEAWAYS });
  });

  // WebSocket Server Setup attached to HTTP Server
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
    maxPayload: 1024,
    verifyClient: ({ origin }, done) => {
      done(isOriginAllowed(origin), 403, 'Forbidden');
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    const totalPlayers = serversState.reduce((acc, s) => acc + s.currentPlayers, 0);

    // Send initial payload on connect
    ws.send(JSON.stringify({
      type: 'INIT_STATS',
      servers: serversState,
      totalPlayers,
      liveKill: killfeedState[0]
    }));

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG' }));
        }
      } catch (e) {
        // ignore invalid JSON
      }
    });
  });

  // Broadcast Helper
  const broadcast = (data: object) => {
    const payload = JSON.stringify(data);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  };

  // Simulate Real-time Rust Game Activity
  const weaponsList = ['AK-47 Rifle', 'Bolt Action Rifle', 'L96 Sniper', 'MP5A4', 'Custom SMG', 'Thompson', 'Double Barrel Shotgun', 'Rocket Launcher', 'Eoka Pistol'];

  setInterval(() => {
    if (wss.clients.size === 0) return;

    // Random player count fluctuations (+/- 1 to 3)
    serversState = serversState.map(srv => {
      const delta = Math.floor(Math.random() * 5) - 2;
      const newCount = Math.max(10, Math.min(srv.maxPlayers, srv.currentPlayers + delta));
      return { ...srv, currentPlayers: newCount };
    });

    // Pick random killer & victim from players
    const killer = playersState[Math.floor(Math.random() * playersState.length)];
    let victim = playersState[Math.floor(Math.random() * playersState.length)];
    while (victim.id === killer.id) {
      victim = playersState[Math.floor(Math.random() * playersState.length)];
    }

    // Update killer stats
    killer.pvp.kills += 1;
    killer.pvp.headshots += Math.random() > 0.4 ? 1 : 0;
    victim.pvp.deaths += 1;
    killer.pvp.kdr = parseFloat((killer.pvp.kills / Math.max(1, killer.pvp.deaths)).toFixed(2));
    victim.pvp.kdr = parseFloat((victim.pvp.kills / Math.max(1, victim.pvp.deaths)).toFixed(2));

    const weapon = weaponsList[Math.floor(Math.random() * weaponsList.length)];
    const dist = Math.floor(Math.random() * 280) + 12;
    const isHeadshot = Math.random() > 0.5;
    const server = serversState[Math.floor(Math.random() * serversState.length)];

    const newKill: KillEvent = {
      id: 'k-' + Date.now(),
      timestamp: 'Just now',
      killerName: killer.name,
      killerAvatar: killer.avatar,
      victimName: victim.name,
      victimAvatar: victim.avatar,
      weapon,
      distanceMeters: dist,
      isHeadshot,
      serverId: server.id,
      serverShortName: server.name.split('|')[0].trim()
    };

    killfeedState.unshift(newKill);
    if (killfeedState.length > 20) killfeedState.pop();

    // Persist kill event into MySQL database
    logKillToDb({
      id: newKill.id,
      killerSteamId: killer.steamId,
      killerName: killer.name,
      victimSteamId: victim.steamId,
      victimName: victim.name,
      weapon: newKill.weapon,
      distanceMeters: newKill.distanceMeters,
      isHeadshot: newKill.isHeadshot,
      serverId: server.id
    });

    // Broadcast WebSocket updates
    broadcast({ type: 'KILL_EVENT', kill: newKill });
    broadcast({ 
      type: 'SERVER_UPDATE', 
      serverId: server.id, 
      currentPlayers: server.currentPlayers,
      pingMs: server.pingMs + (Math.floor(Math.random() * 5) - 2),
      totalPlayers: serversState.reduce((total, currentServer) => total + currentServer.currentPlayers, 0)
    });
  }, 4000);

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Rust Server Website running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
