import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'uk', label: 'UA' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-8 flex items-center justify-center rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-all"
      >
        <span className="text-sm font-medium text-gray-300">{currentLanguage.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-12 bg-gray-800 rounded-lg shadow-xl border border-gray-700/50 overflow-hidden"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-2 py-1.5 flex items-center justify-center text-sm font-medium transition-colors ${
                  lang.code === currentLanguage.code
                    ? 'bg-gray-700/50 text-white'
                    : 'text-gray-300 hover:bg-gray-700/30'
                }`}
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