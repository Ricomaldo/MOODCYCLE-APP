import React, { createContext, useContext, useState, useCallback } from 'react';
import { theme as defaultTheme } from '../../config/theme';

export const ThemeContext = createContext();

export function ThemeProvider({ children, initialTheme = defaultTheme }) {
  const [theme, setTheme] = useState(initialTheme);
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => !prev);
    // Ici, vous pouvez ajouter la logique pour changer les couleurs du thème
  }, []);

  const value = {
    theme,
    setTheme,
    isDark,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 