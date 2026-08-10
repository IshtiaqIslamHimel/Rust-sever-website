import React from 'react';
import { ChevronDown, CircleHelp, ExternalLink } from 'lucide-react';
import { NavTab } from '../types';

interface FaqViewProps {
  setActiveTab: (tab: NavTab) => void;
}

const faqs = [
  { question: 'What is [SEA] BEGINNERS 3X?', answer: '[SEA] BEGINNERS 3X is a beginner-friendly Rust 3x server in Asia for casual solo, duo, trio, and small-group players, with low ping for SEA, Bangladesh, and India.' },
  { question: 'How do I join the server?', answer: 'Open the Server tab and select Direct Connect to launch Steam, or copy the displayed IP and use the Rust F1 console command.' },
  { question: 'When does the map wipe?', answer: 'The map wipes every Friday at 11:30 UTC. The Server tab automatically converts the next wipe to your local timezone.' },
  { question: 'When do blueprints wipe?', answer: 'Blueprints wipe on the first Friday of each month at 11:30 UTC. The Server tab automatically shows the next wipe in your local timezone.' },
  { question: 'How can I appeal a punishment?', answer: 'Create a Discord support ticket with the incident time, your in-game name and Steam ID, a brief explanation, and video proof when available.' },
  { question: 'What should I do if I suspect a cheater?', answer: 'Report the player privately to staff through Discord. Include the player name, approximate incident time, and any supporting video evidence.' },
  { question: 'Why does Steam ask for permission when I use Direct Connect?', answer: 'Browsers require confirmation before opening the Steam application through a steam:// link. Accept the prompt to continue.' }
];

export const FaqView: React.FC<FaqViewProps> = ({ setActiveTab }) => (
  <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-8 select-none">
    <div className="mb-6 rounded-[20px] border border-[#2E2D2A] bg-[#11110F] p-6 text-center shadow-2xl">
      <CircleHelp className="mx-auto mb-3 h-8 w-8 text-[#B28A46]" />
      <h1 className="text-3xl font-black tracking-tight text-[#F2EEE8] sm:text-4xl">Frequently Asked Questions</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[#BEB4A8]">Quick answers about joining, wipes, reports, and appeals.</p>
    </div>

    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <details key={faq.question} className="group rounded-[16px] border border-[#2E2D2A] bg-[#11110F] open:border-[#B28A46]/60 open:bg-[#1A1A17]">
          <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-sm font-bold text-[#F2EEE8] sm:p-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#B28A46]/15 text-xs font-black text-[#B28A46]">{index + 1}</span>
            <span className="flex-1">{faq.question}</span>
            <ChevronDown className="h-4 w-4 text-[#8A837A] transition-transform group-open:rotate-180" />
          </summary>
          <p className="border-t border-[#2E2D2A] px-5 py-4 pl-14 text-sm leading-relaxed text-[#BEB4A8]">{faq.answer}</p>
        </details>
      ))}
    </div>

    <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-[16px] border border-[#2E2D2A] bg-[#1A1A17] p-4 sm:flex-row">
      <p className="text-sm text-[#BEB4A8]">Need the complete community and anti-cheat policies?</p>
      <button onClick={() => setActiveTab('rules')} className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#B28A46] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#C69A4D]">
        Read rules <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
);
