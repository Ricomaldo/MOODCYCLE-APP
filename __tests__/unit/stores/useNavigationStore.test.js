//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/stores/useNavigationStore.test.js
// 🧩 Type : Test Unitaire Store Navigation
// 📚 Description : Tests essentiels du store navigation (filtres, modals, reset)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation store navigation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { renderHook, act } from '@testing-library/react-native';
import { useNavigationStore } from '../../../src/stores/useNavigationStore';

describe('🧭 useNavigationStore - Tests Essentiels', () => {
  
  beforeEach(() => {
    // Reset store à l'état initial
    const { result } = renderHook(() => useNavigationStore());
    act(() => {
      result.current.reset();
    });
  });

  // ──────────────────────────────────────────────────────
  // 📝 TESTS FILTRES NOTEBOOK
  // ──────────────────────────────────────────────────────

  describe('Notebook Filters', () => {
    test('✅ devrait initialiser avec filtres par défaut', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      expect(result.current.notebookFilters.type).toBe('all');
      expect(result.current.notebookFilters.phase).toBeNull();
      expect(result.current.notebookFilters.searchQuery).toBe('');
      expect(result.current.notebookFilters.sortBy).toBe('recent');
    });

    test('✅ devrait définir un filtre de type', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setNotebookFilter('type', 'personal');
      });

      expect(result.current.notebookFilters.type).toBe('personal');
    });

    test('✅ devrait définir une requête de recherche', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setNotebookFilter('searchQuery', 'fatigue');
      });

      expect(result.current.notebookFilters.searchQuery).toBe('fatigue');
    });

    test('✅ devrait reset tous les filtres', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      // Définir des filtres
      act(() => {
        result.current.setNotebookFilter('type', 'personal');
        result.current.setNotebookFilter('searchQuery', 'test');
      });

      // Reset
      act(() => {
        result.current.resetNotebookFilters();
      });

      expect(result.current.notebookFilters.type).toBe('all');
      expect(result.current.notebookFilters.searchQuery).toBe('');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🏷️ TESTS GESTION TAGS
  // ──────────────────────────────────────────────────────

  describe('Tag Management', () => {
    test('✅ devrait ajouter un tag', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.toggleTag('#symptôme');
      });

      expect(result.current.notebookFilters.tags).toContain('#symptôme');
    });

    test('✅ devrait retirer un tag existant', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.toggleTag('#symptôme');
      });

      expect(result.current.notebookFilters.tags).toContain('#symptôme');

      act(() => {
        result.current.toggleTag('#symptôme');
      });

      expect(result.current.notebookFilters.tags).not.toContain('#symptôme');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎯 TESTS ÉTAT MODAL
  // ──────────────────────────────────────────────────────

  describe('Modal State', () => {
    test('✅ devrait initialiser avec modal fermé', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      expect(result.current.modalState.entryDetail.visible).toBe(false);
      expect(result.current.modalState.entryDetail.entries).toEqual([]);
      expect(result.current.modalState.entryDetail.currentIndex).toBe(0);
    });

    test('✅ devrait ouvrir le modal avec entrées', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const testEntries = [
        { id: '1', content: 'Entry 1' },
        { id: '2', content: 'Entry 2' }
      ];

      act(() => {
        result.current.openEntryDetailModal(testEntries, 1);
      });

      expect(result.current.modalState.entryDetail.visible).toBe(true);
      expect(result.current.modalState.entryDetail.entries).toEqual(testEntries);
      expect(result.current.modalState.entryDetail.currentIndex).toBe(1);
    });

    test('✅ devrait fermer le modal', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const testEntries = [{ id: '1', content: 'Entry 1' }];

      act(() => {
        result.current.openEntryDetailModal(testEntries);
      });

      expect(result.current.modalState.entryDetail.visible).toBe(true);

      act(() => {
        result.current.closeEntryDetailModal();
      });

      expect(result.current.modalState.entryDetail.visible).toBe(false);
    });

    test('✅ devrait naviguer vers l\'entrée suivante', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const testEntries = [
        { id: '1', content: 'Entry 1' },
        { id: '2', content: 'Entry 2' }
      ];

      act(() => {
        result.current.openEntryDetailModal(testEntries, 0);
      });

      act(() => {
        result.current.navigateModalEntry('next');
      });

      expect(result.current.modalState.entryDetail.currentIndex).toBe(1);
    });
  });

  // ──────────────────────────────────────────────────────
  // 📊 TESTS HISTORIQUE NAVIGATION
  // ──────────────────────────────────────────────────────

  describe('Navigation History', () => {
    test('✅ devrait initialiser avec historique par défaut', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      expect(result.current.navigationHistory.lastTab).toBe('cycle');
      expect(result.current.navigationHistory.lastVignetteId).toBeNull();
    });

    test('✅ devrait tracker une visite d\'onglet', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.trackTabVisit('notebook');
      });

      expect(result.current.navigationHistory.lastTab).toBe('notebook');
    });

    test('✅ devrait tracker un clic sur vignette', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.trackVignetteClick('vignette-1');
      });

      expect(result.current.navigationHistory.lastVignetteId).toBe('vignette-1');
      expect(result.current.navigationHistory.vignetteInteractions['vignette-1']).toBe(1);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔍 TESTS GETTERS ESSENTIELS
  // ──────────────────────────────────────────────────────

  describe('Essential Getters', () => {
    test('✅ devrait récupérer l\'entrée modale actuelle', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const testEntries = [
        { id: '1', content: 'Entry 1' },
        { id: '2', content: 'Entry 2' }
      ];

      act(() => {
        result.current.openEntryDetailModal(testEntries, 1);
      });

      const currentEntry = result.current.getCurrentModalEntry();
      expect(currentEntry).toEqual({ id: '2', content: 'Entry 2' });
    });

    test('✅ devrait retourner null si pas d\'entrée actuelle', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const currentEntry = result.current.getCurrentModalEntry();
      expect(currentEntry).toBeNull();
    });

    test('✅ devrait compter les filtres actifs', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      // Aucun filtre actif
      expect(result.current.getActiveFiltersCount()).toBe(0);

      // Ajouter des filtres
      act(() => {
        result.current.setNotebookFilter('type', 'personal');
        result.current.toggleTag('#symptôme');
      });

      expect(result.current.getActiveFiltersCount()).toBeGreaterThan(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS RESET ET ÉTAT
  // ──────────────────────────────────────────────────────

  describe('State Management', () => {
    test('✅ devrait reset complètement le store', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      // Préparer données
      act(() => {
        result.current.setNotebookFilter('type', 'personal');
        result.current.toggleTag('#symptôme');
        result.current.openEntryDetailModal([{ id: '1', content: 'Test' }]);
        result.current.trackTabVisit('notebook');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      // Vérifier reset
      expect(result.current.notebookFilters.type).toBe('all');
      expect(result.current.notebookFilters.tags).toEqual([]);
      expect(result.current.modalState.entryDetail.visible).toBe(false);
      expect(result.current.navigationHistory.lastTab).toBe('cycle');
    });
  });
}); 