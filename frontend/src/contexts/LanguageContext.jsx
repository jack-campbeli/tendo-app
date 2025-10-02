import React, { createContext, useContext, useState } from 'react';

// Creates a context for sharing language data.
const LanguageContext = createContext();

// Provides the language context to its children components.
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for components to use the language context.
export function useLanguage() {
  const context = useContext(LanguageContext); // returns context value {language, setLanguage}
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

