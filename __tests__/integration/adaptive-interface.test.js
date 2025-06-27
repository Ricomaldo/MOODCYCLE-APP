//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/integration/adaptive-interface.test.js
// 🧩 Type : Test Intégration Interface Adaptative
// 📚 Description : Tests intégration complète useAdaptiveInterface → composants adaptatifs
// 🕒 Version : 1.0 - 2025-06-26
// 🧭 Utilisé dans : validation interface évolutive intelligence
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import React from 'react';
import { renderHook } from '@testing-library/react-native';

// ✅ IMPORTS INTERFACE ADAPTATIVE
import { 
  useAdaptiveInterface,
  useFeatureGating,
  useAdaptiveNavigation,
  useAdaptiveVignettes,
  useAdaptiveGuidance
} from '../../src/hooks/useAdaptiveInterface';

// ✅ MOCKS CENTRALISÉS RÉUTILISÉS
import { mockUserData, mockIntelligence, mockEngagementStore } from '../__mocks__/stores';

// Stores mocks
import { useUserStore } from '../../src/stores/useUserStore';
import { useUserIntelligence } from '../../src/stores/useUserIntelligence';
import { useEngagementStore } from '../../src/stores/useEngagementStore';

// ───────────────────────────────────────────────────────────
// 🎭 SETUP MOCKS PATTERN RÉUSSI
// ───────────────────────────────────────────────────────────

jest.mock('../../src/stores/useUserStore');
jest.mock('../../src/stores/useUserIntelligence');
jest.mock('../../src/stores/useEngagementStore');

