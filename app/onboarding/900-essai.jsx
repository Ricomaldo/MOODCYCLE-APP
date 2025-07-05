//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/900-essai.jsx
// 🎯 Status: ✅ HARMONISÉ - Pattern onboarding cohérent
// 📝 Description: Démonstration de valeur puis choix de version
// 🔄 Cycle: Onboarding - Étape 8/8
// ─────────────────────────────────────────────────────────
//
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { 
  AnimatedOnboardingScreen,
  AnimatedRevealMessage,
  AnimatedOnboardingButton,
  StandardOnboardingButton,
  AnimatedCascadeCard,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS
} from '../../src/core/ui/animations';
import { Feather } from '@expo/vector-icons';
import ValuePreview from '../../src/features/onboarding/ValuePreview';

// 🎯 Options d'accompagnement personnalisées par persona
const PERSONA_ARGUMENTS = {
  emma: {
    introMessage: "Parfait ! Maintenant, laisse-moi te montrer la magie qui t'attend... ✨",
    choiceMessage: "Tu as vu ce dont je suis capable... Choisis ton niveau d'accompagnement 🌟",
    complete: {
      title: "Accompagnement Complet",
      description: "14 jours d'exploration guidée avec toute l'intelligence de Mélune",
      benefits: [
        "✨ Intelligence Mélune complète",
        "💫 Chat enrichi et personnalisé", 
        "🌙 Insights selon ta phase",
        "📱 Toutes les fonctionnalités"
      ],
      cta: "Explorer 14 jours"
    }
  },
  laure: {
    introMessage: "Excellent ! Maintenant, découvre ce que Mélune peut faire pour optimiser ton quotidien 📊",
    choiceMessage: "Tu as vu le potentiel... Choisis ton niveau d'optimisation 🎯",
    complete: {
      title: "Accompagnement Complet",
      description: "14 jours d'optimisation guidée avec analyses approfondies",
      benefits: [
        "📊 Analyse approfondie patterns",
        "⚡ Optimisation performance",
        "📈 Métriques détaillées", 
        "🎯 Objectifs personnalisés"
      ],
      cta: "Optimiser 14 jours"
    }
  },
  clara: {
    introMessage: "Yes ! Maintenant, prépare-toi à découvrir ton plein potentiel cyclique 🚀",
    choiceMessage: "Prête pour la transformation complète ? Choisis ton intensité 💥",
    complete: {
      title: "Accompagnement Complet", 
      description: "14 jours de transformation guidée avec coaching énergétique",
      benefits: [
        "🚀 Puissance cyclique totale",
        "💥 Coaching énergétique",
        "⚡ Défis quotidiens",
        "🎯 Programme personnalisé"
      ],
      cta: "Transformer 14 jours"
    }
  },
  sylvie: {
    introMessage: "Merveilleux ! Laisse-moi te montrer comment Mélune peut t'accompagner avec douceur 🌸",
    choiceMessage: "Cette bienveillance te parle... Choisis ton accompagnement 💝",
    complete: {
      title: "Accompagnement Complet",
      description: "14 jours de découverte guidée avec guidance maternelle", 
      benefits: [
        "🌸 Guidance maternelle",
        "🕯️ Rituels personnalisés",
        "💝 Espace d'expression",
        "🌿 Programme adaptatif"
      ],
      cta: "Découvrir 14 jours"
    }
  },
  christine: {
    introMessage: "Parfait ! Découvre maintenant comment cette sagesse peut s'approfondir 🌟",
    choiceMessage: "Cette sagesse résonne en toi... Choisis ton chemin 💎",
    complete: {
      title: "Accompagnement Complet",
      description: "14 jours de sagesse guidée avec communauté bienveillante",
      benefits: [
        "🌟 Sagesse personnalisée", 
        "🍃 Transition accompagnée",
        "💎 Communauté bienveillante",
        "🌸 Programme adapté"
      ],
      cta: "Explorer 14 jours"
    }
  }
};

// 🤝 Version Essentielle
const VERSION_ESSENTIELLE = {
  title: "Version Essentielle",
  description: "L'essentiel pour ton cycle, gratuit pour toujours",
  benefits: [
    "💬 Conversations avec Mélune",
    "📅 Suivi cycle simplifié", 
    "📝 Journal personnel",
    "🌱 Fonctionnalités de base"
  ],
  cta: "Commencer gratuitement"
};

