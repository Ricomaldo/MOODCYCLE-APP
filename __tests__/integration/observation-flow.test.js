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

// Mock des stores avec Jest au lieu d'importer depuis __mocks__
jest.mock('../../src/stores/useCycleStore');
jest.mock('../../src/stores/useNotebookStore');

import { useCycleStore } from '../../src/stores/useCycleStore';
import { useNotebookStore } from '../../src/stores/useNotebookStore';

describe('🔄 Observation Flow - Tests d\'Intégration', () => {
  let cycleStore, notebookStore;

  beforeEach(() => {
    // ✅ Les stores sont déjà mockés dans jest.setup.js avec toutes les méthodes
    cycleStore = useCycleStore();
    notebookStore = useNotebookStore();
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
      expect(notebookStore.addQuickTracking).toHaveBeenCalledWith('good', 4, ['intuition']);
      expect(cycleStore.addObservation).toHaveBeenCalledWith(
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