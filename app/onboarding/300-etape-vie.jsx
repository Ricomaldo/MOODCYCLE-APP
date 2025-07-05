//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/300-etape-vie.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Choix de l'étape de vie et personnalisation
// 🔄 Cycle: Onboarding - Étape 4/8
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, Animated } from 'react-native';
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
  ANIMATION_PRESETS
} from '../../src/core/ui/animations';
import OnboardingCard from '../../src/features/onboarding/shared/OnboardingCard';

// 🎯 Tranches d'âge avec descriptions psychologiques
const AGE_RANGES_DATA = [
  {
    id: '18-25',
    title: 'Exploratrice (18-25 ans)',
    description: 'Découverte de ton cycle et de ta nature féminine',
    icon: '🌸',
  },
  {
    id: '26-35',
    title: 'Créatrice (26-35 ans)', 
    description: 'Équilibre entre ambitions et sagesse cyclique',
    icon: '🌿',
  },
  {
    id: '36-45',
    title: 'Sage (36-45 ans)',
    description: 'Maîtrise de ton pouvoir féminin et transmission',
    icon: '🌙',
  },
  {
    id: '46-55',
    title: 'Transformation (46-55 ans)',
    description: 'Honorer les transitions et la sagesse acquise',
    icon: '✨',
  },
  {
    id: '55+',
    title: 'Liberté (55+ ans)',
    description: 'Épanouissement au-delà des cycles traditionnels',
    icon: '🦋',
  }
];

export default function EtapeVieScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { profile, updateProfile } = useUserStore();
  const intelligence = useOnboardingIntelligence('300-etape-vie');
  
  // États
  const [selectedAge, setSelectedAge] = useState(profile.ageRange || null);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const indicatorOpacity = useRef(new Animated.Value(1)).current;

  // Préparation des données avec les couleurs du thème
  const AGE_RANGES = AGE_RANGES_DATA.map((range, index) => ({
    ...range,
    color: index === AGE_RANGES_DATA.length - 1 
      ? theme.colors.primary 
      : theme.colors.phases[['follicular', 'ovulatory', 'luteal', 'menstrual'][index]]
  }));

  const handleAgeSelect = (ageRange) => {
    setSelectedAge(ageRange.id);
    updateProfile({ ageRange: ageRange.id });
    
    // Afficher l'encouragement si persona disponible
    if (intelligence.personaConfidence >= 0.4) {
      setShowEncouragement(true);
    }
    
    intelligence.trackAction('age_range_selected', {
      range: ageRange.id
    });
    
    setTimeout(() => {
      router.push('/onboarding/400-prenom');
    }, ANIMATION_DURATIONS.elegant);
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // Dès qu'on commence à scroller, on cache l'indicateur
    if (offsetY > 10) {
      Animated.timing(indicatorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} style={styles.container}>
      <AnimatedOnboardingScreen>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Message de Mélune */}
          <View style={styles.messageSection}>
            <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
              <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                {intelligence.personaConfidence >= 0.4 
                  ? intelligence.getPersonalizedMessage('message')
                  : "Chaque étape de la vie d'une femme porte sa propre magie... Dis-moi où tu en es de ton voyage"}
              </BodyText>
            </AnimatedRevealMessage>
          </View>

          {/* Section principale */}
          <View style={styles.mainSection}>
            <View style={styles.choicesContainer}>
              {AGE_RANGES.map((ageRange, index) => (
                <OnboardingCard
                  key={ageRange.id}
                  variant="lifecycle"
                  icon={ageRange.icon}
                  title={ageRange.title}
                  description={ageRange.description}
                  isSelected={selectedAge === ageRange.id}
                  onPress={() => handleAgeSelect(ageRange)}
                  color={ageRange.color}
                  index={index}
                  delay={ANIMATION_DURATIONS.welcomeFirstMessage + 500}
                />
              ))}
            </View>
            
            {/* Encouragement personnalisé après sélection */}
            {showEncouragement && selectedAge && intelligence.personaConfidence >= 0.4 && (
              <View style={styles.encouragementContainer}>
                <AnimatedRevealMessage delay={300}>
                  <BodyText style={styles.encouragementText}>
                    {intelligence.getPersonalizedMessage('encouragement')}
                  </BodyText>
                </AnimatedRevealMessage>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Indicateur de scroll avec animation */}
        <Animated.View 
          style={[
            styles.scrollIndicator,
            { opacity: indicatorOpacity }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.scrollIndicatorText}>↓</Text>
          <BodyText style={styles.scrollIndicatorLabel}>Découvrir plus</BodyText>
        </Animated.View>
      </AnimatedOnboardingScreen>
    </ScreenContainer>
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
  
  mainSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  
  choicesContainer: {
    gap: theme.spacing.m,
  },

  scrollIndicator: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface + '80',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.medium,
  },

  scrollIndicatorText: {
    fontSize: 20,
    color: theme.colors.primary,
    marginBottom: -4,
  },

  scrollIndicatorLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
  },

  encouragementContainer: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
    alignItems: 'center',
  },

  encouragementText: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  container: {
    flex: 1,
  },
});