import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowUpDown, ArrowUp, ArrowDown, X,
  Crown, Trophy, Medal, Swords, Pickaxe, Bomb, Sprout,
  Package, ShieldAlert, Sparkles, UserCheck, Hammer, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, RustServer, StatGroup } from '../types';
import { apiUrl } from '../config/runtime';

interface LeaderboardViewProps {
  servers: RustServer[];
  onSelectPlayer: (player: PlayerProfile) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ servers, onSelectPlayer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<StatGroup>('PVP');
  const [sortBy, setSortBy] = useState<string>('kills');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 15;

  const formatDistance = (distanceMeters: number) => {
    const meters = Number.isFinite(distanceMeters) ? distanceMeters : 0;
    if (Math.abs(meters) >= 1000) {
      return `${(meters / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} km`;
    }
    return `${meters.toLocaleString(undefined, { maximumFractionDigits: 2 })} m`;
  };

  const statGroupsConfig: { group: StatGroup; label: string; icon: React.FC<{ className?: string }>; color: string; activeBg: string }[] = [
    { group: 'PVP', label: 'PVP Combat', icon: Swords, color: 'text-[#B28A46]', activeBg: 'bg-[#1A1A17] border-[#B28A46] text-[#F2EEE8]' },
    { group: 'PVE', label: 'PVE Combat', icon: ShieldAlert, color: 'text-[#B28A46]', activeBg: 'bg-[#1A1A17] border-[#B28A46] text-[#F2EEE8]' },
    { group: 'RAIDING', label: 'Raiding & Explosives', icon: Bomb, color: 'text-[#C96B3D]', activeBg: 'bg-[#1A1A17] border-[#B28A46] text-[#F2EEE8]' },
    { group: 'FARMING', label: 'Farming & Loot', icon: Pickaxe, color: 'text-[#B28A46]', activeBg: 'bg-[#1A1A17] border-[#B28A46] text-[#F2EEE8]' },
    { group: 'ECONOMY', label: 'Economy & Rewards', icon: Coins, color: 'text-[#4B7050]', activeBg: 'bg-[#1A1A17] border-[#B28A46] text-[#F2EEE8]' },
    { group: 'MISC', label: 'Misc & Activity', icon: Sparkles, color: 'text-[#B28A46]', activeBg: 'bg-[#1A1A17] border-[#B28A46] text-[#F2EEE8]' },
  ];

  const groupSubStats: Record<StatGroup, { key: string; label: string }[]> = {
    PVP: [
      { key: 'kills', label: 'PvP Kills' },
      { key: 'pvpDistance', label: 'PvP Distance' },
      { key: 'headshots', label: 'Headshots' },
      { key: 'deaths', label: 'Deaths' },
      { key: 'suicides', label: 'Suicides' },
      { key: 'kdr', label: 'KDR' },
      { key: 'sdr', label: 'SDR' },
      { key: 'sleeperKills', label: 'Sleeper Kills' },
    ],
    PVE: [
      { key: 'pveKills', label: 'PvE Kills' },
      { key: 'pveDistance', label: 'PvE Distance' },
      { key: 'npcKills', label: 'NPC Kills' },
      { key: 'heliHits', label: 'Heli Hits' },
      { key: 'heliKills', label: 'Heli Kills' },
      { key: 'apcKills', label: 'APC Kills' },
    ],
    RAIDING: [
      { key: 'explosivesThrown', label: 'Explosives Thrown' },
      { key: 'rocketsLaunched', label: 'Rockets Launched' },
      { key: 'mlrsFired', label: 'MLRS Fired' },
      { key: 'bulletsFired', label: 'Bullets Fired' },
      { key: 'arrowsFired', label: 'Arrows Fired' },
    ],
    FARMING: [
      { key: 'resourcesGathered', label: 'Resources Gathered' },
      { key: 'plantsGathered', label: 'Plants Gathered' },
      { key: 'fishCaught', label: 'Fish Caught' },
      { key: 'barrelsDestroyed', label: 'Barrels Destroyed' },
      { key: 'dropsLooted', label: 'Drops Looted' },
    ],
    ECONOMY: [
      { key: 'economics', label: 'Economics' },
      { key: 'serverRewards', label: 'Server Rewards' },
    ],
    MISC: [
      { key: 'playtimeHours', label: 'Time Played' },
      { key: 'timesWounded', label: 'Times Wounded' },
      { key: 'timesHealed', label: 'Times Healed' },
      { key: 'itemsCrafted', label: 'Items Crafted' },
      { key: 'itemsDeployed', label: 'Items Deployed' },
    ],
  };

