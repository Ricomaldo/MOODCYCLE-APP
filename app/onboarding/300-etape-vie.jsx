//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/300-etape-vie.jsx
// 🎯 Status: ✅ PATTERN ABSOLU - Basé sur 250-rencontre.jsx
// 📝 Description: Choix de l'étape de vie et personnalisation
// 🔄 Cycle: Onboarding - Étape 4/8
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Animated } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { 
  AnimatedRevealMessage, 
  AnimatedOnboardingScreen,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS
} from '../../src/core/ui/animations';
import OnboardingCard from '../../src/features/onboarding/shared/OnboardingCard';

// 🎯 Tranches d'âge avec descriptions psychologiques
const AGE_RANGES = [
  {
    id: '18-25',
    title: 'Exploratrice (18-25 ans)',
    description: 'Découverte de ton cycle et de ta nature féminine',
    icon: '🌸',
  },
  {
    id: '26-35',
    title: 'Créatrice (26-35 ans)', 
    description: 'Équilibre entre ambitions et sagesse cyclique',
    icon: '🌿',
  },
  {
    id: '36-45',
    title: 'Sage (36-45 ans)',
    description: 'Maîtrise de ton pouvoir féminin et transmission',
    icon: '🌙',
  },
  {
    id: '46-55',
    title: 'Transformation (46-55 ans)',
    description: 'Honorer les transitions et la sagesse acquise',
    icon: '✨',
  },
  {
    id: '55+',
    title: 'Liberté (55+ ans)',
    description: 'Épanouissement au-delà des cycles traditionnels',
    icon: '🦋',
  }
];

export default function EtapeVieScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { profile, updateProfile } = useUserStore();
  const intelligence = useOnboardingIntelligence('300-etape-vie');
  
  // États
  const [selectedAge, setSelectedAge] = useState(profile.ageRange || null);
  const [showEncouragement, setShowEncouragement] = useState(false);
  
  // Animations - PATTERN OBLIGATOIRE
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardsAnim = useRef(AGE_RANGES.map(() => new Animated.Value(0))).current;
  const indicatorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1 : Entrée page
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
      // Phase 2 : Cascade progressive
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

  const handleAgeSelect = (ageRange) => {
    setSelectedAge(ageRange.id);
    updateProfile({ ageRange: ageRange.id });
    
    intelligence.trackAction('age_range_selected', {
      range: ageRange.id
    });
    
    // ✅ SIMPLIFIÉ : À ce stade, confiance < 40%, donc encouragement basique
    // Afficher l'encouragement default
    setShowEncouragement(true);
    
    // Attendre que l'encouragement s'affiche puis naviguer
    setTimeout(() => {
      // Phase 3 : Cascade inversée
      const exitAnimations = cardsAnim.map((anim, index) => 
        Animated.timing(anim, {
          toValue: 0,
          duration: ANIMATION_DURATIONS.elegant,
          delay: ((AGE_RANGES.length - 1) - index) * 100,
          ...ANIMATION_CONFIGS.onboarding.welcome.elementExit,
          useNativeDriver: true,
        })
      );

      Animated.parallel(exitAnimations).start(() => {
        router.push('/onboarding/400-prenom');
      });
    }, 1800); // Laisser 1.8s pour lire l'encouragement
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // Dès qu'on commence à scroller, on cache l'indicateur
    if (offsetY > 10) {
      Animated.timing(indicatorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} style={styles.container}>
      <AnimatedOnboardingScreen>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Animated.View style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            
            {/* Message Section */}
            <View style={styles.messageSection}>
              <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
                <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                  {/* ✅ SIMPLIFIÉ : Toujours utiliser le message default car confiance < 40% */}
                  {intelligence.getPersonalizedMessage('message') || 
                   "Chaque étape de la vie d'une femme porte sa propre magie... Dis-moi où tu en es de ton voyage"}
                </BodyText>
              </AnimatedRevealMessage>
            </View>

            {/* Choix Section */}
            <View style={styles.choicesSection}>
              <View style={styles.choicesContainer}>
                {AGE_RANGES.map((ageRange, index) => (
                  <Animated.View
                    key={ageRange.id}
                    style={[
                      styles.cardWrapper,
                      {
                        opacity: cardsAnim[index],
                        transform: [{
                          translateY: cardsAnim[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                          })
                        }]
                      }
                    ]}
                  >
                    <OnboardingCard
                      variant="lifecycle"
                      icon={ageRange.icon}
                      title={ageRange.title}
                      description={ageRange.description}
                      isSelected={selectedAge === ageRange.id}
                      onPress={() => handleAgeSelect(ageRange)}
                      color={theme.colors.phases?.[['follicular', 'ovulatory', 'luteal', 'menstrual', 'primary'][index]] || theme.colors.primary}
                      index={index}
                    />
                  </Animated.View>
                ))}
              </View>
              
              {/* ✅ SIMPLIFIÉ : Encouragement default toujours disponible */}
              {showEncouragement && selectedAge && (
                <View style={styles.encouragementContainer}>
                  <AnimatedRevealMessage delay={300}>
                    <BodyText style={styles.encouragementText}>
                      {intelligence.getPersonalizedMessage('encouragement') || 
                       "Nous allons découvrir ensemble ton chemin unique."}
                    </BodyText>
                  </AnimatedRevealMessage>
                </View>
              )}
            </View>

          </Animated.View>
        </ScrollView>

        {/* Indicateur de scroll avec animation */}
        <Animated.View 
          style={[
            styles.scrollIndicator,
            { opacity: indicatorOpacity }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.scrollIndicatorText}>↓</Text>
          <BodyText style={styles.scrollIndicatorLabel}>Découvrir plus</BodyText>
        </Animated.View>
      </AnimatedOnboardingScreen>
    </ScreenContainer>
  );
}

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
    paddingBottom: theme.spacing.xxl,
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
    maxWidth: 300,
  },
  
  choicesSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.l,
  },
  
  choicesContainer: {
    gap: theme.spacing.l,
  },

  cardWrapper: {
    width: '100%',
  },

  scrollIndicator: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface + '80',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.medium,
  },

  scrollIndicatorText: {
    fontSize: 20,
    color: theme.colors.primary,
    marginBottom: -4,
  },

  scrollIndicatorLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
  },

  encouragementContainer: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
    alignItems: 'center',
  },

  encouragementText: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});