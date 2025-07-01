//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/700-paywall.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Paywall intelligent avec personnalisation
// 🕒 Version: 1.0 - Intelligence Conversion
// 🧭 Used in: Onboarding flow - Étape 4/4 "Prête !"
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core/ui/Typography';
import { useTheme } from '../../src/hooks/useTheme';
import { Feather } from '@expo/vector-icons';

// 🎯 Arguments personnalisés par persona - VERSION ESSAI GRATUIT
const PERSONA_ARGUMENTS = {
  emma: {
    title: "Continue ton exploration gratuitement",
    subtitle: "14 jours pour révéler ton langage cyclique unique",
    benefits: [
      "✨ Accès complet à l'intelligence Melune",
      "💫 Chat illimité pour explorer tes ressentis",
      "🌙 Insights personnalisés selon ta phase"
    ],
    cta: "Commencer mes 14 jours gratuits",
    reassurance: "Aucun engagement, que de la découverte"
  },
  laure: {
    title: "Testez l'efficacité 14 jours gratuitement",
    subtitle: "Évaluez les résultats avant de vous engager",
    benefits: [
      "📊 Analyse complète de vos patterns",
      "⚡ Optimisation performance cyclique",
      "📈 Métriques de progression détaillées"
    ],
    cta: "Démarrer l'évaluation gratuite",
    reassurance: "Évaluez avant de vous engager"
  },
  clara: {
    title: "14 jours de transformation gratuite !",
    subtitle: "Zéro risque, 100% potentiel de découverte",
    benefits: [
      "🚀 Débloquer ta puissance cyclique",
      "💥 Coaching énergique personnalisé", 
      "⚡ Défis de transformation uniques"
    ],
    cta: "Libérer mon potentiel GRATUIT !",
    reassurance: "Zéro risque, 100% potentiel"
  },
  sylvie: {
    title: "Découvrir en douceur 14 jours",
    subtitle: "Prenez le temps qu'il vous faut, sans pression",
    benefits: [
      "🌸 Guidance maternelle bienveillante",
      "🕯️ Rituels adaptés à votre rythme",
      "💝 Espace de partage sécurisé"
    ],
    cta: "Commencer en douceur",
    reassurance: "Prenez le temps qu'il vous faut"
  },
  christine: {
    title: "Explorer sereinement 14 jours",
    subtitle: "Sans pression, à votre rythme de découverte",
    benefits: [
      "🌟 Sagesse adaptée à votre étape de vie",
      "🍃 Transition hormonale accompagnée",
      "💎 Communauté de femmes bienveillantes"
    ],
    cta: "Accéder à la sagesse gratuitement",
    reassurance: "Sans pression, à votre rythme"
  }
};

// 🤝 VERSION SOLIDAIRE
const SOLIDAIRE_OPTION = {
  title: "Version Solidaire",
  subtitle: "Essentiel gratuit pour toujours",
  benefits: [
    "💬 Chat basique avec Melune",
    "📅 Cycle et prédictions simples", 
    "📝 Journal personnel sécurisé"
  ],
  cta: "Choisir la Version Solidaire"
};

const PRICING = {
  monthly: { price: "9,99€", period: "/mois", savings: null },
  yearly: { price: "79,99€", period: "/an", savings: "Économisez 40€" },
  lifetime: { price: "149€", period: "à vie", savings: "Meilleure offre" }
};

