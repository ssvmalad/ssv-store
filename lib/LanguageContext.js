"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [mounted, setMounted] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState(translations);

  useEffect(() => {
    const savedLang = localStorage.getItem('ssv_lang') || 'en';
    setLang(savedLang);
    
    // Fetch dynamic translations
    fetch('/api/translations')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setDynamicTranslations(data);
        }
      })
      .catch(err => console.error("Failed to load dynamic translations:", err))
      .finally(() => {
        setMounted(true);
      });
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('ssv_lang', newLang);
  };

  const t = (key) => {
    return dynamicTranslations[lang]?.[key] || dynamicTranslations['en']?.[key] || translations[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, mounted, dynamicTranslations, setDynamicTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      changeLanguage: () => {},
      t: (key) => translations['en']?.[key] || key,
      mounted: false
    };
  }
  return context;
}
