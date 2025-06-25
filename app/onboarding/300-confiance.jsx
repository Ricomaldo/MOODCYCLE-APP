//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/300-confiance.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Établir confiance + collecte âge + calcul persona temps réel
// 🕒 Version: 2.0 - Intelligence Intégrée
// 🧭 Used in: Onboarding flow - Étape 2/4 "Ton rythme"
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

export default function ConfianceScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // 🎯 Tranches d'âge avec descriptions psychologiques (déplacé dans le composant pour accéder au thème)
  const AGE_RANGES = [
    {
      id: '18-25',
      title: 'Exploratrice (18-25 ans)',
      description: 'Découverte de ton cycle et de ta nature féminine',
      icon: '🌸',
      color: theme.colors.phases.follicular,
    },
    {
      id: '26-35',
      title: 'Créatrice (26-35 ans)', 
      description: 'Équilibre entre ambitions et sagesse cyclique',
      icon: '🌿',
      color: theme.colors.phases.ovulatory,
    },
    {
      id: '36-45',
      title: 'Sage (36-45 ans)',
      description: 'Maîtrise de ton pouvoir féminin et transmission',
      icon: '🌙',
      color: theme.colors.phases.luteal,
    },
    {
      id: '46-55',
      title: 'Transformation (46-55 ans)',
      description: 'Honorer les transitions et la sagesse acquise',
      icon: '✨',
      color: theme.colors.phases.menstrual,
    },
    {
      id: '55+',
      title: 'Liberté (55+ ans)',
      description: 'Épanouissement au-delà des cycles traditionnels',
      icon: '🦋',
      color: theme.colors.primary,
    },
  ];
  // 🧠 INTELLIGENCE HOOK
  const intelligence = useOnboardingIntelligence('300-confiance');
  
  // 🎨 Animations Standard
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const choicesAnim = useRef(new Animated.Value(0)).current;
  
  const [selectedAge, setSelectedAge] = useState(null);
  const [personaSuggestion, setPersonaSuggestion] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // 🎨 Séquence animations
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
      Animated.delay(600),
      Animated.timing(choicesAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAgeSelect = async (ageRange) => {
    setSelectedAge(ageRange.id);
    setIsCalculating(true);
    
    // 🔧 Sauvegarde âge
    intelligence.updateProfile({
      ageRange: ageRange.id,
    });

    // 🧠 INTELLIGENCE : Calcul persona temps réel
    try {
      const suggestion = intelligence.calculatePersonaSuggestion({
        ageRange: ageRange.id,
        journeyChoice: intelligence.userProfile.journeyChoice
      });
      
      if (suggestion) {
        setPersonaSuggestion(suggestion);
        intelligence.updateProfile({ 
          suggestedPersona: suggestion,
          personaConfidence: 0.85 // Confidence élevée avec âge + motivation
        });
      }
    } catch (error) {
      console.warn('Erreur calcul persona:', error);
    }
    
    setIsCalculating(false);
    
    // 🧠 Track choix âge
    intelligence.trackAction('age_range_selected', { 
      ageRange: ageRange.id,
      suggestedPersona: personaSuggestion 
    });

    // 🎨 Auto-navigation avec délai
    setTimeout(() => {
      router.push('/onboarding/400-cycle');
    }, 2000);
  };

  // Messages adaptatifs selon suggestion persona
  const getPersonaMessage = () => {
    if (!personaSuggestion) return '';
    
    const messages = {
      'emma': "Je pressens une âme exploratrice en toi... ✨",
      'laure': "Tu rayonnes d'une énergie organisée et déterminée 💪",
      'clara': "Quelle belle énergie positive je ressens ! 🌟",
      'sylvie': "Je sens une sagesse maternelle profonde 🌿",
      'christine': "Une beauté sereine émane de ton être 🌙"
    };
    
    return messages[personaSuggestion] || '';
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="300-confiance" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* TopSection - Avatar + Message confiance */}
          <View style={styles.topSection}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <MeluneAvatar 
                phase="follicular" 
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
              {!selectedAge ? (
                <BodyText style={styles.meluneMessage}>
                  {intelligence.meluneMessage}
                </BodyText>
              ) : (
                <BodyText style={styles.meluneMessage}>
                  {isCalculating ? 
                    "Je ressens ton énergie..." : 
                    getPersonaMessage()
                  }
                </BodyText>
              )}
            </Animated.View>
          </View>

          {/* MainSection - Confiance + Choix âge */}
          <View style={styles.mainSection}>
            <Animated.View style={{ opacity: choicesAnim }}>
              <BodyText style={styles.question}>
                Pour t'accompagner selon ton étape de vie
              </BodyText>
              
              <BodyText style={styles.subtext}>
                Choisis la période qui résonne avec toi
              </BodyText>
            </Animated.View>

            {/* Choix d'âge avec animation */}
            <Animated.View
              style={[
                styles.choicesContainer,
                { 
                  opacity: choicesAnim,
                  transform: [{
                    translateY: choicesAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  }]
                }
              ]}
            >
              {AGE_RANGES.map((ageRange, index) => (
                <TouchableOpacity
                  key={ageRange.id}
                  style={[
                    styles.ageCard,
                    selectedAge === ageRange.id && styles.ageCardSelected,
                    { borderLeftColor: ageRange.color }
                  ]}
                  onPress={() => handleAgeSelect(ageRange)}
                  activeOpacity={0.8}
                  disabled={selectedAge !== null}
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
                  
                  {/* Indicateur sélection */}
                  {selectedAge === ageRange.id && (
                    <View style={styles.selectedIndicator}>
                      {isCalculating ? (
                        <BodyText style={styles.calculatingText}>🔮 Analyse...</BodyText>
                      ) : (
                        <BodyText style={styles.selectedText}>✓ Choisi</BodyText>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>

            {/* Preview persona si calculé */}
            {personaSuggestion && !isCalculating && (
              <Animated.View
                style={[
                  styles.personaPreview,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <BodyText style={styles.personaTitle}>
                  💫 Je sens que nous allons bien nous entendre
                </BodyText>
                <BodyText style={styles.personaConfidence}>
                  Confiance: 85%
                </BodyText>
              </Animated.View>
            )}
          </View>
          
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
    justifyContent: 'flex-start',
  },
  
  question: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
    lineHeight: 28,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
  },
  
  subtext: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  
  choicesContainer: {
    gap: theme.spacing.m,
  },
  
  ageCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  
  iconText: {
    fontSize: 18,
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
  
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.m,
    right: theme.spacing.m,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  calculatingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  personaPreview: {
    marginTop: theme.spacing.l,
    padding: theme.spacing.l,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    alignItems: 'center',
  },
  
  personaTitle: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: theme.spacing.s,
  },
  
  personaConfidence: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});