import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { getPreferencias, savePreferencias } from '../services/profileApi';
import { readInitialLang, STORAGE_KEY, type AppLang } from './languageUtils';
import { LanguageContext } from './languageContextObject';

// LanguageContext and its value type live in languageContextObject.ts

// helpers moved to languageUtils.ts

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSyncing(true);
    getPreferencias()
      .then((p) => {
        if (cancelled) return;
        if (p?.idioma && (p.idioma === 'es' || p.idioma === 'en' || p.idioma === 'fr')) {
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

// `useLanguage` moved to `src/context/useLanguage.ts`
