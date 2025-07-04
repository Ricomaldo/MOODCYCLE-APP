// ═══════════════════════════════════════════════════════════
// 🎣 useSmartSuggestions.js - Hook Suggestions Intelligentes  
// ═══════════════════════════════════════════════════════════

import { useMemo, useCallback } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useUserIntelligence } from '../stores/useUserIntelligence';
import { useEngagementStore } from '../stores/useEngagementStore';
import { useCycleStore } from '../stores/useCycleStore';
import { getCurrentPhase, getCurrentPhaseAdaptive } from '../utils/cycleCalculations';
import { usePersona } from './usePersona';
import { createPersonalizationEngine } from '../services/PersonalizationEngine';
import CycleObservationEngine from '../services/CycleObservationEngine';

// 🆕 Scores de vulnérabilité émotionnelle par phase
const EMOTIONAL_VULNERABILITY_SCORES = {
  menstrual: { base: 0.8, peak: 0.9, timing: 'sensitive' },
  follicular: { base: 0.3, peak: 0.4, timing: 'energetic' },
  ovulatory: { base: 0.2, peak: 0.3, timing: 'confident' },
  luteal: { base: 0.6, peak: 0.8, timing: 'introspective' }
};

// ───────────────────────────────────────────────────────────
// 🎯 HOOK PRINCIPAL SUGGESTIONS INTELLIGENTES
// ───────────────────────────────────────────────────────────

// ✅ Stabilisation de la factory function
const createStableSuggestions = (persona, currentPhase, intelligence, preferences) => {
  if (!persona || !currentPhase) {
    return {
      actions: [],
      prompts: [],
      confidence: 0,
      dataPoints: {
        timePatterns: 0,
        phaseData: 0,
        conversationHistory: 0
      },
      recommendations: []
    };
  }

  // Extraction des données d'intelligence pour la factory function
  const intelligenceData = {
    learning: intelligence.learning,
    getPersonalizedPrompts: (phase, persona) => intelligence.getPersonalizedPrompts(phase, persona)
  };

  // Génération via createPersonalizationEngine
  const personalizationEngine = createPersonalizationEngine(
    intelligenceData,
    preferences,
    currentPhase,
    persona
  );

  const experience = personalizationEngine.createPersonalizedExperience();
  
  // 🆕 Ajouter calcul empathie
  const emotionalReadiness = calculateEmotionalReadiness(
    currentPhase, 
    intelligence
  );
  
  let contextualActions = experience.contextualActions || [];
  
  // Adapter les actions selon readiness
  if (emotionalReadiness.shouldDelay) {
    contextualActions = contextualActions.map(action => ({
      ...action,
      title: action.title.replace('maintenant', 'quand tu te sentiras prête'),
      softLaunch: true,
      emotionalTiming: emotionalReadiness.timing
    }));
  }
  
  return {
    ...experience,
    contextualActions,
    emotionalReadiness // 🆕
  };
};

// 🆕 Calcul empathie temporelle
const calculateEmotionalReadiness = (phase, intelligence, hour) => {
  const vulnerability = EMOTIONAL_VULNERABILITY_SCORES[phase] || { base: 0.5 };
  const currentHour = hour || new Date().getHours();
  
  // Facteurs temporels
  let timingScore = 1;
  if (currentHour < 8 || currentHour > 22) timingScore = 0.7; // Tôt/tard
  if (currentHour >= 10 && currentHour <= 16) timingScore = 1.2; // Optimal
  
  // Facteurs intelligence
  const recentMood = intelligence.learning?.phasePatterns?.[phase]?.mood;
  const moodMultiplier = recentMood === 'low' ? 1.3 : recentMood === 'high' ? 0.8 : 1;
  
  // Score final
  const readiness = (1 - vulnerability.base) * timingScore * moodMultiplier;
  
  return {
    score: Math.min(1, Math.max(0, readiness)),
    timing: vulnerability.timing,
    shouldDelay: readiness < 0.3,
    optimalDelay: readiness < 0.3 ? 30 : 0, // minutes
    emotionalState: vulnerability.timing
  };
};

