//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/onboarding/OnboardingNavigation.jsx
// 🧩 Type: Navigation Component
// 📚 Description: Navigation onboarding avec progression 4 étapes groupées
// 🕒 Version: 1.0 - 2025-06-23
// 🧭 Used in: Onboarding screens (100-800)
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BodyText, Caption } from '../../core/ui/typography';
import { useUserStore } from '../../stores/useUserStore';

// Mapping écrans vers étapes groupées
const SCREEN_MAPPING = {
  '100-bienvenue': { step: 1, title: 'Bienvenue' },
  '200-bonjour': { step: 1, title: 'Bonjour' },
  '250-rencontre': { step: 1, title: 'Rencontre' },
  '300-etape-vie': { step: 1, title: 'Étape de vie' },
  '400-prenom': { step: 2, title: 'Personnalisation' },
  '500-avatar': { step: 2, title: 'Avatar' },
  '600-terminology': { step: 2, title: 'Terminologie' },
  '700-cycle': { step: 3, title: 'Cycle' },
  '800-preferences': { step: 3, title: 'Préférences' },
  '900-essai': { step: 4, title: 'Essai' },
  '950-demarrage': { step: 4, title: 'Démarrage' }
};

const STEP_LABELS = {
  1: 'Connexion',
  2: 'Personnalisation',
  3: 'Configuration',
  4: 'Finalisation'
};

export default function OnboardingNavigation({ currentScreen, canGoBack = true }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const currentStep = SCREEN_MAPPING[currentScreen]?.step || 1;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const forwardButtonAnim = useRef(new Animated.Value(0)).current;
  const navBarAnim = useRef(new Animated.Value(0)).current;
  const { profile } = useUserStore();

  // Calculer la dernière étape validée
  const lastValidatedStep = useMemo(() => {
    if (profile.completed) return 4;
    if (profile.prenom) return 3;
    if (profile.ageRange) return 2;
    if (profile.journeyChoice) return 1;
    return 1;
  }, [profile]);

  useEffect(() => {
    // Animation d'entrée de la barre de navigation - Fade in simple
    Animated.timing(navBarAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animation progression
    Animated.timing(progressAnim, {
      toValue: currentStep,
      duration: 400,
      useNativeDriver: false,
    }).start();

    // Animation bouton retour - activé seulement à partir de l'écran 500 (personnalisation)
    const shouldShowBackButton = canGoBack && 
      !['100-bienvenue', '200-bonjour', '250-rencontre', '300-etape-vie', '400-prenom'].includes(currentScreen);
    
    Animated.timing(backButtonAnim, {
      toValue: shouldShowBackButton ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animation bouton avant - désactivé sur 200
    const shouldShowForwardButton = lastValidatedStep > currentStep && 
      currentScreen !== '200-bonjour';
    
    Animated.timing(forwardButtonAnim, {
      toValue: shouldShowForwardButton ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep, canGoBack, currentScreen, lastValidatedStep]);

  const handleBack = () => {
    const shouldAllowBack = canGoBack && 
      !['100-bienvenue', '200-bonjour', '250-rencontre', '300-etape-vie', '400-prenom'].includes(currentScreen);
    
    if (shouldAllowBack) {
      router.back();
    }
  };

  const handleForward = () => {
    const shouldAllowForward = lastValidatedStep > currentStep && 
      currentScreen !== '200-bonjour';
    
    if (shouldAllowForward) {
      // Trouver le prochain écran dans la séquence
      const screenSequence = Object.entries(SCREEN_MAPPING);
      const currentIndex = screenSequence.findIndex(([screen]) => screen === currentScreen);
      if (currentIndex >= 0 && currentIndex < screenSequence.length - 1) {
        const nextScreen = screenSequence[currentIndex + 1][0];
        router.push(`/onboarding/${nextScreen}`);
      }
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: navBarAnim
        }
      ]}
    >
      {/* Bouton retour animé */}
      <Animated.View
        style={[
          styles.backButtonContainer,
          {
            opacity: backButtonAnim,
            transform: [
              {
                scale: backButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          disabled={!canGoBack || ['100-bienvenue', '200-bonjour', '250-rencontre', '300-etape-vie', '400-prenom'].includes(currentScreen)}
        >
          <Feather name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Progression centrale */}
      <View style={styles.progressContainer}>
        {/* Bullets progression */}
        <View style={styles.bullets}>
          {[1, 2, 3, 4].map(step => (
            <Animated.View
              key={step}
              style={[
                styles.bullet,
                {
                  backgroundColor: step <= currentStep ? 
                    theme.colors.primary : 
                    theme.colors.border,
                  transform: [{
                    scale: step === currentStep ? 1.2 : 1
                  }]
                }
              ]}
            />
          ))}
        </View>

        {/* Label étape actuelle */}
        <View style={styles.labelContainer}>
          <Caption style={styles.stepLabel}>
            Étape {currentStep}/4
          </Caption>
          <BodyText style={styles.stepName}>
            {STEP_LABELS[currentStep]}
          </BodyText>
        </View>
      </View>

      {/* Bouton avant animé */}
      <Animated.View
        style={[
          styles.forwardButtonContainer,
          {
            opacity: forwardButtonAnim,
            transform: [
              {
                scale: forwardButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.forwardButton}
          onPress={handleForward}
          activeOpacity={0.7}
          disabled={lastValidatedStep <= currentStep || currentScreen === '200-bonjour'}
        >
          <Feather name="chevron-right" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '20',
  },
  
  backButtonContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  bullets: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  bullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  
  labelContainer: {
    alignItems: 'center',
  },
  
  stepLabel: {
    color: theme.colors.textLight,
    fontSize: 12,
  },
  
  stepName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  
  rightSpace: {
    width: 40,
  },
  
  forwardButtonContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  
  forwardButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});