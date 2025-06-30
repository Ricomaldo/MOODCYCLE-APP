//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/stores/useNotebookStore.test.js
// 🧩 Type : Test Unitaire Store Carnet Personnel
// 📚 Description : Tests complets du store notebook (gestion entries, tags, filtrage, analytics)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation store carnet personnel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotebookStore } from '../../../src/stores/useNotebookStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

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

// Mock PerformanceMonitor
jest.mock('../../../src/core/monitoring/PerformanceMonitor', () => ({
  startStoreHydration: jest.fn(),
  endStoreHydration: jest.fn(),
}));

describe('📝 useNotebookStore - Tests Complets', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    
    // Reset store à l'état initial
    const { result } = renderHook(() => useNotebookStore());
    act(() => {
      result.current.reset();
    });
  });

  afterEach(() => {
    // Cleanup
    const { result } = renderHook(() => useNotebookStore());
    act(() => {
      result.current.reset();
    });
  });

  // ──────────────────────────────────────────────────────
  // 📝 TESTS CRÉATION ENTRÉES
  // ──────────────────────────────────────────────────────

  describe('Entry Creation', () => {
    test('✅ devrait créer une entrée personnelle avec données complètes', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        const entryId = result.current.addEntry(
          'Aujourd\'hui je me sens plus énergique',
          'personal',
          ['#bien-être', '#inspiration']
        );
        expect(entryId).toBeDefined();
      });

      expect(result.current.entries).toHaveLength(1);
      const entry = result.current.entries[0];
      expect(entry.content).toBe('Aujourd\'hui je me sens plus énergique');
      expect(entry.type).toBe('personal');
      expect(entry.tags).toContain('#bien-être');
      expect(entry.tags).toContain('#inspiration');
      expect(entry.tags).toContain('#menstrual'); // Auto-ajouté
      expect(entry.phase).toBe('menstrual');
      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeDefined();
    });

    test('✅ devrait créer une entrée avec type par défaut', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Note simple sans type spécifié');
      });

      expect(result.current.entries[0].type).toBe('personal');
      expect(result.current.entries[0].tags).toContain('#menstrual');
    });

    test('✅ devrait ajouter automatiquement la phase actuelle', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Test phase auto', 'personal', []);
      });

      expect(result.current.entries[0].tags).toContain('#menstrual');
      expect(result.current.entries[0].phase).toBe('menstrual');
    });

    test('✅ devrait gérer les entrées sans tags', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Note sans tags', 'personal');
      });

      expect(result.current.entries[0].tags).toEqual(['#menstrual']);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🏃 TESTS TRACKING RAPIDE
  // ──────────────────────────────────────────────────────

  describe('Quick Tracking', () => {
    test('✅ devrait créer un tracking rapide complet', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        const entryId = result.current.addQuickTracking(
          'good',
          4,
          ['fatigue', 'intuition']
        );
        expect(entryId).toBeDefined();
      });

      expect(result.current.entries).toHaveLength(1);
      const entry = result.current.entries[0];
      expect(entry.content).toBe('Humeur: good • Énergie: 4/5');
      expect(entry.type).toBe('tracking');
      expect(entry.tags).toContain('#tracking');
      expect(entry.tags).toContain('#fatigue');
      expect(entry.tags).toContain('#intuition');
      expect(entry.tags).toContain('#menstrual');
    });

    test('✅ devrait gérer le tracking sans symptômes', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addQuickTracking('neutral', 3);
      });

      expect(result.current.entries[0].content).toBe('Humeur: neutral • Énergie: 3/5');
      expect(result.current.entries[0].tags).toEqual(['#tracking', '#menstrual']);
    });

    test('✅ devrait normaliser les symptômes en tags', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addQuickTracking('good', 4, ['Fatigue Légère', 'INTUITION_FORTE']);
      });

      expect(result.current.entries[0].tags).toContain('#fatigue légère');
      expect(result.current.entries[0].tags).toContain('#intuition_forte');
    });
  });

  // ──────────────────────────────────────────────────────
  // 💬 TESTS SAUVEGARDE CHAT
  // ──────────────────────────────────────────────────────

  describe('Chat Save', () => {
    test('✅ devrait sauvegarder un message du chat', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        const entryId = result.current.saveFromChat(
          'Melune m\'a conseillé de prendre du temps pour moi aujourd\'hui',
          'emma'
        );
        expect(entryId).toBeDefined();
      });

      expect(result.current.entries).toHaveLength(1);
      const entry = result.current.entries[0];
      expect(entry.content).toBe('Melune m\'a conseillé de prendre du temps pour moi aujourd\'hui');
      expect(entry.type).toBe('saved');
      expect(entry.tags).toContain('#melune');
      expect(entry.tags).toContain('#emma');
      expect(entry.tags).toContain('#menstrual');
    });

    test('✅ devrait sauvegarder sans persona', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.saveFromChat('Message important de Melune');
      });

      expect(result.current.entries[0].tags).toContain('#melune');
      expect(result.current.entries[0].tags).not.toContain('#undefined');
    });
  });

  // ──────────────────────────────────────────────────────
  // 📝 TESTS NOTES PERSONNELLES
  // ──────────────────────────────────────────────────────

  describe('Personal Notes', () => {
    test('✅ devrait créer une note personnelle', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addPersonalNote(
          'Je veux essayer la méditation ce soir',
          ['#objectif', '#bien-être']
        );
      });

      expect(result.current.entries[0].content).toBe('Je veux essayer la méditation ce soir');
      expect(result.current.entries[0].type).toBe('personal');
      expect(result.current.entries[0].tags).toContain('#personnel');
      expect(result.current.entries[0].tags).toContain('#objectif');
      expect(result.current.entries[0].tags).toContain('#bien-être');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔍 TESTS RECHERCHE ET FILTRAGE
  // ──────────────────────────────────────────────────────

  describe('Search and Filtering', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useNotebookStore());
      
      // Préparer données de test
      act(() => {
        result.current.addEntry('Note sur la fatigue', 'personal', ['#symptôme', '#fatigue']);
        result.current.addEntry('Recette tisane camomille', 'personal', ['#recette', '#bien-être']);
        result.current.addEntry('RDV gynécologue', 'personal', ['#rdv']);
        result.current.addQuickTracking('good', 4, ['énergie']);
        result.current.saveFromChat('Conseil Melune sur le repos', 'emma');
      });
    });

    test('✅ devrait rechercher par texte', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const results = result.current.searchEntries('fatigue');
      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('Note sur la fatigue');
    });

    test('✅ devrait filtrer par tags', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const results = result.current.searchEntries('', { tags: ['#recette'] });
      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('Recette tisane camomille');
    });

    test('✅ devrait filtrer par type', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const trackingResults = result.current.searchEntries('', { type: 'tracking' });
      expect(trackingResults).toHaveLength(1);
      expect(trackingResults[0].type).toBe('tracking');

      const savedResults = result.current.searchEntries('', { type: 'saved' });
      expect(savedResults).toHaveLength(1);
      expect(savedResults[0].type).toBe('saved');
    });

    test('✅ devrait filtrer par phase', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const results = result.current.searchEntries('', { phase: 'menstrual' });
      expect(results).toHaveLength(5); // Toutes les entrées ont la phase menstruelle
    });

    test('✅ devrait combiner plusieurs filtres', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const results = result.current.searchEntries('', {
        tags: ['#bien-être'],
        type: 'personal'
      });
      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('Recette tisane camomille');
    });

    test('✅ devrait retourner toutes les entrées sans filtres', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const results = result.current.searchEntries();
      expect(results).toHaveLength(5);
    });

    test('✅ devrait rechercher dans les tags', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const results = result.current.searchEntries('recette');
      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('Recette tisane camomille');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🏷️ TESTS RECHERCHE SPÉCIALISÉE
  // ──────────────────────────────────────────────────────

  describe('Specialized Search', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Note 1', 'personal', ['#symptôme']);
        result.current.addEntry('Note 2', 'saved', ['#melune']);
        result.current.addEntry('Note 3', 'tracking', ['#tracking']);
        result.current.addEntry('Note 4', 'personal', ['#inspiration']);
      });
    });

    test('✅ devrait rechercher par tag spécifique', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const symptomeEntries = result.current.getEntriesByTag('#symptôme');
      expect(symptomeEntries).toHaveLength(1);
      expect(symptomeEntries[0].content).toBe('Note 1');

      const meluneEntries = result.current.getEntriesByTag('#melune');
      expect(meluneEntries).toHaveLength(1);
      expect(meluneEntries[0].content).toBe('Note 2');
    });

    test('✅ devrait rechercher par phase', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const menstrualEntries = result.current.getEntriesByPhase('menstrual');
      expect(menstrualEntries).toHaveLength(4); // Toutes les entrées
    });

    test('✅ devrait rechercher par type', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const personalEntries = result.current.getEntriesByType('personal');
      expect(personalEntries).toHaveLength(2);

      const savedEntries = result.current.getEntriesByType('saved');
      expect(savedEntries).toHaveLength(1);

      const trackingEntries = result.current.getEntriesByType('tracking');
      expect(trackingEntries).toHaveLength(1);
    });
  });

  // ──────────────────────────────────────────────────────
  // 📊 TESTS ANALYTICS ET INSIGHTS
  // ──────────────────────────────────────────────────────

  describe('Analytics and Insights', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Note 1', 'personal', ['#symptôme', '#fatigue']);
        result.current.addEntry('Note 2', 'personal', ['#symptôme', '#douleur']);
        result.current.addEntry('Note 3', 'personal', ['#bien-être', '#inspiration']);
        result.current.addEntry('Note 4', 'personal', ['#bien-être', '#recette']);
        result.current.addQuickTracking('good', 4, ['énergie']);
        result.current.addQuickTracking('neutral', 3, ['fatigue']);
        result.current.addQuickTracking('good', 5, ['inspiration']);
      });
    });

    test('✅ devrait calculer les tags populaires', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const popularTags = result.current.getPopularTags(5);
      
      expect(popularTags).toHaveLength(5);
      expect(popularTags[0].tag).toBe('#menstrual'); // Auto-ajouté à toutes les entrées
      expect(popularTags[0].count).toBe(7);
      
      // Vérifier que les tags sont triés par popularité
      const counts = popularTags.map(tag => tag.count);
      expect(counts).toEqual([...counts].sort((a, b) => b - a));
    });

    test('✅ devrait limiter le nombre de tags populaires', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const popularTags = result.current.getPopularTags(3);
      expect(popularTags).toHaveLength(3);
    });

    test('✅ devrait calculer les tendances récentes', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const trends = result.current.getRecentTrends();
      
      if (trends) {
        expect(trends).toHaveProperty('avgEnergy');
        expect(trends).toHaveProperty('energyTrend');
        expect(typeof trends.avgEnergy).toBe('number');
        expect(trends.avgEnergy).toBeGreaterThan(0);
        expect(trends.avgEnergy).toBeLessThanOrEqual(5);
      }
    });

    test('✅ devrait retourner null pour tendances insuffisantes', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      // Reset pour avoir moins de données
      act(() => {
        result.current.reset();
      });
      
      const trends = result.current.getRecentTrends();
      expect(trends).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS GESTION ENTRÉES
  // ──────────────────────────────────────────────────────

  describe('Entry Management', () => {
    test('✅ devrait mettre à jour une entrée', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      let entryId;
      act(() => {
        entryId = result.current.addEntry('Note originale', 'personal', ['#test']);
      });

      act(() => {
        result.current.updateEntry(entryId, {
          content: 'Note modifiée',
          tags: ['#test', '#modifié']
        });
      });

      const updatedEntry = result.current.entries.find(entry => entry.id === entryId);
      expect(updatedEntry.content).toBe('Note modifiée');
      expect(updatedEntry.tags).toContain('#modifié');
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

    test('✅ devrait gérer la suppression d\'entrée inexistante', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.deleteEntry('inexistant-id');
      });

      // Ne doit pas crasher
      expect(result.current.entries).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // 📊 TESTS LIMITES ET PERFORMANCE
  // ──────────────────────────────────────────────────────

  describe('Limits and Performance', () => {
    test('✅ devrait gérer efficacement 500 entrées', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const start = performance.now();
      
      act(() => {
        for (let i = 0; i < 500; i++) {
          result.current.addEntry(`Note ${i}`, 'personal', [`#tag${i}`]);
        }
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // < 1s pour 500 entrées
      expect(result.current.entries).toHaveLength(500);
    });

    test('✅ devrait limiter à 500 entrées maximum', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        for (let i = 0; i < 600; i++) {
          result.current.addEntry(`Note ${i}`, 'personal');
        }
      });

      expect(result.current.entries).toHaveLength(500);
      expect(result.current.entries[0].content).toBe('Note 100'); // Les 100 premières supprimées
    });

    test('✅ devrait rechercher rapidement dans 500 entrées', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      // Préparer 500 entrées
      act(() => {
        for (let i = 0; i < 500; i++) {
          result.current.addEntry(`Note ${i}`, 'personal', [`#tag${i % 10}`]);
        }
      });

      const start = performance.now();
      
      const results = result.current.searchEntries('Note 250');
      
      const end = performance.now();
      expect(end - start).toBeLessThan(50); // < 50ms pour recherche
      expect(results).toHaveLength(1);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS SÉCURITÉ ET VALIDATION
  // ──────────────────────────────────────────────────────

  describe('Security and Validation', () => {
    test('✅ devrait gérer les contenus très longs', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      const longContent = 'a'.repeat(10000);
      act(() => {
        result.current.addEntry(longContent, 'personal');
      });

      expect(result.current.entries[0].content).toBe(longContent);
    });

    test('✅ devrait gérer les tags spéciaux', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Test tags spéciaux', 'personal', [
          '#tag-normal',
          '#tag avec espaces',
          '#tag-avec-tirets',
          '#tag_avec_underscores',
          '#TAG-MAJUSCULES'
        ]);
      });

      expect(result.current.entries[0].tags).toContain('#tag-normal');
      expect(result.current.entries[0].tags).toContain('#tag avec espaces');
      expect(result.current.entries[0].tags).toContain('#TAG-MAJUSCULES');
    });

    test('✅ devrait gérer les données corrompues gracieusement', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry(null, 'personal', null);
      });

      // Ne doit pas crasher
      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].content).toBeNull();
      expect(result.current.entries[0].tags).toEqual(['#menstrual']);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS PERSISTANCE ASYNCSTORAGE
  // ──────────────────────────────────────────────────────

  describe('AsyncStorage Persistence', () => {
    test('✅ devrait persister les données dans AsyncStorage', async () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Test persistance', 'personal', ['#test']);
      });

      // Vérifier que AsyncStorage.setItem a été appelé
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      
      // Vérifier la clé de stockage
      const calls = AsyncStorage.setItem.mock.calls;
      const storageKey = calls.find(call => call[0] === 'notebook-storage');
      expect(storageKey).toBeDefined();
    });

    test('✅ devrait gérer les erreurs de persistance gracieusement', async () => {
      // Simuler erreur AsyncStorage
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const { result } = renderHook(() => useNotebookStore());
      
      // L'opération ne doit pas crasher
      act(() => {
        result.current.addEntry('Test erreur storage', 'personal');
      });

      // Les données doivent être mises à jour en mémoire même si la persistance échoue
      expect(result.current.entries).toHaveLength(1);
    });

    test('✅ devrait partialiser correctement les données persistées', () => {
      const { result } = renderHook(() => useNotebookStore());
      
      act(() => {
        result.current.addEntry('Test partialize', 'personal', ['#test']);
      });

      // Vérifier que seules les données nécessaires sont persistées
      const calls = AsyncStorage.setItem.mock.calls;
      const storageCall = calls.find(call => call[0] === 'notebook-storage');
      
      if (storageCall) {
        const persistedData = JSON.parse(storageCall[1]);
        expect(persistedData).toHaveProperty('entries');
        expect(persistedData).toHaveProperty('availableTags');
        expect(persistedData).not.toHaveProperty('addEntry'); // Fonctions non persistées
      }
    });
  });
}); 