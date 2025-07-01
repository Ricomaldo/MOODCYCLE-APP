//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/stores/useEngagementStore.test.js
// 🧩 Type : Test Unitaire Store Engagement
// 📚 Description : Tests complets du store engagement (métriques, maturité, milestones, analytics)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation store engagement critique
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEngagementStore } from '../../../src/stores/useEngagementStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('📊 useEngagementStore - Tests Complets', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    
    // Reset store à l'état initial
    const { result } = renderHook(() => useEngagementStore());
    act(() => {
      result.current.resetEngagement();
    });
  });

  afterEach(() => {
    // Cleanup
    const { result } = renderHook(() => useEngagementStore());
    act(() => {
      result.current.resetEngagement();
    });
  });

  // ──────────────────────────────────────────────────────
  // 📈 TESTS MÉTRIQUES ENGAGEMENT
  // ──────────────────────────────────────────────────────

  describe('Engagement Metrics', () => {
    test('✅ devrait initialiser avec métriques à zéro', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      expect(result.current.metrics.daysUsed).toBe(0);
      expect(result.current.metrics.sessionsCount).toBe(0);
      expect(result.current.metrics.totalTimeSpent).toBe(0);
      expect(result.current.metrics.lastActiveDate).toBeNull();
      expect(result.current.metrics.conversationsStarted).toBe(0);
      expect(result.current.metrics.conversationsCompleted).toBe(0);
      expect(result.current.metrics.notebookEntriesCreated).toBe(0);
      expect(result.current.metrics.cycleTrackedDays).toBe(0);
      expect(result.current.metrics.insightsSaved).toBe(0);
      expect(result.current.metrics.vignettesEngaged).toBe(0);
      expect(result.current.metrics.phasesExplored).toEqual([]);
      expect(result.current.metrics.cyclesCompleted).toBe(0);
      expect(result.current.metrics.autonomySignals).toBe(0);
    });

    test('✅ devrait tracker une action conversation_started', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('conversation_started');
      });

      expect(result.current.metrics.conversationsStarted).toBe(1);
      expect(result.current.metrics.daysUsed).toBe(1);
      expect(result.current.metrics.sessionsCount).toBe(1);
      expect(result.current.metrics.lastActiveDate).toBe(new Date().toDateString());
    });

    test('✅ devrait tracker une action conversation_completed', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('conversation_completed');
      });

      expect(result.current.metrics.conversationsCompleted).toBe(1);
    });

    test('✅ devrait tracker une action notebook_entry', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('notebook_entry');
      });

      expect(result.current.metrics.notebookEntriesCreated).toBe(1);
    });

    test('✅ devrait tracker une action cycle_day_tracked', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('cycle_day_tracked');
      });

      expect(result.current.metrics.cycleTrackedDays).toBe(1);
    });

    test('✅ devrait tracker une action insight_saved', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('insight_saved');
      });

      expect(result.current.metrics.insightsSaved).toBe(1);
    });

    test('✅ devrait tracker une action vignette_engaged', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('vignette_engaged');
      });

      expect(result.current.metrics.vignettesEngaged).toBe(1);
    });

    test('✅ devrait tracker une action phase_explored avec métadonnées', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('phase_explored', { phase: 'menstrual' });
      });

      expect(result.current.metrics.phasesExplored).toContain('menstrual');
    });

    test('✅ devrait tracker une action autonomy_signal', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('autonomy_signal');
      });

      expect(result.current.metrics.autonomySignals).toBe(1);
    });

    test('✅ devrait éviter les doublons pour phases_explored', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('phase_explored', { phase: 'menstrual' });
        result.current.trackAction('phase_explored', { phase: 'menstrual' });
        result.current.trackAction('phase_explored', { phase: 'follicular' });
      });

      expect(result.current.metrics.phasesExplored).toEqual(['menstrual', 'follicular']);
    });

    test('✅ devrait incrémenter daysUsed seulement une fois par jour', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('conversation_started');
        result.current.trackAction('notebook_entry');
        result.current.trackAction('insight_saved');
      });

      expect(result.current.metrics.daysUsed).toBe(1);
      expect(result.current.metrics.sessionsCount).toBe(1);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎓 TESTS CALCUL MATURITÉ
  // ──────────────────────────────────────────────────────

  describe('Maturity Calculation', () => {
    test('✅ devrait initialiser avec maturité discovery', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      expect(result.current.maturity.current).toBe('discovery');
      expect(result.current.maturity.confidence).toBe(0);
      expect(result.current.maturity.lastCalculated).toBeNull();
    });

    test('✅ devrait calculer la maturité discovery par défaut', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      const maturity = result.current.calculateMaturity();
      
      expect(maturity.level).toBe('discovery');
      expect(maturity.confidence).toBe(0);
      expect(result.current.maturity.current).toBe('discovery');
      expect(result.current.maturity.confidence).toBe(0);
      expect(result.current.maturity.lastCalculated).toBeDefined();
    });

    test('✅ devrait évoluer vers learning avec seuils atteints', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      // Atteindre seuils learning
      act(() => {
        // 7 jours d'utilisation
        for (let i = 0; i < 7; i++) {
          result.current.trackAction('conversation_started');
        }
        // 3 conversations
        for (let i = 0; i < 3; i++) {
          result.current.trackAction('conversation_completed');
        }
        // 2 entrées notebook
        for (let i = 0; i < 2; i++) {
          result.current.trackAction('notebook_entry');
        }
      });

      const maturity = result.current.calculateMaturity();
      
      expect(maturity.level).toBe('learning');
      expect(maturity.confidence).toBeGreaterThan(0);
      expect(result.current.maturity.current).toBe('learning');
    });

    test('✅ devrait évoluer vers autonomous avec tous les seuils', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      // Atteindre seuils autonomous
      act(() => {
        // 21 jours d'utilisation
        for (let i = 0; i < 21; i++) {
          result.current.trackAction('conversation_started');
        }
        // 10 conversations
        for (let i = 0; i < 10; i++) {
          result.current.trackAction('conversation_completed');
        }
        // 8 entrées notebook
        for (let i = 0; i < 8; i++) {
          result.current.trackAction('notebook_entry');
        }
        // 1 cycle complet
        result.current.metrics.cyclesCompleted = 1;
      });

      const maturity = result.current.calculateMaturity();
      
      expect(maturity.level).toBe('autonomous');
      expect(maturity.confidence).toBeGreaterThanOrEqual(70);
      expect(result.current.maturity.current).toBe('autonomous');
    });

    test('✅ devrait calculer la confiance avec signaux d\'autonomie', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      // Préparer données pour niveau autonomous
      act(() => {
        // Atteindre seuils autonomous
        for (let i = 0; i < 21; i++) {
          result.current.trackAction('conversation_started');
        }
        for (let i = 0; i < 10; i++) {
          result.current.trackAction('conversation_completed');
        }
        for (let i = 0; i < 8; i++) {
          result.current.trackAction('notebook_entry');
        }
        result.current.metrics.cyclesCompleted = 1;
        
        // Ajouter signaux d'autonomie
        for (let i = 0; i < 5; i++) {
          result.current.trackAction('autonomy_signal');
        }
      });

      const maturity = result.current.calculateMaturity();
      
      expect(maturity.level).toBe('autonomous');
      expect(maturity.confidence).toBe(120); // 70 + (5 * 10) = 120, mais limité à 100
      expect(result.current.maturity.confidence).toBe(100); // Limité à 100
    });

    test('✅ devrait calculer la confiance learning avec phases explorées', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        // Atteindre seuils learning
        for (let i = 0; i < 7; i++) {
          result.current.trackAction('conversation_started');
        }
        for (let i = 0; i < 3; i++) {
          result.current.trackAction('conversation_completed');
        }
        for (let i = 0; i < 2; i++) {
          result.current.trackAction('notebook_entry');
        }
        
        // Explorer 3 phases
        result.current.trackAction('phase_explored', { phase: 'menstrual' });
        result.current.trackAction('phase_explored', { phase: 'follicular' });
        result.current.trackAction('phase_explored', { phase: 'ovulatory' });
      });

      const maturity = result.current.calculateMaturity();
      
      expect(maturity.level).toBe('learning');
      expect(maturity.confidence).toBe(85); // 40 + (3 * 15) = 85
    });

    test('✅ devrait calculer la confiance discovery basée sur les jours', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        // 5 jours d'utilisation
        for (let i = 0; i < 5; i++) {
          result.current.trackAction('conversation_started');
        }
      });

      const maturity = result.current.calculateMaturity();
      
      expect(maturity.level).toBe('discovery');
      expect(maturity.confidence).toBe(50); // 5 * 10 = 50
    });
  });

  // ──────────────────────────────────────────────────────
  // 📊 TESTS SCORE ENGAGEMENT
  // ──────────────────────────────────────────────────────

  describe('Engagement Score', () => {
    test('✅ devrait calculer un score de base', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      const score = result.current.getEngagementScore();
      expect(score).toBe(0);
    });

    test('✅ devrait calculer un score avec métriques', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        // 5 jours d'utilisation
        for (let i = 0; i < 5; i++) {
          result.current.trackAction('conversation_started');
        }
        // 3 conversations complétées
        for (let i = 0; i < 3; i++) {
          result.current.trackAction('conversation_completed');
        }
        // 2 phases explorées
        result.current.trackAction('phase_explored', { phase: 'menstrual' });
        result.current.trackAction('phase_explored', { phase: 'follicular' });
        // 1 signal d'autonomie
        result.current.trackAction('autonomy_signal');
      });

      const score = result.current.getEngagementScore();
      
      // Calcul attendu :
      // consistency: 5 * 5 = 25
      // depth: 3 * 10 = 30
      // breadth: 2 * 25 = 50
      // autonomy: 1 * 20 = 20
      // total: (25 + 30 + 50 + 20) / 4 = 31.25 ≈ 31
      expect(score).toBe(31);
    });

    test('✅ devrait limiter le score à 100', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        // 30 jours d'utilisation (max consistency)
        for (let i = 0; i < 30; i++) {
          result.current.trackAction('conversation_started');
        }
        // 15 conversations complétées (max depth)
        for (let i = 0; i < 15; i++) {
          result.current.trackAction('conversation_completed');
        }
        // 4 phases explorées (max breadth)
        result.current.trackAction('phase_explored', { phase: 'menstrual' });
        result.current.trackAction('phase_explored', { phase: 'follicular' });
        result.current.trackAction('phase_explored', { phase: 'ovulatory' });
        result.current.trackAction('phase_explored', { phase: 'luteal' });
        // 10 signaux d'autonomie
        for (let i = 0; i < 10; i++) {
          result.current.trackAction('autonomy_signal');
        }
      });

      const score = result.current.getEngagementScore();
      expect(score).toBe(100); // Limité à 100
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎯 TESTS MILESTONES
  // ──────────────────────────────────────────────────────

  describe('Milestones', () => {
    test('✅ devrait retourner le prochain milestone pour discovery', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      const milestone = result.current.getNextMilestone();
      
      expect(milestone.level).toBe('learning');
      expect(milestone.missing.days).toBe(7);
      expect(milestone.missing.conversations).toBe(3);
      expect(milestone.missing.entries).toBe(2);
      expect(milestone.missing.cycles).toBe(0);
    });

    test.skip('✅ devrait retourner le prochain milestone pour learning', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      // Atteindre niveau learning
      act(() => {
        for (let i = 0; i < 7; i++) {
          result.current.trackAction('conversation_started');
        }
        for (let i = 0; i < 3; i++) {
          result.current.trackAction('conversation_completed');
        }
        for (let i = 0; i < 2; i++) {
          result.current.trackAction('notebook_entry');
        }
      });

      const milestone = result.current.getNextMilestone();
      
      expect(milestone.level).toBe('autonomous');
      expect(milestone.missing.days).toBe(14); // 21 - 7
      expect(milestone.missing.conversations).toBe(7); // 10 - 3
      expect(milestone.missing.entries).toBe(6); // 8 - 2
      expect(milestone.missing.cycles).toBe(1);
    });

    test('✅ devrait retourner null pour autonomous', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      // Atteindre niveau autonomous
      act(() => {
        for (let i = 0; i < 21; i++) {
          result.current.trackAction('conversation_started');
        }
        for (let i = 0; i < 10; i++) {
          result.current.trackAction('conversation_completed');
        }
        for (let i = 0; i < 8; i++) {
          result.current.trackAction('notebook_entry');
        }
        result.current.metrics.cyclesCompleted = 1;
      });

      const milestone = result.current.getNextMilestone();
      expect(milestone).toBeNull();
    });

    test.skip('✅ devrait calculer les valeurs manquantes négatives à 0', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      // Dépasser les seuils
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.trackAction('conversation_started');
        }
        for (let i = 0; i < 5; i++) {
          result.current.trackAction('conversation_completed');
        }
        for (let i = 0; i < 5; i++) {
          result.current.trackAction('notebook_entry');
        }
      });

      const milestone = result.current.getNextMilestone();
      
      expect(milestone.missing.days).toBe(11); // 21 - 10
      expect(milestone.missing.conversations).toBe(5); // 10 - 5
      expect(milestone.missing.entries).toBe(3); // 8 - 5
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS UTILITAIRES
  // ──────────────────────────────────────────────────────

  describe('Utilities', () => {
    test('✅ devrait reset complètement l\'engagement', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      // Préparer données
      act(() => {
        result.current.trackAction('conversation_started');
        result.current.trackAction('notebook_entry');
        result.current.trackAction('phase_explored', { phase: 'menstrual' });
      });

      // Vérifier données présentes
      expect(result.current.metrics.daysUsed).toBe(1);
      expect(result.current.metrics.notebookEntriesCreated).toBe(1);
      expect(result.current.metrics.phasesExplored).toContain('menstrual');

      // Reset
      act(() => {
        result.current.resetEngagement();
      });

      // Vérifier reset
      expect(result.current.metrics.daysUsed).toBe(0);
      expect(result.current.metrics.sessionsCount).toBe(0);
      expect(result.current.metrics.totalTimeSpent).toBe(0);
      expect(result.current.metrics.lastActiveDate).toBeNull();
      expect(result.current.metrics.conversationsStarted).toBe(0);
      expect(result.current.metrics.conversationsCompleted).toBe(0);
      expect(result.current.metrics.notebookEntriesCreated).toBe(0);
      expect(result.current.metrics.cycleTrackedDays).toBe(0);
      expect(result.current.metrics.insightsSaved).toBe(0);
      expect(result.current.metrics.vignettesEngaged).toBe(0);
      expect(result.current.metrics.phasesExplored).toEqual([]);
      expect(result.current.metrics.cyclesCompleted).toBe(0);
      expect(result.current.metrics.autonomySignals).toBe(0);
      expect(result.current.maturity.current).toBe('discovery');
      expect(result.current.maturity.confidence).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS SÉCURITÉ ET VALIDATION
  // ──────────────────────────────────────────────────────

  describe('Security and Validation', () => {
    test('✅ devrait gérer les actions invalides gracieusement', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('invalid_action');
      });

      // Ne doit pas crasher, métriques inchangées sauf session tracking
      expect(result.current.metrics.daysUsed).toBe(1);
      expect(result.current.metrics.conversationsStarted).toBe(0);
    });

    test('✅ devrait gérer les métadonnées manquantes', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('phase_explored'); // Sans metadata.phase
      });

      // Ne doit pas crasher
      expect(result.current.metrics.phasesExplored).toEqual([]);
    });

    test('✅ devrait gérer les métadonnées invalides', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('phase_explored', { phase: null });
        result.current.trackAction('phase_explored', { phase: 123 });
        result.current.trackAction('phase_explored', { phase: '' });
      });

      // Ne doit pas crasher
      expect(result.current.metrics.phasesExplored).toEqual([]);
    });

    test('✅ devrait gérer les calculs avec données corrompues', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      // Corrompre les données
      act(() => {
        result.current.metrics.daysUsed = -5;
        result.current.metrics.conversationsStarted = 'invalid';
        result.current.metrics.phasesExplored = 'not-an-array';
      });

      // Les calculs ne doivent pas crasher
      const maturity = result.current.calculateMaturity();
      const score = result.current.getEngagementScore();
      const milestone = result.current.getNextMilestone();

      expect(maturity).toBeDefined();
      expect(score).toBeDefined();
      expect(milestone).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────
  // ⚡ TESTS PERFORMANCE
  // ──────────────────────────────────────────────────────

  describe('Performance', () => {
    test('⚡ devrait tracker rapidement 100 actions', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      const start = performance.now();
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.trackAction('conversation_started');
        }
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // < 100ms pour 100 actions
      expect(result.current.metrics.conversationsStarted).toBe(100);
    });

    test('⚡ devrait calculer rapidement la maturité', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      // Préparer données
      act(() => {
        for (let i = 0; i < 21; i++) {
          result.current.trackAction('conversation_started');
        }
        for (let i = 0; i < 10; i++) {
          result.current.trackAction('conversation_completed');
        }
        for (let i = 0; i < 8; i++) {
          result.current.trackAction('notebook_entry');
        }
        result.current.metrics.cyclesCompleted = 1;
      });

      const start = performance.now();
      
      // Calculs multiples
      for (let i = 0; i < 50; i++) {
        result.current.calculateMaturity();
        result.current.getEngagementScore();
        result.current.getNextMilestone();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(50); // < 50ms pour 150 calculs
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS PERSISTANCE ASYNCSTORAGE
  // ──────────────────────────────────────────────────────

  describe.skip('AsyncStorage Persistence', () => {
    test('✅ devrait persister les données dans AsyncStorage', async () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('conversation_started');
        result.current.trackAction('notebook_entry');
      });

      // Vérifier que AsyncStorage.setItem a été appelé
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      
      // Vérifier la clé de stockage
      const calls = AsyncStorage.setItem.mock.calls;
      const storageKey = calls.find(call => call[0] === 'engagement-storage');
      expect(storageKey).toBeDefined();
    });

    test('✅ devrait gérer les erreurs de persistance gracieusement', async () => {
      // Simuler erreur AsyncStorage
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const { result } = renderHook(() => useEngagementStore());
      
      // L'opération ne doit pas crasher
      act(() => {
        result.current.trackAction('conversation_started');
      });

      // Les données doivent être mises à jour en mémoire même si la persistance échoue
      expect(result.current.metrics.conversationsStarted).toBe(1);
    });

    test('✅ devrait partialiser correctement les données persistées', () => {
      const { result } = renderHook(() => useEngagementStore());
      
      act(() => {
        result.current.trackAction('conversation_started');
        result.current.trackAction('notebook_entry');
      });

      // Vérifier que seules les données nécessaires sont persistées
      const calls = AsyncStorage.setItem.mock.calls;
      const storageCall = calls.find(call => call[0] === 'engagement-storage');
      
      if (storageCall) {
        const persistedData = JSON.parse(storageCall[1]);
        expect(persistedData).toHaveProperty('metrics');
        expect(persistedData).toHaveProperty('maturity');
        expect(persistedData).not.toHaveProperty('trackAction'); // Fonctions non persistées
      }
    });
  });
}); 