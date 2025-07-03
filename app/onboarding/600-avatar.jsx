//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/600-avatar.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Configuration initiale de Melune
// 🕒 Version: 3.0 - Configuration simple et modifiable
// 🧭 Used in: Onboarding flow - Étape 3/4 "Ton style"
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import meluneClassic from '../../src/assets/images/melune/melune-classic.png';
import meluneModern from '../../src/assets/images/melune/melune-modern.png';
import meluneMystique from '../../src/assets/images/melune/melune-mystique.png';

// Options de configuration initiale
const INITIAL_OPTIONS = [
  {
    id: 'style',
    title: 'Style d\'avatar',
    description: 'Choisis l\'apparence de Melune',
    options: [
      { id: 'classic', name: 'Classique', icon: '🌸', description: 'Style doux et bienveillant' },
      { id: 'modern', name: 'Moderne', icon: '✨', description: 'Design contemporain et épuré' },
      { id: 'mystique', name: 'Mystique', icon: '🌙', description: 'Ambiance mystérieuse et profonde' }
    ]
  },
  {
    id: 'tone',
    title: 'Ton de voix',
    description: 'Définis la personnalité de Melune',
    options: [
      { id: 'friendly', name: 'Amicale', icon: '😊', description: 'Chaleureuse et proche' },
      { id: 'professional', name: 'Professionnelle', icon: '📊', description: 'Structurée et efficace' },
      { id: 'inspiring', name: 'Inspirante', icon: '🚀', description: 'Motivante et énergique' }
    ]
  },
  {
    id: 'position',
    title: 'Position',
    description: 'Où Melune apparaîtra sur ton écran',
    options: [
      { id: 'bottom-right', name: 'Bas droite', icon: '↘️', description: 'Accessible au pouce droit' },
      { id: 'bottom-left', name: 'Bas gauche', icon: '↙️', description: 'Accessible au pouce gauche' },
      { id: 'top-right', name: 'Haut droite', icon: '↗️', description: 'Discrète en haut à droite' },
      { id: 'top-left', name: 'Haut gauche', icon: '↖️', description: 'Discrète en haut à gauche' }
    ]
  }
];

const AVATAR_IMAGES = {
  classic: meluneClassic,
  modern: meluneModern,
  mystique: meluneMystique,
};

