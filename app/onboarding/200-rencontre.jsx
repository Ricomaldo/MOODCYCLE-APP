//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/200-rencontre.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Connexion Melune + ACTIVATION INTELLIGENCE
// 🕒 Version: 2.0 - Intelligence Intégrée
// 🧭 Used in: Onboarding flow - Étape 1/4 "Connexion"
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core/ui/Typography';
import { useTheme } from '../../src/hooks/useTheme';

// 🎯 Choix profonds qui touchent l'âme
const JOURNEY_CHOICES = [
  {
    id: 'body_disconnect',
    title: 'Retrouver mon corps',
    description: 'Je veux renouer avec mon corps',
    icon: '🌸',
    gradient: ['#FFB6C1', '#FF69B4'],
    // Messages adaptatifs pour feedback
    successMessage: "Je comprends... Retrouver cette connexion perdue avec ton corps ✨"
  },
  {
    id: 'hiding_nature',
    title: 'Révéler ma nature',
    description: 'Je veux assumer qui je suis vraiment',
    icon: '🌿',
    gradient: ['#98FB98', '#32CD32'],
    successMessage: "Quelle courage de vouloir révéler ta vraie nature 🌿"
  },
  {
    id: 'emotional_control',
    title: 'Comprendre mes émotions',
    description: 'Je veux apprivoiser mes émotions',
    icon: '💫',
    gradient: ['#DDA0DD', '#9370DB'],
    successMessage: "Les émotions sont des guides puissants quand on les comprend 💫"
  },
];

export default function RencontreScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  // 🧠 INTELLIGENCE HOOK
  const intelligence = useOnboardingIntelligence('200-rencontre');
  
  // 🎨 Animations Standard
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const choicesAnim = useRef(new Animated.Value(0)).current;
  
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [dynamicMessage, setDynamicMessage] = useState(null);
  const [suggestedPersona, setSuggestedPersona] = useState(null);

  useEffect(() => {
    // 🎨 Séquence animation cohérente
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
      Animated.delay(600),
      Animated.timing(choicesAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice.id);
    
    // 🔧 Sauvegarde données
    intelligence.updateProfile({
      journeyChoice: choice.id,
      motivation: choice.title,
    });

    // 🧠 INTELLIGENCE : Calcul persona suggéré
    const suggestedPersona = intelligence.calculatePersonaSuggestion({
      journeyChoice: choice.id
    });
    
    if (suggestedPersona) {
      setSuggestedPersona(suggestedPersona);
      intelligence.updateProfile({ 
        suggestedPersona,
        personaConfidence: 0.8 
      });
    }
    
    // 🧠 Track engagement
    intelligence.trackAction('journey_choice_selected', { 
      choice: choice.id,
      suggestedPersona 
    });
    
    // 🧠 Message adaptatif selon choix
    setDynamicMessage(choice.successMessage);
    
    // 🎨 Auto-navigation avec délai pour feedback
    setTimeout(() => {
      router.push('/onboarding/300-confiance');
    }, 1500);
  };

  // Message Melune adaptatif selon état
  const getMeluneMessage = () => {
    if (selectedChoice && dynamicMessage) {
      return dynamicMessage;
    }
    
    // Message par défaut depuis intelligence
    return intelligence.meluneMessage || "Je te vois... cette femme puissante en toi qui attend de se révéler";
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="200-rencontre" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* TopSection - Avatar + Message Melune */}
          <View style={styles.topSection}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <MeluneAvatar 
                phase="menstrual" 
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
                {getMeluneMessage()}
              </BodyText>
            </Animated.View>
          </View>

          {/* MainSection - Question + Choix */}
          <View style={styles.mainSection}>
            <Animated.View style={{ opacity: choicesAnim }}>
              <BodyText style={styles.question}>
                Qu'est-ce qui t'amène vers moi ?
              </BodyText>
              
              <BodyText style={styles.subtext}>
                Choisis ce qui résonne profondément en toi
              </BodyText>
            </Animated.View>

            {/* Choix avec animation unifiée */}
            <Animated.View
              style={[
                styles.choicesContainer,
                { 
                  opacity: choicesAnim,
                  transform: [{
                    translateY: choicesAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  }]
                }
              ]}
            >
              {JOURNEY_CHOICES.map((choice, index) => (
                <TouchableOpacity
                  key={choice.id}
                  style={[
                    styles.choiceCard,
                    selectedChoice === choice.id && styles.choiceCardSelected,
                  ]}
                  onPress={() => handleChoiceSelect(choice)}
                  activeOpacity={0.8}
                  disabled={selectedChoice !== null}
                >
                  <View style={styles.choiceHeader}>
                    <View style={styles.choiceIcon}>
                      <BodyText style={styles.iconText}>{choice.icon}</BodyText>
                    </View>
                    <BodyText style={styles.choiceTitle}>
                      {choice.title}
                    </BodyText>
                  </View>
                  
                  <BodyText style={styles.choiceDescription}>
                    {choice.description}
                  </BodyText>
                  
                  {/* Indicateur sélection avec persona suggéré */}
                  {selectedChoice === choice.id && (
                    <View style={styles.selectedIndicator}>
                      <BodyText style={styles.selectedText}>✓ Choisi</BodyText>
                      {suggestedPersona && (
                        <BodyText style={styles.personaHint}>
                          Persona suggéré: {suggestedPersona}
                        </BodyText>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>

            {/* Debug info en développement */}
            {__DEV__ && selectedChoice && (
              <View style={styles.debugInfo}>
                <BodyText style={styles.debugText}>
                  🔧 Debug: {selectedChoice} → {suggestedPersona}
                </BodyText>
                <BodyText style={styles.debugText}>
                  Intelligence: {JSON.stringify(intelligence.userProfile, null, 2)}
                </BodyText>
              </View>
            )}
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
    marginBottom: theme.spacing.xl,
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
    justifyContent: 'flex-start',
  },
  
  question: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
    lineHeight: 28,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
  },
  
  subtext: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  
  choicesContainer: {
    gap: theme.spacing.l,
  },
  
  choiceCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  
  choiceCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  
  choiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  choiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  
  iconText: {
    fontSize: 20,
  },
  
  choiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  
  choiceDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.m,
    right: theme.spacing.m,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  personaHint: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },
  
  debugInfo: {
    marginTop: theme.spacing.l,
    padding: theme.spacing.m,
    backgroundColor: '#000',
    borderRadius: theme.borderRadius.medium,
  },
  
  debugText: {
    color: '#00ff00',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});