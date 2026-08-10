import mysql from 'mysql2/promise';

// MySQL Connection Configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || '',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || '',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || '',
  connectTimeout: 5000
};

const isDatabaseConfigured = Boolean(
  dbConfig.host && dbConfig.user && dbConfig.password && dbConfig.database
);

let dbPool: mysql.Pool | null = null;
let mysqlConnected = false;
let lastDbError = '';

export function getDbPool(): mysql.Pool | null {
  if (!isDatabaseConfigured) return null;
  if (!dbPool) {
    try {
      dbPool = mysql.createPool({
        ...dbConfig,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });
    } catch (err: any) {
      console.error('Failed to create MySQL pool:', err.message);
      lastDbError = err.message;
    }
  }
  return dbPool;
}

export async function checkDbConnection(): Promise<{ connected: boolean; host: string; database: string; error?: string }> {
  try {
    const pool = getDbPool();
    if (!pool) {
      return { connected: false, host: dbConfig.host, database: dbConfig.database, error: lastDbError || 'Pool creation failed' };
    }
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    mysqlConnected = true;
    lastDbError = '';
    return {
      connected: true,
      host: dbConfig.host,
      database: dbConfig.database
    };
  } catch (err: any) {
    mysqlConnected = false;
    lastDbError = err.message;
    return {
      connected: false,
      host: dbConfig.host,
      database: dbConfig.database,
      error: err.message
    };
  }
}

