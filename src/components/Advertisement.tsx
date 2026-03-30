import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function Advertisement() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-stone-800 p-4 rounded-lg border border-stone-700 text-center">
      <p className="text-xs text-stone-500 mb-2">{t('advertisement')}</p>
      <div className="bg-stone-700 h-32 flex items-center justify-center">
        <p className="text-stone-500">Ad Space</p>
      </div>
    </div>
  );
}