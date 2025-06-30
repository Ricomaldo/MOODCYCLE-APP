//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/800-cadeau.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Premier cadeau + ACTIVATION INTELLIGENCE COMPLÈTE
// 🕒 Version: 2.0 - Intelligence Activée
// 🧭 Used in: Onboarding flow - Étape 4/4 "Prête !"
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { getPersonalizedInsight } from '../../src/services/InsightsEngine';
import VignettesService from '../../src/services/VignettesService';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import VignetteCard from '../../src/features/insights/VignetteCard';
import { BodyText } from '../../src/core/ui/Typography';
import { useTheme } from '../../src/hooks/useTheme';

export default function CadeauScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  // 🧠 INTELLIGENCE HOOK
  const intelligence = useOnboardingIntelligence('800-cadeau');
  
  // 🎨 Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const vignetteAnim = useRef(new Animated.Value(0)).current;
  
  const [isLoading, setIsLoading] = useState(true);
  const [personalizedInsight, setPersonalizedInsight] = useState(null);
  const [firstVignette, setFirstVignette] = useState(null);
  const [error, setError] = useState(false);
  const [intelligenceRecap, setIntelligenceRecap] = useState(null);

  useEffect(() => {
    // Animation entrée
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

    // Animation sparkle continue
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

    // 🧠 GÉNÉRATION INTELLIGENCE
    generatePersonalizedContent();
  }, []);

  const generatePersonalizedContent = async () => {
    try {
      setIsLoading(true);
      
      // 🧠 1. Récupérer données complètes + OBSERVATIONS
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

      // 🧠 2. Créer récap intelligence visible
      const recap = {
        persona: userContext.persona,
        phase: userContext.phase,
        observations: observations.length,
        preferences: Object.keys(userContext.preferences).length,
        cycleConfigured: !!(cycleData?.lastPeriodDate && cycleData?.length),
        intelligenceLevel: calculateIntelligenceLevel(userContext)
      };
      setIntelligenceRecap(recap);

      // 🧠 3. Générer insight personnalisé ENRICHI
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
      
      // Personnaliser insight avec prénom et observations
      const personalizedContent = `${intelligence.userProfile.prenom || 'Ma belle'}, ${insightResult.content}${
        observations.length > 0 ? ` Tes observations révèlent déjà des patterns intéressants !` : ''
      }`;
      
      setPersonalizedInsight({
        ...insightResult,
        content: personalizedContent
      });

      // 🧠 4. Récupérer vignettes pour phase + persona
      const vignettes = await VignettesService.getVignettes(
        userContext.phase,
        userContext.persona
      );
      
      if (vignettes && vignettes.length > 0) {
        // Enrichir première vignette avec intelligence
        const enrichedVignette = {
          ...vignettes[0],
          isFirstTime: true,
          welcomeMessage: `Bienvenue ${intelligence.userProfile.prenom || ''} !`,
          confidence: intelligence.userProfile.personaConfidence || 0.8
        };
        setFirstVignette(enrichedVignette);
      }

      // 🧠 5. Marquer profil comme complété
      intelligence.updateProfile({ 
        completed: true,
        onboardingCompletedAt: Date.now()
      });
      
      // 🧠 6. Track completion avec toutes les métriques
      intelligence.trackAction('onboarding_completed', {
        duration: Date.now() - (intelligence.userProfile.startDate || Date.now()),
        persona: intelligence.currentPersona,
        phase: userContext.phase,
        insightGenerated: !!insightResult.content,
        vignetteGenerated: !!vignettes.length
      });

      setIsLoading(false);
      
      // Animation vignette après chargement
      setTimeout(() => {
        Animated.timing(vignetteAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 300);
      
    } catch (error) {
      console.error('🚨 Erreur génération contenu:', error);
      setError(true);
      setIsLoading(false);
      
      // Fallback
      setPersonalizedInsight({
        content: "Bienvenue dans ton voyage cyclique ! ✨",
        source: 'fallback'
      });
    }
  };

  const calculateIntelligenceLevel = (context) => {
    let score = 0;
    
    // Base persona + phase
    if (context.persona && context.persona !== 'emma') score += 20;
    if (context.phase) score += 15;
    
    // Observations
    if (context.observations.length > 0) score += 25;
    if (context.observations.length >= 2) score += 15;
    
    // Préférences configurées
    if (Object.keys(context.preferences).length > 0) score += 15;
    
    // Cycle configuré
    if (context.cycleData?.lastPeriodDate) score += 10;
    
    return Math.min(score, 100);
  };

  const handleFinishOnboarding = () => {
    // 🧠 Préparer contexte pour app principale
    const transitionData = {
      isFirstLaunch: true,
      welcomeInsight: personalizedInsight,
      firstVignette: firstVignette,
      onboardingCompletedAt: Date.now()
    };
    
    // 🧠 Track transition
    intelligence.trackAction('transition_to_app', {
      hasPersonalizedContent: !!personalizedInsight && !error,
      persona: intelligence.currentPersona
    });
    
    // Navigation avec remplacement (pas de retour possible)
    router.replace({
      pathname: '/(tabs)/cycle',
      params: transitionData
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Animated.View
            style={{
              opacity: sparkleAnim,
              transform: [{
                scale: sparkleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                })
              }]
            }}
          >
            <BodyText style={styles.sparkle}>🧠</BodyText>
          </Animated.View>
          <BodyText style={styles.loadingText}>
            J'analyse tes données pour créer ton expérience unique...
          </BodyText>
          <BodyText style={styles.loadingSubtext}>
            Persona • Phase • Observations • Préférences
          </BodyText>
        </View>
      );
    }

    return (
      <>
        {/* NOUVEAU : Récap Intelligence */}
        {intelligenceRecap && (
          <Animated.View 
            style={[
              styles.intelligenceContainer,
              {
                opacity: vignetteAnim,
                transform: [{
                  translateY: vignetteAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }
            ]}
          >
            <BodyText style={styles.intelligenceTitle}>
              ✨ Ce que j'ai appris de toi
            </BodyText>
            
            <View style={styles.intelligenceGrid}>
              <View style={styles.intelligenceItem}>
                <BodyText style={styles.intelligenceIcon}>🎭</BodyText>
                <BodyText style={styles.intelligenceLabel}>Persona</BodyText>
                <BodyText style={styles.intelligenceValue}>{intelligenceRecap.persona}</BodyText>
              </View>
              
              <View style={styles.intelligenceItem}>
                <BodyText style={styles.intelligenceIcon}>🌙</BodyText>
                <BodyText style={styles.intelligenceLabel}>Phase</BodyText>
                <BodyText style={styles.intelligenceValue}>{intelligenceRecap.phase}</BodyText>
              </View>
              
              {intelligenceRecap.observations > 0 && (
                <View style={styles.intelligenceItem}>
                  <BodyText style={styles.intelligenceIcon}>💫</BodyText>
                  <BodyText style={styles.intelligenceLabel}>Observations</BodyText>
                  <BodyText style={styles.intelligenceValue}>{intelligenceRecap.observations} captées</BodyText>
                </View>
              )}
              
              <View style={styles.intelligenceItem}>
                <BodyText style={styles.intelligenceIcon}>🎯</BodyText>
                <BodyText style={styles.intelligenceLabel}>Personnalisation</BodyText>
                <BodyText style={styles.intelligenceValue}>{intelligenceRecap.intelligenceLevel}%</BodyText>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Insight personnalisé */}
        {personalizedInsight && (
          <Animated.View 
            style={[
              styles.insightContainer,
              {
                opacity: vignetteAnim,
                transform: [{
                  translateY: vignetteAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }
            ]}
          >
            <BodyText style={styles.insightLabel}>
              Ton premier conseil personnalisé :
            </BodyText>
            <View style={styles.insightBubble}>
              <BodyText style={styles.insightText}>
                {personalizedInsight.content}
              </BodyText>
              {personalizedInsight.source !== 'fallback' && (
                <BodyText style={styles.insightMeta}>
                  Généré selon ton profil unique ✨
                </BodyText>
              )}
            </View>
          </Animated.View>
        )}

        {/* Première vignette si disponible */}
        {firstVignette && (
          <Animated.View 
            style={[
              styles.vignetteContainer,
              {
                opacity: vignetteAnim,
                transform: [{
                  translateY: vignetteAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  })
                }]
              }
            ]}
          >
            <BodyText style={styles.vignetteLabel}>
              Ta première action suggérée :
            </BodyText>
            <VignetteCard
              vignette={firstVignette}
              onPress={() => console.log('Preview vignette')}
              disabled={true}
              style={styles.vignettePreview}
            />
          </Animated.View>
        )}

        {/* CTA Final */}
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishOnboarding}
          activeOpacity={0.7}
        >
          <BodyText style={styles.finishButtonText}>
            Commencer mon voyage ✨
          </BodyText>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="800-cadeau" canGoBack={false} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* TopSection */}
        <View style={styles.topSection}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <MeluneAvatar 
              phase="ovulatory" 
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
                }),
              },
            ]}
          >
            <BodyText style={styles.meluneMessage}>
              {isLoading ? 
                "Un instant, j'analyse tes données pour créer ton expérience unique..." :
                `${intelligence.userProfile.prenom || 'Ma belle'}, ton aventure personnalisée commence !`
              }
            </BodyText>
          </Animated.View>
        </View>

        {/* MainSection */}
        <View style={styles.mainSection}>
          {renderContent()}
        </View>
        
        {/* Sparkles décoratifs */}
        <Animated.View
          style={[
            styles.sparkleContainer,
            { opacity: sparkleAnim }
          ]}
        >
          <BodyText style={[styles.sparkleDecor, styles.sparkle1]}>✨</BodyText>
          <BodyText style={[styles.sparkleDecor, styles.sparkle2]}>✨</BodyText>
          <BodyText style={[styles.sparkleDecor, styles.sparkle3]}>✨</BodyText>
        </Animated.View>
        
      </Animated.View>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  
  topSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
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
    justifyContent: 'center',
    paddingBottom: theme.spacing.xxl,
  },
  
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  
  sparkle: {
    fontSize: 48,
    marginBottom: theme.spacing.l,
  },
  
  loadingText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  
  insightContainer: {
    marginBottom: theme.spacing.xl,
  },
  
  insightLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  
  insightBubble: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
  },
  
  insightText: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: theme.fonts.body,
  },
  
  insightMeta: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.m,
    fontStyle: 'italic',
  },
  
  vignetteContainer: {
    marginBottom: theme.spacing.xl,
  },
  
  vignetteLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  
  vignettePreview: {
    opacity: 0.9,
  },
  
  finishButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: theme.spacing.xl,
  },
  
  finishButtonText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
  },
  
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  
  sparkleDecor: {
    position: 'absolute',
    fontSize: 20,
    color: theme.colors.primary,
  },
  
  sparkle1: {
    top: '10%',
    left: '10%',
  },
  
  sparkle2: {
    top: '80%',
    right: '15%',
  },
  
  sparkle3: {
    bottom: '20%',
    left: '80%',
  },
  
  intelligenceContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  
  intelligenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  
  intelligenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: theme.spacing.m,
  },
  
  intelligenceItem: {
    alignItems: 'center',
    minWidth: '40%',
  },
  
  intelligenceIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  
  intelligenceLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  
  intelligenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  loadingSubtext: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.s,
    fontStyle: 'italic',
  },
});