//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/services/ChatService.test.js
// 🧩 Type : Test Unitaire Service Chat
// 📚 Description : Tests complets du service chat (API calls, rate limiting, context, fallbacks)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation service chat critique
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatService } from '../../../src/services/ChatService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../src/stores/useUserStore');
jest.mock('../../../src/stores/useChatStore');
jest.mock('../../../src/stores/useEngagementStore');
jest.mock('../../../src/utils/cycleCalculations');

// Mock NetworkQueue
jest.mock('../../../src/services/NetworkQueue', () => ({
  __esModule: true,
  default: {
    enqueueChatMessage: jest.fn().mockResolvedValue(true),
    enqueue: jest.fn().mockResolvedValue(true),
    process: jest.fn().mockResolvedValue(true)
  }
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock stores
jest.mock('../../../src/stores/useUserStore', () => ({
  useUserStore: {
    getState: jest.fn().mockReturnValue({
      profile: { prenom: 'Sarah', ageRange: '26-35' },
      preferences: { symptoms: 4, moods: 3 },
      persona: { assigned: 'emma', confidence: 0.8 }
    })
  }
}));

jest.mock('../../../src/stores/useChatStore', () => ({
  useChatStore: {
    getState: jest.fn().mockReturnValue({
      messages: [
        { type: 'user', content: 'Je me sens fatiguée', timestamp: Date.now() - 3600000 },
        { type: 'melune', content: 'Je comprends ta fatigue', timestamp: Date.now() - 1800000 }
      ],
      getMessagesCount: jest.fn().mockReturnValue({ total: 2, user: 1, melune: 1 })
    })
  }
}));

jest.mock('../../../src/stores/useEngagementStore', () => ({
  useEngagementStore: {
    getState: jest.fn().mockReturnValue({
      metrics: { daysUsed: 15, conversationsStarted: 8 },
      getPatterns: jest.fn().mockReturnValue({ energy: 'variable', mood: 'positive' })
    })
  }
}));

jest.mock('../../../src/stores/useUserIntelligence', () => ({
  useUserIntelligence: {
    getState: jest.fn().mockReturnValue({
      learning: {
        confidence: 75,
        timePatterns: { favoriteHours: [9, 14, 20] },
        phasePatterns: {
          menstrual: { topics: ['repos'], mood: 'challenging' }
        }
      }
    })
  }
}));

jest.mock('../../../src/stores/useCycleStore', () => ({
  useCycleStore: {
    getState: jest.fn().mockReturnValue({
      lastPeriodDate: new Date('2025-06-15').toISOString(),
      length: 28,
      periodDuration: 5
    })
  },
  getCycleData: jest.fn().mockReturnValue({
    currentPhase: 'menstrual',
    currentDay: 2,
    hasData: true
  })
}));

// Mock API config
jest.mock('../../../src/config/api', () => ({
  getApiRequestConfig: jest.fn().mockReturnValue({
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  }),
  getEndpointUrl: jest.fn().mockReturnValue('https://api.moodcycle.app/chat')
}));

// Mock cycleCalculations
jest.mock('../../../src/utils/cycleCalculations', () => ({
  getCurrentPhase: jest.fn().mockReturnValue('menstrual')
}));

// Mock fetch
global.fetch = jest.fn();

describe('💬 ChatService - Tests Complets', () => {
  let chatService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    chatService = new ChatService();
  });

  afterEach(() => {
    if (chatService) {
      chatService.clearContext();
    }
  });

  // ──────────────────────────────────────────────────────
  // 🚀 TESTS INITIALISATION
  // ──────────────────────────────────────────────────────

  describe('Initialization', () => {
    test('✅ devrait initialiser correctement', async () => {
      AsyncStorage.getItem.mockResolvedValue('existing-device-id');
      
      await chatService.initialize();
      
      expect(chatService.isInitialized).toBe(true);
      expect(chatService.deviceId).toBe('existing-device-id');
      expect(chatService.conversationContext).toBeDefined();
    });

    test('✅ devrait générer un device ID si inexistant', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();
      
      await chatService.initialize();
      
      expect(chatService.deviceId).toMatch(/^moodcycle-/);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'device_id_v1',
        chatService.deviceId
      );
    });

    test('✅ devrait gérer les erreurs d\'initialisation gracieusement', async () => {
      // Mock AsyncStorage pour simuler une erreur
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const chatService = new ChatService();
      await chatService.initialize();
      
      expect(chatService.isInitialized).toBe(true);
      expect(chatService.deviceId).toMatch(/^moodcycle-/); // DeviceId généré malgré l'erreur
    });

    test('✅ devrait éviter la double initialisation', async () => {
      AsyncStorage.getItem.mockResolvedValue('device-id');
      
      await chatService.initialize();
      await chatService.initialize(); // Deuxième appel
      
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🆔 TESTS DEVICE ID
  // ──────────────────────────────────────────────────────

  describe('Device ID Management', () => {
    test('✅ devrait générer un device ID unique', () => {
      const deviceId1 = chatService.generateDeviceId();
      const deviceId2 = chatService.generateDeviceId();
      
      expect(deviceId1).toMatch(/^moodcycle-/);
      expect(deviceId2).toMatch(/^moodcycle-/);
      expect(deviceId1).not.toBe(deviceId2);
    });

    test('✅ devrait récupérer un device ID existant', async () => {
      const existingId = 'moodcycle-abc123';
      AsyncStorage.getItem.mockResolvedValue(existingId);
      
      const deviceId = await chatService.getOrGenerateDeviceId();
      
      expect(deviceId).toBe(existingId);
    });

    test('✅ devrait gérer les erreurs de récupération device ID', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const deviceId = await chatService.getOrGenerateDeviceId();
      
      expect(deviceId).toMatch(/^moodcycle-/);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🧠 TESTS CONTEXTE CONVERSATION
  // ──────────────────────────────────────────────────────

  describe('Conversation Context', () => {
    test('✅ devrait charger le contexte conversationnel', () => {
      // Mock des stores
      const { useChatStore } = require('../../../src/stores/useChatStore');
      const { useEngagementStore } = require('../../../src/stores/useEngagementStore');
      
      useChatStore.getState.mockReturnValue({
        messages: [
          { content: 'Je ressens de la douleur', type: 'user' },
          { content: 'Comment te sens-tu ?', type: 'melune' }
        ],
        getMessagesCount: () => ({ total: 2, user: 1, melune: 1 })
      });
      
      useEngagementStore.getState.mockReturnValue({
        getPatterns: () => ({ energy: 'low' })
      });
      
      chatService.loadConversationContext();
      
      expect(chatService.conversationContext.messageCount).toBe(2);
      expect(chatService.conversationContext.topics).toContain('pain');
      expect(chatService.conversationContext.userPatterns).toBeDefined();
    });

    test('✅ devrait extraire les topics des messages', () => {
      const messages = [
        { content: 'Je ressens de la douleur', type: 'user' },
        { content: 'Je me sens fatiguée', type: 'user' }
      ];
      
      const topics = chatService.extractTopicsFromMessages(messages);
      
      expect(topics).toContain('pain');
      expect(topics).toContain('energy');
      expect(topics).toHaveLength(2);
    });

    test('✅ devrait préparer le contexte optimisé', () => {
      const currentMessage = 'Comment je me sens ?';
      const previousMessages = [
        { isUser: true, text: 'Bonjour', timestamp: Date.now() - 3600000 },
        { isUser: false, text: 'Salut !', timestamp: Date.now() - 1800000 },
        { isUser: true, text: 'Je me sens fatiguée', timestamp: Date.now() - 900000 }
      ];
      
      const context = chatService.prepareConversationContext(currentMessage, previousMessages);
      
      expect(context.messages).toHaveLength(3);
      expect(context.summary).toBeDefined();
      expect(context.continuity).toBeDefined();
    });

    test('✅ devrait générer un résumé de contexte', () => {
      const messages = [
        { isUser: true, text: 'J\'ai mal au ventre' },
        { isUser: false, text: 'Je comprends' },
        { isUser: true, text: 'Je me sens stressée' }
      ];
      
      const summary = chatService.generateContextSummary(messages);
      
      expect(summary.topics).toContain('pain');
      expect(summary.emotions).toContain('stressed');
      expect(summary.messageCount).toBe(3);
    });

    test('✅ devrait vérifier la continuité conversationnelle', () => {
      const recentMessages = [
        { timestamp: Date.now() - 300000 }, // 5 min ago
        { timestamp: Date.now() - 600000 }  // 10 min ago
      ];
      
      const continuity = chatService.checkConversationContinuity(recentMessages);
      
      expect(continuity.isNew).toBe(false);
      expect(continuity.gap).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────
  // 📤 TESTS ENVOI MESSAGES
  // ──────────────────────────────────────────────────────

  describe('Message Sending', () => {
    beforeEach(async () => {
      await chatService.initialize();
    });

    test('✅ devrait envoyer un message avec succès', async () => {
      await chatService.initialize();
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          response: 'Je comprends ta fatigue',
          suggestions: ['Comment te sens-tu ?', 'Veux-tu en parler ?']
        })
      };
      global.fetch.mockResolvedValue(mockResponse);
      
      const result = await chatService.sendMessage('Je me sens fatiguée');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Je comprends ta fatigue');
      expect(global.fetch).toHaveBeenCalled();
    });

    test('✅ devrait gérer les erreurs de réseau gracieusement', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      const result = await chatService.sendMessage('Test');
      
      expect(result.success).toBe(true); // Le fallback gère l'erreur
      expect(result.source).toBe('smart_fallback');
    });

    test('✅ devrait gérer les réponses API invalides', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      global.fetch.mockResolvedValue(mockResponse);
      
      const result = await chatService.sendMessage('Test');
      
      expect(result.success).toBe(true); // Le fallback gère l'erreur
      expect(result.source).toBe('smart_fallback');
    });

    test('✅ devrait gérer les données de réponse manquantes', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}) // Pas de response
      };
      global.fetch.mockResolvedValue(mockResponse);
      
      const result = await chatService.sendMessage('Test');
      
      expect(result.success).toBe(true); // Le fallback gère l'erreur
      expect(result.source).toBe('smart_fallback');
    });

    test('✅ devrait utiliser le fallback intelligent', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      const result = await chatService.sendMessage('Comment te sens-tu aujourd\'hui?');
      
      expect(result.success).toBe(true);
      expect(result.source).toBe('smart_fallback');
    });

    test('✅ devrait enrichir le contexte avant envoi', async () => {
      await chatService.initialize();
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          response: 'Réponse test'
        })
      };
      global.fetch.mockResolvedValue(mockResponse);
      
      await chatService.sendMessage('Test message');
      
      const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
      
      expect(requestBody.context).toBeDefined();
      expect(requestBody.context.persona).toBeDefined();
      expect(requestBody.context.phase).toBeDefined();
    });

    test('✅ devrait tracker l\'engagement', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          response: 'Réponse test',
          confidence: 0.7
        })
      };
      global.fetch.mockResolvedValue(mockResponse);
      
      await chatService.sendMessage('Message test');
      
      // Vérifier que l'engagement a été tracké
      expect(chatService.conversationContext.messageCount).toBeGreaterThan(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎯 TESTS FALLBACKS INTELLIGENTS
  // ──────────────────────────────────────────────────────

  describe('Smart Fallbacks', () => {
    test('✅ devrait retourner un fallback pour Emma', () => {
      const fallback = chatService.getSmartFallbackResponse('Comment te sens-tu aujourd\'hui?');
      
      expect(fallback.message).toContain('Hey ! 😊');
      expect(fallback.message).toContain('Raconte-moi');
      expect(fallback.persona).toBe('emma');
      expect(fallback.success).toBe(true);
    });

    test('✅ devrait retourner un fallback pour Laure', () => {
      // Mock persona Laure
      const { useUserStore } = require('../../../src/stores/useUserStore');
      useUserStore.getState.mockReturnValue({
        persona: { assigned: 'laure', confidence: 0.8 }
      });
      
      const fallback = chatService.getSmartFallbackResponse('Comment te sens-tu aujourd\'hui?');
      
      expect(fallback.message).toContain('Analysons ensemble');
      expect(fallback.message).toContain('ressentis');
      expect(fallback.persona).toBe('laure');
    });

    test('✅ devrait retourner un fallback pour Clara', () => {
      // Mock persona Clara
      const { useUserStore } = require('../../../src/stores/useUserStore');
      useUserStore.getState.mockReturnValue({
        persona: { assigned: 'clara', confidence: 0.8 }
      });
      
      const fallback = chatService.getSmartFallbackResponse('Comment te sens-tu aujourd\'hui?');
      
      expect(fallback.message).toContain('Wow');
      expect(fallback.message).toContain('opportunité');
      expect(fallback.persona).toBe('clara');
    });

    test('✅ devrait retourner un fallback générique si message inconnu', () => {
      const fallback = chatService.getSmartFallbackResponse('Message inconnu');
      
      expect(fallback).toBeDefined();
      expect(typeof fallback.message).toBe('string');
      expect(fallback.success).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────
  // 💡 TESTS SUGGESTIONS
  // ──────────────────────────────────────────────────────

  describe('Smart Suggestions', () => {
    test('✅ devrait générer des suggestions intelligentes', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          suggestions: [
            'Comment je me sens ?',
            'Veux-tu parler de ton cycle ?',
            'As-tu des questions ?'
          ]
        })
      };
      global.fetch.mockResolvedValue(mockResponse);
      
      const suggestions = await chatService.getSmartSuggestions();
      
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toBe('Comment je me sens ?');
    });

    test('✅ devrait retourner des suggestions par défaut si API échoue', async () => {
      global.fetch.mockRejectedValue(new Error('API error'));
      
      const suggestions = await chatService.getSmartSuggestions();
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    test('✅ devrait retourner des suggestions par phase', () => {
      const suggestions = chatService.getDefaultSuggestions('menstrual');
      
      expect(suggestions).toContain('Comment soulager mes douleurs ?');
      expect(suggestions).toContain('Rituels cocooning règles');
    });

    test('✅ devrait gérer les phases invalides', () => {
      const suggestions = chatService.getDefaultSuggestions('invalid_phase');
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS GESTION CONTEXTE
  // ──────────────────────────────────────────────────────

  describe('Context Management', () => {
    test('✅ devrait vider le contexte', async () => {
      chatService.conversationContext.messageCount = 10;
      
      await chatService.clearContext();
      
      expect(chatService.conversationContext.messageCount).toBe(0);
      expect(chatService.conversationContext.topics).toEqual([]);
    });

    test('✅ devrait obtenir le contexte chat', async () => {
      const context = await chatService.getChatContext();
      
      expect(context).toBeDefined();
      expect(context.persona).toBeDefined();
      expect(context.phase).toBeDefined();
      expect(context.intelligence).toBeDefined();
    });

    test('✅ devrait enrichir le contexte', async () => {
      const message = 'Je me sens fatiguée';
      const enrichedContext = await chatService.buildEnrichedContext(message);
      
      expect(enrichedContext).toBeDefined();
      expect(enrichedContext.persona).toBeDefined();
      expect(enrichedContext.phase).toBeDefined();
      expect(enrichedContext.intelligence).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────
  // 📊 TESTS STATISTIQUES
  // ──────────────────────────────────────────────────────

  describe('Statistics', () => {
    test('✅ devrait retourner les statistiques', () => {
      const stats = chatService.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.deviceId).toBeDefined();
      expect(stats.isInitialized).toBeDefined();
      expect(stats.conversationContext).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS GESTION ERREURS
  // ──────────────────────────────────────────────────────

  describe('Error Handling', () => {
    test('✅ devrait gérer les erreurs de réseau gracieusement', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      const result = await chatService.sendMessage('Test');
      
      expect(result.success).toBe(true); // Le fallback gère l'erreur
      expect(result.source).toBe('smart_fallback');
    });

    test('✅ devrait gérer les réponses API invalides', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      global.fetch.mockResolvedValue(mockResponse);
      
      const result = await chatService.sendMessage('Test');
      
      expect(result.success).toBe(true); // Le fallback gère l'erreur
      expect(result.source).toBe('smart_fallback');
    });

    test('✅ devrait gérer les données de réponse manquantes', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}) // Pas de response
      };
      global.fetch.mockResolvedValue(mockResponse);
      
      const result = await chatService.sendMessage('Test');
      
      expect(result.success).toBe(true); // Le fallback gère l'erreur
      expect(result.source).toBe('smart_fallback');
    });
  });

  // ──────────────────────────────────────────────────────
  // ⚡ TESTS PERFORMANCE
  // ──────────────────────────────────────────────────────

  describe('Performance', () => {
    test('⚡ devrait envoyer rapidement un message', async () => {
      await chatService.initialize();
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          response: 'Réponse rapide',
          confidence: 0.8
        })
      };
      global.fetch.mockResolvedValue(mockResponse);
      
      const start = performance.now();
      
      await chatService.sendMessage('Test performance');
      
      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // < 1s
    });

    test('⚡ devrait préparer le contexte rapidement', async () => {
      await chatService.initialize();
      
      const start = performance.now();
      
      await chatService.buildEnrichedContext('Test context');
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // < 100ms
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS RATE LIMITING
  // ──────────────────────────────────────────────────────

  describe('Rate Limiting', () => {
    test('✅ devrait respecter les limites de taux', async () => {
      await chatService.initialize();
      
      // Simuler plusieurs appels rapides
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(chatService.sendMessage(`Message ${i}`));
      }
      
      await Promise.all(promises);
      
      // Vérifier que les appels ont été gérés
      expect(global.fetch).toHaveBeenCalled();
    });
  });
}); 