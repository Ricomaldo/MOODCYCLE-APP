//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/ui/animations/index.js
// 🧩 Type: Export Hub - Architecture V5.0
// 📚 Description: Exports centralisés pour l'écosystème d'animations modulaire
// 🕒 Version: 5.0 - 2025-06-21
// 🧭 Architecture: Modules séparés par domaine métier
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════
// 📓 NOTEBOOK ANIMATIONS
// ═══════════════════════════════════════════════════════
export {
  AnimatedSearchBar,
  AnimatedFilterPill,
  EntryLoadingSkeleton,
  AnimatedNotebookCard
} from './NotebookAnimations';

// ═══════════════════════════════════════════════════════
// 🎓 ONBOARDING ANIMATIONS
// ═══════════════════════════════════════════════════════
export {
  AnimatedRevealMessage,
  AnimatedLogo,
  AnimatedSparkle,
  AnimatedSignature,
  StandardOnboardingButton,
  AnimatedOnboardingScreen
} from './OnboardingAnimations';

// ═══════════════════════════════════════════════════════
// 🔧 HOOKS & UTILITIES
// ═══════════════════════════════════════════════════════
export {
  useLoopAnimation,
  useControlledLoopAnimation
} from './hooks/useLoopAnimation';

// ═══════════════════════════════════════════════════════
// 🎨 CONSTANTS & PRESETS
// ═══════════════════════════════════════════════════════
export {
  ANIMATION_PRESETS,
  ANIMATION_DURATIONS,
  EASING_CURVES,
  ANIMATION_CONFIGS,
  AnimationHelpers
} from './constants/animationPresets';

// ✅ MIGRATION V5.0 TERMINÉE
// L'ancien fichier AnimatedComponents.jsx a été supprimé
// Tous les imports utilisent maintenant l'architecture modulaire

/**
 * 🎉 ARCHITECTURE V5.0 COMPLETE !
 * 
 * ✅ IMPLÉMENTÉ :
 * 1. ✅ Modules séparés par domaine (Notebook, Onboarding)
 * 2. ✅ Hooks optimisés (useLoopAnimation, useControlledLoopAnimation)
 * 3. ✅ Présets standardisés (ANIMATION_PRESETS, DURATIONS, etc.)
 * 4. ✅ Compatibilité legacy maintenue
 * 5. ✅ Documentation complète et JSDoc
 * 
 * 🚀 PROCHAINES ÉTAPES :
 * - Migration progressive des imports existants
 * - Suppression AnimatedComponents.jsx (après migration)
 * - Tests unitaires pour chaque module
 * - Documentation Storybook
 */ 