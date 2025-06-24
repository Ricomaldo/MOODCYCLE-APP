// ═══════════════════════════════════════════════════════════
// 🎣 useAdaptiveInterface.js - Hook Interface Adaptative Unifié
// 📚 Description : Interface adaptative + révélations progressives + guidance contextuelle
// 🕒 Version : 5.0 - 2025-06-21 - Merge avec useProgressiveReveal
// 🧭 Utilisé dans : CycleView, ChatView, NotebookView, composants adaptatifs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useMemo, useCallback } from 'react';
import { useEngagementStore } from '../stores/useEngagementStore';
import { useUserStore } from '../stores/useUserStore';
import { useUserIntelligence } from '../stores/useUserIntelligence';
import FeatureGatingSystem from '../services/FeatureGatingSystem';

// ───────────────────────────────────────────────────────────
// 🎯 DÉFINITION FEATURES PROGRESSIVES
// ───────────────────────────────────────────────────────────

const PROGRESSIVE_FEATURES = {
  // Navigation & Discovery
  calendar_view: {
    level: 'learning',
    condition: (metrics) => metrics.daysUsed >= 3,
    description: "Vue calendrier détaillée"
  },
  
  // Chat & Guidance
  advanced_prompts: {
    level: 'learning', 
    condition: (metrics) => metrics.conversationsStarted >= 2,
    description: "Questions avancées Melune"
  },
  
  conversation_history: {
    level: 'learning',
    condition: (metrics) => metrics.conversationsCompleted >= 1,
    description: "Historique conversations"
  },
  
  // Notebook & Tracking
  advanced_tracking: {
    level: 'learning',
    condition: (metrics) => metrics.notebookEntriesCreated >= 3,
    description: "Tracking symptoms avancé"
  },
  
  entry_analytics: {
    level: 'autonomous',
    condition: (metrics) => metrics.notebookEntriesCreated >= 8,
    description: "Analyses tendances personnelles"
  },
  
  // Insights & Personnalisation  
  insight_creation: {
    level: 'autonomous',
    condition: (metrics) => metrics.insightsSaved >= 3,
    description: "Création insights personnels"
  },
  
  phase_insights: {
    level: 'learning',
    condition: (metrics) => metrics.phasesExplored.length >= 2,
    description: "Insights spécifiques par phase"
  },
  
  // Cycle Understanding
  cycle_predictions: {
    level: 'autonomous',
    condition: (metrics) => metrics.cyclesCompleted >= 1,
    description: "Prédictions cycle personnalisées"
  },
  
  pattern_recognition: {
    level: 'autonomous',
    condition: (metrics) => metrics.autonomySignals >= 3,
    description: "Reconnaissance patterns personnels"
  },
  
  // Social & Sharing
  sharing_features: {
    level: 'learning',
    condition: (metrics) => metrics.insightsSaved >= 1,
    description: "Partage insights & expériences"
  }
};

// ───────────────────────────────────────────────────────────
// 🎨 CONFIGURATIONS INTERFACE PAR MATURITÉ
// ───────────────────────────────────────────────────────────

const INTERFACE_CONFIGS = {
  discovery: {
    maxVignettesPerPhase: 2,
    showProgressBar: true,
    showGuidanceHints: true,
    navigationComplexity: 'simple',
    defaultView: 'guided',
    emphasizeActions: ['chat', 'notebook', 'explore'],
    hideActions: ['create', 'analyze', 'predict'],
    guidanceIntensity: 'high'
  },
  
  learning: {
    maxVignettesPerPhase: 3,
    showProgressBar: true,
    showGuidanceHints: true,
    navigationComplexity: 'moderate',
    defaultView: 'mixed',
    emphasizeActions: ['track', 'analyze', 'plan'],
    hideActions: ['create', 'mentor'],
    guidanceIntensity: 'medium'
  },
  
  autonomous: {
    maxVignettesPerPhase: 4,
    showProgressBar: false,
    showGuidanceHints: false,
    navigationComplexity: 'full',
    defaultView: 'expert',
    emphasizeActions: ['create', 'optimize', 'share'],
    hideActions: [],
    guidanceIntensity: 'low'
  }
};

