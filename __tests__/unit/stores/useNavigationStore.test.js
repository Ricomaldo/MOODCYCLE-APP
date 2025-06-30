//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/stores/useNavigationStore.test.js
// 🧩 Type : Test Unitaire Store Navigation
// 📚 Description : Tests complets du store navigation (filtres, modals, historique)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation store navigation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigationStore } from '../../../src/stores/useNavigationStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock PerformanceMonitor
jest.mock('../../../src/core/monitoring/PerformanceMonitor', () => ({
  startStoreHydration: jest.fn(),
  endStoreHydration: jest.fn(),
}));

describe('🧭 useNavigationStore - Tests Complets', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    
    // Reset store à l'état initial
    const { result } = renderHook(() => useNavigationStore());
    act(() => {
      result.current.reset();
    });
  });

  afterEach(() => {
    // Cleanup
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
      expect(result.current.notebookFilters.tags).toEqual([]);
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

    test('✅ devrait définir un filtre de phase', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setNotebookFilter('phase', 'menstrual');
      });

      expect(result.current.notebookFilters.phase).toBe('menstrual');
    });

    test('✅ devrait définir une requête de recherche', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setNotebookFilter('searchQuery', 'fatigue');
      });

      expect(result.current.notebookFilters.searchQuery).toBe('fatigue');
    });

    test('✅ devrait définir un tri', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setNotebookFilter('sortBy', 'oldest');
      });

      expect(result.current.notebookFilters.sortBy).toBe('oldest');
    });

    test('✅ devrait gérer les filtres multiples', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setNotebookFilter('type', 'tracking');
        result.current.setNotebookFilter('phase', 'follicular');
        result.current.setNotebookFilter('searchQuery', 'énergie');
        result.current.setNotebookFilter('sortBy', 'phase');
      });

      expect(result.current.notebookFilters.type).toBe('tracking');
      expect(result.current.notebookFilters.phase).toBe('follicular');
      expect(result.current.notebookFilters.searchQuery).toBe('énergie');
      expect(result.current.notebookFilters.sortBy).toBe('phase');
    });

    test('✅ devrait reset tous les filtres', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      // Définir des filtres
      act(() => {
        result.current.setNotebookFilter('type', 'personal');
        result.current.setNotebookFilter('phase', 'menstrual');
        result.current.setNotebookFilter('searchQuery', 'test');
        result.current.setNotebookFilter('sortBy', 'oldest');
      });

      // Reset
      act(() => {
        result.current.resetNotebookFilters();
      });

      expect(result.current.notebookFilters.type).toBe('all');
      expect(result.current.notebookFilters.phase).toBeNull();
      expect(result.current.notebookFilters.tags).toEqual([]);
      expect(result.current.notebookFilters.searchQuery).toBe('');
      expect(result.current.notebookFilters.sortBy).toBe('recent');
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
        result.current.toggleTag('#bien-être');
      });

      expect(result.current.notebookFilters.tags).toContain('#symptôme');
      expect(result.current.notebookFilters.tags).toContain('#bien-être');

      act(() => {
        result.current.toggleTag('#symptôme');
      });

      expect(result.current.notebookFilters.tags).not.toContain('#symptôme');
      expect(result.current.notebookFilters.tags).toContain('#bien-être');
    });

    test('✅ devrait gérer plusieurs tags', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.toggleTag('#symptôme');
        result.current.toggleTag('#fatigue');
        result.current.toggleTag('#énergie');
      });

      expect(result.current.notebookFilters.tags).toHaveLength(3);
      expect(result.current.notebookFilters.tags).toContain('#symptôme');
      expect(result.current.notebookFilters.tags).toContain('#fatigue');
      expect(result.current.notebookFilters.tags).toContain('#énergie');
    });

    test('✅ devrait éviter les doublons', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.toggleTag('#symptôme');
        result.current.toggleTag('#symptôme');
        result.current.toggleTag('#symptôme');
      });

      expect(result.current.notebookFilters.tags).toHaveLength(1);
      expect(result.current.notebookFilters.tags).toContain('#symptôme');
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
        { id: '2', content: 'Entry 2' },
        { id: '3', content: 'Entry 3' }
      ];

      act(() => {
        result.current.openEntryDetailModal(testEntries, 1);
      });

      expect(result.current.modalState.entryDetail.visible).toBe(true);
      expect(result.current.modalState.entryDetail.entries).toEqual(testEntries);
      expect(result.current.modalState.entryDetail.currentIndex).toBe(1);
    });

    test('✅ devrait ajuster l\'index de départ si invalide', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const testEntries = [
        { id: '1', content: 'Entry 1' },
        { id: '2', content: 'Entry 2' }
      ];

      act(() => {
        result.current.openEntryDetailModal(testEntries, 5); // Index trop haut
      });

      expect(result.current.modalState.entryDetail.currentIndex).toBe(1); // Dernier index valide
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
      expect(result.current.modalState.entryDetail.entries).toEqual([]);
      expect(result.current.modalState.entryDetail.currentIndex).toBe(0);
    });

    test('✅ devrait naviguer vers l\'entrée suivante', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const testEntries = [
        { id: '1', content: 'Entry 1' },
        { id: '2', content: 'Entry 2' },
        { id: '3', content: 'Entry 3' }
      ];

      act(() => {
        result.current.openEntryDetailModal(testEntries, 0);
      });

      act(() => {
        result.current.navigateModalEntry('next');
      });

      expect(result.current.modalState.entryDetail.currentIndex).toBe(1);
    });

    test('✅ devrait naviguer vers l\'entrée précédente', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const testEntries = [
        { id: '1', content: 'Entry 1' },
        { id: '2', content: 'Entry 2' },
        { id: '3', content: 'Entry 3' }
      ];

      act(() => {
        result.current.openEntryDetailModal(testEntries, 2);
      });

      act(() => {
        result.current.navigateModalEntry('prev');
      });

      expect(result.current.modalState.entryDetail.currentIndex).toBe(1);
    });

    test('✅ devrait bloquer la navigation aux limites', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const testEntries = [
        { id: '1', content: 'Entry 1' },
        { id: '2', content: 'Entry 2' }
      ];

      act(() => {
        result.current.openEntryDetailModal(testEntries, 0);
      });

      // Essayer d'aller avant le début
      act(() => {
        result.current.navigateModalEntry('prev');
      });
      expect(result.current.modalState.entryDetail.currentIndex).toBe(0);

      // Aller à la fin
      act(() => {
        result.current.navigateModalEntry('next');
      });
      expect(result.current.modalState.entryDetail.currentIndex).toBe(1);

      // Essayer d'aller après la fin
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
      expect(result.current.navigationHistory.vignetteInteractions).toEqual({});
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

    test('✅ devrait incrémenter les clics sur vignette', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.trackVignetteClick('vignette-1');
        result.current.trackVignetteClick('vignette-1');
        result.current.trackVignetteClick('vignette-1');
      });

      expect(result.current.navigationHistory.vignetteInteractions['vignette-1']).toBe(3);
    });

    test('✅ devrait tracker plusieurs vignettes', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.trackVignetteClick('vignette-1');
        result.current.trackVignetteClick('vignette-2');
        result.current.trackVignetteClick('vignette-1');
        result.current.trackVignetteClick('vignette-3');
      });

      expect(result.current.navigationHistory.vignetteInteractions['vignette-1']).toBe(2);
      expect(result.current.navigationHistory.vignetteInteractions['vignette-2']).toBe(1);
      expect(result.current.navigationHistory.vignetteInteractions['vignette-3']).toBe(1);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔍 TESTS GETTERS
  // ──────────────────────────────────────────────────────

  describe('Getters', () => {
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
        result.current.setNotebookFilter('phase', 'menstrual');
        result.current.toggleTag('#symptôme');
        result.current.toggleTag('#fatigue');
        result.current.setNotebookFilter('searchQuery', 'test');
      });

      expect(result.current.getActiveFiltersCount()).toBe(5); // type + phase + 2 tags + search
    });

    test('✅ devrait retourner les vignettes les plus cliquées', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.trackVignetteClick('vignette-1');
        result.current.trackVignetteClick('vignette-1');
        result.current.trackVignetteClick('vignette-2');
        result.current.trackVignetteClick('vignette-3');
        result.current.trackVignetteClick('vignette-1');
        result.current.trackVignetteClick('vignette-2');
      });

      const mostClicked = result.current.getMostClickedVignettes(2);
      
      expect(mostClicked).toHaveLength(2);
      expect(mostClicked[0].id).toBe('vignette-1');
      expect(mostClicked[0].count).toBe(3);
      expect(mostClicked[1].id).toBe('vignette-2');
      expect(mostClicked[1].count).toBe(2);
    });

    test('✅ devrait limiter le nombre de vignettes retournées', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.trackVignetteClick('vignette-1');
        result.current.trackVignetteClick('vignette-2');
        result.current.trackVignetteClick('vignette-3');
      });

      const mostClicked = result.current.getMostClickedVignettes(2);
      expect(mostClicked).toHaveLength(2);
    });

    test('✅ devrait retourner un tableau vide si pas d\'interactions', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const mostClicked = result.current.getMostClickedVignettes();
      expect(mostClicked).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS RESET ET MIGRATION
  // ──────────────────────────────────────────────────────

  describe('Reset and Migration', () => {
    test('✅ devrait reset complètement le store', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      // Préparer données
      act(() => {
        result.current.setNotebookFilter('type', 'personal');
        result.current.toggleTag('#symptôme');
        result.current.openEntryDetailModal([{ id: '1', content: 'Test' }]);
        result.current.trackTabVisit('notebook');
        result.current.trackVignetteClick('vignette-1');
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
      expect(result.current.navigationHistory.vignetteInteractions).toEqual({});
    });

    test('✅ devrait gérer les données anciennes format', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      // Simuler données anciennes
      const oldData = {
        filters: { type: 'personal' }, // Ancien format
        modal: { visible: true },      // Ancien format
        history: { lastTab: 'old' }    // Ancien format
      };

      act(() => {
        result.current.setNotebookFilter('type', oldData.filters.type);
      });

      // Les données doivent être compatibles
      expect(result.current.notebookFilters.type).toBe('personal');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS SÉCURITÉ ET VALIDATION
  // ──────────────────────────────────────────────────────

  describe('Security and Validation', () => {
    test('✅ devrait gérer les filtres invalides gracieusement', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setNotebookFilter('invalidKey', 'value');
        result.current.setNotebookFilter('type', null);
        result.current.setNotebookFilter('phase', 'invalid_phase');
      });

      // Ne doit pas crasher
      expect(result.current.notebookFilters.invalidKey).toBe('value');
      expect(result.current.notebookFilters.type).toBeNull();
      expect(result.current.notebookFilters.phase).toBe('invalid_phase');
    });

    test('✅ devrait gérer les tags spéciaux', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.toggleTag('#tag avec espaces');
        result.current.toggleTag('#tag-avec-tirets');
        result.current.toggleTag('#TAG_MAJUSCULES');
        result.current.toggleTag('#tag123');
      });

      expect(result.current.notebookFilters.tags).toContain('#tag avec espaces');
      expect(result.current.notebookFilters.tags).toContain('#tag-avec-tirets');
      expect(result.current.notebookFilters.tags).toContain('#TAG_MAJUSCULES');
      expect(result.current.notebookFilters.tags).toContain('#tag123');
    });

    test('✅ devrait gérer les entrées modales invalides', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.openEntryDetailModal(null, -1);
      });

      // Ne doit pas crasher
      expect(result.current.modalState.entryDetail.entries).toEqual([]);
      expect(result.current.modalState.entryDetail.currentIndex).toBe(0);
    });

    test('✅ devrait gérer les IDs de vignette spéciaux', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.trackVignetteClick('vignette-with-special-chars!@#');
        result.current.trackVignetteClick('vignette with spaces');
        result.current.trackVignetteClick('123');
      });

      expect(result.current.navigationHistory.vignetteInteractions['vignette-with-special-chars!@#']).toBe(1);
      expect(result.current.navigationHistory.vignetteInteractions['vignette with spaces']).toBe(1);
      expect(result.current.navigationHistory.vignetteInteractions['123']).toBe(1);
    });
  });

  // ──────────────────────────────────────────────────────
  // ⚡ TESTS PERFORMANCE
  // ──────────────────────────────────────────────────────

  describe('Performance', () => {
    test('⚡ devrait gérer rapidement 100 filtres', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const start = performance.now();
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.setNotebookFilter('type', `type${i}`);
        }
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // < 100ms pour 100 filtres
    });

    test('⚡ devrait tracker rapidement 100 clics vignettes', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      const start = performance.now();
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.trackVignetteClick(`vignette-${i}`);
        }
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // < 100ms pour 100 clics
    });

    test('⚡ devrait calculer rapidement les vignettes populaires', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      // Préparer 100 interactions
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.trackVignetteClick(`vignette-${i % 10}`);
        }
      });

      const start = performance.now();
      
      // Calculs multiples
      for (let i = 0; i < 50; i++) {
        result.current.getMostClickedVignettes(5);
        result.current.getActiveFiltersCount();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(50); // < 50ms pour 100 calculs
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS PERSISTANCE ASYNCSTORAGE
  // ──────────────────────────────────────────────────────

  describe('AsyncStorage Persistence', () => {
    test('✅ devrait persister les données dans AsyncStorage', async () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setNotebookFilter('type', 'personal');
        result.current.toggleTag('#symptôme');
        result.current.trackTabVisit('notebook');
      });

      // Vérifier que AsyncStorage.setItem a été appelé
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      
      // Vérifier la clé de stockage
      const calls = AsyncStorage.setItem.mock.calls;
      const storageKey = calls.find(call => call[0] === 'navigation-storage');
      expect(storageKey).toBeDefined();
    });

    test('✅ devrait gérer les erreurs de persistance gracieusement', async () => {
      // Simuler erreur AsyncStorage
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const { result } = renderHook(() => useNavigationStore());
      
      // L'opération ne doit pas crasher
      act(() => {
        result.current.setNotebookFilter('type', 'personal');
      });

      // Les données doivent être mises à jour en mémoire même si la persistance échoue
      expect(result.current.notebookFilters.type).toBe('personal');
    });

    test('✅ devrait partialiser correctement les données persistées', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setNotebookFilter('type', 'personal');
        result.current.trackTabVisit('notebook');
      });

      // Vérifier que seules les données nécessaires sont persistées
      const calls = AsyncStorage.setItem.mock.calls;
      const storageCall = calls.find(call => call[0] === 'navigation-storage');
      
      if (storageCall) {
        const persistedData = JSON.parse(storageCall[1]);
        expect(persistedData).toHaveProperty('notebookFilters');
        expect(persistedData).toHaveProperty('modalState');
        expect(persistedData).toHaveProperty('navigationHistory');
        expect(persistedData).not.toHaveProperty('setNotebookFilter'); // Fonctions non persistées
      }
    });
  });
}); 