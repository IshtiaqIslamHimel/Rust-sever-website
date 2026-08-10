import React, { useState, useEffect } from 'react';
import { Search, X, User, Server, ShoppingBag } from 'lucide-react';
import { PlayerProfile, RustServer, NavTab } from '../types';
import { apiUrl } from '../config/runtime';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: RustServer[];
  onSelectPlayer: (p: PlayerProfile) => void;
  setActiveTab: (tab: NavTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  servers,
  onSelectPlayer,
  setActiveTab
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerProfile[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(apiUrl(`/api/leaderboard?search=${encodeURIComponent(query)}`));
        if (res.ok) {
          const data = await res.json();
          setResults(data.players || []);
        }
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#11110F] border border-[#2E2D2A] rounded-[20px] max-w-xl w-full p-4 card-shadow-lg relative text-left">
        
        {/* Search Input Bar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-[#8A837A] absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Search players, Steam IDs, servers, store packages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#1A1A17] border border-[#2E2D2A] rounded-[12px] pl-10 pr-10 py-3 text-sm text-[#F2EEE8] placeholder-[#8A837A] focus:outline-none focus:border-[#B28A46]"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8A837A] hover:text-[#F2EEE8] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto space-y-2 no-scrollbar">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-[#8A837A]">
              Type a player name like <strong className="text-[#F2EEE8]">"Bdog"</strong> or server tag to search.
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8A837A]">
              No matching results found for "{query}".
            </div>
          ) : (
            results.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPlayer(p);
                  onClose();
                }}
                className="flex items-center justify-between bg-[#1A1A17] hover:bg-[#20201D] p-3 rounded-[12px] border border-[#2E2D2A] cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-[6px] object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-[#F2EEE8]">{p.name}</h4>
                    <span className="text-[10px] text-[#8A837A] font-mono">Rank #{p.rank} • {p.pvp.kills} Kills</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#B28A46] bg-[#B28A46]/10 px-2 py-1 rounded-[6px]">
                  View Profile
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
