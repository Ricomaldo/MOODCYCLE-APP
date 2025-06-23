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
import { theme } from '../../src/config/theme';
import { Feather } from '@expo/vector-icons';

// 🎯 Arguments personnalisés par persona
const PERSONA_ARGUMENTS = {
  emma: {
    title: "Explore ton cycle comme jamais",
    subtitle: "Découvre ta vraie nature cyclique",
    benefits: [
      "Chat illimité avec Melune pour explorer",
      "Insights quotidiens personnalisés",
      "Journal intime sécurisé"
    ],
    cta: "Commencer l'exploration ✨"
  },
  laure: {
    title: "Optimise ta performance cyclique",
    subtitle: "Maximise ton potentiel à chaque phase",
    benefits: [
      "Analyse prédictive de tes phases",
      "Planning optimisé selon ton énergie",
      "Métriques de progression"
    ],
    cta: "Optimiser maintenant"
  },
  clara: {
    title: "Libère ta puissance cyclique !",
    subtitle: "Transforme ton cycle en superpouvoir",
    benefits: [
      "Coaching énergique quotidien",
      "Défis de transformation",
      "Communauté de femmes puissantes"
    ],
    cta: "Libérer ma puissance 🚀"
  },
  sylvie: {
    title: "Honore ta sagesse féminine",
    subtitle: "Un accompagnement doux et profond",
    benefits: [
      "Guidance maternelle bienveillante",
      "Rituels adaptés à chaque phase",
      "Espace de partage sécurisé"
    ],
    cta: "Commencer en douceur"
  },
  christine: {
    title: "Accompagnez vos transitions",
    subtitle: "Sagesse et sérénité à chaque étape",
    benefits: [
      "Conseils adaptés à la maturité",
      "Gestion des transitions hormonales",
      "Communauté de femmes sages"
    ],
    cta: "Accéder à la sagesse"
  }
};

const PRICING = {
  monthly: { price: "9,99€", period: "/mois", savings: null },
  yearly: { price: "79,99€", period: "/an", savings: "Économisez 40€" },
  lifetime: { price: "149€", period: "à vie", savings: "Meilleure offre" }
};

export default function PaywallScreen() {
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

  const handleSubscribe = () => {
    intelligence.trackAction('subscription_initiated', {
      plan: selectedPlan,
      persona,
      onboardingDuration: Date.now() - (intelligence.userProfile.startDate || Date.now())
    });

    // TODO: Intégration paiement réel
    console.log('🎯 Subscription:', selectedPlan);
    
    // Pour le moment, continuer vers cadeau
    router.push('/onboarding/800-cadeau');
  };

  const handleSkip = () => {
    intelligence.trackAction('paywall_skipped', { persona });
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
                <Feather name="check-circle" size={20} color={theme.colors.primary} />
                <BodyText style={styles.benefitText}>{benefit}</BodyText>
              </View>
            ))}
          </Animated.View>

          {/* Pricing Cards */}
          <Animated.View 
            style={[
              styles.pricingContainer,
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
            {Object.entries(PRICING).map(([key, plan]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.pricingCard,
                  selectedPlan === key && styles.pricingCardSelected
                ]}
                onPress={() => handleSelectPlan(key)}
                activeOpacity={0.8}
              >
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <BodyText style={styles.savingsText}>{plan.savings}</BodyText>
                  </View>
                )}
                
                <View style={styles.priceRow}>
                  <BodyText style={styles.price}>{plan.price}</BodyText>
                  <BodyText style={styles.period}>{plan.period}</BodyText>
                </View>
                
                {selectedPlan === key && (
                  <View style={styles.selectedIndicator}>
                    <Feather name="check" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* CTA personnalisé */}
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            activeOpacity={0.7}
          >
            <BodyText style={styles.subscribeText}>
              {personaContent.cta}
            </BodyText>
          </TouchableOpacity>

          {/* Skip option */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <BodyText style={styles.skipText}>
              Peut-être plus tard
            </BodyText>
          </TouchableOpacity>

          {/* Trust badges */}
          <View style={styles.trustContainer}>
            <BodyText style={styles.trustText}>
              🔒 Paiement sécurisé • Annulation facile
            </BodyText>
          </View>
          
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
});