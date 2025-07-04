//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useOnboardingIntelligence.js
// 🧩 Type: Hook Intelligence
// 📚 Description: Intelligence et personnalisation onboarding
// 🕒 Version: 2.0 - 2025-06-23
// 🧭 Used in: Tous les écrans onboarding (standardisation)
// ─────────────────────────────────────────────────────────
//
import { useEffect, useState } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useEngagementStore } from '../stores/useEngagementStore';
import { useUserIntelligence } from '../stores/useUserIntelligence';
import { createPersonalizationEngine } from '../services/PersonalizationEngine';
import { createAdaptiveGuidance } from '../services/AdaptiveGuidance';
import { createOnboardingContinuum } from '../services/OnboardingContinuum';
import { useCycleStore, getCycleData } from '../stores/useCycleStore';

export const useOnboardingIntelligence = (screenName) => {
  const userStore = useUserStore();
  const { trackAction, maturity } = useEngagementStore();
  const intelligenceStore = useUserIntelligence();
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    trackAction('onboarding_progress', { screen: screenName });
    setIsReady(true);
  }, [screenName]);

  const getPersonalizedPrompts = () => {
    if (!userStore.persona.assigned) return [];
    
    const cycleData = getCycleData();
    const engine = createPersonalizationEngine(
      intelligenceStore,
      userStore.preferences,
      cycleData.currentPhase || 'follicular',
      userStore.persona.assigned
    );
    
    return engine.generatePersonalizedPrompts(
      cycleData.currentPhase || 'follicular',
      userStore.persona.assigned,
      userStore.preferences,
      intelligenceStore.learning
    );
  };

  const calculatePersonaSuggestion = (newData = {}) => {
    const cycleData = getCycleData();
    const combinedData = {
      ...userStore.profile,
      ...newData
    };

    const personaMap = {
      'body_disconnect': { '18-25': 'emma', '26-35': 'emma', '36-45': 'sylvie', '46-55': 'christine' },
      'hiding_nature': { '18-25': 'clara', '26-35': 'sylvie', '36-45': 'sylvie', '46-55': 'christine' },
      'emotional_control': { '18-25': 'laure', '26-35': 'laure', '36-45': 'laure', '46-55': 'christine' }
    };

    const journey = combinedData.journeyChoice;
    const age = combinedData.ageRange;
    
    if (journey && age && personaMap[journey]) {
      return personaMap[journey][age] || 'emma';
    }
    
    return null;
  };

  const trackEnrichedAction = (action, metadata = {}) => {
    trackAction(action, {
      ...metadata,
      screen: screenName,
      timestamp: Date.now(),
      persona: userStore.persona.assigned,
      maturityLevel: maturity.current
    });
    
    if (action.includes('choice') || action.includes('preference')) {
      intelligenceStore.trackInteraction('preference_set', metadata);
    }
  };

  const getContextualData = () => {
    const cycleData = getCycleData();
    
    return {
      cycle: cycleData,
      updateCycle: useCycleStore.getState().updateCycle,
    };
  };

  return {
    isReady,
    personalizedPrompts: getPersonalizedPrompts(),
    trackAction: trackEnrichedAction,
    calculatePersonaSuggestion,
    userProfile: userStore.profile,
    currentPersona: userStore.persona.assigned,
    maturityLevel: maturity.current,
    updateProfile: userStore.updateProfile,
    updatePreferences: userStore.updatePreferences,
    setPersona: userStore.setPersona,
    ...getContextualData()
  };
};