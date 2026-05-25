export type AppLang = 'es' | 'en' | 'fr';

export const STORAGE_KEY = 'wc2026_lang';

export function readInitialLang(): AppLang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en' || stored === 'fr') return stored;
  } catch {
    // ignore
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'es') || 'es';
  if (nav.toLowerCase().startsWith('fr')) return 'fr';
  return nav.toLowerCase().startsWith('en') ? 'en' : 'es';
}
