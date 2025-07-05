//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/500-avatar-style.jsx
// 🎯 Status: ✅ PATTERN ABSOLU - Conforme au guide
// 📝 Description: Choix du style d'avatar de Melune
// 🔄 Cycle: Onboarding - Étape 6a/8
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
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

// Images
import meluneClassic from '../../src/assets/images/melune/melune-classic.png';
import meluneModern from '../../src/assets/images/melune/melune-modern.png';
import meluneMystique from '../../src/assets/images/melune/melune-mystique.png';

const STYLE_OPTIONS = [
  { 
    id: 'classic', 
    name: 'Classique', 
    icon: '🌸', 
    description: 'Style doux et bienveillant',
    image: meluneClassic
  },
  { 
    id: 'modern', 
    name: 'Moderne', 
    icon: '✨', 
    description: 'Design contemporain et épuré',
    image: meluneModern
  },
  { 
    id: 'mystique', 
    name: 'Mystique', 
    icon: '🌙', 
    description: 'Ambiance mystérieuse et profonde',
    image: meluneMystique
  }
];

export default function AvatarStyleScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { updateMelune, melune } = useUserStore();
  const intelligence = useOnboardingIntelligence('500-avatar-style');
  
  // Suggestion personnalisée basée sur le persona
  const getPersonalizedDefault = () => {
    if (intelligence.personaConfidence >= 0.4) {
      const suggestions = {
        emma: 'modern',
        laure: 'modern', 
        clara: 'mystique',
        sylvie: 'classic',
        christine: 'mystique'
      };
      return suggestions[intelligence.currentPersona] || 'classic';
    }
    return 'classic';
  };

  const [selectedStyle, setSelectedStyle] = useState(melune?.avatarStyle || getPersonalizedDefault());

  // Animations obligatoires du pattern absolu
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardsAnim = useRef(STYLE_OPTIONS.map(() => new Animated.Value(0))).current;

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

  const handleStyleSelect = (styleId) => {
    setSelectedStyle(styleId);
    
    // Sauvegarder immédiatement le choix
    updateMelune({
      ...melune,
      avatarStyle: styleId
    });
    
    // Track le choix
    intelligence.trackAction('avatar_style_selected', {
      style: styleId,
      was_recommended: styleId === getPersonalizedDefault()
    });
    
    // Animation de sortie en cascade inversée (PATTERN ABSOLU)
    const exitAnimations = cardsAnim.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 0,
        duration: ANIMATION_DURATIONS.elegant,
        delay: ((STYLE_OPTIONS.length - 1) - index) * 100,
        ...ANIMATION_CONFIGS.onboarding.welcome.elementExit,
        useNativeDriver: true,
      })
    );

    Animated.parallel(exitAnimations).start(() => {
      router.push('/onboarding/510-avatar-position');
    });
  };

  const getRecommendedStyle = () => {
    const recommended = getPersonalizedDefault();
    if (intelligence.personaConfidence >= 0.4) {
      const persona = intelligence.currentPersona;
      const reasons = {
        emma: "Ton profil dynamique s'accorde parfaitement avec ce style",
        laure: "Ce style correspond à ton approche structurée",
        clara: "Cette esthétique résonne avec ta sensibilité",
        sylvie: "Ce style reflète ta bienveillance naturelle",
        christine: "Cette ambiance correspond à ta profondeur"
      };
      return reasons[persona] || "Ce style semble fait pour toi";
    }
    return null;
  };

  const renderStyleOption = (option, index) => {
    const isSelected = selectedStyle === option.id;
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
          onPress={() => handleStyleSelect(option.id)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Choisir le style ${option.name}`}
          accessibilityHint={option.description}
        >
          {/* Avatar preview */}
          <View style={styles.avatarPreview}>
            <Image
              source={option.image}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>
          
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
            {isRecommended && (
              <BodyText style={styles.recommendationReason}>
                {getRecommendedStyle()}
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
            message="Choisis l'apparence de Melune"
            subtitle="Elle t'accompagnera tout au long de ton parcours"
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
          />
          
          <View style={styles.optionsContainer}>
            {STYLE_OPTIONS.map((option, index) => renderStyleOption(option, index))}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    minHeight: 44,
  },
  avatarPreview: {
    width: 60,
    height: 60,
    marginRight: theme.spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.m,
  },
  avatarImage: {
    width: 50,
    height: 50,
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
    fontSize: 20,
    marginRight: theme.spacing.s,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
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