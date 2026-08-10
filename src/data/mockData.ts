import { PlayerProfile, RustServer, StorePackage, Giveaway, HeatmapPoint, KillEvent } from '../types';

export const INITIAL_PLAYERS: PlayerProfile[] = [
  {
    id: 'p1',
    rank: 1,
    name: 'Bdog',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    steamId: '76561198012345678',
    discordTag: 'Bdog#0001',
    isSteamGroupLinked: true,
    isDiscordLinked: true,
    vipRank: 'ENARDO LEGEND',
    onlineServerId: 'srv-1',
    favoriteWeapon: 'AK-47',
    lastActive: 'Just now',
    pvp: { kills: 14091, pvpDistance: 482000, headshots: 12606, deaths: 3194, suicides: 16, kdr: 4.41, sdr: 199.6, sleeperKills: 84 },
    pve: { pveKills: 1840, pveDistance: 210000, npcKills: 1420, heliHits: 890, heliKills: 48, apcKills: 72 },
    raiding: { explosivesThrown: 620, rocketsLaunched: 1840, mlrsFired: 42, bulletsFired: 235738, arrowsFired: 4890 },
    farming: { resourcesGathered: 19475100, plantsGathered: 14200, fishCaught: 310, barrelsDestroyed: 12400, dropsLooted: 412 },
    economy: { economics: 892000, serverRewards: 45000 },
    misc: { playtimeHours: 3410, timesWounded: 420, timesHealed: 1280, itemsCrafted: 34100, itemsDeployed: 15400 }
  },
  {
    id: 'p2',
    rank: 2,
    name: 'porn hub abuser ena...',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    steamId: '76561198087654321',
    discordTag: 'AbuserEna#9999',
    isSteamGroupLinked: true,
    isDiscordLinked: true,
    vipRank: 'VIP+',
    onlineServerId: 'srv-2',
    favoriteWeapon: 'Bolt Action Rifle',
    lastActive: '2m ago',
    pvp: { kills: 12577, pvpDistance: 391000, headshots: 5640, deaths: 1233, suicides: 5, kdr: 10.20, sdr: 251.5, sleeperKills: 62 },
    pve: { pveKills: 1410, pveDistance: 180000, npcKills: 1100, heliHits: 1240, heliKills: 62, apcKills: 89 },
    raiding: { explosivesThrown: 810, rocketsLaunched: 2150, mlrsFired: 65, bulletsFired: 116749, arrowsFired: 2100 },
    farming: { resourcesGathered: 15621000, plantsGathered: 9800, fishCaught: 180, barrelsDestroyed: 9800, dropsLooted: 389 },
    economy: { economics: 1250000, serverRewards: 82000 },
    misc: { playtimeHours: 2890, timesWounded: 310, timesHealed: 950, itemsCrafted: 28900, itemsDeployed: 12100 }
  },
  {
    id: 'p3',
    rank: 3,
    name: 'ImGeeked',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    steamId: '76561198111222333',
    discordTag: 'Geeked#1337',
    isSteamGroupLinked: true,
    isDiscordLinked: false,
    vipRank: 'VIP',
    onlineServerId: 'srv-1',
    favoriteWeapon: 'MP5A4',
    lastActive: '5m ago',
    pvp: { kills: 11675, pvpDistance: 512000, headshots: 8253, deaths: 7309, suicides: 16, kdr: 1.60, sdr: 730.0, sleeperKills: 110 },
    pve: { pveKills: 2150, pveDistance: 290000, npcKills: 1890, heliHits: 640, heliKills: 31, apcKills: 45 },
    raiding: { explosivesThrown: 410, rocketsLaunched: 1420, mlrsFired: 18, bulletsFired: 230892, arrowsFired: 8900 },
    farming: { resourcesGathered: 22892000, plantsGathered: 18900, fishCaught: 450, barrelsDestroyed: 18900, dropsLooted: 290 },
    economy: { economics: 450000, serverRewards: 21000 },
    misc: { playtimeHours: 3120, timesWounded: 680, timesHealed: 1890, itemsCrafted: 42100, itemsDeployed: 21000 }
  },
  {
    id: 'p4',
    rank: 4,
    name: 'AUSTIC RETARD',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
    steamId: '76561198222333444',
    isSteamGroupLinked: false,
    isDiscordLinked: false,
    onlineServerId: 'srv-3',
    favoriteWeapon: 'LR-300 Assault Rifle',
    lastActive: '12m ago',
    pvp: { kills: 10128, pvpDistance: 341000, headshots: 10463, deaths: 5567, suicides: 6, kdr: 1.82, sdr: 927.8, sleeperKills: 45 },
    pve: { pveKills: 980, pveDistance: 120000, npcKills: 740, heliHits: 410, heliKills: 19, apcKills: 28 },
    raiding: { explosivesThrown: 290, rocketsLaunched: 980, mlrsFired: 12, bulletsFired: 326972, arrowsFired: 3100 },
    farming: { resourcesGathered: 12538000, plantsGathered: 7400, fishCaught: 95, barrelsDestroyed: 11200, dropsLooted: 210 },
    economy: { economics: 310000, serverRewards: 15000 },
    misc: { playtimeHours: 2100, timesWounded: 510, timesHealed: 1120, itemsCrafted: 21000, itemsDeployed: 8900 }
  },
  {
    id: 'p5',
    rank: 5,
    name: 'BreadBeater',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    steamId: '76561198333444555',
    discordTag: 'Bread#4040',
    isSteamGroupLinked: true,
    isDiscordLinked: true,
    vipRank: 'VIP',
    onlineServerId: 'srv-1',
    favoriteWeapon: 'Custom SMG',
    lastActive: '1m ago',
    pvp: { kills: 8673, pvpDistance: 410000, headshots: 8596, deaths: 1963, suicides: 1, kdr: 4.42, sdr: 1963.0, sleeperKills: 38 },
    pve: { pveKills: 1210, pveDistance: 195000, npcKills: 980, heliHits: 720, heliKills: 34, apcKills: 51 },
    raiding: { explosivesThrown: 390, rocketsLaunched: 1240, mlrsFired: 28, bulletsFired: 174942, arrowsFired: 5200 },
    farming: { resourcesGathered: 16612000, plantsGathered: 11200, fishCaught: 240, barrelsDestroyed: 14200, dropsLooted: 310 },
    economy: { economics: 680000, serverRewards: 34000 },
    misc: { playtimeHours: 2400, timesWounded: 280, timesHealed: 890, itemsCrafted: 28000, itemsDeployed: 11500 }
  },
  {
    id: 'p6',
    rank: 6,
    name: 'Wild Mike @bandit',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    steamId: '76561198444555666',
    isSteamGroupLinked: true,
    isDiscordLinked: false,
    onlineServerId: 'srv-2',
    favoriteWeapon: 'M39 Rifle',
    lastActive: '18m ago',
    pvp: { kills: 8314, pvpDistance: 298000, headshots: 8282, deaths: 4346, suicides: 7, kdr: 1.91, sdr: 620.8, sleeperKills: 29 },
    pve: { pveKills: 740, pveDistance: 98000, npcKills: 580, heliHits: 290, heliKills: 14, apcKills: 21 },
    raiding: { explosivesThrown: 210, rocketsLaunched: 810, mlrsFired: 8, bulletsFired: 158383, arrowsFired: 1800 },
    farming: { resourcesGathered: 11121000, plantsGathered: 5800, fishCaught: 60, barrelsDestroyed: 8900, dropsLooted: 180 },
    economy: { economics: 280000, serverRewards: 12000 },
    misc: { playtimeHours: 1890, timesWounded: 410, timesHealed: 780, itemsCrafted: 18900, itemsDeployed: 7400 }
  },
  {
    id: 'p7',
    rank: 7,
    name: 'Sjlds',
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
    steamId: '76561198555666777',
    isSteamGroupLinked: false,
    isDiscordLinked: true,
    onlineServerId: undefined,
    favoriteWeapon: 'AK-47',
    lastActive: '1h ago',
    pvp: { kills: 7655, pvpDistance: 320000, headshots: 6150, deaths: 4133, suicides: 4, kdr: 1.85, sdr: 1033.2, sleeperKills: 52 },
    pve: { pveKills: 920, pveDistance: 140000, npcKills: 710, heliHits: 480, heliKills: 22, apcKills: 34 },
    raiding: { explosivesThrown: 310, rocketsLaunched: 920, mlrsFired: 15, bulletsFired: 168486, arrowsFired: 2900 },
    farming: { resourcesGathered: 13652000, plantsGathered: 8900, fishCaught: 140, barrelsDestroyed: 10400, dropsLooted: 240 },
    economy: { economics: 390000, serverRewards: 19000 },
    misc: { playtimeHours: 1980, timesWounded: 390, timesHealed: 820, itemsCrafted: 22000, itemsDeployed: 9200 }
  },
  {
    id: 'p8',
    rank: 8,
    name: 'Druggie B †',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    steamId: '76561198666777888',
    isSteamGroupLinked: true,
    isDiscordLinked: true,
    vipRank: 'ENARDO LEGEND',
    onlineServerId: 'srv-1',
    favoriteWeapon: 'L96 Sniper',
    lastActive: 'Just now',
    pvp: { kills: 7596, pvpDistance: 289000, headshots: 9072, deaths: 3235, suicides: 0, kdr: 2.35, sdr: 0, sleeperKills: 41 },
    pve: { pveKills: 1100, pveDistance: 160000, npcKills: 890, heliHits: 390, heliKills: 18, apcKills: 29 },
    raiding: { explosivesThrown: 280, rocketsLaunched: 880, mlrsFired: 10, bulletsFired: 175748, arrowsFired: 3400 },
    farming: { resourcesGathered: 12399000, plantsGathered: 6900, fishCaught: 110, barrelsDestroyed: 9200, dropsLooted: 210 },
    economy: { economics: 320000, serverRewards: 16000 },
    misc: { playtimeHours: 1750, timesWounded: 320, timesHealed: 710, itemsCrafted: 19500, itemsDeployed: 8100 }
  },
  {
    id: 'p9',
    rank: 9,
    name: 'corndogdan',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    steamId: '76561198777888999',
    discordTag: 'Corndog#777',
    isSteamGroupLinked: true,
    isDiscordLinked: true,
    vipRank: 'VIP',
    onlineServerId: 'srv-2',
    favoriteWeapon: 'Thompson',
    lastActive: '3m ago',
    pvp: { kills: 6511, pvpDistance: 241000, headshots: 5438, deaths: 2895, suicides: 9, kdr: 2.25, sdr: 321.6, sleeperKills: 33 },
    pve: { pveKills: 820, pveDistance: 110000, npcKills: 640, heliHits: 280, heliKills: 12, apcKills: 18 },
    raiding: { explosivesThrown: 190, rocketsLaunched: 620, mlrsFired: 5, bulletsFired: 162394, arrowsFired: 2100 },
    farming: { resourcesGathered: 9428000, plantsGathered: 5200, fishCaught: 85, barrelsDestroyed: 7800, dropsLooted: 160 },
    economy: { economics: 240000, serverRewards: 11000 },
    misc: { playtimeHours: 1420, timesWounded: 290, timesHealed: 610, itemsCrafted: 15400, itemsDeployed: 6200 }
  },
  {
    id: 'p10',
    rank: 10,
    name: 'Basically_Mason',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    steamId: '76561198888999000',
    isSteamGroupLinked: false,
    isDiscordLinked: false,
    onlineServerId: 'srv-1',
    favoriteWeapon: 'Double Barrel Shotgun',
    lastActive: 'Just now',
    pvp: { kills: 5627, pvpDistance: 198000, headshots: 5940, deaths: 4243, suicides: 0, kdr: 1.33, sdr: 0, sleeperKills: 19 },
    pve: { pveKills: 610, pveDistance: 85000, npcKills: 490, heliHits: 190, heliKills: 8, apcKills: 12 },
    raiding: { explosivesThrown: 140, rocketsLaunched: 490, mlrsFired: 2, bulletsFired: 131555, arrowsFired: 1500 },
    farming: { resourcesGathered: 8071000, plantsGathered: 4100, fishCaught: 50, barrelsDestroyed: 6200, dropsLooted: 120 },
    economy: { economics: 180000, serverRewards: 8000 },
    misc: { playtimeHours: 1150, timesWounded: 240, timesHealed: 480, itemsCrafted: 12100, itemsDeployed: 4900 }
  }
];

