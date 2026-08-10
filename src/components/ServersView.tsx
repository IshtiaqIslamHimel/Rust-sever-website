import React, { useState, useEffect } from 'react';
import { 
  Map, ExternalLink, Globe, Info, Compass, 
  Layers, RefreshCw, Terminal, Check, Copy, ArrowUpRight, Server, ShieldCheck, Activity, Cpu,
  FileText, Users, Calendar, Download, Sparkles, Zap, Shield, Share2
} from 'lucide-react';
import { RustServer } from '../types';
import { apiUrl } from '../config/runtime';
import { getNextFirstFridayUtc, getNextWeeklyUtc, getWipeWindow } from '../utils/wipeSchedule';

interface ServersViewProps {
  servers?: RustServer[];
  onSelectServer?: (srv: RustServer) => void;
}

const formatWipeDistance = (milliseconds: number, direction: 'ago' | 'until') => {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return direction === 'ago' ? `${days}d ${hours}h ago` : `in ${days}d ${hours}h`;
  if (hours > 0) return direction === 'ago' ? `${hours}h ${minutes}m ago` : `in ${hours}h ${minutes}m`;
  return direction === 'ago' ? `${minutes}m ago` : `in ${minutes}m`;
};

const normalize3xBranding = (value: string) => value
  .replace(/SEAB2X/gi, 'SEAB3X')
  .replace(/\b2X\b/gi, '3X');

