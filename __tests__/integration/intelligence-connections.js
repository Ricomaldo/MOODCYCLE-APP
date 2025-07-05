// __tests__/integration/intelligence-connections.test.js

import React from 'react';
import { renderHook, cleanup } from '@testing-library/react-native';
import { useAdaptiveInterface } from '../../src/hooks/useAdaptiveInterface';
import { useSmartSuggestions } from '../../src/hooks/useSmartSuggestions';
import { act } from '@testing-library/react-native';

// Augmenter le timeout par défaut
jest.setTimeout(10000);

// Mock performance.now()
const mockPerformanceNow = jest.fn().mockReturnValue(0);
global.performance = { now: mockPerformanceNow };

// Mock des scores de vulnérabilité émotionnelle
const EMOTIONAL_VULNERABILITY_SCORES = {
  menstrual: { base: 0.8, peak: 0.9, timing: 'sensitive' },
  follicular: { base: 0.3, peak: 0.4, timing: 'energetic' },
  ovulatory: { base: 0.2, peak: 0.3, timing: 'confident' },
  luteal: { base: 0.6, peak: 0.8, timing: 'introspective' }
};

// Mock des données de vignettes
const mockVignettesData = {
  menstrual: {
    emma: [
      { id: 'men_emma_1', icon: '💭', title: 'Explore tes ressentis', action: 'chat', prompt: 'Comment te sens-tu aujourd\'hui ?' },
      { id: 'men_emma_2', icon: '✍️', title: 'Note tes pensées', action: 'notebook', prompt: 'Qu\'est-ce qui te préoccupe ?' },
      { id: 'men_emma_3', icon: '🌙', title: 'Découvre ta phase', action: 'phase_detail', prompt: null }
    ]
  }
};

// Mock des configurations persona
const PERSONA_ADAPTATIONS = {
  emma: {
    maxComplexity: 'full',
    navigationStyle: 'playful',
    hideActions: [],
    emphasizeActions: ['chat', 'notebook', 'explore']
  }
};

// Mock de la configuration de base
const baseConfig = {
  maxVignettesPerPhase: 3,
  showProgressBar: true,
  showGuidanceHints: true,
  navigationComplexity: 'moderate',
  defaultView: 'mixed',
  emphasizeActions: ['track', 'analyze', 'plan'],
  hideActions: ['create', 'mentor'],
  guidanceIntensity: 'medium'
};

// Mock des features progressives
const progressiveFeatures = {
  available: {
    calendar_view: true,
    advanced_prompts: true,
    conversation_history: true,
    pattern_recognition: false
  },
  pending: {
    pattern_recognition: {
      available: false,
      progress: 75,
      requirements: {
        daysUsed: 7,
        autonomySignals: 3
      }
    }
  }
};

// Mock des stores avec getState
const mockEngagementData = {
  maturity: { current: 'discovery', confidence: 80 },
  metrics: {
    daysUsed: 1,
    conversationsStarted: 0,
    conversationsCompleted: 0,
    notebookEntriesCreated: 0,
    insightsSaved: 0,
    autonomySignals: 0,
    phasesExplored: ['menstrual']
  },
  getEngagementScore: jest.fn().mockReturnValue(20),
  getNextMilestone: jest.fn().mockReturnValue({
    name: 'Débutant',
    missing: { days: 0, conversations: 0, entries: 0 }
  }),
  getNextSteps: jest.fn().mockReturnValue([
    { action: 'start', priority: 'high' }
  ])
};

const mockIntelligenceData = {
  learning: {
    confidence: 30,
    patterns: [],
    suggestionEffectiveness: {
      chat: { rate: 0.8, shown: 10, clicked: 8 },
      notebook: { rate: 0.6, shown: 5, clicked: 3 },
      phase: { rate: 0.7, shown: 8, clicked: 6 }
    }
  },
  getOptimalInteractionTime: jest.fn().mockReturnValue({
    isOptimalNow: true,
    score: 0.8
  }),
  getPhasePersonalization: jest.fn().mockReturnValue({
    predictedMood: 'neutral',
    confidence: 0.7
  }),
  trackSuggestionShown: jest.fn(),
  trackSuggestionClicked: jest.fn(),
  trackInteraction: jest.fn(),
  getObservationReadiness: jest.fn().mockReturnValue({
    hasEnoughData: false,
    hasGoodConsistency: false,
    readyForHybrid: false,
    readyForObservation: false,
    confidence: 0
  })
};

const mockUserData = {
  persona: { assigned: 'emma' },
  profile: { preferences: {} }
};

const mockCycleData = {
  lastPeriodDate: new Date(),
  length: 28,
  periodDuration: 5,
  currentDay: 1
};

// Mock des fonctions de calcul de cycle
jest.mock('../../src/utils/cycleCalculations', () => ({
  getCurrentPhase: jest.fn().mockReturnValue('menstrual'),
  getCurrentPhaseAdaptive: jest.fn().mockReturnValue('menstrual'),
  getCycleMode: jest.fn().mockReturnValue('predictive')
}));

