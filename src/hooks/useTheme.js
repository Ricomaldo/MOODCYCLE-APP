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
import { useAppStore } from '../stores/useAppStore';
import { getTheme, themeUtils } from '../config/theme';

/**
 * Hook principal pour la gestion du thème
 * @returns {Object} - Objet avec thème actuel et fonctions utilitaires
 */
export const useTheme = () => {
  // Détecter le thème système
  const systemColorScheme = useColorScheme();
  
  // Récupérer le thème choisi par l'utilisateur depuis le store
  const { currentTheme, setTheme } = useAppStore();
  
  // Déterminer le thème effectif
  const isDark = currentTheme === 'dark' || 
    (currentTheme === 'system' && systemColorScheme === 'dark');
  
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
};

/**
 * Hook simplifié pour obtenir juste le thème
 * @returns {Object} - Objet thème
 */
export const useCurrentTheme = () => {
  const { theme } = useTheme();
  return theme;
};

/**
 * Hook pour vérifier si on est en mode sombre
 * @returns {boolean} - true si mode sombre
 */
export const useIsDarkMode = () => {
  const { isDark } = useTheme();
  return isDark;
}; 