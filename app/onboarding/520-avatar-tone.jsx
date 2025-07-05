//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/520-avatar-tone.jsx
// 🎯 Status: ✅ PATTERN ABSOLU - Conforme au guide
// 📝 Description: Choix du ton de voix de Melune
// 🔄 Cycle: Onboarding - Étape 6c/8
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import OnboardingNavigation from '../../src/features/onboarding/OnboardingNavigation';
import { 
  AnimatedRevealMessage,
  AnimatedOnboardingScreen,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS
} from '../../src/core/ui/animations';

const TONE_OPTIONS = [
  { 
    id: 'friendly', 
    name: 'Amicale', 
    icon: '🤗', 
    description: 'Chaleureuse et proche',
    example: '"Coucou ! Comment tu te sens aujourd\'hui ?"'
  },
  { 
    id: 'professional', 
    name: 'Professionnelle', 
    icon: '🌟', 
    description: 'Structurée et efficace',
    example: '"Bonjour ! Prête à analyser ton cycle ?"'
  },
  { 
    id: 'inspiring', 
    name: 'Inspirante', 
    icon: '🦋', 
    description: 'Motivante et énergique',
    example: '"Salut warrior ! Tu rayonnes aujourd\'hui !"'
  }
];

export default function AvatarToneScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { updateMelune, melune } = useUserStore();
  const intelligence = useOnboardingIntelligence('520-avatar-tone');
  
  // Suggestion personnalisée basée sur le persona
  const getPersonalizedDefault = () => {
    if (intelligence.personaConfidence >= 0.4) {
      const suggestions = {
        emma: 'friendly',
        laure: 'professional', 
        clara: 'inspiring',
        sylvie: 'friendly',
        christine: 'inspiring'
      };
      return suggestions[intelligence.currentPersona] || 'friendly';
    }
    return 'friendly';
  };

  const [selectedTone, setSelectedTone] = useState(melune?.tone || getPersonalizedDefault());

  // Animations obligatoires du pattern absolu
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardsAnim = useRef(TONE_OPTIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Entrée progressive de la page avec les presets
    const { pageEnter } = ANIMATION_CONFIGS.onboarding.welcome;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        ...pageEnter.fade
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...pageEnter.slide
      }),
    ]).start(() => {
      // Animation en cascade des cartes
      cardsAnim.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.elegant,
          delay: ANIMATION_DURATIONS.welcomeFirstMessage + (index * 200),
          ...ANIMATION_CONFIGS.onboarding.welcome.elementEnter,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  const handleToneSelect = (toneId) => {
    setSelectedTone(toneId);
    
    // Sauvegarder immédiatement le choix et finaliser la config Melune
    updateMelune({
      ...melune,
      tone: toneId,
      animated: true // Activer les animations maintenant que tout est configuré
    });
    
    // Track le choix final
    intelligence.trackAction('avatar_tone_selected', {
      tone: toneId,
      was_recommended: toneId === getPersonalizedDefault(),
      final_config: {
        style: melune?.avatarStyle,
        position: melune?.position,
        tone: toneId
      }
    });
    
    // Animation de sortie en cascade inversée (PATTERN ABSOLU)
    const exitAnimations = cardsAnim.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 0,
        duration: ANIMATION_DURATIONS.elegant,
        delay: ((TONE_OPTIONS.length - 1) - index) * 100,
        ...ANIMATION_CONFIGS.onboarding.welcome.elementExit,
        useNativeDriver: true,
      })
    );

    Animated.parallel(exitAnimations).start(() => {
      router.push('/onboarding/600-terminology');
    });
  };

  const getRecommendedTone = () => {
    const recommended = getPersonalizedDefault();
    if (intelligence.personaConfidence >= 0.4) {
      const persona = intelligence.currentPersona;
      const reasons = {
        emma: "Ton côté dynamique et ouvert correspond parfaitement à cette approche",
        laure: "Cette communication structurée s'accorde avec ton profil",
        clara: "Ce ton inspirant résonne avec ta sensibilité créative",
        sylvie: "Cette approche bienveillante reflète ta personnalité",
        christine: "Cette énergie motivante correspond à ta force intérieure"
      };
      return reasons[persona] || "Ce ton semble parfait pour toi";
    }
    return null;
  };

  const renderToneOption = (option, index) => {
    const isSelected = selectedTone === option.id;
    const isRecommended = option.id === getPersonalizedDefault() && intelligence.personaConfidence >= 0.4;
    
    return (
      <Animated.View
        key={option.id}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected,
          { 
            opacity: cardsAnim[index],
            transform: [{ 
              translateY: cardsAnim[index].interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => handleToneSelect(option.id)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Choisir le ton ${option.name}`}
          accessibilityHint={option.description}
        >
          {/* Option info */}
          <View style={styles.optionInfo}>
            <View style={styles.optionHeader}>
              <BodyText style={styles.optionIcon}>{option.icon}</BodyText>
              <BodyText style={styles.optionName}>{option.name}</BodyText>
              {isRecommended && (
                <View style={styles.recommendedBadge}>
                  <BodyText style={styles.recommendedText}>Recommandé</BodyText>
                </View>
              )}
            </View>
            <BodyText style={styles.optionDescription}>{option.description}</BodyText>
            
            {/* Exemple de message */}
            <View style={styles.exampleContainer}>
              <BodyText style={styles.exampleLabel}>Exemple :</BodyText>
              <BodyText style={styles.exampleText}>{option.example}</BodyText>
            </View>
            
            {isRecommended && (
              <BodyText style={styles.recommendationReason}>
                {getRecommendedTone()}
              </BodyText>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScreenContainer edges={['bottom']}>
      <OnboardingNavigation 
        currentStep={6}
        totalSteps={8}
        canGoBack={true}
        onBack={() => router.back()}
      />
      
      <AnimatedOnboardingScreen
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        style={styles.container}
      >
        <View style={styles.content}>
          <AnimatedRevealMessage
            message="Quel ton préfères-tu ?"
            subtitle="Melune s'adaptera à ta personnalité"
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
          />
          
          <View style={styles.optionsContainer}>
            {TONE_OPTIONS.map((option, index) => renderToneOption(option, index))}
          </View>
        </View>
      </AnimatedOnboardingScreen>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.m,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.m,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.l,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    minHeight: 120,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  optionButton: {
    padding: theme.spacing.m,
    minHeight: 44,
  },
  optionInfo: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.s,
  },
  optionName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.s,
  },
  exampleContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.s,
    borderRadius: theme.radius.m,
    marginBottom: theme.spacing.s,
  },
  exampleLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  exampleText: {
    fontSize: 14,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  recommendedBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.s,
  },
  recommendedText: {
    fontSize: 12,
    color: theme.colors.background,
    fontWeight: '600',
  },
  recommendationReason: {
    fontSize: 12,
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
}); 