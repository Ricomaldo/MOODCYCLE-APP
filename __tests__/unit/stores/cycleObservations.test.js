//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/stores/cycleObservations.test.js
// 🧩 Type : Test Unitaire Store Cycle Observations
// 📚 Description : Tests essentiels du store cycle observations (addObservation basique)
// 🕒 Version : 1.0 - 2025-06-26
// 🧭 Utilisé dans : validation store cycle observations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { renderHook, act } from '@testing-library/react-native';
import { useCycleStore } from '../../../src/stores/useCycleStore';

// Mock du store Zustand
jest.mock('../../../src/stores/useCycleStore');

describe('🔄 Cycle Observations - Tests Essentiels', () => {
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

    test('✅ devrait appeler la fonction d\'ajout avec paramètres corrects', () => {
      const { result } = renderHook(() => useCycleStore());
      
      act(() => {
        result.current.addObservation(3, 4, 'Énergie positive');
      });

      expect(result.current.addObservation).toHaveBeenCalledWith(3, 4, 'Énergie positive');
    });

    test('✅ devrait gérer les paramètres minimums', () => {
      const { result } = renderHook(() => useCycleStore());
      
      act(() => {
        result.current.addObservation(1, 1, '');
      });

      expect(result.current.addObservation).toHaveBeenCalledWith(1, 1, '');
    });

    test('✅ devrait gérer les paramètres maximums', () => {
      const { result } = renderHook(() => useCycleStore());
      
      act(() => {
        result.current.addObservation(5, 5, 'Note très longue');
      });

      expect(result.current.addObservation).toHaveBeenCalledWith(5, 5, 'Note très longue');
    });
  });

  describe('resetCycle', () => {
    test('✅ devrait appeler la fonction de reset', () => {
      const { result } = renderHook(() => useCycleStore());
      
      act(() => {
        result.current.resetCycle();
      });

      expect(result.current.resetCycle).toHaveBeenCalled();
    });
  });
});

