import React from 'react';
import { AlertTriangle, Gavel, MessageCircle, ShieldAlert } from 'lucide-react';

const discordRules = [
  'Do not spam unnecessary things.',
  'Do not self-advertise via mutual-member private messages.',
  'Respect admins and other Discord staff; they are here to help you.',
  "Do not advertise other Rust servers in our Discord. You'll be banned.",
  'Do not post pornography, nudity, or NSFW content in any channel.',
  'Do not post Discord invite links. This will result in a Discord chat mute.'
];

const antiCheatRules = [
  'Playing with or helping known cheaters is not allowed.',
  'Cheats, ESP, aimbot, or modified game files are not allowed.',
  'Accounts with recent VAC or game bans may be restricted from joining.',
  'Exploiting bugs or game-breaking issues for an unfair advantage is not allowed.',
  'Players caught cheating while active on the server will receive a permanent ban.',
  'Recoil scripts, macros, rapid-fire tools, or automation software are considered cheating.'
];

const RuleList: React.FC<{ rules: string[] }> = ({ rules }) => (
  <ul className="space-y-2.5">
    {rules.map((rule) => (
      <li key={rule} className="flex gap-3 text-sm leading-relaxed text-[#BEB4A8]">
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B28A46]" />
        <span>{rule}</span>
      </li>
    ))}
  </ul>
);

export const RulesView: React.FC = () => (
  <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 select-none">
    <div className="relative mb-6 overflow-hidden rounded-[20px] border border-[#2E2D2A] bg-[#11110F] p-6 shadow-2xl">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#B28A46]/10 blur-3xl" />
      <div className="relative">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#B28A46]/30 bg-[#B28A46]/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#B28A46]">
          <ShieldAlert className="h-3.5 w-3.5" /> Community guidelines
        </span>
        <h1 className="text-3xl font-black tracking-tight text-[#F2EEE8] sm:text-4xl">Server Rules</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#BEB4A8]">Play fair, respect the community, and help keep SEAB3X enjoyable for everyone.</p>
      </div>
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-[18px] border border-[#2E2D2A] bg-[#11110F] p-5 shadow-xl">
        <div className="mb-4 flex items-center gap-3 border-b border-[#2E2D2A] pb-4">
          <MessageCircle className="h-5 w-5 text-[#B28A46]" />
          <h2 className="text-sm font-black uppercase tracking-wider text-[#F2EEE8]">Discord Server Rules</h2>
        </div>
        <RuleList rules={discordRules} />
      </section>

      <section className="rounded-[18px] border border-[#2E2D2A] bg-[#11110F] p-5 shadow-xl">
        <div className="mb-2 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[#8A2F2F]" />
          <h2 className="text-sm font-black uppercase tracking-wider text-[#F2EEE8]">Anti-Cheat Rules</h2>
        </div>
        <p className="mb-4 border-b border-[#2E2D2A] pb-4 text-xs font-medium text-[#8A837A]">Fair gameplay is required for everyone.</p>
        <RuleList rules={antiCheatRules} />
      </section>
    </div>

    <section className="mt-5 rounded-[18px] border border-[#2E2D2A] bg-[#1A1A17] p-5 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#B28A46]/30 bg-[#B28A46]/15">
          <Gavel className="h-5 w-5 text-[#B28A46]" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-[#F2EEE8]">Appeals</h2>
          <p className="mt-1 text-sm text-[#BEB4A8]">If you believe a punishment was incorrect, create a Discord ticket and include:</p>
          <ul className="mt-3 grid gap-2 text-xs text-[#BEB4A8] sm:grid-cols-3">
            {['Time of incident', 'In-game name and Steam ID', 'Brief explanation and video proof'].map(item => (
              <li key={item} className="rounded-lg border border-[#2E2D2A] bg-[#11110F] px-3 py-2.5">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  </div>
);
