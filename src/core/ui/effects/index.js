//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/ui/effects/index.js
// 🧩 Type: Effects Hub
// 📚 Description: Hub centralisé pour tous les effets UI
// 🕒 Version: 9.0 - 2025-06-21
// 🧭 Used in: Toute l'application
// ─────────────────────────────────────────────────────────
//

export * from './glassmorphism';
export * from './compatibility';

// Re-export des fonctions de compatibilité avec des alias pour la V9
export { 
  getGlassmorphismStyle as createGlassEffect,
  getPhaseGlassmorphismStyle as createPhaseGlassEffect,
  getActionGlassmorphismStyle as createActionGlassEffect
} from './compatibility'; 