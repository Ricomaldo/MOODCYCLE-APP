//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/ui/animations/constants/animationPresets.js
// 🧩 Type: Constants - Animation Presets
// 📚 Description: Présets d'animation standardisés pour cohérence UX
// 🕒 Version: 5.0 - 2025-06-21
// 🧭 Used in: Tous les composants d'animation
// ─────────────────────────────────────────────────────────
//

/**
 * Présets d'animation spring standardisés
 * Basés sur les principes de Material Design et iOS Human Interface Guidelines
 */
export const ANIMATION_PRESETS = {
  // 🌊 Doux et naturel - Idéal pour entrées/sorties
  gentle: {
    tension: 80,
    friction: 8
  },

  // ⚡ Rapide et réactif - Idéal pour interactions utilisateur
  snappy: {
    tension: 200,
    friction: 10,
    mass: 0.8
  },

  // 🎯 Équilibré et fluide - Usage général
  smooth: {
    tension: 120,
    friction: 12
  },

  // ✨ Subtil et raffiné - Éléments décoratifs
  subtle: {
    tension: 150,
    friction: 14
  },

  // 🚀 Dynamique et expressif - Éléments d'action
  dynamic: {
    tension: 180,
    friction: 8
  },

  // 🛡️ Stable et ferme - Éléments critiques
  stable: {
    tension: 100,
    friction: 15
  }
};

/**
 * Durées d'animation standardisées (en ms)
 * Basées sur les recommandations d'accessibilité et UX
 */
export const ANIMATION_DURATIONS = {
  // Micro-interactions
  instant: 100,
  quick: 200,
  
  // Transitions standard
  normal: 300,
  smooth: 400,
  
  // Animations complexes
  slow: 600,
  elegant: 800,
  
  // Animations décoratives
  breathing: 3000,
  floating: 2000,
  
  // Onboarding et intro
  reveal: 1200,
  dramatic: 1500,
  
  // Délais spéciaux onboarding
  welcomeFirstMessage: 1000,
  welcomeSecondMessage: 2500,
  welcomeButton: 5200
};

/**
 * Courbes d'easing personnalisées
 * Pour animations timing précises
 */
export const EASING_CURVES = {
  // Entrées naturelles
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeIn: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  
  // Courbes spécialisées
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  anticipate: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  
  // Material Design
  material: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  materialDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  materialAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)'
};

/**
 * Configurations complètes pour cas d'usage spécifiques
 */
export const ANIMATION_CONFIGS = {
  // 📱 Modal et overlays
  modal: {
    enter: {
      ...ANIMATION_PRESETS.smooth,
      duration: ANIMATION_DURATIONS.normal
    },
    exit: {
      ...ANIMATION_PRESETS.snappy,
      duration: ANIMATION_DURATIONS.quick
    }
  },

  // 📄 Navigation entre écrans
  screen: {
    push: {
      ...ANIMATION_PRESETS.gentle,
      duration: ANIMATION_DURATIONS.smooth
    },
    pop: {
      ...ANIMATION_PRESETS.snappy,
      duration: ANIMATION_DURATIONS.normal
    }
  },

  // 🎭 Onboarding
  onboarding: {
    reveal: {
      ...ANIMATION_PRESETS.elegant,
      duration: ANIMATION_DURATIONS.reveal
    },
    logo: {
      ...ANIMATION_PRESETS.smooth,
      duration: ANIMATION_DURATIONS.elegant
    },
    welcome: {
      pageEnter: {
        fade: {
          duration: ANIMATION_DURATIONS.slow,
          useNativeDriver: true
        },
        slide: {
          ...ANIMATION_PRESETS.gentle,
          useNativeDriver: true
        }
      },
      button: {
        scale: {
          ...ANIMATION_PRESETS.gentle,
          useNativeDriver: true
        },
        fade: {
          duration: ANIMATION_DURATIONS.elegant,
          useNativeDriver: true
        }
      }
    }
  },

  // 📝 Notebook
  notebook: {
    search: {
      ...ANIMATION_PRESETS.snappy,
      duration: ANIMATION_DURATIONS.normal
    },
    entry: {
      ...ANIMATION_PRESETS.gentle,
      duration: ANIMATION_DURATIONS.smooth
    }
  }
};

/**
 * Helpers pour créer des animations cohérentes
 */
export const AnimationHelpers = {
  /**
   * Crée une configuration d'animation avec des valeurs par défaut
   */
  createConfig: (overrides = {}) => ({
    ...ANIMATION_PRESETS.smooth,
    duration: ANIMATION_DURATIONS.normal,
    useNativeDriver: true,
    ...overrides
  }),

  /**
   * Retourne un délai basé sur l'index pour animations décalées
   */
  getStaggerDelay: (index, baseDelay = 100) => index * baseDelay,

  /**
   * Crée une interpolation standard pour opacité
   */
  createOpacityInterpolation: (anim, inputRange = [0, 1], outputRange = [0, 1]) => 
    anim.interpolate({ inputRange, outputRange }),

  /**
   * Crée une interpolation standard pour translation
   */
  createTranslateInterpolation: (anim, distance = 20, inputRange = [0, 1]) =>
    anim.interpolate({
      inputRange,
      outputRange: [distance, 0]
    })
}; 