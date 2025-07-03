//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/800-demarrage.jsx
// 🧩 Type: Écran Onboarding
// 📚 Description: Premier cadeau + activation intelligence complète
// 🕒 Version: 2.0 - 2025-01-21
// 🧭 Used in: Parcours onboarding, étape finale
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { getPersonalizedInsight } from '../../src/services/InsightsEngine';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';

export default function CadeauScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const intelligence = useOnboardingIntelligence('800-cadeau');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  
  const [isLoading, setIsLoading] = useState(true);
  const [personalizedInsight, setPersonalizedInsight] = useState(null);
  const [error, setError] = useState(false);
  const [intelligenceRecap, setIntelligenceRecap] = useState(null);

  useEffect(() => {
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
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    generatePersonalizedContent();
  }, []);

  const generatePersonalizedContent = async () => {
    try {
      setIsLoading(true);
      
      const cycleData = intelligence.cycle;
      const observations = cycleData?.observations || [];
      
      const userContext = {
        phase: intelligence.userProfile.currentPhase || cycleData?.currentPhase || 'menstrual',
        persona: intelligence.currentPersona || 'emma',
        preferences: intelligence.userProfile.preferences || {},
        melune: { tone: 'friendly' },
        profile: intelligence.userProfile,
        observations: observations,
        hasObservations: observations.length > 0,
        cycleData: cycleData
      };

      const recap = {
        persona: userContext.persona,
        phase: userContext.phase,
        observations: observations.length,
        preferences: Object.keys(userContext.preferences).length,
        cycleConfigured: !!(cycleData?.lastPeriodDate && cycleData?.length),
        intelligenceLevel: calculateIntelligenceLevel(userContext)
      };
      setIntelligenceRecap(recap);

      const enrichedContext = {
        ...userContext,
        recentObservation: observations.length > 0 ? observations[observations.length - 1] : null,
        hasPersonalData: observations.length > 0 || recap.cycleConfigured
      };

      const insightResult = await getPersonalizedInsight(enrichedContext, {
        enrichWithContext: true,
        usedInsights: [],
        includeObservations: observations.length > 0
      });
      
      const personalizedContent = `${insightResult.content}${
        observations.length > 0 ? ` Tes observations révèlent déjà des patterns intéressants !` : ''
      }`;
      
      setPersonalizedInsight({
        ...insightResult,
        content: personalizedContent
      });



      intelligence.updateProfile({ 
        completed: true,
        onboardingCompletedAt: Date.now()
      });
      
      intelligence.trackAction('onboarding_completed', {
        duration: Date.now() - (intelligence.userProfile.startDate || Date.now()),
        persona: intelligence.currentPersona,
        phase: userContext.phase,
        insightGenerated: !!insightResult.content
      });

      setIsLoading(false);
      
    } catch (error) {
      console.error('🚨 Erreur génération contenu:', error);
      setError(true);
      setIsLoading(false);
      
      setPersonalizedInsight({
        content: "Bienvenue dans ton voyage cyclique ! ✨",
        source: 'fallback'
      });
    }
  };

  const calculateIntelligenceLevel = (context) => {
    let score = 0;
    
    if (context.persona && context.persona !== 'emma') score += 20;
    if (context.phase) score += 15;
    
    if (context.observations.length > 0) score += 25;
    if (context.observations.length >= 2) score += 15;
    
    if (Object.keys(context.preferences).length > 0) score += 15;
    
    if (context.cycleData?.lastPeriodDate) score += 10;
    
    return Math.min(score, 100);
  };

  const handleFinishOnboarding = () => {
    intelligence.trackAction('onboarding_finish_clicked', {
      hasPersonalizedInsight: !!personalizedInsight,
      intelligenceLevel: intelligenceRecap?.intelligenceLevel || 0
    });
    
    router.replace('/(tabs)/cycle');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Animated.View style={{
            transform: [{
              rotate: sparkleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })
            }]
          }}>
            <BodyText style={styles.loadingEmoji}>✨</BodyText>
          </Animated.View>
          <BodyText style={styles.loadingText}>
            Génération de ton expérience personnalisée...
          </BodyText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <BodyText style={styles.errorText}>
            Quelque chose s'est passé... Mais tu es prête ! 🌟
          </BodyText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={generatePersonalizedContent}
          >
            <BodyText style={styles.retryButtonText}>Réessayer</BodyText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.successContainer}>
        <View style={styles.header}>
          <MeluneAvatar 
            phase="ovulatory" 
            size="large" 
            style="classic"
            animated={true}
          />
          
          <BodyText style={styles.welcomeTitle}>
            Ton voyage commence maintenant ! 🌟
          </BodyText>
          
        </View>

        {personalizedInsight && (
          <View style={styles.insightContainer}>
            <View style={styles.insightCard}>
              <BodyText style={styles.insightText}>
                {personalizedInsight.content}
              </BodyText>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="800-cadeau" hideProgress={true} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.mainContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderContent()}
        </Animated.View>

        <TouchableOpacity 
          style={styles.finishButton}
          onPress={handleFinishOnboarding}
          disabled={isLoading}
        >
          <BodyText style={styles.finishButtonText}>
            Commencer l'aventure ! 🚀
          </BodyText>
        </TouchableOpacity>
      </Animated.View>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    color: theme.colors.text,
  },
  intelligenceRecap: {
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  recapTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  recapText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  insightContainer: {
    marginBottom: 24,
    width: '100%',
  },
  insightCard: {
    backgroundColor: theme.colors.primary + '10',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    textAlign: 'center',
  },

  finishButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});