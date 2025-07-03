//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/theme.js
// 🧩 Type: Theme Legacy Compatibility
// 📚 Description: Pont de compatibilité vers l'architecture V6.0
// 🕒 Version: 6.0 - 2025-06-21
// 🧭 Used in: legacy imports, components
// ⚠️  MIGRATION: Utiliser import { ... } from '@/config/theme' à la place
// ─────────────────────────────────────────────────────────
//

// ✅ RE-EXPORT DEPUIS L'ARCHITECTURE MODULAIRE
export * from './theme/index.js';

// ✅ EXPORTS PAR DÉFAUT POUR COMPATIBILITÉ TOTALE
export { 
  theme as default,
  theme,
  darkTheme,
  getTheme,
  themeUtils,
  createStyles,
  createDynamicStyles,
} from './theme/index.js'; 