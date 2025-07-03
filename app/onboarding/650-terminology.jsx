//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/650-terminology.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Sélection de terminologie cyclique
// 🕒 Version: 1.0 - 2025-01-21
// 🧭 Used in: Onboarding flow - Étape 4/5 "Terminologie"
// ─────────────────────────────────────────────────────────
//

import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText, Caption } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useTerminologySelector } from '../../src/hooks/useTerminology';

// Options de terminologie
const TERMINOLOGY_OPTIONS = [
  {
    key: 'medical',
    name: 'Médicale',
    description: 'Termes scientifiques et précis',
    icon: '🏥',
    examples: ['Phase menstruelle', 'Phase ovulatoire']
  },
  {
    key: 'spiritual',
    name: 'Spirituelle',
    description: 'Approche mystique et symbolique',
    icon: '🌙',
    examples: ['La Sorcière', 'La Mère']
  },
  {
    key: 'energetic',
    name: 'Énergétique',
    description: 'Focus sur l\'énergie et le potentiel',
    icon: '✨',
    examples: ['Introspection', 'Rayonnement']
  },
  {
    key: 'modern',
    name: 'Moderne',
    description: 'Termes simples et accessibles',
    icon: '💫',
    examples: ['Pause', 'Expression']
  }
];

export default function TerminologyScreen() {
  const intelligence = useOnboardingIntelligence('650-terminology');
  const { theme } = useTheme();
  const { currentTerminology, onSelect } = useTerminologySelector();
  const styles = getStyles(theme);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const optionsAnim = useRef(new Animated.Value(0)).current;
  
  const [selectedTerminology, setSelectedTerminology] = useState(currentTerminology || 'modern');
  const [previewPhases, setPreviewPhases] = useState([]);

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
      Animated.delay(200),
      Animated.timing(optionsAnim, {
        toValue: 1,
        duration: 400,
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
      router.push('/onboarding/700-essai');
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
        
        {/* Exemples */}
        <View style={styles.optionExamples}>
          <Caption style={[
            styles.exampleLabel,
            isSelected && styles.exampleLabelSelected
          ]}>
            Exemples :
          </Caption>
          <View style={styles.examplePhases}>
            {option.examples.map((example, index) => (
              <Caption key={index} style={styles.examplePhase}>
                {example}
              </Caption>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="650-terminology" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <MeluneAvatar 
                phase="ovulatory" 
                size="large" 
                style="classic"
                animated={true}
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
                Terminologie cyclique
              </BodyText>
              <BodyText style={styles.subtitle}>
                {intelligence.meluneMessage}
              </BodyText>
            </Animated.View>
          </View>

          {/* Aperçu actuel */}
          <Animated.View style={[styles.previewContainer, { opacity: optionsAnim }]}>
            <BodyText style={styles.previewLabel}>Aperçu actuel :</BodyText>
            <View style={styles.previewPhases}>
              {previewPhases.map((phase, index) => (
                <Caption key={phase} style={styles.previewPhase}>
                  {index > 0 && ' • '}{phase}
                </Caption>
              ))}
            </View>
          </Animated.View>

          {/* Options terminologies */}
          <Animated.View style={[styles.optionsContainer, { opacity: optionsAnim }]}>
            {TERMINOLOGY_OPTIONS.map(renderTerminologyOption)}
          </Animated.View>
          
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
    marginBottom: theme.spacing.l,
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
  
  previewContainer: {
    margin: theme.spacing.l,
    marginTop: 0,
    padding: theme.spacing.l,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  previewPhases: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  previewPhase: {
    fontSize: 13,
    color: theme.colors.primary,
  },
  
  optionsContainer: {
    padding: theme.spacing.l,
    paddingTop: 0,
    gap: theme.spacing.m,
  },
  
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  
  optionEmoji: {
    fontSize: 20,
  },
  
  optionContent: {
    flex: 1,
  },
  
  optionName: {
    fontSize: 18,
    fontWeight: '600',
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
  
  optionExamples: {
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  exampleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  
  exampleLabelSelected: {
    color: theme.colors.primary,
  },
  
  examplePhases: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  
  examplePhase: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontStyle: 'italic',
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
}); 