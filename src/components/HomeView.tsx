import React, { useEffect, useState } from 'react';
import { Clock3, Server } from 'lucide-react';
import { NavTab, RustServer, KillEvent } from '../types';
import { getWipeWindow } from '../utils/wipeSchedule';

interface HomeViewProps {
  setActiveTab: (tab: NavTab) => void;
  totalPlayers: number;
  servers: RustServer[];
  liveKillfeed: KillEvent[];
  onSelectServer: (srv: RustServer) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  totalPlayers,
  servers,
  liveKillfeed,
  onSelectServer
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const nextWipe = getWipeWindow(now).next.time;
  const remainingHours = Math.max(0, Math.floor((nextWipe - now) / (60 * 60 * 1000)));
  const wipeDays = Math.floor(remainingHours / 24);
  const wipeHours = remainingHours % 24;

  return (
    <div className="relative z-10 flex flex-1 w-full flex-col items-center justify-center px-4 py-4 sm:py-6 text-center max-w-5xl mx-auto select-none">
      
      {/* Hero Central Section */}
      <div className="flex flex-col items-center max-w-2xl animate-fade-in">
        
        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#F2EEE8] tracking-tight mb-3 drop-shadow-2xl">
          Welcome to SEAB3X
        </h1>

        {/* Subtitle */}
        <p className="text-[#BEB4A8] text-sm md:text-lg mb-5 sm:mb-6 font-normal tracking-wide">
          Experience our high performance 3x modded Rust server.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          {/* Join Server Button - Primary Gold */}
          <button
            onClick={() => setActiveTab('servers')}
            className="flex items-center space-x-2 bg-[#B28A46] hover:bg-[#C69A4D] active:bg-[#8D6B34] text-[#111111] font-bold text-xs md:text-sm uppercase tracking-wider px-6 py-3 rounded-[12px] shadow-[0_0_30px_rgba(178,138,70,0.18)] transition-all transform hover:scale-[1.03] cursor-pointer border-none"
          >
            <Server className="w-4 h-4" />
            <span>JOIN SERVER</span>
          </button>

          {/* Join Discord Button - Secondary Button */}
          <button
            onClick={() => window.open('https://discord.gg/FgvP3dmzRH', '_blank', 'noopener,noreferrer')}
            className="flex items-center space-x-2 bg-transparent hover:bg-[#1A1A17] text-[#F2EEE8] font-bold text-xs md:text-sm uppercase tracking-wider px-6 py-3 rounded-[12px] border border-[#48453F] hover:border-[#B28A46] transition-all transform hover:scale-[1.03] cursor-pointer shadow-md"
          >
            {/* Discord Icon SVG */}
            <svg className="w-4 h-4 fill-current text-[#F2EEE8]" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
            </svg>
            <span>JOIN DISCORD</span>
          </button>
        </div>

        {/* Live next-wipe countdown */}
        <div className="flex items-center space-x-1.5 text-xs text-[#BEB4A8] font-medium">
          <Clock3 className="w-3.5 h-3.5 text-[#B28A46]" />
          <span>Next Wipe in {wipeDays} {wipeDays === 1 ? 'Day' : 'Days'} {wipeHours} {wipeHours === 1 ? 'Hour' : 'Hours'}</span>
        </div>
      </div>

    </div>
  );
};
