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
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import { AnimatedRevealMessage } from '../../src/core/ui/animations';

export default function PrenomScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { profile, updateProfile } = useUserStore();
  const intelligence = useOnboardingIntelligence('400-prenom');
  
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
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
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
    
    // Message de confirmation personnalisé
    if (intelligence.personaConfidence >= 0.4) {
      const confirmation = intelligence.getPersonalizedMessage('confirmation', { prenom: trimmedPrenom });
      // console.log('Confirmation:', confirmation); // Debug à retirer en production
    }
    
    // 🧠 Track finalisation relation
    intelligence.trackAction('relationship_initialized', {
      prenom: trimmedPrenom
    });

    // Délai pour feedback
    setTimeout(() => {
      router.push('/onboarding/500-avatar');
    }, 1500);
  };

  const generatePersonalizedPreview = () => {
    if (!prenom.trim()) return null;
    
    if (intelligence.personaConfidence >= 0.4) {
      return intelligence.getPersonalizedMessage('preview', { prenom: prenom.trim() });
    }
    
    return `${prenom.trim()} ! Je suis trop contente de faire ta connaissance ! 💖`;
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>      
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
              <AnimatedRevealMessage delay={800}>
                <BodyText style={[styles.meluneMessage, { fontFamily: 'Quintessential' }]}>
                  {intelligence.personaConfidence >= 0.4 
                    ? intelligence.getPersonalizedMessage('question')
                    : "Comment aimerais-tu que je t'appelle ?"}
                </BodyText>
              </AnimatedRevealMessage>
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
  },
  
  topSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
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
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  
  formContainer: {
    alignItems: 'center',
  },
  
  subtext: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
  },
  
  inputContainer: {
    width: '100%',
    marginBottom: theme.spacing.l,
  },
  
  prenomInput: {
    width: '100%',
    height: 50,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.l,
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  prenomInputValid: {
    borderColor: theme.colors.success,
  },
  
  prenomInputInvalid: {
    borderColor: theme.colors.error,
  },
  
  validationContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.s,
    height: 20,
  },
  
  validationText: {
    fontSize: 14,
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
  },
  
  previewBubble: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.l,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  
  previewText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.l,
    alignItems: 'center',
    opacity: 0.5,
  },
  
  continueButtonActive: {
    opacity: 1,
  },
  
  continueButtonProcessing: {
    opacity: 0.7,
  },
  
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  continueButtonTextActive: {
    color: 'white',
  },
});