export default function AvatarScreen() {
  const intelligence = useOnboardingIntelligence('600-avatar');
  const { theme } = useTheme();
  const { updateMelune } = useUserStore();
  const styles = getStyles(theme);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // État des sélections
  const [selections, setSelections] = useState({
    style: 'classic',
    tone: 'friendly',
    position: 'bottom-right'
  });

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(300),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleOptionSelect = (category, optionId) => {
    setSelections(prev => ({
      ...prev,
      [category]: optionId
    }));
  };

  const handleContinue = () => {
    // Sauvegarder les préférences initiales
    updateMelune({
      avatarStyle: selections.style,
      tone: selections.tone,
      position: selections.position,
      animated: true
    });
    
    // Track les choix
    intelligence.trackAction('initial_melune_config', {
      style: selections.style,
      tone: selections.tone,
      position: selections.position
    });
    
    // Navigation vers la page de terminologie
    setTimeout(() => {
      router.push('/onboarding/650-terminology');
    }, 300);
  };

  const renderPositionPreview = (position) => {
    const isSelected = selections.position === position;
    
    return (
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
            source={AVATAR_IMAGES[selections.style]}
            style={[
              styles.floatingMelune,
              getFloatingPosition(position),
              isSelected && styles.floatingMeluneSelected
            ]}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  };

  const getFloatingPosition = (position) => {
    const offset = 6;
    const tabBarHeight = 16;
    
    switch (position) {
      case 'bottom-left':
        return { bottom: tabBarHeight + offset, left: offset };
      case 'top-right':
        return { top: 20 + offset, right: offset };
      case 'top-left':
        return { top: 20 + offset, left: offset };
      case 'bottom-right':
      default:
        return { bottom: tabBarHeight + offset, right: offset };
    }
  };

  const renderOptionCard = (category, option) => {
    const isSelected = selections[category] === option.id;
    const isStyleCategory = category === 'style';
    const isPositionCategory = category === 'position';
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected,
          isPositionCategory && styles.positionCard
        ]}
        onPress={() => handleOptionSelect(category, option.id)}
        activeOpacity={0.7}
      >
        <View style={styles.optionHeader}>
          {isStyleCategory ? (
            <Image
              source={AVATAR_IMAGES[option.id]}
              style={styles.avatarPreview}
              resizeMode="contain"
            />
          ) : isPositionCategory ? (
            renderPositionPreview(option.id)
          ) : (
            <BodyText style={styles.optionIcon}>{option.icon}</BodyText>
          )}
          <View style={styles.optionInfo}>
            <BodyText style={[
              styles.optionName,
              isSelected && styles.optionNameSelected
            ]}>
              {option.name}
            </BodyText>
            <BodyText style={[
              styles.optionDescription,
              isSelected && styles.optionDescriptionSelected
            ]}>
              {option.description}
            </BodyText>
          </View>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <BodyText style={styles.checkmark}>✓</BodyText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = (category) => {
    return (
      <View key={category.id} style={styles.categoryContainer}>
        <BodyText style={styles.categoryTitle}>{category.title}</BodyText>
        <BodyText style={styles.categoryDescription}>{category.description}</BodyText>
        
        <View style={styles.optionsGrid}>
          {category.options.map(option => renderOptionCard(category.id, option))}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="600-avatar" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Image
                source={AVATAR_IMAGES[selections.style]}
                style={styles.avatarMain}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Animated.View
              style={[
                styles.messageContainer,
                {
                  transform: [{ translateY: slideAnim }],
                  opacity: slideAnim.interpolate({
                    inputRange: [-20, 0],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            >
              <BodyText style={styles.title}>
                Personnalise Melune
              </BodyText>
              <BodyText style={styles.subtitle}>
                {intelligence.meluneMessage}
              </BodyText>
            </Animated.View>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {INITIAL_OPTIONS.map(renderCategory)}
          </View>
          
          {/* Continue Button */}
          <Animated.View style={styles.continueContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.7}
            >
              <BodyText style={styles.continueText}>
                Continuer
              </BodyText>
            </TouchableOpacity>
          </Animated.View>
          
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  
  messageContainer: {
    marginTop: theme.spacing.l,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.m,
  },
  
  optionsContainer: {
    flex: 1,
    gap: theme.spacing.xl,
  },
  
  categoryContainer: {
    gap: theme.spacing.m,
  },
  
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  
  categoryDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  
  optionsGrid: {
    gap: theme.spacing.s,
  },
  
  optionCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  optionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.m,
  },
  
  optionInfo: {
    flex: 1,
  },
  
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  
  optionNameSelected: {
    color: theme.colors.primary,
  },
  
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  
  optionDescriptionSelected: {
    color: theme.colors.primary + 'CC',
  },
  
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  continueContainer: {
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  continueText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontSize: 16,
    fontWeight: '600',
  },
  
  avatarPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginRight: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  avatarMain: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.m,
    alignSelf: 'center',
  },
  
  phonePreview: {
    marginRight: theme.spacing.m,
    alignItems: 'center',
  },
  
  phoneScreen: {
    width: 50,
    height: 90,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  
  fakeHeader: {
    height: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  fakeContent: {
    flex: 1,
    padding: 4,
    gap: 2,
  },
  
  fakeLine: {
    height: 2,
    backgroundColor: theme.colors.border,
    borderRadius: 1,
    width: '100%',
  },
  
  fakeTabBar: {
    height: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  floatingMelune: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  
  floatingMeluneSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  
  positionCard: {
    minHeight: 80,
  },
});