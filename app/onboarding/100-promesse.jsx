//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/100-promesse.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Éveil transformateur + initialisation méthodologie Jeza
// 🕒 Version: 2.0 - Intelligence Intégrée
// 🧭 Used in: Onboarding flow - Étape 1/4 "Connexion" (Premier écran)
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { BodyText } from '../../src/core/ui/Typography';
import { theme } from '../../src/config/theme';

export default function PromesseScreen() {
  // 🧠 INTELLIGENCE HOOK
  const intelligence = useOnboardingIntelligence('100-promesse');
  
  // 🎨 Animations Standard
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // 🎨 Séquence d'animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(400),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      // Animation sparkles continue
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const handleStartJourney = async () => {
    setIsInitializing(true);
    
    // 🧠 INTELLIGENCE : Initialisation du parcours
    intelligence.updateProfile({
      journeyStarted: true,
      startDate: new Date().toISOString(),
    });
    
    // 🧠 Track démarrage
    intelligence.trackAction('journey_started', {
      startDate: new Date().toISOString(),
      source: 'promesse_screen'
    });

    // Délai pour feedback visuel
    setTimeout(() => {
      router.push('/onboarding/200-rencontre');
    }, 800);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* TopSection - Logo + Sparkles */}
        <View style={styles.topSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ translateY: slideAnim }],
                opacity: slideAnim.interpolate({
                  inputRange: [-20, 0],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            {/* Logo M floral placeholder */}
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>M</Text>
            </View>
            
            {/* Sparkles animés */}
            <Animated.View
              style={[
                styles.sparklesContainer,
                {
                  opacity: sparkleAnim,
                  transform: [
                    {
                      scale: sparkleAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.8, 1.2, 0.8],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={[styles.sparkle, styles.sparkle1]}>✨</Text>
              <Text style={[styles.sparkle, styles.sparkle2]}>✨</Text>
              <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
            </Animated.View>
          </Animated.View>
        </View>

        {/* MainSection - Message transformateur */}
        <View style={styles.mainSection}>
          <Animated.View
            style={[
              styles.messageContainer,
              {
                transform: [{ translateY: slideAnim }],
                opacity: slideAnim.interpolate({
                  inputRange: [-20, 0],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <BodyText style={styles.heroTitle}>
              Devenez la femme{'\n'}que vous êtes
            </BodyText>
            
            <BodyText style={styles.promiseText}>
              Votre cycle révèle votre vraie nature.{'\n'}
              Laissez-moi vous guider vers cette découverte.
            </BodyText>
            
            <BodyText style={styles.subtitle}>
              {intelligence.meluneMessage}
            </BodyText>
          </Animated.View>
        </View>

        {/* BottomSection - CTA */}
        <View style={styles.bottomSection}>
          <Animated.View
            style={[
              styles.ctaContainer,
              {
                transform: [{ translateY: slideAnim }],
                opacity: slideAnim.interpolate({
                  inputRange: [-20, 0],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.ctaButton,
                isInitializing && styles.ctaButtonLoading,
              ]}
              onPress={handleStartJourney}
              activeOpacity={0.8}
              disabled={isInitializing}
            >
              <BodyText style={styles.ctaText}>
                {isInitializing ? 'Initialisation...' : 'Oui, je commence ce voyage'}
              </BodyText>
            </TouchableOpacity>
            
            <BodyText style={styles.disclaimer}>
              Un parcours de découverte de 4 minutes
            </BodyText>
          </Animated.View>
        </View>
        
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  
  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.xl,
    minHeight: '25%',
  },
  
  logoContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  logoText: {
    fontSize: 36,
    fontFamily: theme.fonts.heading,
    color: 'white',
    fontWeight: 'bold',
  },
  
  sparklesContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  
  sparkle: {
    position: 'absolute',
    fontSize: 16,
  },
  
  sparkle1: {
    top: 10,
    right: 20,
  },
  
  sparkle2: {
    bottom: 15,
    left: 15,
  },
  
  sparkle3: {
    top: 30,
    left: -10,
  },
  
  mainSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  
  messageContainer: {
    alignItems: 'center',
  },
  
  heroTitle: {
    fontSize: 28,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 36,
  },
  
  promiseText: {
    fontSize: 18,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    lineHeight: 26,
    fontFamily: theme.fonts.body,
  },
  
  subtitle: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  
  bottomSection: {
    paddingBottom: theme.spacing.xl,
    minHeight: '20%',
    justifyContent: 'flex-end',
  },
  
  ctaContainer: {
    alignItems: 'center',
  },
  
  ctaButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: '80%',
  },
  
  ctaButtonLoading: {
    opacity: 0.7,
  },
  
  ctaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
  
  disclaimer: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.m,
    fontStyle: 'italic',
  },
});