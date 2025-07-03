//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/ui/animations/OnboardingAnimations.jsx
// 🧩 Type: Animation Components - Onboarding Domain
// 📚 Description: Animations spécifiques à l'onboarding (logo, messages, sparkles)
// 🕒 Version: 5.0 - 2025-06-21
// 🧭 Used in: Onboarding screens (100-800)
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { BodyText } from '../typography';
import { ANIMATION_PRESETS } from './constants/animationPresets';

/**
 * Message de révélation séquentielle pour onboarding
 * @param {ReactNode} children - Contenu à révéler
 * @param {number} delay - Délai avant révélation (ms)
 * @param {Function} onComplete - Callback fin d'animation
 */
export function AnimatedRevealMessage({ children, delay = 0, onComplete }) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Animation simple et fluide - Ease out naturel
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        if (onComplete) onComplete();
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: translateYAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Logo avec effet "breath" subtil pour onboarding
 * @param {ReactNode} children - Contenu du logo
 * @param {Object} style - Styles additionnels
 */
export function AnimatedLogo({ children, style }) {
  const breathAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const breathLoopRef = useRef(null);

  useEffect(() => {
    // Entrée élégante
    Animated.spring(fadeAnim, {
      toValue: 1,
      ...ANIMATION_PRESETS.smooth,
      useNativeDriver: true,
    }).start();

    // Effet "breath" continu avec gestion propre
    breathLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    breathLoopRef.current.start();

    return () => {
      if (breathLoopRef.current) {
        breathLoopRef.current.stop();
      }
    };
  }, []);

  const scale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.02],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Sparkles flottants optimisés pour onboarding
 * @param {number} index - Index pour délais décalés
 * @param {Object} style - Styles de positionnement
 */
export function AnimatedSparkle({ index, style }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Refs pour gérer proprement les animations
  const timersRef = useRef([]);
  const animationsRef = useRef([]);

  useEffect(() => {
    // Nettoyage centralisé
    const cleanup = () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      animationsRef.current.forEach(anim => anim.stop());
      timersRef.current = [];
      animationsRef.current = [];
    };

    // Entrée décalée légère
    const entryTimer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0.6, // Opacité subtile selon design
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 2000 + (index * 300));
    timersRef.current.push(entryTimer);

    // Animation ultra-douce continue
    const loopTimer = setTimeout(() => {
      const subtleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );

      const gentleRotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000, // Rotation très lente
          useNativeDriver: true,
        })
      );

      animationsRef.current.push(subtleLoop, gentleRotate);
      subtleLoop.start();
      gentleRotate.start();
    }, 3000);
    timersRef.current.push(loopTimer);

    return cleanup;
  }, [index]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'], // Rotation minimale
  });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: [{ rotate }],
        },
      ]}
    >
      <Text style={styles.sparkleEmoji}>✨</Text>
    </Animated.View>
  );
}

/**
 * Signature manuscrite animée pour onboarding
 * @param {ReactNode} children - Contenu de la signature
 * @param {number} delay - Délai avant animation (ms)
 */
export function AnimatedSignature({ children, delay = 0 }) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();

      Animated.spring(scaleAnim, {
        toValue: 1,
        ...ANIMATION_PRESETS.subtle,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Bouton standard premium pour onboarding
 * @param {string} title - Texte du bouton
 * @param {Function} onPress - Callback appui
 * @param {string} variant - Variante du bouton ('primary' | 'secondary')
 * @param {boolean} disabled - État désactivé
 * @param {boolean} loading - État de chargement
 * @param {Object} style - Styles additionnels
 */
export function StandardOnboardingButton({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false,
  loading = false,
  style 
}) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const buttonStyle = [
    styles.standardButton,
    styles[`standardButton${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    disabled && styles.standardButtonDisabled,
    style
  ];

  const textStyle = [
    styles.standardButtonText,
    styles[`standardButtonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled || loading}
    >
      <BodyText style={textStyle}>
        {loading ? 'Chargement...' : title}
      </BodyText>
    </TouchableOpacity>
  );
}

/**
 * Animation d'entrée fluide pour les écrans d'onboarding
 * @param {ReactNode} children - Contenu de l'écran
 * @param {number} delay - Délai avant animation
 */
export function AnimatedOnboardingScreen({ children, delay = 0 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          ...ANIMATION_PRESETS.gentle,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════
// 🎨 STYLES ONBOARDING
// ═══════════════════════════════════════════════════════

const getStyles = (theme) => StyleSheet.create({
  // ✨ Sparkles
  sparkleEmoji: {
    fontSize: 14,
    color: theme.colors.primary,
  },

  // 🎯 Standard Onboarding Button
  standardButton: {
    paddingVertical: theme.spacing.m + 4,
    paddingHorizontal: theme.spacing.xl + 8,
    borderRadius: theme.borderRadius.large,
    minWidth: 240,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    // Shadow premium baseline
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 12,
  },
  standardButtonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: `${theme.colors.primary}40`,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.25,
  },
  standardButtonSecondary: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOpacity: 0.15,
  },
  standardButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  standardButtonText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 0,
  },
  standardButtonTextPrimary: {
    color: theme.colors.white,
  },
  standardButtonTextSecondary: {
    color: theme.colors.text,
  },
}); 