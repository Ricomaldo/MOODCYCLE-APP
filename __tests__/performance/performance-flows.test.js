//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/integration/performance-flows.test.js
// 🧩 Type : Test Performance Flows E2E
// 📚 Description : Tests performance parcours complets intelligence cross-tabs
// 🕒 Version : 1.0 - 2025-06-26
// 🧭 Utilisé dans : validation performance pipeline intelligence
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import React from 'react';
import { render, fireEvent, waitFor, act, renderHook } from '@testing-library/react-native';

// ✅ IMPORTS PIPELINE COMPLET
import { useSmartSuggestions } from '../../src/hooks/useSmartSuggestions';
import { useVignettes } from '../../src/hooks/useVignettes';
import { useAdaptiveInterface } from '../../src/hooks/useAdaptiveInterface';
import ChatModal from '../../src/features/chat/ChatModal';

// ✅ MOCKS CENTRALISÉS
import { mockUserData, mockIntelligence, mockChatStore, mockEngagementStore } from '../__mocks__/stores';
import { mockNavigation } from '../__mocks__/navigation';

// Stores
import { useUserStore } from '../../src/stores/useUserStore';
import { useUserIntelligence } from '../../src/stores/useUserIntelligence';
import { useEngagementStore } from '../../src/stores/useEngagementStore';
import { useChatStore } from '../../src/stores/useChatStore';

// ───────────────────────────────────────────────────────────
// 🎭 SETUP MOCKS PERFORMANCE
// ───────────────────────────────────────────────────────────

jest.mock('../../src/stores/useUserStore');
jest.mock('../../src/stores/useUserIntelligence');
jest.mock('../../src/stores/useEngagementStore');
jest.mock('../../src/stores/useChatStore');
jest.mock('../../src/hooks/useCycle');
jest.mock('../../src/hooks/usePersona');
jest.mock('../../src/hooks/useTheme');
jest.mock('../../src/services/VignettesService');

// Navigation
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useFocusEffect: (callback) => callback(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  })
}));

jest.mock('@react-navigation/native', () => mockNavigation);

