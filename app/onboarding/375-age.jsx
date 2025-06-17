import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading2, BodyText } from '../../components/Typography';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { theme } from '../../config/theme';
import MeluneAvatar from '../../components/MeluneAvatar';
import ChatBubble from '../../components/ChatBubble';

const AGE_RANGES = [
  { key: '18-25', label: '18-25 ans', icon: '🌱', description: 'Découverte et exploration' },
  { key: '26-35', label: '26-35 ans', icon: '🌸', description: 'Épanouissement personnel' },
  { key: '36-45', label: '36-45 ans', icon: '🌺', description: 'Équilibre et maturité' },
  { key: '46-55', label: '46-55 ans', icon: '🌿', description: 'Transition et sagesse' },
  { key: '55+', label: '55 ans et plus', icon: '🌳', description: 'Sagesse accomplie' }
];

export default function AgeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserInfo } = useOnboardingStore();
  
  // États
  const [selectedAge, setSelectedAge] = useState(null);
  const [step, setStep] = useState(1); // 1: intro, 2: sélection, 3: validation
  
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

  const handleAgeSelect = (ageRange) => {
    setSelectedAge(ageRange);
    if (step === 1) {
      setStep(2);
    }
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Sauvegarder et continuer
      updateUserInfo({
        ageRange: selectedAge
      });
      
      setTimeout(() => {
        router.push('/onboarding/400-cycle');
      }, 300);
    }
  };

  const getMeluneMessage = () => {
    switch (step) {
      case 1:
        return "Pour mieux te conseiller, j'aimerais connaître ta tranche d'âge. Cela m'aide à adapter mes messages à ton parcours de vie 💜";
      case 2:
        if (selectedAge) {
          const ageData = AGE_RANGES.find(a => a.key === selectedAge);
          return `Parfait ! ${ageData.description}, c'est une belle période de la vie. Je vais adapter mes conseils à ton expérience ✨`;
        }
        return "Choisis la tranche d'âge qui te correspond 🌸";
      case 3:
        return `Merci pour cette information ! Je vais personnaliser mes conseils selon ton profil unique 🌟`;
      default:
        return "";
    }
  };

  const getContinueText = () => {
    switch (step) {
      case 1:
        return selectedAge ? "C'est parfait !" : "Choisir ma tranche d'âge";
      case 2:
        return "Valider mon choix";
      case 3:
        return "Continuer vers mon cycle";
      default:
        return "Continuer";
    }
  };

  const canContinue = () => {
    return selectedAge !== null;
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
            
            {/* Étape 1 & 2: Sélection de l'âge */}
            {(step === 1 || step === 2) && (
              <View style={styles.ageContainer}>
                <BodyText style={styles.helpText}>
                  Cette information reste privée et m'aide à personnaliser mes conseils
                </BodyText>
                
                <View style={styles.ageOptionsContainer}>
                  {AGE_RANGES.map((ageRange) => (
                    <TouchableOpacity
                      key={ageRange.key}
                      style={[
                        styles.ageOption,
                        selectedAge === ageRange.key && styles.ageOptionSelected
                      ]}
                      onPress={() => handleAgeSelect(ageRange.key)}
                      activeOpacity={0.7}
                    >
                      <BodyText style={styles.ageIcon}>{ageRange.icon}</BodyText>
                      <View style={styles.ageTexts}>
                        <BodyText style={[
                          styles.ageLabel,
                          selectedAge === ageRange.key && styles.ageLabelSelected
                        ]}>
                          {ageRange.label}
                        </BodyText>
                        <BodyText style={[
                          styles.ageDescription,
                          selectedAge === ageRange.key && styles.ageDescriptionSelected
                        ]}>
                          {ageRange.description}
                        </BodyText>
                      </View>
                      {selectedAge === ageRange.key && (
                        <View style={styles.selectedIndicator}>
                          <BodyText style={styles.selectedIcon}>✓</BodyText>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Étape 3: Validation */}
            {step === 3 && selectedAge && (
              <View style={styles.summaryContainer}>
                <BodyText style={styles.summaryTitle}>Récapitulatif</BodyText>
                {(() => {
                  const ageData = AGE_RANGES.find(a => a.key === selectedAge);
                  return (
                    <View style={styles.summaryItem}>
                      <BodyText style={styles.summaryIcon}>{ageData.icon}</BodyText>
                      <View style={styles.summaryTexts}>
                        <BodyText style={styles.summaryLabel}>Tranche d'âge:</BodyText>
                        <BodyText style={styles.summaryValue}>{ageData.label}</BodyText>
                        <BodyText style={styles.summaryDescription}>{ageData.description}</BodyText>
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}

          </Animated.View>

          {/* Bouton de continuation */}
          {canContinue() && (
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <BodyText style={styles.continueButtonText}>
                {getContinueText()}
              </BodyText>
            </TouchableOpacity>
          )}

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
  
  // Styles container âge
  ageContainer: {
    marginBottom: theme.spacing.l,
  },
  helpText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: theme.spacing.l,
  },
  ageOptionsContainer: {
    gap: theme.spacing.m,
  },
  
  // Styles options âge
  ageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ageOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  ageIcon: {
    fontSize: 24,
    marginRight: theme.spacing.m,
  },
  ageTexts: {
    flex: 1,
  },
  ageLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  ageLabelSelected: {
    color: theme.colors.primary,
  },
  ageDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  ageDescriptionSelected: {
    color: theme.colors.primary + 'CC',
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.s,
  },
  selectedIcon: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold,
  },
  
  // Styles résumé
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
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 24,
    marginRight: theme.spacing.m,
  },
  summaryTexts: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  summaryDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    fontStyle: 'italic',
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