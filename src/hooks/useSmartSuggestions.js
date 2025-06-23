// ═══════════════════════════════════════════════════════════
// 🎣 useSmartSuggestions.js - Hook Suggestions Intelligentes  
// ═══════════════════════════════════════════════════════════

import { useMemo, useCallback } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useUserIntelligence } from '../stores/useUserIntelligence';
import { useCycle } from './useCycle';
import { usePersona } from './usePersona';
import { createPersonalizationEngine } from '../services/PersonalizationEngine';

// ───────────────────────────────────────────────────────────
// 🎯 HOOK PRINCIPAL SUGGESTIONS INTELLIGENTES
// ───────────────────────────────────────────────────────────

export function useSmartSuggestions() {
  const { preferences } = useUserStore();
  const { current: persona } = usePersona();
  const { currentPhase } = useCycle();
  const intelligence = useUserIntelligence();

  // ──────────────────────────────────────────────────────
  // 🧠 GÉNÉRATION SUGGESTIONS CONTEXTUELLES
  // ──────────────────────────────────────────────────────
  
  const suggestions = useMemo(() => {
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

    const personalizedExperience = personalizationEngine.createPersonalizedExperience();

    return {
      // Actions recommandées avec priorité
      actions: personalizedExperience.contextualActions,
      
      // Prompts conversation personnalisés
      prompts: personalizedExperience.personalizedPrompts,
      
      // Métadonnées
      confidence: personalizedExperience.personalization.confidence,
      dataPoints: personalizedExperience.personalization.dataPoints,
      recommendations: personalizedExperience.personalization.recommendations
    };

  }, [currentPhase, persona, preferences, intelligence.learning.confidence]);

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
    hasPersonalized: prompts.length > 0 && confidence > 30
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
    hasActiveNotifications: proactive.length > 0,
    dismissNotification: (notification) => trackClicked(notification.action.type, notification.action)
  };
}