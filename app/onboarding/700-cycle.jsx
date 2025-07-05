//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/700-cycle.jsx
// 🎯 Status: ✅ RÉVOLUTION DOUCE - Approche Miranda Gray + Fallback technique
// 📝 Description: Configuration cycle avec ressentis + données techniques
// 🔄 Cycle: Onboarding - Étape 8/8
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { BodyText, Caption } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { useUserIntelligence } from '../../src/stores/useUserIntelligence';
import { getOnboardingMessage } from '../../src/config/onboardingMessages';
import { CycleDateSelector } from '../../src/features/onboarding/cycle/CycleDateSelector';
import { CycleDurationWheel } from '../../src/features/onboarding/cycle/CycleDurationWheel';
import OnboardingButton from '../../src/features/onboarding/shared/OnboardingButton';
import { 
  AnimatedRevealMessage,
  AnimatedOnboardingScreen,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS
} from '../../src/core/ui/animations';

// Énergies cycliques selon Miranda Gray
const CYCLE_ENERGIES = [
  { 
    id: 'menstrual', 
    emoji: '🌙', 
    label: 'Repos profond', 
    description: 'Période de repos et introspection',
    color: '#8B4A6B'
  },
  { 
    id: 'follicular', 
    emoji: '🌱', 
    label: 'Énergie montante', 
    description: 'Regain d\'énergie et nouvelles idées',
    color: '#C8A882'
  },
  { 
    id: 'ovulatory', 
    emoji: '☀️', 
    label: 'Pleine puissance', 
    description: 'Rayonnement et confiance maximale',
    color: '#4A90A4'
  },
  { 
    id: 'luteal', 
    emoji: '🍂', 
    label: 'Transition douce', 
    description: 'Besoin de calme et d\'organisation',
    color: '#6B5B95'
  }
];

