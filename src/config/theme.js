//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/theme.js
// 🧩 Type: Config
// 📚 Description: Thème global de l'application (couleurs, polices, styles)
// 🕒 Version: 3.0 - 2025-06-21
// 🧭 Used in: global theme config, UI components, screens
// ─────────────────────────────────────────────────────────
//
import { StyleSheet } from "react-native";

export const theme = {
  colors: {
    primary: "#D81B60", // Framboise Chaleureuse
    secondary: "#CDDC39", // Citron Vert Velouté
    background: "#FAFAFA", // Brume d'Aube (fond)
    text: "#212121", // Texte principal
    textLight: "#757575", // Texte secondaire
    textPrimary: "#212121", // Alias pour compatibilité
    textSecondary: "#757575", // Alias pour compatibilité
    surface: "#FFFFFF", // Surface cards
    border: "#E0E0E0", // Bordures
    white: "#FFFFFF", // Blanc pur
    success: "#4CAF50", // Vert succès
    warning: "#FF9800", // Orange warning
    error: "#F44336", // Rouge erreur
    backgroundSecondary: "#F5F5F5", // Fond secondaire
    phases: {
      menstrual: "#E53935", // Grenat Doux - légèrement plus foncé pour meilleur contraste
      follicular: "#F57C00", // Miel Doré - orange plus foncé au lieu du jaune pour meilleur contraste
      ovulatory: "#0097A7", // Lagune Calme - cyan plus foncé pour meilleur contraste
      luteal: "#673AB7", // Lavande Mystique - parfait tel quel
    },
  },
  fonts: {
    heading: "Quintessential_400Regular", // Titres
    body: "Quicksand_400Regular", // Corps de texte
    bodyBold: "Quicksand_700Bold", // Corps de texte gras
  },
  typography: {
    heading1: {
      fontFamily: "Quintessential_400Regular",
      fontSize: 24,
      fontWeight: "normal",
    },
    heading2: {
      fontFamily: "Quintessential_400Regular",
      fontSize: 20,
      fontWeight: "normal",
    },
    heading3: {
      fontFamily: "Quicksand_700Bold",
      fontSize: 16,
      fontWeight: "normal",
    },
    h3: {
      // Alias pour compatibilité
      fontSize: 16,
      fontWeight: "600",
    },
    body: {
      fontFamily: "Quicksand_400Regular",
      fontSize: 16,
      fontWeight: "normal",
    },
    caption: {
      // Ajout pour compatibilité
      fontSize: 12,
      fontWeight: "normal",
    },
    small: {
      fontFamily: "Quicksand_400Regular",
      fontSize: 10,
      fontWeight: "normal",
    },
    conversational: {
      // Nouveau style
      fontSize: 18,
      lineHeight: 24,
    },
    // Tailles pour compatibilité avec l'existant
    heading1Size: 24,
    heading2Size: 20,
    heading3Size: 16,
    bodySize: 14,
    smallSize: 12,
  },
  spacing: {
    xs: 4,
    s: 8,
    sm: 8, // Alias pour compatibilité
    m: 16,
    md: 16, // Alias pour compatibilité
    l: 24,
    lg: 24, // Alias pour compatibilité
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 8,
    sm: 8, // Alias pour compatibilité
    medium: 16,
    md: 16, // Alias pour compatibilité
    large: 24,
    pill: 999,
  },
  tabBar: {
    height: 80,
    activeTintColor: "#E91E63",
    inactiveTintColor: "#757575",
    backgroundColor: "#FAFAFA",
    borderColor: "#E0E0E0",
    labelSize: 12,
    labelWeight: "500",
    paddingTop: 8,
    marginBottom: 4,
  },
};

// Fonctions utilitaires pour le contraste automatique

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
theme.isLightColor = (color) => {
  return getLuminance(color) > 186;
};

// Déterminer si une couleur est foncée
theme.isDarkColor = (color) => {
  return getLuminance(color) <= 186;
};

// Obtenir la couleur de texte optimale pour un fond donné
theme.getTextColorOn = (backgroundColor) => {
  return theme.isLightColor(backgroundColor) ? theme.colors.text : "#FFFFFF";
};

// ✅ NOUVELLES FONCTIONS UTILITAIRES POUR LES PHASES
// Obtenir la couleur de texte optimale pour une phase donnée
theme.getTextColorOnPhase = (phase) => {
  const phaseColor = theme.colors.phases[phase];
  if (!phaseColor) return theme.colors.text;
  
  // Règles spécifiques basées sur les couleurs des phases
  switch (phase) {
    case 'menstrual':   // #F44336 (rouge) - couleur claire
    case 'follicular':  // #FFC107 (jaune) - couleur claire
    case 'ovulatory':   // #00BCD4 (cyan) - couleur claire
      return theme.colors.text; // Texte noir
    case 'luteal':      // #673AB7 (violet) - couleur foncée
      return "#FFFFFF"; // Texte blanc
    default:
      return theme.getTextColorOn(phaseColor);
  }
};

