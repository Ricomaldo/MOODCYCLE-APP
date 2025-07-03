//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/theme/utils.js
// 🧩 Type: Theme Utils Module
// 📚 Description: Utilitaires pour la création de styles
// 🕒 Version: 6.0 - 2025-06-21
// 🧭 Used in: theme system, components
// ─────────────────────────────────────────────────────────
//

import { StyleSheet } from "react-native";

// ═══════════════════════════════════════════════════════
// 🛠️ STYLE CREATORS
// ═══════════════════════════════════════════════════════

// Créer des styles avec accès au thème
export const createStyles = (styleFunction) => {
  return (theme) => StyleSheet.create(styleFunction(theme));
};

// Créer des styles avec thème dynamique
export const createDynamicStyles = (styleFunction) => {
  return (isDark = false, theme) => {
    return StyleSheet.create(styleFunction(theme, isDark));
  };
};

// ═══════════════════════════════════════════════════════
// 🎨 ANIMATION HELPERS (Legacy from theme.js)
// ═══════════════════════════════════════════════════════

export const ANIMATION_PRESETS = {
  // Timings fluides
  durations: {
    fast: 300,
    normal: 600,
    slow: 900,
    signature: 1200,
  },
  
  // Tensions Spring optimisées
  spring: {
    gentle: { tension: 80, friction: 8 },
    normal: { tension: 100, friction: 8 },
    bouncy: { tension: 150, friction: 6 },
  },
  
  // Patterns d'animation réutilisables
  patterns: {
    // Révélation de texte fluide
    textReveal: {
      opacity: { from: 0, to: 1, duration: 600 },
      translateY: { from: 20, to: 0, spring: { tension: 80, friction: 8 } },
      scale: { from: 0.98, to: 1, spring: { tension: 100, friction: 8 } },
    },
    
    // Signature manuscrite
    signature: {
      opacity: { from: 0, to: 1, duration: 1200 },
      scale: { from: 0.8, to: 1, spring: { tension: 150, friction: 8 } },
    },
    
    // Sparkles flottants
    sparkles: {
      cascade: { delayIncrement: 200 },
      floating: { duration: 2000, delayBase: 1000 },
      rotation: { duration: 4000 },
    },
  },
}; 