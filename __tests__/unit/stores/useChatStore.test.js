//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/stores/useChatStore.test.js
// 🧩 Type : Test Unitaire Store Chat
// 📚 Description : Tests complets du store chat (messages, context, suggestions, export)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation store chat critique
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChatStore } from '../../../src/stores/useChatStore';

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

// Mock useNotebookStore
jest.mock('../../../src/stores/useNotebookStore', () => ({
  useNotebookStore: {
    getState: jest.fn().mockReturnValue({
      addEntry: jest.fn().mockReturnValue('entry-id')
    })
  }
}));

// Mock PerformanceMonitor
jest.mock('../../../src/core/monitoring/PerformanceMonitor', () => ({
  startStoreHydration: jest.fn(),
  endStoreHydration: jest.fn(),
}));

describe('💬 useChatStore - Tests Complets', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    
    // Reset store à l'état initial
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.clearMessages();
    });
  });

  afterEach(() => {
    // Cleanup
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.clearMessages();
    });
  });

  // ──────────────────────────────────────────────────────
  // 💬 TESTS GESTION MESSAGES
  // ──────────────────────────────────────────────────────

  describe('Message Management', () => {
    test('✅ devrait initialiser avec état vide', () => {
      const { result } = renderHook(() => useChatStore());
      
      expect(result.current.messages).toEqual([]);
      expect(result.current.isTyping).toBe(false);
      expect(result.current.isWaitingResponse).toBe(false);
      expect(result.current.pendingMessages).toEqual([]);
      expect(result.current.suggestions).toHaveLength(4);
    });

    test('✅ devrait ajouter un message utilisateur', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        const messageId = result.current.addUserMessage('Bonjour Melune !');
        expect(messageId).toBeDefined();
      });

      expect(result.current.messages).toHaveLength(1);
      const message = result.current.messages[0];
      expect(message.type).toBe('user');
      expect(message.content).toBe('Bonjour Melune !');
      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeDefined();
    });

    test('✅ devrait ajouter un message Melune', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        const messageId = result.current.addMeluneMessage(
          'Bonjour ! Comment te sens-tu aujourd\'hui ?',
          { mood: 'friendly', persona: 'emma' }
        );
        expect(messageId).toBeDefined();
      });

      expect(result.current.messages).toHaveLength(1);
      const message = result.current.messages[0];
      expect(message.type).toBe('melune');
      expect(message.content).toBe('Bonjour ! Comment te sens-tu aujourd\'hui ?');
      expect(message.mood).toBe('friendly');
      expect(message.persona).toBe('emma');
      expect(message.isOffline).toBe(false);
    });

    test('✅ devrait ajouter un message avec métadonnées', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.addMessage('user', 'Test métadonnées', {
          phase: 'menstrual',
          mood: 'fatigue',
          customField: 'valeur'
        });
      });

      expect(result.current.messages[0].phase).toBe('menstrual');
      expect(result.current.messages[0].mood).toBe('fatigue');
      expect(result.current.messages[0].customField).toBe('valeur');
    });

    test('✅ devrait gérer les messages avec contenu vide', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.addUserMessage('');
        result.current.addMeluneMessage(null);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('');
      expect(result.current.messages[1].content).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS ÉTATS CONVERSATION
  // ──────────────────────────────────────────────────────

  describe('Conversation States', () => {
    test('✅ devrait gérer l\'état de frappe', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.setTyping(true);
      });
      expect(result.current.isTyping).toBe(true);

      act(() => {
        result.current.setTyping(false);
      });
      expect(result.current.isTyping).toBe(false);
    });

    test('✅ devrait gérer l\'état d\'attente de réponse', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.setWaitingResponse(true);
      });
      expect(result.current.isWaitingResponse).toBe(true);

      act(() => {
        result.current.setWaitingResponse(false);
      });
      expect(result.current.isWaitingResponse).toBe(false);
    });

    test('✅ devrait gérer les états simultanés', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.setTyping(true);
        result.current.setWaitingResponse(true);
      });

      expect(result.current.isTyping).toBe(true);
      expect(result.current.isWaitingResponse).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────
  // 📤 TESTS MESSAGES EN ATTENTE
  // ──────────────────────────────────────────────────────

  describe('Pending Messages', () => {
    test('✅ devrait ajouter un message en attente', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        const pendingId = result.current.addPendingMessage('Message en attente');
        expect(pendingId).toContain('pending-');
      });

      expect(result.current.pendingMessages).toHaveLength(1);
      const pendingMessage = result.current.pendingMessages[0];
      expect(pendingMessage.type).toBe('user');
      expect(pendingMessage.content).toBe('Message en attente');
      expect(pendingMessage.status).toBe('pending');
    });

    test('✅ devrait marquer un message comme envoyé', () => {
      const { result } = renderHook(() => useChatStore());
      
      let pendingId;
      act(() => {
        pendingId = result.current.addPendingMessage('Message à envoyer');
      });

      expect(result.current.pendingMessages).toHaveLength(1);

      act(() => {
        result.current.markMessageSent(pendingId);
      });

      expect(result.current.pendingMessages).toHaveLength(0);
    });

    test('✅ devrait gérer plusieurs messages en attente', () => {
      const { result } = renderHook(() => useChatStore());
      
      let pendingIds = [];
      act(() => {
        pendingIds.push(result.current.addPendingMessage('Message 1'));
        pendingIds.push(result.current.addPendingMessage('Message 2'));
        pendingIds.push(result.current.addPendingMessage('Message 3'));
      });

      expect(result.current.pendingMessages).toHaveLength(3);

      act(() => {
        result.current.markMessageSent(pendingIds[1]); // Supprimer le deuxième
      });

      expect(result.current.pendingMessages).toHaveLength(2);
      expect(result.current.pendingMessages[0].content).toBe('Message 1');
      expect(result.current.pendingMessages[1].content).toBe('Message 3');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎯 TESTS SUGGESTIONS
  // ──────────────────────────────────────────────────────

  describe('Suggestions', () => {
    test('✅ devrait initialiser avec suggestions par défaut', () => {
      const { result } = renderHook(() => useChatStore());
      
      expect(result.current.suggestions).toEqual([
        "Comment je me sens aujourd'hui ?",
        "Conseils pour ma phase actuelle",
        "Aide-moi à comprendre mon cycle",
        "Rituels de bien-être",
      ]);
    });

    test('✅ devrait mettre à jour les suggestions', () => {
      const { result } = renderHook(() => useChatStore());
      
      const newSuggestions = [
        "Nouvelle suggestion 1",
        "Nouvelle suggestion 2"
      ];

      act(() => {
        result.current.updateSuggestions(newSuggestions);
      });

      expect(result.current.suggestions).toEqual(newSuggestions);
    });

    test('✅ devrait retourner des suggestions contextuelles par phase', () => {
      const { result } = renderHook(() => useChatStore());
      
      const contextualSuggestions = result.current.getContextualSuggestions();
      
      // Phase menstruelle (mock)
      expect(contextualSuggestions).toEqual([
        "Comment soulager mes douleurs ?",
        "Rituels cocooning règles",
        "Nutrition pendant les règles",
      ]);
    });

    test('✅ devrait fallback sur suggestions par défaut si phase invalide', () => {
      const { result } = renderHook(() => useChatStore());
      
      // Mock une phase invalide
      const { getCurrentPhase } = require('../../../src/utils/cycleCalculations');
      getCurrentPhase.mockReturnValueOnce('invalid_phase');

      const contextualSuggestions = result.current.getContextualSuggestions();
      expect(contextualSuggestions).toEqual(result.current.suggestions);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔍 TESTS UTILITAIRES MESSAGES
  // ──────────────────────────────────────────────────────

  describe('Message Utilities', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useChatStore());
      
      // Préparer messages de test
      act(() => {
        result.current.addUserMessage('Message utilisateur 1');
        result.current.addMeluneMessage('Réponse Melune 1');
        result.current.addUserMessage('Message utilisateur 2');
        result.current.addMeluneMessage('Réponse Melune 2');
        result.current.addUserMessage('Message utilisateur 3');
      });
    });

    test('✅ devrait récupérer les derniers messages', () => {
      const { result } = renderHook(() => useChatStore());
      
      const lastMessages = result.current.getLastMessages(3);
      expect(lastMessages).toHaveLength(3);
      expect(lastMessages[0].content).toBe('Message utilisateur 2');
      expect(lastMessages[1].content).toBe('Réponse Melune 2');
      expect(lastMessages[2].content).toBe('Message utilisateur 3');
    });

    test('✅ devrait récupérer tous les messages si count > total', () => {
      const { result } = renderHook(() => useChatStore());
      
      const lastMessages = result.current.getLastMessages(10);
      expect(lastMessages).toHaveLength(5);
    });

    test('✅ devrait filtrer les messages par type', () => {
      const { result } = renderHook(() => useChatStore());
      
      const userMessages = result.current.getMessagesByType('user');
      expect(userMessages).toHaveLength(3);
      userMessages.forEach(msg => expect(msg.type).toBe('user'));

      const meluneMessages = result.current.getMessagesByType('melune');
      expect(meluneMessages).toHaveLength(2);
      meluneMessages.forEach(msg => expect(msg.type).toBe('melune'));
    });

    test('✅ devrait compter les messages correctement', () => {
      const { result } = renderHook(() => useChatStore());
      
      const counts = result.current.getMessagesCount();
      expect(counts.total).toBe(5);
      expect(counts.user).toBe(3);
      expect(counts.melune).toBe(2);
    });

    test('✅ devrait gérer les comptages avec messages vides', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.clearMessages();
      });

      const counts = result.current.getMessagesCount();
      expect(counts.total).toBe(0);
      expect(counts.user).toBe(0);
      expect(counts.melune).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // 💾 TESTS SAUVEGARDE ET EXPORT
  // ──────────────────────────────────────────────────────

  describe('Save and Export', () => {
    test('✅ devrait sauvegarder un message Melune dans le notebook', () => {
      const { result } = renderHook(() => useChatStore());
      
      let messageId;
      act(() => {
        messageId = result.current.addMeluneMessage('Conseil important à sauvegarder');
      });

      act(() => {
        const saved = result.current.saveMessageToNotebook(messageId);
        expect(saved).toBe(true);
      });

      // Vérifier que useNotebookStore.addEntry a été appelé
      const { useNotebookStore } = require('../../../src/stores/useNotebookStore');
      expect(useNotebookStore.getState().addEntry).toHaveBeenCalledWith(
        'Conseil important à sauvegarder',
        'saved',
        ['#melune', '#menstrual']
      );
    });

    test('✅ devrait refuser de sauvegarder un message utilisateur', () => {
      const { result } = renderHook(() => useChatStore());
      
      let messageId;
      act(() => {
        messageId = result.current.addUserMessage('Message utilisateur');
      });

      act(() => {
        const saved = result.current.saveMessageToNotebook(messageId);
        expect(saved).toBe(false);
      });

      // Vérifier que useNotebookStore.addEntry n'a PAS été appelé
      const { useNotebookStore } = require('../../../src/stores/useNotebookStore');
      expect(useNotebookStore.getState().addEntry).not.toHaveBeenCalled();
    });

    test('✅ devrait refuser de sauvegarder un message inexistant', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        const saved = result.current.saveMessageToNotebook('inexistant-id');
        expect(saved).toBe(false);
      });
    });

    test('✅ devrait exporter une conversation', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.addUserMessage('Bonjour');
        result.current.addMeluneMessage('Salut !');
        result.current.addUserMessage('Comment ça va ?');
      });

      const exportData = result.current.exportConversation();
      
      expect(exportData).toHaveProperty('timestamp');
      expect(exportData).toHaveProperty('messagesCount');
      expect(exportData).toHaveProperty('messages');
      expect(exportData.messagesCount).toBe(3);
      expect(exportData.messages).toHaveLength(3);
      expect(exportData.messages[0].content).toBe('Bonjour');
      expect(exportData.messages[1].content).toBe('Salut !');
      expect(exportData.messages[2].content).toBe('Comment ça va ?');
    });

    test('✅ devrait exporter une conversation vide', () => {
      const { result } = renderHook(() => useChatStore());
      
      const exportData = result.current.exportConversation();
      
      expect(exportData.messagesCount).toBe(0);
      expect(exportData.messages).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS GESTION HISTORIQUE
  // ──────────────────────────────────────────────────────

  describe('History Management', () => {
    test('✅ devrait limiter l\'historique à 100 messages', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        // Ajouter 105 messages
        for (let i = 0; i < 105; i++) {
          result.current.addUserMessage(`Message ${i}`);
        }
      });

      expect(result.current.messages).toHaveLength(100);
      expect(result.current.messages[0].content).toBe('Message 5'); // Les 5 premiers supprimés
      expect(result.current.messages[99].content).toBe('Message 104');
    });

    test('✅ devrait maintenir l\'ordre chronologique', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.addUserMessage('Premier');
        result.current.addMeluneMessage('Deuxième');
        result.current.addUserMessage('Troisième');
      });

      expect(result.current.messages[0].content).toBe('Premier');
      expect(result.current.messages[1].content).toBe('Deuxième');
      expect(result.current.messages[2].content).toBe('Troisième');
    });

    test('✅ devrait vider complètement l\'historique', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.addUserMessage('Test');
        result.current.addMeluneMessage('Test 2');
      });

      expect(result.current.messages).toHaveLength(2);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
      expect(result.current.pendingMessages).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS SÉCURITÉ ET VALIDATION
  // ──────────────────────────────────────────────────────

  describe('Security and Validation', () => {
    test('✅ devrait gérer les contenus très longs', () => {
      const { result } = renderHook(() => useChatStore());
      
      const longContent = 'a'.repeat(10000);
      act(() => {
        result.current.addUserMessage(longContent);
      });

      expect(result.current.messages[0].content).toBe(longContent);
    });

    test('✅ devrait gérer les métadonnées complexes', () => {
      const { result } = renderHook(() => useChatStore());
      
      const complexMetadata = {
        phase: 'menstrual',
        mood: 'fatigue',
        energy: 2,
        symptoms: ['cramps', 'fatigue'],
        customObject: { nested: { value: 'test' } },
        array: [1, 2, 3]
      };

      act(() => {
        result.current.addMessage('user', 'Test métadonnées complexes', complexMetadata);
      });

      const message = result.current.messages[0];
      expect(message.phase).toBe('menstrual');
      expect(message.mood).toBe('fatigue');
      expect(message.energy).toBe(2);
      expect(message.symptoms).toEqual(['cramps', 'fatigue']);
      expect(message.customObject).toEqual({ nested: { value: 'test' } });
      expect(message.array).toEqual([1, 2, 3]);
    });

    test('✅ devrait gérer les données corrompues gracieusement', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.addMessage(null, null, null);
      });

      // Ne doit pas crasher
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].type).toBeNull();
      expect(result.current.messages[0].content).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────
  // ⚡ TESTS PERFORMANCE
  // ──────────────────────────────────────────────────────

  describe('Performance', () => {
    test('⚡ devrait ajouter rapidement 100 messages', () => {
      const { result } = renderHook(() => useChatStore());
      
      const start = performance.now();
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addUserMessage(`Message ${i}`);
        }
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // < 100ms pour 100 messages
      expect(result.current.messages).toHaveLength(100);
    });

    test('⚡ devrait rechercher rapidement dans 100 messages', () => {
      const { result } = renderHook(() => useChatStore());
      
      // Préparer 100 messages
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addUserMessage(`Message ${i}`);
        }
      });

      const start = performance.now();
      
      const userMessages = result.current.getMessagesByType('user');
      const counts = result.current.getMessagesCount();
      
      const end = performance.now();
      expect(end - start).toBeLessThan(50); // < 50ms pour recherches
      expect(userMessages).toHaveLength(100);
      expect(counts.user).toBe(100);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS PERSISTANCE ASYNCSTORAGE
  // ──────────────────────────────────────────────────────

  describe('AsyncStorage Persistence', () => {
    test('✅ devrait persister les données dans AsyncStorage', async () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.addUserMessage('Test persistance');
        result.current.setTyping(true);
      });

      // Vérifier que AsyncStorage.setItem a été appelé
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      
      // Vérifier la clé de stockage
      const calls = AsyncStorage.setItem.mock.calls;
      const storageKey = calls.find(call => call[0] === 'chat-storage');
      expect(storageKey).toBeDefined();
    });

    test('✅ devrait gérer les erreurs de persistance gracieusement', async () => {
      // Simuler erreur AsyncStorage
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const { result } = renderHook(() => useChatStore());
      
      // L'opération ne doit pas crasher
      act(() => {
        result.current.addUserMessage('Test erreur storage');
      });

      // Les données doivent être mises à jour en mémoire même si la persistance échoue
      expect(result.current.messages).toHaveLength(1);
    });

    test('✅ devrait partialiser correctement les données persistées', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.addUserMessage('Test partialize');
        result.current.setTyping(true);
      });

      // Vérifier que seules les données nécessaires sont persistées
      const calls = AsyncStorage.setItem.mock.calls;
      const storageCall = calls.find(call => call[0] === 'chat-storage');
      
      if (storageCall) {
        const persistedData = JSON.parse(storageCall[1]);
        expect(persistedData).toHaveProperty('messages');
        expect(persistedData).toHaveProperty('isTyping');
        expect(persistedData).toHaveProperty('suggestions');
        expect(persistedData).not.toHaveProperty('addMessage'); // Fonctions non persistées
      }
    });
  });
}); 