import React, { FormEvent, useState } from 'react';
import { ExternalLink, Flag, MessageCircle, ShieldAlert } from 'lucide-react';
import { PlayerProfile } from '../types';
import { PlayerAutocomplete } from './PlayerAutocomplete';

const initialForm = { type: 'Player Report', title: '', reporter: '', steamId: '', reportedPlayer: '', reportedSteamId: '', reason: 'Cheating', description: '', evidence: '' };

export const ReportView: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submitReport = (event: FormEvent) => {
    event.preventDefault();
    setMessage('This report service is currently under development and unavailable. Please contact staff through Discord.');
  };

  const field = 'mt-2 w-full rounded-lg border border-[#48453F] bg-[#1A1A17] p-3 text-sm text-white outline-none focus:border-[#B28A46]';
  return <section className="relative z-10 mx-auto w-full max-w-3xl px-4 py-10 sm:py-16"><div className="rounded-2xl border border-[#2E2D2A] bg-[#11110F]/95 p-5 shadow-2xl sm:p-8">
    <div className="mb-7 flex items-start gap-3"><div className="rounded-xl bg-[#8A2F2F]/20 p-3"><Flag className="h-6 w-6 text-[#C96B3D]" /></div><div><h1 className="text-3xl font-black text-[#F2EEE8]">Submit a Staff Ticket</h1><p className="mt-2 text-sm text-[#BEB4A8]">Prepare your report details below. Direct ticket submission is currently under development.</p></div></div>
    <form onSubmit={submitReport} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-[#F2EEE8]">Ticket type<select value={form.type} onChange={e => { const type = e.target.value; setForm(current => ({ ...current, type, reportedPlayer: type === 'Bug Report' ? '' : current.reportedPlayer, reportedSteamId: type === 'Bug Report' ? '' : current.reportedSteamId })); }} className={field}><option>Player Report</option><option>Bug Report</option></select></label><label className="text-sm font-bold text-[#F2EEE8]">Reason<select value={form.reason} onChange={e => update('reason', e.target.value)} className={field}><option>Cheating</option><option>Bug</option><option>Exploit</option><option>Player misconduct</option><option>Other</option></select></label></div>
      <label className="block text-sm font-bold text-[#F2EEE8]">Title<input required maxLength={100} value={form.title} onChange={e => update('title', e.target.value)} placeholder="Short summary of the report" className={field} /></label>
      <PlayerAutocomplete label="Your in-game name" required value={form.reporter} onChange={value => { update('reporter', value); update('steamId', ''); }} onSelect={(player: PlayerProfile) => { update('reporter', player.name); update('steamId', player.steamId); }} />
      <div className="rounded-lg border border-[#2E2D2A] bg-[#1A1A17]/60 px-3 py-2 text-xs text-[#8A837A]">Reporter Steam ID: <span className="font-mono text-[#B28A46]">{form.steamId || 'Select your player profile above'}</span></div>
      {form.type === 'Player Report' && <><PlayerAutocomplete label="Reported in-game player" required value={form.reportedPlayer} onChange={value => { update('reportedPlayer', value); update('reportedSteamId', ''); }} onSelect={(player: PlayerProfile) => { update('reportedPlayer', player.name); update('reportedSteamId', player.steamId); }} /><div className="rounded-lg border border-[#2E2D2A] bg-[#1A1A17]/60 px-3 py-2 text-xs text-[#8A837A]">Reported Steam ID: <span className="font-mono text-[#B28A46]">{form.reportedSteamId || 'Select the reported player above'}</span></div></>}
      <label className="block text-sm font-bold text-[#F2EEE8]">Description<textarea required maxLength={3500} value={form.description} onChange={e => update('description', e.target.value)} rows={6} placeholder="Include the server, approximate time, location, and what happened." className={`${field} resize-y`} /></label>
      <label className="block text-sm font-bold text-[#F2EEE8]">Evidence URL<input type="url" maxLength={1000} value={form.evidence} onChange={e => update('evidence', e.target.value)} placeholder="Optional video or screenshot link" className={field} /></label>
      <div className="flex flex-col gap-3 sm:flex-row"><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B28A46] px-5 py-3 text-sm font-black text-[#11110F] hover:bg-[#C69A4D]"><Flag className="h-4 w-4" />Submit private ticket</button><a href="https://discord.gg/FgvP3dmzRH" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5865F2] bg-[#5865F2]/15 px-5 py-3 text-sm font-black text-[#AEB4FF] hover:bg-[#5865F2]/25"><MessageCircle className="h-4 w-4" />Discord<ExternalLink className="h-3.5 w-3.5" /></a></div>
      {message && <div role="status" className="flex gap-2 rounded-lg border border-[#8A2F2F] bg-[#8A2F2F]/10 p-3 text-sm text-[#E28B72]"><ShieldAlert className="h-5 w-5 shrink-0" />{message}</div>}
    </form><p className="mt-6 flex gap-2 border-t border-[#2E2D2A] pt-5 text-xs text-[#8A837A]"><ShieldAlert className="h-4 w-4 shrink-0 text-[#B28A46]" /> Never include passwords, authentication codes, or other private information.</p>
  </div></section>;
};
