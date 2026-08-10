import { useEffect } from 'react';

export type SeoPage = 'home' | 'servers' | 'leaderboard' | 'rules' | 'faq' | 'report' | 'store' | 'link';

const siteName = '[SEA] BEGINNERS 3X';
const pageSeo: Record<SeoPage, { title: string; description: string; label: string }> = {
  home: { title: '[SEA] BEGINNERS 3X | Beginner-Friendly Rust Server Asia', description: 'Join [SEA] BEGINNERS 3X, a beginner-friendly Rust 3x server in Asia with Friday map wipes and first-Friday blueprint wipes, Team UI, kits, and low ping.', label: 'Home' },
  servers: { title: 'Rust Server Connect & Map | [SEA] BEGINNERS 3X', description: 'Connect to [SEA] BEGINNERS 3X, a low-ping SEA Rust server with live player status, map details, Friday weekly wipes, and beginner-friendly 3x gameplay.', label: 'Server' },
  leaderboard: { title: 'Rust Leaderboard | [SEA] BEGINNERS 3X', description: 'View live PvP, PvE, raiding, farming, economy, and activity statistics for players on the [SEA] BEGINNERS 3X Rust server.', label: 'Leaderboard' },
  rules: { title: 'Rust Server Rules | [SEA] BEGINNERS 3X', description: 'Read the Discord, anti-cheat, gameplay, and appeals rules for the [SEA] BEGINNERS 3X beginner Rust server community.', label: 'Rules' },
  faq: { title: 'Rust Server FAQ | [SEA] BEGINNERS 3X', description: 'Get answers about [SEA] BEGINNERS 3X, Rust weekly wipes, shared blueprints, Team UI, beginner-friendly gameplay, and low ping from Asia.', label: 'FAQ' },
  report: { title: 'Report a Player or Bug | [SEA] BEGINNERS 3X', description: 'Report cheating, bugs, exploits, or player misconduct to the [SEA] BEGINNERS 3X Rust server staff team.', label: 'Report' },
  store: { title: 'Rust Kits & Shop | [SEA] BEGINNERS 3X', description: 'Explore available kits and shop packages for the [SEA] BEGINNERS 3X Rust 3x server.', label: 'Webstore' },
  link: { title: 'Link Steam & Discord | [SEA] BEGINNERS 3X', description: 'Link your Steam and Discord accounts to the [SEA] BEGINNERS 3X Rust server community.', label: 'Account Links' }
};

export function SeoHead({ page }: { page: SeoPage }) {
  useEffect(() => {
    const seo = pageSeo[page];
    const origin = window.location.origin;
    const canonical = `${origin}${window.location.pathname}`;
    document.title = seo.title;

    const setMeta = (selector: string, attribute: 'name' | 'property', value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, selector.includes('property=') ? selector.split('"')[1] : selector.split('"')[1]);
        document.head.appendChild(element);
      }
      element.content = value;
    };
    setMeta('meta[name="description"]', 'name', seo.description);
    setMeta('meta[name="robots"]', 'name', 'index, follow');
    setMeta('meta[property="og:type"]', 'property', 'website');
    setMeta('meta[property="og:site_name"]', 'property', siteName);
    setMeta('meta[property="og:title"]', 'property', seo.title);
    setMeta('meta[property="og:description"]', 'property', seo.description);
    setMeta('meta[property="og:url"]', 'property', canonical);
    setMeta('meta[property="og:image"]', 'property', 'https://i.imgur.com/AaXCQB8.png');
    setMeta('meta[name="twitter:card"]', 'name', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', seo.title);
    setMeta('meta[name="twitter:description"]', 'name', seo.description);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) { canonicalLink = document.createElement('link'); canonicalLink.rel = 'canonical'; document.head.appendChild(canonicalLink); }
    canonicalLink.href = canonical;

    let schema = document.head.querySelector<HTMLScriptElement>('#seo-jsonld');
    if (!schema) { schema = document.createElement('script'); schema.id = 'seo-jsonld'; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', '@id': `${origin}/#website`, url: origin, name: siteName, description: pageSeo.home.description, inLanguage: 'en' },
        { '@type': 'Organization', '@id': `${origin}/#organization`, name: siteName, url: origin, description: 'A beginner-friendly 3x Rust server for Asia and SEA players.' },
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: origin }, { '@type': 'ListItem', position: 2, name: seo.label, item: canonical }] }
      ]
    });
  }, [page]);

  return null;
}
