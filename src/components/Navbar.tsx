import React from 'react';
import { NavTab, UserAccount } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSearch?: () => void;
  user?: UserAccount;
  setUser?: React.Dispatch<React.SetStateAction<UserAccount>>;
  onOpenUserProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'servers', label: 'Server' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'rules', label: 'Rules' },
    { id: 'faq', label: 'FAQ' },
    { id: 'report', label: 'Report' },
    // { id: 'store', label: 'Webstore' }, // Temporarily hidden; restore when the webstore is ready.
  ];

  return (
    <header className="sticky top-0 z-40 w-full pt-3 px-4 md:px-8 max-w-[1600px] mx-auto select-none">
      <div className="relative flex items-center justify-center min-h-[48px]">
        {/* Logo Badge (Positioned Left) */}
        <div 
          onClick={() => setActiveTab('home')}
          className="absolute left-0 cursor-pointer group flex items-center space-x-2"
        >
          <div className="relative transition-transform group-hover:scale-105">
            <img 
              src="https://i.imgur.com/p8fmCzQ.jpeg" 
              alt="[SEA] BEGINNERS 3X Rust server logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-[#48453F] shadow-lg shadow-black/60"
            />
          </div>
        </div>

        {/* Navigation Tabs Pill Container (Centered) */}
        <nav className="flex items-center bg-[#050505]/82 backdrop-blur-[16px] border border-[#2E2D2A] rounded-2xl px-2 py-1.5 shadow-2xl shadow-black/80">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 text-xs md:text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer border-b-2 ${
                  isActive
                    ? 'bg-[#1A1A17] text-[#F2EEE8] border-[#B28A46] font-semibold shadow-inner'
                    : 'text-[#BEB4A8] hover:text-[#F2EEE8] hover:bg-[#1A1A17]/60 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Bar Navigation Scrollable */}
      <div className="lg:hidden flex overflow-x-auto space-x-1 mt-3 bg-[#11110F]/90 backdrop-blur-[16px] p-1.5 rounded-xl border border-[#2E2D2A] no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg font-medium transition-colors border-b-2 ${
                isActive
                  ? 'bg-[#1A1A17] text-[#F2EEE8] border-[#B28A46] font-bold'
                  : 'text-[#BEB4A8] hover:text-[#F2EEE8] border-transparent'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
