//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/integration/revelations-empathy.test.js
// 🧩 Type : Test Intégration Révélations & Empathie Temporelle
// 📚 Description : Tests intégration système révélations personnelles + empathie temporelle
// 🕒 Version : 1.0 - 2025-01-27
// 🧭 Utilisé dans : validation révélations + timing émotionnel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import React from 'react';
import { render, fireEvent, waitFor, act, renderHook } from '@testing-library/react-native';

// ✅ IMPORTS CORRECTS depuis __tests__/integration/
import { usePersonalizedInsight } from '../../src/hooks/usePersonalizedInsight';
import { useSmartSuggestions } from '../../src/hooks/useSmartSuggestions';
import { createAdaptiveGuidance } from '../../src/services/AdaptiveGuidance';
import InsightCard from '../../src/features/insights/InsightCard';

// ✅ MOCKS CENTRALISÉS
import { mockUserData, mockIntelligence } from '../__mocks__/stores';
import { mockNavigation } from '../__mocks__/navigation';

// Stores mocks
import { useUserStore } from '../../src/stores/useUserStore';
import { useUserIntelligence } from '../../src/stores/useUserIntelligence';
import { useCycleStore } from '../../src/stores/useCycleStore';

// ───────────────────────────────────────────────────────────
// 🎭 SETUP MOCKS
// ───────────────────────────────────────────────────────────

jest.mock('../../src/stores/useUserStore');
jest.mock('../../src/stores/useUserIntelligence');
jest.mock('../../src/stores/useCycleStore');
jest.mock('../../src/hooks/usePersona');
jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        text: '#1f2937',
        textLight: '#6b7280',
        surface: '#f9fafb',
        border: '#e5e7eb',
        phases: {
          menstrual: '#ec4899',
          follicular: '#10b981',
          ovulatory: '#f59e0b',
          luteal: '#8b5cf6'
        }
      },
      spacing: { xs: 4, s: 8, m: 16, l: 24 },
      borderRadius: { medium: 8, large: 12 },
      glassmorphism: {
        opacity: {
          medium: 0.1,
          accent: 0.2
        }
      },
      getPhaseGlassmorphismStyle: jest.fn(() => ({})),
      getGlassmorphismStyle: jest.fn(() => ({})),
      getActionGlassmorphismStyle: jest.fn(() => ({})),
      fonts: { body: 'System' }
    }
  })
}));

// Navigation
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useFocusEffect: (callback) => callback(),
}));

jest.mock('@react-navigation/native', () => mockNavigation);

