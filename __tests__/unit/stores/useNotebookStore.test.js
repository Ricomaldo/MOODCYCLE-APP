//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/stores/useNotebookStore.test.js
// 🧩 Type : Test Unitaire Store Carnet Personnel
// 📚 Description : Tests essentiels du store notebook (CRUD, état de base)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation store carnet personnel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { renderHook, act } from '@testing-library/react-native';
import { useNotebookStore } from '../../../src/stores/useNotebookStore';

// Mock cycleCalculations
jest.mock('../../../src/utils/cycleCalculations', () => ({
  getCurrentPhase: jest.fn().mockReturnValue('menstrual'),
}));

// Mock useCycleStore
jest.mock('../../../src/stores/useCycleStore', () => ({
  useCycleStore: {
    getState: jest.fn().mockReturnValue({
      getCycleData: jest.fn().mockReturnValue({
        lastPeriodDate: new Date('2025-06-15').toISOString(),
        length: 28,
        periodDuration: 5
      })
    })
  }
}));

// Mock useUserStore
jest.mock('../../../src/stores/useUserStore', () => ({
  useUserStore: jest.fn().mockReturnValue({
    profile: { prenom: 'Sarah' }
  })
}));

describe('📝 useNotebookStore - Tests Essentiels', () => {
  
  beforeEach(() => {
    // Reset store à l'état initial
    const { result } = renderHook(() => useNotebookStore());
    act(() => {
      result.current.reset();
    });
  });

  // ──────────────────────────────────────────────────────
  // ✅ TESTS CRUD ESSENTIELS
  // ──────────────────────────────────────────────────────

  describe('Entry CRUD', () => {
    test('✅ devrait créer une entrée personnelle', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        const entryId = result.current.addEntry(
          'Test note personnelle',
          'personal',
          ['#test']
        );
        expect(entryId).toBeDefined();
      });

      expect(result.current.entries).toHaveLength(1);
      const entry = result.current.entries[0];
      expect(entry.content).toBe('Test note personnelle');
      expect(entry.type).toBe('personal');
      expect(entry.tags).toContain('#test');
    });

    test('✅ devrait créer un tracking rapide', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addQuickTracking('good', 4, ['fatigue']);
      });

      expect(result.current.entries).toHaveLength(1);
      const entry = result.current.entries[0];
      expect(entry.content).toBe('Humeur: good • Énergie: 4/5');
      expect(entry.type).toBe('tracking');
      expect(entry.tags).toContain('#fatigue');
    });

    test('✅ devrait sauvegarder depuis le chat', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.saveFromChat('Conseil Melune', 'emma');
      });

      expect(result.current.entries).toHaveLength(1);
      const entry = result.current.entries[0];
      expect(entry.content).toBe('Conseil Melune');
      expect(entry.type).toBe('saved');
      expect(entry.tags).toContain('#melune');
    });

    test('✅ devrait mettre à jour une entrée', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      let entryId;
      act(() => {
        entryId = result.current.addEntry('Note originale', 'personal');
      });

      act(() => {
        result.current.updateEntry(entryId, {
          content: 'Note modifiée'
        });
      });

      const entry = result.current.entries.find(e => e.id === entryId);
      expect(entry.content).toBe('Note modifiée');
    });

    test('✅ devrait supprimer une entrée', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      let entryId;
      act(() => {
        entryId = result.current.addEntry('Note à supprimer', 'personal');
      });

      expect(result.current.entries).toHaveLength(1);

      act(() => {
        result.current.deleteEntry(entryId);
      });

      expect(result.current.entries).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔍 TESTS RECHERCHE BASIQUE
  // ──────────────────────────────────────────────────────

  describe('Basic Search', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Note fatigue', 'personal', ['#symptôme']);
        result.current.addEntry('Recette tisane', 'personal', ['#recette']);
        result.current.addQuickTracking('good', 4, ['énergie']);
      });
    });

    test('✅ devrait rechercher par texte', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const results = result.current.searchEntries('fatigue');
      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('Note fatigue');
    });

    test('✅ devrait filtrer par type', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const trackingResults = result.current.searchEntries('', { type: 'tracking' });
      expect(trackingResults).toHaveLength(1);
      expect(trackingResults[0].type).toBe('tracking');
    });

    test('✅ devrait retourner toutes les entrées sans filtres', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const results = result.current.searchEntries();
      expect(results).toHaveLength(3);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🏷️ TESTS GETTERS ESSENTIELS
  // ──────────────────────────────────────────────────────

  describe('Essential Getters', () => {
    test('✅ devrait récupérer entrées par tag', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Note 1', 'personal', ['#symptôme']);
        result.current.addEntry('Note 2', 'personal', ['#bien-être']);
      });

      const symptomeEntries = result.current.getEntriesByTag('#symptôme');
      expect(symptomeEntries).toHaveLength(1);
      expect(symptomeEntries[0].content).toBe('Note 1');
    });

    test('✅ devrait récupérer entrées par type', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Note perso', 'personal');
        result.current.addQuickTracking('good', 4);
      });

      const personalEntries = result.current.getEntriesByType('personal');
      expect(personalEntries).toHaveLength(1);
      expect(personalEntries[0].content).toBe('Note perso');
    });

    test('✅ devrait calculer les tags populaires', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Note 1', 'personal', ['#test']);
        result.current.addEntry('Note 2', 'personal', ['#test']);
        result.current.addEntry('Note 3', 'personal', ['#autre']);
      });

      const popularTags = result.current.getPopularTags(3);
      expect(popularTags.length).toBeGreaterThan(0);
      expect(popularTags[0]).toHaveProperty('tag');
      expect(popularTags[0]).toHaveProperty('count');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS RESET ET ÉTAT
  // ──────────────────────────────────────────────────────

  describe('State Management', () => {
    test('✅ devrait initialiser avec état vide', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      expect(result.current.entries).toEqual([]);
      expect(result.current.availableTags).toEqual([]);
    });

    test('✅ devrait reset complètement le store', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      // Ajouter des données
      act(() => {
        result.current.addEntry('Test', 'personal', ['#test']);
        result.current.addQuickTracking('good', 4);
      });

      expect(result.current.entries).toHaveLength(2);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.entries).toEqual([]);
      expect(result.current.availableTags).toEqual([]);
    });
  });
}); 