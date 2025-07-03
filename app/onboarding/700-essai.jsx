//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/700-essai.jsx
// 🧩 Type: Écran Onboarding
// 📚 Description: Choix du type d'accompagnement
// 🕒 Version: 2.0 - 2025-01-21
// 🧭 Used in: Parcours onboarding, choix version
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
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
  const intelligence = useOnboardingIntelligence('700-essai');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  
  const persona = intelligence.currentPersona || 'emma';
  const personaContent = PERSONA_ARGUMENTS[persona];

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
      Animated.delay(300),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 400,
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
    router.push('/onboarding/800-demarrage');
  };

  const handleEssentielleChoice = () => {
    intelligence.trackAction('essential_version_selected', { persona });
    router.push('/onboarding/800-demarrage');
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="700-essai" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.titleContainer,
                {
                  transform: [{ translateY: slideAnim }],
                  opacity: slideAnim.interpolate({
                    inputRange: [-20, 0],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            >
              <BodyText style={styles.title}>{personaContent.title}</BodyText>
              <BodyText style={styles.subtitle}>{personaContent.subtitle}</BodyText>
            </Animated.View>
          </View>

          {/* Version Complète */}
          <Animated.View 
            style={[
              styles.versionCard,
              styles.completeCard,
              {
                opacity: cardsAnim,
                transform: [{
                  translateY: cardsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }
            ]}
          >
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
              activeOpacity={0.7}
            >
              <BodyText style={styles.completeButtonText}>
                {personaContent.complete.cta}
              </BodyText>
            </TouchableOpacity>
          </Animated.View>

          {/* Séparateur */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <BodyText style={styles.separatorText}>ou</BodyText>
            <View style={styles.separatorLine} />
          </View>

          {/* Version Essentielle */}
          <Animated.View 
            style={[
              styles.versionCard,
              styles.essentialCard,
              {
                opacity: cardsAnim,
                transform: [{
                  translateY: cardsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  })
                }]
              }
            ]}
          >
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
              activeOpacity={0.7}
            >
              <BodyText style={styles.essentialButtonText}>
                {VERSION_ESSENTIELLE.cta}
              </BodyText>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Note de transparence */}
          <View style={styles.footerContainer}>
            <BodyText style={styles.footerText}>
              Version Complète après 14 jours : 9,99€/mois
            </BodyText>
            <BodyText style={styles.footerSubtext}>
              🔔 Rappel 3 jours avant • 🔒 Annulation simple
            </BodyText>
          </View>
          
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: theme.spacing.l },
  
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  
  titleContainer: { alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  versionCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    marginBottom: theme.spacing.l,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  completeCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '04',
  },
  
  essentialCard: {
    borderColor: theme.colors.border,
  },
  
  cardHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  
  cardDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.large,
  },
  
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  
  benefitsContainer: {
    marginBottom: theme.spacing.l,
  },
  
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  benefitText: {
    fontSize: 15,
    color: theme.colors.text,
    flex: 1,
  },
  
  completeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  
  essentialButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
  },
  
  essentialButtonText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.l,
  },
  
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  
  separatorText: {
    marginHorizontal: theme.spacing.m,
    color: theme.colors.textLight,
    fontSize: 14,
  },
  
  footerContainer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  
  footerText: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  footerSubtext: {
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});