// Vérifier si une phase nécessite du texte blanc
theme.phaseNeedsWhiteText = (phase) => {
  return phase === 'luteal';
};

// Vérifier si une phase nécessite du texte noir
theme.phaseNeedsBlackText = (phase) => {
  return ['menstrual', 'follicular', 'ovulatory'].includes(phase);
};

// Obtenir le style de texte complet pour une phase
theme.getPhaseTextStyle = (phase) => {
  return {
    color: theme.getTextColorOnPhase(phase)
  };
};

// Créer des styles avec accès au thème
export const createStyles = (styleFunction) => {
  const styles = StyleSheet.create(styleFunction(theme));
  return styles;
};

// ═══════════════════════════════════════════════════════
// 🌙 THÈME SOMBRE
// ═══════════════════════════════════════════════════════

export const darkTheme = {
  colors: {
    primary: "#E91E63", // Plus vif en mode sombre
    secondary: "#CDDC39", 
    background: "#121212", // Fond sombre Material Design
    text: "#FFFFFF", // Texte blanc
    textLight: "#B3B3B3", // Texte secondaire plus clair
    textPrimary: "#FFFFFF", // Alias pour compatibilité
    textSecondary: "#B3B3B3", // Alias pour compatibilité
    surface: "#1E1E1E", // Surfaces légèrement plus claires
    border: "#2C2C2C", // Bordures subtiles
    white: "#FFFFFF", // Blanc pur (reste blanc)
    success: "#4CAF50", // Vert succès
    warning: "#FF9800", // Orange warning
    error: "#F44336", // Rouge erreur
    backgroundSecondary: "#1A1A1A", // Fond secondaire
    phases: {
      // Couleurs phases adaptées pour le sombre - plus vives
      menstrual: "#EF5350", // Rouge plus vif
      follicular: "#FFA726", // Orange plus saturé
      ovulatory: "#26C6DA", // Cyan plus lumineux
      luteal: "#7986CB", // Violet plus doux
    },
  },
  // Hériter les autres propriétés du thème clair
  fonts: theme.fonts,
  typography: theme.typography,
  spacing: theme.spacing,
  borderRadius: theme.borderRadius,
  tabBar: {
    height: 80,
    activeTintColor: "#E91E63",
    inactiveTintColor: "#B3B3B3",
    backgroundColor: "#1E1E1E",
    borderColor: "#2C2C2C",
    labelSize: 12,
    labelWeight: "500",
    paddingTop: 8,
    marginBottom: 4,
  },
};

// ═══════════════════════════════════════════════════════
// 🎨 FONCTIONS UTILITAIRES POUR THÈMES DYNAMIQUES
// ═══════════════════════════════════════════════════════

/**
 * Obtenir le thème complet selon le mode (clair/sombre)
 * @param {boolean} isDark - Mode sombre activé
 * @returns {Object} - Objet thème complet
 */
export const getTheme = (isDark = false) => {
  if (isDark) {
    return {
      ...theme,
      colors: darkTheme.colors,
      tabBar: darkTheme.tabBar,
    };
  }
  return theme;
};

/**
 * Fonctions utilitaires étendues pour le thème sombre
 */
export const themeUtils = {
  // Déterminer si une couleur est claire (compatible sombre)
  isLightColor: (color) => {
    return theme.isLightColor(color);
  },
  
  // Déterminer si une couleur est foncée (compatible sombre)
  isDarkColor: (color) => {
    return theme.isDarkColor(color);
  },
  
  // Obtenir la couleur de texte optimale selon le thème
  getTextColorOn: (backgroundColor, isDarkTheme = false) => {
    const textColor = isDarkTheme ? darkTheme.colors.text : theme.colors.text;
    const whiteColor = "#FFFFFF";
    
    return theme.isLightColor(backgroundColor) ? textColor : whiteColor;
  },
  
  // Obtenir la couleur de texte pour une phase selon le thème
  getTextColorOnPhase: (phase, isDarkTheme = false) => {
    const currentTheme = isDarkTheme ? darkTheme : theme;
    const phaseColor = currentTheme.colors.phases[phase];
    
    if (!phaseColor) return currentTheme.colors.text;
    
    // Utiliser la logique existante mais adaptée au thème
    return theme.getTextColorOnPhase(phase);
  },
};

// Créer des styles avec thème dynamique
export const createDynamicStyles = (styleFunction) => {
  return (isDark = false) => {
    const currentTheme = getTheme(isDark);
    return StyleSheet.create(styleFunction(currentTheme));
  };
};
