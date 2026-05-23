import { useContext } from 'react';
import { LanguageContext } from './languageContextObject';
import type { LanguageContextValue } from './languageContextObject';

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
