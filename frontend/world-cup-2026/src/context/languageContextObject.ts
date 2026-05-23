import { createContext } from 'react';
import type { AppLang } from './languageUtils';

export interface LanguageContextValue {
  lang: AppLang;
  setLang: (l: AppLang) => Promise<void>;
  toggle: () => Promise<void>;
  syncing: boolean;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
