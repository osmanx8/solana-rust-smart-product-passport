# Smart Product Passport Language System

## Overview

The language system is based on the `react-i18next` library and automatically detects the browser language, saves the selected language in localStorage, and provides smooth language switching throughout the application.

## File Structure

```
src/
├── i18n.js                    # Main i18next configuration
├── locales/                   # Translation files
│   ├── en.json               # English translations
│   └── uk.json               # Ukrainian translations
├── utils/
│   └── languageUtils.js      # Language utility functions
├── hooks/
│   └── useLanguage.js        # Language hook
└── components/
    ├── LanguageSwitcher.jsx  # Language switcher component
    └── LanguageTest.jsx      # Testing component
```

## Supported Languages

- **EN** - English
- **UA** - Українська (Ukrainian)

## How It Works

### 1. Automatic Language Detection

The system automatically detects the language in the following order:
1. Checks for saved language in localStorage
2. If no saved language, detects browser language
3. If browser language is Ukrainian (uk, ua), sets Ukrainian
4. Otherwise sets English as default

### 2. Language Persistence

When changing languages, the system automatically saves the choice in localStorage with the key `i18nextLng`.

### 3. Synchronization

All components automatically synchronize with the current language through React hooks.

## Usage

### Basic Usage in Components

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.description')}</p>
    </div>
  );
};
```

### Using the useLanguage Hook

```jsx
import { useLanguage } from '../hooks/useLanguage';

const MyComponent = () => {
  const { 
    currentLanguage, 
    changeLanguage, 
    getCurrentLanguage, 
    t 
  } = useLanguage();
  
  const currentLang = getCurrentLanguage();
  
  return (
    <div>
      <p>Current language: {currentLang.name}</p>
      <button onClick={() => changeLanguage('uk')}>
        Switch to Ukrainian
      </button>
      <h1>{t('welcome.title')}</h1>
    </div>
  );
};
```

### Adding LanguageSwitcher

```jsx
import LanguageSwitcher from './components/LanguageSwitcher';

const Header = () => {
  return (
    <header>
      <h1>Smart Product Passport</h1>
      <LanguageSwitcher />
    </header>
  );
};
```

## Adding New Languages

### 1. Create Translation File

Create a new file in `src/locales/`, for example `fr.json`:

```json
{
  "welcome": {
    "title": "Bienvenue",
    "description": "Description en français"
  }
}
```

### 2. Update languageUtils.js

```javascript
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'uk', label: 'UA', name: 'Українська' },
  { code: 'fr', label: 'FR', name: 'Français' } // Add new language
];
```

### 3. Update i18n.js

```javascript
import fr from './locales/fr.json';

i18n.init({
  resources: {
    en: { translation: en },
    uk: { translation: uk },
    fr: { translation: fr }, // Add new language
  },
  // ... other settings
});
```

## Testing

To test the language system, use the `LanguageTest` component:

```jsx
import LanguageTest from './components/LanguageTest';

const TestPage = () => {
  return (
    <div>
      <h1>Language System Testing</h1>
      <LanguageTest />
    </div>
  );
};
```

## Translation File Structure

Translation files are organized in a hierarchical structure:

```json
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete"
    },
    "messages": {
      "loading": "Loading...",
      "error": "Error",
      "success": "Success"
    }
  },
  "pages": {
    "home": {
      "title": "Home Page",
      "description": "Home page description"
    }
  }
}
```

## Debugging

To enable debug mode, change in `i18n.js`:

```javascript
i18n.init({
  debug: true, // Enable debugging
  // ... other settings
});
```

## Known Issues and Solutions

### Language Not Persisting After Reload

Check:
1. If localStorage is properly configured
2. If there are no errors in browser console
3. If i18n is properly imported in main.jsx

### Language Not Detecting Automatically

Check:
1. If `i18next-browser-languagedetector` library is installed
2. If detector is properly configured in `i18n.js`

### Components Not Updating When Language Changes

Make sure you're using `useTranslation` or `useLanguage` hook in components. 