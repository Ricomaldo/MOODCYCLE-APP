//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/theme/themes/tabBar.js
// 🧩 Type: Theme TabBar Module
// 📚 Description: Configuration TabBar pour thèmes clair/sombre
// 🕒 Version: 6.0 - 2025-06-21
// 🧭 Used in: theme system, tab navigation
// ─────────────────────────────────────────────────────────
//

import { TAB_BAR_LAYOUT, TAB_BAR_TYPOGRAPHY } from '../layout.js';
import { LIGHT_COLORS, DARK_COLORS } from '../colors.js';

// ═══════════════════════════════════════════════════════
// 🌞 TAB BAR THÈME CLAIR
// ═══════════════════════════════════════════════════════

export const LIGHT_TAB_BAR = {
  ...TAB_BAR_LAYOUT,
  ...TAB_BAR_TYPOGRAPHY,
  activeTintColor: LIGHT_COLORS.primary,
  inactiveTintColor: LIGHT_COLORS.textLight,
  backgroundColor: LIGHT_COLORS.background,
  borderColor: LIGHT_COLORS.border,
};

// ═══════════════════════════════════════════════════════
// 🌙 TAB BAR THÈME SOMBRE
// ═══════════════════════════════════════════════════════

export const DARK_TAB_BAR = {
  ...TAB_BAR_LAYOUT,
  ...TAB_BAR_TYPOGRAPHY,
  activeTintColor: DARK_COLORS.primary,
  inactiveTintColor: DARK_COLORS.textLight,
  backgroundColor: DARK_COLORS.surface,
  borderColor: DARK_COLORS.border,
}; 