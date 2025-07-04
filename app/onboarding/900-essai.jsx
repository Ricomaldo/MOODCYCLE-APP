//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/900-essai.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Choix de la version d'accompagnement
// 🔄 Cycle: Onboarding - Étape 8/8
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import OnboardingScreen from '../../src/core/layout/OnboardingScreen';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { AnimatedRevealMessage } from '../../src/core/ui/animations';
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
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const intelligence = useOnboardingIntelligence('900-essai');
  
  // États
  const persona = intelligence.currentPersona || 'emma';
  const personaContent = PERSONA_ARGUMENTS[persona];
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Séquence d'animation
    Animated.sequence([
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

    intelligence.trackAction('version_choice_viewed', { persona });
  }, []);

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

  return (
    <OnboardingScreen currentScreen="900-essai">
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Message de Mélune */}
        <View style={styles.messageSection}>
          <Animated.View
            style={[
              styles.messageContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <AnimatedRevealMessage delay={800}>
              <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                {personaContent.subtitle}
              </BodyText>
            </AnimatedRevealMessage>
          </Animated.View>
        </View>

        {/* Section principale */}
        <ScrollView 
          style={styles.mainSection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Version Complète */}
          <View style={[styles.versionCard, styles.completeCard]}>
            <View style={styles.cardHeader}>
              <BodyText style={styles.cardTitle}>
                {personaContent.complete.title}
              </BodyText>
              <BodyText style={styles.cardDescription}>
                {personaContent.complete.description}
              </BodyText>
              <View style={styles.badge}>
                <BodyText style={styles.badgeText}>
                  14 JOURS GRATUITS
                </BodyText>
              </View>
            </View>
            
            <View style={styles.benefitsContainer}>
              {personaContent.complete.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <BodyText style={styles.benefitText}>{benefit}</BodyText>
                </View>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteChoice}
              activeOpacity={0.8}
            >
              <BodyText style={styles.completeButtonText}>
                {personaContent.complete.cta}
              </BodyText>
            </TouchableOpacity>
          </View>

          {/* Séparateur */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <BodyText style={styles.separatorText}>ou</BodyText>
            <View style={styles.separatorLine} />
          </View>

          {/* Version Essentielle */}
          <View style={[styles.versionCard, styles.essentialCard]}>
            <View style={styles.cardHeader}>
              <BodyText style={styles.cardTitle}>
                {VERSION_ESSENTIELLE.title}
              </BodyText>
              <BodyText style={styles.cardDescription}>
                {VERSION_ESSENTIELLE.description}
              </BodyText>
            </View>
            
            <View style={styles.benefitsContainer}>
              {VERSION_ESSENTIELLE.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <BodyText style={styles.benefitText}>{benefit}</BodyText>
                </View>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.essentialButton}
              onPress={handleEssentielleChoice}
              activeOpacity={0.8}
            >
              <BodyText style={styles.essentialButtonText}>
                {VERSION_ESSENTIELLE.cta}
              </BodyText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </OnboardingScreen>
  );
}

const getStyles = (theme) => StyleSheet.create({
  content: {
    flex: 1,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  
  message: {
    fontSize: 20,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 28,
    maxWidth: 300,
  },
  
  mainSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  
  scrollContent: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  
  versionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.l,
  },
  
  completeCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  
  essentialCard: {
    backgroundColor: theme.colors.surface,
  },
  
  cardHeader: {
    marginBottom: theme.spacing.l,
  },
  
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  cardDescription: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.m,
  },
  
  badge: {
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.small,
    alignSelf: 'flex-start',
  },
  
  badgeText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  },
  
  benefitsContainer: {
    marginBottom: theme.spacing.xl,
  },
  
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  benefitText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  
  separatorText: {
    marginHorizontal: theme.spacing.l,
    color: theme.colors.textLight,
    fontSize: 14,
  },
  
  completeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.l,
    alignItems: 'center',
  },
  
  completeButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  essentialButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.l,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  
  essentialButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});