export default function EssaiScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const intelligence = useOnboardingIntelligence('900-essai');
  
  // États
  const persona = intelligence.currentPersona || 'emma';
  const personaContent = PERSONA_ARGUMENTS[persona];
  const [showValuePreview, setShowValuePreview] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const handleValuePreviewComplete = () => {
    setShowValuePreview(false);
    intelligence.trackAction('value_preview_completed', { persona });
  };

  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
  };

  const handleContinue = () => {
    if (selectedVersion === 'complete') {
      intelligence.trackAction('complete_version_selected', {
        persona,
        onboardingDuration: Date.now() - (intelligence.userProfile.startDate || Date.now())
      });
    } else {
      intelligence.trackAction('essential_version_selected', { persona });
    }
    
    router.push('/onboarding/950-demarrage');
  };

  const getPersonalizedFeedback = () => {
    if (!selectedVersion) return "Prends ton temps pour choisir...";
    
    if (selectedVersion === 'complete') {
      return intelligence.getPersonalizedMessage('complete_selected') || "Excellent choix pour une exploration complète ! ✨";
    } else {
      return intelligence.getPersonalizedMessage('essential_selected') || "Parfait pour commencer en douceur ! 🌱";
    }
  };

  // Récupérer les données pour la démo
  const getDemoData = () => {
    const cycleData = intelligence.cycle;
    return {
      persona: persona,
      phase: cycleData?.currentPhase || 'follicular',
      preferences: intelligence.userProfile.preferences || {}
    };
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
          {showValuePreview ? (
            // 🎯 DÉMONSTRATION DE VALEUR
            <>
              {/* Message d'introduction */}
              <View style={styles.messageSection}>
                <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
                  <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                    {personaContent.introMessage}
                  </BodyText>
                </AnimatedRevealMessage>
              </View>

              {/* Démonstration ValuePreview */}
              <View style={styles.demoSection}>
                <View style={styles.demoCard}>
                  <ValuePreview
                    persona={persona}
                    phase={getDemoData().phase}
                    preferences={getDemoData().preferences}
                    onComplete={handleValuePreviewComplete}
                  />
                </View>
              </View>
            </>
          ) : (
            // 🎯 CHOIX DE VERSION
            <>
              {/* Message de choix */}
              <View style={styles.messageSection}>
                <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
                  <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                    {personaContent.choiceMessage}
                  </BodyText>
                </AnimatedRevealMessage>
                
                {selectedVersion && (
                  <AnimatedRevealMessage 
                    key={selectedVersion} 
                    delay={ANIMATION_DURATIONS.normal}
                    style={styles.feedbackContainer}
                  >
                    <BodyText style={styles.feedbackText}>
                      {getPersonalizedFeedback()}
                    </BodyText>
                  </AnimatedRevealMessage>
                )}
              </View>

              {/* Options de version */}
              <View style={styles.versionsContainer}>
                {/* Version Complète */}
                <AnimatedCascadeCard
                  index={0}
                  delay={ANIMATION_DURATIONS.dramatic}
                  style={styles.versionCard}
                >
                  <TouchableOpacity
                    style={[
                      styles.versionOption,
                      selectedVersion === 'complete' && styles.selectedVersion
                    ]}
                    onPress={() => handleVersionSelect('complete')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.versionHeader}>
                      <BodyText style={styles.versionTitle}>
                        {personaContent.complete.title}
                      </BodyText>
                      <View style={styles.premiumBadge}>
                        <BodyText style={styles.premiumText}>PREMIUM</BodyText>
                      </View>
                    </View>
                    
                    <BodyText style={styles.versionDescription}>
                      {personaContent.complete.description}
                    </BodyText>
                    
                    <View style={styles.benefitsList}>
                      {personaContent.complete.benefits.map((benefit, index) => (
                        <BodyText key={index} style={styles.benefitItem}>
                          {benefit}
                        </BodyText>
                      ))}
                    </View>
                    
                    <View style={styles.ctaContainer}>
                      <BodyText style={styles.ctaText}>
                        {personaContent.complete.cta}
                      </BodyText>
                      <Feather name="arrow-right" size={20} color={theme.colors.primary} />
                    </View>
                  </TouchableOpacity>
                </AnimatedCascadeCard>

                {/* Version Essentielle */}
                <AnimatedCascadeCard
                  index={1}
                  delay={ANIMATION_DURATIONS.elegant}
                  style={styles.versionCard}
                >
                  <TouchableOpacity
                    style={[
                      styles.versionOption,
                      selectedVersion === 'essential' && styles.selectedVersion
                    ]}
                    onPress={() => handleVersionSelect('essential')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.versionHeader}>
                      <BodyText style={styles.versionTitle}>
                        {VERSION_ESSENTIELLE.title}
                      </BodyText>
                      <View style={styles.freeBadge}>
                        <BodyText style={styles.freeText}>GRATUIT</BodyText>
                      </View>
                    </View>
                    
                    <BodyText style={styles.versionDescription}>
                      {VERSION_ESSENTIELLE.description}
                    </BodyText>
                    
                    <View style={styles.benefitsList}>
                      {VERSION_ESSENTIELLE.benefits.map((benefit, index) => (
                        <BodyText key={index} style={styles.benefitItem}>
                          {benefit}
                        </BodyText>
                      ))}
                    </View>
                    
                    <View style={styles.ctaContainer}>
                      <BodyText style={styles.ctaText}>
                        {VERSION_ESSENTIELLE.cta}
                      </BodyText>
                      <Feather name="arrow-right" size={20} color={theme.colors.text} />
                    </View>
                  </TouchableOpacity>
                </AnimatedCascadeCard>
              </View>
            </>
          )}
        </ScrollView>

        {/* Section bouton */}
        <View style={styles.bottomSection}>
          <AnimatedOnboardingButton {...ANIMATION_CONFIGS.onboarding.welcome.button}>
            <StandardOnboardingButton
              title={showValuePreview ? "Voir la démo" : "Continuer"}
              onPress={showValuePreview ? handleValuePreviewComplete : handleContinue}
              variant="primary"
              disabled={!showValuePreview && !selectedVersion}
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
  },
  
  demoSection: {
    paddingHorizontal: theme.spacing.xl,
  },
  
  demoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  
  versionsContainer: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.m,
  },
  
  versionCard: {
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  versionOption: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  
  selectedVersion: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  versionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  
  premiumBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  
  premiumText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  freeBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  
  freeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  versionDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
    marginBottom: theme.spacing.m,
  },
  
  benefitsList: {
    gap: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  
  benefitItem: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  
  ctaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  
  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  
  feedbackContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.l,
    alignItems: 'center',
  },

  feedbackText: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});