//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/900-essai.jsx
// 🎯 Status: 🔄 TRANSFORMÉ - ÉQUIPE 3 Mission Paywall Intelligent
// 📝 Description: Expérience de démonstration de valeur AVANT choix version
// 🔄 Cycle: Onboarding - Étape 8/8
// ─────────────────────────────────────────────────────────
//
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import OnboardingButton from '../../src/features/onboarding/shared/OnboardingButton';
import { 
  AnimatedRevealMessage,
  AnimatedCascadeCard,
  ANIMATION_DURATIONS,
  ANIMATION_PRESETS
} from '../../src/core/ui/animations';
import ValuePreview from '../../src/features/onboarding/ValuePreview';
import { Feather } from '@expo/vector-icons';

// 🎯 Options d'accompagnement personnalisées par persona
const PERSONA_ARGUMENTS = {
  emma: {
    title: "Choisis ton accompagnement",
    subtitle: "Deux façons de révéler ton langage cyclique unique",
    complete: {
      title: "Accompagnement Complet",
      description: "14 jours d'exploration guidée",
      benefits: [
        "✨ Intelligence Melune complète",
        "💫 Chat enrichi et personnalisé",
        "🌙 Insights selon ta phase",
        "📱 Accès à toutes les fonctionnalités"
      ],
      cta: "Explorer pendant 14 jours"
    }
  },
  laure: {
    title: "Choisis ton accompagnement",
    subtitle: "Deux approches pour optimiser ton cycle",
    complete: {
      title: "Accompagnement Complet",
      description: "14 jours d'optimisation guidée",
      benefits: [
        "📊 Analyse approfondie patterns",
        "⚡ Optimisation performance",
        "📈 Métriques détaillées",
        "🎯 Objectifs personnalisés"
      ],
      cta: "Optimiser pendant 14 jours"
    }
  },
  clara: {
    title: "Choisis ton accompagnement",
    subtitle: "Deux chemins vers ta transformation",
    complete: {
      title: "Accompagnement Complet",
      description: "14 jours de transformation guidée",
      benefits: [
        "🚀 Puissance cyclique totale",
        "💥 Coaching énergétique",
        "⚡ Défis quotidiens",
        "🎯 Programme personnalisé"
      ],
      cta: "Transformer pendant 14 jours"
    }
  },
  sylvie: {
    title: "Choisis ton accompagnement",
    subtitle: "Deux rythmes pour ta découverte",
    complete: {
      title: "Accompagnement Complet",
      description: "14 jours de découverte guidée",
      benefits: [
        "🌸 Guidance maternelle",
        "🕯️ Rituels personnalisés",
        "💝 Espace d'expression",
        "🌿 Programme adaptatif"
      ],
      cta: "Découvrir pendant 14 jours"
    }
  },
  christine: {
    title: "Choisis ton accompagnement",
    subtitle: "Deux voies vers la sagesse cyclique",
    complete: {
      title: "Accompagnement Complet",
      description: "14 jours de sagesse guidée",
      benefits: [
        "🌟 Sagesse personnalisée",
        "🍃 Transition accompagnée",
        "💎 Communauté bienveillante",
        "🌸 Programme adapté"
      ],
      cta: "Explorer pendant 14 jours"
    }
  }
};

// 🤝 Version Essentielle (anciennement Solidaire)
const VERSION_ESSENTIELLE = {
  title: "Version Essentielle",
  description: "L'essentiel pour ton cycle, gratuit pour toujours",
  benefits: [
    "💬 Conversations avec Melune",
    "📅 Suivi cycle simplifié",
    "📝 Journal personnel",
    "🌱 Fonctionnalités de base"
  ],
  cta: "Commencer gratuitement"
};

export default function ChoixVersionScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const intelligence = useOnboardingIntelligence('900-essai');
  
  // États
  const persona = intelligence.currentPersona || 'emma';
  const personaContent = PERSONA_ARGUMENTS[persona];
  const [showValuePreview, setShowValuePreview] = useState(true);
  const [valuePreviewComplete, setValuePreviewComplete] = useState(false);

  const handleValuePreviewComplete = () => {
    setValuePreviewComplete(true);
    setShowValuePreview(false);
    intelligence.trackAction('value_preview_completed', { persona });
  };

  const handleCompleteChoice = () => {
    intelligence.trackAction('complete_version_selected', {
      persona,
      onboardingDuration: Date.now() - (intelligence.userProfile.startDate || Date.now())
    });
    router.push('/onboarding/950-demarrage');
  };

  const handleEssentielleChoice = () => {
    intelligence.trackAction('essential_version_selected', { persona });
    router.push('/onboarding/950-demarrage');
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        
        {showValuePreview ? (
          // 🎯 NOUVELLE EXPÉRIENCE : Démonstration de valeur
          <View style={styles.valuePreviewContainer}>
            <AnimatedRevealMessage 
              delay={1000}
              style={styles.messageContainer}
            >
              <BodyText style={[styles.valuePreviewTitle, { fontFamily: 'Quintessential' }]}>
                Découvre la magie de Mélune ✨
              </BodyText>
            </AnimatedRevealMessage>

            <AnimatedCascadeCard
              delay={2000}
              style={styles.valuePreviewCard}
            >
              <ValuePreview
                demoData={getDemoData()}
                onComplete={handleValuePreviewComplete}
                persona={persona}
                theme={theme}
              />
            </AnimatedCascadeCard>
          </View>
        ) : (
          // 🎯 CHOIX DE VERSION après démonstration
          <View style={styles.choiceContainer}>
            {/* Message personnalisé */}
            <View style={styles.messageSection}>
              <AnimatedRevealMessage 
                delay={800}
                style={styles.messageContainer}
              >
                <BodyText style={[styles.title, { fontFamily: 'Quintessential' }]}>
                  {personaContent.title}
                </BodyText>
              </AnimatedRevealMessage>
              
              <AnimatedRevealMessage 
                delay={1400}
                style={styles.messageContainer}
              >
                <BodyText style={[styles.subtitle, { fontFamily: 'Quintessential' }]}>
                  {personaContent.subtitle}
                </BodyText>
              </AnimatedRevealMessage>
            </View>

            {/* Options de version */}
            <ScrollView 
              style={styles.mainSection}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Version Complète */}
              <AnimatedCascadeCard
                delay={2200}
                style={styles.versionCard}
              >
                <TouchableOpacity
                  style={styles.versionOption}
                  onPress={handleCompleteChoice}
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
                delay={2800}
                style={styles.versionCard}
              >
                <TouchableOpacity
                  style={styles.versionOption}
                  onPress={handleEssentielleChoice}
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
            </ScrollView>
          </View>
        )}
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
  
  // Value Preview Section
  valuePreviewContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  
  valuePreviewTitle: {
    fontSize: 24,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 32,
    maxWidth: 300,
  },
  
  valuePreviewCard: {
    flex: 1,
    marginTop: theme.spacing.xl,
    marginHorizontal: theme.spacing.xl,
  },
  
  // Choice Section
  choiceContainer: {
    flex: 1,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 32,
    marginBottom: theme.spacing.m,
  },
  
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: theme.colors.textLight,
    lineHeight: 24,
    maxWidth: 300,
  },
  
  mainSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  
  scrollContent: {
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.l,
  },
  
  versionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.l,
    borderWidth: 2,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  versionOption: {
    flex: 1,
  },
  
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  versionTitle: {
    fontSize: 20,
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
    fontSize: 16,
    color: theme.colors.textLight,
    lineHeight: 22,
    marginBottom: theme.spacing.m,
  },
  
  benefitsList: {
    gap: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  
  benefitItem: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});