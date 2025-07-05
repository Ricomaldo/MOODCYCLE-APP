//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/950-demarrage.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Finalisation et activation de l'intelligence
// 🔄 Cycle: Onboarding - Étape finale
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { getPersonalizedInsight } from '../../src/services/InsightsEngine';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import OnboardingButton from '../../src/features/onboarding/shared/OnboardingButton';
import { 
  AnimatedRevealMessage, 
  AnimatedCascadeCard,
  ANIMATION_DURATIONS 
} from '../../src/core/ui/animations';

export default function CadeauScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const intelligence = useOnboardingIntelligence('950-demarrage');
  
  // États
  const [isLoading, setIsLoading] = useState(true);
  const [personalizedInsight, setPersonalizedInsight] = useState(null);
  const [error, setError] = useState(false);
  const [intelligenceRecap, setIntelligenceRecap] = useState(null);

  useEffect(() => {
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
          <AnimatedRevealMessage 
            delay={ANIMATION_DURATIONS.initialMessage}
            style={styles.loadingMessageContainer}
          >
            <BodyText style={styles.loadingEmoji}>✨</BodyText>
            <BodyText style={styles.loadingText}>
              Génération de ton expérience personnalisée...
            </BodyText>
          </AnimatedRevealMessage>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <AnimatedRevealMessage 
            delay={ANIMATION_DURATIONS.initialMessage}
            style={styles.errorMessageContainer}
          >
            <BodyText style={styles.errorText}>
              Quelque chose s'est passé... Mais tu es prête ! 🌟
            </BodyText>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={generatePersonalizedContent}
            >
              <BodyText style={styles.retryButtonText}>Réessayer</BodyText>
            </TouchableOpacity>
          </AnimatedRevealMessage>
        </View>
      );
    }

    return (
      <View style={styles.successContainer}>
        {/* Message de Mélune */}
        <View style={styles.messageSection}>
          <AnimatedRevealMessage 
            delay={ANIMATION_DURATIONS.initialMessage}
            style={styles.messageContainer}
          >
            <MeluneAvatar 
              phase="ovulatory" 
              size="large" 
              style="classic"
              animated={true}
            />
            <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
              Ton voyage commence maintenant ! 🌟
            </BodyText>
          </AnimatedRevealMessage>
        </View>

        {/* Section principale */}
        {personalizedInsight && (
          <View style={styles.mainSection}>
            <AnimatedCascadeCard
              delay={ANIMATION_DURATIONS.initialMessage + 800}
              style={styles.insightCard}
            >
              <BodyText style={styles.insightText}>
                {personalizedInsight.content}
              </BodyText>
            </AnimatedCascadeCard>
          </View>
        )}

        {/* Section bouton */}
        <OnboardingButton
          title="Commencer mon voyage"
          onPress={handleFinishOnboarding}
          delay={ANIMATION_DURATIONS.initialMessage + 1200}
          variant="primary"
          style={styles.buttonContainer}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xxl,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  messageContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  
  message: {
    fontSize: 20,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 28,
    maxWidth: 300,
    marginTop: theme.spacing.l,
  },
  
  mainSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  loadingMessageContainer: {
    alignItems: 'center',
  },
  
  loadingEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  errorMessageContainer: {
    alignItems: 'center',
  },
  
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  
  retryButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  
  retryButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  
  successContainer: {
    flex: 1,
  },
  
  insightCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  insightText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  
  buttonContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
});