// ───────────────────────────────────────────────────────────
// 🎭 ADAPTATIONS PAR PERSONA
// ───────────────────────────────────────────────────────────

const PERSONA_ADAPTATIONS = {
  emma: {
    preferredActions: ['explore', 'discover', 'experiment'],
    navigationStyle: 'playful',
    colorScheme: 'vibrant',
    guidanceStyle: 'encouraging',
    maxComplexity: 'moderate'
  },
  
  laure: {
    preferredActions: ['plan', 'optimize', 'structure'],
    navigationStyle: 'efficient',
    colorScheme: 'professional',
    guidanceStyle: 'methodical',
    maxComplexity: 'full'
  },
  
  clara: {
    preferredActions: ['transform', 'inspire', 'create'],
    navigationStyle: 'flowing',
    colorScheme: 'warm',
    guidanceStyle: 'inspirational',
    maxComplexity: 'full'
  },
  
  sylvie: {
    preferredActions: ['nurture', 'balance', 'understand'],
    navigationStyle: 'gentle',
    colorScheme: 'soft',
    guidanceStyle: 'nurturing',
    maxComplexity: 'moderate'
  },
  
  christine: {
    preferredActions: ['wisdom', 'share', 'guide'],
    navigationStyle: 'classic',
    colorScheme: 'elegant',
    guidanceStyle: 'wise',
    maxComplexity: 'simplified'
  }
};

// ───────────────────────────────────────────────────────────
// 🎯 HOOK PRINCIPAL
// ───────────────────────────────────────────────────────────

