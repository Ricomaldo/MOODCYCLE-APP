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
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core/ui/Typography';
import { useTheme } from '../../src/hooks/useTheme';

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
  // 🧠 INTELLIGENCE HOOK
  const intelligence = useOnboardingIntelligence('500-preferences');
  
  // 🎨 Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const slidersAnim = useRef(new Animated.Value(0)).current;
  
  // 📊 État préférences (initialisé avec les valeurs du store)
  const [preferences, setPreferences] = useState(
    intelligence.userProfile.preferences || {
      symptoms: 3,
      moods: 3,
      phyto: 3,
      phases: 3,
      lithotherapy: 3,
      rituals: 3
    }
  );
  
  const [currentStep, setCurrentStep] = useState(1); // 1: intro, 2: sliders, 3: résumé
  const [dynamicMessage, setDynamicMessage] = useState(intelligence.meluneMessage);

  useEffect(() => {
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
      Animated.delay(300),
      Animated.timing(slidersAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePreferenceChange = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    
    // 🧠 Message adaptatif selon modification
    const dimension = THERAPEUTIC_DIMENSIONS.find(d => d.key === key);
    const persona = intelligence.currentPersona || 'emma';
    
    const contextualMessages = {
      emma: {
        high: `Super ! Tu kiffes ${dimension.title.toLowerCase()} ! ✨`,
        medium: `Cool, ${dimension.title.toLowerCase()} t'intéresse 😊`,
        low: `Ok, ${dimension.title.toLowerCase()} n'est pas ta priorité.`
      },
      laure: {
        high: `Excellent choix pour ${dimension.title.toLowerCase()}.`,
        medium: `${dimension.title} : niveau d'intérêt équilibré.`,
        low: `${dimension.title} : priorité faible notée.`
      },
      clara: {
        high: `Yaass ! ${dimension.title} va transformer ton expérience ! 🔥`,
        medium: `${dimension.title} fait partie de ton voyage !`,
        low: `Pas de souci, ${dimension.title} restera en arrière-plan.`
      },
      sylvie: {
        high: `${dimension.title} résonne profondément en toi.`,
        medium: `${dimension.title} fait partie de ton équilibre.`,
        low: `${dimension.title} n'est pas essentiel pour toi.`
      },
      christine: {
        high: `${dimension.title} : une sagesse importante pour vous.`,
        medium: `${dimension.title} : un intérêt mesuré.`,
        low: `${dimension.title} : ce n'est pas votre priorité.`
      }
    };
    
    const level = value >= 4 ? 'high' : value >= 2 ? 'medium' : 'low';
    const message = contextualMessages[persona]?.[level] || contextualMessages.emma[level];
    setDynamicMessage(message);
    
    // 🧠 Track préférence
    intelligence.trackAction('preference_adjusted', { 
      dimension: key, 
      value, 
      persona
    });
  };

  const getDominantDimensions = (prefs) => {
    return Object.entries(prefs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key);
  };

  const handleStepContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      
      if (currentStep === 1) {
        setDynamicMessage("Parfait ! Ajuste l'intensité de chaque dimension selon tes envies.");
      } else if (currentStep === 2) {
        const dominant = getDominantDimensions(preferences);
        const persona = intelligence.currentPersona || 'emma';
        
        const summaryMessages = {
          emma: `Génial ! Tes priorités : ${dominant.map(d => THERAPEUTIC_DIMENSIONS.find(td => td.key === d)?.title).join(', ')} ✨`,
          laure: `Profil défini. Focus : ${dominant.map(d => THERAPEUTIC_DIMENSIONS.find(td => td.key === d)?.title).join(', ')}.`,
          clara: `Wow ! Ton profil unique est prêt ! 🚀`,
          sylvie: `Tes préférences reflètent ta sagesse intérieure.`,
          christine: `Votre profil thérapeutique est établi avec sagesse.`
        };
        
        setDynamicMessage(summaryMessages[persona] || summaryMessages.emma);
      }
    } else {
      handleFinalize();
    }
  };

  const handleFinalize = () => {
    // 🔧 Sauvegarde matrice
    intelligence.updatePreferences(preferences);
    
    // 🧠 Profil thérapeutique complet
    const therapeuticProfile = {
      dominantDimensions: getDominantDimensions(preferences),
      averageIntensity: Object.values(preferences).reduce((a, b) => a + b, 0) / 6,
      specializations: Object.entries(preferences)
        .filter(([, value]) => value >= 4)
        .map(([key]) => key),
      avoidances: Object.entries(preferences)
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

  const renderSlider = (dimension) => {
    const value = preferences[dimension.key];
    
    return (
      <View key={dimension.key} style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <View style={styles.sliderTitleRow}>
            <BodyText style={styles.sliderIcon}>{dimension.icon}</BodyText>
            <BodyText style={styles.sliderTitle}>{dimension.title}</BodyText>
          </View>
          <BodyText style={styles.sliderValue}>{value}</BodyText>
        </View>
        
        <BodyText style={styles.sliderDescription}>{dimension.description}</BodyText>
        
        <View style={styles.sliderTrack}>
          {[0, 1, 2, 3, 4, 5].map(step => (
            <TouchableOpacity
              key={step}
              style={[
                styles.sliderStep,
                { backgroundColor: step <= value ? dimension.color : theme.colors.border }
              ]}
              onPress={() => handlePreferenceChange(dimension.key, step)}
              activeOpacity={0.7}
            />
          ))}
        </View>
        
        <View style={styles.sliderLabels}>
          <BodyText style={styles.sliderLabel}>{SLIDER_LABELS[0]}</BodyText>
          <BodyText style={styles.sliderLabel}>{SLIDER_LABELS[4]}</BodyText>
        </View>
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <BodyText style={styles.stepTitle}>Ton style d'accompagnement</BodyText>
            <BodyText style={styles.stepDescription}>
              Chaque femme est unique. Dis-moi ce qui t'inspire pour que je personnalise ton expérience.
            </BodyText>
            
            <View style={styles.dimensionsPreview}>
              {THERAPEUTIC_DIMENSIONS.map(dimension => (
                <View key={dimension.key} style={styles.dimensionPreview}>
                  <BodyText style={styles.dimensionIcon}>{dimension.icon}</BodyText>
                  <BodyText style={styles.dimensionTitle}>{dimension.title}</BodyText>
                </View>
              ))}
            </View>
          </View>
        );
        
      case 2:
        return (
          <View style={styles.stepContainer}>
            <ScrollView style={styles.slidersScroll} showsVerticalScrollIndicator={false}>
              {THERAPEUTIC_DIMENSIONS.map(dimension => renderSlider(dimension))}
            </ScrollView>
          </View>
        );
        
      case 3:
        const dominant = getDominantDimensions(preferences);
        return (
          <View style={styles.stepContainer}>
            <BodyText style={styles.stepTitle}>Ton profil unique</BodyText>
            
            <View style={styles.summaryContainer}>
              <BodyText style={styles.summaryTitle}>Tes priorités :</BodyText>
              {dominant.map((key, index) => {
                const dimension = THERAPEUTIC_DIMENSIONS.find(d => d.key === key);
                return (
                  <View key={key} style={styles.summaryRow}>
                    <BodyText style={styles.summaryIcon}>{dimension.icon}</BodyText>
                    <BodyText style={styles.summaryText}>
                      {dimension.title} ({preferences[key]}/5)
                    </BodyText>
                  </View>
                );
              })}
            </View>
            
            <View style={styles.profileInsight}>
              <BodyText style={styles.insightText}>
                Melune va adapter tous ses conseils selon tes préférences !
              </BodyText>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="500-preferences" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* TopSection */}
          <View style={styles.topSection}>
            <Animated.View style={{ opacity: fadeAnim }}>
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
                  }),
                },
              ]}
            >
              <BodyText style={styles.meluneMessage}>
                {dynamicMessage}
              </BodyText>
            </Animated.View>
          </View>

          {/* MainSection */}
          <Animated.View 
            style={[
              styles.mainSection,
              {
                opacity: slidersAnim,
                transform: [{
                  translateY: slidersAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }
            ]}
          >
            {renderCurrentStep()}
            
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleStepContinue}
              activeOpacity={0.7}
            >
              <BodyText style={styles.continueText}>
                {currentStep === 3 ? 'Finaliser mon profil' : 'Continuer'}
              </BodyText>
            </TouchableOpacity>
            
            {/* Progress */}
            <View style={styles.progressDots}>
              {[1, 2, 3].map(step => (
                <View 
                  key={step}
                  style={[
                    styles.dot,
                    step <= currentStep && styles.dotActive
                  ]}
                />
              ))}
            </View>
          </Animated.View>
          
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
    minHeight: '20%',
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
    justifyContent: 'space-between',
  },
  
  stepContainer: {
    flex: 1,
  },
  
  stepTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
    fontWeight: '600',
  },
  
  stepDescription: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.textLight,
    lineHeight: 22,
    marginBottom: theme.spacing.l,
  },
  
  dimensionsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.m,
  },
  
  dimensionPreview: {
    alignItems: 'center',
    width: '30%',
  },
  
  dimensionIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  
  dimensionTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: theme.colors.text,
  },
  
  slidersScroll: {
    flex: 1,
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
  
  sliderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  sliderIcon: {
    fontSize: 20,
    marginRight: theme.spacing.s,
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
  
  sliderDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.m,
    marginLeft: 28,
  },
  
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  sliderStep: {
    width: 40,
    height: 8,
    borderRadius: 4,
  },
  
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  sliderLabel: {
    fontSize: 11,
    color: theme.colors.textLight,
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
  
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
  },
  
  summaryIcon: {
    fontSize: 18,
    marginRight: theme.spacing.m,
  },
  
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  
  profileInsight: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  
  insightText: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    marginVertical: theme.spacing.l,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  continueText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
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
});