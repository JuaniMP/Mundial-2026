import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { getPreferencias, savePreferencias } from '../services/profileApi';

export type AppLang = 'es' | 'en';

interface LanguageContextValue {
  lang: AppLang;
  setLang: (l: AppLang) => Promise<void>;
  toggle: () => Promise<void>;
  syncing: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'wc2026_lang';

function readInitialLang(): AppLang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'es') || 'es';
  return nav.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [lang, setLangState] = useState<AppLang>(readInitialLang);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang, i18n]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setSyncing(true);
    getPreferencias()
      .then((p) => {
        if (cancelled) return;
        if (p?.idioma && (p.idioma === 'es' || p.idioma === 'en')) {
          setLangState(p.idioma);
        }
      })
      .catch(() => {
        // user may not have prefs yet; silent
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setLang = useCallback(
    async (l: AppLang) => {
      setLangState(l);
      if (user) {
        try {
          setSyncing(true);
          await savePreferencias({ idioma: l });
        } catch {
          // keep local change even if backend save fails
        } finally {
          setSyncing(false);
        }
      }
    },
    [user],
  );

  const toggle = useCallback(async () => {
    await setLang(lang === 'es' ? 'en' : 'es');
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, syncing }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
