//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/300-etape-vie.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Choix de l'étape de vie et personnalisation
// 🔄 Cycle: Onboarding - Étape 4/8
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Text, Animated } from 'react-native';
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
  const { theme } = useTheme();
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
    <OnboardingScreen currentScreen="300-etape-vie">
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
            <AnimatedRevealMessage delay={ANIMATION_DURATIONS.normal}>
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
                <AnimatedCascadeCard
                  key={ageRange.id}
                  index={index}
                  style={styles.cardContainer}
                >
                  <TouchableOpacity
                    style={[
                      styles.ageCard,
                      selectedAge === ageRange.id && styles.ageCardSelected,
                      { borderLeftColor: ageRange.color }
                    ]}
                    onPress={() => handleAgeSelect(ageRange)}
                    activeOpacity={0.8}
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
                </AnimatedCascadeCard>
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
  
  messageContainer: {
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
  
  mainSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  
  subtext: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
  },
  
  choicesContainer: {
    gap: theme.spacing.m,
  },
  
  cardContainer: {
    // Pour que l'animation de fade n'affecte pas le shadow
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  ageCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  
  iconText: {
    fontSize: 24,
    lineHeight: 48,
    textAlign: 'center',
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
});