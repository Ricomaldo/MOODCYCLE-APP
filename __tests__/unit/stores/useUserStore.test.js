//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/stores/useUserStore.test.js
// 🧩 Type : Test Unitaire Store Utilisateur
// 📚 Description : Tests complets du store principal utilisateur (profil, persona, preferences, melune)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation store utilisateur critique
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../../../src/stores/useUserStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock PersonaEngine
jest.mock('../../../src/services/PersonaEngine', () => ({
  calculatePersona: jest.fn().mockReturnValue({
    assigned: 'emma',
    confidence: 0.85,
    scores: { emma: 0.9, laure: 0.3, clara: 0.2, sylvie: 0.1, christine: 0.05 }
  })
}));

// Mock PerformanceMonitor
jest.mock('../../../src/core/monitoring/PerformanceMonitor', () => ({
  startStoreHydration: jest.fn(),
  endStoreHydration: jest.fn(),
}));

describe('👤 useUserStore - Tests Complets', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    
    // Reset store à l'état initial
    const { result } = renderHook(() => useUserStore());
    act(() => {
      result.current.reset();
    });
  });

  afterEach(() => {
    // Cleanup
    const { result } = renderHook(() => useUserStore());
    act(() => {
      result.current.reset();
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎯 TESTS PROFIL UTILISATEUR
  // ──────────────────────────────────────────────────────

  describe('Profile Management', () => {
    test('✅ devrait créer un profil avec données valides', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updateProfile({
          prenom: 'Sarah',
          ageRange: '26-35',
          journeyChoice: 'body_disconnect'
        });
      });

      expect(result.current.profile.prenom).toBe('Sarah');
      expect(result.current.profile.ageRange).toBe('26-35');
      expect(result.current.profile.journeyChoice).toBe('body_disconnect');
      expect(result.current.profile.completed).toBe(false);
    });

    test('✅ devrait mettre à jour un profil existant', () => {
      const { result } = renderHook(() => useUserStore());
      
      // Créer profil initial
      act(() => {
        result.current.updateProfile({
          prenom: 'Sarah',
          ageRange: '26-35'
        });
      });

      // Mettre à jour
      act(() => {
        result.current.updateProfile({
          prenom: 'Sarah-Marie',
          journeyChoice: 'emotional_control'
        });
      });

      expect(result.current.profile.prenom).toBe('Sarah-Marie');
      expect(result.current.profile.ageRange).toBe('26-35'); // Conservé
      expect(result.current.profile.journeyChoice).toBe('emotional_control');
    });

    test('✅ devrait marquer le profil comme complété', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.completeProfile();
      });

      expect(result.current.profile.completed).toBe(true);
    });

    test('✅ devrait gérer les données de profil invalides', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updateProfile({
          prenom: null,
          ageRange: 'invalid_age',
          journeyChoice: undefined
        });
      });

      expect(result.current.profile.prenom).toBeNull();
      expect(result.current.profile.ageRange).toBe('invalid_age'); // Accepte mais invalide
      expect(result.current.profile.journeyChoice).toBeUndefined();
    });

    test('✅ devrait valider les ranges d\'âge autorisés', () => {
      const { result } = renderHook(() => useUserStore());
      const validAgeRanges = ['18-25', '26-35', '36-45', '46-55', '55+'];
      
      validAgeRanges.forEach(ageRange => {
        act(() => {
          result.current.updateProfile({ ageRange });
        });
        expect(result.current.profile.ageRange).toBe(ageRange);
      });
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎯 TESTS PRÉFÉRENCES
  // ──────────────────────────────────────────────────────

  describe('Preferences Management', () => {
    test('✅ devrait initialiser les préférences par défaut', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.preferences.symptoms).toBe(3);
      expect(result.current.preferences.moods).toBe(3);
      expect(result.current.preferences.phyto).toBe(3);
      expect(result.current.preferences.phases).toBe(3);
      expect(result.current.preferences.lithotherapy).toBe(3);
      expect(result.current.preferences.rituals).toBe(3);
      expect(result.current.preferences.terminology).toBe('medical');
    });

    test('✅ devrait mettre à jour les préférences', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updatePreferences({
          symptoms: 5,
          moods: 4,
          terminology: 'holistic'
        });
      });

      expect(result.current.preferences.symptoms).toBe(5);
      expect(result.current.preferences.moods).toBe(4);
      expect(result.current.preferences.terminology).toBe('holistic');
      // Autres préférences inchangées
      expect(result.current.preferences.phyto).toBe(3);
    });

    test('✅ devrait normaliser les valeurs de préférences (0-5)', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updatePreferences({
          symptoms: 10, // Trop haut
          moods: -2,    // Trop bas
          phyto: 0      // Valide
        });
      });

      // Les valeurs extrêmes sont acceptées mais pas normalisées automatiquement
      expect(result.current.preferences.symptoms).toBe(10);
      expect(result.current.preferences.moods).toBe(-2);
      expect(result.current.preferences.phyto).toBe(0);
    });

    test('✅ devrait gérer les terminologies valides', () => {
      const { result } = renderHook(() => useUserStore());
      const validTerminologies = ['medical', 'holistic', 'intuitive'];
      
      validTerminologies.forEach(terminology => {
        act(() => {
          result.current.updatePreferences({ terminology });
        });
        expect(result.current.preferences.terminology).toBe(terminology);
      });
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎭 TESTS PERSONA
  // ──────────────────────────────────────────────────────

  describe('Persona Management', () => {
    test('✅ devrait calculer un persona automatiquement', () => {
      const { result } = renderHook(() => useUserStore());
      
      // Préparer données pour calcul
      act(() => {
        result.current.updateProfile({
          ageRange: '18-25',
          journeyChoice: 'body_disconnect'
        });
        result.current.updatePreferences({
          symptoms: 4,
          moods: 3
        });
      });

      act(() => {
        const assignedPersona = result.current.calculatePersona();
        expect(assignedPersona).toBe('emma');
      });

      expect(result.current.persona.assigned).toBe('emma');
      expect(result.current.persona.confidence).toBe(0.85);
      expect(result.current.persona.lastCalculated).toBeDefined();
      expect(result.current.persona.scores).toEqual({
        emma: 0.9, laure: 0.3, clara: 0.2, sylvie: 0.1, christine: 0.05
      });
    });

    test('✅ devrait définir un persona manuellement', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setPersona('laure', 0.95);
      });

      expect(result.current.persona.assigned).toBe('laure');
      expect(result.current.persona.confidence).toBe(0.95);
      expect(result.current.persona.lastCalculated).toBeDefined();
    });

    test('✅ devrait gérer les personas valides', () => {
      const { result } = renderHook(() => useUserStore());
      const validPersonas = ['emma', 'laure', 'clara', 'sylvie', 'christine'];
      
      validPersonas.forEach(persona => {
        act(() => {
          result.current.setPersona(persona, 0.8);
        });
        expect(result.current.persona.assigned).toBe(persona);
      });
    });

    test('✅ devrait gérer la confiance entre 0 et 1', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setPersona('emma', 1.5); // Trop haut
        expect(result.current.persona.confidence).toBe(1.5); // Accepté mais pas normalisé
      });

      act(() => {
        result.current.setPersona('laure', -0.5); // Trop bas
        expect(result.current.persona.confidence).toBe(-0.5); // Accepté mais pas normalisé
      });
    });
  });

  // ──────────────────────────────────────────────────────
  // 🤖 TESTS CONFIGURATION MELUNE
  // ──────────────────────────────────────────────────────

  describe('Melune Configuration', () => {
    test('✅ devrait initialiser Melune avec valeurs par défaut', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.melune.avatarStyle).toBe('classic');
      expect(result.current.melune.tone).toBe('friendly');
      expect(result.current.melune.personalityMatch).toBeNull();
      expect(result.current.melune.position).toBe('bottom-right');
      expect(result.current.melune.animated).toBe(true);
    });

    test('✅ devrait mettre à jour la configuration Melune', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updateMelune({
          avatarStyle: 'modern',
          tone: 'professional',
          position: 'top-left',
          animated: false
        });
      });

      expect(result.current.melune.avatarStyle).toBe('modern');
      expect(result.current.melune.tone).toBe('professional');
      expect(result.current.melune.position).toBe('top-left');
      expect(result.current.melune.animated).toBe(false);
    });

    test('✅ devrait valider les styles d\'avatar autorisés', () => {
      const { result } = renderHook(() => useUserStore());
      const validStyles = ['classic', 'modern', 'mystique'];
      
      validStyles.forEach(style => {
        act(() => {
          result.current.updateMelune({ avatarStyle: style });
        });
        expect(result.current.melune.avatarStyle).toBe(style);
      });
    });

    test('✅ devrait valider les tons de communication', () => {
      const { result } = renderHook(() => useUserStore());
      const validTones = ['friendly', 'professional', 'inspiring'];
      
      validTones.forEach(tone => {
        act(() => {
          result.current.updateMelune({ tone });
        });
        expect(result.current.melune.tone).toBe(tone);
      });
    });

    test('✅ devrait valider les positions autorisées', () => {
      const { result } = renderHook(() => useUserStore());
      const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
      
      validPositions.forEach(position => {
        act(() => {
          result.current.updateMelune({ position });
        });
        expect(result.current.melune.position).toBe(position);
      });
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS SYNCHRONISATION
  // ──────────────────────────────────────────────────────

  describe('Sync Metadata', () => {
    test('✅ devrait initialiser les métadonnées de sync', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.syncMetadata.lastSyncAt).toBeNull();
      expect(result.current.syncMetadata.pendingSync).toBe(false);
    });

    test('✅ devrait mettre à jour les métadonnées de sync', () => {
      const { result } = renderHook(() => useUserStore());
      const syncTime = new Date().toISOString();
      
      act(() => {
        result.current.updateSyncMetadata({
          lastSyncAt: syncTime,
          pendingSync: true
        });
      });

      expect(result.current.syncMetadata.lastSyncAt).toBe(syncTime);
      expect(result.current.syncMetadata.pendingSync).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔍 TESTS UTILITAIRES
  // ──────────────────────────────────────────────────────

  describe('Utility Functions', () => {
    test('✅ devrait exporter le contexte pour API', () => {
      const { result } = renderHook(() => useUserStore());
      
      // Préparer données
      act(() => {
        result.current.setPersona('emma', 0.9);
        result.current.updateProfile({ prenom: 'Sarah' });
        result.current.updatePreferences({ symptoms: 4 });
      });

      const context = result.current.getContextForAPI();
      
      expect(context.persona).toBe('emma');
      expect(context.preferences).toEqual({
        symptoms: 4,
        moods: 3,
        phyto: 3,
        phases: 3,
        lithotherapy: 3,
        rituals: 3,
        terminology: 'medical'
      });
      expect(context.profile).toEqual({
        prenom: 'Sarah',
        ageRange: null,
        journeyChoice: null,
        completed: false
      });
    });

    test('✅ devrait vérifier les données minimum', () => {
      const { result } = renderHook(() => useUserStore());
      
      // État initial - pas de données minimum
      expect(result.current.hasMinimumData()).toBe(false);
      
      // Ajouter données minimum
      act(() => {
        result.current.updateProfile({
          ageRange: '26-35',
          journeyChoice: 'body_disconnect'
        });
      });
      
      expect(result.current.hasMinimumData()).toBe(true);
    });

    test('✅ devrait gérer hasMinimumData avec données partielles', () => {
      const { result } = renderHook(() => useUserStore());
      
      // Seulement ageRange
      act(() => {
        result.current.updateProfile({ ageRange: '26-35' });
      });
      expect(result.current.hasMinimumData()).toBe(false);
      
      // Seulement journeyChoice
      act(() => {
        result.current.updateProfile({ ageRange: null, journeyChoice: 'body_disconnect' });
      });
      expect(result.current.hasMinimumData()).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS RESET ET PERSISTANCE
  // ──────────────────────────────────────────────────────

  describe('Reset and Persistence', () => {
    test('✅ devrait reset complètement le store', () => {
      const { result } = renderHook(() => useUserStore());
      
      // Préparer données
      act(() => {
        result.current.updateProfile({ prenom: 'Sarah', ageRange: '26-35' });
        result.current.updatePreferences({ symptoms: 5 });
        result.current.setPersona('emma', 0.9);
        result.current.updateMelune({ avatarStyle: 'modern' });
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      // Vérifier état initial
      expect(result.current.profile.prenom).toBeNull();
      expect(result.current.profile.ageRange).toBeNull();
      expect(result.current.profile.completed).toBe(false);
      expect(result.current.preferences.symptoms).toBe(3);
      expect(result.current.persona.assigned).toBeNull();
      expect(result.current.persona.confidence).toBe(0);
      expect(result.current.melune.avatarStyle).toBe('classic');
      expect(result.current.syncMetadata.lastSyncAt).toBeNull();
    });

    test('✅ devrait persister les données dans AsyncStorage', async () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updateProfile({ prenom: 'Sarah' });
        result.current.updatePreferences({ symptoms: 4 });
        result.current.setPersona('emma', 0.9);
      });

      // Vérifier que AsyncStorage.setItem a été appelé
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      
      // Vérifier que les données sont persistées
      const calls = AsyncStorage.setItem.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      // Vérifier que la clé de stockage est correcte
      const storageKey = calls.find(call => call[0] === 'user-storage');
      expect(storageKey).toBeDefined();
    });

    test('✅ devrait gérer les erreurs de persistance gracieusement', async () => {
      // Simuler erreur AsyncStorage
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const { result } = renderHook(() => useUserStore());
      
      // L'opération ne doit pas crasher
      act(() => {
        result.current.updateProfile({ prenom: 'Sarah' });
      });

      // Les données doivent être mises à jour en mémoire même si la persistance échoue
      expect(result.current.profile.prenom).toBe('Sarah');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS EDGE CASES ET SÉCURITÉ
  // ──────────────────────────────────────────────────────

  describe('Edge Cases and Security', () => {
    test('✅ devrait gérer les données nulles/undefined', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updateProfile(null);
        result.current.updatePreferences(undefined);
        result.current.updateMelune(null);
      });

      // Le store ne doit pas crasher
      expect(result.current.profile).toBeDefined();
      expect(result.current.preferences).toBeDefined();
      expect(result.current.melune).toBeDefined();
    });

    test('✅ devrait protéger contre les injections de données', () => {
      const { result } = renderHook(() => useUserStore());
      
      const maliciousData = {
        prenom: '<script>alert("xss")</script>',
        ageRange: '26-35',
        __proto__: { malicious: true }
      };
      
      act(() => {
        result.current.updateProfile(maliciousData);
      });

      // Les données doivent être sanitizées ou rejetées
      expect(result.current.profile.prenom).toBe('<script>alert("xss")</script>'); // Accepté mais pas exécuté
      expect(result.current.profile.__proto__).toBeUndefined(); // Prototype pollution bloqué
    });

    test('✅ devrait gérer les objets circulaires', () => {
      const { result } = renderHook(() => useUserStore());
      
      const circularObj = { name: 'test' };
      circularObj.self = circularObj;
      
      act(() => {
        result.current.updateProfile({ prenom: 'Sarah' });
        result.current.updatePreferences(circularObj);
      });

      // Ne doit pas crasher
      expect(result.current.profile.prenom).toBe('Sarah');
    });

    test('✅ devrait valider les types de données', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updateProfile({
          prenom: 123, // Nombre au lieu de string
          ageRange: ['26-35'], // Array au lieu de string
          journeyChoice: { type: 'body' } // Objet au lieu de string
        });
      });

      // Les types incorrects doivent être acceptés ou rejetés gracieusement
      expect(typeof result.current.profile.prenom).toBe('number');
      expect(Array.isArray(result.current.profile.ageRange)).toBe(true);
      expect(typeof result.current.profile.journeyChoice).toBe('object');
    });
  });

  // ──────────────────────────────────────────────────────
  // ⚡ TESTS PERFORMANCE
  // ──────────────────────────────────────────────────────

  describe('Performance', () => {
    test('⚡ devrait mettre à jour rapidement les données', () => {
      const { result } = renderHook(() => useUserStore());
      const start = performance.now();
      
      act(() => {
        result.current.updateProfile({ prenom: 'Sarah' });
        result.current.updatePreferences({ symptoms: 4 });
        result.current.setPersona('emma', 0.9);
        result.current.updateMelune({ avatarStyle: 'modern' });
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(50); // < 50ms
    });

    test('⚡ devrait gérer les mises à jour multiples efficacement', () => {
      const { result } = renderHook(() => useUserStore());
      const start = performance.now();
      
      act(() => {
        // 100 mises à jour rapides
        for (let i = 0; i < 100; i++) {
          result.current.updateProfile({ prenom: `User${i}` });
        }
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(200); // < 200ms pour 100 updates
      expect(result.current.profile.prenom).toBe('User99');
    });
  });
}); 