export const INITIAL_SERVERS: RustServer[] = [
  {
    id: 'srv-1',
    name: '[US] ENARDO 3x SOLO/DUO/TRIO | MAIN WIPE THURSDAYS',
    ip: '192.168.1.101',
    port: 28015,
    currentPlayers: 186,
    maxPlayers: 200,
    queuedPlayers: 14,
    pingMs: 18,
    mapName: 'Procedural Map',
    mapSize: 4250,
    multiplier: '3x',
    maxGroupSize: 3,
    wipeSchedule: 'Map: Fridays 11:30 UTC · BP: First Friday 11:30 UTC',
    nextWipeTime: '2026-08-06T19:00:00Z',
    location: 'US-East (Virginia)',
    isOnline: true,
    bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    description: 'Our main official 3x modded server. Reduced grind, improved loot tables, fast smelting, active non-playing admins, and automated anti-cheat.'
  }
];

export const INITIAL_KILLS: KillEvent[] = [
  {
    id: 'k1',
    timestamp: 'Just now',
    killerName: 'Bdog',
    killerAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
    victimName: 'corndogdan',
    victimAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    weapon: 'AK-47 Rifle',
    distanceMeters: 124,
    isHeadshot: true,
    serverId: 'srv-1',
    serverShortName: 'US 3x SOLO/DUO/TRIO'
  },
  {
    id: 'k2',
    timestamp: '12s ago',
    killerName: 'Druggie B †',
    killerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    victimName: 'Basically_Mason',
    victimAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    weapon: 'L96 Sniper',
    distanceMeters: 310,
    isHeadshot: true,
    serverId: 'srv-1',
    serverShortName: 'US 3x SOLO/DUO/TRIO'
  },
  {
    id: 'k3',
    timestamp: '28s ago',
    killerName: 'porn hub abuser ena...',
    killerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    victimName: 'AUSTIC RETARD',
    victimAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop&q=80',
    weapon: 'Bolt Action Rifle',
    distanceMeters: 185,
    isHeadshot: false,
    serverId: 'srv-2',
    serverShortName: 'US 10X MAX 5'
  }
];

