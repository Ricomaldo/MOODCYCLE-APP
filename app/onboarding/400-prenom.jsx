//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/400-prenom.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Écran de personnalisation de la relation
// 🔄 Cycle: Onboarding - Étape 5/8
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView, TextInput, Keyboard } from 'react-native';
import { router } from 'expo-router';
// Intelligence supprimée - userStore suffit pour cette étape
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import { 
  AnimatedRevealMessage,
  AnimatedOnboardingScreen,
  AnimatedCascadeCard,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS
} from '../../src/core/ui/animations';
import OnboardingButton from '../../src/features/onboarding/shared/OnboardingButton';

// Styles
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.m,
  },
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
  },
  meluneMessage: {
    fontSize: 20,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 28,
    maxWidth: 300,
  },
  mainSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center', // Centrer le contenu
  },
  formContainer: {
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  subtext: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
  },
  prenomInput: {
    ...theme.glassmorphism.getStyle(theme.colors.primary, {
      bgOpacity: '10',
      borderOpacity: '20',
    }),
    fontSize: 18,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    textAlign: 'center',
    borderRadius: theme.borderRadius.medium,
    minHeight: 44, // ✅ WCAG 2.1 AA - Zone de touch minimum
  },
  prenomInputValid: {
    ...theme.glassmorphism.getStyle(theme.colors.success, {
      bgOpacity: '10',
      borderOpacity: '20',
    }),
  },
  prenomInputInvalid: {
    ...theme.glassmorphism.getStyle(theme.colors.error, {
      bgOpacity: '10',
      borderOpacity: '20',
    }),
  },
  previewContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.m,
  },
  previewBubble: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    maxWidth: 300,
  },
  previewText: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
  },
  validationContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.m,
  },
  validationText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  validationValid: {
    color: theme.colors.success,
  },
  validationInvalid: {
    color: theme.colors.error,
  },
  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
    alignItems: 'center',
  },
});

export default function PrenomScreen() {
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { profile, updateProfile } = useUserStore();
  
  // État du formulaire
  const [prenom, setPrenom] = useState(profile.prenom || '');
  const [isValid, setIsValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);

  // Validation du prénom
  useEffect(() => {
    const trimmedPrenom = prenom.trim();
    setIsValid(trimmedPrenom.length >= 2 && trimmedPrenom.length <= 12);
  }, [prenom]);

  const handlePrenomChange = (text) => {
    // Nettoyer l'input (lettres + espaces uniquement)
    const cleanText = text.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    setPrenom(cleanText);
  };

  const handleSubmit = async () => {
    if (!isValid || isProcessing) return;
    
    setIsProcessing(true);
    Keyboard.dismiss();
    
    const trimmedPrenom = prenom.trim();
    
    // 🔧 Sauvegarde prénom
    updateProfile({
      prenom: trimmedPrenom,
    });
    
    // Tracking simplifié - juste sauvegarder dans le store suffit

    // Navigation avec délai élégant
    setTimeout(() => {
      router.push('/onboarding/500-avatar');
    }, ANIMATION_DURATIONS.elegant);
  };

  const personalizedPreview = useMemo(() => {
    if (!prenom.trim()) return null;
    return `${prenom.trim()} ! Je suis trop contente de faire ta connaissance ! 💖`;
  }, [prenom]);

  const buttonTitle = useMemo(() => {
    if (isProcessing) return '💕 Initialisation de notre relation...';
    if (isValid) return '💖 Parfait, continuons !';
    return 'Dis-moi ton prénom';
  }, [isProcessing, isValid]);

  return (
    <ScreenContainer edges={['bottom']} style={styles.container}>
      <AnimatedOnboardingScreen>
        <View style={styles.content}>
          {/* 1. Message de Mélune */}
          <View style={styles.messageSection}>
            <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
              <BodyText style={[styles.meluneMessage, { fontFamily: 'Quintessential' }]}>
                Comment aimerais-tu que je t'appelle ?
              </BodyText>
            </AnimatedRevealMessage>
          </View>

          {/* 2. Section principale - flex pour occuper l'espace */}
          <View style={styles.mainSection}>
            <AnimatedCascadeCard index={0}>
              <View style={styles.formContainer}>
                <BodyText style={styles.subtext}>
                  Créons notre lien personnel et unique ❤️
                </BodyText>

                {/* 3. Input prénom */}
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={[
                      styles.prenomInput,
                      isValid && styles.prenomInputValid,
                      !isValid && prenom.length > 0 && styles.prenomInputInvalid
                    ]}
                    value={prenom}
                    onChangeText={handlePrenomChange}
                    onSubmitEditing={handleSubmit}
                    placeholder="Ton prénom..."
                    placeholderTextColor={theme.colors.textLight}
                    maxLength={12}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    accessibilityRole="none"
                    accessibilityLabel="Champ de saisie du prénom"
                    accessibilityHint="Entrez votre prénom pour personnaliser votre relation avec Mélune"
                  />
                </View>

                {/* 4. Preview relation */}
                {personalizedPreview && (
                  <AnimatedRevealMessage delay={200}>
                    <View 
                      style={styles.previewBubble}
                      accessibilityLabel="Aperçu de la relation personnalisée"
                    >
                      <BodyText style={styles.previewText}>
                        {personalizedPreview}
                      </BodyText>
                    </View>
                  </AnimatedRevealMessage>
                )}
              </View>
            </AnimatedCascadeCard>
          </View>

          {/* 3. Bouton en bas - position fixe */}
          <View style={styles.bottomSection}>
            <OnboardingButton
              onPress={handleSubmit}
              title={buttonTitle}
              disabled={!isValid || isProcessing}
              loading={isProcessing}
              showAnimation={true}
              delay={ANIMATION_DURATIONS.welcomeButton}
            />
          </View>
        </View>
      </AnimatedOnboardingScreen>
    </ScreenContainer>
  );
}