describe('✨ Révélations Personnelles & Empathie Temporelle - Tests Intégration', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // ✅ UTILISER MOCKS CENTRALISÉS
    useUserStore.mockReturnValue(mockUserData.useUserStore());
    useUserIntelligence.mockReturnValue(mockIntelligence);

    // Mock cycle store
    useCycleStore.mockReturnValue({
      lastPeriodDate: new Date().toISOString(),
      length: 28,
      periodDuration: 5,
      currentPhase: 'menstrual',
      currentDay: 2,
      hasData: true
    });

    // Mock persona
    require('../../src/hooks/usePersona').usePersona = jest.fn().mockReturnValue({
      current: 'emma'
    });
  });

  // ──────────────────────────────────────────────────────
  // 🧪 TESTS RÉVÉLATIONS PERSONNELLES
  // ──────────────────────────────────────────────────────

  test('✅ usePersonalizedInsight avec révélations activées', () => {
    const { result } = renderHook(() => usePersonalizedInsight({
      enableRevelation: true,
      enrichWithContext: true
    }));

    expect(result.current).toHaveProperty('revelationLevel');
    expect(result.current).toHaveProperty('hasPersonalizedElements');
    expect(result.current).toHaveProperty('intelligenceAnalysis');
    expect(result.current).toHaveProperty('insight');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refresh');

    expect(typeof result.current.revelationLevel).toBe('number');
    expect(typeof result.current.hasPersonalizedElements).toBe('boolean');
    expect(typeof result.current.intelligenceAnalysis).toBe('object');
  });

  test('✅ InsightCard affiche indicateur révélations selon niveau', () => {
    const mockInsight = {
      content: "Test insight personnalisé",
      revelationLevel: 2,
      hasPersonalizedElements: true
    };

    const { getByText } = render(
      <InsightCard 
        insight={mockInsight}
        phase="menstrual"
        source="personalized"
      />
    );

    // Vérifier que l'indicateur de révélation est présent
    expect(getByText('Personnalisé')).toBeTruthy();
  });

  test('✅ InsightCard avec révélation ultra-personnalisée', () => {
    const mockInsight = {
      content: "Test insight ultra-personnalisé",
      revelationLevel: 3,
      hasPersonalizedElements: true
    };

    const { getByText } = render(
      <InsightCard 
        insight={mockInsight}
        phase="ovulatory"
        source="personalized"
      />
    );

    // Vérifier l'indicateur "Ultra personnalisé"
    expect(getByText('Ultra personnalisé')).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────
  // 🧪 TESTS EMPATHIE TEMPORELLE
  // ──────────────────────────────────────────────────────

  test('✅ useSmartSuggestions avec empathie temporelle', () => {
    const { result } = renderHook(() => useSmartSuggestions());

    expect(result.current).toHaveProperty('actions');
    expect(result.current).toHaveProperty('prompts');
    expect(result.current).toHaveProperty('confidence');

    // Vérifier que les actions ont des propriétés d'empathie temporelle
    if (result.current.actions.length > 0) {
      const action = result.current.actions[0];
      expect(action).toHaveProperty('emotionalTiming');
      expect(action).toHaveProperty('softLaunch');
      expect(typeof action.emotionalTiming).toBe('string');
      expect(typeof action.softLaunch).toBe('boolean');
    }
  });

  test('✅ Calcul vulnérabilité émotionnelle par phase', () => {
    const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
    
    phases.forEach(phase => {
      useCycleStore.mockReturnValue({
        lastPeriodDate: new Date().toISOString(),
        length: 28,
        periodDuration: 5,
        currentPhase: phase,
        currentDay: 2,
        hasData: true
      });

      const { result } = renderHook(() => useSmartSuggestions());

      // Vérifier que les actions sont adaptées selon la phase
      if (result.current.actions.length > 0) {
        const action = result.current.actions[0];
        expect(action).toHaveProperty('emotionalTiming');
        expect(['sensitive', 'energetic', 'confident', 'introspective']).toContain(
          action.emotionalTiming
        );
      }
    });
  });

  test('✅ Adaptation suggestions selon disponibilité émotionnelle', () => {
    // Mock intelligence avec humeur basse pour tester délai
    const mockIntelligenceWithLowMood = {
      ...mockIntelligence,
      learning: {
        ...mockIntelligence.learning,
        phasePatterns: {
          menstrual: { topics: ['repos'], mood: 'low' }
        }
      }
    };
    useUserIntelligence.mockReturnValue(mockIntelligenceWithLowMood);

    const { result } = renderHook(() => useSmartSuggestions());

    // Vérifier que les actions ont des propriétés d'empathie temporelle
    result.current.actions.forEach(action => {
      expect(action).toHaveProperty('emotionalTiming');
      expect(action).toHaveProperty('softLaunch');
      expect(typeof action.emotionalTiming).toBe('string');
      expect(typeof action.softLaunch).toBe('boolean');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🧪 TESTS MESSAGES EMPATHIQUES
  // ──────────────────────────────────────────────────────

  test('✅ AdaptiveGuidance génère messages empathiques', () => {
    const guidance = createAdaptiveGuidance(
      mockUserData.useUserStore(),
      { maturity: { current: 'discovery' } },
      'menstrual'
    );

    const message = guidance.generateContextualMessage(
      'emma',
      'discovery',
      'suggestion',
      { 
        phase: 'menstrual',
        emotionalReadiness: { score: 0.2, timing: 'sensitive' }
      }
    );

    expect(typeof message).toBe('string');
    expect(message.length).toBeGreaterThan(10);
  });

  test('✅ Messages empathiques adaptés par phase', () => {
    const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
    
    phases.forEach(phase => {
      const guidance = createAdaptiveGuidance(
        mockUserData.useUserStore(),
        { maturity: { current: 'discovery' } },
        phase
      );

      const message = guidance.generateContextualMessage(
        'emma',
        'discovery',
        'suggestion',
        { 
          phase,
          emotionalReadiness: { score: 0.3, timing: 'sensitive' }
        }
      );

      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(10);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🧪 TESTS INTÉGRATION COMPLÈTE
  // ──────────────────────────────────────────────────────

  test('✅ Parcours complet : révélations + empathie + messages', () => {
    // 1. Insight avec révélations
    const { result: insightResult } = renderHook(() => usePersonalizedInsight({
      enableRevelation: true,
      enrichWithContext: true
    }));

    expect(insightResult.current.revelationLevel).toBeGreaterThanOrEqual(0);
    expect(typeof insightResult.current.hasPersonalizedElements).toBe('boolean');

    // 2. Suggestions avec empathie
    const { result: suggestionsResult } = renderHook(() => useSmartSuggestions());

    expect(suggestionsResult.current.actions.length).toBeGreaterThan(0);
    expect(suggestionsResult.current.actions[0]).toHaveProperty('emotionalTiming');

    // 3. Messages adaptatifs
    const guidance = createAdaptiveGuidance(
      mockUserData.useUserStore(),
      { maturity: { current: 'discovery' } },
      'menstrual'
    );

    const message = guidance.generateContextualMessage(
      'emma',
      'discovery',
      'suggestion',
      { 
        phase: 'menstrual',
        emotionalReadiness: { score: 0.3, timing: 'sensitive' }
      }
    );

    expect(typeof message).toBe('string');
    expect(message.length).toBeGreaterThan(10);
  });

  test('✅ Adaptation temporelle selon heure de la journée', () => {
    // Mock heures différentes
    const testHours = [6, 12, 22]; // Tôt, optimal, tard
    
    testHours.forEach(hour => {
      // Mock Date.now pour simuler l'heure
      const mockDate = new Date();
      mockDate.setHours(hour);
      const originalDate = global.Date;
      global.Date = jest.fn(() => mockDate);
      global.Date.now = jest.fn(() => mockDate.getTime());

      const { result } = renderHook(() => useSmartSuggestions());

      // Vérifier que les actions sont générées
      expect(result.current.actions.length).toBeGreaterThan(0);
      expect(result.current.actions[0]).toHaveProperty('emotionalTiming');

      // Restaurer Date original
      global.Date = originalDate;
    });
  });

  test('✅ Gestion erreurs et fallbacks', () => {
    // Test avec données manquantes mais structure valide
    useUserIntelligence.mockReturnValue({
      ...mockIntelligence,
      learning: {
        confidence: 0,
        timePatterns: {},
        phasePatterns: {},
        suggestionEffectiveness: {},
        conversationCount: 0
      }
    });

    const { result } = renderHook(() => useSmartSuggestions());

    // Vérifier que le système ne plante pas
    expect(result.current).toHaveProperty('actions');
    expect(result.current).toHaveProperty('prompts');
    expect(Array.isArray(result.current.actions)).toBe(true);
    expect(Array.isArray(result.current.prompts)).toBe(true);
  });
}); 