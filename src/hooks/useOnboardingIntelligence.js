//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useOnboardingIntelligence.js
// 🧩 Type: Hook Intelligence
// 📚 Description: Intelligence et personnalisation onboarding avec calcul progressif
// 🕒 Version: 3.0 - 2025-06-29
// ─────────────────────────────────────────────────────────
//
import { useEffect, useState, useMemo } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useEngagementStore } from '../stores/useEngagementStore';
import { useUserIntelligence } from '../stores/useUserIntelligence';
import { createPersonalizationEngine } from '../services/PersonalizationEngine';
import { createAdaptiveGuidance } from '../services/AdaptiveGuidance';
import { createOnboardingContinuum } from '../services/OnboardingContinuum';
import { useCycleStore, getCycleData } from '../stores/useCycleStore';
import { calculatePersona } from '../services/PersonaEngine';
import { getOnboardingMessage } from '../config/onboardingMessages';

// Cache pour éviter recalculs inutiles
let personaCache = {
  data: null,
  result: null,
  timestamp: 0
};

export const useOnboardingIntelligence = (screenName) => {
  const userStore = useUserStore();
  const { trackAction, maturity } = useEngagementStore();
  const intelligenceStore = useUserIntelligence();
  
  const [isReady, setIsReady] = useState(false);
  const [currentPersona, setCurrentPersona] = useState(null);
  const [personaConfidence, setPersonaConfidence] = useState(0);

  // Collecte des données accumulées jusqu'à cet écran
  const collectDataUpToScreen = () => {
    // Ordre exact des écrans dans le flow onboarding
    const screens = [
      '100-bienvenue', '200-bonjour', '250-rencontre', 
      '300-etape-vie', '400-prenom', '500-avatar',
      '600-terminology', '700-cycle', '800-preferences',
      '900-essai', '950-demarrage'
    ];
    
    const currentIndex = screens.indexOf(screenName);
    
    // Déterminer quelles données sont disponibles selon l'écran actuel
    const hasJourneyChoice = currentIndex >= screens.indexOf('250-rencontre');
    const hasAgeRange = currentIndex >= screens.indexOf('300-etape-vie');
    const hasMelune = currentIndex >= screens.indexOf('500-avatar');
    const hasTerminology = currentIndex >= screens.indexOf('600-terminology');
    const hasPreferences = currentIndex >= screens.indexOf('800-preferences');

    // Retourner uniquement les données collectées jusqu'à maintenant
    return {
      profile: {
        journeyChoice: hasJourneyChoice ? userStore.profile.journeyChoice : undefined,
        ageRange: hasAgeRange ? userStore.profile.ageRange : undefined,
        terminology: hasTerminology ? userStore.profile.terminology : undefined,
      },
      melune: hasMelune ? userStore.melune : {},
      preferences: hasPreferences ? userStore.preferences : {}
    };
  };

  // Calcul progressif de la persona
  const calculateProgressivePersona = useMemo(() => {
    const currentData = collectDataUpToScreen();
    
    // Vérifier le cache
    const dataHash = JSON.stringify(currentData);
    const now = Date.now();
    if (personaCache.data === dataHash && (now - personaCache.timestamp) < 5000) {
      return personaCache.result;
    }

    // Vérifier si on a assez de données
    const hasMinimumData = currentData.profile.journeyChoice || currentData.profile.ageRange;
    if (!hasMinimumData) {
      return { assigned: null, confidence: 0 };
    }

    // Calculer avec PersonaEngine
    const result = calculatePersona(currentData);
    
    // Mettre en cache
    personaCache = {
      data: dataHash,
      result,
      timestamp: now
    };

    return result;
  }, [screenName, userStore.profile, userStore.melune, userStore.preferences]);

  useEffect(() => {
    trackAction('onboarding_progress', { screen: screenName });
    
    // Mettre à jour la persona calculée
    const personaResult = calculateProgressivePersona;
    if (personaResult.assigned && personaResult.confidence >= 0.4) {
      setCurrentPersona(personaResult.assigned);
      setPersonaConfidence(personaResult.confidence);
      
      // Sauvegarder dans le store si confiance suffisante
      if (personaResult.confidence >= 0.6) {
        userStore.setPersona(personaResult.assigned, personaResult.confidence);
      }
    }
    
    setIsReady(true);
  }, [screenName, calculateProgressivePersona]);

  // Obtenir un message personnalisé pour l'écran actuel
  const getPersonalizedMessage = (key, data = {}) => {
    const persona = currentPersona || 'default';
    return getOnboardingMessage(screenName, persona, key, {
      ...data,
      prenom: userStore.profile.prenom
    });
  };

  // Messages d'intelligence progressive
  const getIntelligenceHint = () => {
    const confidence = Math.round(personaConfidence * 100);
    if (confidence >= 80) return getOnboardingMessage('intelligence_hints', null, '80');
    if (confidence >= 60) return getOnboardingMessage('intelligence_hints', null, '60');
    if (confidence >= 40) return getOnboardingMessage('intelligence_hints', null, '40');
    return null;
  };

  const getPersonalizedPrompts = () => {
    if (!currentPersona) return [];
    
    const cycleData = getCycleData();
    const engine = createPersonalizationEngine(
      intelligenceStore,
      userStore.preferences,
      cycleData.currentPhase || 'follicular',
      currentPersona
    );
    
    return engine.generatePersonalizedPrompts(
      cycleData.currentPhase || 'follicular',
      currentPersona,
      userStore.preferences,
      intelligenceStore.learning
    );
  };

  const trackEnrichedAction = (action, metadata = {}) => {
    trackAction(action, {
      ...metadata,
      screen: screenName,
      timestamp: Date.now(),
      persona: currentPersona,
      personaConfidence,
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
    // Persona progressive
    currentPersona,
    personaConfidence,
    personaScores: calculateProgressivePersona.scores,
    
    // Messages personnalisés
    getPersonalizedMessage,
    getIntelligenceHint,
    personalizedPrompts: getPersonalizedPrompts(),
    
    // Actions enrichies
    trackAction: trackEnrichedAction,
    
    // Données utilisateur
    userProfile: userStore.profile,
    maturityLevel: maturity.current,
    updateProfile: userStore.updateProfile,
    updatePreferences: userStore.updatePreferences,
    setPersona: userStore.setPersona,
    
    // Contexte cycle
    ...getContextualData()
  };
};