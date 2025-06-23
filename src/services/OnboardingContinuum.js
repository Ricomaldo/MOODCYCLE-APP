// ═══════════════════════════════════════════════════════════
// ⚙️ OnboardingContinuum.js - Guidance Post-Setup Continue
// ═══════════════════════════════════════════════════════════

import { createAdaptiveGuidance } from './AdaptiveGuidance';
import FeatureGatingSystem from './FeatureGatingSystem';

// ───────────────────────────────────────────────────────────
// 🎯 MILESTONES PROGRESSION CYCLIQUE
// ───────────────────────────────────────────────────────────

const PROGRESSION_MILESTONES = {
  // Jour 1-3 : Découverte immédiate
  immediate_value: {
    timeline: { day: 1, maxDay: 3 },
    triggers: ['first_login', 'profile_complete'],
    guidance: {
      emma: "Hey ! Explore ta roue cyclique, elle va te surprendre 🌟",
      laure: "Commencez par renseigner votre cycle actuel",
      clara: "Bienvenue dans ta transformation cyclique ! ✨",
      sylvie: "Prenons le temps de découvrir ensemble",
      christine: "Explorons votre sagesse cyclique"
    },
    actions: ['cycle_setup', 'first_chat', 'phase_explore']
  },
  
  // Jour 4-7 : Habitudes
  habit_formation: {
    timeline: { day: 4, maxDay: 7 },
    triggers: ['daily_return', 'second_conversation'],
    guidance: {
      emma: "Tu reviens ! C'est parti pour explorer tes patterns 📈",
      laure: "Développons une routine de suivi efficace",
      clara: "Ton engagement nourrit ta transformation !",
      sylvie: "Votre régularité est précieuse",
      christine: "La constance révèle la sagesse"
    },
    actions: ['daily_tracking', 'pattern_observation', 'notebook_routine']
  },
  
  // Jour 8-14 : Compréhension
  pattern_recognition: {
    timeline: { day: 8, maxDay: 14 },
    triggers: ['phase_transition', 'autonomy_signal'],
    guidance: {
      emma: "Tu commences à voir des patterns ! Super 🔍",
      laure: "Analysons vos observations pour optimiser",
      clara: "Tes insights révèlent ta puissance cyclique !",
      sylvie: "Vos connexions s'approfondissent",
      christine: "Votre compréhension mûrit"
    },
    actions: ['pattern_analysis', 'insight_creation', 'phase_anticipation']
  },
  
  // Jour 15-21 : Maîtrise
  cycle_mastery: {
    timeline: { day: 15, maxDay: 21 },
    triggers: ['complete_cycle', 'autonomous_behavior'],
    guidance: {
      emma: "Tu maîtrises ton cycle ! Time to shine ⭐",
      laure: "Optimisez votre vie selon vos phases",
      clara: "Tu incarnes la maîtrise cyclique absolue !",
      sylvie: "Votre sagesse peut inspirer d'autres",
      christine: "Transmettez cette connaissance précieuse"
    },
    actions: ['cycle_optimization', 'knowledge_sharing', 'advanced_features']
  },
  
  // 22+ jours : Autonomie
  autonomous_evolution: {
    timeline: { day: 22, maxDay: null },
    triggers: ['mentor_behavior', 'content_creation'],
    guidance: {
      emma: "Deviens ambassadrice de ta génération ! 🚀",
      laure: "Créez votre propre système optimisé",
      clara: "Rayonne ta lumière cyclique sur le monde !",
      sylvie: "Guidez d'autres femmes dans leur parcours",
      christine: "Votre sagesse est un trésor à partager"
    },
    actions: ['mentor_others', 'create_content', 'community_leadership']
  }
};

// ───────────────────────────────────────────────────────────
// 🎯 TRIGGERS CONTEXTUELS
// ───────────────────────────────────────────────────────────

const CONTEXTUAL_TRIGGERS = {
  // Événements cycle
  phase_transition: {
    condition: (userProfile) => {
      const phase = userProfile.getCurrentPhase();
      const lastPhase = userProfile.lastTrackedPhase;
      return phase !== lastPhase;
    },
    guidance: (phase, persona) => {
      const adaptiveGuidance = createAdaptiveGuidance({}, {}, '');
      return {
        type: 'phase_welcome',
        message: `Phase ${phase} activée ! ${adaptiveGuidance.getPhaseSpecificPrompt(phase, persona)}`,
        actions: ['explore_phase', 'chat_about_phase']
      };
    }
  },
  
  // Signaux autonomie
  autonomy_signal: {
    condition: (engagementData) => engagementData.metrics.autonomySignals > 0,
    guidance: (persona) => {
      const adaptiveGuidance = createAdaptiveGuidance({}, {}, '');
      return {
        type: 'autonomy_recognition',
        message: adaptiveGuidance.generateContextualMessage(persona, 'learning', 'encouragement'),
        actions: ['continue_observation', 'analyze_patterns']
      };
    }
  },
  
  // REMOVED: return_after_absence - condition jamais vraie car lastActiveDate pas défini dans metrics
  // Cette logique était basée sur un champ qui n'existe pas dans le store d'engagement
};

// ───────────────────────────────────────────────────────────
// 🏭 FACTORY FUNCTION PRINCIPALE
// ───────────────────────────────────────────────────────────

