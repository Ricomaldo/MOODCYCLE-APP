//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useOnboardingIntelligence.js
// 🧩 Type: Hook Intelligence
// 📚 Description: Bridge entre services IA et écrans onboarding
// 🕒 Version: 1.0 - 2025-06-23
// 🧭 Used in: Tous les écrans onboarding
// ─────────────────────────────────────────────────────────
//
import { useEffect, useState } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useEngagementStore } from '../stores/useEngagementStore';
import { useUserIntelligence } from '../stores/useUserIntelligence';
import { createPersonalizationEngine } from '../services/PersonalizationEngine';
import { createAdaptiveGuidance } from '../services/AdaptiveGuidance';
import { createOnboardingContinuum } from '../services/OnboardingContinuum';

export const useOnboardingIntelligence = (screenName) => {
  const userStore = useUserStore();
  const { trackAction, maturity } = useEngagementStore();
  const intelligenceStore = useUserIntelligence();
  
  const [meluneMessage, setMeluneMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Track progression écran
    trackAction('onboarding_progress', { screen: screenName });
    setIsReady(true);
  }, [screenName]);

  // Messages par écran avec fallback intelligent
  const getScreenMessage = () => {
    const messages = {
      '100-promesse': "Bienvenue dans ton voyage de transformation ✨",
      '200-rencontre': "Je te vois... cette femme puissante en toi qui attend de se révéler",
      '300-confiance': "Pour t'accompagner selon ton étape de vie, j'aimerais mieux te connaître",
      '400-cycle': "Parle-moi de ton rythme naturel. C'est la clé pour te comprendre",
      '500-preferences': "Comment préfères-tu que je t'accompagne ? Dis-moi ce qui résonne en toi",
      '550-prenom': "Comment aimerais-tu que je t'appelle ?",
      '600-avatar': "Choisis ton accompagnatrice thérapeutique",
      '700-paywall': "Investis dans ta transformation cyclique",
      '800-cadeau': "Voici ton premier cadeau personnalisé !"
    };

    // Si on a un persona, on peut personnaliser
    if (userStore.persona.assigned && maturity.current) {
      const guidance = createAdaptiveGuidance(userStore, { maturity }, userStore.cycle.currentPhase || 'follicular');
      const contextualMessage = guidance.generateContextualMessage(
        userStore.persona.assigned,
        maturity.current,
        'welcome'
      );
      return contextualMessage || messages[screenName];
    }

    return messages[screenName] || "Continue ton parcours...";
  };

  // Génération prompts personnalisés si persona connu
  const getPersonalizedPrompts = () => {
    if (!userStore.persona.assigned) return [];
    
    const engine = createPersonalizationEngine(
      intelligenceStore,
      userStore.preferences,
      userStore.cycle.currentPhase || 'follicular',
      userStore.persona.assigned
    );
    
    return engine.generatePersonalizedPrompts(
      userStore.cycle.currentPhase || 'follicular',
      userStore.persona.assigned,
      userStore.preferences,
      intelligenceStore.learning
    );
  };

  // Calcul suggestion persona en temps réel
  const calculatePersonaSuggestion = (newData = {}) => {
    const combinedData = {
      ...userStore.profile,
      ...newData
    };

    // Simple mapping pour suggestions
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

  // Actions tracking enrichies
  const trackEnrichedAction = (action, metadata = {}) => {
    trackAction(action, {
      ...metadata,
      screen: screenName,
      timestamp: Date.now(),
      persona: userStore.persona.assigned,
      maturityLevel: maturity.current
    });
    
    // Track aussi dans intelligence si pertinent
    if (action.includes('choice') || action.includes('preference')) {
      intelligenceStore.trackInteraction('preference_set', metadata);
    }
  };

  return {
    // État
    isReady,
    
    // Messages
    meluneMessage: getScreenMessage(),
    personalizedPrompts: getPersonalizedPrompts(),
    
    // Actions
    trackAction: trackEnrichedAction,
    calculatePersonaSuggestion,
    
    // Données
    userProfile: userStore.profile,
    currentPersona: userStore.persona.assigned,
    maturityLevel: maturity.current,
    
    // Helpers
    updateProfile: userStore.updateProfile,
    updatePreferences: userStore.updatePreferences,
    updateCycle: userStore.updateCycle,
    setPersona: userStore.setPersona
  };
};