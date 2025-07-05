//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/950-demarrage.jsx
// 🎯 Status: ✅ HARMONISÉ - Template onboarding cohérent
// 📝 Description: Finalisation et activation de l'intelligence
// 🔄 Cycle: Onboarding - Étape finale
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { getPersonalizedInsight } from '../../src/services/InsightsEngine';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { 
  AnimatedOnboardingScreen,
  AnimatedRevealMessage,
  AnimatedOnboardingButton,
  StandardOnboardingButton,
  AnimatedCascadeCard,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS
} from '../../src/core/ui/animations';

export default function DemarrageScreen() {
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

  const handleRetry = () => {
    setError(false);
    generatePersonalizedContent();
  };

  const getWelcomeMessage = () => {
    if (isLoading) return "Génération de ton expérience personnalisée...";
    if (error) return "Quelque chose s'est passé... Mais tu es prête ! 🌟";
    return "Ton voyage commence maintenant ! 🌟";
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} style={styles.container}>
      <AnimatedOnboardingScreen>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Message de Mélune */}
          <View style={styles.messageSection}>
            <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
              <MeluneAvatar 
                phase="ovulatory" 
                size="large" 
                style="classic"
                animated={true}
              />
            </AnimatedRevealMessage>
            
            <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage + 400}>
              <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                {getWelcomeMessage()}
              </BodyText>
            </AnimatedRevealMessage>
          </View>

          {/* Section principale */}
          <View style={styles.mainSection}>
            {isLoading ? (
              <AnimatedCascadeCard
                delay={ANIMATION_DURATIONS.welcomeFirstMessage + 800}
                style={styles.loadingCard}
              >
                <BodyText style={styles.loadingEmoji}>✨</BodyText>
                <BodyText style={styles.loadingText}>
                  Préparation de ton expérience personnalisée...
                </BodyText>
              </AnimatedCascadeCard>
            ) : error ? (
              <AnimatedCascadeCard
                delay={ANIMATION_DURATIONS.welcomeFirstMessage + 800}
                style={styles.errorCard}
              >
                <BodyText style={styles.errorText}>
                  Une petite erreur s'est glissée, mais tu es prête à commencer !
                </BodyText>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <BodyText style={styles.retryButtonText}>Réessayer</BodyText>
                </TouchableOpacity>
              </AnimatedCascadeCard>
            ) : personalizedInsight ? (
              <AnimatedCascadeCard
                delay={ANIMATION_DURATIONS.welcomeFirstMessage + 800}
                style={styles.insightCard}
              >
                <BodyText style={styles.insightText}>
                  {personalizedInsight.content}
                </BodyText>
                
                {intelligenceRecap && (
                  <View style={styles.recapContainer}>
                    <BodyText style={styles.recapTitle}>
                      Ton profil Mélune :
                    </BodyText>
                    <BodyText style={styles.recapText}>
                      • Persona : {intelligenceRecap.persona}
                    </BodyText>
                    <BodyText style={styles.recapText}>
                      • Phase actuelle : {intelligenceRecap.phase}
                    </BodyText>
                    <BodyText style={styles.recapText}>
                      • Préférences : {intelligenceRecap.preferences} configurées
                    </BodyText>
                    {intelligenceRecap.observations > 0 && (
                      <BodyText style={styles.recapText}>
                        • Observations : {intelligenceRecap.observations} enregistrées
                      </BodyText>
                    )}
                  </View>
                )}
              </AnimatedCascadeCard>
            ) : null}
          </View>
        </ScrollView>

        {/* Section bouton */}
        <View style={styles.bottomSection}>
          <AnimatedOnboardingButton {...ANIMATION_CONFIGS.onboarding.welcome.button}>
            <StandardOnboardingButton
              title="Commencer mon voyage"
              onPress={handleFinishOnboarding}
              variant="primary"
              disabled={isLoading}
            />
          </AnimatedOnboardingButton>
        </View>
      </AnimatedOnboardingScreen>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 60,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
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
    paddingHorizontal: theme.spacing.xl,
  },
  
  loadingCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
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
  
  errorCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  
  errorText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  
  retryButton: {
    backgroundColor: theme.colors.primary + '15',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  
  retryButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  insightCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  
  insightText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.l,
  },
  
  recapContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.l,
  },
  
  recapTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  
  recapText: {
    fontSize: 13,
    color: theme.colors.textLight,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
  
  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
});