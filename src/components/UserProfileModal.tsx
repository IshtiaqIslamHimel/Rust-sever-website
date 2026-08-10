import React, { useState } from 'react';
import { X, Trophy, Crosshair, Pickaxe, Flame, Radio, Dices, Clock, ShieldCheck, ExternalLink } from 'lucide-react';
import { PlayerProfile, StatGroup } from '../types';

interface UserProfileModalProps {
  player: PlayerProfile | null;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ player, onClose }) => {
  const [activeTab, setActiveTab] = useState<StatGroup>('PVP');

  const formatDistance = (distanceMeters: number) => {
    const meters = Number.isFinite(distanceMeters) ? distanceMeters : 0;
    return Math.abs(meters) >= 1000
      ? `${(meters / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} km`
      : `${meters.toLocaleString(undefined, { maximumFractionDigits: 2 })} m`;
  };

  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#11110F] border border-[#2E2D2A] rounded-[24px] max-w-2xl w-full p-6 card-shadow-lg relative text-left max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A837A] hover:text-[#F2EEE8] p-1 rounded-[8px] bg-[#1A1A17] border border-[#2E2D2A] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Player Banner & Avatar Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="relative">
            <img
              src={player.avatar}
              alt={player.name}
              className="w-20 h-20 rounded-[16px] object-cover border-2 border-[#B28A46] shadow-xl"
            />
            <span className="absolute -bottom-2 -right-2 bg-[#B28A46] text-[#111111] text-[10px] font-black px-2 py-0.5 rounded-[6px] uppercase shadow">
              #{player.rank}
            </span>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl font-extrabold text-[#F2EEE8]">{player.name}</h2>
              {player.vipRank && player.vipRank !== 'None' && (
                <span className="bg-[#B28A46]/20 text-[#B28A46] text-[10px] font-black px-2 py-0.5 rounded border border-[#B28A46]/30">
                  {player.vipRank}
                </span>
              )}
            </div>

            <p className="text-xs text-[#8A837A] font-mono mb-2">Steam ID: {player.steamId}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-[#BEB4A8]">
              <span className="bg-[#1A1A17] px-2.5 py-1 rounded-[8px] border border-[#2E2D2A]">
                Playtime: <strong className="text-[#4B7050]">{player.misc.playtimeHours} hrs</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Category Stat Selector Pills */}
        <div className="flex overflow-x-auto space-x-1.5 pb-2 mb-5 no-scrollbar border-b border-[#20201D]">
          {(['PVP', 'PVE', 'RAIDING', 'FARMING', 'ECONOMY', 'MISC'] as StatGroup[]).map((grp) => (
            <button
              key={grp}
              onClick={() => setActiveTab(grp)}
              className={`px-3 py-1.5 text-xs font-black rounded-[10px] whitespace-nowrap transition-all cursor-pointer ${
                activeTab === grp
                  ? 'bg-[#B28A46] text-[#111111] shadow'
                  : 'bg-[#1A1A17] text-[#8A837A] hover:text-[#F2EEE8]'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#1A1A17] p-4 rounded-[16px] border border-[#2E2D2A] mb-6">
          {activeTab === 'PVP' && (
            <>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">PvP Kills</span>
                <span className="text-base font-extrabold text-[#F2EEE8]">{player.pvp.kills.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">PvP Distance</span>
                <span className="text-base font-extrabold text-[#B28A46]">{formatDistance(player.pvp.pvpDistance)}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Headshots</span>
                <span className="text-base font-extrabold text-[#4B7050]">{player.pvp.headshots.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Deaths</span>
                <span className="text-base font-extrabold text-[#8A2F2F]">{player.pvp.deaths.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Suicides</span>
                <span className="text-base font-extrabold text-[#C96B3D]">{player.pvp.suicides.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">KDR</span>
                <span className="text-base font-extrabold text-[#4B7050]">{player.pvp.kdr.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">SDR</span>
                <span className="text-base font-extrabold text-[#BEB4A8]">{player.pvp.sdr}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Sleeper Kills</span>
                <span className="text-base font-extrabold text-[#B28A46]">{player.pvp.sleeperKills.toLocaleString()}</span>
              </div>
            </>
          )}

          {activeTab === 'PVE' && (
            <>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">PvE Kills</span>
                <span className="text-base font-extrabold text-[#BEB4A8]">{player.pve.pveKills.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">PvE Distance</span>
                <span className="text-base font-extrabold text-[#B28A46]">{formatDistance(player.pve.pveDistance)}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">NPC Kills</span>
                <span className="text-base font-extrabold text-[#4B7050]">{player.pve.npcKills.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Heli Hits</span>
                <span className="text-base font-extrabold text-[#C96B3D]">{player.pve.heliHits.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Heli Kills</span>
                <span className="text-base font-extrabold text-[#C96B3D]">{player.pve.heliKills.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">APC Kills</span>
                <span className="text-base font-extrabold text-[#8A2F2F]">{player.pve.apcKills.toLocaleString()}</span>
              </div>
            </>
          )}

          {activeTab === 'RAIDING' && (
            <>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Explosives Thrown</span>
                <span className="text-base font-extrabold text-[#C96B3D]">{player.raiding.explosivesThrown.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Rockets Launched</span>
                <span className="text-base font-extrabold text-[#8A2F2F]">{player.raiding.rocketsLaunched.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">MLRS Fired</span>
                <span className="text-base font-extrabold text-[#C96B3D]">{player.raiding.mlrsFired.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Bullets Fired</span>
                <span className="text-base font-extrabold text-[#B28A46] font-mono">{player.raiding.bulletsFired.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Arrows Fired</span>
                <span className="text-base font-extrabold text-[#BEB4A8]">{player.raiding.arrowsFired.toLocaleString()}</span>
              </div>
            </>
          )}

          {activeTab === 'FARMING' && (
            <>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Resources Gathered</span>
                <span className="text-base font-extrabold text-[#B28A46]">{player.farming.resourcesGathered.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Plants Gathered</span>
                <span className="text-base font-extrabold text-[#4B7050]">{player.farming.plantsGathered.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Fish Caught</span>
                <span className="text-base font-extrabold text-[#7E7A73]">{player.farming.fishCaught.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Barrels Destroyed</span>
                <span className="text-base font-extrabold text-[#BEB4A8]">{player.farming.barrelsDestroyed.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Drops Looted</span>
                <span className="text-base font-extrabold text-[#B28A46]">{player.farming.dropsLooted.toLocaleString()}</span>
              </div>
            </>
          )}

          {activeTab === 'ECONOMY' && (
            <>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Economics</span>
                <span className="text-base font-extrabold text-[#B28A46]">${player.economy.economics.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Server Rewards</span>
                <span className="text-base font-extrabold text-[#4B7050]">{player.economy.serverRewards.toLocaleString()} RP</span>
              </div>
            </>
          )}

          {activeTab === 'MISC' && (
            <>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Time Played</span>
                <span className="text-base font-extrabold text-[#B28A46]">{player.misc.playtimeHours} hrs</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Times Wounded</span>
                <span className="text-base font-extrabold text-[#8A2F2F]">{player.misc.timesWounded.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Times Healed</span>
                <span className="text-base font-extrabold text-[#4B7050]">{player.misc.timesHealed.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Items Crafted</span>
                <span className="text-base font-extrabold text-[#B28A46]">{player.misc.itemsCrafted.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#11110F] rounded-[8px] border border-[#20201D]">
                <span className="text-[10px] text-[#8A837A] block uppercase font-semibold">Items Deployed</span>
                <span className="text-base font-extrabold text-[#BEB4A8]">{player.misc.itemsDeployed.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3">
          <a
            href={`https://steamcommunity.com/profiles/${player.steamId}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 bg-[#1A1A17] hover:bg-[#20201D] text-[#BEB4A8] hover:text-[#F2EEE8] text-xs font-bold px-4 py-2.5 rounded-[12px] border border-[#2E2D2A] transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Steam Community Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
};
