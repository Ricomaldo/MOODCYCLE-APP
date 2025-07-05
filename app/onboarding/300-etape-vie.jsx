//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/300-etape-vie.jsx
// 🎯 Status: ✅ PATTERN ABSOLU - Basé sur 250-rencontre.jsx
// 📝 Description: Choix de l'étape de vie et personnalisation
// 🔄 Cycle: Onboarding - Étape 4/8
// ─────────────────────────────────────────────────────────
//
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/core/layout/ScreenContainer';
import { BodyText } from '../../src/core/ui/typography';
import { useUserStore } from '../../src/stores/useUserStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { AnimatedOnboardingScreen, AnimatedRevealMessage } from '../../src/core/ui/animations/OnboardingAnimations';
import { ANIMATION_DURATIONS, ANIMATION_CONFIGS } from '../../src/core/ui/animations/constants/animationPresets';
import { theme } from '../../src/config/theme';


// 🎯 Tranches d'âge avec descriptions psychologiques
const AGE_RANGES = [
  {
    id: '18-25',
    title: 'Exploratrice',
    age: '18-25 ans',
    description: 'Découverte & liberté',
    icon: '🌸',
  },
  {
    id: '26-35',
    title: 'Créatrice',
    age: '26-35 ans',
    description: 'Épanouissement & projets',
    icon: '🌺',
  },
  {
    id: '36-45',
    title: 'Sage',
    age: '36-45 ans',
    description: 'Équilibre & maturité',
    icon: '🌷',
  },
  {
    id: '46-55',
    title: 'Transformation',
    age: '46-55 ans',
    description: 'Renouveau & sagesse',
    icon: '🌻',
  },
  {
    id: '55+',
    title: 'Liberté',
    age: '55+ ans',
    description: 'Plénitude & sérénité',
    icon: '🌹',
  },
];

