import React, { useState } from 'react';
import { NavTab } from '../types';
import { LegalModal, LegalSection } from './LegalModal';

interface FooterProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenRules: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenRules }) => {
  const [legalSection, setLegalSection] = useState<LegalSection | null>(null);

  return (
    <>
    <footer className="relative z-10 w-full py-8 px-4 mt-auto text-center text-xs text-gray-400 select-none">
      <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
        <a 
          href="https://discord.gg/FgvP3dmzRH"
          target="_blank" 
          rel="noreferrer"
          className="hover:text-white transition-colors flex items-center space-x-1"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
          </svg>
          <span>Discord</span>
        </a>
        <span>•</span>
        <button onClick={onOpenRules} className="hover:text-white transition-colors cursor-pointer">
          Rules
        </button>
        <span>•</span>
        <button onClick={() => setLegalSection('terms')} className="hover:text-white transition-colors cursor-pointer">
          Terms
        </button>
        <span>•</span>
        <button onClick={() => setLegalSection('privacy')} className="hover:text-white transition-colors cursor-pointer">
          Privacy
        </button>
        <span>•</span>
        <button onClick={() => setLegalSection('cookies')} className="hover:text-white transition-colors cursor-pointer">
          Cookie Preferences
        </button>
      </div>

      <p className="text-[11px] text-gray-400">
        © 2026 SEAB3X. All rights reserved. Not affiliated with Facepunch Studios.
      </p>
    </footer>
    <LegalModal section={legalSection} onClose={() => setLegalSection(null)} />
    </>
  );
};
