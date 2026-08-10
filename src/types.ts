export type NavTab = 'home' | 'servers' | 'leaderboard' | 'rules' | 'faq' | 'report' | 'store' | 'link';

export type StatGroup = 'PVP' | 'PVE' | 'RAIDING' | 'FARMING' | 'ECONOMY' | 'MISC';

export interface PlayerPvpStats {
  kills: number;
  pvpDistance: number;
  headshots: number;
  deaths: number;
  suicides: number;
  kdr: number;
  sdr: number;
  sleeperKills: number;
}

export interface PlayerPveStats {
  pveKills: number;
  pveDistance: number;
  npcKills: number;
  heliHits: number;
  heliKills: number;
  apcKills: number;
}

export interface PlayerRaidingStats {
  explosivesThrown: number;
  rocketsLaunched: number;
  mlrsFired: number;
  bulletsFired: number;
  arrowsFired: number;
}

export interface PlayerFarmingStats {
  resourcesGathered: number;
  plantsGathered: number;
  fishCaught: number;
  barrelsDestroyed: number;
  dropsLooted: number;
}

export interface PlayerEconomyStats {
  economics: number;
  serverRewards: number;
}

export interface PlayerMiscStats {
  playtimeHours: number;
  timesWounded: number;
  timesHealed: number;
  itemsCrafted: number;
  itemsDeployed: number;
}

export interface PlayerProfile {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  steamId: string;
  discordTag?: string;
  isSteamGroupLinked: boolean;
  isDiscordLinked: boolean;
  vipRank?: 'None' | 'VIP' | 'VIP+' | 'SEAB3X LEGEND' | 'ENARDO LEGEND';
  onlineServerId?: string;
  pvp: PlayerPvpStats;
  pve: PlayerPveStats;
  raiding: PlayerRaidingStats;
  farming: PlayerFarmingStats;
  economy: PlayerEconomyStats;
  misc: PlayerMiscStats;
  favoriteWeapon?: string;
  lastActive: string;
}

export interface RustServer {
  id: string;
  name: string;
  ip: string;
  port: number;
  currentPlayers: number;
  maxPlayers: number;
  queuedPlayers: number;
  pingMs: number;
  mapName: string;
  mapSize: number;
  multiplier: string; // e.g. "3x", "10x", "3x"
  maxGroupSize: number; // e.g. 1, 2, 3, 5, 0 (unlimited)
  wipeSchedule: string; // e.g. "Every Friday at 11:30 UTC"
  nextWipeTime: string; // ISO date string
  location: string; // e.g. "US-East", "EU-Central"
  isOnline: boolean;
  bannerImage: string;
  description: string;
}

export interface KillEvent {
  id: string;
  timestamp: string;
  killerName: string;
  killerAvatar: string;
  victimName: string;
  victimAvatar: string;
  weapon: string;
  distanceMeters: number;
  isHeadshot: boolean;
  serverId: string;
  serverShortName: string;
}

export interface HeatmapPoint {
  id: string;
  gridX: number; // 0 to 100 percentage
  gridY: number; // 0 to 100 percentage
  gridCoord: string; // e.g. "G14", "D7"
  intensity: number; // 1 to 10
  killCount: number;
  locationName: string; // e.g. "Launch Site", "Airfield", "Oil Rig", "Sewer Branch"
}

export interface StorePackage {
  id: string;
  name: string;
  category: 'VIP' | 'Kits' | 'Queue Bypass' | 'Skins' | 'Coins';
  priceUsd: number;
  perks: string[];
  popular?: boolean;
  image: string;
  description: string;
}

export interface Giveaway {
  id: string;
  title: string;
  prizeName: string;
  prizeValueUsd: number;
  prizeImage: string;
  endTime: string;
  totalEntries: number;
  userEntered: boolean;
  sponsor: string;
}

export interface UserAccount {
  steamId?: string;
  username?: string;
  avatar?: string;
  isLoggedIn: boolean;
  isSteamGroupLinked: boolean;
  isDiscordLinked: boolean;
  discordTag?: string;
  balanceCoins: number;
}

export type WsMessage = 
  | { type: 'INIT_STATS'; servers: RustServer[]; totalPlayers: number; liveKill: KillEvent }
  | { type: 'SERVER_UPDATE'; serverId: string; currentPlayers: number; pingMs: number; totalPlayers: number }
  | { type: 'KILL_EVENT'; kill: KillEvent }
  | { type: 'LEADERBOARD_UPDATE'; playerId: string; kills: number; headshots: number };