// Auto-initialize MySQL schema if tables don't exist
export async function initDbTables() {
  try {
    const pool = getDbPool();
    if (!pool) return;

    // Create players table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_stats (
        steam_id VARCHAR(64) PRIMARY KEY,
        player_name VARCHAR(128) NOT NULL,
        avatar_url VARCHAR(512),
        kills INT DEFAULT 0,
        pve_kills INT DEFAULT 0,
        deaths INT DEFAULT 0,
        headshots INT DEFAULT 0,
        suicides INT DEFAULT 0,
        bullets_fired INT DEFAULT 0,
        wood_gathered BIGINT DEFAULT 0,
        stone_gathered BIGINT DEFAULT 0,
        metal_gathered BIGINT DEFAULT 0,
        high_qual_gathered BIGINT DEFAULT 0,
        sulfur_gathered BIGINT DEFAULT 0,
        rockets_fired INT DEFAULT 0,
        c4_thrown INT DEFAULT 0,
        plants_gathered INT DEFAULT 0,
        drops_looted INT DEFAULT 0,
        barrels_destroyed INT DEFAULT 0,
        heli_kills INT DEFAULT 0,
        apc_kills INT DEFAULT 0,
        structures_built INT DEFAULT 0,
        structures_repaired INT DEFAULT 0,
        items_crafted INT DEFAULT 0,
        scrap_balance INT DEFAULT 0,
        distance_traveled_m BIGINT DEFAULT 0,
        playtime_hours INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create server config table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS server_config (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        ip VARCHAR(128) NOT NULL,
        port INT NOT NULL,
        battlemetrics_id VARCHAR(64),
        multiplier VARCHAR(32) DEFAULT '3x',
        max_group_size INT DEFAULT 3,
        wipe_schedule VARCHAR(128) DEFAULT 'Map: Fridays 11:30 UTC · BP: First Friday 11:30 UTC',
        location VARCHAR(128) DEFAULT 'US-East',
        description TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create killfeed table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kill_logs (
        id VARCHAR(64) PRIMARY KEY,
        killer_steam_id VARCHAR(64),
        killer_name VARCHAR(128),
        victim_steam_id VARCHAR(64),
        victim_name VARCHAR(128),
        weapon VARCHAR(64),
        distance_meters INT,
        is_headshot TINYINT(1),
        server_id VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check if player_stats is empty; seed initial players if 0 rows
    const [countRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM player_stats');
    if (countRows && countRows[0] && countRows[0].cnt === 0) {
      console.log('Seeding initial Rust player stats into MySQL...');
      const seedPlayers = [
        ['76561198012345678', 'Bdog', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80', 14091, 3194, 12606, 16, 235738, 4820900, 9210000, 3410000, 84200, 1950000, 1840, 620, 3410],
        ['76561198087654321', 'porn hub abuser ena...', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 12577, 1233, 5640, 5, 116749, 3120000, 7890000, 2890000, 71000, 1650000, 2150, 810, 2890],
        ['76561198111222333', 'ImGeeked', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', 11675, 7309, 8253, 16, 230892, 5100000, 11200000, 4100000, 92000, 2400000, 1420, 410, 3120],
        ['76561198222333444', 'AUSTIC RETARD', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80', 10128, 5567, 10463, 6, 326972, 2890000, 6400000, 2100000, 48000, 1100000, 980, 290, 2100],
        ['76561198333444555', 'BreadBeater', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 9450, 4120, 7890, 8, 189000, 4100000, 8900000, 3100000, 62000, 1800000, 1120, 380, 1980],
        ['76561198444555666', 'ShadowSniper', 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80', 8920, 3410, 6420, 3, 142000, 3800000, 7200000, 2400000, 54000, 1450000, 890, 240, 1750],
        ['76561198555666777', 'RustGod_99', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 8110, 4890, 5100, 12, 198000, 6200000, 12400000, 4800000, 105000, 2800000, 1650, 510, 2450]
      ];

      for (const p of seedPlayers) {
        await pool.query(
          `INSERT INTO player_stats 
          (steam_id, player_name, avatar_url, kills, deaths, headshots, suicides, bullets_fired, wood_gathered, stone_gathered, metal_gathered, high_qual_gathered, sulfur_gathered, rockets_fired, c4_thrown, playtime_hours)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          p
        );
      }
      console.log('Seeded 7 initial players into MySQL successfully.');
    }

    console.log('MySQL schema initialized successfully on Shockbyte host.');
  } catch (err: any) {
    console.warn('MySQL schema setup note:', err.message);
  }
}

export async function logKillToDb(kill: {
  id: string;
  killerSteamId?: string;
  killerName: string;
  victimSteamId?: string;
  victimName: string;
  weapon: string;
  distanceMeters: number;
  isHeadshot: boolean;
  serverId: string;
}) {
  try {
    const pool = getDbPool();
    if (!pool) return;

    await pool.query(
      `INSERT INTO kill_logs (id, killer_steam_id, killer_name, victim_steam_id, victim_name, weapon, distance_meters, is_headshot, server_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kill.id,
        kill.killerSteamId || '76561198012345678',
        kill.killerName,
        kill.victimSteamId || '76561198087654321',
        kill.victimName,
        kill.weapon,
        kill.distanceMeters,
        kill.isHeadshot ? 1 : 0,
        kill.serverId
      ]
    );

    // Update killer stats in MySQL
    if (kill.killerSteamId) {
      await pool.query(
        `UPDATE player_stats SET kills = kills + 1, headshots = headshots + ? WHERE steam_id = ?`,
        [kill.isHeadshot ? 1 : 0, kill.killerSteamId]
      );
    }

    // Update victim stats in MySQL
    if (kill.victimSteamId) {
      await pool.query(
        `UPDATE player_stats SET deaths = deaths + 1 WHERE steam_id = ?`,
        [kill.victimSteamId]
      );
    }
  } catch (e: any) {
    // Silently continue
  }
}

// Steam Web API Integration
const steamAvatarCache: Map<string, { avatar: string; name?: string }> = new Map();

export async function fetchSteamAvatarsBatch(steamIds: string[]): Promise<Record<string, { avatar: string; name?: string }>> {
  const result: Record<string, { avatar: string; name?: string }> = {};
  if (!steamIds || steamIds.length === 0) return result;

  const uniqueIds = Array.from(new Set(steamIds.filter(id => id && id.length > 5)));
  const idsToFetch: string[] = [];

  // Check in-memory cache first
  for (const id of uniqueIds) {
    if (steamAvatarCache.has(id)) {
      result[id] = steamAvatarCache.get(id)!;
    } else {
      idsToFetch.push(id);
    }
  }

  if (idsToFetch.length === 0) return result;

  const key = process.env.STEAM_API_KEY;

  if (key) {
    try {
      // Chunk in groups of 100 for Steam API
      for (let i = 0; i < idsToFetch.length; i += 100) {
        const chunk = idsToFetch.slice(i, i + 100);
        const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${chunk.join(',')}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const players = data.response?.players || [];
          for (const p of players) {
            if (p.steamid) {
              const info = {
                avatar: p.avatarfull || p.avatarmedium || p.avatar,
                name: p.personaname
              };
              steamAvatarCache.set(p.steamid, info);
              result[p.steamid] = info;

              // Save avatar back to MySQL `players` table
              const pool = getDbPool();
              if (pool) {
                pool.query(
                  `INSERT INTO players (steam_id, username, avatar_url)
                   VALUES (?, ?, ?)
                   ON DUPLICATE KEY UPDATE avatar_url = VALUES(avatar_url), username = VALUES(username)`,
                  [p.steamid, p.personaname || 'Rust Player', info.avatar]
                ).catch(() => {});
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Steam API batch fetch note:', err.message);
    }
  }

  // For any remaining IDs without an avatar, fetch public Steam XML summary or fallback
  for (const id of idsToFetch) {
    if (!result[id]) {
      try {
        const xmlRes = await fetch(`https://steamcommunity.com/profiles/${id}?xml=1`);
        if (xmlRes.ok) {
          const xmlText = await xmlRes.text();
          const avatarMatch = xmlText.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/) || xmlText.match(/<avatarFull>(.*?)<\/avatarFull>/);
          const nameMatch = xmlText.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/) || xmlText.match(/<steamID>(.*?)<\/steamID>/);

          if (avatarMatch && avatarMatch[1]) {
            const info = {
              avatar: avatarMatch[1],
              name: nameMatch ? nameMatch[1] : undefined
            };
            steamAvatarCache.set(id, info);
            result[id] = info;
            continue;
          }
        }
      } catch (e) {
        // Fallback below
      }

      const defaultInfo = {
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80'
      };
      result[id] = defaultInfo;
    }
  }

  return result;
}

export async function fetchSteamPlayerSummary(steamId: string, apiKey?: string) {
  const key = apiKey || process.env.STEAM_API_KEY;
  if (!key) {
    return {
      steamId,
      personaName: 'Bdog',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
      profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
      locCountryCode: 'US',
      communityBanned: false,
      vacBanned: false,
      note: 'Using mock Steam profile (STEAM_API_KEY environment variable optional for live Steam API data)'
    };
  }

  try {
    const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId}`);
    if (!response.ok) throw new Error(`Steam API HTTP ${response.status}`);
    const data = await response.json();
    const player = data.response?.players?.[0];

    if (!player) throw new Error('Steam player not found');

    // Also fetch ban status
    let vacBanned = false;
    let communityBanned = false;
    try {
      const banRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${key}&steamids=${steamId}`);
      if (banRes.ok) {
        const banData = await banRes.json();
        const banInfo = banData.players?.[0];
        if (banInfo) {
          vacBanned = banInfo.VACBanned;
          communityBanned = banInfo.CommunityBanned;
        }
      }
    } catch (e) {
      // Ignore ban fetch errors
    }

    return {
      steamId: player.steamid,
      personaName: player.personaname,
      avatar: player.avatarfull || player.avatar,
      profileUrl: player.profileurl,
      locCountryCode: player.loccountrycode || 'US',
      communityBanned,
      vacBanned,
      realName: player.realname,
      timeCreated: player.timecreated
    };
  } catch (err: any) {
    console.error('Steam API fetch failed:', err.message);
    return {
      steamId,
      personaName: 'Player ' + steamId.substring(steamId.length - 4),
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
      error: err.message
    };
  }
}

// BattleMetrics Public API Integration
export async function fetchBattleMetricsServerById(serverId: string = '40299572') {
  try {
    const url = `https://api.battlemetrics.com/servers/${serverId}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const item = data.data || {};
      const attr = item.attributes || {};
      const details = attr.details || {};

      let seed = details.rust_seed || details.seed;
      let worldSize = details.rust_world_size || details.world_size || details.size;

      if (!seed && details.rust_description) {
        const matchSeed = details.rust_description.match(/seed[:\s]+(\d+)/i) || attr.name?.match(/seed[:\s]+(\d+)/i);
        if (matchSeed) seed = parseInt(matchSeed[1], 10);
      }
      if (!worldSize && details.rust_description) {
        const matchSize = details.rust_description.match(/size[:\s]+(\d+)/i) || attr.name?.match(/size[:\s]+(\d+)/i);
        if (matchSize) worldSize = parseInt(matchSize[1], 10);
      }

      return {
        success: true,
        server: {
          bmId: item.id,
          name: attr.name,
          ip: attr.ip,
          port: attr.port,
          players: attr.players,
          maxPlayers: attr.maxPlayers,
          rank: attr.rank,
          status: attr.status,
          country: attr.country,
          map: details.map || 'Procedural Map',
          seed: seed ? parseInt(seed, 10) : 8491029,
          worldSize: worldSize ? parseInt(worldSize, 10) : 3500,
          rustHeaderImage: details.rust_header_image,
          rustDescription: details.rust_description,
          rustFps: details.rust_fps,
          pve: details.rust_pve || false,
          queued: details.rust_queued || 0
        }
      };
    }
  } catch (err: any) {
    // Silently proceed to fallback
  }

  // Fallback metadata for SEAB3X when BattleMetrics is unavailable.
  return {
    success: true,
    isFallback: true,
    server: {
      bmId: serverId,
      name: 'SEAB3X',
      ip: '15.235.132.88',
      port: 25098,
      players: 142,
      maxPlayers: 200,
      rank: 12,
      status: 'online',
      country: 'US',
      map: 'Procedural Map',
      seed: 8491029,
      worldSize: 3500,
      rustFps: 120,
      pve: false,
      queued: 0
    }
  };
}

export async function fetchBattleMetricsServerInfo(searchQuery: string = 'SEAB3X') {
  try {
    const url = `https://api.battlemetrics.com/servers?filter[game]=rust&filter[search]=${encodeURIComponent(searchQuery)}&page[size]=5`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const servers = (data.data || []).map((item: any) => {
        const attr = item.attributes || {};
        const details = attr.details || {};
        return {
          bmId: item.id,
          name: attr.name,
          ip: attr.ip,
          port: attr.port,
          players: attr.players,
          maxPlayers: attr.maxPlayers,
          rank: attr.rank,
          status: attr.status,
          country: attr.country,
          map: details.map || 'Procedural Map',
          rustHeaderImage: details.rust_header_image,
          rustDescription: details.rust_description,
          rustFps: details.rust_fps,
          pve: details.rust_pve || false,
          queued: details.rust_queued || 0
        };
      });

      return {
        success: true,
        servers,
        count: servers.length
      };
    }
  } catch (err: any) {
    // Silently proceed to fallback
  }

  // Fallback mock search results when BattleMetrics blocks request with 403
  return {
    success: true,
    isFallback: true,
    servers: [
      {
        bmId: '40299572',
        name: 'SEAB3X',
        ip: '15.235.132.88',
        port: 25098,
        players: 142,
        maxPlayers: 200,
        rank: 12,
        status: 'online',
        country: 'US',
        map: 'Procedural Map',
        rustFps: 120,
        pve: false,
        queued: 0
      }
    ],
    count: 1
  };
}

// RCON WebRCON Direct Server Query Helper
import { WebSocket as WsClient } from 'ws';

export async function queryRustServerRcon(ip: string, port: number, password: string, timeoutMs: number = 4000) {
  return new Promise<{
    connected: boolean;
    seed?: number;
    worldSize?: number;
    level?: string;
    hostname?: string;
    description?: string;
    headerImage?: string;
    fps?: number;
    players?: number;
    maxPlayers?: number;
    rawResponses?: Record<string, string>;
    error?: string;
  }>((resolve) => {
    const wsUrl = `ws://${ip}:${port}/${password}`;
    let socket: WsClient | null = null;
    const responses: Record<string, string> = {};
    let isResolved = false;

    const finish = () => {
      if (isResolved) return;
      isResolved = true;
      if (socket) {
        try { socket.close(); } catch (e) {}
      }

      // Parse seed & worldsize
      const seedMatch = responses['seed']?.match(/\d+/);
      const sizeMatch = responses['worldsize']?.match(/\d+/);

      // Clean hostname, description & headerImage
      let hostnameClean = responses['hostname']?.replace(/^(server\.)?hostname:\s*["']?|["']?\s*$/gi, '')?.trim();
      let descriptionClean = responses['description']?.replace(/^(server\.)?description:\s*["']?|["']?\s*$/gi, '')?.replace(/\\n/g, '\n')?.trim();
      let headerImageClean = responses['headerimage']?.replace(/^(server\.)?headerimage:\s*["']?|["']?\s*$/gi, '')?.trim();

      // Parse maxplayers
      let maxPlayersVal: number | undefined;
      const maxPlayersMatch = responses['maxplayers']?.match(/\d+/);
      if (maxPlayersMatch) {
        maxPlayersVal = parseInt(maxPlayersMatch[0], 10);
      }

      // Parse status for players, maxPlayers, fps, hostname if present
      let playersParsed: number | undefined;
      let fpsParsed: number | undefined;

      // Rust exposes the current server frame rate through the `fps` console
      // command. Prefer it over `status`, whose format varies between versions.
      const fpsResponse = responses['fps'];
      if (fpsResponse) {
        const fpsMatch = fpsResponse.match(/(?:fps\s*[:=]?\s*)?(\d+(?:\.\d+)?)/i);
        if (fpsMatch) {
          const value = Number.parseFloat(fpsMatch[1]);
          if (Number.isFinite(value)) fpsParsed = value;
        }
      }

      if (responses['status']) {
        const playersMatch = responses['status'].match(/players\s*:\s*(\d+)\s*\(\s*(\d+)\s*max\)/i);
        if (playersMatch) {
          playersParsed = parseInt(playersMatch[1], 10);
          if (!maxPlayersVal) {
            maxPlayersVal = parseInt(playersMatch[2], 10);
          }
        } else {
          const singlePlayerMatch = responses['status'].match(/players\s*:\s*(\d+)/i);
          if (singlePlayerMatch) {
            playersParsed = parseInt(singlePlayerMatch[1], 10);
          }
        }

        const fpsMatch = responses['status'].match(/fps\s*:\s*(\d+(?:\.\d+)?)/i);
        if (fpsParsed === undefined && fpsMatch) {
          fpsParsed = Number.parseFloat(fpsMatch[1]);
        }

        if (!hostnameClean) {
          const statusHostMatch = responses['status'].match(/hostname\s*:\s*([^\n\r]+)/i);
          if (statusHostMatch) {
            hostnameClean = statusHostMatch[1].trim();
          }
        }
      }

      resolve({
        connected: true,
        seed: seedMatch ? parseInt(seedMatch[0], 10) : undefined,
        worldSize: sizeMatch ? parseInt(sizeMatch[0], 10) : undefined,
        level: responses['level']?.replace(/^(server\.)?level:\s*["']?|["']?\s*$/gi, '')?.trim() || 'Procedural Map',
        hostname: hostnameClean || undefined,
        description: descriptionClean || undefined,
        headerImage: headerImageClean || undefined,
        players: playersParsed,
        maxPlayers: maxPlayersVal,
        fps: fpsParsed,
        rawResponses: responses
      });
    };

    const timer = setTimeout(() => {
      if (!isResolved) {
        if (Object.keys(responses).length > 0) {
          finish();
        } else {
          isResolved = true;
          if (socket) {
            try { socket.close(); } catch (e) {}
          }
          resolve({
            connected: false,
            error: `RCON connection timed out after ${timeoutMs}ms to ${ip}:${port}`,
            rawResponses: responses
          });
        }
      }
    }, timeoutMs);

    try {
      socket = new WsClient(wsUrl);

      socket.on('open', () => {
        // Send RCON queries for Name, Description, Players, MaxPlayers, Seed, Size, Map
        const commands = [
          { id: 101, cmd: 'server.seed' },
          { id: 102, cmd: 'server.worldsize' },
          { id: 103, cmd: 'server.level' },
          { id: 104, cmd: 'server.hostname' },
          { id: 105, cmd: 'server.description' },
          { id: 106, cmd: 'server.maxplayers' },
          { id: 107, cmd: 'server.headerimage' },
          { id: 108, cmd: 'status' },
          { id: 109, cmd: 'fps' }
        ];

        commands.forEach(c => {
          socket?.send(JSON.stringify({
            Identifier: c.id,
            Message: c.cmd,
            Name: 'WebRCON'
          }));
        });
      });

      socket.on('message', (data: any) => {
        try {
          const parsed = JSON.parse(data.toString());
          const msg = parsed.Message || '';
          const id = parsed.Identifier;

          if (id === 101) responses['seed'] = msg;
          if (id === 102) responses['worldsize'] = msg;
          if (id === 103) responses['level'] = msg;
          if (id === 104) responses['hostname'] = msg;
          if (id === 105) responses['description'] = msg;
          if (id === 106) responses['maxplayers'] = msg;
          if (id === 107) responses['headerimage'] = msg;
          if (id === 108) responses['status'] = msg;
          if (id === 109) responses['fps'] = msg;

          // If we received status or all major variables, schedule finish
          if (responses['status'] && responses['seed'] && responses['hostname']) {
            clearTimeout(timer);
            setTimeout(finish, 150);
          }
        } catch (e) {
          // Ignore non-JSON or MOTD messages
        }
      });

      socket.on('error', (err: any) => {
        if (!isResolved) {
          if (Object.keys(responses).length > 0) {
            finish();
          } else {
            isResolved = true;
            clearTimeout(timer);
            resolve({
              connected: false,
              error: err.message || 'WebRCON WebSocket connection error',
              rawResponses: responses
            });
          }
        }
      });
    } catch (err: any) {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timer);
        resolve({
          connected: false,
          error: err.message || 'Failed to initialize RCON socket',
          rawResponses: responses
        });
      }
    }
  });
}

// RustMaps API v4 & Configurator Integration Helper
export async function fetchRustMapsInfo(seed: number, size: number) {
  try {
    const activeApiKey = process.env.RUSTMAPS_API_KEY;
    const apiUrl = `https://api.rustmaps.com/v4/maps/${size}/${seed}`;

    let rustMapsData: any = null;
    let apiVersion = 'v4';

    try {
      if (!activeApiKey) throw new Error('RustMaps API is not configured');
      const res = await fetch(apiUrl, {
        headers: {
          'X-API-Key': activeApiKey,
          'Accept': 'application/json',
          'User-Agent': 'SEAB3XRustApp/1.0'
        }
      });

      if (res.ok) {
        rustMapsData = await res.json();
      } else {
        // Fallback check
        const v2Res = await fetch(`https://api.rustmaps.com/v2/maps/${seed}/${size}`, {
          headers: { 'X-API-Key': activeApiKey, 'User-Agent': 'SEAB3XRustApp/1.0' }
        });
        if (v2Res.ok) {
          rustMapsData = await v2Res.json();
          apiVersion = 'v2';
        }
      }
    } catch (e) {
      // Fallback to computed RustMaps links and metadata
    }

    const raw = rustMapsData?.data || rustMapsData;
    const extractedUrl = 
      raw?.image?.iconUrl ||
      raw?.iconUrl ||
      raw?.imageIconUrl ||
      raw?.image?.url ||
      raw?.imageUrl ||
      (typeof raw?.image === 'string' ? raw?.image : null) ||
      raw?.imageFullUrl ||
      raw?.mapImage ||
      raw?.images?.icon ||
      raw?.images?.full ||
      raw?.images?.map;

    // Ensure we return an actual image file URL with icons, not an HTML page URL
    let mapImageUrl = extractedUrl;
    if (!mapImageUrl || mapImageUrl.endsWith(`/map/${size}_${seed}`)) {
      mapImageUrl = `https://maps.rustmaps.com/${size}_${seed}_icon.png`;
    }

    const downloadUrl = raw?.downloadUrl || `https://rustmaps.com/map/${size}_${seed}/image`;
    const monumentsList = raw?.monuments || [
      { name: 'Launch Site', type: 'Tier 3', icon: '🚀', grid: 'D14' },
      { name: 'Oil Rig (Large)', type: 'Tier 3', icon: '🛢️', grid: 'K22' },
      { name: 'Oil Rig (Small)', type: 'Tier 3', icon: '🛢️', grid: 'A8' },
      { name: 'Military Tunnel', type: 'Tier 3', icon: '🪖', grid: 'G5' },
      { name: 'Airfield', type: 'Tier 2', icon: '✈️', grid: 'F12' },
      { name: 'Dome', type: 'Tier 2', icon: '🔴', grid: 'H18' },
      { name: 'Outpost', type: 'Safezone', icon: '🏪', grid: 'E10' },
      { name: 'Bandit Camp', type: 'Safezone', icon: '🎰', grid: 'C15' },
      { name: 'Sewer Branch', type: 'Tier 1', icon: '🕳️', grid: 'B11' },
      { name: 'Harbor', type: 'Tier 1', icon: '⚓', grid: 'J3' }
    ];

    return {
      success: true,
      apiVersion,
      seed,
      size,
      mapImageUrl,
      rustMapsUrl: `https://rustmaps.com/map/${size}_${seed}`,
      downloadUrl,
      monuments: monumentsList,
      biomes: rustMapsData?.biomes || { snow: '18%', desert: '28%', forest: '54%' },
      raw: rustMapsData
    };
  } catch (err: any) {
    return {
      success: false,
      seed,
      size,
      error: err.message,
      mapImageUrl: `https://rustmaps.com/map/${size}_${seed}`,
      rustMapsUrl: `https://rustmaps.com/map/${size}_${seed}`
    };
  }
}

// Fetch RustMaps v4 Swagger Spec directly
export async function fetchRustMapsSwaggerSpec() {
  try {
    const res = await fetch('https://api.rustmaps.com/swagger/v4-public/swagger.json', {
      headers: { 'User-Agent': 'SEAB3XRustApp/1.0' }
    });
    if (res.ok) {
      const spec = await res.json();
      return { success: true, spec };
    }
    return { success: false, error: `HTTP ${res.status} when fetching swagger.json` };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to fetch swagger spec' };
  }
}