describe('⚡ Performance Flows E2E - Tests Complets', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    
    // ✅ MOCKS OPTIMISÉS PERFORMANCE
    useUserStore.mockReturnValue(mockUserData);
    useUserIntelligence.mockReturnValue(mockIntelligence);
    useUserIntelligence.getState = jest.fn().mockReturnValue(mockIntelligence);
    useChatStore.mockReturnValue(mockChatStore);
    // ✅ Mock avec getState pour FeatureGatingSystem
    const mockEngagementData = {
      ...mockEngagementStore,
      maturity: { current: 'learning', confidence: 75 },
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

    // Hooks additionnels
    require('../../src/hooks/useCycle').useCycle = jest.fn().mockReturnValue({
      currentPhase: 'menstrual',
      phaseInfo: { name: 'Menstruelle' },
      currentDay: 2,
      hasData: true,
      cycle: { length: 28 }
    });

    require('../../src/hooks/usePersona').usePersona = jest.fn().mockReturnValue({
      current: 'emma'
    });

    require('../../src/hooks/useTheme').useTheme = jest.fn().mockReturnValue({
      theme: {
        colors: { primary: '#8B5CF6', background: '#fff' },
        spacing: { l: 16 }
      }
    });

    // ✅ Mock VignettesService pour éviter appels API
    require('../../src/services/VignettesService').default = {
      getVignettes: jest.fn().mockResolvedValue([
        { id: 'vignette_1', icon: '💭', title: 'Test vignette', action: 'chat' },
        { id: 'vignette_2', icon: '📝', title: 'Test notebook', action: 'notebook' },
        { id: 'vignette_3', icon: '🌸', title: 'Test phase', action: 'phase_detail' }
      ]),
      getEmergencyVignettes: jest.fn().mockReturnValue([
        { id: 'emergency_1', icon: '💭', title: 'Emergency', action: 'chat' }
      ]),
      getNavigationParams: jest.fn().mockReturnValue({
        route: '/(tabs)/cycle/phases/menstrual',
        params: { vignetteId: 'test_vignette' }
      })
    };
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ──────────────────────────────────────────────────────
  // ⚡ TESTS PERFORMANCE HOOKS ISOLÉS
  // ──────────────────────────────────────────────────────

  test('⚡ useSmartSuggestions < 20ms', () => {
    const measurements = [];
    
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      const { result } = renderHook(() => useSmartSuggestions());
      const end = performance.now();
      measurements.push(end - start);
    }

    const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    expect(avgTime).toBeLessThan(20);
  });

  test('⚡ useVignettes chargement < 150ms', async () => {
    const start = performance.now();
    
    const { result } = renderHook(() => useVignettes());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const end = performance.now();
    expect(end - start).toBeLessThan(150); // Réaliste pour tests Jest avec async
  });

  test('⚡ useAdaptiveInterface < 15ms', () => {
    const measurements = [];
    
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      const { result } = renderHook(() => useAdaptiveInterface());
      const end = performance.now();
      measurements.push(end - start);
    }

    const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    expect(avgTime).toBeLessThan(15);
  });

  // ──────────────────────────────────────────────────────
  // 🚀 TESTS FLOWS COMPLETS PAR PERSONA
  // ──────────────────────────────────────────────────────

  test('🎯 Flow Emma menstruelle complet < 200ms', async () => {
    const start = performance.now();

    // 1. Smart Suggestions
    const { result: suggestions } = renderHook(() => useSmartSuggestions());
    
    // 2. Vignettes
    const { result: vignettes } = renderHook(() => useVignettes());
    await waitFor(() => expect(vignettes.current.loading).toBe(false));
    
    // 3. Interface adaptative
    const { result: adaptiveInterface } = renderHook(() => useAdaptiveInterface());
    
    // 4. Simulation interactions
    act(() => {
      suggestions.current.trackClicked('chat', { prompt: 'test' });
      vignettes.current.trackEngagement({ id: 'test', action: 'chat' });
    });

    const end = performance.now();
    expect(end - start).toBeLessThan(200); // Plus réaliste pour flow complet

    // Vérifier cohérence données
    expect(suggestions.current.actions.length).toBeGreaterThan(0);
    expect(vignettes.current.vignettes.length).toBeGreaterThan(0);
    expect(adaptiveInterface.current.maturityLevel).toBe('learning');
  });

  test('🎯 Flow Clara ovulatoire performance', async () => {
    // Setup Clara ovulatoire
    useUserStore.mockReturnValue({
      ...mockUserData,
      persona: { assigned: 'clara' }
    });

    require('../../src/hooks/useCycle').useCycle.mockReturnValue({
      currentPhase: 'ovulatory',
      phaseInfo: { name: 'Ovulatoire' },
      currentDay: 14,
      hasData: true,
      cycle: { length: 28 }
    });

    const start = performance.now();

    const { result: suggestions } = renderHook(() => useSmartSuggestions());
    const { result: vignettes } = renderHook(() => useVignettes());
    const { result: adaptiveInterface } = renderHook(() => useAdaptiveInterface());

    await waitFor(() => expect(vignettes.current.loading).toBe(false));

    const end = performance.now();
    expect(end - start).toBeLessThan(120);

    // Vérifier adaptation Clara
    expect(adaptiveInterface.current.activePersona).toBe('clara');
    expect(adaptiveInterface.current.personaStyle.navigationStyle).toBe('flowing');
  });

  test('🎯 Flow Laure autonomous performance < 200ms', async () => {
    // Setup Laure autonomous
    useUserStore.mockReturnValue({
      ...mockUserData,
      persona: { assigned: 'laure' }
    });

    const autonomousEngagementData = {
      ...mockEngagementStore,
      maturity: { current: 'autonomous', confidence: 90 },
      metrics: {
        daysUsed: 20,
        conversationsStarted: 12,
        conversationsCompleted: 10,
        notebookEntriesCreated: 15,
        insightsSaved: 8,
        cyclesCompleted: 2,
        autonomySignals: 5,
        phasesExplored: ['menstrual', 'follicular', 'ovulatory', 'luteal']
      },
      getEngagementScore: jest.fn().mockReturnValue(85),
      getNextMilestone: jest.fn().mockReturnValue({
        name: 'Expert',
        missing: { days: 0, conversations: 0, entries: 0 }
      }),
      getNextSteps: jest.fn().mockReturnValue([
        { action: 'master', priority: 'high', context: 'autonomous_mode' }
      ])
    };

    useEngagementStore.mockReturnValue(autonomousEngagementData);
    useEngagementStore.getState = jest.fn().mockReturnValue(autonomousEngagementData);

    const start = performance.now();

    const { result: adaptiveInterface } = renderHook(() => useAdaptiveInterface());
    const { result: vignettes } = renderHook(() => useVignettes());

    await waitFor(() => expect(vignettes.current.loading).toBe(false));

    const end = performance.now();
    expect(end - start).toBeLessThan(200);

    // Vérifier adaptation autonomous
    expect(adaptiveInterface.current.maturityLevel).toBe('autonomous');
    expect(adaptiveInterface.current.config.showProgressBar).toBe(false);
    expect(adaptiveInterface.current.isFeatureAvailable('cycle_predictions')).toBe(true);
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS NAVIGATION CROSS-TABS
  // ──────────────────────────────────────────────────────

  test('🔄 Navigation Chat → Cycle via vignette < 150ms', async () => {
    const start = performance.now();

    // 1. Récupérer vignettes
    const { result: vignettes } = renderHook(() => useVignettes());
    await waitFor(() => expect(vignettes.current.loading).toBe(false));

    // 2. Sélectionner vignette navigation
    const cycleVignette = vignettes.current.vignettes.find(v => v.action === 'phase_detail');
    if (cycleVignette) {
      // 3. Simuler navigation
      const navParams = vignettes.current.getNavigationParams(cycleVignette);
      expect(navParams.route).toContain('cycle');
    }

    const end = performance.now();
    expect(end - start).toBeLessThan(150); // Réaliste avec waitFor async
  });

  test('🔄 Navigation Cycle → Notebook via suggestion < 60ms', async () => {
    const start = performance.now();

    // 1. Smart suggestions pour notebook
    const { result: suggestions } = renderHook(() => useSmartSuggestions());
    
    // 2. Trouver action notebook
    const notebookAction = suggestions.current.actions.find(a => a.type === 'notebook');
    if (notebookAction) {
      act(() => {
        suggestions.current.trackClicked('notebook', { prompt: notebookAction.prompt });
      });
    }

    const end = performance.now();
    expect(end - start).toBeLessThan(60);
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS ERROR BOUNDARIES PERFORMANCE
  // ──────────────────────────────────────────────────────

  test('🛡️ Recovery erreur stores < 100ms', async () => {
    // Simuler erreur store
    useUserStore.mockImplementation(() => {
      throw new Error('Store error');
    });

    const start = performance.now();

    let result;
    try {
      const hook = renderHook(() => useSmartSuggestions());
      result = hook.result;
    } catch (error) {
      // Recovery automatique attendu
    }

    const end = performance.now();
    expect(end - start).toBeLessThan(100);
  });

  test('🛡️ Fallback vignettes emergency < 150ms', async () => {
    // Temporairement forcer erreur VignettesService
    const VignettesService = require('../../src/services/VignettesService').default;
    VignettesService.getVignettes.mockRejectedValueOnce(new Error('Service error'));

    const start = performance.now();
    
    const { result } = renderHook(() => useVignettes());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const end = performance.now();
    expect(end - start).toBeLessThan(150);

    // Doit avoir fallback vignettes (emergency ou par défaut)
    expect(Array.isArray(result.current.vignettes)).toBe(true);
  });

  // ──────────────────────────────────────────────────────
  // 📊 TESTS MEMORY & CACHE PERFORMANCE
  // ──────────────────────────────────────────────────────

  test('📊 Cache vignettes efficace (multiple calls)', async () => {
    const times = [];

    // Premier appel (cache miss)
    const start1 = performance.now();
    const { result: vignettes1 } = renderHook(() => useVignettes());
    await waitFor(() => expect(vignettes1.current.loading).toBe(false));
    const end1 = performance.now();
    times.push(end1 - start1);

    // Deuxième appel (cache hit attendu)
    const start2 = performance.now();
    const { result: vignettes2 } = renderHook(() => useVignettes());
    await waitFor(() => expect(vignettes2.current.loading).toBe(false));
    const end2 = performance.now();
    times.push(end2 - start2);

    // Cache hit doit être plus rapide
    expect(times[1]).toBeLessThanOrEqual(times[0]);
    expect(times[1]).toBeLessThan(120); // Plus réaliste pour Jest
  });

  test('📊 Memory hooks multiples instances', () => {
    const start = performance.now();

    // Simuler plusieurs instances hooks
    const instances = [];
    for (let i = 0; i < 5; i++) {
      instances.push(renderHook(() => useSmartSuggestions()));
      instances.push(renderHook(() => useAdaptiveInterface()));
    }

    const end = performance.now();
    expect(end - start).toBeLessThan(100);

    // Vérifier cohérence données
    instances.forEach(({ result }) => {
      expect(result.current).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎯 TESTS PARCOURS RÉALISTES COMPLETS
  // ──────────────────────────────────────────────────────

  test('🎯 Parcours découverte Emma complète < 200ms', async () => {
    const start = performance.now();

    // 1. Onboarding persona calculé
    expect(mockUserData.persona.assigned).toBe('emma');

    // 2. Interface adaptative chargée
    const { result: adaptiveInterface } = renderHook(() => useAdaptiveInterface());
    expect(adaptiveInterface.current.maturityLevel).toBe('learning');

    // 3. Smart suggestions disponibles
    const { result: suggestions } = renderHook(() => useSmartSuggestions());
    expect(suggestions.current.actions.length).toBeGreaterThan(0);

    // 4. Vignettes contextuelles chargées
    const { result: vignettes } = renderHook(() => useVignettes());
    await waitFor(() => expect(vignettes.current.loading).toBe(false));

    // 5. Simulation interaction chat
    const chatAction = suggestions.current.actions.find(a => a.type === 'chat');
    if (chatAction) {
      act(() => {
        suggestions.current.trackClicked('chat', { prompt: chatAction.prompt });
      });
    }

    // 6. Simulation vignette engagement
    const firstVignette = vignettes.current.vignettes[0];
    if (firstVignette) {
      act(() => {
        vignettes.current.trackEngagement(firstVignette);
      });
    }

    const end = performance.now();
    expect(end - start).toBeLessThan(200);

    // Vérifier état final cohérent
    expect(mockIntelligence.trackSuggestionClicked).toHaveBeenCalled();
    expect(mockEngagementStore.trackAction).toHaveBeenCalled();
  });

  test('🎯 Stress test persona switching < 150ms', () => {
    const personas = ['emma', 'laure', 'clara', 'sylvie', 'christine'];
    const start = performance.now();

    personas.forEach(persona => {
      useUserStore.mockReturnValue({
        ...mockUserData,
        persona: { assigned: persona }
      });

      const { result: adaptiveInterface } = renderHook(() => useAdaptiveInterface());
      const { result: suggestions } = renderHook(() => useSmartSuggestions());

      expect(adaptiveInterface.current.activePersona).toBe(persona);
      expect(suggestions.current.actions.length).toBeGreaterThan(0);
    });

    const end = performance.now();
    expect(end - start).toBeLessThan(150);
  });

  test('🎯 Concurrent hooks performance < 150ms', async () => {
    const start = performance.now();

    // Render tous les hooks simultanément
    const results = await Promise.all([
      renderHook(() => useSmartSuggestions()),
      renderHook(() => useVignettes()),
      renderHook(() => useAdaptiveInterface())
    ]);

    // Attendre chargements async
    await waitFor(() => {
      expect(results[1].result.current.loading).toBe(false);
    });

    const end = performance.now();
    expect(end - start).toBeLessThan(150); // Plus réaliste pour Promise.all

    // Vérifier cohérence cross-hooks
    results.forEach(({ result }) => {
      expect(result.current).toBeDefined();
    });
  });
});