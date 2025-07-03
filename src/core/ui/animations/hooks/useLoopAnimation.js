//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/ui/animations/hooks/useLoopAnimation.js
// 🧩 Type: Custom Hook - Animation
// 📚 Description: Hook optimisé pour animations en boucle avec cleanup automatique
// 🕒 Version: 5.0 - 2025-06-21
// 🧭 Used in: NotebookAnimations, OnboardingAnimations
// ─────────────────────────────────────────────────────────
//
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Hook personnalisé pour animations en boucle optimisées
 * 
 * @param {Object} config - Configuration de l'animation
 * @param {number} config.duration - Durée de l'animation (ms)
 * @param {Array} [config.outputRange] - Valeurs de sortie [min, max]
 * @param {boolean} [config.autoStart=true] - Démarrage automatique
 * @param {string} [config.easing='linear'] - Type d'easing
 * @param {boolean} [config.reverse=true] - Animation aller-retour
 * 
 * @returns {Animated.Value} - Valeur animée
 * 
 * @example
 * ```jsx
 * const pulseAnim = useLoopAnimation({ 
 *   duration: 1000, 
 *   autoStart: true 
 * });
 * 
 * const opacity = pulseAnim.interpolate({
 *   inputRange: [0, 1],
 *   outputRange: [0.3, 0.7],
 * });
 * ```
 */
export function useLoopAnimation(config) {
  const {
    duration = 1000,
    autoStart = true,
    reverse = true,
    easing = null
  } = config;

  const anim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    if (autoStart) {
      const sequence = reverse ? [
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing,
          useNativeDriver: true,
        }),
      ] : [
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing,
          useNativeDriver: true,
        }),
      ];

      animationRef.current = Animated.loop(
        reverse ? Animated.sequence(sequence) : sequence[0]
      );
      
      animationRef.current.start();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [autoStart, duration, reverse, easing]);

  // Méthodes de contrôle
  const start = () => {
    if (animationRef.current) {
      animationRef.current.start();
    }
  };

  const stop = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
  };

  const reset = () => {
    anim.setValue(0);
  };

  return {
    value: anim,
    start,
    stop,
    reset
  };
}

/**
 * Hook pour animations en boucle avec gestion d'état
 * 
 * @param {Object} config - Configuration étendue
 * @param {boolean} [config.enabled=true] - Contrôle activation/désactivation
 * @param {Function} [config.onComplete] - Callback fin de cycle
 * 
 * @returns {Object} - Objet avec valeur et contrôles
 */
export function useControlledLoopAnimation(config) {
  const {
    enabled = true,
    onComplete,
    ...animConfig
  } = config;

  const animation = useLoopAnimation({
    ...animConfig,
    autoStart: enabled
  });

  useEffect(() => {
    if (enabled) {
      animation.start();
    } else {
      animation.stop();
    }
  }, [enabled]);

  return animation;
} 