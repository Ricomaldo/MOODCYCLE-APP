//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/800-preferences.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Configuration des préférences thérapeutiques
// 🔄 Cycle: Onboarding - Étape 6/8
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { 
  AnimatedOnboardingScreen,
  AnimatedRevealMessage,
  AnimatedOnboardingButton,
  StandardOnboardingButton,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS
} from '../../src/core/ui/animations';
import { Ionicons } from '@expo/vector-icons';
import { ObservationInvitation } from '../../src/features/onboarding/observation/ObservationInvitation';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useUserIntelligence } from '../../src/stores/useUserIntelligence';
import OnboardingCard from '../../src/features/onboarding/shared/OnboardingCard';

// 🎨 Dimensions thérapeutiques avec couleurs
const THERAPEUTIC_DIMENSIONS = [
  {
    key: 'symptoms',
    title: 'Symptômes physiques',
    description: 'Conseils douleurs, énergie, bien-être',
    icon: '🌸',
    color: '#FF6B8A'
  },
  {
    key: 'moods',
    title: 'Gestion émotionnelle',
    description: 'Compréhension ressentis, équilibre',
    icon: '💫',
    color: '#8B5CF6'
  },
  {
    key: 'phyto',
    title: 'Phytothérapie',
    description: 'Plantes, huiles essentielles, naturel',
    icon: '🌿',
    color: '#10B981'
  },
  {
    key: 'phases',
    title: 'Énergie cyclique',
    description: 'Sagesse phases, rythmes féminins',
    icon: '🌙',
    color: '#3B82F6'
  },
  {
    key: 'lithotherapy',
    title: 'Lithothérapie',
    description: 'Cristaux, pierres, énergies subtiles',
    icon: '💎',
    color: '#F59E0B'
  },
  {
    key: 'rituals',
    title: 'Rituels bien-être',
    description: 'Méditation, soins, pratiques',
    icon: '🕯️',
    color: '#EC4899'
  }
];

