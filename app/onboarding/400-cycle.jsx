//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/400-cycle.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Données cycle + détection phase avec architecture existante
// 🕒 Version: 3.0 - Factorisation useCycle + phases.json
// 🧭 Used in: Onboarding flow - Étape 2/4 "Ton rythme"
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { useCycle } from '../../src/hooks/useCycle';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core/ui/Typography';
import { useTheme } from '../../src/hooks/useTheme';
import phasesData from '../../src/data/phases.json';

// 🎯 Étapes du processus
const STEPS = {
  INTRO: 'intro',
  DATE: 'date', 
  DURATION: 'duration',
  VALIDATION: 'validation'
};

// Helper formatage date française
const formatDateFrench = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(date);
};

// Messages Melune depuis phases.json selon persona + phase
const getPhaseMessage = (phase, persona = 'emma') => {
  if (!phase || !phasesData[phase]) return '';
  
  const phaseData = phasesData[phase];
  const meluneConfig = phaseData.melune;
  
  // Messages depuis phases.json avec contextualEnrichments
  const enrichments = phaseData.contextualEnrichments || [];
  const personalizedEnrichment = enrichments.find(e => 
    e.targetPersona === persona
  );
  
  if (personalizedEnrichment) {
    return personalizedEnrichment.contextualText;
  }
  
  // Fallback depuis description phase
  return phaseData.description;
};