export const HEATMAP_POINTS: HeatmapPoint[] = [
  { id: 'hm1', gridX: 35, gridY: 42, gridCoord: 'G14', intensity: 10, killCount: 1420, locationName: 'Launch Site' },
  { id: 'hm2', gridX: 72, gridY: 28, gridCoord: 'M8', intensity: 9, killCount: 1180, locationName: 'Large Oil Rig' },
  { id: 'hm3', gridX: 20, gridY: 65, gridCoord: 'C19', intensity: 8, killCount: 940, locationName: 'Military Tunnels' },
  { id: 'hm4', gridX: 55, gridY: 78, gridCoord: 'H22', intensity: 7, killCount: 820, locationName: 'Airfield' },
  { id: 'hm5', gridX: 82, gridY: 60, gridCoord: 'P18', intensity: 8, killCount: 910, locationName: 'Cargo Ship Path' },
  { id: 'hm6', gridX: 45, gridY: 50, gridCoord: 'I15', intensity: 6, killCount: 650, locationName: 'Outpost' },
  { id: 'hm7', gridX: 28, gridY: 22, gridCoord: 'D6', intensity: 5, killCount: 480, locationName: 'Water Treatment' },
  { id: 'hm8', gridX: 68, gridY: 85, gridCoord: 'N24', intensity: 7, killCount: 790, locationName: 'Excavator HQ' }
];

