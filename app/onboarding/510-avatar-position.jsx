//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/510-avatar-position.jsx
// 🎯 Status: ✅ PATTERN ABSOLU - Conforme au guide
// 📝 Description: Choix de la position d'avatar de Melune
// 🔄 Cycle: Onboarding - Étape 6b/8
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

const POSITION_OPTIONS = [
  { 
    id: 'bottom-right', 
    name: 'Bas droite', 
    icon: '↘️', 
    description: 'Accessible au pouce droit'
  },
  { 
    id: 'bottom-left', 
    name: 'Bas gauche', 
    icon: '↙️', 
    description: 'Accessible au pouce gauche'
  },
  { 
    id: 'top-right', 
    name: 'Haut droite', 
    icon: '↗️', 
    description: 'Discrète en haut à droite'
  },
  { 
    id: 'top-left', 
    name: 'Haut gauche', 
    icon: '↖️', 
    description: 'Discrète en haut à gauche'
  }
];

const AVATAR_IMAGES = {
  classic: meluneClassic,
  modern: meluneModern,
  mystique: meluneMystique,
};

export default function AvatarPositionScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { updateMelune, melune } = useUserStore();
  const intelligence = useOnboardingIntelligence('510-avatar-position');
  
  const [selectedPosition, setSelectedPosition] = useState(melune?.position || 'bottom-right');

  // Animations obligatoires du pattern absolu
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardsAnim = useRef(POSITION_OPTIONS.map(() => new Animated.Value(0))).current;

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
          delay: ANIMATION_DURATIONS.welcomeFirstMessage + (index * 150),
          ...ANIMATION_CONFIGS.onboarding.welcome.elementEnter,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  const handlePositionSelect = (positionId) => {
    setSelectedPosition(positionId);
    
    // Sauvegarder immédiatement le choix
    updateMelune({
      ...melune,
      position: positionId
    });
    
    // Track le choix
    intelligence.trackAction('avatar_position_selected', {
      position: positionId
    });
    
    // Animation de sortie en cascade inversée (PATTERN ABSOLU)
    const exitAnimations = cardsAnim.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 0,
        duration: ANIMATION_DURATIONS.elegant,
        delay: ((POSITION_OPTIONS.length - 1) - index) * 100,
        ...ANIMATION_CONFIGS.onboarding.welcome.elementExit,
        useNativeDriver: true,
      })
    );

    Animated.parallel(exitAnimations).start(() => {
      router.push('/onboarding/520-avatar-tone');
    });
  };

  const getFloatingPosition = (position) => {
    const baseSize = 40;
    const offset = 16;
    
    switch (position) {
      case 'bottom-right':
        return { bottom: offset, right: offset };
      case 'bottom-left':
        return { bottom: offset, left: offset };
      case 'top-right':
        return { top: offset + 20, right: offset }; // +20 pour éviter la status bar
      case 'top-left':
        return { top: offset + 20, left: offset };
      default:
        return { bottom: offset, right: offset };
    }
  };

  const renderPositionOption = (option, index) => {
    const isSelected = selectedPosition === option.id;
    
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
          onPress={() => handlePositionSelect(option.id)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Choisir la position ${option.name}`}
          accessibilityHint={option.description}
        >
          {/* Phone preview */}
          <View style={styles.phonePreview}>
            <View style={styles.phoneScreen}>
              {/* Header factice */}
              <View style={styles.fakeHeader} />
              
              {/* Contenu factice */}
              <View style={styles.fakeContent}>
                <View style={styles.fakeLine} />
                <View style={styles.fakeLine} />
                <View style={[styles.fakeLine, { width: '60%' }]} />
              </View>
              
              {/* TabBar factice */}
              <View style={styles.fakeTabBar} />
              
              {/* Melune flottante */}
              <Image
                source={AVATAR_IMAGES[melune?.avatarStyle || 'classic']}
                style={[
                  styles.floatingMelune,
                  getFloatingPosition(option.id),
                  isSelected && styles.floatingMeluneSelected
                ]}
                resizeMode="contain"
              />
            </View>
          </View>
          
          {/* Option info */}
          <View style={styles.optionInfo}>
            <View style={styles.optionHeader}>
              <BodyText style={styles.optionIcon}>{option.icon}</BodyText>
              <BodyText style={styles.optionName}>{option.name}</BodyText>
            </View>
            <BodyText style={styles.optionDescription}>{option.description}</BodyText>
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
            message="Où veux-tu voir Melune ?"
            subtitle="Elle restera à portée de main pour t'accompagner"
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
          />
          
          <View style={styles.optionsContainer}>
            {POSITION_OPTIONS.map((option, index) => renderPositionOption(option, index))}
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
    minHeight: 100,
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
  phonePreview: {
    width: 60,
    height: 100,
    marginRight: theme.spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneScreen: {
    width: 50,
    height: 90,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  fakeHeader: {
    height: 12,
    backgroundColor: theme.colors.surface,
    margin: 2,
    borderRadius: 2,
  },
  fakeContent: {
    flex: 1,
    padding: 4,
    gap: 2,
  },
  fakeLine: {
    height: 3,
    backgroundColor: theme.colors.border,
    borderRadius: 1,
  },
  fakeTabBar: {
    height: 12,
    backgroundColor: theme.colors.surface,
    margin: 2,
    borderRadius: 2,
  },
  floatingMelune: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  floatingMeluneSelected: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
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
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
}); 