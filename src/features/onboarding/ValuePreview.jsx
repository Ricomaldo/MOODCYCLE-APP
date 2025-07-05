//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/onboarding/ValuePreview.jsx
// 🧩 Type: Component - Value Preview Orchestrator
// 📚 Description: Orchestration complète de l'expérience de démonstration de valeur
// 🕒 Version: 2.0 - 2025-01-27
// 🎯 ÉQUIPE 3 - Mission Paywall Intelligent - Avec contrôles navigation
// ─────────────────────────────────────────────────────────
//
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BodyText, Caption } from '../../core/ui/typography';
import LivePersonaDemo from './LivePersonaDemo';
import AuthenticTestimonial from './AuthenticTestimonial';
import ValueReveal from './ValueReveal';

export default function ValuePreview({ persona, phase, preferences, onComplete }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const steps = [
    { component: 'demo', title: 'Démonstration IA', duration: 8000 },
    { component: 'testimonial', title: 'Témoignage', duration: 6000 },
    { component: 'reveal', title: 'Révélation', duration: 5000 }
  ];

  // Auto-advance avec possibilité de désactiver
  useEffect(() => {
    if (!autoAdvance || isComplete) return;
    
    const timer = setTimeout(() => {
      handleNext();
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, autoAdvance, isComplete]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsComplete(false);
    }
  };

  const handleSkip = () => {
    setIsComplete(true);
    onComplete?.();
  };

  const handleStepComplete = (stepIndex) => {
    if (autoAdvance) {
      handleNext();
    }
  };

  const renderCurrentStep = () => {
    const step = steps[currentStep];
    
    switch (step.component) {
      case 'demo':
        return (
          <LivePersonaDemo
            persona={persona}
            phase={phase}
            preferences={preferences}
            onComplete={() => handleStepComplete(0)}
          />
        );
      
      case 'testimonial':
        return (
          <AuthenticTestimonial
            persona={persona}
            onComplete={() => handleStepComplete(1)}
          />
        );
      
      case 'reveal':
        return (
          <ValueReveal
            persona={persona}
            onComplete={() => handleStepComplete(2)}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec contrôles */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BodyText style={styles.stepTitle}>
            {steps[currentStep].title}
          </BodyText>
          <Caption style={styles.stepCounter}>
            {currentStep + 1} / {steps.length}
          </Caption>
        </View>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Caption style={styles.skipText}>Passer</Caption>
        </TouchableOpacity>
      </View>

      {/* Indicateur de progression */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={styles.progressStep}
            onPress={() => setCurrentStep(index)}
          >
            <View style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive
            ]} />
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                index < currentStep && styles.progressLineActive
              ]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenu de l'étape actuelle */}
      <ScrollView 
        style={styles.stepContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Contrôles de navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <Feather name="chevron-left" size={20} color={
            currentStep === 0 ? theme.colors.textSecondary : theme.colors.primary
          } />
          <BodyText style={[
            styles.navButtonText,
            currentStep === 0 && styles.navButtonTextDisabled
          ]}>
            Précédent
          </BodyText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.autoAdvanceToggle}
          onPress={() => setAutoAdvance(!autoAdvance)}
        >
          <Feather 
            name={autoAdvance ? "pause" : "play"} 
            size={16} 
            color={theme.colors.textSecondary} 
          />
          <Caption style={styles.autoAdvanceText}>
            {autoAdvance ? "Pause" : "Auto"}
          </Caption>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNext}
        >
          <BodyText style={styles.navButtonText}>
            {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
          </BodyText>
          <Feather name="chevron-right" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Message de finalisation */}
      {isComplete && (
        <View style={styles.completionContainer}>
          <View style={styles.completionBadge}>
            <Text style={styles.completionText}>
              ✨ Prête à découvrir plus ?
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  stepCounter: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: theme.colors.primary + '15',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  progressStep: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: theme.colors.primary,
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: theme.colors.primary,
  },
  stepContainer: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    gap: 6,
  },
  navButtonDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  navButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },
  autoAdvanceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: theme.colors.backgroundSecondary,
    gap: 4,
  },
  autoAdvanceText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  completionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  completionBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 25,
  },
  completionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
}); 