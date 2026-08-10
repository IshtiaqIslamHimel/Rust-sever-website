import React, { useState, useEffect } from 'react';
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext';
import { BackgroundLandscape } from './components/BackgroundLandscape';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { LinkView } from './components/LinkView';
import { LeaderboardView } from './components/LeaderboardView';
import { ServersView } from './components/ServersView';
import { RulesView } from './components/RulesView';
import { FaqView } from './components/FaqView';
import { StoreView } from './components/StoreView';
import { ReportView } from './components/ReportView';
import { UserProfileModal } from './components/UserProfileModal';
import { SearchModal } from './components/SearchModal';
import { SeoHead } from './components/SeoHead';
import { NavTab, UserAccount, PlayerProfile, RustServer } from './types';
import { apiUrl } from './config/runtime';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);

  // User state
  const [user, setUser] = useState<UserAccount>({
    steamId: '76561198012345678',
    username: 'Bdog',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    isLoggedIn: true,
    isSteamGroupLinked: true,
    isDiscordLinked: true,
    discordTag: 'Bdog#0001',
    balanceCoins: 1250
  });

  const { servers, totalPlayers, liveKillfeed } = useWebSocket();

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Background Mountain Forest Atmosphere */}
      <BackgroundLandscape />
      <SeoHead page={activeTab} />

      {/* Navigation Bar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        user={user}
        setUser={setUser}
        onOpenUserProfile={() => {
          // Open Bdog user profile modal
          fetch(apiUrl('/api/players/76561198012345678'))
            .then(res => res.json())
            .then(data => setSelectedPlayer(data.player))
            .catch(() => {});
        }}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${activeTab === 'home' ? 'flex min-h-0' : 'pb-12'}`}>
        {activeTab === 'home' && (
          <HomeView
            setActiveTab={setActiveTab}
            totalPlayers={totalPlayers}
            servers={servers}
            liveKillfeed={liveKillfeed}
            onSelectServer={(srv) => {
              setActiveTab('servers');
            }}
          />
        )}

        {activeTab === 'link' && (
          <LinkView user={user} setUser={setUser} />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            servers={servers}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
          />
        )}

        {activeTab === 'servers' && (
          <ServersView
            servers={servers}
            onSelectServer={(srv) => {}}
          />
        )}

        {activeTab === 'rules' && <RulesView />}

        {activeTab === 'faq' && <FaqView setActiveTab={setActiveTab} />}

        {activeTab === 'report' && <ReportView />}

        {activeTab === 'store' && (
          <StoreView user={user} setUser={setUser} />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenRules={() => setActiveTab('rules')}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />

      {/* Ctrl+K Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        servers={servers}
        onSelectPlayer={(p) => setSelectedPlayer(p)}
        setActiveTab={setActiveTab}
      />

    </div>
  );
}

export default function App() {
  return (
    <WebSocketProvider>
      <AppContent />
    </WebSocketProvider>
  );
}