export const STORE_PACKAGES: StorePackage[] = [
  {
    id: 'pkg-1',
    name: 'ENARDO LEGEND VIP',
    category: 'VIP',
    priceUsd: 25.00,
    popular: true,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    description: 'Ultimate VIP rank with maximum queue priority, custom chat tag, and exclusive kit.',
    perks: [
      'Highest Skip Queue Priority',
      'Exclusive Golden Chat Tag & Color',
      'Access to /skin and /bgrade 3',
      'Daily 2,000 Scrap Reward'
    ]
  },
  {
    id: 'pkg-2',
    name: 'VIP+ RANK',
    category: 'VIP',
    priceUsd: 15.00,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    description: 'High priority skip queue and building features.',
    perks: [
      'High Skip Queue Priority',
      'Blue Chat Tag & Color',
      'Access to /bgrade 2',
      'Daily 1,000 Scrap Reward'
    ]
  },
  {
    id: 'pkg-3',
    name: 'VIP RANK',
    category: 'VIP',
    priceUsd: 8.00,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    description: 'Standard skip queue pass for popular wipe days.',
    perks: [
      'Skip Queue Priority',
      'Green Chat Tag',
      'Daily 500 Scrap Reward'
    ]
  }
];

export const GIVEAWAYS: Giveaway[] = [
  {
    id: 'gw-1',
    title: '5,000 Coins Wipe Giveaway',
    prizeName: '5,000 Store Coins',
    prizeValueUsd: 50.00,
    prizeImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    endTime: '2026-08-10T20:00:00Z',
    totalEntries: 412,
    userEntered: true,
    sponsor: 'Enardo Rust Network'
  }
];
