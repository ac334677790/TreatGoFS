import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Language, UserSettings } from '../types/database.types';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const defaultLanguage: Language = 'zh';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: async () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load language from user settings
    const loadLanguage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('settings')
          .select('language')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && data.language) {
          setLanguageState(data.language as Language);
        }
      } catch (error) {
        console.error('Error loading language setting:', error);
      }
    };

    loadLanguage();
  }, []);

  useEffect(() => {
    // Load translations dynamically
    import('../lib/i18n').then(({ translations }) => {
      setTranslations(translations[language] || translations.zh);
    });
  }, [language]);

  const setLanguage = async (lang: Language) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update language in database
      const { data } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        await supabase
          .from('settings')
          .update({ language: lang, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('settings')
          .insert([{ user_id: user.id, language: lang }]);
      }

      setLanguageState(lang);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, String(value));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};