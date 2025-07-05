//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/300-etape-vie.jsx
// 🎯 Status: ✅ PATTERN ABSOLU - Basé sur 250-rencontre.jsx
// 📝 Description: Choix de l'étape de vie et personnalisation
// 🔄 Cycle: Onboarding - Étape 4/8
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Animated, TouchableOpacity } from 'react-native';
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



  return (
    <ScreenContainer edges={['bottom']} style={styles.container}>
      <AnimatedOnboardingScreen>
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

                      {/* Choix Section - Grid 2 colonnes */}
            <View style={styles.choicesSection}>
              <View style={styles.choicesGrid}>
                {/* Première rangée */}
                <View style={styles.gridRow}>
                  {AGE_RANGES.slice(0, 2).map((ageRange, index) => (
                    <Animated.View
                      key={ageRange.id}
                      style={[
                        styles.gridItem,
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
                      <TouchableOpacity
                        style={[
                          styles.compactCard,
                          selectedAge === ageRange.id && styles.compactCardSelected
                        ]}
                        onPress={() => handleAgeSelect(ageRange)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`${ageRange.title}: ${ageRange.description}`}
                        accessibilityState={{ selected: selectedAge === ageRange.id }}
                      >
                        <BodyText style={styles.compactIcon}>{ageRange.icon}</BodyText>
                        <BodyText style={styles.compactTitle}>{ageRange.title}</BodyText>
                        <BodyText style={styles.compactDescription}>{ageRange.description}</BodyText>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>

                {/* Deuxième rangée */}
                <View style={styles.gridRow}>
                  {AGE_RANGES.slice(2, 4).map((ageRange, index) => (
                    <Animated.View
                      key={ageRange.id}
                      style={[
                        styles.gridItem,
                        {
                          opacity: cardsAnim[index + 2],
                          transform: [{
                            translateY: cardsAnim[index + 2].interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0]
                            })
                          }]
                        }
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.compactCard,
                          selectedAge === ageRange.id && styles.compactCardSelected
                        ]}
                        onPress={() => handleAgeSelect(ageRange)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`${ageRange.title}: ${ageRange.description}`}
                        accessibilityState={{ selected: selectedAge === ageRange.id }}
                      >
                        <BodyText style={styles.compactIcon}>{ageRange.icon}</BodyText>
                        <BodyText style={styles.compactTitle}>{ageRange.title}</BodyText>
                        <BodyText style={styles.compactDescription}>{ageRange.description}</BodyText>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>

                {/* Troisième rangée - 1 seule carte centrée */}
                <View style={styles.gridRowCenter}>
                  {AGE_RANGES.slice(4, 5).map((ageRange, index) => (
                    <Animated.View
                      key={ageRange.id}
                      style={[
                        styles.gridItem,
                        {
                          opacity: cardsAnim[index + 4],
                          transform: [{
                            translateY: cardsAnim[index + 4].interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0]
                            })
                          }]
                        }
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.compactCard,
                          selectedAge === ageRange.id && styles.compactCardSelected
                        ]}
                        onPress={() => handleAgeSelect(ageRange)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`${ageRange.title}: ${ageRange.description}`}
                        accessibilityState={{ selected: selectedAge === ageRange.id }}
                      >
                        <BodyText style={styles.compactIcon}>{ageRange.icon}</BodyText>
                        <BodyText style={styles.compactTitle}>{ageRange.title}</BodyText>
                        <BodyText style={styles.compactDescription}>{ageRange.description}</BodyText>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
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
    paddingTop: theme.spacing.m,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.m,
  },
  
  message: {
    fontSize: 18, // Légèrement réduit pour gagner de l'espace
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 26,
    maxWidth: 300,
  },
  
  choicesSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center', // Centrer le grid
  },
  
  choicesGrid: {
    gap: theme.spacing.m,
  },

  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },

  gridRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  gridItem: {
    width: '48%', // 2 colonnes avec un peu d'espace
  },

  compactCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.s, // Padding réduit pour plus d'espace interne
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    height: 150, // Hauteur augmentée (100 * 1.5)
    justifyContent: 'center',
  },

  compactCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },

  compactIcon: {
    fontSize: 22,
    marginBottom: theme.spacing.xs,
  },

  compactTitle: {
    fontSize: 13, // Légèrement augmenté pour éviter les retours à la ligne
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    lineHeight: 16, // Contrôle de la hauteur de ligne
  },

  compactDescription: {
    fontSize: 11, // ✅ WCAG 2.1 AA - Taille augmentée pour l'accessibilité
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: theme.spacing.xs, // Petit padding pour éviter les bords
  },

  encouragementContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.m,
    alignItems: 'center',
  },

  encouragementText: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});