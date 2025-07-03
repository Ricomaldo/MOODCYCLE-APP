//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/200-rencontre.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Première connexion avec Melune - Simple et authentique
// 🕒 Version: 3.0 - Allégé et direct
// 🧭 Used in: Onboarding flow - Étape 1/4 "Connexion"
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';

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
  
  // 🎨 Animations simples
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  const [selectedChoice, setSelectedChoice] = useState(null);

  useEffect(() => {
    // Animation simple et fluide
    Animated.parallel([
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
  }, []);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice.id);
    
    // Navigation simple après feedback visuel
    setTimeout(() => {
      router.push('/onboarding/300-etape-vie');
    }, 1000);
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
          
          {/* Avatar Melune */}
          <View style={styles.avatarSection}>
            <MeluneAvatar 
              phase="menstrual" 
              size="medium" 
              style="classic"
              animated={true}
            />
          </View>

          {/* Question unique et directe */}
          <View style={styles.mainSection}>
            <Animated.View
              style={[
                styles.questionContainer,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <BodyText style={styles.question}>
                Qu'est-ce qui t'amène vers moi ?
              </BodyText>
            </Animated.View>

            {/* Choix simplifiés */}
            <View style={styles.choicesContainer}>
              {JOURNEY_CHOICES.map((choice) => (
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
                    <BodyText style={styles.choiceIcon}>{choice.icon}</BodyText>
                    <BodyText style={styles.choiceTitle}>
                      {choice.title}
                    </BodyText>
                  </View>
                  
                  <BodyText style={styles.choiceDescription}>
                    {choice.description}
                  </BodyText>
                </TouchableOpacity>
              ))}
            </View>
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
  
  avatarSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  
  mainSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  
  questionContainer: {
    marginBottom: theme.spacing.xl,
  },
  
  question: {
    fontSize: 22,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 30,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
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