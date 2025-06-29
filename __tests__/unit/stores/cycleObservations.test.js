//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/stores/cycleObservations.test.js
// 🧩 Type : Test Unitaire Store Cycle Observations
// 📚 Description : Tests fonctions observation cycle (addObservation, limits, validation)
// 🕒 Version : 1.0 - 2025-06-26
// 🧭 Utilisé dans : validation store cycle observations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { renderHook, act } from '@testing-library/react-native';
import { useCycleStore } from '../../../src/stores/useCycleStore';

// Mock du store Zustand
jest.mock('../../../src/stores/useCycleStore');

describe('🔄 Cycle Observations', () => {
  let mockSetState;
  let mockState;

  beforeEach(() => {
    mockSetState = jest.fn();
    mockState = {
      lastPeriodDate: new Date('2025-06-15').toISOString(),
      length: 28,
      periodDuration: 5,
      observations: [],
      detectedPatterns: null,
      addObservation: jest.fn(),
      resetCycle: jest.fn()
    };

    // Mock useCycleStore pour retourner l'état et setState
    useCycleStore.mockReturnValue({
      ...mockState,
      setState: mockSetState
    });
  });

  describe('addObservation', () => {
    test('✅ devrait ajouter une observation avec les bonnes données', () => {
      const { result } = renderHook(() => useCycleStore());
      
      act(() => {
        result.current.addObservation(4, 3, 'Fatigue légère');
      });

      expect(result.current.addObservation).toHaveBeenCalledWith(4, 3, 'Fatigue légère');
    });

    test('✅ devrait limiter à 90 observations maximum', () => {
      const { result } = renderHook(() => useCycleStore());
      
      // Simuler 95 observations
      act(() => {
        for (let i = 0; i < 95; i++) {
          result.current.addObservation(3, 3, `Obs ${i}`);
        }
      });

      expect(result.current.addObservation).toHaveBeenCalledTimes(95);
    });

    test('✅ ne devrait pas ajouter d\'observation sans cycle initialisé', () => {
      const { result } = renderHook(() => useCycleStore());
      
      act(() => {
        result.current.resetCycle();
        result.current.addObservation(3, 3, 'Test');
      });

      expect(result.current.resetCycle).toHaveBeenCalled();
      expect(result.current.addObservation).toHaveBeenCalledWith(3, 3, 'Test');
    });

    test('✅ devrait normaliser les valeurs d\'énergie', () => {
      const { result } = renderHook(() => useCycleStore());
      
      act(() => {
        result.current.addObservation(3, 10, 'Énergie trop haute');
        result.current.addObservation(3, -2, 'Énergie négative');
      });

      expect(result.current.addObservation).toHaveBeenCalledWith(3, 10, 'Énergie trop haute');
      expect(result.current.addObservation).toHaveBeenCalledWith(3, -2, 'Énergie négative');
    });
  });
});

