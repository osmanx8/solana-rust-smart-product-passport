import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, saveLanguage, getLanguageByCode } from '../utils/languageUtils';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Синхронізуємо поточну мову з i18n
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  // Функція для зміни мови
  const changeLanguage = (languageCode) => {
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode)) {
      i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      saveLanguage(languageCode);
    }
  };

  // Отримати поточну мову як об'єкт
  const getCurrentLanguage = () => {
    return getLanguageByCode(currentLanguage);
  };

  // Перевірити, чи є поточна мова
  const isCurrentLanguage = (languageCode) => {
    return currentLanguage === languageCode;
  };

  // Отримати всі підтримувані мови
  const getSupportedLanguages = () => {
    return SUPPORTED_LANGUAGES;
  };

  return {
    currentLanguage,
    changeLanguage,
    getCurrentLanguage,
    isCurrentLanguage,
    getSupportedLanguages,
    t, // функція перекладу
  };
}; 