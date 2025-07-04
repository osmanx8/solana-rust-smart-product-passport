import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

const LanguageTest = () => {
  const { currentLanguage, changeLanguage, getCurrentLanguage, getSupportedLanguages } = useLanguage();

  const currentLang = getCurrentLanguage();
  const supportedLanguages = getSupportedLanguages();

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Language System Test</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-300">Current Language:</p>
          <p className="font-medium">{currentLang.name} ({currentLang.code})</p>
        </div>

        <div>
          <p className="text-sm text-gray-300 mb-2">Supported Languages:</p>
          <div className="space-y-2">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`block w-full text-left px-3 py-2 rounded ${
                  lang.code === currentLanguage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {lang.name} ({lang.label})
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-300">LocalStorage Value:</p>
          <p className="font-mono text-sm">{localStorage.getItem('i18nextLng') || 'Not set'}</p>
        </div>

        <div>
          <p className="text-sm text-gray-300">Browser Language:</p>
          <p className="font-mono text-sm">{navigator.language || 'Not available'}</p>
        </div>
      </div>
    </div>
  );
};

export default LanguageTest; 