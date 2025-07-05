//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/100-bienvenue.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Page d'accueil de l'onboarding - Version optimisée et validée
// 🔒 Version: 1.0.0 - 2024-03-19
// 📋 Changements validés:
// - Structure épurée sans OnboardingNavigation
// - Animations fluides et distinctes (messages, logo, nom, bouton)
// - Typographie et espacements optimisés
// - Performance et accessibilité vérifiées
// ⚠️ IMPORTANT: Ne pas modifier ce fichier sans validation explicite
// 🧩 Type: Onboarding Screen
// 🕒 Version: 3.0 - 2025-06-23
// 🧭 Used in: Onboarding flow - Étape 1/8 "Introduction"
// 🎭 Polices: Quicksand (narrateur UI/UX) + Quintessential (Mélune)
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { BodyText, Heading1 } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import {
  AnimatedRevealMessage,
  AnimatedSparkle,
  AnimatedLogo,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS
} from '../../src/core/ui/animations';
import OnboardingButton from '../../src/features/onboarding/shared/OnboardingButton';

export default function BienvenueScreen() {
  const { theme, colors, fonts, spacing } = useTheme();
  const styles = getStyles({ colors, fonts, spacing });
  const intelligence = useOnboardingIntelligence('100-bienvenue');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Entrée progressive de la page avec les presets
    const { pageEnter } = ANIMATION_CONFIGS.onboarding.welcome;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        ...pageEnter.fade
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...pageEnter.slide
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    intelligence.trackAction('welcome_completed');
    router.push('/onboarding/200-bonjour');
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Messages d'introduction */}
        <View style={styles.messagesContainer}>
          <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
            <BodyText style={styles.message}>
              Devenez la femme que vous êtes,
            </BodyText>
          </AnimatedRevealMessage>

          <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeSecondMessage}>
            <BodyText style={styles.message}>
              votre cycle révèle votre vraie nature...
            </BodyText>
          </AnimatedRevealMessage>
        </View>

        {/* Logo et sparkles */}
        <View style={styles.logoSection}>
          <AnimatedLogo style={styles.logoContainer}>
            <Image
              source={require('../../src/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.sparklesContainer}>
              {Array.from({ length: 6 }, (_, i) => (
                <AnimatedSparkle
                  key={i}
                  index={i}
                  style={[
                    styles.sparkleWrapper,
                    styles[`sparkle${i + 1}`]
                  ]}
                />
              ))}
            </View>
          </AnimatedLogo>

          <View style={styles.appNameContainer}>
            <Heading1 style={styles.appName}>
              MoodCycle
            </Heading1>
          </View>
        </View>

        {/* Bouton */}
        <View style={styles.buttonContainer}>
          <OnboardingButton onPress={handleContinue} />
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const getStyles = ({ colors, fonts, spacing }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },

  messagesContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
    marginTop: spacing.xl,
  },

  message: {
    fontFamily: fonts.body,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.text,
    maxWidth: 320,
  },

  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -spacing.xxl,
  },

  logoContainer: {
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },

  logo: {
    width: 160,
    height: 160,
  },

  sparklesContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
  },

  sparkleWrapper: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Positions des sparkles
  sparkle1: { top: '10%', left: '20%' },
  sparkle2: { top: '5%', right: '30%' },
  sparkle3: { top: '40%', right: '5%' },
  sparkle4: { bottom: '30%', right: '20%' },
  sparkle5: { bottom: '10%', left: '30%' },
  sparkle6: { bottom: '40%', left: '5%' },

  appNameContainer: {
    marginTop: spacing.xl,
    minHeight: 60,
    justifyContent: 'center',
    paddingVertical: spacing.m,
  },

  appName: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 40,
  },

  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.m,
  },
});