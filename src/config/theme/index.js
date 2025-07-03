//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/theme/index.js
// 🧩 Type: Theme System Hub
// 📚 Description: Hub d'exports centralisé V6.0 avec compatibilité legacy
// 🕒 Version: 6.0 - 2025-06-21
// 🧭 Used in: theme system, components, hooks
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════
// 🎨 MODULES COULEURS
// ═══════════════════════════════════════════════════════

export {
  BRAND_COLORS,
  SYSTEM_COLORS,
  PHASE_COLORS,
  LIGHT_COLORS,
  DARK_COLORS,
  isLightColor,
  isDarkColor,
  getTextColorOn,
  getTextColorOnPhase,
  phaseNeedsWhiteText,
  phaseNeedsBlackText,
  getPhaseTextStyle,
} from './colors.js';

// ═══════════════════════════════════════════════════════
// 📝 MODULES TYPOGRAPHY (DATA + COMPONENTS)
// ═══════════════════════════════════════════════════════

export {
  // Typography Data
  FONTS,
  TYPOGRAPHY_SCALE,
  TYPOGRAPHY_SIZES,
  TYPOGRAPHY,
  TAB_BAR_TYPOGRAPHY,
  
  // Typography Components 
  Heading1,
  Heading2,
  Heading3,
  BodyText,
  SmallText,
  Caption,
  Heading, // Alias
} from './typography';

// ═══════════════════════════════════════════════════════
// 📐 MODULES LAYOUT
// ═══════════════════════════════════════════════════════

export {
  SPACING,
  BORDER_RADIUS,
  TAB_BAR_LAYOUT,
} from './layout.js';

// ═══════════════════════════════════════════════════════
// ✨ MODULES EFFETS
// ═══════════════════════════════════════════════════════

// ✨ Effects (MIGRATED TO core/ui/effects)
export {
  createGlassmorphismStyle,
  createPhaseGlassmorphismStyle,
  createActionGlassmorphismStyle,
  GLASSMORPHISM_PRESETS,
  GLASSMORPHISM_QUICK_STYLES,
} from '../../core/ui/effects/glassmorphism.js';

// ═══════════════════════════════════════════════════════
// 🌙 MODULES THÈMES
// ═══════════════════════════════════════════════════════

export {
  LIGHT_TAB_BAR,
  DARK_TAB_BAR,
} from './themes/tabBar.js';

// ═══════════════════════════════════════════════════════
// 🛠️ MODULES UTILS
// ═══════════════════════════════════════════════════════

export {
  createStyles,
  createDynamicStyles,
} from './utils.js';

// 🎨 ANIMATION PRESETS (from core/ui/animations)
export {
  ANIMATION_PRESETS,
} from '../../core/ui/animations/constants/animationPresets.js';

// ═══════════════════════════════════════════════════════
// 💾 COMPATIBILITY LAYER - LEGACY SUPPORT
// ═══════════════════════════════════════════════════════

import { LIGHT_COLORS, DARK_COLORS } from './colors.js';
import { FONTS, TYPOGRAPHY } from './typography.js';
import { SPACING, BORDER_RADIUS } from './layout.js';
import { LIGHT_TAB_BAR, DARK_TAB_BAR } from './themes/tabBar.js';
import { 
  createGlassmorphismStyle, 
  createPhaseGlassmorphismStyle, 
  createActionGlassmorphismStyle,
  GLASSMORPHISM_PRESETS 
} from '../../core/ui/effects/glassmorphism.js';
import { ANIMATION_PRESETS } from '../../core/ui/animations/constants/animationPresets.js';
import { 
  isLightColor, 
  isDarkColor, 
  getTextColorOn, 
  getTextColorOnPhase, 
  phaseNeedsWhiteText, 
  phaseNeedsBlackText, 
  getPhaseTextStyle 
} from './colors.js';

// ✅ LEGACY THEME OBJECT (Compatible avec l'ancien theme.js)
export const theme = {
  colors: LIGHT_COLORS,
  fonts: FONTS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  tabBar: LIGHT_TAB_BAR,
  
  // Fonctions legacy attachées à l'objet theme
  isLightColor,
  isDarkColor,
  getTextColorOn,
  getTextColorOnPhase,
  phaseNeedsWhiteText,
  phaseNeedsBlackText,
  getPhaseTextStyle,
  getGlassmorphismStyle: createGlassmorphismStyle,
  getPhaseGlassmorphismStyle: createPhaseGlassmorphismStyle,
  getActionGlassmorphismStyle: createActionGlassmorphismStyle,
  glassmorphism: GLASSMORPHISM_PRESETS,
  animations: ANIMATION_PRESETS,
};

// ✅ LEGACY DARK THEME OBJECT
export const darkTheme = {
  colors: DARK_COLORS,
  fonts: FONTS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  tabBar: DARK_TAB_BAR,
};

// ═══════════════════════════════════════════════════════
// 🏭 THEME FACTORY (Cache optimisé)
// ═══════════════════════════════════════════════════════

// Cache pour les thèmes (clair et sombre)
const themeCache = {
  light: null,  // Thème clair mémorisé
  dark: null    // Thème sombre mémorisé
};

export const getTheme = (isDark = false) => {
  const cacheKey = isDark ? 'dark' : 'light';
  
  // Si le thème n'est pas encore en cache, on le crée
  if (!themeCache[cacheKey]) {
    if (isDark) {
      themeCache[cacheKey] = {
        ...theme,
        colors: DARK_COLORS,
        tabBar: DARK_TAB_BAR,
      };
    } else {
      themeCache[cacheKey] = theme;
    }
  }
  
  // Retourne toujours le même objet pour le même mode
  return themeCache[cacheKey];
};

// ✅ LEGACY THEME UTILS OBJECT
export const themeUtils = {
  // Déterminer si une couleur est claire (compatible sombre)
  isLightColor: (color) => {
    return isLightColor(color);
  },
  
  // Déterminer si une couleur est foncée (compatible sombre)
  isDarkColor: (color) => {
    return isDarkColor(color);
  },
  
  // Obtenir la couleur de texte optimale selon le thème
  getTextColorOn: (backgroundColor, isDarkTheme = false) => {
    return getTextColorOn(backgroundColor, isDarkTheme);
  },
  
  // Obtenir la couleur de texte pour une phase selon le thème
  getTextColorOnPhase: (phase, isDarkTheme = false) => {
    return getTextColorOnPhase(phase, isDarkTheme);
  },
}; 