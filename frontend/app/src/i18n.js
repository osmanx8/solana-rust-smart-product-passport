import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import uk from './locales/uk.json';
import { getInitialLanguage } from './utils/languageUtils';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    debug: false,
    
    // Налаштування детектора мови
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupSessionStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      
      // Ключі для збереження
      cookieExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      cookieSecure: false,
      cookieDomain: 'myDomain',
      cookiePath: '/',
      cookieSameSite: 'strict',
      
      // Налаштування для localStorage
      localStorageExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    // Налаштування для збереження мови при зміні
    react: {
      useSuspense: false,
    },
  });

// Слухаємо зміни мови та зберігаємо в localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n; 