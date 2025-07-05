//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/ui/index.js
// 🧩 Type: UI Export Hub
// 📚 Description: Hub centralisé pour tous les composants UI
// 🕒 Version: 7.0 - 2025-06-21
// 🧭 Used in: Toute l'application
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════
// 📝 TYPOGRAPHY COMPONENTS (MIGRATED TO THEME V8.0)
// ═══════════════════════════════════════════════════════
// ⚠️ DEPRECATED: Typography moved to src/config/theme/typography
// Use: import { Heading1, BodyText } from '@/config/theme';
// Keeping compatibility exports during transition period

// ═══════════════════════════════════════════════════════
// ✨ ANIMATION COMPONENTS
// ═══════════════════════════════════════════════════════
export {
  // Notebook
  AnimatedSearchBar,
  AnimatedFilterPill,
  EntryLoadingSkeleton,
  AnimatedNotebookCard,
  
  // Onboarding  
  AnimatedRevealMessage,
  AnimatedLogo,
  AnimatedSparkle,
  AnimatedSignature,
  StandardOnboardingButton,
  AnimatedOnboardingScreen,
  
  // Hooks
  useLoopAnimation,
  useControlledLoopAnimation,
  
  // Constants
  ANIMATION_PRESETS,
  ANIMATION_DURATIONS,
  EASING_CURVES,
  ANIMATION_CONFIGS,
  AnimationHelpers,
} from './animations';

// 📝 Typography (Option A)
export * from './typography/index';

// ✨ Effects (MIGRATED TO THEME V8.0)
// ⚠️ DEPRECATED: Effects moved to src/config/theme/effects
// Use: import { createGlassmorphismStyle } from '@/config/theme';

// 🎯 Onboarding Components
export * from './animations/OnboardingAnimations'; 