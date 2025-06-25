import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading2, BodyText } from '../../components/Typography';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { theme } from '../../config/theme';
import MeluneAvatar from '../../components/MeluneAvatar';
import ChatBubble from '../../components/ChatBubble';

// 🌟 NOUVEAU : Import du système d'enrichissement contextuel unifié
import { enrichInsightWithContext } from '../../data/insights-personalized-v2';
import { getDaysSinceLastPeriod, calculateCurrentPhase } from '../../utils/dateUtils';

export default function CadeauScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userInfo, preferences, melune, updateFirstInsight, completeOnboarding } = useOnboardingStore();
  
  const [showInsight, setShowInsight] = useState(false);
  const [personalizedInsight, setPersonalizedInsight] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
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

    // Générer l'insight personnalisé
    setTimeout(() => {
      const insight = generatePersonalizedInsight();
      setPersonalizedInsight(insight);
      setShowInsight(true);
      
      // Animation de célébration
      startCelebrationAnimation();
    }, 1000);
  }, []);

  const startCelebrationAnimation = () => {
    // Animation de scintillement continu
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation de célébration principale
    Animated.timing(celebrationAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const generatePersonalizedInsight = () => {
    const onboardingData = useOnboardingStore.getState();
    const { journeyChoice, cycleData, preferences, melune } = onboardingData;
    
    // Calculer la phase estimée du cycle
    const estimatedPhase = calculateCurrentPhaseFromCycleData(cycleData);
    
    // Identifier les préférences principales (score >= 4)
    const strongPreferences = Object.entries(preferences || {})
      .filter(([key, value]) => value >= 4)
      .map(([key]) => key);

    // Générer un message basé sur le choix du voyage (écran 2)
    let baseMessage = "";
    
    if (journeyChoice?.selectedOption?.includes("reconnexion")) {
      baseMessage = "Je sens en toi un désir profond de retrouver ton essence féminine";
    } else if (journeyChoice?.selectedOption?.includes("comprendre")) {
      baseMessage = "Ta quête de compréhension de ton corps et de tes émotions me touche";
    } else if (journeyChoice?.selectedOption?.includes("équilibre")) {
      baseMessage = "Ton aspiration à l'harmonie cyclique résonne avec la sagesse ancestrale";
    } else {
      baseMessage = "Je ressens ta belle énergie et ta soif d'épanouissement";
    }

    // Ajouter l'information sur la phase actuelle
    const phaseMessage = getPhaseMessage(estimatedPhase);
    
    // Ajouter des conseils basés sur les préférences fortes
    const preferencesAdvice = getPreferencesAdvice(strongPreferences);
    
    // 🌟 NOUVEAU : Utiliser le système d'enrichissement contextuel unifié
    const combinedMessage = `${baseMessage}. ${phaseMessage}. ${preferencesAdvice}`;
    
    // Utiliser enrichInsightWithContext au lieu de formatInsightMessage
    return enrichInsightWithContext(combinedMessage, onboardingData, estimatedPhase);
  };

  const calculateCurrentPhaseFromCycleData = (cycleData) => {
    if (!cycleData?.lastPeriodDate) return 'follicular';
    
    const daysSinceLastPeriod = getDaysSinceLastPeriod(cycleData.lastPeriodDate);
    const cycleLength = cycleData.averageCycleLength || 28;
    const periodLength = cycleData.averagePeriodLength || 5;
    
    const phase = calculateCurrentPhase(daysSinceLastPeriod, cycleLength, periodLength);
    
    // Mapping pour les noms utilisés dans ce contexte spécifique
    const phaseMapping = {
      'menstrual': 'menstrual',
      'follicular': 'follicular', 
      'ovulatory': 'ovulation',  // Spécificité de ce fichier
      'luteal': 'luteal'
    };
    
    return phaseMapping[phase] || 'follicular';
  };

  const getPhaseMessage = (phase) => {
    const phaseMessages = {
      menstrual: "Tu es dans ta phase menstruelle, temps sacré de régénération et d'introspection",
      follicular: "Tu entres dans ta phase folliculaire, période de renouveau et de créativité",
      ovulation: "Tu rayonnes dans ta phase d'ovulation, moment de pleine puissance féminine",
      luteal: "Tu traverses ta phase lutéale, temps de maturation et de sagesse intérieure",
      premenstrual: "Tu approches de tes prochaines lunes, période de lâcher-prise et de préparation"
    };
    
    return phaseMessages[phase] || "Tu es dans un moment unique de ton cycle";
  };

  const getPreferencesAdvice = (strongPreferences) => {
    const adviceMap = {
      symptoms: "Je t'accompagnerai avec des conseils naturels pour ton bien-être physique",
      moods: "Nous explorerons ensemble la richesse de tes émotions cycliques",
      phyto: "Les plantes et huiles essentielles seront tes alliées précieuses",
      phases: "Tu découvriras la magie de tes différentes énergies cycliques",
      lithotherapy: "Les cristaux t'aideront à harmoniser tes énergies subtiles",
      rituals: "Nous créerons ensemble des rituels qui nourriront ton âme"
    };
    
    if (strongPreferences.length === 0) {
      return "Je m'adapterai parfaitement à tes besoins au fil de notre voyage";
    } else if (strongPreferences.length === 1) {
      return adviceMap[strongPreferences[0]] || "Je te guiderai selon tes préférences";
    } else {
      return "Ensemble, nous explorerons tous les aspects qui te passionnent";
    }
  };

  // 🗑️ SUPPRIMÉ : formatInsightMessage remplacé par le système d'enrichissement contextuel unifié

  const handleComplete = () => {
    console.log('🎯 Finalisation onboarding...');
    
    // Sauvegarder l'insight et marquer l'onboarding comme terminé
    updateFirstInsight({
      message: personalizedInsight,
      category: 'welcome',
      unlocked: true
    });
    
    completeOnboarding();
    console.log('✅ Onboarding marqué comme terminé');
    
    // Animation de sortie puis navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      console.log('🚀 Navigation vers app principale...');
      try {
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('❌ Erreur navigation:', error);
        // Fallback - navigation directe
        router.push('/(tabs)/home');
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>


      {/* Particules de célébration */}
      <Animated.View 
        style={[
          styles.sparklesContainer,
          { 
            opacity: sparkleAnim,
            transform: [{
              scale: sparkleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2]
              })
            }]
          }
        ]}
      >
        <BodyText style={[styles.sparkle, { top: '15%', left: '20%' }]}>✨</BodyText>
        <BodyText style={[styles.sparkle, { top: '25%', right: '15%' }]}>🌟</BodyText>
        <BodyText style={[styles.sparkle, { top: '45%', left: '10%' }]}>💫</BodyText>
        <BodyText style={[styles.sparkle, { top: '60%', right: '25%' }]}>⭐</BodyText>
        <BodyText style={[styles.sparkle, { top: '75%', left: '30%' }]}>✨</BodyText>
        <BodyText style={[styles.sparkle, { top: '35%', right: '35%' }]}>🌙</BodyText>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Avatar Melune avec style personnalisé */}
          <Animated.View 
            style={[
              styles.avatarContainer,
              { 
                transform: [
                  { translateY: slideAnim },
                  { 
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1]
                    })
                  }
                ]
              }
            ]}
          >
            <MeluneAvatar 
              phase="ovulation" 
              size="medium" 
              style={melune?.avatarStyle || 'classic'}
            />
          </Animated.View>

          {/* Message d'introduction */}
          <Animated.View 
            style={[
              styles.messageContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <ChatBubble 
              message={userInfo.prenom ? 
                `Félicitations ${userInfo.prenom} ! Tu as débloqué ton insight personnalisé premium... 🎁✨` :
                "Félicitations ! Notre connexion est maintenant établie. J'ai un cadeau spécial pour toi... 🎁"
              }
              isUser={false} 
            />
          </Animated.View>

          {/* Insight personnalisé */}
          {showInsight && (
            <Animated.View 
              style={[
                styles.insightContainer,
                { 
                  opacity: celebrationAnim,
                  transform: [
                    { 
                      translateY: celebrationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              <View style={styles.giftBox}>
                <BodyText style={styles.giftIcon}>🎁</BodyText>
                <BodyText style={styles.giftTitle}>
                  {userInfo.prenom ? 
                    `${userInfo.prenom}, voici ton insight premium personnalisé` :
                    'Ton premier insight personnalisé'
                  }
                </BodyText>
              </View>
              
              <View style={styles.insightCard}>
                <BodyText style={styles.insightText}>{personalizedInsight}</BodyText>
              </View>

              <View style={styles.celebrationMessage}>
                <BodyText style={styles.celebrationText}>
                  {userInfo.prenom ? 
                    `Bienvenue dans ton univers premium, ${userInfo.prenom} ! 🌸` :
                    'Bienvenue dans ton univers MoodCycle ! 🌸'
                  }
                </BodyText>
                <BodyText style={styles.celebrationSubtext}>
                  Cette sagesse premium n'est que le début de notre voyage ensemble...
                </BodyText>
              </View>
            </Animated.View>
          )}

          {/* Bouton de finalisation */}
          {showInsight && (
            <Animated.View 
              style={[
                styles.buttonContainer,
                { 
                  opacity: celebrationAnim,
                  transform: [
                    { 
                      translateY: celebrationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.completeButton} 
                onPress={handleComplete}
                activeOpacity={0.8}
              >
                <BodyText style={styles.completeButtonText}>
                  Découvrir mon univers ✨
                </BodyText>
              </TouchableOpacity>
            </Animated.View>
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
  
  // Animation des particules
  sparklesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
    color: theme.colors.primary,
  },
  
  // Avatar
  avatarContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
    zIndex: 2,
  },
  
  // Messages
  messageContainer: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s,
    zIndex: 2,
  },
  
  // Insight personnalisé
  insightContainer: {
    marginBottom: theme.spacing.s,
    alignItems: 'center',
    zIndex: 2,
  },
  giftBox: {
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  giftIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  giftTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.m,
    marginVertical: theme.spacing.s,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  celebrationMessage: {
    alignItems: 'center',
    marginTop: theme.spacing.s,
  },
  celebrationText: {
    fontSize: 20,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  celebrationSubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Bouton de finalisation
  buttonContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  completeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    minWidth: 250,
  },
  completeButtonText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontFamily: theme.fonts.bodyBold,
    fontSize: 18,
    textAlign: 'center',
  },
}); 