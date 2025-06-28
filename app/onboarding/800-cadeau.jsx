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
      
      // 🧠 1. Récupérer données complètes
      const userContext = {
        phase: intelligence.userProfile.currentPhase || 'menstrual',
        persona: intelligence.currentPersona || 'emma',
        preferences: intelligence.userProfile.preferences,
        melune: { tone: 'friendly' },
        profile: intelligence.userProfile
      };

      // 🧠 2. Générer insight personnalisé
      const insightResult = await getPersonalizedInsight(userContext, {
        enrichWithContext: true,
        usedInsights: []
      });
      
      setPersonalizedInsight(insightResult);

      // 🧠 3. Récupérer vignettes pour phase + persona
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

      // 🧠 4. Marquer profil comme complété
      intelligence.updateProfile({ 
        completed: true,
        onboardingCompletedAt: Date.now()
      });
      
      // 🧠 5. Track completion avec toutes les métriques
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
            <BodyText style={styles.sparkle}>✨</BodyText>
          </Animated.View>
          <BodyText style={styles.loadingText}>
            Je prépare ton expérience personnalisée...
          </BodyText>
        </View>
      );
    }

    return (
      <>
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
                  Personnalisé pour {intelligence.currentPersona} en phase {intelligence.userProfile.currentPhase || 'menstruelle'}
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
                "Un instant, je personnalise ton expérience..." :
                `${intelligence.userProfile.prenom || 'Ma belle'}, ton voyage commence maintenant !`
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
});