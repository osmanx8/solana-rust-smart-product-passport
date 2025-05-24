import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-gray-400">{t('language')}:</span>
      {['en', 'uk'].map((lng) => (
        <motion.button
          key={lng}
          whileHover={{ scale: 1.1, boxShadow: '0 0 8px #8b5cf6' }}
          whileTap={{ scale: 0.95 }}
          animate={{
            backgroundColor: i18n.language === lng ? 'var(--primary)' : 'var(--surface)',
            color: i18n.language === lng ? '#fff' : '#d1d5db',
          }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`px-2 py-1 rounded font-medium focus:outline-none focus:ring-2 focus:ring-primary`}
          onClick={() => changeLanguage(lng)}
        >
          {t(lng === 'en' ? 'english' : 'ukrainian')}
        </motion.button>
      ))}
    </div>
  );
};

export default LanguageSwitcher; 