export type Language = 'en' | 'zh' | 'cn';

export type Chapter = {
  id: number;
  title: string;
  seed?: string;
  created_at: string;
};

export type Section = {
  id: number;
  chapter_id: number;
  title: string;
  seed?: string;
  unlocked: boolean;
  total_words: number;
  learned_words: number;
  created_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  language: Language;
  sound_enabled: boolean;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
};