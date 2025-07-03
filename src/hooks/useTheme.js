//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useTheme.js
// 🧩 Type: Custom Hook
// 📚 Description: Hook pour la gestion du thème dynamique (clair/sombre/système)
// 🕒 Version: 1.0 - 2025-01-15
// 🧭 Used in: Tous les composants qui utilisent le thème
// ─────────────────────────────────────────────────────────
//
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { getTheme, themeUtils } from '../config/theme';


export const useTheme = () => {
  // Détecter le thème système
  const systemColorScheme = useColorScheme();
  
  // Récupérer le thème choisi par l'utilisateur depuis le store
  const { currentTheme, setTheme } = useAppStore();
  
  // Déterminer le thème effectif
  const isDark = currentTheme === 'dark' || 
    (currentTheme === 'system' && systemColorScheme === 'dark');
  
  // ✅ CORRECTION : Mémoriser tout l'objet retourné pour éviter les re-créations
  return useMemo(() => {
    // Obtenir l'objet thème complet
    const theme = getTheme(isDark);
    
    // Fonctions utilitaires
    const toggleTheme = () => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    };
    
    const setSystemTheme = () => {
      setTheme('system');
    };
    
    const setLightTheme = () => {
      setTheme('light');
    };
    
    const setDarkTheme = () => {
      setTheme('dark');
    };
    
    // Fonctions utilitaires étendues avec le contexte du thème actuel
    const utils = {
      ...themeUtils,
      // Override avec le thème actuel
      getTextColorOn: (backgroundColor) => {
        return themeUtils.getTextColorOn(backgroundColor, isDark);
      },
      getTextColorOnPhase: (phase) => {
        return themeUtils.getTextColorOnPhase(phase, isDark);
      },
    };
    
    return {
      // État du thème
      theme,
      isDark,
      isLight: !isDark,
      currentTheme,
      systemColorScheme,
      
      // Actions
      toggleTheme,
      setTheme,
      setSystemTheme,
      setLightTheme,
      setDarkTheme,
      
      // Utilitaires
      ...utils,
    };
  }, [isDark, currentTheme, systemColorScheme, setTheme]);
};


export const useCurrentTheme = () => {
  const { theme } = useTheme();
  return theme;
};


export const useIsDarkMode = () => {
  const { isDark } = useTheme();
  return isDark;
}; 