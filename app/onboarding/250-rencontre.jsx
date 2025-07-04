//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/250-rencontre.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Écran de choix du parcours personnel
// 🔄 Cycle: Onboarding - Étape 3/8
// ─────────────────────────────────────────────────────────
//

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import OnboardingScreen from '../../src/core/layout/OnboardingScreen';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { 
  AnimatedRevealMessage,
  AnimatedOnboardingScreen,
  AnimatedCascadeCard,
  ANIMATION_DURATIONS,
  ANIMATION_PRESETS
} from '../../src/core/ui/animations';

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
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { profile, updateProfile } = useUserStore();
  const intelligence = useOnboardingIntelligence('250-rencontre');
  
  // États
  const [selectedChoice, setSelectedChoice] = useState(profile.journeyChoice || null);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice.id);
    updateProfile({ journeyChoice: choice.id });
    
    setTimeout(() => {
      router.push('/onboarding/300-etape-vie');
    }, ANIMATION_DURATIONS.elegant);
  };

  return (
    <OnboardingScreen currentScreen="250-rencontre">
      <AnimatedOnboardingScreen>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
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
                <AnimatedCascadeCard
                  key={choice.id}
                  index={index}
                  style={styles.cardContainer}
                >
                  <TouchableOpacity
                    style={[
                      styles.choiceCard,
                      selectedChoice === choice.id && styles.choiceCardSelected,
                    ]}
                    onPress={() => handleChoiceSelect(choice)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.choiceHeader}>
                      <BodyText style={styles.choiceIcon}>{choice.icon}</BodyText>
                      <BodyText style={styles.choiceTitle}>
                        {choice.title}
                      </BodyText>
                    </View>
                    
                    <BodyText style={styles.choiceDescription}>
                      {choice.description}
                    </BodyText>
                  </TouchableOpacity>
                </AnimatedCascadeCard>
              ))}
            </View>
          </View>
        </ScrollView>
      </AnimatedOnboardingScreen>
    </OnboardingScreen>
  );
}

const getStyles = (theme) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
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
    paddingTop: theme.spacing.xxl,
  },
  
  choicesContainer: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.l,
  },
  
  cardContainer: {
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  choiceCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
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
    fontSize: 24,
    marginRight: theme.spacing.m,
    width: 48,
    height: 48,
    textAlign: 'center',
    lineHeight: 48,
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
}); 