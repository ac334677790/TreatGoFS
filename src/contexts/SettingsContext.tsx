import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserSettings } from '../types/database.types';

type SettingsContextType = {
  settings: Partial<UserSettings>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  loading: boolean;
};

const defaultSettings: Partial<UserSettings> = {
  sound_enabled: true,
  dark_mode: true,
  language: 'zh'
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: false
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Partial<UserSettings>>(defaultSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading settings:', error);
          return;
        }

        if (data) {
          setSettings(data);
        } else {
          // Create default settings
          const { data: newSettings, error: insertError } = await supabase
            .from('settings')
            .insert([{ 
              user_id: user.id,
              ...defaultSettings
            }])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating settings:', insertError);
          } else if (newSettings) {
            setSettings(newSettings);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedSettings = { ...settings, ...newSettings, updated_at: new Date().toISOString() };
      
      const { error } = await supabase
        .from('settings')
        .update(updatedSettings)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};