// ═══════════════════════════════════════════════════════
// 🎯 COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════
export default function EtapeVieScreen() {
  const router = useRouter();
  const styles = getStyles(theme);
  
  // Protection robuste contre l'hydratation avec try-catch
  let userStore = null;
  try {
    userStore = useUserStore();
  } catch (error) {
    console.warn('Erreur hydratation store:', error);
  }
  
  // Valeurs par défaut sécurisées
  const profile = userStore?.profile || {};
  const updateProfile = userStore?.updateProfile || (() => {});
  
  // Si le store n'est pas encore hydraté, afficher un loading
  if (!userStore) {
    return (
      <ScreenContainer edges={['bottom']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <BodyText style={styles.loadingText}>Chargement...</BodyText>
        </View>
      </ScreenContainer>
    );
  }

  const intelligence = useOnboardingIntelligence('300-etape-vie');
  
  // États
  const [selectedAge, setSelectedAge] = useState(profile?.ageRange || null);
  const [showEncouragement, setShowEncouragement] = useState(false);
  
  // Animations - PATTERN OBLIGATOIRE
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardsAnim = useRef(AGE_RANGES.map(() => new Animated.Value(0))).current;
  const cardsOpacityAnim = useRef(AGE_RANGES.map(() => new Animated.Value(1))).current;

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
      // Phase 2 : Cascade progressive intelligente (suit la structure du grid)
      const cascadeOrder = [
        { index: 0, delay: 0 },     // Exploratrice (haut gauche)
        { index: 1, delay: 120 },   // Créatrice (haut droite) - plus rapide
        { index: 2, delay: 240 },   // Sage (milieu gauche)
        { index: 3, delay: 360 },   // Transformation (milieu droite)
        { index: 4, delay: 480 }    // Liberté (bas centre) - finale élégante
      ];

      cascadeOrder.forEach(({ index, delay }) => {
        Animated.timing(cardsAnim[index], {
          toValue: 1,
          duration: ANIMATION_DURATIONS.elegant,
          delay: ANIMATION_DURATIONS.welcomeFirstMessage + delay,
          ...ANIMATION_CONFIGS.onboarding.welcome.elementEnter,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  const handleAgeSelect = (ageRange) => {
    setSelectedAge(ageRange.id);
    updateProfile({ ageRange: ageRange.id });
    
    intelligence?.trackAction?.('age_range_selected', {
      range: ageRange.id
    });

    // Animation de feedback immédiat sur la carte sélectionnée
    const selectedIndex = AGE_RANGES.findIndex(range => range.id === ageRange.id);
    if (selectedIndex !== -1) {
      // Petit bounce satisfaisant sur la carte sélectionnée
      Animated.sequence([
        Animated.spring(cardsAnim[selectedIndex], {
          toValue: 1.05,
          tension: 300,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(cardsAnim[selectedIndex], {
          toValue: 1,
          tension: 200,
          friction: 10,
          useNativeDriver: true,
        })
      ]).start();

      // Fade subtil des autres cartes pour mettre en valeur le choix
      cardsOpacityAnim.current.forEach((anim, index) => {
        if (index !== selectedIndex) {
          Animated.timing(anim, {
            toValue: 0.6,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      });
    }
    
    // ✅ SIMPLIFIÉ : À ce stade, confiance < 40%, donc encouragement basique
    // Afficher l'encouragement default
    setShowEncouragement(true);
    
    // Attendre que l'encouragement s'affiche puis naviguer
    setTimeout(() => {
      // Phase 3 : Cascade de sortie fluide (de bas en haut, centre vers extérieur)
      const exitOrder = [
        { index: 4, delay: 0 },     // Liberté (bas centre) - part en premier
        { index: 2, delay: 100 },   // Sage (milieu gauche)
        { index: 3, delay: 100 },   // Transformation (milieu droite) - simultané
        { index: 0, delay: 200 },   // Exploratrice (haut gauche)
        { index: 1, delay: 200 }    // Créatrice (haut droite) - simultané
      ];

      exitOrder.forEach(({ index, delay }) => {
        Animated.timing(cardsAnim[index], {
          toValue: 0,
          duration: ANIMATION_DURATIONS.elegant,
          delay: delay,
          ...ANIMATION_CONFIGS.onboarding.welcome.elementExit,
          useNativeDriver: true,
        }).start();
      });

      // Navigation après la fin de la cascade
      setTimeout(() => {
        router.push('/onboarding/400-prenom');
      }, 400); // Temps pour que toutes les animations se terminent
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
                {intelligence?.getPersonalizedMessage?.('message') || 
                 "Chaque étape de la vie d'une femme porte sa propre magie... Dis-moi où tu en es"}
              </BodyText>
            </AnimatedRevealMessage>

            {/* Zone d'encouragement fixe en haut */}
            <View style={styles.encouragementZone}>
              {showEncouragement && selectedAge && (
                <AnimatedRevealMessage delay={300}>
                  <View style={styles.encouragementCard}>
                    <BodyText style={styles.encouragementText}>
                      {intelligence?.getPersonalizedMessage?.('encouragement') || 
                       "Nous allons découvrir ensemble ton chemin unique."}
                    </BodyText>
                  </View>
                </AnimatedRevealMessage>
              )}
            </View>
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
                          opacity: Animated.multiply(cardsAnim[index], cardsOpacityAnim.current[index]),
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
                        <View style={styles.compactTitleContainer}>
                          <BodyText style={styles.compactTitle}>{ageRange.title}</BodyText>
                          <BodyText style={styles.compactAge}>{ageRange.age}</BodyText>
                        </View>
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
                          opacity: Animated.multiply(cardsAnim[index + 2], cardsOpacityAnim.current[index + 2]),
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
                        <View style={styles.compactTitleContainer}>
                          <BodyText style={styles.compactTitle}>{ageRange.title}</BodyText>
                          <BodyText style={styles.compactAge}>{ageRange.age}</BodyText>
                        </View>
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
                          opacity: Animated.multiply(cardsAnim[index + 4], cardsOpacityAnim.current[index + 4]),
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
                        <View style={styles.compactTitleContainer}>
                          <BodyText style={styles.compactTitle}>{ageRange.title}</BodyText>
                          <BodyText style={styles.compactAge}>{ageRange.age}</BodyText>
                        </View>
                        <BodyText style={styles.compactDescription}>{ageRange.description}</BodyText>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </View>
          </View>

        </Animated.View>
      </AnimatedOnboardingScreen>
    </ScreenContainer>
  );
}

const getStyles = (theme) => {
  // Protection contre theme undefined
  if (!theme || !theme.colors || !theme.spacing) {
    return StyleSheet.create({
      container: { flex: 1, backgroundColor: '#ffffff' },
      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
      loadingText: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
    });
  }
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      flex: 1,
      paddingTop: theme.spacing.m, // Padding encore plus réduit
    },
    
    messageSection: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.m, // Espace réduit après le message
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
      // Pas de gap ici, on gère l'espacement dans les rows
    },

    gridRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.m, // Gap vertical réduit
    },

    gridRowCenter: {
      flexDirection: 'row',
      justifyContent: 'center',
    },

    gridItem: {
      width: '47%', // Ajusté pour gap horizontal = gap vertical (spacing.m)
    },

    compactCard: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.m, // Padding normal pour bien encadrer
      borderRadius: theme.borderRadius.medium,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      height: 160, // Hauteur légèrement augmentée pour les icônes
      justifyContent: 'space-between', // Répartir l'espace équitablement
      paddingVertical: theme.spacing.s, // Padding vertical spécifique
    },

    compactCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '08',
    },

    compactIcon: {
      fontSize: 28, // Icône plus grande pour éviter la troncature
      lineHeight: 32, // Line height pour centrage parfait
      marginBottom: theme.spacing.xs,
    },

    compactTitleContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },

    compactTitle: {
      fontSize: 14, // Taille augmentée pour meilleure lisibilité
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 18, // Line height ajusté
    },

    compactAge: {
      fontSize: 12, // Légèrement plus petit que le titre
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },

    compactDescription: {
      fontSize: 12, // ✅ WCAG 2.1 AA - Taille nettement augmentée
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16, // Line height augmenté pour la lisibilité
      paddingHorizontal: theme.spacing.xs,
    },

    encouragementZone: {
      minHeight: 50, // Espace réservé réduit
      justifyContent: 'center',
      paddingTop: theme.spacing.s, // Padding réduit
    },

    encouragementCard: {
      backgroundColor: theme.colors.primary + '10',
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      borderRadius: theme.borderRadius.medium,
      marginHorizontal: theme.spacing.s,
    },

    encouragementText: {
      fontSize: 14,
      color: theme.colors.primary,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 20,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    loadingText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
  });
};