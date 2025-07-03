//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/400-cycle.jsx
// 🧩 Type: Écran Onboarding
// 📚 Description: Configuration cycle + observation simplifiée
// 🕒 Version: 4.0 - 2025-01-21
// 🧭 Used in: Parcours onboarding, étape cycle
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView, Platform, Text } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useUserStore } from '../../src/stores/useUserStore';
import { getCurrentPhase, getCurrentCycleDay } from '../../src/utils/cycleCalculations';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import phasesData from '../../src/data/phases.json';

// 🎯 TRANSFORMATION : 2 étapes au lieu de 5
const STEPS = {
  DATA: 'data',       // Date + Durée combinées
  FEELING: 'feeling'  // Observation simplifiée (2 sliders)
};

// 🎨 Configuration sliders
const ENERGY_LABELS = ['Épuisée', 'Fatiguée', 'Normale', 'Énergique', 'Débordante'];
const MOOD_LABELS = ['Brouillard', 'Fluctuant', 'Stable', 'Clair', 'Cristallin'];
const ENERGY_COLORS = ['#ff6b6b', '#ffa726', '#ffeb3b', '#66bb6a', '#26c6da'];
const MOOD_COLORS = ['#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4'];

// Helper formatage date française
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

// Messages adaptatifs depuis phases.json + persona
const getAdaptiveMessage = (phase, persona = 'emma') => {
  if (!phase || !phasesData[phase]) {
    return "Parlons de ton cycle unique 🌙";
  }
  
  const phaseData = phasesData[phase];
  const enrichments = phaseData.contextualEnrichments || [];
  
  // Message personnalisé par persona si disponible
  const personalizedEnrichment = enrichments.find(e => 
    e.targetPersona === persona
  );
  
  if (personalizedEnrichment) {
    return personalizedEnrichment.contextualText;
  }
  
  // Fallback description générale
  return phaseData.editableContent?.description || phaseData.description || "Découvrons ensemble ta phase actuelle 🌸";
};

