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

export default function PrenomScreen() {
  // 🧠 INTELLIGENCE HOOK
  const intelligence = useOnboardingIntelligence('550-prenom');
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // 🎨 Animations Standard
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;
  
  // État du formulaire
  const [prenom, setPrenom] = useState('');
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
    intelligence.updateProfile({
      prenom: trimmedPrenom,
    });
    
    // 🧠 INTELLIGENCE : Finalisation persona
    const finalPersona = intelligence.currentPersona || intelligence.userProfile.suggestedPersona || 'emma';
    
    intelligence.updateProfile({
      assignedPersona: finalPersona,
      relationshipInitialized: true,
      personaConfidence: 0.9 // Haute confidence avec prénom
    });
    
    // 🧠 Track finalisation relation
    intelligence.trackAction('relationship_initialized', {
      prenom: trimmedPrenom,
      finalPersona,
      confidence: 0.9
    });

    // Délai pour feedback
    setTimeout(() => {
      router.push('/onboarding/600-persona');
    }, 1500);
  };

  const generatePersonalizedPreview = () => {
    if (prenom.trim().length < 2) {
      return "Dis-moi ton prénom pour personnaliser notre relation !";
    }
    
    const persona = intelligence.currentPersona || intelligence.userProfile.suggestedPersona || 'emma';
    const phase = intelligence.userProfile.currentPhase || 'follicular';
    
    const previews = {
      emma: {
        menstrual: `Coucou ${prenom.trim()} ! Comment tu te sens dans cette phase cocooning ? ${getPhaseSymbol('menstrual')}`,
        follicular: `Hey ${prenom.trim()} ! Je sens que ton énergie remonte ! ✨`,
        ovulatory: `Bonjour ma belle ${prenom.trim()} ! Tu rayonnes aujourd'hui ! 💫`,
        luteal: `Salut ${prenom.trim()}, comment tu gères cette phase d'automne ? ${getPhaseSymbol('luteal')}`
      },
      laure: {
        menstrual: `Bonjour ${prenom.trim()}. Comment organisez-vous votre repos aujourd'hui ?`,
        follicular: `${prenom.trim()}, quels sont vos objectifs pour cette phase créative ?`,
        ovulatory: `${prenom.trim()}, comment optimisez-vous cette période de pic énergétique ?`,
        luteal: `${prenom.trim()}, comment finalisez-vous vos projets en cours ?`
      },
      clara: {
        menstrual: `Salut ${prenom.trim()} ! Ready pour du self-care de compétition ? 🛁`,
        follicular: `Hey ${prenom.trim()} ! On recharge les batteries à fond ! ⚡`,
        ovulatory: `YESS ${prenom.trim()} ! Tu es au TOP ! Qu'est-ce qu'on fait de génial ? 🚀`,
        luteal: `Hello ${prenom.trim()} ! Comment on transforme cette phase en force ? 💪`
      },
      sylvie: {
        menstrual: `Bonjour ma douce ${prenom.trim()}, comment honores-tu ton besoin de repos ?`,
        follicular: `${prenom.trim()}, quelle belle énergie je ressens... Comment la cultives-tu ?`,
        ovulatory: `Ma chère ${prenom.trim()}, tu es radieuse ! Comment savoures-tu cette plénitude ?`,
        luteal: `${prenom.trim()}, comment accueilles-tu cette sagesse d'automne ?`
      },
      christine: {
        menstrual: `Bonjour ${prenom.trim()}, comment prenez-vous soin de vous aujourd'hui ?`,
        follicular: `${prenom.trim()}, cette belle énergie qui renaît... Comment l'accompagnez-vous ?`,
        ovulatory: `${prenom.trim()}, vous rayonnez de sérénité. Comment cultivez-vous cela ?`,
        luteal: `${prenom.trim()}, comment honorez-vous cette phase de transition ?`
      }
    };
    
    return previews[persona]?.[phase] || previews[persona]?.follicular || previews.emma.follicular;
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
                  <BodyText style={styles.previewLabel}>
                    💬 Aperçu de notre relation :
                  </BodyText>
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