export default function CycleScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  // 🧠 INTELLIGENCE + CYCLE HOOKS
  const intelligence = useOnboardingIntelligence('400-cycle');
  const { 
    currentPhase, 
    currentDay, 
    phaseMetadata,
    updateCycle,
    hasMinimumData 
  } = useCycle();
  
  // 🎨 Animations Standard
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // État des données
  const [currentStep, setCurrentStep] = useState(STEPS.INTRO);
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [cycleLength, setCycleLength] = useState(28);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [detectedPhase, setDetectedPhase] = useState(null);
  const [dynamicMessage, setDynamicMessage] = useState(intelligence.meluneMessage);

  useEffect(() => {
    // 🎨 Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animation lors du changement d'étape
  useEffect(() => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 20, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [currentStep]);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setLastPeriodDate(selectedDate);
      
      // 🧠 UTILISATION ARCHITECTURE : Mise à jour temporaire pour calcul
      updateCycle({
        lastPeriodDate: selectedDate.toISOString(),
        length: cycleLength
      });
      
      // Le hook useCycle recalcule automatiquement currentPhase
      setTimeout(() => {
        setDetectedPhase(currentPhase);
        
        // 🧠 Message adaptatif depuis phases.json
        if (currentPhase) {
          const persona = intelligence.currentPersona || 'emma';
          setDynamicMessage(getPhaseMessage(currentPhase, persona));
        }
      }, 100);
      
      // Track changement date
      intelligence.trackAction('period_date_selected', { 
        date: selectedDate.toISOString(),
        detectedPhase: currentPhase 
      });
    }
  };

  const handleCycleLengthChange = (newLength) => {
    setCycleLength(newLength);
    
    // 🧠 Mise à jour via hook useCycle
    updateCycle({
      lastPeriodDate: lastPeriodDate.toISOString(),
      length: newLength
    });
    
    // Le currentPhase sera recalculé automatiquement
    setTimeout(() => {
      setDetectedPhase(currentPhase);
      
      if (currentPhase) {
        const persona = intelligence.currentPersona || 'emma';
        setDynamicMessage(getPhaseMessage(currentPhase, persona));
      }
    }, 100);
  };

  const handleStepNext = () => {
    switch (currentStep) {
      case STEPS.INTRO:
        setCurrentStep(STEPS.DATE);
        break;
      case STEPS.DATE:
        setCurrentStep(STEPS.DURATION);
        break;
      case STEPS.DURATION:
        setCurrentStep(STEPS.VALIDATION);
        break;
      case STEPS.VALIDATION:
        handleComplete();
        break;
    }
  };

  const handleComplete = () => {
    // 🔧 Sauvegarde données cycle complètes via useCycle
    updateCycle({
      lastPeriodDate: lastPeriodDate.toISOString(),
      length: cycleLength,
      periodDuration: 5, // Valeur par défaut
      isRegular: null,
      trackingExperience: null
    });
    
    // 🧠 Enrichissement avec intelligence
    intelligence.updateProfile({
      currentPhase: currentPhase,
      dayInCycle: currentDay,
      cycleDataCompleted: true
    });
    
    // 🧠 Track finalisation cycle avec métadonnées riches
    intelligence.trackAction('cycle_data_completed', { 
      phase: currentPhase,
      phaseMetadata: phaseMetadata[currentPhase],
      cycleLength,
      dayInCycle: currentDay,
      hasMinimumData: hasMinimumData()
    });

    // Navigation vers preferences
    router.push('/onboarding/500-preferences');
  };

  const getStepContent = () => {
    switch (currentStep) {
      case STEPS.INTRO:
        return (
          <View style={styles.stepContent}>
            <BodyText style={styles.stepTitle}>
              Parle-moi de ton rythme naturel
            </BodyText>
            <BodyText style={styles.stepSubtext}>
              Ton cycle est unique et précieux. Je vais t'aider à le comprendre.
            </BodyText>
          </View>
        );
        
      case STEPS.DATE:
        return (
          <View style={styles.stepContent}>
            <BodyText style={styles.stepTitle}>
              Quand ont commencé tes dernières règles ?
            </BodyText>
            <BodyText style={styles.stepSubtext}>
              Même une date approximative m'aide à te situer
            </BodyText>
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <BodyText style={styles.dateButtonText}>
                📅 {formatDateFrench(lastPeriodDate)}
              </BodyText>
            </TouchableOpacity>
            
            {(detectedPhase || currentPhase) && (
              <View style={[
                styles.phaseDetected,
                { backgroundColor: phaseMetadata[detectedPhase || currentPhase]?.color + '20' }
              ]}>
                <BodyText style={[
                  styles.phaseText,
                  { color: phaseMetadata[detectedPhase || currentPhase]?.color }
                ]}>
                  {phaseMetadata[detectedPhase || currentPhase]?.symbol} Phase {detectedPhase || currentPhase}
                </BodyText>
                <BodyText style={styles.phaseSubText}>
                  {phaseMetadata[detectedPhase || currentPhase]?.energy} • Jour {currentDay}
                </BodyText>
              </View>
            )}
          </View>
        );
        
      case STEPS.DURATION:
        return (
          <View style={styles.stepContent}>
            <BodyText style={styles.stepTitle}>
              Quelle est la durée habituelle de ton cycle ?
            </BodyText>
            <BodyText style={styles.stepSubtext}>
              De J1 (premier jour de règles) au J1 suivant
            </BodyText>
            
            <View style={styles.sliderContainer}>
              <View style={styles.sliderValues}>
                {[21, 24, 26, 28, 30, 32, 35].map(length => (
                  <TouchableOpacity
                    key={length}
                    style={[
                      styles.lengthOption,
                      cycleLength === length && styles.lengthOptionSelected
                    ]}
                    onPress={() => handleCycleLengthChange(length)}
                  >
                    <BodyText style={[
                      styles.lengthText,
                      cycleLength === length && styles.lengthTextSelected
                    ]}>
                      {length}j
                    </BodyText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
        
      case STEPS.VALIDATION:
        const phaseInfo = phaseMetadata[currentPhase];
        return (
          <View style={styles.stepContent}>
            <BodyText style={styles.stepTitle}>
              Récapitulatif de ton cycle
            </BodyText>
            
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <BodyText style={styles.summaryLabel}>Dernières règles:</BodyText>
                <BodyText style={styles.summaryValue}>
                  {formatDateFrench(lastPeriodDate)}
                </BodyText>
              </View>
              
              <View style={styles.summaryItem}>
                <BodyText style={styles.summaryLabel}>Durée cycle:</BodyText>
                <BodyText style={styles.summaryValue}>{cycleLength} jours</BodyText>
              </View>
              
              {currentPhase && phaseInfo && (
                <>
                  <View style={styles.summaryItem}>
                    <BodyText style={styles.summaryLabel}>Phase actuelle:</BodyText>
                    <BodyText style={[styles.summaryValue, { color: phaseInfo.color }]}>
                      {phaseInfo.symbol} {phaseInfo.name}
                    </BodyText>
                  </View>
                  
                  <View style={styles.summaryItem}>
                    <BodyText style={styles.summaryLabel}>Jour du cycle:</BodyText>
                    <BodyText style={styles.summaryValue}>J{currentDay}</BodyText>
                  </View>
                  
                  <View style={styles.summaryItem}>
                    <BodyText style={styles.summaryLabel}>Énergie:</BodyText>
                    <BodyText style={[styles.summaryValue, { color: phaseInfo.color }]}>
                      {phaseInfo.energy}
                    </BodyText>
                  </View>
                </>
              )}
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case STEPS.INTRO: return 'Commençons';
      case STEPS.DATE: return 'Suivant';
      case STEPS.DURATION: return 'Suivant';
      case STEPS.VALIDATION: return 'Parfait !';
      default: return 'Suivant';
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="400-cycle" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* TopSection - Avatar + Message adaptatif */}
          <View style={styles.topSection}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <MeluneAvatar 
                phase={detectedPhase || currentPhase || "menstrual"} 
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
                {dynamicMessage}
              </BodyText>
            </Animated.View>
          </View>

          {/* MainSection - Contenu des étapes */}
          <View style={styles.mainSection}>
            <Animated.View
              style={[
                styles.contentContainer,
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
              {getStepContent()}
            </Animated.View>
          </View>

          {/* BottomSection - Navigation */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleStepNext}
              activeOpacity={0.8}
            >
              <BodyText style={styles.nextButtonText}>
                {getButtonText()}
              </BodyText>
            </TouchableOpacity>
          </View>
          
        </Animated.View>
      </ScrollView>

      {/* DatePicker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={lastPeriodDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)} // 3 mois max
        />
      )}
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
    justifyContent: 'center',
  },
  
  contentContainer: {
    flex: 1,
  },
  
  stepContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.l,
  },
  
  stepTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
    lineHeight: 28,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
  },
  
  stepSubtext: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  
  dateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    marginVertical: theme.spacing.l,
  },
  
  dateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  phaseDetected: {
    marginTop: theme.spacing.l,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  
  phaseText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  
  phaseSubText: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  
  sliderContainer: {
    width: '100%',
    marginVertical: theme.spacing.l,
  },
  
  sliderValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  
  lengthOption: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  
  lengthOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  
  lengthText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  
  lengthTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  summary: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  
  summaryValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  
  bottomSection: {
    paddingBottom: theme.spacing.xl,
    minHeight: '20%',
    justifyContent: 'flex-end',
  },
  
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
});