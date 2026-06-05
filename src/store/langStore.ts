import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en, te, hi } from '../i18n/translations';

type Language = 'en' | 'te' | 'hi';

interface LangState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, any>) => string;
}

const translations = {
  en,
  te,
  hi,
};

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      t: (key, variables) => {
        const { language } = get();
        const keys = key.split('.');
        let val: any = translations[language];
        for (const k of keys) {
          if (val && val[k]) {
            val = val[k];
          } else {
            val = null;
            break;
          }
        }
        
        // Fallback to English
        if (!val && language !== 'en') {
          val = translations['en'];
          for (const k of keys) {
            if (val && val[k]) {
              val = val[k];
            } else {
              val = null;
              break;
            }
          }
        }

        if (!val) return key;

        let str = val.toString();
        if (variables) {
          Object.keys(variables).forEach((varKey) => {
            str = str.replace(`{{${varKey}}}`, variables[varKey]);
          });
        }
        return str;
      },
    }),
    {
      name: 'safestay-lang-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