// Composant principal
export default function CycleScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { updateCycle } = useCycleStore();
  const intelligence = useOnboardingIntelligence('700-cycle');
  
  // États pour approche hybride
  const [selectedEnergy, setSelectedEnergy] = useState(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date()); // Par défaut : aujourd'hui
  const [cycleLength, setCycleLength] = useState(28);
  
  // Animations obligatoires du pattern absolu
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardsAnim = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    // Entrée progressive de la page avec les presets
    const { pageEnter } = ANIMATION_CONFIGS.onboarding.welcome;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        ...pageEnter.fade
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...pageEnter.slide
      }),
    ]).start(() => {
      // Animation en cascade des cartes
      cardsAnim.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.elegant,
          delay: ANIMATION_DURATIONS.welcomeFirstMessage + (index * 200),
          ...ANIMATION_CONFIGS.onboarding.welcome.elementEnter,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  const handleEnergySelect = (energy) => {
    setSelectedEnergy(energy);
    
    // 🎯 Estimation affinée basée sur l'énergie ressentie + patterns populationnels
    const now = new Date();
    let estimatedLastPeriod;
    
    switch (energy.id) {
      case 'menstrual':
        // Si repos profond = règles en cours (J1-J5)
        // Estimation : dernières règles = il y a 0-2 jours
        const menstrualDays = [0, 1, 2];
        const randomMenstrualDay = menstrualDays[Math.floor(Math.random() * menstrualDays.length)];
        estimatedLastPeriod = new Date(now.getTime() - randomMenstrualDay * 24 * 60 * 60 * 1000);
        break;
      case 'follicular':
        // Si énergie montante = phase folliculaire (J6-J13)
        // Estimation : dernières règles = il y a 6-13 jours
        const follicularDays = [6, 7, 8, 9, 10, 11, 12, 13];
        const randomFollicularDay = follicularDays[Math.floor(Math.random() * follicularDays.length)];
        estimatedLastPeriod = new Date(now.getTime() - randomFollicularDay * 24 * 60 * 60 * 1000);
        break;
      case 'ovulatory':
        // Si pleine puissance = ovulation (J12-J16)
        // Estimation : dernières règles = il y a 12-16 jours
        const ovulatoryDays = [12, 13, 14, 15, 16];
        const randomOvulatoryDay = ovulatoryDays[Math.floor(Math.random() * ovulatoryDays.length)];
        estimatedLastPeriod = new Date(now.getTime() - randomOvulatoryDay * 24 * 60 * 60 * 1000);
        break;
      case 'luteal':
        // Si transition douce = phase lutéale (J17-J28)
        // Estimation : dernières règles = il y a 17-27 jours
        const lutealDays = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
        const randomLutealDay = lutealDays[Math.floor(Math.random() * lutealDays.length)];
        estimatedLastPeriod = new Date(now.getTime() - randomLutealDay * 24 * 60 * 60 * 1000);
        break;
      default:
        estimatedLastPeriod = lastPeriodDate;
    }
    
    setLastPeriodDate(estimatedLastPeriod);
  };

  const handleContinue = () => {
    // Utiliser les données selon l'approche choisie
    const finalDate = selectedEnergy ? lastPeriodDate : lastPeriodDate;
    const finalLength = cycleLength;
    
    updateCycle({
      lastPeriodDate: finalDate.toISOString(),
      length: finalLength,
      periodDuration: 5,
      // ✨ Ajouter l'énergie ressentie pour CycleObservationEngine
      currentEnergyFelt: selectedEnergy?.id || null,
      // 🎯 Métadonnées pour amélioration progressive
      initialEstimationMethod: selectedEnergy ? 'energy_based' : 'technical',
      initialEnergyConfidence: selectedEnergy ? 0.7 : 0.9, // Technique plus sûr initialement
      energyTimestamp: new Date().toISOString()
    });
    
    intelligence.trackAction('cycle_configured', {
      approach: selectedEnergy ? 'energy_based' : 'technical',
      energySelected: selectedEnergy?.id,
      cycleLength: finalLength,
      lastPeriodDate: finalDate.toISOString()
    });
    
    // Animation de sortie
    const exitAnimations = cardsAnim.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 0,
        duration: ANIMATION_DURATIONS.elegant,
        delay: ((cardsAnim.length - 1) - index) * 100,
        ...ANIMATION_CONFIGS.onboarding.welcome.elementExit,
        useNativeDriver: true,
      })
    );

    Animated.parallel(exitAnimations).start(() => {
      router.push('/onboarding/800-preferences');
    });
  };
  
  const getConversationalMessage = () => {
    return getOnboardingMessage('700-cycle', intelligence.currentPersona, 'conversational') || 
      "Raconte-moi où tu en es dans ton cycle, on va faire ça ensemble 💕";
  };
  
  return (
    <ScreenContainer edges={['top', 'bottom']} style={styles.container}>
      <AnimatedOnboardingScreen>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            {/* Message de Mélune */}
            <View style={styles.messageSection}>
              <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
                <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                  {getConversationalMessage()}
                </BodyText>
              </AnimatedRevealMessage>
            </View>

            {/* Section principale */}
            <View style={styles.choicesSection}>
              <View style={styles.choicesContainer}>
                
                {/* ✨ NOUVELLE APPROCHE : Sélection d'énergie Miranda Gray */}
                <Animated.View
                  style={[
                    styles.cardWrapper,
                    {
                      opacity: cardsAnim[0],
                      transform: [{
                        translateY: cardsAnim[0].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.energyCard}>
                    <Text style={styles.gentleQuestion}>
                      Comment te sens-tu physiquement ces derniers temps ? 🌸
                    </Text>
                    
                    <View style={styles.energiesGrid}>
                      {CYCLE_ENERGIES.map((energy) => (
                        <TouchableOpacity
                          key={energy.id}
                          style={[
                            styles.energyOption,
                            selectedEnergy?.id === energy.id && styles.energyOptionSelected,
                            selectedEnergy?.id === energy.id && { 
                              backgroundColor: energy.color + '20',
                              borderColor: energy.color + '60'
                            }
                          ]}
                          onPress={() => handleEnergySelect(energy)}
                        >
                          <Text style={styles.energyEmoji}>{energy.emoji}</Text>
                          <BodyText style={[
                            styles.energyLabel,
                            selectedEnergy?.id === energy.id && { color: energy.color }
                          ]}>
                            {energy.label}
                          </BodyText>
                          <Caption style={styles.energyDescription}>
                            {energy.description}
                          </Caption>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </Animated.View>

                {/* ✨ Zone "Autre chose ?" conversationnelle */}
                <Animated.View
                  style={[
                    styles.cardWrapper,
                    {
                      opacity: cardsAnim[1],
                      transform: [{
                        translateY: cardsAnim[1].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity 
                    style={styles.technicalToggle}
                    onPress={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  >
                    <View style={styles.toggleContent}>
                      <Feather 
                        name="calendar" 
                        size={20} 
                        color={theme.colors.primary} 
                      />
                      <BodyText style={styles.toggleText}>
                        Plutôt avec des dates précises ?
                      </BodyText>
                      <Feather 
                        name={showTechnicalDetails ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={theme.colors.textLight} 
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                {/* Détails techniques (masqués par défaut) */}
                {showTechnicalDetails && (
                  <Animated.View
                    style={[
                      styles.cardWrapper,
                      {
                        opacity: cardsAnim[2],
                        transform: [{
                          translateY: cardsAnim[2].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                          })
                        }]
                      }
                    ]}
                  >
                    <View style={styles.technicalDetails}>
                      {/* Date */}
                      <View style={styles.technicalSection}>
                        <Text style={styles.technicalQuestion}>
                          {getOnboardingMessage('700-cycle-questions', intelligence.currentPersona, 'date') || "Tes dernières règles, c'était quand ?"}
                        </Text>
                        <CycleDateSelector
                          value={lastPeriodDate}
                          onChange={setLastPeriodDate}
                          persona={intelligence.currentPersona}
                          theme={theme}
                        />
                      </View>

                      {/* Durée */}
                      <View style={styles.technicalSection}>
                        <Text style={styles.technicalQuestion}>
                          {getOnboardingMessage('700-cycle-questions', intelligence.currentPersona, 'duration') || "Ton cycle dure combien de jours d'habitude ?"}
                        </Text>
                        <CycleDurationWheel
                          value={cycleLength}
                          onChange={setCycleLength}
                          persona={intelligence.currentPersona}
                          theme={theme}
                        />
                      </View>
                    </View>
                  </Animated.View>
                )}
              </View>
            </View>

            {/* Section bouton */}
            <View style={styles.bottomSection}>
              <OnboardingButton
                title="Continuer"
                onPress={handleContinue}
                delay={ANIMATION_DURATIONS.welcomeFirstMessage + 1200}
                variant="primary"
                disabled={!selectedEnergy && !showTechnicalDetails}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </AnimatedOnboardingScreen>
    </ScreenContainer>
  );
}

// Styles conformes au pattern absolu
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingTop: theme.spacing.xl,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  message: {
    fontSize: 20,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 28,
    maxWidth: 320,
  },
  
  choicesSection: {
    flex: 1,
    paddingTop: theme.spacing.l, // Réduit de xxl à l
  },
  
  choicesContainer: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.l,
  },

  cardWrapper: {
    width: '100%',
  },
  
  energyCard: {
    backgroundColor: theme.colors.surface + '95',
    borderRadius: 28,
    padding: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border + '30',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  
  gentleQuestion: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Quicksand_500Medium',
  },
  
  energiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
    marginTop: theme.spacing.m,
  },
  
  energyOption: {
    width: '48%',
    padding: theme.spacing.m,
    borderWidth: 2,
    borderColor: theme.colors.border + '30',
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface + '95',
    alignItems: 'center',
    minHeight: 100,
  },
  
  energyOptionSelected: {
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  energyEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  
  energyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  energyDescription: {
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  technicalToggle: {
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border + '40',
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface + '80',
  },
  
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
    marginLeft: theme.spacing.s,
  },
  
  technicalDetails: {
    padding: theme.spacing.l,
    backgroundColor: theme.colors.surface + '95',
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.border + '20',
  },
  
  technicalSection: {
    marginBottom: theme.spacing.l,
  },
  
  technicalQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
    fontFamily: 'Quicksand_500Medium',
  },
  
  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
});