export function useSmartSuggestions() {
  const { preferences } = useUserStore();
  const { current: persona } = usePersona();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const intelligence = useUserIntelligence();
  const engagement = useEngagementStore();
  
  const currentPhase = getCurrentPhaseAdaptive(
    cycleData.lastPeriodDate,
    cycleData.length,
    cycleData.periodDuration,
    {
      mode: 'auto',
      userIntelligence: intelligence,
      engagementLevel: engagement?.maturity?.current
    }
  );

  // ✅ Stabilisation des dépendances
  const stablePreferences = useMemo(() => preferences, [preferences]);
  const stablePersona = useMemo(() => persona, [persona]);
  const stablePhase = useMemo(() => currentPhase, [currentPhase]);
  const stableIntelligence = useMemo(() => ({
    learning: intelligence.learning,
    getPersonalizedPrompts: intelligence.getPersonalizedPrompts
  }), [intelligence.learning, intelligence.getPersonalizedPrompts]);

  // ✅ Génération suggestions avec dépendances stables
  const suggestions = useMemo(() => {
    const experience = createStableSuggestions(
      stablePersona,
      stablePhase,
      stableIntelligence,
      stablePreferences
    );

    let contextualActions = experience.contextualActions || [];

    // AJOUT : Suggestions observation si pertinent
    const observationReadiness = intelligence.getObservationReadiness?.();
    
    if (observationReadiness && !observationReadiness.hasEnoughData) {
      // Ajouter suggestion d'observation
      const observationAction = {
        type: 'observation',
        title: 'Note tes ressentis du jour',
        label: 'Observer mon cycle',
        prompt: CycleObservationEngine.getSuggestedObservations(
          stablePhase, 
          intelligence.observationPatterns?.lastObservations || []
        )[0]?.prompt,
        icon: '📝',
        priority: 'medium',
        confidence: 80
      };
      
      // Insérer en 2e position
      contextualActions.splice(1, 0, observationAction);
    }

    return {
      actions: contextualActions,
      prompts: experience.personalizedPrompts || [],
      confidence: experience.personalization?.confidence || 0,
      dataPoints: experience.personalization?.dataPoints || {},
      recommendations: experience.personalization?.recommendations || [],
      emotionalReadiness: experience.emotionalReadiness // 🆕
    };
  }, [stablePersona, stablePhase, stableIntelligence, stablePreferences, intelligence]);

  // ──────────────────────────────────────────────────────
  // 📊 TRACKING UTILISATION
  // ──────────────────────────────────────────────────────
  
  const trackSuggestionShown = useCallback((actionType) => {
    intelligence.trackSuggestionShown(actionType);
  }, [intelligence]);

  const trackSuggestionClicked = useCallback((actionType, metadata = {}) => {
    intelligence.trackSuggestionClicked(actionType);
    
    // Tracking additionnel selon type
    switch (actionType) {
      case 'chat':
        intelligence.trackInteraction('conversation_start', {
          prompt: metadata.prompt,
          phase: currentPhase,
          persona
        });
        break;
      case 'notebook':
        intelligence.trackInteraction('phase_topic_explored', {
          phase: currentPhase,
          topic: 'journaling'
        });
        break;
      case 'phase_detail':
        intelligence.trackInteraction('phase_topic_explored', {
          phase: currentPhase,
          topic: 'phase_education'
        });
        break;
    }
  }, [intelligence, currentPhase, persona]);

  // ──────────────────────────────────────────────────────
  // 🎯 ACTIONS IMMÉDIATES
  // ──────────────────────────────────────────────────────
  
  const getImmediateActions = useCallback(() => {
    return suggestions.actions.filter(action => action.priority === 'high');
  }, [suggestions.actions]);

  const getPersonalizedActions = useCallback(() => {
    return suggestions.actions.filter(action => action.confidence > 50);
  }, [suggestions.actions]);

  const getDiscoveryActions = useCallback(() => {
    return suggestions.actions.filter(action => 
      action.priority === 'low' || action.confidence < 50
    );
  }, [suggestions.actions]);

  // ──────────────────────────────────────────────────────
  // 💡 SUGGESTIONS PROACTIVES
  // ──────────────────────────────────────────────────────
  
  const getProactiveSuggestions = useCallback(() => {
    const proactive = [];
    
    // Suggestion basée sur patterns temporels
    const optimalTime = intelligence.getOptimalInteractionTime();
    if (optimalTime?.isOptimalNow) {
      proactive.push({
        type: 'timing_optimal',
        title: 'Moment optimal détecté',
        message: 'C\'est ton heure favorite ! Prête pour une session ?',
        action: suggestions.actions[0],
        priority: 'notification'
      });
    }
    
    // Suggestion basée sur phase mood
    const phasePersonalization = intelligence.getPhasePersonalization(currentPhase);
    if (phasePersonalization.predictedMood === 'challenging') {
      proactive.push({
        type: 'mood_support',
        title: 'Support phase difficile',
        message: 'Cette phase est parfois intense. Comment t\'accompagner ?',
        action: {
          type: 'chat',
          prompt: `Comment transformer les défis de ${currentPhase} en force ?`
        },
        priority: 'support'
      });
    }
    
    return proactive;
  }, [intelligence, currentPhase, suggestions.actions]);

  // ──────────────────────────────────────────────────────
  // 🔍 CACHE & OPTIMISATION
  // ──────────────────────────────────────────────────────
  
  // REMOVED: getCachedSuggestions - logique cache jamais utilisée, supprimée pour optimisation

  // ──────────────────────────────────────────────────────
  // 📈 MÉTRIQUES EFFICACITÉ
  // ──────────────────────────────────────────────────────
  
  const getEffectivenessMetrics = useCallback(() => {
    const { suggestionEffectiveness } = intelligence.learning;
    
    return {
      overall: Object.values(suggestionEffectiveness)
        .reduce((acc, s) => acc + (s.rate || 0), 0) / 3,
      byType: suggestionEffectiveness,
      totalShown: Object.values(suggestionEffectiveness)
        .reduce((acc, s) => acc + s.shown, 0),
      totalClicked: Object.values(suggestionEffectiveness)
        .reduce((acc, s) => acc + s.clicked, 0)
    };
  }, [intelligence.learning.suggestionEffectiveness]);

  // ──────────────────────────────────────────────────────
  // 🎭 ADAPTATION DYNAMIQUE
  // ──────────────────────────────────────────────────────
  
  const adaptSuggestionsToContext = useCallback((context = {}) => {
    let adaptedSuggestions = [...suggestions.actions];
    
    // Adaptation selon moment journée
    const hour = new Date().getHours();
    if (hour < 8 || hour > 22) {
      // Filtrer suggestions énergiques tard/tôt
      adaptedSuggestions = adaptedSuggestions.filter(s => 
        !s.title.includes('Domine') && !s.title.includes('Conquiers')
      );
    }
    
    // Adaptation selon usage récent
    if (context.lastAction === 'chat' && context.timeSinceLastAction < 30) {
      // Privilégier notebook si chat récent
      adaptedSuggestions = adaptedSuggestions.sort((a, b) => 
        a.type === 'notebook' ? -1 : b.type === 'notebook' ? 1 : 0
      );
    }
    
    // Adaptation selon confidence
    if (intelligence.learning.confidence < 30) {
      // Privilégier discovery actions
      adaptedSuggestions = adaptedSuggestions.sort((a, b) => 
        a.priority === 'low' ? -1 : b.priority === 'low' ? 1 : 0
      );
    }
    
    return adaptedSuggestions.slice(0, 3);
  }, [suggestions.actions, intelligence.learning.confidence]);

  // ──────────────────────────────────────────────────────
  // 🎯 API PUBLIQUE
  // ──────────────────────────────────────────────────────
  
  return {
    // Suggestions principales
    actions: suggestions.actions,
    prompts: suggestions.prompts,
    
    // Suggestions filtrées
    immediate: getImmediateActions(),
    personalized: getPersonalizedActions(),
    discovery: getDiscoveryActions(),
    proactive: getProactiveSuggestions(),
    
    // Métadonnées
    confidence: suggestions.confidence,
    dataPoints: suggestions.dataPoints,
    recommendations: suggestions.recommendations,
    
    // Métriques
    effectiveness: getEffectivenessMetrics(),
    
    // Actions
    trackShown: trackSuggestionShown,
    trackClicked: trackSuggestionClicked,
    adaptToContext: adaptSuggestionsToContext,
    
    // REMOVED: getCached - méthode cache supprimée
    
    // États dérivés
    hasPersonalizedData: suggestions.confidence > 30,
    hasHighConfidence: suggestions.confidence > 70,
    needsMoreData: suggestions.confidence < 30,
    isLearning: (suggestions.dataPoints?.conversationHistory || 0) > 0
  };
}

