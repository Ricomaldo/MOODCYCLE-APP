import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading1, Heading2, BodyText } from '../../components/Typography';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { theme } from '../../config/theme';
import { DevNavigation } from '../../components/DevNavigation';

export default function PromesseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserInfo } = useOnboardingStore();
  
  // Animation simple
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée simple
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStartJourney = () => {
    // Marquer le début du parcours
    updateUserInfo({ journeyStarted: true, startDate: new Date().toISOString() });
    router.push('/onboarding/200-rencontre');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* DevNavigation pour le développement */}
      <DevNavigation />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Illustration simple
        <View style={styles.illustrationContainer}>
          <View style={styles.circle}>
            <BodyText style={styles.symbol}>✨</BodyText>
          </View>
        </View> */}

        {/* Titre Hero */}
        <Heading1 style={styles.heroTitle}>
          Devenez la femme{'\n'}que vous êtes
        </Heading1>

        {/* Sous-titre */}
        <Heading2 style={styles.subtitle}>
          Votre cycle révèle{'\n'}votre vraie nature
        </Heading2>

        {/* Question engageante */}
        <BodyText style={styles.question}>
          Prête à découvrir qui vous êtes vraiment ?
        </BodyText>

        {/* Bouton Call-to-Action */}
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={handleStartJourney}
          activeOpacity={0.8}
        >
          <BodyText style={styles.buttonText}>
            Oui, je commence ce voyage
          </BodyText>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  illustrationContainer: {
    marginBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  symbol: {
    fontSize: 32,
    color: theme.getTextColorOn(theme.colors.primary),
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    color: theme.colors.primary,
    lineHeight: 32,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.text,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  question: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.textLight,
    lineHeight: 24,
    marginBottom: theme.spacing.xxl,
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    textAlign: 'center',
  },
});
