//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/500-avatar.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Personnalisation de l'apparence de Melune
// 🔄 Cycle: Onboarding - Étape 6/8
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import OnboardingScreen from '../../src/core/layout/OnboardingScreen';
import { BodyText } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/stores/useUserStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { AnimatedRevealMessage } from '../../src/core/ui/animations';

// Images
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
      { id: 'friendly', name: 'Amicale', icon: '🤗', description: 'Chaleureuse et proche' },
      { id: 'professional', name: 'Professionnelle', icon: '🌟', description: 'Structurée et efficace' },
      { id: 'inspiring', name: 'Inspirante', icon: '🦋', description: 'Motivante et énergique' }
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
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { updateMelune } = useUserStore();
  const intelligence = useOnboardingIntelligence('500-avatar');
  
  // États avec suggestions personnalisées
  const getPersonalizedDefaults = () => {
    if (intelligence.personaConfidence >= 0.4) {
      const suggestions = {
        emma: { style: 'modern', tone: 'friendly' },
        laure: { style: 'modern', tone: 'professional' },
        clara: { style: 'mystique', tone: 'inspiring' },
        sylvie: { style: 'classic', tone: 'friendly' },
        christine: { style: 'mystique', tone: 'inspiring' }
      };
      return suggestions[intelligence.currentPersona] || { style: 'classic', tone: 'friendly' };
    }
    return { style: 'classic', tone: 'friendly' };
  };

  const [selections, setSelections] = useState({
    ...getPersonalizedDefaults(),
    position: 'bottom-right'
  });
  
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
      router.push('/onboarding/600-terminology');
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
    <OnboardingScreen currentScreen="500-avatar">
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
                {intelligence.personaConfidence >= 0.4 
                  ? intelligence.getPersonalizedMessage('message')
                  : "Choisis comment tu souhaites me voir apparaître dans l'application"}
              </BodyText>
            </AnimatedRevealMessage>
            
            {intelligence.personaConfidence >= 0.4 && (
              <AnimatedRevealMessage delay={1200}>
                <BodyText style={styles.hintText}>
                  {intelligence.getPersonalizedMessage('style_hint')}
                </BodyText>
              </AnimatedRevealMessage>
            )}
          </Animated.View>
        </View>

        {/* Section principale */}
        <ScrollView 
          style={styles.mainSection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {INITIAL_OPTIONS.map(renderCategory)}
        </ScrollView>

        {/* Section bouton */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <BodyText style={styles.continueButtonText}>
              Continuer
            </BodyText>
          </TouchableOpacity>
        </View>
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
  
  hintText: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.primary,
    lineHeight: 22,
    maxWidth: 280,
    marginTop: theme.spacing.m,
    fontStyle: 'italic',
  },
  
  mainSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  
  scrollContent: {
    paddingTop: theme.spacing.xl,
  },
  
  categoryContainer: {
    marginBottom: theme.spacing.xl,
  },
  
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  categoryDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.l,
  },
  
  optionsGrid: {
    gap: theme.spacing.m,
  },
  
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.l,
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
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
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
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  avatarPreview: {
    width: 40,
    height: 40,
    marginRight: theme.spacing.m,
  },
  
  phonePreview: {
    width: 40,
    height: 60,
    marginRight: theme.spacing.m,
    borderRadius: theme.borderRadius.small,
    borderWidth: 2,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  
  phoneScreen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  
  fakeHeader: {
    height: 8,
    backgroundColor: theme.colors.border,
  },
  
  fakeContent: {
    flex: 1,
    padding: 4,
  },
  
  fakeLine: {
    height: 2,
    backgroundColor: theme.colors.border,
    marginBottom: 2,
    width: '80%',
  },
  
  fakeTabBar: {
    height: 6,
    backgroundColor: theme.colors.border,
  },
  
  floatingMelune: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.border,
  },
  
  floatingMeluneSelected: {
    backgroundColor: theme.colors.primary,
  },
  
  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.l,
    alignItems: 'center',
  },
  
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});