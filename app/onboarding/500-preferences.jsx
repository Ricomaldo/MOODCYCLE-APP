//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/500-preferences.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Matrice thérapeutique 6D + Intelligence temps réel
// 🕒 Version: 2.0 - Intelligence Intégrée
// 🧭 Used in: Onboarding flow - Étape 3/4 "Ton style"
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import OnboardingScreen from '../../src/core/layout/OnboardingScreen';
import { BodyText, Caption } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';

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

const SLIDER_LABELS = ['Pas du tout', 'Un peu', 'Moyennement', 'Beaucoup', 'Passionnément'];

export default function PreferencesScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { preferences, updatePreferences } = useUserStore();
  const intelligence = useOnboardingIntelligence('500-preferences');
  
  // 🎨 Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const slidersAnim = useRef(new Animated.Value(0)).current;
  
  // 📊 État préférences avec valeurs par défaut sécurisées
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
      // S'assurer que toutes les clés sont présentes
      return {
        ...defaultPreferences,
        ...preferences
      };
    }
    return defaultPreferences;
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [dynamicMessage, setDynamicMessage] = useState(
    intelligence?.meluneMessage || "Découvrons ensemble tes préférences thérapeutiques !"
  );

  const [lastTap, setLastTap] = useState(null);
  const DOUBLE_TAP_DELAY = 300;

  // 🎨 Gestion des animations
  useEffect(() => {
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
      Animated.timing(slidersAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getDominantDimensions = (prefs) => {
    return Object.entries(prefs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key);
  };

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

  const handleStepContinue = () => {
    if (currentStep === 1) {
      const dominant = getDominantDimensions(currentPreferences);
      const persona = intelligence.currentPersona || 'emma';
      
      const summaryMessages = {
        emma: `Génial ! Tes priorités : ${dominant.map(d => THERAPEUTIC_DIMENSIONS.find(td => td.key === d)?.title).join(', ')} ✨`,
        laure: `Profil défini. Focus : ${dominant.map(d => THERAPEUTIC_DIMENSIONS.find(td => td.key === d)?.title).join(', ')}.`,
        clara: `Wow ! Ton profil unique est prêt ! 🚀`,
        sylvie: `Tes préférences reflètent ta sagesse intérieure.`,
        christine: `Votre profil thérapeutique est établi avec sagesse.`
      };
      
      setDynamicMessage(summaryMessages[persona] || summaryMessages.emma);
      handleFinalize();
    }
  };

  const handleFinalize = () => {
    // 🔧 Sauvegarde matrice
    updatePreferences(currentPreferences);
    
    // 🧠 Profil thérapeutique complet
    const therapeuticProfile = {
      dominantDimensions: getDominantDimensions(currentPreferences),
      averageIntensity: Object.values(currentPreferences).reduce((a, b) => a + b, 0) / 6,
      specializations: Object.entries(currentPreferences)
        .filter(([, value]) => value >= 4)
        .map(([key]) => key),
      avoidances: Object.entries(currentPreferences)
        .filter(([, value]) => value <= 1)
        .map(([key]) => key)
    };
    
    intelligence.updateProfile({ therapeuticProfile });
    
    // 🧠 Track profil complet
    intelligence.trackAction('therapeutic_profile_complete', {
      profile: therapeuticProfile,
      dominantCount: therapeuticProfile.dominantDimensions.length,
      averageScore: therapeuticProfile.averageIntensity
    });
    
    setTimeout(() => {
      router.push('/onboarding/550-prenom');
    }, 500);
  };

  const renderCurrentStep = () => {
    return (
      <View style={styles.stepContainer}>
        {THERAPEUTIC_DIMENSIONS.map((dimension) => {
          const value = currentPreferences[dimension.key];
          const borderColor = getColorWithIntensity(dimension.color, value);
          return (
            <TouchableOpacity
              key={dimension.key}
              style={[
                styles.dimensionCard,
                { borderColor }
              ]}
              onPress={() => handleTap(dimension.key)}
              activeOpacity={0.7}
            >
              <View style={styles.dimensionHeader}>
                <Text style={styles.dimensionIcon}>{dimension.icon}</Text>
                <Text style={styles.dimensionTitle}>{dimension.title}</Text>
              </View>
              <Text style={styles.dimensionDescription}>
                {dimension.description}
              </Text>
              {value > 0 && (
                <View style={[
                  styles.intensityBadge, 
                  { backgroundColor: getColorWithIntensity(dimension.color, value) }
                ]}>
                  <Text style={styles.intensityText}>
                    {value === 3 ? 'Intéressé' : 'Passionné'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <OnboardingScreen currentScreen="500-preferences">
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >


        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.mainSection,
              { opacity: slidersAnim }
            ]}
          >
            <BodyText style={styles.message}>
              {dynamicMessage}
            </BodyText>

            {renderCurrentStep()}
          </Animated.View>
        </ScrollView>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleStepContinue}
          activeOpacity={0.8}
        >
          <BodyText style={styles.continueButtonText}>
            {currentStep === 3 ? 'Terminer' : 'Continuer'}
          </BodyText>
        </TouchableOpacity>
      </Animated.View>
    </OnboardingScreen>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  
  messageContainer: {
    marginTop: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
  },
  
  message: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  
  stepContainer: {
    flex: 1,
  },
  
  dimensionCard: {
    padding: theme.spacing.m,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.m,
  },
  
  dimensionCardSelected: {
    borderColor: theme.colors.primary,
  },
  
  dimensionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  dimensionIcon: {
    fontSize: 20,
    marginRight: theme.spacing.s,
  },
  
  dimensionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  
  dimensionDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  
  sliderContainer: {
    marginBottom: theme.spacing.xl,
  },
  
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  sliderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  
  sliderValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    minWidth: 20,
    textAlign: 'center',
  },
  
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  sliderStep: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  sliderLabel: {
    fontSize: 12,
    color: theme.colors.text,
  },
  
  summaryContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    marginVertical: theme.spacing.l,
  },
  
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  
  dominantContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  dominantItem: {
    alignItems: 'center',
  },
  
  dominantIcon: {
    fontSize: 18,
    marginBottom: theme.spacing.s,
  },
  
  dominantTitle: {
    fontSize: 14,
    color: theme.colors.text,
  },
  
  dominantValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  
  continueButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.l,
  },
  
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  
  intensityBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

const formatDateFrench = (date) => {
  try {
    const d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(d);
  } catch (e) {
    return '';
  }
};