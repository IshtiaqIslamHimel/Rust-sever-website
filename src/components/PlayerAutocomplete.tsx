import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Search, UserRound } from 'lucide-react';
import { PlayerProfile } from '../types';
import { apiUrl } from '../config/runtime';

interface PlayerAutocompleteProps {
  label: string;
  value: string;
  required?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onSelect: (player: PlayerProfile) => void;
}

export const PlayerAutocomplete: React.FC<PlayerAutocompleteProps> = ({ label, value, required, placeholder, onChange, onSelect }) => {
  const [results, setResults] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2 || !open) { setResults([]); setLoading(false); return; }
    const currentRequest = ++requestId.current;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl(`/api/leaderboard?search=${encodeURIComponent(query)}`), { signal: controller.signal });
        const data = response.ok ? await response.json() : { players: [] };
        if (currentRequest === requestId.current) setResults((data.players || []).slice(0, 6));
      } catch (error) {
        if ((error as Error).name !== 'AbortError' && currentRequest === requestId.current) setResults([]);
      } finally { if (currentRequest === requestId.current) setLoading(false); }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [value, open]);

  return <label className="relative block text-sm font-bold text-[#F2EEE8]">{label}
    <div className="relative mt-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A837A]" /><input required={required} autoComplete="off" value={value} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 150)} onChange={e => { onChange(e.target.value); setOpen(true); }} placeholder={placeholder || 'Type at least 2 characters'} className="w-full rounded-lg border border-[#48453F] bg-[#1A1A17] py-3 pl-10 pr-10 text-sm text-white outline-none focus:border-[#B28A46]" />{loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#B28A46]" />}</div>
    {open && value.trim().length >= 2 && <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[#48453F] bg-[#11110F] p-1 shadow-2xl">
      {!loading && results.length === 0 ? <p className="p-3 text-xs font-normal text-[#8A837A]">No server player found.</p> : results.map(player => <button key={player.id} type="button" onMouseDown={e => e.preventDefault()} onClick={() => { onSelect(player); setOpen(false); setResults([]); }} className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-[#20201D]">
        {player.avatar ? <img src={player.avatar} alt="" className="h-9 w-9 rounded-md object-cover" /> : <UserRound className="h-9 w-9 rounded-md bg-[#20201D] p-2 text-[#8A837A]" />}<span className="min-w-0"><span className="block truncate text-sm font-bold text-[#F2EEE8]">{player.name}</span><span className="block font-mono text-[10px] font-normal text-[#8A837A]">{player.steamId} · Rank #{player.rank}</span></span>
      </button>)}
    </div>}
  </label>;
};