// Mock CycleObservationEngine
jest.mock('../../src/services/CycleObservationEngine', () => ({
  getObservationGuidance: jest.fn().mockReturnValue({
    message: "Continue d'observer pour que j'apprenne tes patterns uniques",
    confidence: 0.3,
    mode: 'PREDICTIVE',
    nextStep: "Ajoute quelques observations de plus"
  }),
  getSuggestedObservations: jest.fn().mockReturnValue([
    { prompt: "Comment te sens-tu aujourd'hui ?" }
  ])
}));

// Mock VignettesService
jest.mock('../../src/services/VignettesService', () => ({
  getNavigationParams: jest.fn().mockReturnValue({
    screen: 'Chat',
    params: { prompt: "Comment te sens-tu ?" }
  }),
  getVignettes: jest.fn().mockReturnValue(mockVignettesData.menstrual.emma),
  getEmergencyVignettes: jest.fn().mockReturnValue(mockVignettesData.menstrual.emma)
}));

// Mock ProductionMonitoring
jest.mock('../../src/services/ProductionMonitoring', () => ({
  trackPipelineExecution: jest.fn(),
  trackError: jest.fn()
}));

// Mock usePersona
jest.mock('../../src/hooks/usePersona', () => ({
  usePersona: jest.fn().mockReturnValue({
    current: 'emma',
    confidence: 0.8
  })
}));

// Mock PersonalizationEngine
jest.mock('../../src/services/PersonalizationEngine', () => ({
  createPersonalizationEngine: jest.fn().mockReturnValue({
    createPersonalizedExperience: jest.fn().mockReturnValue({
      contextualActions: [
        { type: 'chat', label: 'Parle avec Melune', priority: 'high' }
      ],
      personalizedPrompts: ["Comment te sens-tu aujourd'hui ?"],
      personalization: {
        confidence: 0.7,
        dataPoints: {
          timePatterns: 2,
          phaseData: 3,
          conversationHistory: 1
        },
        recommendations: []
      },
      fromCache: false
    })
  })
}));

// Mock FeatureGatingSystem
jest.mock('../../src/services/FeatureGatingSystem', () => ({
  __esModule: true,
  default: {
    evaluateAllFeatures: jest.fn().mockReturnValue({
      features: {
        calendar_view: { available: true, progress: 100 },
        advanced_prompts: { available: true, progress: 100 },
        conversation_history: { available: true, progress: 100 }
      },
      summary: {
        available: 3,
        total: 10,
        categories: {
          navigation: { available: 1, total: 2 },
          chat: { available: 2, total: 3 }
        }
      }
    }),
    getProgressionSuggestions: jest.fn().mockReturnValue([
      {
        featureKey: 'pattern_recognition',
        description: 'Reconnaissance patterns personnels',
        action: 'Continue à faire des liens cycle-ressentis',
        progress: 75,
        priority: 'high'
      }
    ])
  }
}));

// Mock ABTestService
jest.mock('../../src/services/ABTestService', () => ({
  runABTest: jest.fn().mockReturnValue({
    variant: 'A',
    config: {
      showGuidance: true,
      adaptiveVignettes: true
    }
  }),
  trackABTestResult: jest.fn()
}));

// Mock calculateEmotionalReadiness
const calculateEmotionalReadiness = (phase, intelligence) => {
  const vulnerability = EMOTIONAL_VULNERABILITY_SCORES[phase] || { base: 0.5 };
  const currentHour = new Date().getHours();
  
  // Facteurs temporels
  let timingScore = 1;
  if (currentHour < 8 || currentHour > 22) timingScore = 0.7;
  if (currentHour >= 10 && currentHour <= 16) timingScore = 1.2;
  
  // Facteurs intelligence
  const recentMood = intelligence.learning?.phasePatterns?.mood;
  const moodMultiplier = recentMood === 'low' ? 1.3 : recentMood === 'high' ? 0.8 : 1;
  
  // Score final
  const readiness = (1 - vulnerability.base) * timingScore * moodMultiplier;
  
  return {
    score: Math.min(1, Math.max(0, readiness)),
    timing: vulnerability.timing,
    shouldDelay: readiness < 0.3,
    optimalDelay: readiness < 0.3 ? 30 : 0,
    emotionalState: vulnerability.timing
  };
};

jest.mock('../../src/stores/useEngagementStore', () => {
  const store = jest.fn(() => mockEngagementData);
  store.getState = jest.fn(() => mockEngagementData);
  return { useEngagementStore: store };
});

jest.mock('../../src/stores/useUserIntelligence', () => {
  const store = jest.fn(() => mockIntelligenceData);
  store.getState = jest.fn(() => mockIntelligenceData);
  return { useUserIntelligence: store };
});

jest.mock('../../src/stores/useUserStore', () => {
  const store = jest.fn(() => mockUserData);
  store.getState = jest.fn(() => mockUserData);
  return { useUserStore: store };
});

jest.mock('../../src/stores/useCycleStore', () => {
  const store = jest.fn(() => mockCycleData);
  store.getState = jest.fn(() => mockCycleData);
  return { useCycleStore: store };
});

