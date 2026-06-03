'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { type Locale } from '@/lib/types';
import { getTranslations, type TranslationKey } from '@/lib/translations';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: TranslationKey;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const STORAGE_KEY = 'yan-locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');

  // Read locale from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === 'es' || stored === 'en') {
      setLocaleState(stored);
    }
  }, []);

  // Persist locale and update <html lang>
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'es' ? 'en' : 'es'));
  }, []);

  const t = getTranslations(locale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return ctx;
}
