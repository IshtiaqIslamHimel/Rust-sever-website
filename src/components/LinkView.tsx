import React from 'react';
import { Shield, Gift, Trophy, Radio, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { UserAccount } from '../types';

interface LinkViewProps {
  user: UserAccount;
  setUser: React.Dispatch<React.SetStateAction<UserAccount>>;
}

export const LinkView: React.FC<LinkViewProps> = ({ user, setUser }) => {
  const handleSteamLogin = () => {
    setUser({
      steamId: '76561198012345678',
      username: 'Bdog',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
      isLoggedIn: true,
      isSteamGroupLinked: true,
      isDiscordLinked: user.isDiscordLinked,
      discordTag: user.discordTag || 'Bdog#0001',
      balanceCoins: 1250
    });
  };

  const handleToggleSteamGroup = () => {
    if (!user.isLoggedIn) {
      handleSteamLogin();
      return;
    }
    setUser(prev => ({ ...prev, isSteamGroupLinked: !prev.isSteamGroupLinked }));
  };

  const handleToggleDiscord = () => {
    if (!user.isLoggedIn) {
      handleSteamLogin();
      return;
    }
    setUser(prev => ({ 
      ...prev, 
      isDiscordLinked: !prev.isDiscordLinked,
      discordTag: !prev.isDiscordLinked ? 'Bdog#0001' : undefined
    }));
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 select-none text-center animate-fade-in">
      {/* Title & Description */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 drop-shadow-lg">
        Link Your Accounts
      </h1>
      <p className="text-gray-300 text-xs md:text-sm max-w-lg mx-auto mb-8 font-normal">
        Join the Steam Group and link your Steam and Discord accounts to unlock exclusive features.
      </p>

      {/* Main Account Linking Status Box */}
      <div className="bg-[#2a303e]/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Avatar Icon */}
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#1c212c] border border-white/10 flex items-center justify-center p-3 shadow-inner">
              {user.isLoggedIn ? (
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-full h-full object-cover rounded-xl border border-blue-400" 
                />
              ) : (
                <svg className="w-10 h-10 text-gray-500 fill-current" viewBox="0 0 24 24">
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.005.105.005.158 0 1.839-1.49 3.328-3.328 3.328-1.578 0-2.903-1.1-3.236-2.583L.367 15.38C1.884 20.354 6.518 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                </svg>
              )}
            </div>
            {user.isLoggedIn && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#2a303e] flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
            )}
          </div>

          {/* Account Status Text & Button */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-base font-bold text-white mb-1">
              {user.isLoggedIn ? `Welcome back, ${user.username}!` : 'Sign in to get started'}
            </h2>
            <p className="text-xs text-gray-300">
              {user.isLoggedIn 
                ? `Steam ID: ${user.steamId} • Authenticated via Steam Guard` 
                : 'Link your Steam and Discord accounts to unlock in-game rewards and features.'}
            </p>
          </div>

          <div>
            {!user.isLoggedIn ? (
              <button
                onClick={handleSteamLogin}
                className="flex items-center space-x-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-xs uppercase px-5 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.005.105.005.158 0 1.839-1.49 3.328-3.328 3.328-1.578 0-2.903-1.1-3.236-2.583L.367 15.38C1.884 20.354 6.518 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                </svg>
                <span>SIGN IN WITH STEAM</span>
              </button>
            ) : (
              <span className="inline-flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AUTHENTICATED</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Account Links Section - Matching Screenshot 2 Timeline */}
      <div className="text-left max-w-2xl mx-auto mb-10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">
          ACCOUNT LINKS
        </h3>

        <div className="relative pl-6 space-y-4">
          {/* Vertical Red Connecting Line from Screenshot 2 */}
          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-red-500/80 rounded" />

          {/* Steam Community Group Link Card */}
          <div className="relative flex items-center justify-between bg-[#2a303e]/90 border border-white/10 rounded-2xl p-4 shadow-lg hover:border-white/20 transition-all">
            {/* Timeline Dot Indicator */}
            <div className="absolute -left-[19px] top-1/2 transform -translate-y-1/2 w-4 h-2 bg-red-500 rounded-full border border-red-400 shadow-md" />

            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-[#1c212c] border border-white/10 flex items-center justify-center text-gray-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.005.105.005.158 0 1.839-1.49 3.328-3.328 3.328-1.578 0-2.903-1.1-3.236-2.583L.367 15.38C1.884 20.354 6.518 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Steam Community Group</span>
                </h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    user.isSteamGroupLinked 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {user.isSteamGroupLinked ? 'VERIFIED' : 'PENDING'}
                  </span>
                  <span className="text-xs text-gray-400">
                    — {user.isSteamGroupLinked ? 'Joined Official Group' : 'Sign in to join'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleSteamGroup}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                user.isSteamGroupLinked 
                  ? 'bg-gray-700/60 hover:bg-gray-700 text-gray-200' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
              }`}
            >
              {user.isSteamGroupLinked ? 'Unlink' : 'Join Group'}
            </button>
          </div>

          {/* Discord Server Link Card */}
          <div className="relative flex items-center justify-between bg-[#2a303e]/90 border border-white/10 rounded-2xl p-4 shadow-lg hover:border-white/20 transition-all">
            {/* Timeline Dot Indicator */}
            <div className="absolute -left-[19px] top-1/2 transform -translate-y-1/2 w-4 h-2 bg-red-500 rounded-full border border-red-400 shadow-md" />

            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-[#1c212c] border border-white/10 flex items-center justify-center text-indigo-400">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Discord Server
                </h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    user.isDiscordLinked 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {user.isDiscordLinked ? 'VERIFIED' : 'PENDING'}
                  </span>
                  <span className="text-xs text-gray-400">
                    — {user.isDiscordLinked ? `Linked as ${user.discordTag}` : 'Sign in to connect'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleDiscord}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                user.isDiscordLinked 
                  ? 'bg-gray-700/60 hover:bg-gray-700 text-gray-200' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              {user.isDiscordLinked ? 'Disconnect' : 'Connect Discord'}
            </button>
          </div>
        </div>
      </div>

      {/* WHY LINK? Grid Section - Matching Screenshot 2 Bottom Grid */}
      <div className="text-left max-w-2xl mx-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">
          WHY LINK?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Feature 1 */}
          <div className="bg-[#212735]/80 border border-white/10 rounded-xl p-4 flex items-start space-x-3 hover:bg-[#272e3f] transition-all">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Giveaway Eligibility</h4>
              <p className="text-[11px] text-gray-400">Enter giveaways and win prizes instantly.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#212735]/80 border border-white/10 rounded-xl p-4 flex items-start space-x-3 hover:bg-[#272e3f] transition-all">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Leaderboard Profile</h4>
              <p className="text-[11px] text-gray-400">View your stats and rank from your profile.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#212735]/80 border border-white/10 rounded-xl p-4 flex items-start space-x-3 hover:bg-[#272e3f] transition-all">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Discord Kit</h4>
              <p className="text-[11px] text-gray-400">Receive an in-game kit for linking your Discord.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#212735]/80 border border-white/10 rounded-xl p-4 flex items-start space-x-3 hover:bg-[#272e3f] transition-all">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Verified Role</h4>
              <p className="text-[11px] text-gray-400">Get the Verified role on the Discord server.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
