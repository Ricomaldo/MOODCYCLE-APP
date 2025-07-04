//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/600-terminology.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Personnalisation de la terminologie cyclique
// 🔄 Cycle: Onboarding - Étape 7/8
// ─────────────────────────────────────────────────────────
//

import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import OnboardingScreen from '../../src/core/layout/OnboardingScreen';
import { BodyText, Caption } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useTerminologySelector } from '../../src/hooks/useTerminology';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { AnimatedRevealMessage } from '../../src/core/ui/animations';

// Options de terminologie
const TERMINOLOGY_OPTIONS = [
  {
    key: 'medical',
    name: 'Médicale',
    description: 'Termes scientifiques et précis',
    icon: '🏥',
    phases: ["Phase menstruelle", "Phase folliculaire", "Phase ovulatoire", "Phase lutéale"]
  },
  {
    key: 'spiritual',
    name: 'Spirituelle',
    description: 'Approche mystique et symbolique',
    icon: '🌙',
    phases: ["La Sorcière", "La Jeune Fille", "La Mère", "L'Enchanteresse"]
  },
  {
    key: 'energetic',
    name: 'Énergétique',
    description: 'Focus sur l\'énergie et le potentiel',
    icon: '✨',
    phases: ["Phase d'Introspection", "Phase de Renaissance", "Phase de Rayonnement", "Phase de Transformation"]
  },
  {
    key: 'modern',
    name: 'Moderne',
    description: 'Termes simples et accessibles',
    icon: '💫',
    phases: ["Phase de Pause", "Phase de Création", "Phase d'Expression", "Phase de Réflexion"]
  }
];

export default function TerminologyScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { currentTerminology, onSelect } = useTerminologySelector();
  const intelligence = useOnboardingIntelligence('600-terminology');
  
  // États
  const [selectedTerminology, setSelectedTerminology] = useState(currentTerminology || 'modern');
  const [previewPhases, setPreviewPhases] = useState([]);
  
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

  useEffect(() => {
    // Mettre à jour l'aperçu des phases selon la terminologie sélectionnée
    const phaseMapping = {
      medical: ["Phase menstruelle", "Phase folliculaire", "Phase ovulatoire", "Phase lutéale"],
      spiritual: ["La Sorcière", "La Jeune Fille", "La Mère", "L'Enchanteresse"],
      energetic: ["Phase d'Introspection", "Phase de Renaissance", "Phase de Rayonnement", "Phase de Transformation"],
      modern: ["Phase de Pause", "Phase de Création", "Phase d'Expression", "Phase de Réflexion"]
    };
    
    setPreviewPhases(phaseMapping[selectedTerminology] || phaseMapping.modern);
  }, [selectedTerminology]);

  const handleTerminologySelect = (terminologyKey) => {
    setSelectedTerminology(terminologyKey);
    onSelect(terminologyKey);
    
    intelligence.updateProfile({ terminology: terminologyKey });
    
    intelligence.trackAction('terminology_selected', {
      terminology: terminologyKey
    });
  };

  const handleContinue = () => {
    intelligence.trackAction('terminology_confirmed', {
      finalTerminology: selectedTerminology
    });
    
    // Navigation vers l'étape suivante
    setTimeout(() => {
      router.push('/onboarding/700-cycle');
    }, 300);
  };

  const renderTerminologyOption = (option) => {
    const isSelected = selectedTerminology === option.key;
    
    return (
      <TouchableOpacity
        key={option.key}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected
        ]}
        onPress={() => handleTerminologySelect(option.key)}
        activeOpacity={0.7}
      >
        <View style={styles.optionHeader}>
          <View style={styles.optionIcon}>
            <BodyText style={styles.optionEmoji}>{option.icon}</BodyText>
          </View>
          <View style={styles.optionContent}>
            <BodyText style={[
              styles.optionName,
              isSelected && styles.optionNameSelected
            ]}>
              {option.name}
            </BodyText>
            <Caption style={[
              styles.optionDescription,
              isSelected && styles.optionDescriptionSelected
            ]}>
              {option.description}
            </Caption>
          </View>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <BodyText style={styles.checkmark}>✓</BodyText>
            </View>
          )}
        </View>
        
        {/* Phases */}
        <View style={styles.optionExamples}>
          <View style={styles.examplePhases}>
            {option.phases.map((phase, index) => (
              <Caption 
                key={index} 
                style={[
                  styles.examplePhase,
                  isSelected && { color: theme.colors.primary }
                ]}
              >
                {phase}
              </Caption>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <OnboardingScreen currentScreen="600-terminology">
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
                Choisis les termes qui te correspondent le mieux pour parler de ton cycle
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
          <View style={styles.optionsContainer}>
            {TERMINOLOGY_OPTIONS.map(renderTerminologyOption)}
          </View>
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
  
  mainSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  
  scrollContent: {
    paddingTop: theme.spacing.xl,
  },
  
  optionsContainer: {
    gap: theme.spacing.l,
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
    marginBottom: theme.spacing.m,
  },
  
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  
  optionEmoji: {
    fontSize: 24,
  },
  
  optionContent: {
    flex: 1,
  },
  
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
    marginLeft: theme.spacing.m,
  },
  
  checkmark: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  optionExamples: {
    marginTop: theme.spacing.m,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  examplePhases: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  
  examplePhase: {
    fontSize: 12,
    color: theme.colors.textLight,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
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