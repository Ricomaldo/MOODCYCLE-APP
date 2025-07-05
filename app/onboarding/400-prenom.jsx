//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/400-prenom.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Écran de personnalisation de la relation
// 🔄 Cycle: Onboarding - Étape 5/8
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView, TextInput, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
  },
  content: {
    flex: 1,
  },
  messageSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
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
    paddingTop: theme.spacing.xxl,
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
  buttonContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
  },
});

export default function PrenomScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { profile, updateProfile } = useUserStore();
  const intelligence = useOnboardingIntelligence('400-prenom');
  
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
    
    // Message de confirmation personnalisé
    if (intelligence.personaConfidence >= 0.4) {
      intelligence.getPersonalizedMessage('confirmation', { prenom: trimmedPrenom });
    }
    
    // 🧠 Track finalisation relation
    intelligence.trackAction('relationship_initialized', {
      prenom: trimmedPrenom
    });

    // Navigation avec délai élégant
    setTimeout(() => {
      router.push('/onboarding/500-avatar');
    }, ANIMATION_DURATIONS.elegant);
  };

  const generatePersonalizedPreview = () => {
    if (!prenom.trim()) return null;
    
    if (intelligence.personaConfidence >= 0.4) {
      return intelligence.getPersonalizedMessage('preview', { prenom: prenom.trim() });
    }
    
    return `${prenom.trim()} ! Je suis trop contente de faire ta connaissance ! 💖`;
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} style={styles.container}>
      <AnimatedOnboardingScreen>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Message de Mélune */}
          <View style={styles.messageSection}>
            <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
              <BodyText style={[styles.meluneMessage, { fontFamily: 'Quintessential' }]}>
                {intelligence.personaConfidence >= 0.4 
                  ? intelligence.getPersonalizedMessage('question')
                  : "Comment aimerais-tu que je t'appelle ?"}
              </BodyText>
            </AnimatedRevealMessage>
          </View>

          {/* 2. Section principale */}
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
                  />
                </View>

                {/* 4. Preview relation */}
                {prenom.trim().length >= 2 && (
                  <AnimatedRevealMessage delay={200}>
                    <View style={styles.previewBubble}>
                      <BodyText style={styles.previewText}>
                        {generatePersonalizedPreview()}
                      </BodyText>
                    </View>
                  </AnimatedRevealMessage>
                )}
              </View>
            </AnimatedCascadeCard>
          </View>

          {/* 5. Bouton avec animation autonome */}
          <OnboardingButton
            onPress={handleSubmit}
            title={
              isProcessing ? 
                '💕 Initialisation de notre relation...' : 
                isValid ? 
                  '💖 Parfait, continuons !' : 
                  'Dis-moi ton prénom'
            }
            disabled={!isValid || isProcessing}
            loading={isProcessing}
            showAnimation={true}
            delay={ANIMATION_DURATIONS.welcomeButton}
            style={styles.buttonContainer}
          />
        </ScrollView>
      </AnimatedOnboardingScreen>
    </ScreenContainer>
  );
}