export default function PreferencesScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { preferences, updatePreferences } = useUserStore();
  const intelligence = useOnboardingIntelligence('800-preferences');
  const { addObservation } = useCycleStore();
  const { trackObservation } = useUserIntelligence();
  
  // États
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [hasShownObservation, setHasShownObservation] = useState(false);
  
  const defaultPreferences = {
    symptoms: 0,
    moods: 0,
    phyto: 0,
    phases: 0,
    lithotherapy: 0,
    rituals: 0
  };
  
  const [currentPreferences, setCurrentPreferences] = useState(() => {
    if (preferences) {
      return {
        ...defaultPreferences,
        ...preferences
      };
    }
    return defaultPreferences;
  });

  const selectedCount = Object.values(currentPreferences).filter(v => v > 0).length;

  // Pré-sélections intelligentes selon persona
  useEffect(() => {
    if (intelligence.currentPersona && intelligence.personaConfidence >= 0.6 && Object.values(currentPreferences).every(v => v === 0)) {
      const preselections = {
        emma: { moods: 3, phases: 3 },
        laure: { moods: 3, phases: 5, rituals: 3 },
        clara: { symptoms: 3, moods: 3, phases: 5 },
        sylvie: { symptoms: 3, phyto: 3 },
        christine: { phases: 3, lithotherapy: 3, rituals: 3 }
      };
      
      const suggestions = preselections[intelligence.currentPersona];
      if (suggestions) {
        setCurrentPreferences(prev => ({
          ...prev,
          ...suggestions
        }));
      }
    }
  }, [intelligence.currentPersona, intelligence.personaConfidence]);

  const handlePreferenceChange = (dimension, value) => {
    setCurrentPreferences(prev => ({
      ...prev,
      [dimension]: value
    }));
  };

  const handleTap = (dimension) => {
    const currentValue = currentPreferences[dimension];
    let newValue;
    
    if (currentValue === 0) newValue = 3;      // Premier tap -> Intéressé
    else if (currentValue === 3) newValue = 5;  // Deuxième tap -> Passionné
    else newValue = 0;                         // Troisième tap -> Désélectionné
    
    handlePreferenceChange(dimension, newValue);
  };

  const getColorWithIntensity = (color, value) => {
    if (value === 0) return theme.colors.border;
    if (value === 3) return color + '80'; // Version claire pour "Intéressé"
    return color; // Couleur pleine pour "Passionné"
  };

  const handleContinue = () => {
    // Sauvegarder les préférences
    updatePreferences(currentPreferences);
    
    // Track les préférences
    intelligence.trackAction('preferences_configured', {
      preferences: currentPreferences,
      selectedCount: Object.values(currentPreferences).filter(v => v > 0).length,
      hasObservations: hasShownObservation
    });
    
    router.push('/onboarding/900-essai');
  };

  // Fonction de gestion de l'observation
  const handleObservation = (data) => {
    // Sauvegarder l'observation dans le cycle
    addObservation(data.mood, data.energy, 'Première observation pendant onboarding');
    
    // Alimenter l'intelligence
    trackObservation({
      mood: data.mood,
      energy: data.energy,
      timestamp: Date.now(),
      context: 'onboarding_preferences'
    });
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
    
    if (offsetY > 0 && showScrollIndicator) {
      setShowScrollIndicator(false);
    }
  };

  const scrollIndicatorOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const getSelectedCount = () => {
    return Object.values(currentPreferences).filter(v => v > 0).length;
  };

  const getPersonalizedFeedback = () => {
    const count = getSelectedCount();
    if (intelligence.personaConfidence >= 0.4) {
      if (count === 0) return intelligence.getPersonalizedMessage('zero_selected');
      if (count <= 2) return intelligence.getPersonalizedMessage('some_selected');
      return intelligence.getPersonalizedMessage('many_selected');
    }
    // Fallbacks par défaut
    if (count === 0) return "Prends ton temps pour explorer...";
    if (count <= 2) return "Belle sélection ! Continue si tu veux";
    return "Quelle richesse dans tes choix !";
  };

  return (
    <ScreenContainer edges={['bottom']} style={styles.container}>
      <AnimatedOnboardingScreen>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Message de Mélune avec feedback intégré */}
          <View style={styles.messageSection}>
            <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
              <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                {intelligence.personaConfidence >= 0.4
                  ? intelligence.getPersonalizedMessage('message')
                  : "Chaque femme a sa propre sagesse... Dis-moi ce qui résonne en toi"}
              </BodyText>
            </AnimatedRevealMessage>
            
            <AnimatedRevealMessage 
              key={getSelectedCount()} 
              delay={300}
              style={styles.feedbackContainer}
            >
              <BodyText style={styles.feedbackText}>
                {getPersonalizedFeedback()}
              </BodyText>
            </AnimatedRevealMessage>
          </View>

          {/* Section principale */}
          <View style={styles.dimensionsContainer}>
            {THERAPEUTIC_DIMENSIONS.map((dimension, index) => (
              <OnboardingCard
                key={dimension.key}
                variant="preference"
                icon={dimension.icon}
                title={dimension.title}
                description={dimension.description}
                onPress={() => handleTap(dimension.key)}
                color={dimension.color}
                value={currentPreferences[dimension.key]}
                index={index}
                delay={ANIMATION_DURATIONS.welcomeFirstMessage + 500}
              />
            ))}
          </View>

          {/* Invitation à l'observation */}
          {getSelectedCount() > 0 && !hasShownObservation && (
            <ObservationInvitation
              persona={intelligence.currentPersona || 'emma'}
              theme={theme}
              onObservation={(data) => {
                handleObservation(data);
                setHasShownObservation(true);
              }}
              visible={getSelectedCount() >= 2}
            />
          )}
        </ScrollView>

        {/* Indicateur de scroll */}
        {showScrollIndicator && (
          <Animated.View style={[styles.scrollIndicator, { opacity: scrollIndicatorOpacity }]}>
            <BodyText style={styles.scrollIndicatorText}>Découvrir plus</BodyText>
            <Ionicons name="chevron-down" size={24} color={theme.colors.textLight} />
          </Animated.View>
        )}

        {/* Section bouton */}
        <View style={styles.bottomSection}>
          <AnimatedOnboardingButton {...ANIMATION_CONFIGS.onboarding.welcome.button}>
            <StandardOnboardingButton
              title="Continuer"
              onPress={handleContinue}
              variant="primary"
            />
          </AnimatedOnboardingButton>
        </View>
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
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.xxl + 60,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  
  message: {
    fontSize: 20,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 28,
    maxWidth: 300,
  },
  
  dimensionsContainer: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.m,
  },
  
  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  
  scrollIndicator: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    backgroundColor: 'transparent',
  },
  
  scrollIndicatorText: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  
  feedbackContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.l,
    alignItems: 'center',
  },

  feedbackText: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  container: {
    flex: 1,
  },
});