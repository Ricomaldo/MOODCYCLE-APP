//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/550-prenom.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Relation personnalisée + finalisation persona
// 🕒 Version: 2.0 - Intelligence Intégrée
// 🧭 Used in: Onboarding flow - Étape 3/4 "Ton style"
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView, TextInput, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { getPhaseSymbol } from '../../src/utils/formatters';
import { useUserStore } from '../../src/stores/useUserStore';

export default function PrenomScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { profile, updateProfile } = useUserStore();
  const intelligence = useOnboardingIntelligence('550-prenom');
  
  // 🎨 Animations Standard
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;
  
  // État du formulaire
  const [prenom, setPrenom] = useState(profile.prenom || '');
  const [isValid, setIsValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // 🎨 Séquence animations
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
    ]).start();

    // Animation cœur battant continue
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-focus sur l'input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 1000);
  }, []);

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
    
    // 🧠 Track finalisation relation
    intelligence.trackAction('relationship_initialized', {
      prenom: trimmedPrenom
    });

    // Délai pour feedback
    setTimeout(() => {
      router.push('/onboarding/600-avatar');
    }, 1500);
  };

  const generatePersonalizedPreview = () => {
    const persona = intelligence.currentPersona || 'emma';
    const messages = {
      emma: `Hey ${prenom} ! Je suis trop contente de faire ta connaissance ! 💖`,
      laure: `${prenom}, je sens qu'on va faire une super équipe ensemble.`,
      clara: `${prenom} ! Prête pour cette aventure cyclique ? 🌙`,
      sylvie: `${prenom}, je suis là pour t'accompagner dans ta sagesse cyclique.`,
      christine: `${prenom}, c'est un plaisir de vous accompagner dans ce voyage.`
    };
    return messages[persona] || messages.emma;
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="550-prenom" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* TopSection - Avatar + Message */}
          <View style={styles.topSection}>
            <Animated.View 
              style={{ 
                opacity: fadeAnim,
                transform: [{ scale: heartAnim }]
              }}
            >
              <MeluneAvatar 
                phase="ovulatory" 
                size="medium" 
                style="classic"
                animated={true}
              />
            </Animated.View>
            
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
              <BodyText style={styles.meluneMessage}>
                {intelligence.meluneMessage}
              </BodyText>
            </Animated.View>
          </View>

          {/* MainSection - Input + Preview */}
          <View style={styles.mainSection}>
            <Animated.View
              style={[
                styles.formContainer,
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
              <BodyText style={styles.subtext}>
                Créons notre lien personnel et unique ❤️
              </BodyText>

              {/* Input prénom */}
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
                
                {/* Indication validation */}
                <View style={styles.validationContainer}>
                  {prenom.length > 0 && (
                    <BodyText style={[
                      styles.validationText,
                      isValid ? styles.validationValid : styles.validationInvalid
                    ]}>
                      {isValid ? '✓ Parfait !' : `${prenom.trim().length < 2 ? 'Trop court' : 'Trop long'}`}
                    </BodyText>
                  )}
                </View>
              </View>

              {/* Preview relation personnalisée */}
              {prenom.trim().length >= 2 && (
                <Animated.View
                  style={[
                    styles.previewContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <View style={styles.previewBubble}>
                    <BodyText style={styles.previewText}>
                      {generatePersonalizedPreview()}
                    </BodyText>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          </View>

          {/* BottomSection - CTA */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                isValid && !isProcessing && styles.continueButtonActive,
                isProcessing && styles.continueButtonProcessing
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={!isValid || isProcessing}
            >
              <BodyText style={[
                styles.continueButtonText,
                isValid && !isProcessing && styles.continueButtonTextActive
              ]}>
                {isProcessing ? 
                  '💕 Initialisation de notre relation...' : 
                  isValid ? 
                    '💖 Parfait, continuons !' : 
                    'Dis-moi ton prénom'
                }
              </BodyText>
            </TouchableOpacity>
          </View>
          
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  
  topSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.l,
    marginBottom: theme.spacing.l,
    minHeight: '25%',
  },
  
  messageContainer: {
    marginTop: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
  },
  
  meluneMessage: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  
  mainSection: {
    flex: 1,
    justifyContent: 'center',
  },
  
  formContainer: {
    alignItems: 'center',
  },
  
  subtext: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  
  prenomInput: {
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    width: '80%',
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  prenomInputValid: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '08',
  },
  
  prenomInputInvalid: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '08',
  },
  
  validationContainer: {
    height: 20,
    marginTop: theme.spacing.s,
    justifyContent: 'center',
  },
  
  validationText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  validationValid: {
    color: theme.colors.success,
  },
  
  validationInvalid: {
    color: theme.colors.error,
  },
  
  previewContainer: {
    width: '100%',
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  
  previewLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.m,
    fontWeight: '500',
  },
  
  previewBubble: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    maxWidth: '90%',
  },
  
  previewText: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: theme.fonts.body,
  },
  
  bottomSection: {
    paddingBottom: theme.spacing.xl,
    minHeight: '20%',
    justifyContent: 'flex-end',
  },
  
  continueButton: {
    backgroundColor: theme.colors.border,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  continueButtonActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  continueButtonProcessing: {
    opacity: 0.7,
  },
  
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: theme.fonts.body,
    color: theme.colors.textLight,
  },
  
  continueButtonTextActive: {
    color: 'white',
  },
});