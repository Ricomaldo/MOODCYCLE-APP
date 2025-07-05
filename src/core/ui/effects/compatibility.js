//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/ui/effects/compatibility.js
// 🧩 Type: Compatibility Layer
// 📚 Description: Couche de compatibilité pour les effets glassmorphism
// 🕒 Version: 1.0 - 2025-01-27
// ─────────────────────────────────────────────────────────
//

import { 
  createGlassmorphismStyle,
  createPhaseGlassmorphismStyle,
  createActionGlassmorphismStyle,
  GLASSMORPHISM_PRESETS,
  GLASSMORPHISM_QUICK_STYLES
} from './glassmorphism';

// Exports compatibles avec l'ancien système
export const getGlassmorphismStyle = createGlassmorphismStyle;
export const getPhaseGlassmorphismStyle = createPhaseGlassmorphismStyle;
export const getActionGlassmorphismStyle = createActionGlassmorphismStyle;

export {
  createGlassmorphismStyle,
  createPhaseGlassmorphismStyle,
  createActionGlassmorphismStyle,
  GLASSMORPHISM_PRESETS,
  GLASSMORPHISM_QUICK_STYLES
}; 