export default function PaywallScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const intelligence = useOnboardingIntelligence('700-paywall');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  
  const [selectedPlan, setSelectedPlan] = useState('yearly');
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

    // Track vue paywall
    intelligence.trackAction('paywall_viewed', {
      persona,
      suggestedPlan: 'yearly'
    });
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    intelligence.trackAction('plan_selected', { plan, persona });
  };

  const handleTrialStart = () => {
    intelligence.trackAction('trial_started', {
      persona,
      onboardingDuration: Date.now() - (intelligence.userProfile.startDate || Date.now())
    });

    // TODO: Activer essai 14 jours
    console.log('🎯 Trial started for:', persona);
    
    router.push('/onboarding/800-cadeau');
  };

  const handleSolidaire = () => {
    intelligence.trackAction('solidaire_selected', { persona });
    
    // TODO: Activer version solidaire
    console.log('🤝 Solidaire selected for:', persona);
    
    router.push('/onboarding/800-cadeau');
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="700-paywall" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Header personnalisé */}
          <View style={styles.header}>
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
              
              {/* Badge 14 jours gratuits */}
              <View style={styles.freeBadge}>
                <BodyText style={styles.freeBadgeText}>
                  🎁 14 JOURS GRATUITS
                </BodyText>
              </View>
            </Animated.View>
          </View>

          {/* Benefits personnalisés */}
          <Animated.View 
            style={[
              styles.benefitsContainer,
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
            {personaContent.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <BodyText style={styles.benefitText}>{benefit}</BodyText>
              </View>
            ))}
            
            <View style={styles.reassuranceContainer}>
              <BodyText style={styles.reassuranceText}>
                {personaContent.reassurance}
              </BodyText>
            </View>
          </Animated.View>

          {/* CTA Principal - Essai gratuit */}
          <TouchableOpacity
            style={styles.trialButton}
            onPress={handleTrialStart}
            activeOpacity={0.7}
          >
            <BodyText style={styles.trialText}>
              {personaContent.cta}
            </BodyText>
          </TouchableOpacity>

          {/* Séparateur */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <BodyText style={styles.separatorText}>ou</BodyText>
            <View style={styles.separatorLine} />
          </View>

          {/* Option Solidaire */}
          <Animated.View 
            style={[
              styles.solidaireContainer,
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
            <BodyText style={styles.solidaireTitle}>{SOLIDAIRE_OPTION.title}</BodyText>
            <BodyText style={styles.solidaireSubtitle}>{SOLIDAIRE_OPTION.subtitle}</BodyText>
                
            <View style={styles.solidaireBenefits}>
              {SOLIDAIRE_OPTION.benefits.map((benefit, index) => (
                <BodyText key={index} style={styles.solidaireBenefit}>
                  {benefit}
                </BodyText>
              ))}
                </View>
                
          <TouchableOpacity
              style={styles.solidaireButton}
              onPress={handleSolidaire}
            activeOpacity={0.7}
          >
              <BodyText style={styles.solidaireButtonText}>
                {SOLIDAIRE_OPTION.cta}
            </BodyText>
          </TouchableOpacity>
          </Animated.View>

          {/* Footer transparent */}
          <View style={styles.footerContainer}>
            <BodyText style={styles.footerText}>
              Après 14 jours : 9,99€/mois ou Version Solidaire gratuite
            </BodyText>
            <BodyText style={styles.footerSubtext}>
              🔔 Rappel 3 jours avant la fin • 🔒 Annulation simple
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
  
  benefitsContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.xl,
  },
  
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  benefitText: {
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.m,
  },
  
  pricingCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  
  pricingCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  
  savingsBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small,
  },
  
  savingsText: { fontSize: 11, fontWeight: '600' },
  
  priceRow: { alignItems: 'center' },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  period: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  
  selectedIndicator: {
    position: 'absolute',
    bottom: theme.spacing.s,
    right: theme.spacing.s,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  subscribeButton: {
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
  
  subscribeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  
  skipButton: {
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  
  skipText: {
    color: theme.colors.textLight,
    fontSize: 14,
  },
  
  trustContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  
  trustText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },

  freeBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.large,
    marginTop: theme.spacing.l,
  },
  
  freeBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  reassuranceContainer: {
    marginTop: theme.spacing.m,
    alignItems: 'center',
  },
  
  reassuranceText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  trialButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: theme.spacing.l,
  },
  
  trialText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
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
  
  solidaireContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  
  solidaireTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  
  solidaireSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  
  solidaireBenefits: {
    marginBottom: theme.spacing.m,
  },
  
  solidaireBenefit: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  
  solidaireButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  
  solidaireButtonText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '600',
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