import React, { useEffect, useState } from 'react';
import { Cookie, FileText, LockKeyhole, X } from 'lucide-react';

export type LegalSection = 'terms' | 'privacy' | 'cookies';

interface LegalModalProps {
  section: LegalSection | null;
  onClose: () => void;
}

const policyContent = {
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    sections: [
      ['Acceptance', 'By accessing this website, joining a SEAB3X server, or using community services, you agree to these terms and the published server rules. If you do not agree, do not use the services.'],
      ['Player conduct', 'You must follow the Discord, gameplay, and anti-cheat rules. Cheating, exploiting, harassment, evading enforcement, or disrupting the service may result in restrictions, suspension, or a permanent ban.'],
      ['Accounts and access', 'You are responsible for activity associated with your Steam or Discord account. Access is provided at our discretion and may be limited to protect players, staff, or service security.'],
      ['Service availability', 'Servers, statistics, maps, schedules, and website features may change, restart, wipe, or become unavailable without notice. We do not guarantee uninterrupted or error-free operation.'],
      ['Third-party services', 'Steam, Discord, BattleMetrics, RustMaps, and other linked services operate under their own terms and privacy policies. SEAB3X is not responsible for third-party availability or content.'],
      ['Disclaimer', 'The services are provided “as is” to the extent permitted by law. SEAB3X is not affiliated with Facepunch Studios or Valve Corporation.'],
      ['Changes', 'We may update these terms when the service or community rules change. Continued use after an update means you accept the revised terms.']
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    icon: LockKeyhole,
    sections: [
      ['Information we process', 'We may process Steam IDs, public Steam profile details, Discord identifiers, server activity, gameplay statistics, moderation records, IP-derived security data, and technical logs needed to operate and protect the service.'],
      ['How information is used', 'Information is used for account linking, leaderboards, server administration, anti-cheat review, appeals, security, troubleshooting, and improving website and server reliability.'],
      ['Sharing', 'We do not sell personal information. Data may be handled by infrastructure and integration providers when required to run the service, comply with law, prevent abuse, or protect the community.'],
      ['Retention', 'We retain information only as long as reasonably necessary for operations, security, moderation, dispute resolution, and legal obligations. Retention periods vary by data type.'],
      ['Your choices', 'You may disconnect linked services where that option is available and request help through a Discord support ticket. Some records may need to be retained for security, enforcement, or legal reasons.'],
      ['Security and minors', 'We use reasonable safeguards, but no online system is completely secure. Users must meet the age requirements of Rust, Steam, Discord, and applicable local law.'],
      ['Updates', 'We may revise this policy as integrations or legal requirements change. The current version is available from the website footer.']
    ]
  }
} as const;

export const LegalModal: React.FC<LegalModalProps> = ({ section, onClose }) => {
  const [analytics, setAnalytics] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (section !== 'cookies') return;
    try {
      const stored = JSON.parse(localStorage.getItem('seab2x-cookie-preferences') || '{}');
      setAnalytics(Boolean(stored.analytics));
      setPreferences(Boolean(stored.preferences));
    } catch {
      setAnalytics(false);
      setPreferences(false);
    }
    setSaved(false);
  }, [section]);

  useEffect(() => {
    if (!section) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [section, onClose]);

  if (!section) return null;

  const saveCookies = (nextAnalytics = analytics, nextPreferences = preferences) => {
    localStorage.setItem('seab2x-cookie-preferences', JSON.stringify({
      necessary: true,
      analytics: nextAnalytics,
      preferences: nextPreferences,
      updatedAt: new Date().toISOString()
    }));
    setAnalytics(nextAnalytics);
    setPreferences(nextPreferences);
    setSaved(true);
  };

  const content = section === 'cookies' ? null : policyContent[section];
  const Icon = section === 'cookies' ? Cookie : content!.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={section === 'cookies' ? 'Cookie Preferences' : content!.title} className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[20px] border border-[#2E2D2A] bg-[#11110F] text-left shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[#2E2D2A] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B28A46]/15"><Icon className="h-5 w-5 text-[#B28A46]" /></div>
          <div><h2 className="text-xl font-black text-[#F2EEE8]">{section === 'cookies' ? 'Cookie Preferences' : content!.title}</h2><p className="text-[11px] text-[#8A837A]">Last updated: August 6, 2026</p></div>
          <button onClick={onClose} aria-label="Close" className="ml-auto cursor-pointer rounded-lg border border-[#2E2D2A] bg-[#1A1A17] p-2 text-[#8A837A] hover:text-[#F2EEE8]"><X className="h-4 w-4" /></button>
        </div>

        <div className="max-h-[calc(85vh-90px)] overflow-y-auto p-5">
          {content ? (
            <div className="space-y-5">
              {content.sections.map(([heading, body]) => <section key={heading}><h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#B28A46]">{heading}</h3><p className="text-sm leading-relaxed text-[#BEB4A8]">{body}</p></section>)}
            </div>
          ) : (
            <div>
              <p className="mb-5 text-sm leading-relaxed text-[#BEB4A8]">Choose which optional browser storage categories SEAB3X may use. Necessary storage cannot be disabled because it supports security and your saved consent choice.</p>
              <div className="space-y-3">
                <PreferenceRow title="Necessary" description="Required for security, core features, and remembering this choice." enabled disabled onChange={() => {}} />
                <PreferenceRow title="Preferences" description="Remembers optional display and interface settings." enabled={preferences} onChange={setPreferences} />
                <PreferenceRow title="Analytics" description="Allows anonymous usage measurement to improve the website." enabled={analytics} onChange={setAnalytics} />
              </div>
              {saved && <p className="mt-3 text-xs font-bold text-[#4B7050]">Your cookie preferences have been saved.</p>}
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button onClick={() => saveCookies(false, false)} className="cursor-pointer rounded-xl border border-[#48453F] px-4 py-2 text-xs font-bold text-[#BEB4A8] hover:text-white">Reject optional</button>
                <button onClick={() => saveCookies(true, true)} className="cursor-pointer rounded-xl border border-[#B28A46] px-4 py-2 text-xs font-bold text-[#B28A46]">Accept all</button>
                <button onClick={() => saveCookies()} className="cursor-pointer rounded-xl bg-[#B28A46] px-4 py-2 text-xs font-black text-[#111111] hover:bg-[#C69A4D]">Save choices</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PreferenceRow: React.FC<{ title: string; description: string; enabled: boolean; disabled?: boolean; onChange: (enabled: boolean) => void }> = ({ title, description, enabled, disabled, onChange }) => (
  <label className="flex items-center gap-4 rounded-xl border border-[#2E2D2A] bg-[#1A1A17] p-4">
    <span className="flex-1"><strong className="block text-sm text-[#F2EEE8]">{title}</strong><span className="text-xs text-[#8A837A]">{description}</span></span>
    <input type="checkbox" checked={enabled} disabled={disabled} onChange={event => onChange(event.target.checked)} className="h-4 w-4 accent-[#B28A46]" />
  </label>
);
