//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/theme/colors.js
// 🧩 Type: Theme Colors Module
// 📚 Description: Couleurs brand, phases, et états
// 🕒 Version: 6.0 - 2025-06-21
// 🧭 Used in: theme system, components
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════
// 🎨 COULEURS BRAND
// ═══════════════════════════════════════════════════════

export const BRAND_COLORS = {
  primary: "#D81B60", // Framboise Chaleureuse
  secondary: "#CDDC39", // Citron Vert Velouté
};

// ═══════════════════════════════════════════════════════
// 🌈 COULEURS SYSTÈME
// ═══════════════════════════════════════════════════════

export const SYSTEM_COLORS = {
  success: "#4CAF50", // Vert succès
  warning: "#FF9800", // Orange warning
  error: "#F44336", // Rouge erreur
  white: "#FFFFFF", // Blanc pur
};

// ═══════════════════════════════════════════════════════
// 🌙 COULEURS PHASES CYCLE
// ═══════════════════════════════════════════════════════

export const PHASE_COLORS = {
  menstrual: "#E53935", // Grenat Doux - légèrement plus foncé pour meilleur contraste
  follicular: "#F57C00", // Miel Doré - orange plus foncé au lieu du jaune pour meilleur contraste
  ovulatory: "#0097A7", // Lagune Calme - cyan plus foncé pour meilleur contraste
  luteal: "#673AB7", // Lavande Mystique - parfait tel quel
};

// ═══════════════════════════════════════════════════════
// 🌞 THÈME CLAIR
// ═══════════════════════════════════════════════════════

export const LIGHT_COLORS = {
  ...BRAND_COLORS,
  ...SYSTEM_COLORS,
  background: "#FAFAFA", // Brume d'Aube (fond)
  text: "#212121", // Texte principal
  textLight: "#757575", // Texte secondaire
  textPrimary: "#212121", // Alias pour compatibilité
  textSecondary: "#757575", // Alias pour compatibilité
  surface: "#FFFFFF", // Surface cards
  border: "#E0E0E0", // Bordures
  backgroundSecondary: "#F5F5F5", // Fond secondaire
  phases: PHASE_COLORS,
};

// ═══════════════════════════════════════════════════════
// 🌙 THÈME SOMBRE
// ═══════════════════════════════════════════════════════

export const DARK_COLORS = {
  ...BRAND_COLORS,
  primary: "#E91E63", // Plus vif en mode sombre
  ...SYSTEM_COLORS,
  background: "#121212", // Fond sombre Material Design
  text: "#FFFFFF", // Texte blanc
  textLight: "#B3B3B3", // Texte secondaire plus clair
  textPrimary: "#FFFFFF", // Alias pour compatibilité
  textSecondary: "#B3B3B3", // Alias pour compatibilité
  surface: "#1E1E1E", // Surfaces légèrement plus claires
  border: "#2C2C2C", // Bordures subtiles
  backgroundSecondary: "#1A1A1A", // Fond secondaire
  phases: {
    // Couleurs phases adaptées pour le sombre - plus vives
    menstrual: "#EF5350", // Rouge plus vif
    follicular: "#FFA726", // Orange plus saturé
    ovulatory: "#26C6DA", // Cyan plus lumineux
    luteal: "#7986CB", // Violet plus doux
  },
};

// ═══════════════════════════════════════════════════════
// 🔧 UTILITAIRES COULEURS
// ═══════════════════════════════════════════════════════

// Convertir hex en RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Calculer la luminance selon W3C
const getLuminance = (color) => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  // Formule W3C pour la luminance relative
  return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
};

// Déterminer si une couleur est claire
export const isLightColor = (color) => {
  return getLuminance(color) > 186;
};

// Déterminer si une couleur est foncée
export const isDarkColor = (color) => {
  return getLuminance(color) <= 186;
};

// Obtenir la couleur de texte optimale pour un fond donné
export const getTextColorOn = (backgroundColor, isDarkTheme = false) => {
  const textColor = isDarkTheme ? DARK_COLORS.text : LIGHT_COLORS.text;
  const whiteColor = "#FFFFFF";
  
  return isLightColor(backgroundColor) ? textColor : whiteColor;
};

// ✅ NOUVELLES FONCTIONS UTILITAIRES POUR LES PHASES
// Obtenir la couleur de texte optimale pour une phase donnée
export const getTextColorOnPhase = (phase, isDarkTheme = false) => {
  const colors = isDarkTheme ? DARK_COLORS : LIGHT_COLORS;
  const phaseColor = colors.phases[phase];
  if (!phaseColor) return colors.text;
  
  // Règles spécifiques basées sur les couleurs des phases
  switch (phase) {
    case 'menstrual':   // #F44336 (rouge) - couleur claire
    case 'follicular':  // #FFC107 (jaune) - couleur claire
    case 'ovulatory':   // #00BCD4 (cyan) - couleur claire
      return colors.text; // Texte noir
    case 'luteal':      // #673AB7 (violet) - couleur foncée
      return "#FFFFFF"; // Texte blanc
    default:
      return getTextColorOn(phaseColor, isDarkTheme);
  }
};

// Vérifier si une phase nécessite du texte blanc
export const phaseNeedsWhiteText = (phase) => {
  return phase === 'luteal';
};

// Vérifier si une phase nécessite du texte noir
export const phaseNeedsBlackText = (phase) => {
  return ['menstrual', 'follicular', 'ovulatory'].includes(phase);
};

// Obtenir le style de texte complet pour une phase
export const getPhaseTextStyle = (phase, isDarkTheme = false) => {
  return {
    color: getTextColorOnPhase(phase, isDarkTheme)
  };
}; 