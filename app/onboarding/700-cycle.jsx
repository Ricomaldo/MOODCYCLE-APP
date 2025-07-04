//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/700-cycle.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Configuration du cycle menstruel
// 🔄 Cycle: Onboarding - Étape 5/8
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import OnboardingScreen from '../../src/core/layout/OnboardingScreen';
import { BodyText, Heading2 } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { 
  AnimatedOnboardingScreen,
  AnimatedRevealMessage,
  StandardOnboardingButton,
  AnimatedOnboardingButton,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS,
  ANIMATION_PRESETS
} from '../../src/core/ui/animations';

const formatDateFrench = (date) => {
  try {
    const d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('fr-FR', options).format(d);
  } catch (e) {
    return '';
  }
};

export default function CycleScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { updateCycle } = useCycleStore();
  const intelligence = useOnboardingIntelligence('700-cycle');

  // États
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [cycleLength, setCycleLength] = useState(28);
  const [showDateModal, setShowDateModal] = useState(false);
  
  // Animations
  const messageAnim = useRef(new Animated.Value(0)).current;
  const dateQuestionAnim = useRef(new Animated.Value(0)).current;
  const dateCardAnim = useRef(new Animated.Value(0)).current;
  const lengthQuestionAnim = useRef(new Animated.Value(0)).current;
  const lengthControlsAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Séquence d'animation
    Animated.sequence([
      // 1. Message de Mélune
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.welcomeFirstMessage,
        ...ANIMATION_PRESETS.gentle,
        useNativeDriver: true,
      }),
      // Pause pour lire le message
      Animated.delay(ANIMATION_DURATIONS.normal),
      // 2. Question date
      Animated.timing(dateQuestionAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.elegant,
        ...ANIMATION_PRESETS.smooth,
        useNativeDriver: true,
      }),
      // Petite pause
      Animated.delay(ANIMATION_DURATIONS.quick),
      // 3. Carte date
      Animated.timing(dateCardAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.slow,
        ...ANIMATION_PRESETS.gentle,
        useNativeDriver: true,
      }),
      // Pause plus longue avant la seconde section
      Animated.delay(ANIMATION_DURATIONS.normal),
      // 4. Question longueur
      Animated.timing(lengthQuestionAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.elegant,
        ...ANIMATION_PRESETS.smooth,
        useNativeDriver: true,
      }),
      // Petite pause
      Animated.delay(ANIMATION_DURATIONS.quick),
      // 5. Contrôles longueur
      Animated.timing(lengthControlsAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.slow,
        ...ANIMATION_PRESETS.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDateConfirm = (selectedDate) => {
    setShowDateModal(false);
    if (selectedDate) {
      const d = (selectedDate instanceof Date) ? selectedDate : new Date(selectedDate);
      setLastPeriodDate(isNaN(d.getTime()) ? new Date() : d);
    }
  };

  const handleContinue = () => {
    // Sauvegarder les données du cycle
    updateCycle({
      lastPeriodDate: lastPeriodDate.toISOString(),
      length: cycleLength,
      periodDuration: 5, // Valeur par défaut
    });

    // Track configuration cycle
    intelligence.trackAction('cycle_configured', {
      cycleLength,
      lastPeriodDate: lastPeriodDate.toISOString()
    });
    
    setTimeout(() => {
      router.push('/onboarding/800-preferences');
    }, ANIMATION_DURATIONS.elegant);
  };

  return (
    <OnboardingScreen currentScreen="700-cycle">
      <AnimatedOnboardingScreen style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Message de Mélune */}
          <Animated.View style={[
            styles.messageSection,
            {
              opacity: messageAnim,
              transform: [{
                translateY: messageAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}>
            <BodyText style={styles.message}>
              {intelligence.personaConfidence >= 0.6 
                ? intelligence.getPersonalizedMessage('message')
                : "Configurons ton cycle pour un accompagnement personnalisé"}
            </BodyText>
            
            {intelligence.personaConfidence >= 0.6 && (
              <Animated.View style={[
                styles.encouragementSection,
                {
                  opacity: messageAnim,
                  transform: [{
                    translateY: messageAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  }],
                },
              ]}>
                <BodyText style={styles.encouragementText}>
                  {intelligence.getPersonalizedMessage('encouragement')}
                </BodyText>
              </Animated.View>
            )}
          </Animated.View>

          {/* Section principale */}
          <View style={styles.mainSection}>
            {/* Question date */}
            <Animated.View style={{
              opacity: dateQuestionAnim,
              transform: [{
                translateY: dateQuestionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }}>
              <Heading2 style={[styles.title, { fontFamily: 'Quintessential' }]}>
                Quand ont commencé tes dernières règles ?
              </Heading2>
            </Animated.View>

            {/* Carte date */}
            <Animated.View style={{
              opacity: dateCardAnim,
              transform: [{
                translateY: dateCardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }}>
              <TouchableOpacity 
                style={styles.dateCard} 
                onPress={() => setShowDateModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.dateIconContainer}>
                  <Text style={styles.dateIcon}>📅</Text>
                </View>
                <BodyText style={styles.dateText}>{formatDateFrench(lastPeriodDate)}</BodyText>
              </TouchableOpacity>
            </Animated.View>

            {/* Question longueur */}
            <Animated.View style={{
              opacity: lengthQuestionAnim,
              transform: [{
                translateY: lengthQuestionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }}>
              <Heading2 style={[styles.title, { fontFamily: 'Quintessential' }]}>
                Durée habituelle de ton cycle
              </Heading2>
            </Animated.View>

            {/* Contrôles longueur */}
            <Animated.View style={{
              opacity: lengthControlsAnim,
              transform: [{
                translateY: lengthControlsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }}>
              <View style={styles.customLengthSection}>
                <View style={styles.customLengthControls}>
                  <TouchableOpacity
                    style={[styles.controlButton, cycleLength <= 25 && styles.controlButtonDisabled]}
                    onPress={() => cycleLength > 25 && setCycleLength(cycleLength - 1)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.controlButtonText}>−</Text>
                  </TouchableOpacity>

                  <View style={styles.lengthDisplay}>
                    <BodyText style={styles.lengthNumber}>{cycleLength}</BodyText>
                    <BodyText style={styles.lengthUnit}>jours</BodyText>
                  </View>

                  <TouchableOpacity
                    style={[styles.controlButton, cycleLength >= 35 && styles.controlButtonDisabled]}
                    onPress={() => cycleLength < 35 && setCycleLength(cycleLength + 1)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.controlButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <BodyText style={styles.lengthRange}>Entre 25 et 35 jours</BodyText>
              </View>
            </Animated.View>
          </View>
        </ScrollView>

        {/* Section bouton */}
        <View style={styles.bottomSection}>
          <AnimatedOnboardingButton 
            {...ANIMATION_CONFIGS.onboarding.welcome.button}
          >
            <StandardOnboardingButton
              title="Continuer"
              onPress={handleContinue}
              variant="primary"
            />
          </AnimatedOnboardingButton>
        </View>
      </AnimatedOnboardingScreen>

      <DateTimePickerModal
        isVisible={showDateModal}
        mode="date"
        date={lastPeriodDate instanceof Date && !isNaN(lastPeriodDate.getTime()) ? lastPeriodDate : new Date()}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDateModal(false)}
        maximumDate={new Date()}
        locale="fr-FR"
        headerTextIOS="Sélectionne la date de tes dernières règles"
        confirmTextIOS="Valider"
        cancelTextIOS="Annuler"
      />
    </OnboardingScreen>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl * 2,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 24,
    maxWidth: 280,
    fontFamily: 'Questrial',
  },
  
  mainSection: {
    paddingHorizontal: theme.spacing.xl,
  },
  
  title: {
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
    lineHeight: 32,
  },
  
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface + '40',
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.l,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  dateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  
  dateIcon: {
    fontSize: 20,
  },
  
  dateText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },

  customLengthSection: {
    alignItems: 'center',
    marginTop: theme.spacing.l,
  },

  customLengthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.m,
  },

  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },

  controlButtonDisabled: {
    opacity: 0.4,
  },

  controlButtonText: {
    fontSize: 28,
    color: theme.colors.primary,
    lineHeight: 48,
  },

  lengthDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },

  lengthNumber: {
    fontSize: 36,
    color: theme.colors.primary,
    fontWeight: '500',
    lineHeight: 42,
  },

  lengthUnit: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginTop: -4,
  },

  lengthRange: {
    fontSize: 14,
    color: theme.colors.textLight,
    opacity: 0.7,
  },

  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  buttonContainer: {
    alignItems: 'center',
  },

  encouragementSection: {
    marginTop: theme.spacing.m,
  },

  encouragementText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});