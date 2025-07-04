import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, getCurrentLanguage, getSupportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  const currentLang = getCurrentLanguage();
  const supportedLanguages = getSupportedLanguages();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-8 flex items-center justify-center rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-all"
        aria-label={`Current language: ${currentLang.label}`}
      >
        <span className="text-sm font-medium text-gray-300">{currentLang.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-12 bg-gray-800 rounded-lg shadow-xl border border-gray-700/50 overflow-hidden z-50"
          >
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-2 py-1.5 flex items-center justify-center text-sm font-medium transition-colors ${
                  lang.code === currentLanguage
                    ? 'bg-gray-700/50 text-white'
                    : 'text-gray-300 hover:bg-gray-700/30'
                }`}
                aria-label={`Switch to ${lang.label}`}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher; 