  // Helper to change stat group and reset sort column to default
  const handleGroupChange = (group: StatGroup) => {
    setSelectedGroup(group);
    const firstSubKey = groupSubStats[group][0].key;
    setSortBy(firstSubKey);
    setSortOrder('desc');
  };

  // Click handler for column headers to toggle sort or change sort field
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  // Fetch leaderboard data from server API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          group: selectedGroup,
          search: searchQuery,
          sortBy: sortBy,
          sortOrder: sortOrder
        });
        const res = await fetch(apiUrl(`/api/leaderboard?${queryParams.toString()}`));
        if (res.ok) {
          const data = await res.json();
          setPlayers(data.players || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    setCurrentPage(1);
  }, [selectedGroup, searchQuery, sortBy, sortOrder]);

  const totalPlayers = players.length;
  const totalPages = Math.max(1, Math.ceil(totalPlayers / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPlayers = players.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const startIdx = totalPlayers === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(safePage * PAGE_SIZE, totalPlayers);

  // Top 3 Podium Players
  const top1 = players[0];
  const top2 = players[1];
  const top3 = players[2];

  // Get primary stat string for podium display
  const getPodiumPrimaryStat = (player: PlayerProfile) => {
    if (!player) return '';
    if (selectedGroup === 'PVP') {
      if (sortBy === 'pvpDistance') return `${formatDistance(player.pvp.pvpDistance)} Distance`;
      if (sortBy === 'headshots') return `${player.pvp.headshots.toLocaleString()} Headshots`;
      if (sortBy === 'deaths') return `${player.pvp.deaths.toLocaleString()} Deaths`;
      if (sortBy === 'suicides') return `${player.pvp.suicides.toLocaleString()} Suicides`;
      if (sortBy === 'kdr') return `${player.pvp.kdr.toFixed(2)} KDR`;
      if (sortBy === 'sdr') return `${player.pvp.sdr} SDR`;
      if (sortBy === 'sleeperKills') return `${player.pvp.sleeperKills.toLocaleString()} Sleepers`;
      return `${player.pvp.kills.toLocaleString()} Kills`;
    }
    if (selectedGroup === 'PVE') {
      if (sortBy === 'pveDistance') return `${formatDistance(player.pve.pveDistance)} Distance`;
      if (sortBy === 'npcKills') return `${player.pve.npcKills.toLocaleString()} NPC Kills`;
      if (sortBy === 'heliHits') return `${player.pve.heliHits.toLocaleString()} Heli Hits`;
      if (sortBy === 'heliKills') return `${player.pve.heliKills.toLocaleString()} Heli Kills`;
      if (sortBy === 'apcKills') return `${player.pve.apcKills.toLocaleString()} APC Kills`;
      return `${player.pve.pveKills.toLocaleString()} PvE Kills`;
    }
    if (selectedGroup === 'RAIDING') {
      if (sortBy === 'explosivesThrown') return `${player.raiding.explosivesThrown.toLocaleString()} Explosives`;
      if (sortBy === 'mlrsFired') return `${player.raiding.mlrsFired.toLocaleString()} MLRS`;
      if (sortBy === 'bulletsFired') return `${player.raiding.bulletsFired.toLocaleString()} Bullets`;
      if (sortBy === 'arrowsFired') return `${player.raiding.arrowsFired.toLocaleString()} Arrows`;
      return `${player.raiding.rocketsLaunched.toLocaleString()} Rockets`;
    }
    if (selectedGroup === 'FARMING') {
      if (sortBy === 'plantsGathered') return `${player.farming.plantsGathered.toLocaleString()} Plants`;
      if (sortBy === 'fishCaught') return `${player.farming.fishCaught.toLocaleString()} Fish`;
      if (sortBy === 'barrelsDestroyed') return `${player.farming.barrelsDestroyed.toLocaleString()} Barrels`;
      if (sortBy === 'dropsLooted') return `${player.farming.dropsLooted.toLocaleString()} Drops`;
      return `${player.farming.resourcesGathered.toLocaleString()} Gathered`;
    }
    if (selectedGroup === 'ECONOMY') {
      if (sortBy === 'serverRewards') return `${player.economy.serverRewards.toLocaleString()} RP`;
      return `$${player.economy.economics.toLocaleString()} Eco`;
    }
    if (selectedGroup === 'MISC') {
      if (sortBy === 'timesWounded') return `${player.misc.timesWounded.toLocaleString()} Wounded`;
      if (sortBy === 'timesHealed') return `${player.misc.timesHealed.toLocaleString()} Healed`;
      if (sortBy === 'itemsCrafted') return `${player.misc.itemsCrafted.toLocaleString()} Crafted`;
      if (sortBy === 'itemsDeployed') return `${player.misc.itemsDeployed.toLocaleString()} Deployed`;
      return `${player.misc.playtimeHours}h Played`;
    }
    return '';
  };

  // Render clickable table header
  const renderTh = (label: string, key: string, align: 'left' | 'right' = 'right') => {
    const isSorted = sortBy === key;
    return (
      <th
        key={key}
        onClick={() => handleSort(key)}
        className={`py-3.5 px-4 ${align === 'left' ? 'text-left' : 'text-right'} cursor-pointer hover:text-[#F2EEE8] transition-all select-none ${
          isSorted ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#8A837A] font-bold hover:bg-[#20201D]'
        }`}
      >
        <span className={`inline-flex items-center space-x-1.5 ${align === 'left' ? 'justify-start' : 'justify-end'}`}>
          <span>{label}</span>
          {isSorted ? (
            sortOrder === 'desc' ? (
              <ArrowDown className="w-3.5 h-3.5 text-[#B28A46] inline stroke-[3]" />
            ) : (
              <ArrowUp className="w-3.5 h-3.5 text-[#4B7050] inline stroke-[3]" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-[#8A837A] opacity-40 group-hover:opacity-100 inline" />
          )}
        </span>
      </th>
    );
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 select-none">
      
      {/* Top Banner Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11110F] border border-[#2E2D2A] p-6 rounded-[20px] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#B28A46]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-1">
            <span className="px-2.5 py-1 bg-[#B28A46]/20 text-[#B28A46] border border-[#B28A46]/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B28A46] animate-ping" />
              Live Server Leaderboard
            </span>
            <span className="text-xs text-[#8A837A] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4B7050]" />
              {totalPlayers.toLocaleString()} Tracked Survivors
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F2EEE8] tracking-tight flex items-center gap-3">
            <span>Rust Server Rankings</span>
          </h1>
          <p className="text-xs text-[#BEB4A8] mt-1 max-w-xl">
            Real-time combat statistics, farming milestones, explosive raids, and monument events across current wipe cycles.
          </p>
        </div>

        {/* Global Quick Search */}
        <div className="relative z-10 w-full md:w-80">
          <label className="text-[10px] font-bold uppercase text-[#8A837A] mb-1.5 block tracking-wider">
            QUICK PLAYER SEARCH
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A837A] absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search survivor or Steam ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#11110F] border border-[#2E2D2A] text-xs text-[#F2EEE8] placeholder-[#8A837A] pl-10 pr-9 py-2.5 rounded-[12px] focus:outline-none focus:border-[#B28A46] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8A837A] hover:text-[#F2EEE8] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Podium Showcase Card Grid for Top 3 */}
      {top1 && !searchQuery && currentPage === 1 && (
        <div className="mb-8">
          <div className="text-[11px] font-black uppercase text-[#8A837A] tracking-wider mb-3 flex items-center space-x-2">
            <Crown className="w-4 h-4 text-[#B28A46]" />
            <span>Top Survivors ({selectedGroup})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* #2 Silver Podium */}
            {top2 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                onClick={() => onSelectPlayer(top2)}
                className="order-2 md:order-1 bg-[#1A1A17] border border-[#2E2D2A] hover:border-[#B28A46] rounded-[16px] p-4 flex items-center space-x-4 card-shadow-md hover:shadow-[0_0_35px_rgba(178,138,70,0.15)] transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-[#2E2D2A] text-[#BEB4A8] px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-[#BEB4A8]" />
                  #2 Silver
                </div>
                <div className="relative">
                  <img
                    src={top2.avatar}
                    alt={top2.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#48453F] group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#BEB4A8] text-[#111111] font-black text-[10px] flex items-center justify-center border border-[#111111] shadow-md">
                    2
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#F2EEE8] truncate group-hover:text-[#B28A46] transition-colors">
                    {top2.name}
                  </h3>
                  <p className="text-[11px] text-[#8A837A] truncate font-mono">
                    {top2.steamId}
                  </p>
                  <div className="mt-1 inline-block px-2 py-0.5 rounded-md bg-[#2E2D2A] text-[#F2EEE8] text-[11px] font-extrabold border border-[#48453F]">
                    {getPodiumPrimaryStat(top2)}
                  </div>
                </div>
              </motion.div>
            ) : <div className="order-2 md:order-1" />}

            {/* #1 Gold Champion Podium */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 }}
              onClick={() => onSelectPlayer(top1)}
              className="order-1 md:order-2 bg-[#1A1A17] border-2 border-[#B28A46] rounded-[16px] p-5 flex items-center space-x-4 shadow-[0_0_35px_rgba(178,138,70,0.25)] hover:border-[#C69A4D] transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#B28A46]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 bg-[#B28A46] text-[#111111] px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Crown className="w-3.5 h-3.5 fill-[#111111]" />
                #1 Champion
              </div>
              <div className="relative">
                <img
                  src={top1.avatar}
                  alt={top1.name}
                  className="relative w-16 h-16 rounded-xl object-cover border-2 border-[#B28A46] group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#B28A46] text-[#111111] font-black text-xs flex items-center justify-center border border-[#111111] shadow-lg">
                  1
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-[#F2EEE8] truncate group-hover:text-[#B28A46] transition-colors">
                  {top1.name}
                </h3>
                <p className="text-xs text-[#8A837A] truncate font-mono">
                  {top1.steamId}
                </p>
                <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded-lg bg-[#B28A46]/20 text-[#B28A46] text-xs font-black border border-[#B28A46]/40 shadow-inner">
                  {getPodiumPrimaryStat(top1)}
                </div>
              </div>
            </motion.div>

            {/* #3 Bronze Podium */}
            {top3 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                onClick={() => onSelectPlayer(top3)}
                className="order-3 bg-[#1A1A17] border border-[#2E2D2A] hover:border-[#B28A46] rounded-[16px] p-4 flex items-center space-x-4 card-shadow-md hover:shadow-[0_0_35px_rgba(178,138,70,0.15)] transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-[#2E2D2A] text-[#BEB4A8] px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Medal className="w-3 h-3 text-[#B28A46]" />
                  #3 Bronze
                </div>
                <div className="relative">
                  <img
                    src={top3.avatar}
                    alt={top3.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#48453F] group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#C96B3D] text-[#111111] font-black text-[10px] flex items-center justify-center border border-[#111111] shadow-md">
                    3
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#F2EEE8] truncate group-hover:text-[#B28A46] transition-colors">
                    {top3.name}
                  </h3>
                  <p className="text-[11px] text-[#8A837A] truncate font-mono">
                    {top3.steamId}
                  </p>
                  <div className="mt-1 inline-block px-2 py-0.5 rounded-md bg-[#2E2D2A] text-[#BEB4A8] text-[11px] font-extrabold border border-[#48453F]">
                    {getPodiumPrimaryStat(top3)}
                  </div>
                </div>
              </motion.div>
            ) : <div className="order-3" />}

          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* Left Sidebar Filters */}
        <aside className="w-full lg:w-64 bg-[#1A1A17] border border-[#2E2D2A] rounded-[16px] p-4 card-shadow-md flex-shrink-0">
          
          {/* STAT GROUP Sidebar Navigation */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#8A837A] mb-2 block tracking-wider">
              STAT CATEGORY
            </label>
            <div className="space-y-1.5">
              {statGroupsConfig.map(({ group, label, icon: Icon, activeBg }) => {
                const isActive = selectedGroup === group;
                return (
                  <button
                    key={group}
                    onClick={() => handleGroupChange(group)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2.5 text-xs font-bold rounded-[12px] transition-all text-left cursor-pointer relative overflow-hidden ${
                      isActive
                        ? `${activeBg} border border-[#B28A46] shadow-md`
                        : 'text-[#BEB4A8] hover:text-[#F2EEE8] hover:bg-[#20201D] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#B28A46]' : 'text-[#8A837A]'}`} />
                    <span className="flex-1">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Content Table */}
        <div className="flex-1 w-full min-w-0">
          
          <div className="bg-[#1A1A17] border border-[#2E2D2A] rounded-[16px] overflow-hidden card-shadow-md">
            
            {/* Category Header Bar */}
            <div className="px-5 py-4 bg-[#11110F] border-b border-[#20201D] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                {(() => {
                  const cfg = statGroupsConfig.find(c => c.group === selectedGroup);
                  const Icon = cfg?.icon || Swords;
                  return <Icon className="w-5 h-5 text-[#B28A46]" />;
                })()}
                <h2 className="text-base font-black text-[#F2EEE8] tracking-wide">
                  {selectedGroup} Leaderboard
                </h2>
              </div>
              <div className="text-xs text-[#8A837A] font-mono">
                Click column headers to sort (▲ Asc / ▼ Desc)
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#BEB4A8]">
                
                {/* Table Header */}
                <thead className="bg-[#11110F] text-[10px] font-black uppercase tracking-wider text-[#8A837A] border-b border-[#20201D] select-none">
                  <tr>
                    <th className="py-3.5 px-4 w-16 text-center">RANK</th>
                    <th className="py-3.5 px-4">SURVIVOR</th>
                    
                    {selectedGroup === 'PVP' && (
                      <>
                        {renderTh('PVP KILLS', 'kills')}
                        {renderTh('PVP DISTANCE', 'pvpDistance')}
                        {renderTh('HEADSHOTS', 'headshots')}
                        {renderTh('DEATHS', 'deaths')}
                        {renderTh('SUICIDES', 'suicides')}
                        {renderTh('KDR', 'kdr')}
                        {renderTh('SDR', 'sdr')}
                        {renderTh('SLEEPER KILLS', 'sleeperKills')}
                      </>
                    )}

                    {selectedGroup === 'PVE' && (
                      <>
                        {renderTh('PVE KILLS', 'pveKills')}
                        {renderTh('PVE DISTANCE', 'pveDistance')}
                        {renderTh('NPC KILLS', 'npcKills')}
                        {renderTh('HELI HITS', 'heliHits')}
                        {renderTh('HELI KILLS', 'heliKills')}
                        {renderTh('APC KILLS', 'apcKills')}
                      </>
                    )}

                    {selectedGroup === 'RAIDING' && (
                      <>
                        {renderTh('EXPLOSIVES THROWN', 'explosivesThrown')}
                        {renderTh('ROCKETS LAUNCHED', 'rocketsLaunched')}
                        {renderTh('MLRS FIRED', 'mlrsFired')}
                        {renderTh('BULLETS FIRED', 'bulletsFired')}
                        {renderTh('ARROWS FIRED', 'arrowsFired')}
                      </>
                    )}

                    {selectedGroup === 'FARMING' && (
                      <>
                        {renderTh('RESOURCES GATHERED', 'resourcesGathered')}
                        {renderTh('PLANTS GATHERED', 'plantsGathered')}
                        {renderTh('FISH CAUGHT', 'fishCaught')}
                        {renderTh('BARRELS DESTROYED', 'barrelsDestroyed')}
                        {renderTh('DROPS LOOTED', 'dropsLooted')}
                      </>
                    )}

                    {selectedGroup === 'ECONOMY' && (
                      <>
                        {renderTh('ECONOMICS', 'economics')}
                        {renderTh('SERVER REWARDS', 'serverRewards')}
                      </>
                    )}

                    {selectedGroup === 'MISC' && (
                      <>
                        {renderTh('TIME PLAYED', 'playtimeHours')}
                        {renderTh('TIMES WOUNDED', 'timesWounded')}
                        {renderTh('TIMES HEALED', 'timesHealed')}
                        {renderTh('ITEMS CRAFTED', 'itemsCrafted')}
                        {renderTh('ITEMS DEPLOYED', 'itemsDeployed')}
                      </>
                    )}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    /* Loading Skeleton Rows */
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={`skel-${i}`} className="animate-pulse">
                        <td className="py-4 px-4 text-center">
                          <div className="w-6 h-6 bg-white/10 rounded-md mx-auto" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-white/10 rounded-xl" />
                            <div className="space-y-1">
                              <div className="w-24 h-3 bg-white/10 rounded" />
                              <div className="w-16 h-2 bg-white/5 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4"><div className="w-12 h-3 bg-white/10 rounded ml-auto" /></td>
                        <td className="py-4 px-4"><div className="w-12 h-3 bg-white/10 rounded ml-auto" /></td>
                        <td className="py-4 px-4"><div className="w-12 h-3 bg-white/10 rounded ml-auto" /></td>
                        <td className="py-4 px-4"><div className="w-12 h-3 bg-white/10 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : paginatedPlayers.length === 0 ? (
                    /* Empty State */
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <UserCheck className="w-8 h-8 text-gray-500" />
                          <span className="font-bold text-sm text-gray-300">No survivors found</span>
                          <span className="text-xs text-gray-500">Try clearing your search query or selecting a different stat category.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {paginatedPlayers.map((player) => {
                        const isTop1 = player.rank === 1;
                        const isTop2 = player.rank === 2;
                        const isTop3 = player.rank === 3;

                        return (
                          <motion.tr
                            key={player.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => onSelectPlayer(player)}
                            className={`group cursor-pointer transition-colors hover:bg-[#20201D] ${
                              isTop1 ? 'bg-[#B28A46]/10' :
                              isTop2 ? 'bg-[#2E2D2A]/40' :
                              isTop3 ? 'bg-[#C96B3D]/10' : ''
                            }`}
                          >
                            {/* Rank Column */}
                            <td className="py-3.5 px-4 text-center font-extrabold text-xs">
                              {isTop1 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#B28A46] text-[#111111] font-black shadow-md border border-[#C69A4D]">
                                  1
                                </span>
                              ) : isTop2 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#BEB4A8] text-[#111111] font-black shadow-md border border-[#ECE6DC]">
                                  2
                                </span>
                              ) : isTop3 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#C96B3D] text-[#111111] font-black shadow-md border border-[#C96B3D]">
                                  3
                                </span>
                              ) : (
                                <span className="text-[#8A837A] font-mono">
                                  #{player.rank}
                                </span>
                              )}
                            </td>

                            {/* Player Info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={player.avatar}
                                    alt={player.name}
                                    className="w-9 h-9 rounded-xl object-cover border border-[#2E2D2A] group-hover:border-[#B28A46] transition-colors"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                                    }}
                                  />
                                  {player.onlineServerId && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4B7050] border-2 border-[#11110F] shadow-sm" title="Online in Server" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-[#F2EEE8] text-xs truncate group-hover:text-[#B28A46] transition-colors">
                                      {player.name}
                                    </span>
                                    {player.vipRank && player.vipRank !== 'None' && (
                                      <span className="px-1.5 py-0.2 bg-[#B28A46]/20 text-[#B28A46] border border-[#B28A46]/30 text-[9px] font-black rounded uppercase">
                                        {player.vipRank}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#8A837A] font-mono block truncate">
                                    {player.steamId}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* PVP STATS */}
                            {selectedGroup === 'PVP' && (
                              <>
                                <td className={`py-3.5 px-4 text-right font-extrabold ${sortBy === 'kills' ? 'text-[#B28A46] bg-[#B28A46]/10 font-black' : 'text-[#F2EEE8]'}`}>
                                  {player.pvp.kills.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'pvpDistance' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {formatDistance(player.pvp.pvpDistance)}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'headshots' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#4B7050]'}`}>
                                  {player.pvp.headshots.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'deaths' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#8A837A]'}`}>
                                  {player.pvp.deaths.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'suicides' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#C96B3D]'}`}>
                                  {player.pvp.suicides.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right font-bold ${sortBy === 'kdr' ? 'bg-[#B28A46]/10 font-black text-[#B28A46]' : ''} ${
                                  player.pvp.kdr >= 3.0 ? 'text-[#4B7050]' : 'text-[#BEB4A8]'
                                }`}>
                                  {player.pvp.kdr.toFixed(2)}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'sdr' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.pvp.sdr}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'sleeperKills' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.pvp.sleeperKills.toLocaleString()}
                                </td>
                              </>
                            )}

                            {/* PVE STATS */}
                            {selectedGroup === 'PVE' && (
                              <>
                                <td className={`py-3.5 px-4 text-right font-bold ${sortBy === 'pveKills' ? 'text-[#B28A46] bg-[#B28A46]/10 font-black' : 'text-[#F2EEE8]'}`}>
                                  {player.pve.pveKills.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'pveDistance' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {formatDistance(player.pve.pveDistance)}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'npcKills' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#4B7050]'}`}>
                                  {player.pve.npcKills.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'heliHits' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.pve.heliHits.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'heliKills' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#C96B3D]'}`}>
                                  {player.pve.heliKills.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'apcKills' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#8A2F2F]'}`}>
                                  {player.pve.apcKills.toLocaleString()}
                                </td>
                              </>
                            )}

                            {/* RAIDING STATS */}
                            {selectedGroup === 'RAIDING' && (
                              <>
                                <td className={`py-3.5 px-4 text-right font-bold ${sortBy === 'explosivesThrown' ? 'text-[#B28A46] bg-[#B28A46]/10 font-black' : 'text-[#BEB4A8]'}`}>
                                  {player.raiding.explosivesThrown.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right font-bold ${sortBy === 'rocketsLaunched' ? 'text-[#B28A46] bg-[#B28A46]/10 font-black' : 'text-[#C96B3D]'}`}>
                                  {player.raiding.rocketsLaunched.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'mlrsFired' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.raiding.mlrsFired.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right font-mono ${sortBy === 'bulletsFired' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.raiding.bulletsFired.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'arrowsFired' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.raiding.arrowsFired.toLocaleString()}
                                </td>
                              </>
                            )}

                            {/* FARMING STATS */}
                            {selectedGroup === 'FARMING' && (
                              <>
                                <td className={`py-3.5 px-4 text-right font-extrabold ${sortBy === 'resourcesGathered' ? 'text-[#B28A46] bg-[#B28A46]/10 font-black' : 'text-[#F2EEE8]'}`}>
                                  {player.farming.resourcesGathered.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'plantsGathered' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#4B7050]'}`}>
                                  {player.farming.plantsGathered.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'fishCaught' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.farming.fishCaught.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'barrelsDestroyed' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.farming.barrelsDestroyed.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'dropsLooted' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.farming.dropsLooted.toLocaleString()}
                                </td>
                              </>
                            )}

                            {/* ECONOMY STATS */}
                            {selectedGroup === 'ECONOMY' && (
                              <>
                                <td className={`py-3.5 px-4 text-right font-bold ${sortBy === 'economics' ? 'text-[#B28A46] bg-[#B28A46]/10 font-black' : 'text-[#B28A46]'}`}>
                                  ${player.economy.economics.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'serverRewards' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#4B7050]'}`}>
                                  {player.economy.serverRewards.toLocaleString()} RP
                                </td>
                              </>
                            )}

                            {/* MISC STATS */}
                            {selectedGroup === 'MISC' && (
                              <>
                                <td className={`py-3.5 px-4 text-right font-bold ${sortBy === 'playtimeHours' ? 'text-[#B28A46] bg-[#B28A46]/10 font-black' : 'text-[#BEB4A8]'}`}>
                                  {player.misc.playtimeHours}h
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'timesWounded' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#8A2F2F]'}`}>
                                  {player.misc.timesWounded.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'timesHealed' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#4B7050]'}`}>
                                  {player.misc.timesHealed.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'itemsCrafted' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.misc.itemsCrafted.toLocaleString()}
                                </td>
                                <td className={`py-3.5 px-4 text-right ${sortBy === 'itemsDeployed' ? 'text-[#B28A46] font-extrabold bg-[#B28A46]/10' : 'text-[#BEB4A8]'}`}>
                                  {player.misc.itemsDeployed.toLocaleString()}
                                </td>
                              </>
                            )}
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Pagination */}
            <div className="bg-[#11110F] px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A837A] border-t border-[#20201D]">
              <div>
                Showing <span className="text-[#F2EEE8] font-bold">{startIdx}</span> to <span className="text-[#F2EEE8] font-bold">{endIdx}</span> of <span className="text-[#F2EEE8] font-bold">{totalPlayers.toLocaleString()}</span> survivors
              </div>

              <div className="flex items-center space-x-1.5">
                <button 
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage <= 1}
                  className="px-2.5 py-1.5 rounded-[8px] bg-[#1A1A17] border border-[#2E2D2A] text-[#BEB4A8] hover:text-[#F2EEE8] hover:border-[#48453F] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="First Page"
                >
                  &lt;&lt;
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-2.5 py-1.5 rounded-[8px] bg-[#1A1A17] border border-[#2E2D2A] text-[#BEB4A8] hover:text-[#F2EEE8] hover:border-[#48453F] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Previous Page"
                >
                  &lt;
                </button>
                <span className="px-3.5 py-1.5 bg-[#20201D] text-[#F2EEE8] font-black rounded-[8px] border border-[#2E2D2A] text-xs">
                  Page {safePage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-2.5 py-1.5 rounded-[8px] bg-[#1A1A17] border border-[#2E2D2A] text-[#BEB4A8] hover:text-[#F2EEE8] hover:border-[#48453F] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Next Page"
                >
                  &gt;
                </button>
                <button 
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage >= totalPages}
                  className="px-2.5 py-1.5 rounded-[8px] bg-[#1A1A17] border border-[#2E2D2A] text-[#BEB4A8] hover:text-[#F2EEE8] hover:border-[#48453F] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Last Page"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