// ───────────────────────────────────────────────────────────
// 🎯 HOOKS SPÉCIALISÉS
// ───────────────────────────────────────────────────────────

// Hook pour suggestions chat uniquement
export function useSmartChatSuggestions() {
  const { prompts, trackClicked, confidence } = useSmartSuggestions();
  
  return {
    prompts,
    selectPrompt: (prompt) => trackClicked('chat', { prompt }),
    confidence,
    hasPersonalized: Array.isArray(prompts) && prompts.length > 0 && confidence > 30
  };
}

// Hook pour actions recommandées
export function useRecommendedActions() {
  const { immediate, personalized, discovery, trackClicked } = useSmartSuggestions();
  
  return {
    primary: immediate[0] || personalized[0] || discovery[0],
    secondary: [...immediate.slice(1), ...personalized.slice(1)].slice(0, 2),
    fallback: discovery,
    executeAction: (action) => trackClicked(action.type, action)
  };
}

// Hook pour notifications proactives
export function useProactiveNotifications() {
  const { proactive, trackClicked } = useSmartSuggestions();
  
  return {
    notifications: proactive.filter(p => p.priority === 'notification'),
    supportSuggestions: proactive.filter(p => p.priority === 'support'),
    hasActiveNotifications: Array.isArray(proactive) && proactive.length > 0,
    dismissNotification: (notification) => trackClicked(notification.action.type, notification.action)
  };
}