export const ServersView: React.FC<ServersViewProps> = () => {
  const serverIp = '15.235.132.88';
  const serverPort = 25096;
  const temporaryBannerImage = 'https://i.imgur.com/ldEDk8p.png';
  const [seed, setSeed] = useState('8491029');
  const [worldSize, setWorldSize] = useState('3500');
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [bannerImageLoading, setBannerImageLoading] = useState(true);
  const [bannerImageError, setBannerImageError] = useState(false);
  const [bannerRevision, setBannerRevision] = useState(() => Date.now());
  const [mapImageLoading, setMapImageLoading] = useState(true);
  const [copiedConnect, setCopiedConnect] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [monumentFilter, setMonumentFilter] = useState<'all' | 'tier3' | 'safezone'>('all');
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const [liveData, setLiveData] = useState({
    serverName: 'SEAB3X',
    description: 'Welcome to SEAB3X. Live server information is loading.',
    ip: '15.235.132.88',
    port: 25096,
    queryPort: 25097,
    status: 'online',
    players: 142,
    maxPlayers: 200,
    fps: null as number | null,
    mapName: 'Procedural Map',
    seed: 8491029,
    worldSize: 3500,
    rustHeaderImage: null as string | null,
    mapImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
    rustMapsUrl: 'https://rustmaps.com/map/3500_8491029',
    monuments: [
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
    ],
    biomes: { snow: 18, desert: 28, forest: 54 }
  });

  const fetchLiveServerMap = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(apiUrl('/api/servers/live-map-info'));
      const data = await res.json();

      if (data.success) {
        setLiveData(prev => ({
          ...prev,
          serverName: normalize3xBranding(data.serverName || prev.serverName),
          description: normalize3xBranding(data.description || prev.description),
          ip: serverIp,
          port: serverPort,
          queryPort: data.queryPort || prev.queryPort,
          status: data.status || prev.status,
          players: data.players ?? prev.players,
          maxPlayers: data.maxPlayers ?? prev.maxPlayers,
          // A missing reading must clear an old value so stale FPS is never
          // presented as the server's current frame rate.
          fps: typeof data.fps === 'number' ? data.fps : null,
          mapName: data.mapName || prev.mapName,
          seed: data.seed || prev.seed,
          worldSize: data.worldSize || prev.worldSize,
          rustHeaderImage: typeof data.rustHeaderImage === 'string' && data.rustHeaderImage.trim()
            ? data.rustHeaderImage.trim()
            : null,
          mapImageUrl: data.mapImageUrl || prev.mapImageUrl,
          rustMapsUrl: data.rustMapsUrl || prev.rustMapsUrl,
          monuments: (data.monuments && data.monuments.length > 0) ? data.monuments : prev.monuments
        }));

        if (data.seed) setSeed(data.seed.toString());
        if (data.worldSize) setWorldSize(data.worldSize.toString());
        if (data.rustHeaderImage) setBannerRevision(Date.now());
      }
    } catch (e) {
      setLoadError(true);
    } finally {
      setHasLoaded(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveServerMap();
    const interval = setInterval(() => {
      fetchLiveServerMap();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setBannerImageLoading(true);
    setBannerImageError(false);
  }, [liveData.rustHeaderImage, bannerRevision]);

  useEffect(() => {
    setMapImageLoading(true);
  }, [liveData.mapImageUrl]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const rustMapsDirectUrl = `https://rustmaps.com/map/${worldSize}_${seed}`;
  const liveBannerImageUrl = liveData.rustHeaderImage
    ? `${liveData.rustHeaderImage}${liveData.rustHeaderImage.includes('?') ? '&' : '?'}live=${bannerRevision}`
    : null;
  const connectCmd = `connect ${serverIp}:${serverPort}`;
  const steamConnectUrl = `steam://connect/${serverIp}:${serverPort}`;
  const nextMapWipe = getNextWeeklyUtc(currentTime, 5, 11, 30);
  const nextBlueprintWipe = getNextFirstFridayUtc(currentTime);
  const wipeWindow = getWipeWindow(currentTime);
  const wipeInterval = wipeWindow.next.time - wipeWindow.last.time;
  const wipeProgress = Math.min(100, Math.max(0, ((currentTime - wipeWindow.last.time) / wipeInterval) * 100));
  const wipeTimeFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
  const localClockFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const copyConnect = () => {
    navigator.clipboard.writeText(connectCmd);
    setCopiedConnect(true);
    setTimeout(() => setCopiedConnect(false), 2000);
  };

  const copySeed = () => {
    navigator.clipboard.writeText(seed);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  const filteredMonuments = liveData.monuments.filter(m => {
    if (monumentFilter === 'tier3') return m.type === 'Tier 3';
    if (monumentFilter === 'safezone') return m.type === 'Safezone';
    return true;
  });

  return (
    <div className="relative z-10 max-w-[1380px] mx-auto px-3 sm:px-6 py-8 text-[#BEB4A8] font-sans animate-fade-in select-none space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2E2D2A]">
        <div>
          <div className="flex items-center space-x-2 text-[#B28A46] font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>Live Server & Map Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{liveData.serverName}</span>
            <span className="bg-[#4B7050]/20 text-[#4B7050] border border-[#4B7050] text-xs font-mono px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4B7050] animate-pulse" />
              <span>{liveData.status || 'Online'}</span>
            </span>
          </h1>
        </div>
      </div>

      {!hasLoaded && loading && (
        <div className="rounded-xl border border-[#2E2D2A] bg-[#11110F] p-4 flex items-center gap-3 text-sm text-[#8A837A]" role="status">
          <RefreshCw className="w-5 h-5 text-[#B28A46] animate-spin" />
          <span className="font-mono">Loading live server information...</span>
          <div className="ml-auto hidden sm:flex gap-2">
            <span className="h-2 w-16 rounded bg-[#2E2D2A] animate-pulse" />
            <span className="h-2 w-24 rounded bg-[#2E2D2A] animate-pulse" />
          </div>
        </div>
      )}

      {hasLoaded && loadError && (
        <div className="rounded-xl border border-[#8A2F2F] bg-[#8A2F2F]/30 p-3 text-xs font-mono text-[#C96B3D]">
          Live information could not be loaded. Retrying automatically...
        </div>
      )}

      {/* SERVER BANNER HEADER WITH RIGHT DETAILS PANEL */}
      <div className="bg-[#11110F] border border-[#2E2D2A] rounded-2xl overflow-hidden p-3 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* LEFT (7/12): SERVER HEADER IMAGE */}
            <div className="lg:col-span-7 relative rounded-xl overflow-hidden bg-[#111111] border border-[#2E2D2A] flex items-center justify-center min-h-[180px] max-h-[300px]">
              <img
                src={temporaryBannerImage}
                alt="[SEA] BEGINNERS 3X Asia Rust server banner"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-contain"
              />
              {liveBannerImageUrl && bannerImageLoading && !bannerImageError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#111111]/45 backdrop-blur-[1px]" role="status">
                  <RefreshCw className="w-6 h-6 text-[#B28A46] animate-spin" />
                  <span className="text-[11px] font-mono text-[#8A837A]">Loading server image...</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-pulse" />
                </div>
              )}
              {liveBannerImageUrl && !bannerImageError ? (
                <>
                  {/* Blurred background image layer to fill empty spaces smoothly */}
                  <img
                    src={liveBannerImageUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover filter blur-xl opacity-35 scale-110 pointer-events-none"
                  />
                  {/* Current banner configured on the Rust server. */}
                  <img
                    src={liveBannerImageUrl}
                    alt="Live [SEA] BEGINNERS 3X Rust server banner"
                    referrerPolicy="no-referrer"
                    onLoad={() => setBannerImageLoading(false)}
                    onError={() => {
                      setBannerImageLoading(false);
                      setBannerImageError(true);
                    }}
                    className={`relative z-10 max-h-[280px] w-auto max-w-full object-contain filter brightness-[0.98] group-hover:scale-[1.01] transition-all duration-500 ${bannerImageLoading ? 'opacity-0' : 'opacity-100'}`}
                  />
                </>
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[#11110F]/80 via-transparent to-transparent z-20 pointer-events-none" />
              <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2">
                <span className="bg-[#111111]/85 backdrop-blur-md border border-[#2E2D2A] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#B28A46] flex items-center gap-2 shadow-xl">
                  <Server className="w-4 h-4" />
                  <span>{liveData.serverName}</span>
                </span>
              </div>
            </div>

            {/* RIGHT (5/12): QUICK DETAILS & CONNECT CARD */}
            <div className="lg:col-span-5 bg-[#1A1A17] border border-[#2E2D2A] rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#2E2D2A]">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-[#B28A46]" />
                    <span>Quick Connect & Information</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#4B7050] bg-[#4B7050]/20 px-2 py-0.5 rounded border border-[#4B7050]">
                    Online
                  </span>
                </div>

                {/* IP & PORT COPY BLOCK */}
                <div className="bg-[#11110F] border border-[#2E2D2A] rounded-lg p-3 space-y-1.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#8A837A] uppercase">Server IP & Port</span>
                    <a
                      href={steamConnectUrl}
                      title="Open Rust and join this server"
                      className="text-[10px] font-mono font-bold text-[#B28A46] hover:text-[#C69A4D] underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Direct Connect
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-[#111111] p-2 rounded-md border border-[#2E2D2A]">
                    <code className="text-xs font-mono font-bold text-white tracking-wide truncate">
                      {serverIp}:{serverPort}
                    </code>
                    <button
                      onClick={copyConnect}
                      className="px-2.5 py-1 rounded-md bg-[#B28A46] hover:bg-[#C69A4D] text-white text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-red-950/30 shrink-0"
                    >
                      {copiedConnect ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedConnect ? 'Copied IP' : 'Copy IP'}</span>
                    </button>
                  </div>
                </div>

                {/* SERVER METRICS GRID (Active Players, World Size, Server FPS, World Seed) */}
                <div className="grid grid-cols-2 gap-2">
                  {/* ACTIVE PLAYERS */}
                  <div className="bg-[#11110F] border border-[#2E2D2A] rounded-lg p-2.5 flex items-center space-x-2.5">
                    <Users className="w-4 h-4 text-[#B28A46] shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-[9px] font-mono text-[#8A837A] uppercase block truncate">Active Players</span>
                      <span className="text-xs font-bold text-white font-mono block">
                        {liveData.players} <span className="text-[#8A837A] text-[10px]">/ {liveData.maxPlayers}</span>
                      </span>
                    </div>
                  </div>

                  {/* WORLD SIZE */}
                  <div className="bg-[#11110F] border border-[#2E2D2A] rounded-lg p-2.5 flex items-center space-x-2.5">
                    <Globe className="w-4 h-4 text-[#4B7050] shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-[9px] font-mono text-[#8A837A] uppercase block truncate">World Size</span>
                      <span className="text-xs font-bold text-white font-mono block">{liveData.worldSize}</span>
                    </div>
                  </div>

                  {/* SERVER FPS */}
                  <div className="bg-[#11110F] border border-[#2E2D2A] rounded-lg p-2.5 flex items-center space-x-2.5">
                    <Zap className="w-4 h-4 text-[#B28A46] shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-[9px] font-mono text-[#8A837A] uppercase block truncate">Server FPS</span>
                      <span className="text-xs font-bold text-white font-mono block">{liveData.fps !== null ? <>{Math.round(liveData.fps)} <span className="text-[10px] text-[#8A837A]">FPS</span></> : <span className="text-[10px] text-[#8A837A]">Unavailable</span>}</span>
                    </div>
                  </div>

                  {/* WORLD SEED */}
                  <div 
                    onClick={copySeed} 
                    title="Click to copy seed" 
                    className="bg-[#11110F] border border-[#2E2D2A] hover:border-[#B28A46]/50 rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <Compass className="w-4 h-4 text-[#B28A46] shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[9px] font-mono text-[#8A837A] uppercase block truncate">World Seed</span>
                        <span className="text-xs font-bold text-white font-mono block truncate">{liveData.seed}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8A837A] group-hover:text-[#B28A46] transition-colors shrink-0">
                      {copiedSeed ? <Check className="w-3.5 h-3.5 text-[#4B7050]" /> : <Copy className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      {/* MAIN CONTENT SPLIT GRID: DESCRIPTION (LEFT) & MAP (RIGHT) SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (5/12): SERVER OVERVIEW & DESCRIPTION */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-[#11110F] border border-[#2E2D2A] rounded-2xl p-6 shadow-2xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2E2D2A]">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#B28A46]" />
                  <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                    Server Description
                  </h2>
                </div>
              </div>

              {/* DESCRIPTION TEXT */}
              <div className="bg-[#1A1A17] border border-[#2E2D2A] rounded-xl p-4 text-xs leading-relaxed text-[#BEB4A8] font-sans whitespace-pre-wrap min-h-[360px]">
                {liveData.description}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7/12): CUSTOMIZED MAP */}
        <div className="lg:col-span-7 bg-[#11110F] border border-[#2E2D2A] rounded-2xl p-5 shadow-2xl space-y-4">
          
          {/* MAP HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2E2D2A]">
            <div className="flex items-center space-x-2.5">
              <Globe className="w-5 h-5 text-[#4B7050]" />
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Custom Rust Map Explorer</span>
                </h2>
                <p className="text-[11px] text-[#8A837A]">
                  Seed: <strong className="text-white font-mono">{seed}</strong> • Size: <strong className="text-white font-mono">{worldSize}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* MAP IMAGE DISPLAY */}
          <a
            href={rustMapsDirectUrl}
            target="_blank"
            rel="noreferrer"
            title="Click image to open high-res RustMaps page"
            className="relative block rounded-xl overflow-hidden border border-[#2E2D2A] hover:border-[#B28A46] bg-[#111111] p-2 group cursor-pointer transition-all duration-300 min-h-[400px] flex items-center justify-center"
          >
            {mapImageLoading && (
              <div className="absolute inset-2 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-[#111111]" role="status">
                <RefreshCw className="w-7 h-7 text-[#4B7050] animate-spin" />
                <span className="text-xs font-mono text-[#8A837A]">Loading map image...</span>
                <div className="h-2 w-40 overflow-hidden rounded-full bg-[#2E2D2A]">
                  <div className="h-full w-1/2 rounded-full bg-[#4B7050]/60 animate-pulse" />
                </div>
              </div>
            )}
            <img
              src={liveData.mapImageUrl}
              alt={`Rust Map Seed ${seed} Size ${worldSize}`}
              referrerPolicy="no-referrer"
              onLoad={() => setMapImageLoading(false)}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.includes('_icon.png')) {
                  target.src = `https://maps.rustmaps.com/${worldSize}_${seed}.png`;
                } else if (!target.src.includes('unsplash')) {
                  target.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80';
                } else {
                  setMapImageLoading(false);
                }
              }}
              className="w-full h-[400px] object-contain filter brightness-[0.95] contrast-[1.05] transform transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {/* HOVER PROMPT OVERLAY */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center backdrop-blur-[2px]">
              <div className="w-11 h-11 rounded-full bg-[#B28A46] text-white flex items-center justify-center mb-2 shadow-2xl transform group-hover:scale-110 transition-transform">
                <ExternalLink className="w-5 h-5" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-wide">
                Open Fullscreen Map on RustMaps.com
              </span>
            </div>

            {/* OVERLAY BADGES */}
            <div className="absolute bottom-2.5 left-2.5 bg-[#111111]/90 backdrop-blur-md border border-[#2E2D2A] px-3 py-1 rounded-lg text-[11px] font-mono text-white flex items-center space-x-2 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-[#4B7050] animate-pulse" />
              <span>Seed: <strong>{seed}</strong></span>
              <span>•</span>
              <span>Size: <strong>{worldSize}</strong></span>
            </div>
          </a>

          {/* LIVE WIPE SCHEDULE */}
          <section className="overflow-hidden rounded-xl border border-[#2E2D2A] bg-[#1A1A17] shadow-xl" aria-label="Wipe schedule">
            <div className="flex flex-col gap-2 border-b border-[#2E2D2A] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#B28A46]" />
                <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">Wipe Schedule</h3>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px]">
                <span className="flex items-center gap-1.5 uppercase text-[#4B7050]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4B7050]" />
                  Live countdown
                </span>
                <span className="text-[#8A837A]">
                  Local time: <strong className="text-white">{localClockFormatter.format(currentTime)}</strong>
                  <span className="ml-1 text-[#B28A46]">({localTimeZone})</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 sm:gap-6 sm:p-5">
              <div className="min-w-0 text-center">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A837A]">Last wipe</p>
                <div className="rounded-lg border border-[#48453F] bg-[#20201D]/45 px-2 py-2.5 text-xs font-bold text-[#BEB4A8] sm:text-sm">
                  {formatWipeDistance(currentTime - wipeWindow.last.time, 'ago')}
                </div>
                <p className="mt-2 truncate text-[10px] font-mono text-[#B28A46] sm:text-[11px]">
                  {wipeTimeFormatter.format(wipeWindow.last.time)}
                </p>
              </div>

              <div
                className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full sm:h-20 sm:w-20"
                style={{ background: `conic-gradient(#B28A46 0 ${wipeProgress}%, #2E2D2A ${wipeProgress}% 100%)` }}
                title={`${Math.round(wipeProgress)}% through the current wipe`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#48453F] bg-[#11110F] sm:h-14 sm:w-14">
                  <span className="text-[10px] font-black text-white sm:text-xs">{Math.round(wipeProgress)}%</span>
                </div>
              </div>

              <div className="min-w-0 text-center">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A837A]">Next wipe</p>
                <div className="rounded-lg border border-[#8A2F2F] bg-[#8A2F2F]/35 px-2 py-2.5 text-xs font-bold text-[#C96B3D] sm:text-sm">
                  {formatWipeDistance(wipeWindow.next.time - currentTime, 'until')}
                </div>
                <p className="mt-2 truncate text-[10px] font-mono text-[#C96B3D] sm:text-[11px]">
                  {wipeTimeFormatter.format(wipeWindow.next.time)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 border-t border-[#2E2D2A] bg-[#11110F]/70 p-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#2E2D2A] bg-[#1A1A17] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#B28A46]">Map wipe</span>
                  <span className="text-[10px] font-mono text-[#8A837A]">Every Friday</span>
                </div>
                <p className="text-xs font-bold text-[#B28A46]">{wipeTimeFormatter.format(nextMapWipe)}</p>
                <p className="mt-1 text-[10px] font-mono text-[#8A837A]">Your local time · 11:30 UTC</p>
              </div>

              <div className="rounded-lg border border-[#2E2D2A] bg-[#1A1A17] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#B28A46]">Blueprint wipe</span>
                  <span className="text-[10px] font-mono text-[#8A837A]">First Friday monthly</span>
                </div>
                <p className="text-xs font-bold text-[#C96B3D]">{wipeTimeFormatter.format(nextBlueprintWipe)}</p>
                <p className="mt-1 text-[10px] font-mono text-[#8A837A]">Your local time · 11:30 UTC</p>
                <p className="mt-1 text-[10px] font-mono text-[#8A837A]">
                  {formatWipeDistance(nextBlueprintWipe - currentTime, 'until')}
                </p>
              </div>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
};
