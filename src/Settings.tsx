import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { Advertisement } from '../components/Advertisement';
import { Language } from '../types/database.types';
import { Check } from 'lucide-react';

export function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const { settings, updateSettings, loading } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
  };

  const handleToggleSetting = async (setting: 'sound_enabled' | 'dark_mode') => {
    await updateSettings({ [setting]: !settings[setting] });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Settings are saved immediately when changed, so this is just for UI feedback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Reordered language list to put Chinese first
  const languages: { code: Language; name: string }[] = [
    { code: 'zh', name: '繁體中文' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="md:hidden flex justify-center mb-6">
        <Logo size="md" />
      </div>
      
      <h1 className="text-3xl font-bold text-center md:text-left mb-8 text-amber-500">{t('settings')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Language Settings */}
          <div className="bg-stone-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">{t('language')}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-3 rounded-lg flex items-center justify-center ${
                    language === lang.code 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                  } transition-colors`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sound Settings */}
          <div className="bg-stone-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">{t('sound')}</h2>
            <button
              onClick={() => handleToggleSetting('sound_enabled')}
              className="w-full flex items-center justify-between p-3 bg-stone-700 rounded-lg hover:bg-stone-600 transition-colors"
            >
              <span>{t('sound')}</span>
              <div className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                settings.sound_enabled ? 'bg-amber-600 justify-end' : 'bg-stone-600 justify-start'
              }`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-md m-0.5"></div>
              </div>
            </button>
          </div>
          
          {/* Dark Mode Settings */}
          <div className="bg-stone-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">{t('dark_mode')}</h2>
            <button
              onClick={() => handleToggleSetting('dark_mode')}
              className="w-full flex items-center justify-between p-3 bg-stone-700 rounded-lg hover:bg-stone-600 transition-colors"
            >
              <span>{t('dark_mode')}</span>
              <div className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                settings.dark_mode ? 'bg-amber-600 justify-end' : 'bg-stone-600 justify-start'
              }`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-md m-0.5"></div>
              </div>
            </button>
          </div>
          
          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('save_settings')}
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                {t('settings_saved')}
              </>
            ) : (
              t('save_settings')
            )}
          </button>
        </div>
        
        <div className="md:col-span-1 space-y-6">
          <Advertisement />
          <Advertisement />
        </div>
      </div>
    </div>
  );
}