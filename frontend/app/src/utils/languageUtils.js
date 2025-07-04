// Утиліти для роботи з мовами

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'uk', label: 'UA', name: 'Українська' }
];

// Отримати поточну мову з localStorage або визначити мову браузера
export const getInitialLanguage = () => {
  // Спочатку перевіряємо localStorage
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
    return savedLanguage;
  }

  // Якщо немає збереженої мови, визначаємо мову браузера
  const browserLanguage = navigator.language || navigator.userLanguage;
  
  // Перевіряємо українську мову
  if (browserLanguage.startsWith('uk') || browserLanguage.startsWith('ua')) {
    return 'uk';
  }
  
  // За замовчуванням англійська
  return 'en';
};

// Зберегти мову в localStorage
export const saveLanguage = (languageCode) => {
  if (SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode)) {
    localStorage.setItem('i18nextLng', languageCode);
  }
};

// Отримати об'єкт мови за кодом
export const getLanguageByCode = (code) => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
};

// Перевірити, чи підтримується мова
export const isLanguageSupported = (code) => {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
};

// Отримати мову браузера
export const getBrowserLanguage = () => {
  const browserLanguage = navigator.language || navigator.userLanguage;
  return browserLanguage.toLowerCase();
};

// Визначити мову на основі мови браузера
export const detectLanguageFromBrowser = () => {
  const browserLang = getBrowserLanguage();
  
  if (browserLang.startsWith('uk') || browserLang.startsWith('ua')) {
    return 'uk';
  }
  
  return 'en';
}; 