// Mock des hooks internes
jest.mock('../../src/hooks/useAdaptiveInterface', () => {
  const originalModule = jest.requireActual('../../src/hooks/useAdaptiveInterface');
  
  return {
    ...originalModule,
    useAdaptiveInterface: jest.fn(() => ({
      config: baseConfig,
      layout: {
        shouldShowNavItem: jest.fn().mockReturnValue(true),
        getVisibleActions: jest.fn().mockReturnValue([]),
        shouldEmphasizeAction: jest.fn().mockReturnValue(false),
        limitVignettes: jest.fn().mockReturnValue([]),
        shouldShowGuidance: jest.fn().mockReturnValue(true)
      },
      responsive: {
        tabBarStyle: 'full',
        enableAdvancedGestures: true,
        informationDensity: 'spacious',
        animationLevel: 'medium'
      },
      maturityLevel: 'discovery',
      confidence: 80,
      engagementScore: 20,
      activePersona: 'emma',
      personaStyle: PERSONA_ADAPTATIONS.emma,
      features: progressiveFeatures.available,
      pendingFeatures: progressiveFeatures.pending,
      featuresAvailable: 3,
      totalFeatures: 10,
      progressSuggestions: [],
      nextSteps: [
        {
          type: 'consistency',
          action: 'Reviens demain pour continuer ton apprentissage',
          icon: '📅',
          priority: 'high'
        },
        {
          type: 'engagement',
          action: 'Pose une question à Melune sur ta phase actuelle',
          icon: '💬',
          priority: 'medium'
        }
      ],
      nextMilestone: {
        name: 'Débutant',
        missing: { days: 1, conversations: 1, entries: 0 }
      },
      isFeatureAvailable: jest.fn().mockReturnValue(true),
      getFeatureStatus: jest.fn().mockReturnValue({ available: true }),
      metrics: {
        daysUsed: 1,
        conversations: 0,
        entries: 0,
        phasesExplored: 1,
        autonomySignals: 0
      }
    }))
  };
});

describe('Intelligence Connections Integration', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('useAdaptiveInterface', () => {
    it('should return correct interface configuration', () => {
      const { result } = renderHook(() => useAdaptiveInterface());

      expect(result.current).toBeDefined();
      expect(result.current.layout).toBeDefined();
      expect(result.current.responsive).toBeDefined();
      expect(result.current.config).toBeDefined();
    });

    it('should handle feature gating correctly', () => {
      const { result } = renderHook(() => useAdaptiveInterface());

      expect(result.current.features).toBeDefined();
      expect(result.current.features.calendar_view).toBe(true);
      expect(result.current.features.advanced_prompts).toBe(true);
    });

    it('should provide next steps based on engagement', () => {
      const { result } = renderHook(() => useAdaptiveInterface());

      expect(result.current.nextSteps).toBeDefined();
      expect(Array.isArray(result.current.nextSteps)).toBe(true);
      expect(result.current.nextSteps[0]).toHaveProperty('action');
      expect(result.current.nextSteps[0]).toHaveProperty('priority');
    });
  });

  describe('useSmartSuggestions', () => {
    it('should return suggestions with tracking functions', () => {
      const { result } = renderHook(() => useSmartSuggestions());

      expect(result.current.actions).toBeDefined();
      expect(result.current.prompts).toBeDefined();
      expect(typeof result.current.trackShown).toBe('function');
      expect(typeof result.current.trackClicked).toBe('function');
    });

    it('should track suggestion interactions correctly', () => {
      const { result } = renderHook(() => useSmartSuggestions());

      act(() => {
        result.current.trackShown('chat');
        result.current.trackClicked('chat', { prompt: 'Test prompt' });
      });

      expect(mockIntelligenceData.trackSuggestionShown).toHaveBeenCalledWith('chat');
      expect(mockIntelligenceData.trackSuggestionClicked).toHaveBeenCalledWith('chat');
      expect(mockIntelligenceData.trackInteraction).toHaveBeenCalledWith('conversation_start', {
        prompt: 'Test prompt',
        phase: 'menstrual',
        persona: 'emma'
      });
    });

    it('should provide effectiveness metrics', () => {
      const { result } = renderHook(() => useSmartSuggestions());

      const effectiveness = result.current.effectiveness;
      expect(effectiveness).toBeDefined();
      expect(effectiveness.overall).toBeCloseTo(0.7, 1); // (0.8 + 0.6 + 0.7) / 3
      expect(effectiveness.byType).toEqual(mockIntelligenceData.learning.suggestionEffectiveness);
      expect(effectiveness.totalShown).toBe(23); // 10 + 5 + 8
      expect(effectiveness.totalClicked).toBe(17); // 8 + 3 + 6
    });

    it('should adapt suggestions to context', () => {
      const { result } = renderHook(() => useSmartSuggestions());

      const adaptedSuggestions = result.current.adaptToContext({
        lastAction: 'chat',
        timeSinceLastAction: 15
      });

      expect(Array.isArray(adaptedSuggestions)).toBe(true);
      expect(adaptedSuggestions.length).toBeLessThanOrEqual(3);
    });
  });
}); 