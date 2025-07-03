//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/theme/effects/glassmorphism.js
// 🧩 Type: Theme Effects Module
// 📚 Description: Effets glassmorphism signature MoodCycle
// 🕒 Version: 6.0 - 2025-06-21
// 🧭 Used in: theme system, components with glass effects
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════
// ✨ GLASSMORPHISM SIGNATURE MOODCYCLE
// ═══════════════════════════════════════════════════════

export const createGlassmorphismStyle = (color, options = {}) => {
  const {
    bgOpacity = '15',          // Opacité background (15% par défaut)
    borderOpacity = '30',      // Opacité border (30% par défaut)
    blur = 20,                 // Intensité blur (20px par défaut)
    shadowOpacity = 0.15,      // Opacité shadow (0.15 par défaut)
    shadowRadius = 24,         // Radius shadow (24 par défaut)
    shadowOffset = { width: 0, height: 8 }, // Offset shadow
    elevation = 8,             // Elevation Android
    borderWidth = 1.5,         // Épaisseur border
    borderRadius,              // Border radius (optionnel)
  } = options;

  return {
    backgroundColor: color + bgOpacity,
    borderColor: color + borderOpacity,
    borderWidth,
    shadowColor: color,
    shadowOffset: shadowOffset,
    shadowOpacity: shadowOpacity,
    shadowRadius: shadowRadius,
    elevation: elevation,
    ...(borderRadius && { borderRadius }),
    // Note: backdropFilter n'est pas supporté nativement sur React Native
    // Utilisé pour la documentation web uniquement
    // backdropFilter: `blur(${blur}px)`,
  };
};

export const createPhaseGlassmorphismStyle = (phaseColor, options = {}) => {
  if (!phaseColor) {
    console.warn(`Phase color non fournie, utilisation de la couleur par défaut`);
    return createGlassmorphismStyle('#D81B60', options); // Fallback primary
  }
  return createGlassmorphismStyle(phaseColor, options);
};

export const createActionGlassmorphismStyle = (color, options = {}) => {
  const {
    bgColor = 'rgba(255,255,255,0.8)',  // Background blanc semi-transparent
    borderOpacity = '30',                // Opacité border colorée
    shadowColor = '#000',                // Shadow noire par défaut
    shadowOpacity = 0.08,                // Shadow plus subtile
    shadowRadius = 8,                    // Shadow plus petite
    shadowOffset = { width: 0, height: 2 },
    elevation = 3,
    borderWidth = 1,
    borderRadius,
  } = options;

  return {
    backgroundColor: bgColor,
    borderColor: color + borderOpacity,
    borderWidth,
    shadowColor: shadowColor,
    shadowOffset: shadowOffset,
    shadowOpacity: shadowOpacity,
    shadowRadius: shadowRadius,
    elevation: elevation,
    ...(borderRadius && { borderRadius }),
  };
};

// ═══════════════════════════════════════════════════════
// 📋 CONSTANTES GLASSMORPHISM
// ═══════════════════════════════════════════════════════

export const GLASSMORPHISM_PRESETS = {
  // Opacités standards
  opacity: {
    bg: '15',        // Background
    border: '30',    // Border
    accent: '40',    // Accents
    light: '08',     // Très léger
    medium: '20',    // Moyen
  },
  
  // Blur standards (pour documentation web)
  blur: {
    light: 10,
    medium: 20,
    strong: 40,
  },
  
  // Shadow standards
  shadow: {
    subtle: { opacity: 0.08, radius: 8, offset: { width: 0, height: 2 } },
    normal: { opacity: 0.15, radius: 24, offset: { width: 0, height: 8 } },
    strong: { opacity: 0.25, radius: 32, offset: { width: 0, height: 12 } },
  },
};

// ═══════════════════════════════════════════════════════
// 🎨 PRESETS RAPIDES
// ═══════════════════════════════════════════════════════

export const GLASSMORPHISM_QUICK_STYLES = {
  subtle: (color) => createGlassmorphismStyle(color, {
    bgOpacity: GLASSMORPHISM_PRESETS.opacity.light,
    borderOpacity: GLASSMORPHISM_PRESETS.opacity.border,
    ...GLASSMORPHISM_PRESETS.shadow.subtle,
  }),
  
  normal: (color) => createGlassmorphismStyle(color, {
    bgOpacity: GLASSMORPHISM_PRESETS.opacity.bg,
    borderOpacity: GLASSMORPHISM_PRESETS.opacity.border,
    ...GLASSMORPHISM_PRESETS.shadow.normal,
  }),
  
  strong: (color) => createGlassmorphismStyle(color, {
    bgOpacity: GLASSMORPHISM_PRESETS.opacity.medium,
    borderOpacity: GLASSMORPHISM_PRESETS.opacity.accent,
    ...GLASSMORPHISM_PRESETS.shadow.strong,
  }),
}; 