export function useAdaptiveInterface() {
  const { maturity, metrics, getEngagementScore, getNextMilestone } = useEngagementStore();
  const { persona } = useUserStore();
  const { learning } = useUserIntelligence();
  
  // ✅ Protection contre l'hydratation
  if (!maturity || !persona || !metrics) {
    return {
      layout: {
        config: INTERFACE_CONFIGS.discovery,
        persona: PERSONA_ADAPTATIONS.emma,
        limitVignettes: (v) => v.slice(0, INTERFACE_CONFIGS.discovery.maxVignettesPerPhase)
      },
      features: {
        available: {},
        pending: {},
        isUnlocked: () => false
      },
      engagement: {
        score: 0,
        maturity: 'discovery',
        confidence: 0,
        nextMilestone: null
      },
      persona: {
        assigned: 'emma',
        adaptations: PERSONA_ADAPTATIONS.emma
      }
    };
  }
  
  // ✅ Extraction des valeurs primitives pour optimiser les deps
  const maturityLevel = maturity.current;
  const maturityConfidence = maturity.confidence;
  const personaAssigned = persona.assigned;
  const learningConfidence = learning.confidence;
  
  // Métriques spécifiques pour éviter les re-calculs
  const daysUsed = metrics.daysUsed;
  const conversationsStarted = metrics.conversationsStarted;
  const conversationsCompleted = metrics.conversationsCompleted;
  const notebookEntriesCreated = metrics.notebookEntriesCreated;
  const insightsSaved = metrics.insightsSaved;
  const cyclesCompleted = metrics.cyclesCompleted;
  const autonomySignals = metrics.autonomySignals;
  const phasesExploredLength = metrics.phasesExplored.length;
  
  // ──────────────────────────────────────────────────────
  // 🔓 CALCUL FEATURES PROGRESSIVES DISPONIBLES
  // ──────────────────────────────────────────────────────
  
  const progressiveFeatures = useMemo(() => {
    const available = {};
    const pending = {};
    
    Object.entries(PROGRESSIVE_FEATURES).forEach(([featureKey, feature]) => {
      const meetsLevelRequirement = 
        maturityLevel === 'autonomous' ||
        (maturityLevel === 'learning' && feature.level !== 'autonomous') ||
        (maturityLevel === 'discovery' && feature.level === 'discovery');
      
      const meetsCondition = feature.condition(metrics);
      
      if (meetsLevelRequirement && meetsCondition) {
        available[featureKey] = true;
      } else {
        pending[featureKey] = {
          levelRequired: feature.level,
          currentLevel: maturityLevel,
          conditionMet: meetsCondition,
          levelMet: meetsLevelRequirement,
          description: feature.description
        };
      }
    });
    
    return { available, pending };
  }, [
    maturityLevel,
    daysUsed,
    conversationsStarted,
    conversationsCompleted,
    notebookEntriesCreated,
    insightsSaved,
    cyclesCompleted,
    autonomySignals,
    phasesExploredLength
  ]);
  
  // ──────────────────────────────────────────────────────
  // 🔧 CONFIGURATION BASE
  // ──────────────────────────────────────────────────────
  
  const baseConfig = useMemo(() => {
    return INTERFACE_CONFIGS[maturityLevel] || INTERFACE_CONFIGS.discovery;
  }, [maturityLevel]);
  
  // ──────────────────────────────────────────────────────
  // 🎭 ADAPTATION PERSONA
  // ──────────────────────────────────────────────────────
  
  const personaAdaptation = useMemo(() => {
    return PERSONA_ADAPTATIONS[personaAssigned] || PERSONA_ADAPTATIONS.emma;
  }, [personaAssigned]);
  
  // ──────────────────────────────────────────────────────
  // 🔓 FEATURES DISPONIBLES (FeatureGatingSystem)
  // ──────────────────────────────────────────────────────
  
  const availableFeatures = useMemo(() => {
    return FeatureGatingSystem.evaluateAllFeatures();
  }, [
    daysUsed,
    conversationsStarted,
    conversationsCompleted,
    notebookEntriesCreated,
    insightsSaved,
    cyclesCompleted,
    autonomySignals,
    phasesExploredLength,
    maturityLevel,
    learningConfidence
  ]);
  
  // ✅ Extraction valeurs primitives pour éviter re-renders sur objets
  const featuresAvailable = availableFeatures.summary.available;
  const totalFeatures = availableFeatures.summary.total;
  const maxVignettesPerPhase = baseConfig.maxVignettesPerPhase;
  const guidanceIntensity = baseConfig.guidanceIntensity;
  const navigationComplexity = baseConfig.navigationComplexity;
  const maxComplexity = personaAdaptation.maxComplexity;
  const navigationStyle = personaAdaptation.navigationStyle;
  
  // ──────────────────────────────────────────────────────
  // 🎨 CONFIGURATION FINALE OPTIMISÉE
  // ──────────────────────────────────────────────────────
  
  const finalConfig = useMemo(() => {
    const showFeatureProgress = maturityLevel !== 'autonomous';
    const adaptiveVignettes = Math.min(
      maxVignettesPerPhase,
      Math.floor(daysUsed / 3) + 1 // Progressive increase
    );
    const guidanceLevel = learningConfidence > 50 ? 'reduced' : guidanceIntensity;
    const effectiveComplexity = maxComplexity === 'simplified' ? 
      'simplified' : navigationComplexity;
    
    // Merge configurations
    return {
      ...baseConfig,
      ...personaAdaptation,
      
      // Features availability
      features: availableFeatures.features,
      featureSummary: availableFeatures.summary,
      
      // Dynamic adjustments
      showFeatureProgress,
      adaptiveVignettes,
      guidanceLevel,
      effectiveComplexity
    };
  }, [
    baseConfig,
    personaAdaptation,
    availableFeatures.features,
    availableFeatures.summary,
    maturityLevel,
    daysUsed,
    learningConfidence,
    maxVignettesPerPhase,
    guidanceIntensity,
    navigationComplexity,
    maxComplexity
  ]);
  
  // ──────────────────────────────────────────────────────
  // 🚀 SUGGESTIONS PRÓXIMOS PASOS OPTIMISÉES
  // ──────────────────────────────────────────────────────
  
  const getNextSteps = useCallback(() => {
    const milestone = getNextMilestone();
    const suggestions = [];
    
    // Suggestions basées sur milestone suivant
    if (milestone) {
      if (milestone.missing.days > 0) {
        suggestions.push({
          type: 'consistency',
          action: 'Reviens demain pour continuer ton apprentissage',
          icon: '📅',
          priority: 'high'
        });
      }
      
      if (milestone.missing.conversations > 0) {
        suggestions.push({
          type: 'engagement',
          action: 'Pose une question à Melune sur ta phase actuelle',
          icon: '💬',
          priority: 'medium'
        });
      }
      
      if (milestone.missing.entries > 0) {
        suggestions.push({
          type: 'reflection',
          action: 'Note tes ressentis dans ton carnet',
          icon: '📝',
          priority: 'medium'
        });
      }
    }
    
    // Suggestions personnalisées par persona
    if (personaAssigned === 'emma' && phasesExploredLength < 2) {
      suggestions.push({
        type: 'exploration',
        action: 'Explore une nouvelle phase de ton cycle',
        icon: '🌟',
        priority: 'low'
      });
    }
    
    return suggestions.slice(0, 3); // Max 3 suggestions
  }, [getNextMilestone, personaAssigned, phasesExploredLength]);
  
  // ──────────────────────────────────────────────────────
  // 🎯 LAYOUT HELPERS OPTIMISÉS
  // ──────────────────────────────────────────────────────
  
  const layoutHelpers = useMemo(() => {
    const features = finalConfig.features;
    const hideActions = finalConfig.hideActions;
    const emphasizeActions = finalConfig.emphasizeActions;
    const adaptiveVignettes = finalConfig.adaptiveVignettes;
    const showGuidanceHints = finalConfig.showGuidanceHints;
    const guidanceLevel = finalConfig.guidanceLevel;
    const showFeatureProgress = finalConfig.showFeatureProgress;
    
    return {
      // Navigation rendering
      shouldShowNavItem: (itemKey) => {
        const feature = features[itemKey];
        return feature ? feature.available : true;
      },
      
      // Action filtering
      getVisibleActions: (allActions) => {
        return allActions.filter(action => 
          !hideActions.includes(action.type)
        );
      },
      
      // Emphasis styling
      shouldEmphasizeAction: (actionType) => {
        return emphasizeActions.includes(actionType);
      },
      
      // Vignette limiting
      limitVignettes: (vignettes) => {
        return vignettes.slice(0, adaptiveVignettes);
      },
      
      // Guidance visibility
      shouldShowGuidance: (guidanceType) => {
        if (!showGuidanceHints) return false;
        
        switch (guidanceType) {
          case 'onboarding': return maturityLevel === 'discovery';
          case 'hints': return guidanceLevel !== 'low';
          case 'progress': return showFeatureProgress;
          default: return true;
        }
      }
    };
  }, [
    finalConfig.features,
    finalConfig.hideActions,
    finalConfig.emphasizeActions,
    finalConfig.adaptiveVignettes,
    finalConfig.showGuidanceHints,
    finalConfig.guidanceLevel,
    finalConfig.showFeatureProgress,
    maturityLevel
  ]);
  
  // ──────────────────────────────────────────────────────
  // 📱 RESPONSIVE ADAPTATIONS OPTIMISÉES
  // ──────────────────────────────────────────────────────
  
  const responsiveAdaptations = useMemo(() => {
    const effectiveComplexity = finalConfig.effectiveComplexity;
    
    return {
      // Tab bar complexity
      tabBarStyle: effectiveComplexity === 'simplified' ? 'minimal' : 'full',
      
      // Gesture support
      enableAdvancedGestures: effectiveComplexity === 'full',
      
      // Info density
      informationDensity: maturityLevel === 'autonomous' ? 'compact' : 'spacious',
      
      // Animation complexity
      animationLevel: navigationStyle === 'playful' ? 'high' : 'medium'
    };
  }, [
    finalConfig.effectiveComplexity,
    maturityLevel,
    navigationStyle
  ]);
  
  // ✅ useCallback pour les fonctions helpers avec deps optimisées
  const isFeatureAvailable = useCallback((featureKey) => {
    return !!progressiveFeatures.available[featureKey];
  }, [progressiveFeatures.available]);
  
  const getFeatureStatus = useCallback((featureKey) => {
    return progressiveFeatures.pending[featureKey] || { available: true };
  }, [progressiveFeatures.pending]);
  
  // ✅ Calculs stables pour éviter re-renders
  const engagementScore = useMemo(() => getEngagementScore(), [getEngagementScore]);
  const nextMilestone = useMemo(() => getNextMilestone(), [getNextMilestone]);
  const nextSteps = useMemo(() => getNextSteps(), [getNextSteps]);
  const progressSuggestions = useMemo(() => FeatureGatingSystem.getProgressionSuggestions(), [
    daysUsed,
    conversationsStarted,
    notebookEntriesCreated,
    maturityLevel
  ]);
  
  // ✅ Objet metrics stable
  const metricsObject = useMemo(() => ({
    daysUsed,
    conversations: conversationsStarted,
    entries: notebookEntriesCreated,
    phasesExplored: phasesExploredLength,
    autonomySignals
  }), [
    daysUsed,
    conversationsStarted,
    notebookEntriesCreated,
    phasesExploredLength,
    autonomySignals
  ]);
  
  return {
    // Configuration principale
    config: finalConfig,
    
    // Helpers layout
    layout: layoutHelpers,
    
    // Adaptations responsive
    responsive: responsiveAdaptations,
    
    // État maturité
    maturityLevel,
    confidence: maturityConfidence,
    engagementScore,
    
    // Persona active
    activePersona: personaAssigned,
    personaStyle: personaAdaptation,
    
    // Features status (progressive + FeatureGatingSystem)
    features: progressiveFeatures.available,
    pendingFeatures: progressiveFeatures.pending,
    featuresAvailable,
    totalFeatures,
    progressSuggestions,
    
    // Guidance
    nextSteps,
    nextMilestone,
    
    // Helpers
    isFeatureAvailable,
    getFeatureStatus,
    
    // Métriques détaillées
    metrics: metricsObject
  };
}

