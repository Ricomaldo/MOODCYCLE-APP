//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/800-cadeau.jsx
// 🧩 Type : Composant Écran (Screen)
// 📚 Description : Écran final de l'onboarding, remise d'un insight personnalisé à l'utilisatrice
// 🕒 Version : 4.0 - 2025-06-21 (Migration vers useOnboardingInsight)
// 🧭 Utilisé dans : onboarding flow (étape 10)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { Heading2, BodyText } from '../../src/core/ui/Typography';
import { useUserStore } from '../../src/stores/useUserStore';
import { theme } from '../../src/config/theme';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import ChatBubble from '../../src/features/chat/ChatBubble';

// 🌟 NOUVEAU : Import du hook d'insight personnalisé pour onboarding
import { useOnboardingInsight } from '../../src/hooks/usePersonalizedInsight';
import { useCycle } from '../../src/hooks/useCycle';

export default function CadeauScreen() {
  const router = useRouter();
  const { profile, melune, completeProfile } = useUserStore();
  const { currentPhase } = useCycle();
  
  // 🎯 NOUVEAU : Utilisation du hook spécialisé onboarding
  const { content: personalizedInsight, loading: insightLoading, generate } = useOnboardingInsight();

  const [showInsight, setShowInsight] = useState(false);

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

    // Générer l'insight personnalisé après animation
    setTimeout(() => {
      if (!personalizedInsight && !insightLoading) {
        generate(); // Déclencher la génération
      }
    }, 1000);
  }, []);

  // Effet pour afficher l'insight quand il est prêt
  useEffect(() => {
    if (personalizedInsight && !showInsight) {
      setShowInsight(true);
      startCelebrationAnimation();
    }
  }, [personalizedInsight, showInsight]);

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

  const handleComplete = () => {
    console.log('🎯 Finalisation onboarding...');
    completeProfile();
    console.log('✅ Onboarding marqué comme terminé');

    console.log('🚀 Navigation vers app principale...');
    try {
      router.replace("/(tabs)");
    } catch (error) {
      console.error('❌ Erreur navigation:', error);
      router.replace("/(tabs)");
    }
  };

  // Message d'insight avec fallback si pas encore généré
  const displayInsight = personalizedInsight || (
    profile.prenom 
      ? `${profile.prenom}, bienvenue dans ton voyage cyclique ! ✨ Je sens en toi une belle énergie prête à s'épanouir.`
      : "Bienvenue dans ton voyage cyclique ! ✨ Je sens en toi une belle énergie prête à s'épanouir."
  );

  return (
    <ScreenContainer style={styles.container}>
      {/* Particules de célébration */}
      <Animated.View
        style={[
          styles.sparklesContainer,
          {
            opacity: sparkleAnim,
            transform: [
              {
                scale: sparkleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
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
                      outputRange: [1, 1.1],
                    }),
                  },
                ],
              },
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
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <ChatBubble
              message={
                profile.prenom
                  ? `Félicitations ${profile.prenom} ! Tu as débloqué ton insight personnalisé premium... 🎁✨`
                  : "Félicitations ! Notre connexion est maintenant établie. J'ai un cadeau spécial pour toi... 🎁"
              }
              isUser={false}
            />
          </Animated.View>

          {/* Insight personnalisé */}
          {(showInsight || insightLoading) && (
            <Animated.View
              style={[
                styles.insightContainer,
                {
                  opacity: celebrationAnim,
                  transform: [
                    {
                      translateY: celebrationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.giftBox}>
                <BodyText style={styles.giftIcon}>🎁</BodyText>
                <BodyText style={styles.giftTitle}>
                  {profile.prenom
                    ? `${profile.prenom}, voici ton insight premium personnalisé`
                    : 'Ton premier insight personnalisé'}
                </BodyText>
              </View>

              <View style={styles.insightCard}>
                {insightLoading ? (
                  <BodyText style={styles.loadingText}>Génération de ton insight personnalisé... ✨</BodyText>
                ) : (
                  <BodyText style={styles.insightText}>{displayInsight}</BodyText>
                )}
              </View>

              <View style={styles.celebrationMessage}>
                <BodyText style={styles.celebrationText}>
                  {profile.prenom
                    ? `Bienvenue dans ton univers premium, ${profile.prenom} ! 🌸`
                    : 'Bienvenue dans ton univers MoodCycle ! 🌸'}
                </BodyText>
                <BodyText style={styles.celebrationSubtext}>
                  Cette sagesse premium n'est que le début de notre voyage ensemble...
                </BodyText>
              </View>
            </Animated.View>
          )}

          {/* Bouton de finalisation */}
          {(showInsight || personalizedInsight) && (
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  opacity: celebrationAnim,
                  transform: [
                    {
                      translateY: celebrationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
                activeOpacity={0.8}
              >
                <BodyText style={styles.completeButtonText}>Découvrir mon univers ✨</BodyText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
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
  loadingText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textLight,
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
