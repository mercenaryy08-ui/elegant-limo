import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Language } from '../lib/translations';

const STORAGE_KEY = 'elegant_limo_lang';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function readLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === 'en' || s === 'al' || s === 'de') return s;
  } catch {}
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    setLanguageState(readLanguage());
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