// ───────────────────────────────────────────────────────────
// 🎯 HOOKS SPÉCIALISÉS
// ───────────────────────────────────────────────────────────

// Hook pour features spécifiques
export function useFeatureGating(featureKey) {
  const { isFeatureAvailable, getFeatureStatus } = useAdaptiveInterface();
  
  return {
    isAvailable: isFeatureAvailable(featureKey),
    status: getFeatureStatus(featureKey)
  };
}

// Hook pour navigation adaptée
export function useAdaptiveNavigation() {
  const { layout, responsive, config } = useAdaptiveInterface();
  
  return {
    shouldShowNavItem: layout.shouldShowNavItem,
    tabBarStyle: responsive.tabBarStyle,
    navigationComplexity: config.effectiveComplexity,
    enableGestures: responsive.enableAdvancedGestures
  };
}

// Hook pour vignettes adaptées
export function useAdaptiveVignettes() {
  const { layout, config } = useAdaptiveInterface();
  
  return {
    maxVignettes: config.adaptiveVignettes,
    limitVignettes: layout.limitVignettes,
    emphasizeActions: config.emphasizeActions,
    hideActions: config.hideActions
  };
}

// Hook pour guidance contextuelle
export function useAdaptiveGuidance() {
  const { layout, config, progressSuggestions, nextSteps, nextMilestone } = useAdaptiveInterface();
  
  return {
    shouldShowGuidance: layout.shouldShowGuidance,
    guidanceLevel: config.guidanceLevel,
    showProgress: config.showFeatureProgress,
    suggestions: progressSuggestions,
    nextSteps,
    milestone: nextMilestone,
    hasActiveSuggestions: nextSteps.length > 0
  };
}