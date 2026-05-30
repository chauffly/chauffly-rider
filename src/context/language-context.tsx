import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import { translations, languages, LanguageCode } from '@/locales';

const LANGUAGE_STORAGE_KEY = '@chauffly/language';

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

interface LanguageContextType {
  t: (key: string, options?: Record<string, string | number>) => string;
  currentLanguage: LanguageCode;
  changeLanguage: (language: LanguageCode) => void;
  languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage as LanguageCode);
        i18n.locale = savedLanguage;
      } else {
        // Use device locale if available and supported
        const deviceLocale = Localization.getLocales()[0]?.languageCode;
        if (deviceLocale && Object.keys(translations).includes(deviceLocale)) {
          setCurrentLanguage(deviceLocale as LanguageCode);
          i18n.locale = deviceLocale;
        }
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveLanguage = async (language: LanguageCode) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const changeLanguage = useCallback((language: LanguageCode) => {
    setCurrentLanguage(language);
    i18n.locale = language;
    saveLanguage(language);
  }, []);

  const t = useCallback(
    (key: string, options?: Record<string, string | number>) => {
      return i18n.t(key, options);
    },
    [currentLanguage]
  );

  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        t,
        currentLanguage,
        changeLanguage,
        languages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}
