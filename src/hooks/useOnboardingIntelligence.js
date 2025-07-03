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
  
  const [meluneMessage, setMeluneMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    trackAction('onboarding_progress', { screen: screenName });
    setIsReady(true);
  }, [screenName]);

  const getScreenMessage = () => {
    const messages = {
      '100-bienvenue': "Je suis Mélune, et je vais vous accompagner dans cette découverte.",
      '200-motivation': "Je te vois... cette femme puissante en toi qui attend de se révéler",
      '300-etape-vie': "Pour t'accompagner selon ton étape de vie, j'aimerais mieux te connaître",
      '400-cycle': "Parle-moi de ton rythme naturel. C'est la clé pour te comprendre",
      '500-preferences': "Comment préfères-tu que je t'accompagne ? Dis-moi ce qui résonne en toi",
      '550-prenom': "Comment aimerais-tu que je t'appelle ?",
      '600-avatar': "Personnalise Melune selon tes préférences",
      '650-terminology': "Choisis comment tu veux voir tes phases du cycle",
      '700-essai': "Continue ton exploration gratuitement",
      '800-demarrage': "Voici ton premier cadeau personnalisé !"
    };

    if (userStore.persona.assigned && 
        userStore.persona.lastCalculated && 
        userStore.profile.completed && 
        maturity.current) {
      
      const cycleData = getCycleData();
      const guidance = createAdaptiveGuidance(userStore, { maturity }, cycleData.currentPhase || 'follicular');
      const contextualMessage = guidance.generateContextualMessage(
        userStore.persona.assigned,
        maturity.current,
        'welcome'
      );
      return contextualMessage || messages[screenName];
    }

    return messages[screenName] || "Continue ton parcours...";
  };

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
    
    meluneMessage: getScreenMessage(),
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