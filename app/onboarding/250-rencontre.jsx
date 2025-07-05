//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/250-rencontre.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Écran de choix du parcours personnel
// 🔄 Cycle: Onboarding - Étape 3/8
// ─────────────────────────────────────────────────────────
//

import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { 
  AnimatedRevealMessage,
  AnimatedOnboardingScreen,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS
} from '../../src/core/ui/animations';
import OnboardingCard from '../../src/features/onboarding/shared/OnboardingCard';

// 🎯 Choix simples et directs
const JOURNEY_CHOICES = [
  {
    id: 'body_disconnect',
    title: 'Retrouver mon corps',
    description: 'Je veux renouer avec mon corps',
    icon: '🌸',
  },
  {
    id: 'hiding_nature',
    title: 'Révéler ma nature',
    description: 'Je veux assumer qui je suis vraiment',
    icon: '🌿',
  },
  {
    id: 'emotional_control',
    title: 'Comprendre mes émotions',
    description: 'Je veux apprivoiser mes émotions',
    icon: '💫',
  },
];

export default function RencontreScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { profile, updateProfile } = useUserStore();
  const intelligence = useOnboardingIntelligence('250-rencontre');
  
  // États
  const [selectedChoice, setSelectedChoice] = useState(profile.journeyChoice || null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardsAnim = useRef(JOURNEY_CHOICES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Entrée progressive de la page avec les presets
    const { pageEnter } = ANIMATION_CONFIGS.onboarding.welcome;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        ...pageEnter.fade
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...pageEnter.slide
      }),
    ]).start(() => {
      // Animation en cascade des cartes
      cardsAnim.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.elegant,
          delay: ANIMATION_DURATIONS.welcomeFirstMessage + (index * 200), // Délai progressif
          ...ANIMATION_CONFIGS.onboarding.welcome.elementEnter,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice.id);
    updateProfile({ journeyChoice: choice.id });
    
    // Animation de sortie en cascade inversée
    const exitAnimations = cardsAnim.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 0,
        duration: ANIMATION_DURATIONS.elegant,
        delay: ((JOURNEY_CHOICES.length - 1) - index) * 100,
        ...ANIMATION_CONFIGS.onboarding.welcome.elementExit,
        useNativeDriver: true,
      })
    );

    Animated.parallel(exitAnimations).start(() => {
      router.push('/onboarding/300-etape-vie');
    });
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} style={styles.container}>
      <AnimatedOnboardingScreen>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            {/* Message de Mélune */}
            <View style={styles.messageSection}>
              <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
                <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                  {selectedChoice 
                    ? intelligence.getPersonalizedMessage('journey', { journeyChoice: selectedChoice }) 
                    : "Je sens que tu es en quête de quelque chose de profond... Confie-moi ce qui t'appelle"}
                </BodyText>
              </AnimatedRevealMessage>
            </View>

            {/* Choix du parcours */}
            <View style={styles.choicesSection}>
              <View style={styles.choicesContainer}>
                {JOURNEY_CHOICES.map((choice, index) => (
                  <Animated.View
                    key={choice.id}
                    style={[
                      styles.cardWrapper,
                      {
                        opacity: cardsAnim[index],
                        transform: [{
                          translateY: cardsAnim[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                          })
                        }]
                      }
                    ]}
                  >
                    <OnboardingCard
                      variant="choice"
                      icon={choice.icon}
                      title={choice.title}
                      description={choice.description}
                      isSelected={selectedChoice === choice.id}
                      onPress={() => handleChoiceSelect(choice)}
                      index={index}
                    />
                  </Animated.View>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </AnimatedOnboardingScreen>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingTop: theme.spacing.xl,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  message: {
    fontSize: 20,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 28,
    maxWidth: 300,
  },
  
  choicesSection: {
    flex: 1,
    paddingTop: theme.spacing.l, // Réduit de xxl à l
  },
  
  choicesContainer: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.l,
  },

  cardWrapper: {
    width: '100%',
  },
}); 