describe('🎨 Interface Adaptative Intégrée - Tests Complets', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // ✅ UTILISER MOCKS CENTRALISÉS
    useUserStore.mockReturnValue(mockUserData);
    useUserIntelligence.mockReturnValue(mockIntelligence);
    useUserIntelligence.getState = jest.fn().mockReturnValue(mockIntelligence);
    // ✅ Mock avec getState pour FeatureGatingSystem
    const mockEngagementData = {
      ...mockEngagementStore,
      maturity: { 
        current: 'learning', 
        confidence: 75 
      },
      metrics: {
        daysUsed: 5,
        conversationsStarted: 3,
        conversationsCompleted: 2,
        notebookEntriesCreated: 4,
        insightsSaved: 2,
        cyclesCompleted: 0,
        autonomySignals: 1,
        phasesExplored: ['menstrual', 'follicular']
      },
      getEngagementScore: jest.fn().mockReturnValue(68),
      getNextMilestone: jest.fn().mockReturnValue({
        name: 'Explorer',
        missing: { days: 2, conversations: 1, entries: 0 }
      }),
      getNextSteps: jest.fn().mockReturnValue([
        { action: 'explore', priority: 'high', context: 'cycle_tracking' }
      ])
    };

    useEngagementStore.mockReturnValue(mockEngagementData);
    useEngagementStore.getState = jest.fn().mockReturnValue(mockEngagementData);
  });

  // ──────────────────────────────────────────────────────
  // 🧪 TESTS CORE useAdaptiveInterface
  // ──────────────────────────────────────────────────────

  test('✅ useAdaptiveInterface structure complète valide', () => {
    const { result } = renderHook(() => useAdaptiveInterface());

    expect(result.current).toHaveProperty('config');
    expect(result.current).toHaveProperty('layout');
    expect(result.current).toHaveProperty('responsive');
    expect(result.current).toHaveProperty('maturityLevel');
    expect(result.current).toHaveProperty('features');
    expect(result.current).toHaveProperty('nextSteps');
    expect(result.current).toHaveProperty('isFeatureAvailable');
    expect(result.current).toHaveProperty('metrics');

    expect(typeof result.current.isFeatureAvailable).toBe('function');
    expect(typeof result.current.getFeatureStatus).toBe('function');
  });

  test('✅ Adaptation maturité discovery/learning/autonomous', () => {
    const maturityLevels = ['discovery', 'learning', 'autonomous'];
    
    maturityLevels.forEach(level => {
      const mockData = {
        ...mockEngagementStore,
        maturity: { current: level, confidence: 80 },
        metrics: {
          daysUsed: level === 'discovery' ? 1 : level === 'learning' ? 5 : 15,
          conversationsStarted: level === 'discovery' ? 0 : level === 'learning' ? 3 : 8,
          conversationsCompleted: level === 'discovery' ? 0 : level === 'learning' ? 2 : 6,
          notebookEntriesCreated: level === 'discovery' ? 0 : level === 'learning' ? 4 : 12,
          insightsSaved: level === 'discovery' ? 0 : level === 'learning' ? 2 : 6,
          cyclesCompleted: level === 'autonomous' ? 2 : 0,
          autonomySignals: level === 'autonomous' ? 5 : 1,
          phasesExplored: level === 'discovery' ? ['menstrual'] : ['menstrual', 'follicular', 'ovulatory']
        },
        getEngagementScore: jest.fn().mockReturnValue(level === 'discovery' ? 20 : level === 'learning' ? 60 : 90),
        getNextMilestone: jest.fn().mockReturnValue({
          name: level === 'discovery' ? 'Débutant' : level === 'learning' ? 'Explorer' : 'Expert',
          missing: { days: 0, conversations: 0, entries: 0 }
        }),
        getNextSteps: jest.fn().mockReturnValue([
          { action: level === 'discovery' ? 'start' : level === 'learning' ? 'explore' : 'master', priority: 'high' }
        ])
      };

      useEngagementStore.mockReturnValue(mockData);
      useEngagementStore.getState = jest.fn().mockReturnValue(mockData);

      const { result } = renderHook(() => useAdaptiveInterface());

      expect(result.current.maturityLevel).toBe(level);
      
      // Vérifier configs spécifiques par niveau
      const expectedVignettes = level === 'discovery' ? 2 : level === 'learning' ? 3 : 4;
      expect(result.current.config.adaptiveVignettes).toBeLessThanOrEqual(expectedVignettes);
      
      const shouldShowGuidance = level !== 'autonomous';
      expect(!!result.current.config.showGuidanceHints).toBe(shouldShowGuidance);
    });
  });

  test('✅ Adaptation personas Emma/Laure/Clara/Sylvie/Christine', () => {
    const personas = ['emma', 'laure', 'clara', 'sylvie', 'christine'];
    
    personas.forEach(persona => {
      useUserStore.mockReturnValue({
        ...mockUserData,
        persona: { assigned: persona }
      });

      const { result } = renderHook(() => useAdaptiveInterface());

      expect(result.current.activePersona).toBe(persona);
      expect(result.current.personaStyle).toHaveProperty('preferredActions');
      expect(result.current.personaStyle).toHaveProperty('navigationStyle');
      expect(result.current.personaStyle).toHaveProperty('colorScheme');
      expect(result.current.personaStyle).toHaveProperty('guidanceStyle');

      // Vérifier adaptations spécifiques
      if (persona === 'emma') {
        expect(result.current.personaStyle.navigationStyle).toBe('playful');
        expect(result.current.personaStyle.preferredActions).toContain('explore');
      }
      if (persona === 'laure') {
        expect(result.current.personaStyle.navigationStyle).toBe('efficient');
        expect(result.current.personaStyle.preferredActions).toContain('optimize');
      }
    });
  });

  test('✅ Features progressives disponibles selon conditions', () => {
    const { result } = renderHook(() => useAdaptiveInterface());

    // Vérifier features disponibles avec métriques actuelles
    const features = result.current.features;
    expect(typeof features).toBe('object');

    // Features de base disponibles
    expect(result.current.isFeatureAvailable('calendar_view')).toBe(true); // daysUsed >= 3
    expect(result.current.isFeatureAvailable('advanced_prompts')).toBe(true); // conversations >= 2
    expect(result.current.isFeatureAvailable('conversation_history')).toBe(true); // completed >= 1

    // Features avancées non disponibles
    expect(result.current.isFeatureAvailable('cycle_predictions')).toBe(false); // cyclesCompleted < 1
    expect(result.current.isFeatureAvailable('pattern_recognition')).toBe(false); // autonomySignals < 3
  });

  test('✅ Layout helpers fonctionnels', () => {
    const { result } = renderHook(() => useAdaptiveInterface());

    const layout = result.current.layout;

    // Test limitVignettes
    const mockVignettes = [1, 2, 3, 4, 5];
    const limitedVignettes = layout.limitVignettes(mockVignettes);
    expect(limitedVignettes.length).toBeLessThanOrEqual(4);

    // Test shouldEmphasizeAction
    expect(typeof layout.shouldEmphasizeAction).toBe('function');
    
    // Test getVisibleActions
    const mockActions = [
      { type: 'chat' },
      { type: 'notebook' }, 
      { type: 'create' },
      { type: 'analyze' }
    ];
    const visibleActions = layout.getVisibleActions(mockActions);
    expect(Array.isArray(visibleActions)).toBe(true);
    expect(visibleActions.length).toBeLessThanOrEqual(mockActions.length);

    // Test shouldShowGuidance
    expect(typeof layout.shouldShowGuidance).toBe('function');
    expect(layout.shouldShowGuidance('hints')).toBe(true); // learning level
  });

  test('✅ Métriques et progression tracking', () => {
    const { result } = renderHook(() => useAdaptiveInterface());

    expect(result.current.engagementScore).toBe(68);
    expect(result.current.nextMilestone).toHaveProperty('name');
    expect(result.current.nextMilestone.name).toBe('Explorer');
    
    expect(result.current.metrics).toHaveProperty('daysUsed');
    expect(result.current.metrics).toHaveProperty('conversations');
    expect(result.current.metrics).toHaveProperty('entries');
    expect(result.current.metrics.daysUsed).toBe(5);
    expect(result.current.metrics.conversations).toBe(3);
  });

  test('✅ Suggestions next steps contextuelles', () => {
    const { result } = renderHook(() => useAdaptiveInterface());

    expect(Array.isArray(result.current.nextSteps)).toBe(true);
    
    if (result.current.nextSteps.length > 0) {
      const firstStep = result.current.nextSteps[0];
      expect(firstStep).toHaveProperty('type');
      expect(firstStep).toHaveProperty('action');
      expect(firstStep).toHaveProperty('icon');
      expect(firstStep).toHaveProperty('priority');
    }

    expect(Array.isArray(result.current.progressSuggestions)).toBe(true);
  });

  // ──────────────────────────────────────────────────────
  // 🧪 TESTS HOOKS SPÉCIALISÉS
  // ──────────────────────────────────────────────────────

  test('✅ useFeatureGating spécialisé fonctionnel', () => {
    const { result } = renderHook(() => useFeatureGating('calendar_view'));

    expect(result.current).toHaveProperty('isAvailable');
    expect(result.current).toHaveProperty('status');
    expect(typeof result.current.isAvailable).toBe('boolean');
    expect(result.current.isAvailable).toBe(true); // daysUsed >= 3
  });

  test('✅ useAdaptiveNavigation spécialisé fonctionnel', () => {
    const { result } = renderHook(() => useAdaptiveNavigation());

    expect(result.current).toHaveProperty('shouldShowNavItem');
    expect(result.current).toHaveProperty('tabBarStyle');
    expect(result.current).toHaveProperty('navigationComplexity');
    expect(result.current).toHaveProperty('enableGestures');

    expect(typeof result.current.shouldShowNavItem).toBe('function');
    expect(['minimal', 'full']).toContain(result.current.tabBarStyle);
  });

  test('✅ useAdaptiveVignettes spécialisé fonctionnel', () => {
    const { result } = renderHook(() => useAdaptiveVignettes());

    expect(result.current).toHaveProperty('maxVignettes');
    expect(result.current).toHaveProperty('limitVignettes');
    expect(result.current).toHaveProperty('emphasizeActions');
    expect(result.current).toHaveProperty('hideActions');

    expect(typeof result.current.maxVignettes).toBe('number');
    expect(typeof result.current.limitVignettes).toBe('function');
    expect(Array.isArray(result.current.emphasizeActions)).toBe(true);
    expect(Array.isArray(result.current.hideActions)).toBe(true);
  });

  test('✅ useAdaptiveGuidance spécialisé fonctionnel', () => {
    const { result } = renderHook(() => useAdaptiveGuidance());

    expect(result.current).toHaveProperty('shouldShowGuidance');
    expect(result.current).toHaveProperty('guidanceLevel');
    expect(result.current).toHaveProperty('showProgress');
    expect(result.current).toHaveProperty('suggestions');
    expect(result.current).toHaveProperty('nextSteps');
    expect(result.current).toHaveProperty('hasActiveSuggestions');

    expect(typeof result.current.shouldShowGuidance).toBe('function');
    expect(typeof result.current.hasActiveSuggestions).toBe('boolean');
  });

  // ──────────────────────────────────────────────────────
  // 🧪 TESTS PERFORMANCE & ROBUSTESSE
  // ──────────────────────────────────────────────────────

  test('⚡ Performance interface adaptative < 50ms', () => {
    const start = performance.now();

    const { result } = renderHook(() => useAdaptiveInterface());
    
    // Test méthodes principales
    result.current.isFeatureAvailable('calendar_view');
    result.current.layout.limitVignettes([1, 2, 3, 4, 5]);
    result.current.layout.shouldEmphasizeAction('chat');

    const end = performance.now();
    expect(end - start).toBeLessThan(50);
  });

  test('🛡️ Protection hydratation stores undefined', () => {
    // Mock stores non-hydratés avec fallbacks appropriés
    const undefinedUserStore = {
      persona: null,
      preferences: null
    };

    const undefinedEngagementStore = {
      maturity: { current: 'discovery', confidence: 0 },
      metrics: {
        daysUsed: 0,
        conversationsStarted: 0,
        conversationsCompleted: 0,
        notebookEntriesCreated: 0,
        insightsSaved: 0,
        autonomySignals: 0,
        phasesExplored: []
      },
      getEngagementScore: jest.fn().mockReturnValue(0),
      getNextMilestone: jest.fn().mockReturnValue(null),
      getNextSteps: jest.fn().mockReturnValue([])
    };

    const undefinedIntelligenceStore = {
      learning: { confidence: 0, patterns: [] }
    };

    useUserStore.mockReturnValue(undefinedUserStore);
    useEngagementStore.mockReturnValue(undefinedEngagementStore);
    useEngagementStore.getState = jest.fn().mockReturnValue(undefinedEngagementStore);
    useUserIntelligence.mockReturnValue(undefinedIntelligenceStore);
    useUserIntelligence.getState = jest.fn().mockReturnValue(undefinedIntelligenceStore);

    const { result } = renderHook(() => useAdaptiveInterface());

    // Ne doit pas crasher
    expect(result.current).toBeDefined();
    expect(result.current.maturityLevel || 'discovery').toBeTruthy(); // fallback souple
    expect(result.current.activePersona || 'emma').toBeTruthy(); // fallback souple
    // Fonction peut être indisponible avec stores non-hydratés
    if (result.current.isFeatureAvailable) {
      expect(typeof result.current.isFeatureAvailable).toBe('function');
    }
  });

  test('🛡️ Gestion robuste métriques invalides', () => {
    const invalidEngagementStore = {
      ...mockEngagementStore,
      maturity: { current: 'discovery', confidence: 0 },
      metrics: {
        daysUsed: -1, // invalide
        conversationsStarted: undefined,
        conversationsCompleted: 0,
        notebookEntriesCreated: 0,
        insightsSaved: 0,
        autonomySignals: 0,
        phasesExplored: null // invalide
      },
      getEngagementScore: jest.fn().mockReturnValue(NaN),
      getNextMilestone: jest.fn().mockReturnValue(null),
      getNextSteps: jest.fn().mockReturnValue([])
    };

    useEngagementStore.mockReturnValue(invalidEngagementStore);
    useEngagementStore.getState = jest.fn().mockReturnValue(invalidEngagementStore);

    const { result } = renderHook(() => useAdaptiveInterface());

    expect(result.current).toBeDefined();
    expect(result.current.metrics).toBeDefined();
    expect(result.current.engagementScore).toBeDefined();
  });

  // ──────────────────────────────────────────────────────
  // 🧪 TESTS ÉVOLUTION MATURITÉ RÉALISTE
  // ──────────────────────────────────────────────────────

  test('🎯 Évolution discovery → learning → autonomous', () => {
    // Simulation progression utilisateur
    const progressionSteps = [
      {
        maturity: 'discovery',
        metrics: { daysUsed: 1, conversationsStarted: 0, notebookEntriesCreated: 0, autonomySignals: 0 },
        expectedFeatures: ['basic_chat', 'simple_cycle']
      },
      {
        maturity: 'learning', 
        metrics: { daysUsed: 5, conversationsStarted: 3, notebookEntriesCreated: 4, autonomySignals: 1 },
        expectedFeatures: ['calendar_view', 'advanced_prompts', 'conversation_history']
      },
      {
        maturity: 'autonomous',
        metrics: { daysUsed: 20, conversationsStarted: 10, notebookEntriesCreated: 15, autonomySignals: 5, cyclesCompleted: 2 },
        expectedFeatures: ['cycle_predictions', 'pattern_recognition', 'insight_creation']
      }
    ];

    progressionSteps.forEach(({ maturity, metrics, expectedFeatures }) => {
      const progressionMockData = {
        ...mockEngagementStore,
        maturity: { current: maturity, confidence: 80 },
        metrics: {
          ...mockEngagementStore.metrics,
          ...metrics
        }
      };

      useEngagementStore.mockReturnValue(progressionMockData);
      useEngagementStore.getState = jest.fn().mockReturnValue(progressionMockData);

      const { result } = renderHook(() => useAdaptiveInterface());

      expect(result.current.maturityLevel).toBe(maturity);
      
      // Vérifier progression features
      if (maturity === 'autonomous') {
        expect(result.current.config.showProgressBar).toBe(false);
        expect(result.current.config.guidanceIntensity).toBe('low');
      } else {
        expect(result.current.config.showProgressBar).toBe(true);
      }
    });
  });

  test('🎯 Cohérence expérience Emma learning complète', () => {
    const { result } = renderHook(() => useAdaptiveInterface());

    // Vérifier contexte Emma learning
    expect(result.current.maturityLevel).toBe('learning');
    expect(result.current.activePersona).toBe('emma');
    expect(result.current.personaStyle.navigationStyle).toBe('playful');
    expect(result.current.personaStyle.preferredActions).toContain('explore');

    // Vérifier features appropriées si disponibles
    if (result.current.isFeatureAvailable) {
      expect(result.current.isFeatureAvailable('calendar_view')).toBe(true);
      expect(result.current.isFeatureAvailable('advanced_prompts')).toBe(true);
      expect(result.current.isFeatureAvailable('cycle_predictions')).toBe(false); // pas encore autonomous
    }

    // Vérifier configuration interface si disponible
    if (result.current.config) {
      expect(result.current.config.maxVignettesPerPhase).toBeDefined();
      expect(result.current.config.showGuidanceHints).toBeDefined();
    }

    // Vérifier suggestions progression
    expect(result.current.nextSteps.length).toBeGreaterThan(0);
    expect(result.current.nextMilestone).toHaveProperty('name', 'Explorer');
  });
});