export const createOnboardingContinuum = (userProfile, engagementData) => {
  
  // ──────────────────────────────────────────────────────
  // 📍 DÉTECTION MILESTONE ACTUEL
  // ──────────────────────────────────────────────────────
  
  const getCurrentMilestone = (engagementMetrics) => {
    const daysUsed = engagementMetrics.daysUsed;
    
    for (const [key, milestone] of Object.entries(PROGRESSION_MILESTONES)) {
      const { timeline } = milestone;
      if (daysUsed >= timeline.day && (timeline.maxDay === null || daysUsed <= timeline.maxDay)) {
        return { key, ...milestone };
      }
    }
    
    return PROGRESSION_MILESTONES.autonomous_evolution;
  };
  
  // ──────────────────────────────────────────────────────
  // 🎯 GUIDANCE CONTEXTUELLE
  // ──────────────────────────────────────────────────────
  
  const getContextualGuidance = () => {
    const persona = userProfile.persona.assigned;
    const currentMilestone = getCurrentMilestone(engagementData.metrics);
    
    // Check contextual triggers
    const activeTriggersResults = [];
    Object.entries(CONTEXTUAL_TRIGGERS).forEach(([triggerKey, trigger]) => {
      if (trigger.condition(engagementData) || trigger.condition(userProfile)) {
        activeTriggersResults.push({
          key: triggerKey,
          guidance: trigger.guidance(persona, engagementData.metrics)
        });
      }
    });
    
    // Base milestone guidance
    const milestoneGuidance = {
      type: 'milestone',
      message: currentMilestone.guidance[persona] || currentMilestone.guidance.emma,
      actions: currentMilestone.actions,
      milestone: currentMilestone.key
    };
    
    return {
      primary: milestoneGuidance,
      contextual: activeTriggersResults,
      milestone: currentMilestone,
      nextMilestone: getNextMilestone(engagementData.metrics)
    };
  };
  
  // ──────────────────────────────────────────────────────
  // 📈 MILESTONE SUIVANT
  // ──────────────────────────────────────────────────────
  
  const getNextMilestone = (metrics) => {
    const current = getCurrentMilestone(metrics);
    const milestoneKeys = Object.keys(PROGRESSION_MILESTONES);
    const currentIndex = milestoneKeys.indexOf(current.key);
    
    if (currentIndex < milestoneKeys.length - 1) {
      const nextKey = milestoneKeys[currentIndex + 1];
      return { key: nextKey, ...PROGRESSION_MILESTONES[nextKey] };
    }
    
    return null;
  };
  
  // ──────────────────────────────────────────────────────
  // 🎯 SUGGESTIONS ACTIONS PROGRESSIVE
  // ──────────────────────────────────────────────────────
  
  const getProgressiveSuggestions = () => {
    const guidance = getContextualGuidance();
    const availableFeatures = FeatureGatingSystem.getAvailableFeatures();
    
    const suggestions = [];
    
    // Primary milestone action
    const primaryAction = guidance.primary.actions[0];
    suggestions.push({
      type: 'milestone',
      action: primaryAction,
      priority: 'high',
      message: guidance.primary.message
    });
    
    // Feature-based suggestions
    if (availableFeatures.includes('advanced_tracking')) {
      suggestions.push({
        type: 'feature_unlock',
        action: 'try_advanced_tracking',
        priority: 'medium',
        message: 'Nouveau : tracking symptoms détaillé débloqué !'
      });
    }
    
    // Contextual suggestions
    guidance.contextual.forEach(trigger => {
      suggestions.push({
        type: 'contextual',
        action: trigger.guidance.actions[0],
        priority: 'medium',
        message: trigger.guidance.message
      });
    });
    
    return suggestions.slice(0, 3);
  };
  
  // ──────────────────────────────────────────────────────
  // 🔄 PROGRESSION TRACKING
  // ──────────────────────────────────────────────────────
  
  const trackProgress = (actionType) => {
    // Map actions to engagement tracking
    const actionMap = {
      'cycle_setup': 'cycle_day_tracked',
      'first_chat': 'conversation_started',
      'phase_explore': 'phase_explored',
      'daily_tracking': 'cycle_day_tracked',
      'pattern_observation': 'autonomy_signal',
      'notebook_routine': 'notebook_entry'
    };
    
    const engagementAction = actionMap[actionType];
    if (engagementAction) {
      // Note: Cette méthode ne peut plus tracker directement car on n'a plus accès au store
      // Les consumers devront gérer le tracking eux-mêmes
      console.warn('trackProgress: Please handle tracking in your component using engagementStore.trackAction()');
      return { actionType, engagementAction };
    }
    
    return { actionType, engagementAction: null };
  };
  
  // ──────────────────────────────────────────────────────
  // 🚀 API PUBLIQUE PRINCIPALE
  // ──────────────────────────────────────────────────────
  
  const createContinuum = () => {
    const guidance = getContextualGuidance();
    const suggestions = getProgressiveSuggestions();
    
    return {
      guidance,
      suggestions,
      
      // Helpers
      shouldShowOnboarding: guidance.milestone.key === 'immediate_value',
      isProgressing: suggestions.length > 0,
      
      // Actions
      trackAction: (actionType) => trackProgress(actionType),
      getNextSteps: () => guidance.primary.actions,
      
      // Status
      milestoneProgress: {
        current: guidance.milestone.key,
        next: guidance.nextMilestone?.key || null,
        daysInCurrent: engagementData.metrics.daysUsed - guidance.milestone.timeline.day
      }
    };
  };

  // ──────────────────────────────────────────────────────
  // 🔄 API PUBLIQUE - MÉTHODES EXPOSÉES
  // ──────────────────────────────────────────────────────
  
  return {
    getCurrentMilestone,
    getContextualGuidance,
    getNextMilestone,
    getProgressiveSuggestions,
    trackProgress,
    createContinuum
  };
};

// ───────────────────────────────────────────────────────────
// 🎯 EXPORT CLEAN - API MODERNE UNIQUEMENT
// ───────────────────────────────────────────────────────────

// Export uniquement de la factory function moderne  
// Plus de classe wrapper obsolète - Architecture unifiée