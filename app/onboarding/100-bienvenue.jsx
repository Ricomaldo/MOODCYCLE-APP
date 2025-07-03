//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/100-bienvenue.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Écran d'accueil et introduction à l'app
// 🕒 Version: 3.0 - 2025-06-23
// 🧭 Used in: Onboarding flow - Étape 1/8 "Introduction"
// 🎭 Polices: Quicksand (narrateur UI/UX) + Quintessential (Mélune)
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import { BodyText, Heading1, Heading2 } from '../../src/core';
import { useTheme } from '../../src/hooks/useTheme';
import {
  AnimatedRevealMessage, 
  AnimatedLogo, 
  AnimatedSparkle, 
  AnimatedSignature,
  StandardOnboardingButton
} from '../../src/core';
// import { LinearGradient } from 'expo-linear-gradient'; // RETIRÉ - Pas de background rouge

// 🎯 Messages séquentiels - NARRATEUR UI/UX
const WELCOME_SEQUENCE = [
  {
    id: 'reveal',
    text: "Devenez la femme que vous êtes,",
    delay: 1000,
  },
  {
    id: 'cycle',
    text: "votre cycle révèle votre vraie nature...",
    delay: 3000,
  }
];

export default function BienvenuePage() {
  // 🎨 Hooks standards
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const intelligence = useOnboardingIntelligence('100-bienvenue');
  
  // 🎯 État local simplifié
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // 🎨 Chorégraphie Simplifiée et Élégante
  useEffect(() => {
    // 1. Messages narrateur avec délai court et naturel
    WELCOME_SEQUENCE.forEach((message, index) => {
      setTimeout(() => {
        setCurrentMessageIndex(index);
      }, index * 800); // Délai fixe de 800ms entre messages
    });

    // 2. Message final Mélune après une pause appropriée
    setTimeout(() => {
      setShowFinalMessage(true);
    }, WELCOME_SEQUENCE.length * 800 + 1000); // +1s pause
  }, []);

  // 🎯 Navigation
  const handleContinue = () => {
    intelligence.trackAction('welcome_completed');
    router.push('/onboarding/200-rencontre');
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="100-bienvenue" />
      
      <View style={styles.container}>
        {/* ✨ Overlay glassmorphism pour profondeur visuelle */}
        <View style={styles.glassmorphismOverlay} />
        
        {/* Logo avec sparkles - Composants réutilisables */}
        <AnimatedLogo style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../src/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            
            {/* Sparkles animés avec composants réutilisables */}
            <View style={styles.sparklesContainer}>
              {Array.from({ length: 8 }, (_, index) => (
                <AnimatedSparkle
                  key={index}
                  index={index}
                  style={[
                    styles.sparkleWrapper,
                    styles[`sparkle${index + 1}`],
                  ]}
                />
              ))}
            </View>
          </View>
        </AnimatedLogo>

        {/* Messages séquentiels avec composants typographiques */}
        <View style={styles.messagesContainer}>
          {WELCOME_SEQUENCE.map((message, index) => (
            index <= currentMessageIndex && (
              <AnimatedRevealMessage
                key={message.id}
                delay={0} // Délai géré dans useEffect
              >
                <View style={styles.messageWrapper}>
                  <Heading2 style={styles.narratorMessage}>
                    {message.text}
                  </Heading2>
                </View>
              </AnimatedRevealMessage>
            )
          ))}
          
          {/* Message final de Mélune avec typography appropriée */}
          {showFinalMessage && (
            <AnimatedRevealMessage delay={0}>
              <View style={styles.finalMessageWrapper}>
                <BodyText style={styles.meluneMessage}>
                  Je suis <Text style={styles.meluneName}>Mélune</Text>, et je vais vous accompagner dans cette découverte.
                </BodyText>
                
                <AnimatedSignature delay={400}>
                  <Heading1 style={styles.signature}>
                    Mélune
                  </Heading1>
                </AnimatedSignature>
              </View>
            </AnimatedRevealMessage>
          )}
        </View>

        {/* Bouton continuer - Animation finale */}
        {showFinalMessage && (
          <AnimatedRevealMessage delay={1200}>
            <View style={styles.buttonContainer}>
              <StandardOnboardingButton
                title="Commencer mon voyage"
                onPress={handleContinue}
                variant="primary"
              />
            </View>
          </AnimatedRevealMessage>
        )}
      </View>
    </ScreenContainer>
  );
}

// 🎨 Styles avec différenciation des polices
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.l,
    position: 'relative',
    justifyContent: 'space-between',
  },
  
  // ✨ Overlay glassmorphism pour profondeur
  glassmorphismOverlay: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '25%',
    ...theme.getGlassmorphismStyle(theme.colors.primary, {
      bgOpacity: '03', // Très très subtil
      borderOpacity: '08',
      borderWidth: 0.5,
      shadowOpacity: 0,
    }),
    borderRadius: theme.borderRadius.large * 2,
    zIndex: -1,
  },
  
  topSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl, // Réduit pour équilibrer
    marginBottom: theme.spacing.l, // Réduit pour plus d'espace aux messages
    flex: 0.35, // Proportion fixe pour le logo
  },
  
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    width: 160,
    height: 160,
  },
  
  logoImage: {
    width: 120,
    height: 120,
  },
  
  sparklesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  sparkleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    // ✨ GLASSMORPHISM SUBTIL SPARKLES
    ...theme.getGlassmorphismStyle('#FFFFFF', {
      bgOpacity: '08', // Très subtil
      borderOpacity: '20',
      borderWidth: 0.5,
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    }),
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  
  // ✨ Positions harmonieuses des sparkles été 2025
  sparkle1: { top: '8%', left: '18%' },
  sparkle2: { top: '12%', right: '22%' },
  sparkle3: { top: '45%', right: '8%' },
  sparkle4: { bottom: '25%', right: '18%' },
  sparkle5: { bottom: '8%', left: '42%' },
  sparkle6: { bottom: '18%', left: '12%' },
  sparkle7: { top: '35%', left: '8%' },
  sparkle8: { top: '65%', right: '35%' },
  
  messagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: theme.spacing.l,
  },
  
  messageWrapper: {
    marginBottom: theme.spacing.l, // Espacement réduit
    width: '100%',
    paddingHorizontal: theme.spacing.s, // Padding pour respirer
  },
  
  // 🌊 RÉVÉLATION PROGRESSIVE - Utilise theme.typography
  narratorMessage: {
    ...theme.typography.heading2, // Heading2 = Quintessential 20px
    fontSize: 24, // Override légèrement plus grand
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 0, // Pas de margin auto
  },
  
  finalMessageWrapper: {
    marginTop: theme.spacing.xxl,
    width: '100%',
    paddingHorizontal: theme.spacing.m,
  },
  
  // ✨ MESSAGE PERSONNEL MÉLUNE - Utilise theme.typography
  meluneMessage: {
    ...theme.typography.body, // BodyText standard
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    marginBottom: 0,
  },
  
  meluneName: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600', // Plus gras pour différencier
    fontStyle: 'italic',
  },
  
  signature: {
    ...theme.typography.heading1, // Heading1 = Quintessential 24px
    fontSize: 28, // Override plus grand
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 0,
    letterSpacing: 1,
  },
  
  // ✨ CONTAINER BOUTON - Position fixée en bas
  buttonContainer: {
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },
});