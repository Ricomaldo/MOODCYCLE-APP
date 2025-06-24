import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading2, BodyText } from '../../components/Typography';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { theme } from '../../config/theme';
import MeluneAvatar from '../../components/MeluneAvatar';
import ChatBubble from '../../components/ChatBubble';
import { formatDateFrench } from '../../utils/dateUtils';

// import DateTimePicker from '@react-native-community/datetimepicker';

export default function CycleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateCycleData } = useOnboardingStore();
  
  // États
  const [step, setStep] = useState(1); // 1: intro, 2: date, 3: durée, 4: validation
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date());
  const [cycleLength, setCycleLength] = useState(28);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
  }, [step]);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || lastPeriodDate;
    setShowDatePicker(Platform.OS === 'ios');
    setLastPeriodDate(currentDate);
    
    if (Platform.OS === 'android') {
      setTimeout(() => setStep(3), 500);
    }
  };

  const handleContinue = () => {
    if (step < 4) {
      setStep(step + 1);
      // Reset animations pour le prochain step
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
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
    } else {
      // Sauvegarder et continuer
      updateCycleData({
        lastPeriodDate: lastPeriodDate.toISOString(),
        averageCycleLength: cycleLength,
        trackingExperience: 'onboarding',
      });
      
      setTimeout(() => {
        router.push('/onboarding/500-preferences');
      }, 300);
    }
  };

  // Utilisation de la fonction centralisée pour le formatage des dates
  const formatDate = formatDateFrench;

  const getMeluneMessage = () => {
    switch (step) {
      case 1:
        return "Parle-moi de ton rythme naturel. Quand as-tu eu tes dernières règles ? 🌸";
      case 2:
        return "Parfait ! Maintenant, dis-moi combien de jours dure généralement ton cycle ?";
      case 3:
        return `${cycleLength} jours, c'est ton rythme unique ! Chaque femme a le sien et c'est parfaitement normal ✨`;
      case 4:
        return `Merci pour ta confiance ! Ces informations vont m'aider à te donner des conseils personnalisés 💜`;
      default:
        return "";
    }
  };

  const getContinueText = () => {
    switch (step) {
      case 1:
        return "Choisir la date";
      case 2:
        return "C'est noté !";
      case 3:
        return "Parfait !";
      case 4:
        return "Continuer vers mes préférences";
      default:
        return "Continuer";
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>


      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Avatar Melune */}
          <View style={styles.avatarContainer}>
            <MeluneAvatar phase="menstrual" size="medium" />
          </View>

          {/* Message de Melune */}
          <Animated.View 
            style={[
              styles.messageContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <ChatBubble 
              message={getMeluneMessage()} 
              isUser={false} 
            />
          </Animated.View>

          {/* Interface interactive selon l'étape */}
          <Animated.View 
            style={[
              styles.interactionContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            
            {/* Étape 1: Présentation */}
            {step === 1 && (
              <View style={styles.stepContainer}>
                <BodyText style={styles.helpText}>
                  Cette information m'aide à comprendre où tu en es dans ton cycle actuel
                </BodyText>
              </View>
            )}

            {/* Étape 2: DatePicker */}
            {step === 2 && (
              <View style={styles.stepContainer}>
                <BodyText style={styles.sectionTitle}>Date de tes dernières règles</BodyText>
                
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <BodyText style={styles.dateButtonText}>
                    📅 {formatDate(lastPeriodDate)}
                  </BodyText>
                </TouchableOpacity>

                {showDatePicker && (
                  <View style={styles.simpleDatePicker}>
                    <TouchableOpacity 
                      style={styles.dateNavButton}
                      onPress={() => {
                        const newDate = new Date(lastPeriodDate);
                        newDate.setDate(newDate.getDate() - 1);
                        if (newDate >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
                          setLastPeriodDate(newDate);
                        }
                      }}
                    >
                      <BodyText style={styles.dateNavText}>← Jour précédent</BodyText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.dateNavButton}
                      onPress={() => {
                        const newDate = new Date(lastPeriodDate);
                        newDate.setDate(newDate.getDate() + 1);
                        if (newDate <= new Date()) {
                          setLastPeriodDate(newDate);
                        }
                      }}
                    >
                      <BodyText style={styles.dateNavText}>Jour suivant →</BodyText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Étape 3: Durée du cycle */}
            {step === 3 && (
              <View style={styles.stepContainer}>
                <BodyText style={styles.sectionTitle}>Durée de ton cycle</BodyText>
                <BodyText style={styles.helpText}>
                  De la première journée des règles jusqu'aux prochaines
                </BodyText>
                
                <View style={styles.sliderContainer}>
                  <BodyText style={styles.sliderValue}>{cycleLength} jours</BodyText>
                  
                  {/* Slider simulé avec boutons */}
                  <View style={styles.sliderButtons}>
                    <TouchableOpacity 
                      style={styles.sliderButton}
                      onPress={() => setCycleLength(Math.max(21, cycleLength - 1))}
                    >
                      <BodyText style={styles.sliderButtonText}>-</BodyText>
                    </TouchableOpacity>
                    
                    <View style={styles.sliderTrack}>
                      <View style={[
                        styles.sliderIndicator,
                        { left: `${((cycleLength - 21) / 14) * 100}%` }
                      ]} />
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.sliderButton}
                      onPress={() => setCycleLength(Math.min(35, cycleLength + 1))}
                    >
                      <BodyText style={styles.sliderButtonText}>+</BodyText>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.sliderLabels}>
                    <BodyText style={styles.sliderLabel}>21j</BodyText>
                    <BodyText style={styles.sliderLabel}>35j</BodyText>
                  </View>
                </View>
              </View>
            )}

            {/* Étape 4: Résumé */}
            {step === 4 && (
              <View style={styles.stepContainer}>
                <View style={styles.summaryContainer}>
                  <BodyText style={styles.summaryTitle}>Récapitulatif</BodyText>
                  <View style={styles.summaryItem}>
                    <BodyText style={styles.summaryLabel}>Dernières règles:</BodyText>
                    <BodyText style={styles.summaryValue}>{formatDate(lastPeriodDate)}</BodyText>
                  </View>
                  <View style={styles.summaryItem}>
                    <BodyText style={styles.summaryLabel}>Durée du cycle:</BodyText>
                    <BodyText style={styles.summaryValue}>{cycleLength} jours</BodyText>
                  </View>
                </View>
              </View>
            )}

          </Animated.View>

          {/* Bouton de continuation */}
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <BodyText style={styles.continueButtonText}>
              {getContinueText()}
            </BodyText>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.l,
  },
  messageContainer: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  interactionContainer: {
    marginBottom: theme.spacing.xl,
  },
  stepContainer: {
    marginBottom: theme.spacing.l,
  },
  helpText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  
  // Styles DatePicker
  dateButton: {
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    alignItems: 'center',
    marginVertical: theme.spacing.m,
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
  },
  simpleDatePicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  dateNavButton: {
    backgroundColor: theme.colors.primary + '30',
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.small,
  },
  dateNavText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold,
  },
  
  // Styles Slider
  sliderContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.l,
  },
  sliderValue: {
    fontSize: 24,
    fontFamily: theme.fonts.headingBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
  },
  sliderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.m,
    width: '100%',
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderButtonText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontSize: 20,
    fontFamily: theme.fonts.bodyBold,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.primary + '30',
    borderRadius: 3,
    marginHorizontal: theme.spacing.m,
    position: 'relative',
  },
  sliderIndicator: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: theme.spacing.s,
  },
  sliderLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  
  // Styles Résumé
  summaryContainer: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
  },
  
  // Bouton de continuation
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: theme.spacing.l,
  },
  continueButtonText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    textAlign: 'center',
  },
}); 