import en from './en.json';
import ha from './ha.json';
import ig from './ig.json';
import yo from './yo.json';

export const translations = {
  en,
  ha,
  ig,
  yo,
};

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
] as const;

export type LanguageCode = keyof typeof translations;
