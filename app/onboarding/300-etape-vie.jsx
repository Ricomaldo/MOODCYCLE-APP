//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/300-etape-vie.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Sélection étape de vie + personnalisation par âge
// 🕒 Version: 3.0 - Allégé et direct
// 🧭 Used in: Onboarding flow - Étape 2/4 "Ton rythme"
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';

export default function ConfianceScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { updateProfile } = useUserStore();
  
  // 🎯 Tranches d'âge avec descriptions psychologiques
  const AGE_RANGES = [
    {
      id: '18-25',
      title: 'Exploratrice (18-25 ans)',
      description: 'Découverte de ton cycle et de ta nature féminine',
      icon: '🌸',
      color: theme.colors.phases.follicular,
    },
    {
      id: '26-35',
      title: 'Créatrice (26-35 ans)', 
      description: 'Équilibre entre ambitions et sagesse cyclique',
      icon: '🌿',
      color: theme.colors.phases.ovulatory,
    },
    {
      id: '36-45',
      title: 'Sage (36-45 ans)',
      description: 'Maîtrise de ton pouvoir féminin et transmission',
      icon: '🌙',
      color: theme.colors.phases.luteal,
    },
    {
      id: '46-55',
      title: 'Transformation (46-55 ans)',
      description: 'Honorer les transitions et la sagesse acquise',
      icon: '✨',
      color: theme.colors.phases.menstrual,
    },
    {
      id: '55+',
      title: 'Liberté (55+ ans)',
      description: 'Épanouissement au-delà des cycles traditionnels',
      icon: '🦋',
      color: theme.colors.primary,
    },
  ];
  
  // 🎨 Animations simples
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  const [selectedAge, setSelectedAge] = useState(null);

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

  const handleAgeSelect = (ageRange) => {
    setSelectedAge(ageRange.id);
    
    // ✅ Simple enregistrement du choix
    updateProfile({ ageRange: ageRange.id });
    
    // Navigation simple après feedback visuel
    setTimeout(() => {
      router.push('/onboarding/400-cycle');
    }, 1000);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="300-etape-vie" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Section principale - Choix âge */}
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
                Pour t'accompagner selon ton étape de vie
              </BodyText>
              
              <BodyText style={styles.subtext}>
                Choisis la période qui résonne avec toi
              </BodyText>
            </Animated.View>

            {/* Choix d'âge */}
            <View style={styles.choicesContainer}>
              {AGE_RANGES.map((ageRange) => (
                <TouchableOpacity
                  key={ageRange.id}
                  style={[
                    styles.ageCard,
                    selectedAge === ageRange.id && styles.ageCardSelected,
                    { borderLeftColor: ageRange.color }
                  ]}
                  onPress={() => handleAgeSelect(ageRange)}
                  activeOpacity={0.8}
                  disabled={selectedAge !== null}
                >
                  <View style={styles.ageHeader}>
                    <View style={[styles.ageIcon, { backgroundColor: ageRange.color + '20' }]}>
                      <BodyText style={styles.iconText}>{ageRange.icon}</BodyText>
                    </View>
                    <BodyText style={styles.ageTitle}>
                      {ageRange.title}
                    </BodyText>
                  </View>
                  
                  <BodyText style={styles.ageDescription}>
                    {ageRange.description}
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
  
  mainSection: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: theme.spacing.xl,
  },
  
  questionContainer: {
    marginBottom: theme.spacing.xl,
  },
  
  question: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
    lineHeight: 30,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
  },
  
  subtext: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.textLight,
    lineHeight: 22,
  },
  
  choicesContainer: {
    gap: theme.spacing.m,
  },
  
  ageCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  ageCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  
  ageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  ageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  
  iconText: {
    fontSize: 18,
  },
  
  ageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  
  ageDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
});