//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/OnboardingNavigation.jsx
// 🧩 Type: Navigation Component
// 📚 Description: Navigation onboarding avec progression 4 étapes groupées
// 🕒 Version: 1.0 - 2025-06-23
// 🧭 Used in: Onboarding screens (100-800)
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BodyText, Caption } from '../../core/ui/typography';

// Mapping écrans vers étapes groupées
const SCREEN_TO_STEP = {
  '100-bienvenue': 1,
  '200-rencontre': 1,
  '300-etape-vie': 2,
  '375-age': 2,
  '400-cycle': 2,
  '500-preferences': 3,
  '550-prenom': 3,
  '600-avatar': 3,
  '650-terminology': 3,
  '700-essai': 4,
  '800-demarrage': 4,
};

const STEP_LABELS = {
  1: 'Connexion',
  2: 'Ton rythme',
  3: 'Ton style',
  4: 'Prête !',
};

export default function OnboardingNavigation({ currentScreen, canGoBack = true }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const currentStep = SCREEN_TO_STEP[currentScreen] || 1;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation progression
    Animated.timing(progressAnim, {
      toValue: currentStep,
      duration: 400,
      useNativeDriver: false,
    }).start();

    // Animation bouton retour
    Animated.timing(backButtonAnim, {
      toValue: canGoBack && currentScreen !== '100-promesse' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep, canGoBack, currentScreen]);

  const handleBack = () => {
    if (canGoBack && currentScreen !== '100-promesse') {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
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
          disabled={!canGoBack || currentScreen === '100-promesse'}
        >
          <Feather name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Progression centrale */}
      <View style={styles.progressContainer}>
        {/* Bullets progression */}
        <View style={styles.bulletsContainer}>
          {[1, 2, 3, 4].map((step) => {
            const isActive = step <= currentStep;
            const isCurrent = step === currentStep;

            return (
              <View key={step} style={styles.bulletWrapper}>
                <Animated.View
                  style={[
                    styles.bullet,
                    {
                      backgroundColor: isActive
                        ? theme.colors.primary
                        : theme.colors.border,
                      transform: [
                        {
                          scale: progressAnim.interpolate({
                            inputRange: [step - 0.5, step, step + 0.5],
                            outputRange: [1, isCurrent ? 1.2 : 1, 1],
                            extrapolate: 'clamp',
                          }),
                        },
                      ],
                    },
                  ]}
                />
                {step < 4 && <View style={styles.connector} />}
              </View>
            );
          })}
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

      {/* Espace équilibré à droite */}
      <View style={styles.rightSpace} />
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    backgroundColor: theme.colors.background,
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
  
  bulletsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  bulletWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  bullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  
  connector: {
    width: 20,
    height: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
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
});