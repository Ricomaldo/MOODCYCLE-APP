//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/integration/observation-flow.test.js
// 🧩 Type : Test Intégration Flow Observation Complet
// 📚 Description : Tests intégration QuickTrackingModal → Stores (cycle + notebook)
// 🕒 Version : 1.0 - 2025-06-26
// 🧭 Utilisé dans : validation parcours observation multi-stores
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import QuickTrackingModal from '../../src/features/notebook/QuickTrackingModal';

// ✅ MOCKS CENTRALISÉS RÉUTILISÉS
import { mockCycleStore, mockNotebookStore } from '../__mocks__/stores';

import { useCycleStore } from '../../src/stores/useCycleStore';
import { useNotebookStore } from '../../src/stores/useNotebookStore';

// Mock des stores
jest.mock('../../src/stores/useCycleStore');
jest.mock('../../src/stores/useNotebookStore');

describe('🔄 Flow Observation Complet', () => {
  let mockAddObservation;
  let mockAddQuickTracking;

  beforeEach(() => {
    mockAddObservation = jest.fn();
    mockAddQuickTracking = jest.fn();

    // ✅ Mock correct pour le sélecteur useCycleStore((state) => state.addObservation)
    useCycleStore.mockImplementation((selector) => {
      const state = {
        ...mockCycleStore,
        lastPeriodDate: new Date('2025-06-15').toISOString(),
        length: 28,
        periodDuration: 5,
        addObservation: mockAddObservation
      };
      
      // Si c'est un sélecteur, l'appliquer
      if (typeof selector === 'function') {
        return selector(state);
      }
      
      // Sinon retourner tout l'état
      return state;
    });

    useNotebookStore.mockReturnValue({
      ...mockNotebookStore,
      addQuickTracking: mockAddQuickTracking
    });
  });

  test('✅ devrait sauvegarder dans les deux stores', async () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <QuickTrackingModal visible={true} onClose={onClose} />
    );

    // Sélectionner humeur
    const goodMood = getByText('Bonne');
    fireEvent.press(goodMood);

    // Sélectionner énergie (niveau 4)
    const energy4 = getByText('4');
    fireEvent.press(energy4);

    // Sélectionner un symptôme archétype
    const intuition = getByText('Intuition forte');
    fireEvent.press(intuition);

    // Sauvegarder
    const saveButton = getByText('Sauvegarder');
    fireEvent.press(saveButton);

    await waitFor(() => {
      // Vérifier double sauvegarde
      expect(mockAddQuickTracking).toHaveBeenCalledWith('good', 4, ['intuition']);
      expect(mockAddObservation).toHaveBeenCalledWith(
        4, // feeling converti
        4, // energy
        'Symptômes: intuition' // notes
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('✅ devrait gérer les archétypes Miranda Gray', async () => {
    const { getByText } = render(
      <QuickTrackingModal visible={true} onClose={jest.fn()} />
    );

    // Naviguer vers archétype Mère
    const merTab = getByText('☀️ Mère');
    fireEvent.press(merTab);

    // Vérifier présence énergies Mère (selon le vrai composant)
    expect(getByText('Rayonnement')).toBeTruthy();
    expect(getByText('Facilité sociale')).toBeTruthy(); // "Communication" → "Facilité sociale"
    expect(getByText('Sensualité')).toBeTruthy();
    expect(getByText('Confiance')).toBeTruthy();
  });
});