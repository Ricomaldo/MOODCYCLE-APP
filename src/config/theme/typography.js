//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/theme/typography.js
// 🧩 Type: Theme Typography Module
// 📚 Description: Fonts, tailles, et styles typographiques
// 🕒 Version: 6.0 - 2025-06-21
// 🧭 Used in: theme system, Typography components
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════
// 📝 FONTS
// ═══════════════════════════════════════════════════════

export const FONTS = {
  heading: "Quintessential_400Regular", // Titres
  body: "Quicksand_400Regular", // Corps de texte
  bodyBold: "Quicksand_700Bold", // Corps de texte gras
};

// ═══════════════════════════════════════════════════════
// 📏 ÉCHELLE TYPOGRAPHIQUE
// ═══════════════════════════════════════════════════════

export const TYPOGRAPHY_SCALE = {
  heading1: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    fontWeight: "normal",
  },
  heading2: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    fontWeight: "normal",
  },
  heading3: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    fontWeight: "normal",
  },
  h3: {
    // Alias pour compatibilité
    fontSize: 16,
    fontWeight: "600",
  },
  body: {
    fontFamily: FONTS.body,
    fontSize: 16,
    fontWeight: "normal",
  },
  caption: {
    // Ajout pour compatibilité
    fontSize: 12,
    fontWeight: "normal",
  },
  small: {
    fontFamily: FONTS.body,
    fontSize: 10,
    fontWeight: "normal",
  },
  conversational: {
    // Nouveau style
    fontSize: 18,
    lineHeight: 24,
  },
};

// ═══════════════════════════════════════════════════════
// 📐 TAILLES POUR COMPATIBILITÉ
// ═══════════════════════════════════════════════════════

export const TYPOGRAPHY_SIZES = {
  heading1Size: 24,
  heading2Size: 20,
  heading3Size: 16,
  bodySize: 14,
  smallSize: 12,
};

// ═══════════════════════════════════════════════════════
// 📋 OBJET TYPOGRAPHY COMPLET (Legacy)
// ═══════════════════════════════════════════════════════

export const TYPOGRAPHY = {
  ...TYPOGRAPHY_SCALE,
  ...TYPOGRAPHY_SIZES,
};

// ═══════════════════════════════════════════════════════
// 🎨 TAB BAR TYPOGRAPHY
// ═══════════════════════════════════════════════════════

export const TAB_BAR_TYPOGRAPHY = {
  labelSize: 12,
  labelWeight: "500",
}; 