import React from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    { num: 1, title: 'No Hacking, Cheating or Scripting', desc: 'Any recoil scripts, ESP, aimbots, or third-party memory injection software will result in a permanent hardware ban across all SEAB3X servers.' },
    { num: 2, title: 'Group Size Limits', desc: 'Respect server team caps (Solo/Duo/Trio or Max 5). Roaming, raiding, or living together beyond the group limit is strictly prohibited.' },
    { num: 3, title: 'No Hate Speech or Harassment', desc: 'Racism, hate speech, dox threats, and extreme toxicity in voice/text chat will lead to muting or temporary bans.' },
    { num: 4, title: 'No Bug Exploiting', desc: 'Exploiting map terrain bugs, bunker glitches, or duplication bugs is forbidden.' },
    { num: 5, title: 'Respect Active Admins', desc: 'SEAB3X admins monitor non-playing spec cams. Follow admin instructions at all times.' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#11110F] border border-[#2E2D2A] rounded-[20px] max-w-xl w-full p-6 card-shadow-lg relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A837A] hover:text-[#F2EEE8] p-1 rounded-[8px] bg-[#1A1A17] border border-[#2E2D2A] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-[#F2EEE8] mb-1 flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-[#8A2F2F]" />
          <span>SEAB3X Rust Server Rules</span>
        </h2>
        <p className="text-xs text-[#8A837A] mb-6">
          By playing on SEAB3X servers, you agree to adhere strictly to these rules.
        </p>

        <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
          {rules.map((r) => (
            <div key={r.num} className="bg-[#1A1A17] p-3.5 rounded-[12px] border border-[#2E2D2A] flex items-start space-x-3">
              <span className="w-6 h-6 rounded-[6px] bg-[#B28A46]/20 text-[#B28A46] font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {r.num}
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#F2EEE8] mb-0.5">{r.title}</h4>
                <p className="text-[11px] text-[#BEB4A8] leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