export default function CycleScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // 🏪 Stores
  const { updateCycle, addObservation } = useCycleStore();
  const { persona } = useUserStore();
  
  // 🎨 Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // 📊 États locaux
  const [currentStep, setCurrentStep] = useState(STEPS.DATA);
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [cycleLength, setCycleLength] = useState(28);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [detectedPhase, setDetectedPhase] = useState(null);
  const [adaptiveMessage, setAdaptiveMessage] = useState("Parlons de ton rythme naturel 🌙");
  const [observation, setObservation] = useState({ energy: 3, mood: 3 });

  const getStepContent = () => {
    if (currentStep === STEPS.DATA) {
      return (
        <View style={styles.stepContent}>
          <BodyText style={styles.stepTitle}>
            Quand ont commencé tes dernières règles ?
          </BodyText>
          <BodyText style={styles.stepSubtext}>
            Cette info m'aide à calculer ta phase actuelle
          </BodyText>
          
          <View style={styles.inputSection}>
            <BodyText style={styles.inputLabel}>Date des dernières règles</BodyText>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <BodyText style={styles.dateButtonText}>
                {formatDateFrench(lastPeriodDate)}
              </BodyText>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <BodyText style={styles.inputLabel}>Durée habituelle de ton cycle</BodyText>
            <BodyText style={styles.inputSubtext}>
              Nombre de jours entre le début de deux cycles
            </BodyText>
            
            <View style={styles.lengthOptions}>
              {[25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map((length) => (
                <TouchableOpacity
                  key={length}
                  style={[
                    styles.lengthOption,
                    cycleLength === length && styles.lengthOptionSelected,
                  ]}
                  onPress={() => handleCycleLengthChange(length)}
                >
                  <BodyText
                    style={[
                      styles.lengthText,
                      cycleLength === length && styles.lengthTextSelected,
                    ]}
                  >
                    {length}j
                  </BodyText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Phase détectée */}
          {detectedPhase && (
            <View style={[
              styles.phaseDetected,
              { 
                backgroundColor: theme.colors.phases[detectedPhase] + '10',
                borderColor: theme.colors.phases[detectedPhase] + '30'
              }
            ]}>
              <BodyText style={[
                styles.phaseText, 
                { color: theme.colors.phases[detectedPhase] }
              ]}>
                Phase détectée : {detectedPhase}
              </BodyText>
              <BodyText style={styles.phaseSubText}>
                Jour {getCurrentCycleDay(lastPeriodDate.toISOString(), cycleLength)} de ton cycle
              </BodyText>
            </View>
          )}
        </View>
      );
    }

    if (currentStep === STEPS.FEELING) {
      return (
        <View style={styles.stepContent}>
          <BodyText style={styles.stepTitle}>
            Comment te sens-tu aujourd'hui ?
          </BodyText>
          <BodyText style={styles.stepSubtext}>
            Aide-moi à comprendre ton état actuel
          </BodyText>

          {/* Slider Énergie */}
          <View style={styles.sliderBlock}>
            <BodyText style={styles.sliderLabel}>Niveau d'énergie</BodyText>
            <View style={styles.sliderRow}>
              {ENERGY_LABELS.map((label, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sliderDot,
                    {
                      backgroundColor: observation.energy === index + 1 
                        ? ENERGY_COLORS[index] 
                        : '#e0e0e0'
                    }
                  ]}
                  onPress={() => handleObservationChange('energy', index + 1)}
                />
              ))}
            </View>
            <BodyText style={styles.sliderValue}>
              {ENERGY_LABELS[observation.energy - 1]}
            </BodyText>
          </View>

          {/* Slider Humeur */}
          <View style={styles.sliderBlock}>
            <BodyText style={styles.sliderLabel}>Clarté mentale</BodyText>
            <View style={styles.sliderRow}>
              {MOOD_LABELS.map((label, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sliderDot,
                    {
                      backgroundColor: observation.mood === index + 1 
                        ? MOOD_COLORS[index] 
                        : '#e0e0e0'
                    }
                  ]}
                  onPress={() => handleObservationChange('mood', index + 1)}
                />
              ))}
            </View>
            <BodyText style={styles.sliderValue}>
              {MOOD_LABELS[observation.mood - 1]}
            </BodyText>
          </View>
        </View>
      );
    }

    return null;
  };

  useEffect(() => {
    // 🎨 Animation d'entrée
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

  // Animation changement d'étape
  useEffect(() => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 20, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [currentStep]);

  // Calcul phase à chaque changement
  useEffect(() => {
    const phase = getCurrentPhase(lastPeriodDate.toISOString(), cycleLength, 5);
    setDetectedPhase(phase);
    
    // Message adaptatif selon persona + phase
    const currentPersona = persona?.assigned || 'emma';
    setAdaptiveMessage(getAdaptiveMessage(phase, currentPersona));
  }, [lastPeriodDate, cycleLength, persona]);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      // Correction systématique : toujours convertir en Date
      const d = (selectedDate instanceof Date) ? selectedDate : new Date(selectedDate);
      setLastPeriodDate(isNaN(d.getTime()) ? new Date() : d);
    }
  };

  const handleCycleLengthChange = (newLength) => {
    setCycleLength(newLength);
  };

  const handleObservationChange = (key, value) => {
    setObservation(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === STEPS.DATA) {
      setCurrentStep(STEPS.FEELING);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // 💾 Sauvegarde cycle
    updateCycle({
      lastPeriodDate: lastPeriodDate.toISOString(),
      length: cycleLength,
      periodDuration: 5, // Valeur par défaut
    });
    
    // 💾 Sauvegarde observation
    addObservation(observation.mood, observation.energy, 'Observation onboarding');
    
    // 🚀 Navigation
    router.push('/onboarding/500-preferences');
  };

  const getButtonText = () => {
    return currentStep === STEPS.DATA ? 'Suivant' : 'Parfait !';
  };

  console.log('🔍 DEBUG CycleScreen:', {
    currentStep,
    fadeAnimValue: fadeAnim._value,
    slideAnimValue: slideAnim._value,
    theme: !!theme,
    adaptiveMessage
  });

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="400-cycle" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: 1 }]}>
          
          {/* TopSection - Avatar + Message adaptatif */}
          <View style={styles.topSection}>
            <MeluneAvatar 
              phase={detectedPhase || "menstrual"} 
              size="medium" 
              style="classic"
              animated={true}
            />
            
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
              <BodyText style={styles.adaptiveMessage}>
                {adaptiveMessage}
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
              onPress={handleNextStep}
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
          value={lastPeriodDate instanceof Date && !isNaN(lastPeriodDate.getTime()) ? lastPeriodDate : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Badge Intelligence Visible */}
      <View style={styles.intelligenceBadge}>
        <View style={styles.badgeIcon}>
          <BodyText style={styles.badgeEmoji}>🧠</BodyText>
        </View>
        <BodyText style={styles.badgeText}>Melune apprend</BodyText>
      </View>
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
    padding: 24,
    justifyContent: 'center',
  },
  
  topSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  
  messageContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  
  adaptiveMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 26,
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
    fontWeight: '600',
  },
  
  stepSubtext: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  
  inputSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  
  inputSubtext: {
    fontSize: 13,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  
  dateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignSelf: 'center',
    minWidth: '80%',
  },
  
  dateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  lengthOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    minWidth: 50,
  },
  
  lengthOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  
  lengthText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  lengthTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  phaseDetected: {
    marginTop: theme.spacing.l,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    width: '100%',
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
  
  sliderBlock: {
    width: '100%',
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.l,
    color: theme.colors.text,
  },
  
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.m,
  },
  
  sliderDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  bottomSection: {
    paddingBottom: theme.spacing.xl,
    minHeight: '15%',
    justifyContent: 'flex-end',
  },
  
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 32,
  },
  
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Badge Intelligence Visible
  intelligenceBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 4,
  },
  
  badgeEmoji: {
    fontSize: 20,
  },
  
  badgeText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});