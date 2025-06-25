import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading1, Heading2, BodyText } from '../../components/Typography';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { theme } from '../../config/theme';
import { Ionicons } from '@expo/vector-icons';

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateSubscriptionInfo, userInfo } = useOnboardingStore();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
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

    // Animation de pulsation pour le CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleStartTrial = () => {
    // Marquer que l'utilisatrice a initié l'essai
    updateSubscriptionInfo({
      trialStarted: true,
      trialStartDate: new Date().toISOString(),
      planSelected: 'monthly'
    });
    
    // Navigation vers l'écran cadeau pour recevoir l'insight personnalisé
    router.push('/onboarding/800-cadeau');
  };

  const handleRestore = () => {
    // Logique de restauration d'achat à implémenter
    console.log('Restauration d\'achat...');
  };

  const handleBack = () => {
    router.back();
  };

  const subscriptionFeatures = [
    `Ton insight personnalisé avec ton prénom${userInfo.prenom ? ` (${userInfo.prenom})` : ''}`,
    'Conseils quotidiens adaptés à ta phase',
    'Conversation avec Melune sans restriction',
    'Tous les secrets de ton cycle révélés'
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Heading2 style={styles.headerTitle}>ABONNEMENT</Heading2>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          
          {/* Message personnalisé avec prénom */}
          {userInfo.prenom && (
            <View style={styles.personalMessage}>
              <BodyText style={styles.personalText}>
                {userInfo.prenom}, ton insight personnalisé t'attend... ✨
              </BodyText>
            </View>
          )}

          {/* Trial Banner */}
          <View style={styles.trialBanner}>
            <BodyText style={styles.trialText}>
              7 jours d'essai gratuit
            </BodyText>
          </View>

          {/* Subscription Card */}
          <View style={styles.subscriptionCard}>
            <View style={styles.cardHeader}>
              <Heading2 style={styles.planTitle}>Abonnement Mensuel</Heading2>
              <View style={styles.priceContainer}>
                <Heading1 style={styles.price}>9,99 €</Heading1>
                <BodyText style={styles.priceUnit}>/mois</BodyText>
              </View>
            </View>

            {/* Features List */}
            <View style={styles.featuresList}>
              {subscriptionFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.bulletPoint} />
                  <BodyText style={styles.featureText}>{feature}</BodyText>
                </View>
              ))}
            </View>
          </View>

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View 
        style={[
          styles.bottomActions,
          { 
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.trialButton} 
          onPress={handleStartTrial}
          activeOpacity={0.9}
        >
          <BodyText style={styles.trialButtonText}>
            {userInfo.prenom ? `Déverrouiller mon insight, ${userInfo.prenom} ! 🎁` : 'Commencer l\'essai gratuit'}
          </BodyText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.restoreButton} 
          onPress={handleRestore}
          activeOpacity={0.7}
        >
          <BodyText style={styles.restoreText}>
            Restaurer un achat
          </BodyText>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border || theme.colors.textLight + '20',
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.headingBold,
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 32, // Même largeur que le bouton back pour centrer le titre
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.l,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
  },
  personalMessage: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  personalText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  trialBanner: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  trialText: {
    fontSize: 16,
    color: theme.colors.textLight,
    fontFamily: theme.fonts.body,
  },
  subscriptionCard: {
    backgroundColor: theme.colors.surface || theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  planTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.headingBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontFamily: theme.fonts.headingBold,
    color: theme.colors.primary,
  },
  priceUnit: {
    fontSize: 18,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  featuresList: {
    gap: theme.spacing.m,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: theme.spacing.xs,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    marginRight: theme.spacing.m,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginTop: theme.spacing.l,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textLight + '40',
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 24,
    borderRadius: 4,
  },
  bottomActions: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border || theme.colors.textLight + '20',
  },
  trialButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  trialButtonText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontSize: 18,
    fontFamily: theme.fonts.bodyBold,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
  },
  restoreText: {
    color: theme.colors.textLight,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
}); 