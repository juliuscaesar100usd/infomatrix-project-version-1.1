import { createContext, useContext, useState, useCallback } from 'react';
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import kz from '../locales/kz.json';

const locales = { en, ru, kz };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    localStorage.getItem('nutrimind_lang') || 'en'
  );

  const setLanguage = useCallback((lang) => {
    if (locales[lang]) {
      setLanguageState(lang);
      localStorage.setItem('nutrimind_lang', lang);
    }
  }, []);

  /**
   * Get a translation by dot-notation key, e.g., "nav.home"
   */
  const t = useCallback(
    (key) => {
      const keys = key.split('.');
      let value = locales[language];
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          return key; // Fallback to key
        }
      }
      return value || key;
    },
    [language]
  );

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
