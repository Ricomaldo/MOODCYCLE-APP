//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/ChatService.js
// 🧩 Type: Service
// 📚 Description: Service chat avec stores intégrés + intelligence contextuelle
// 🕒 Version: 5.0 - 2025-06-21
// 🧭 Used in: Chat modal, conversational features
// ─────────────────────────────────────────────────────────
//
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../stores/useUserStore.js';
import { useChatStore } from '../stores/useChatStore.js';
import { useEngagementStore } from '../stores/useEngagementStore.js';
import { useUserIntelligence } from '../stores/useUserIntelligence.js';
import { getApiRequestConfig, getEndpointUrl } from '../config/api.js';
import { getCurrentPhase } from '../utils/cycleCalculations.js';
import NetworkQueue from './NetworkQueue.js';
import { useCycleStore, getCycleData } from '../stores/useCycleStore';

const DEVICE_ID_KEY = 'device_id_v1';

// ✅ FALLBACKS INTELLIGENTS PAR PERSONA
const SMART_FALLBACKS = {
  emma: {
    "Comment te sens-tu aujourd'hui?": "Hey ! 😊 Raconte-moi ce qui se passe pour toi en ce moment !",
    "Pourquoi je me sens si fatiguée?": "Oh je comprends... Cette fatigue peut être liée à ton cycle ! Ton corps fait un travail incroyable 💪",
    "Quels aliments me recommandes-tu?": "Pour ton énergie du moment, pense fer et protéines ! Des épinards, des lentilles... tes alliés ! ✨"
  },
  laure: {
    "Comment te sens-tu aujourd'hui?": "Analysons ensemble votre état du jour. Quels sont vos ressentis principaux ?",
    "Pourquoi je me sens si fatiguée?": "Cette fatigue est probablement cyclique. Vos hormones influencent directement votre niveau d'énergie.",
    "Quels aliments me recommandes-tu?": "Optimisez votre alimentation : fer, magnésium, oméga-3. Planifiez selon votre phase cyclique."
  },
  clara: {
    "Comment te sens-tu aujourd'hui?": "Wow, quelle belle opportunité d'explorer tes ressentis ! Raconte-moi tout ! 🌟",
    "Pourquoi je me sens si fatiguée?": "Ta fatigue est un message de ton corps ! Il te guide vers plus de douceur envers toi-même 💕",
    "Quels aliments me recommandes-tu?": "Nourris ton temple avec amour ! Pense légumes verts, graines... tout ce qui fait vibrer ton énergie ! ✨"
  },
  sylvie: {
    "Comment te sens-tu aujourd'hui?": "Ma chère, prenons le temps d'accueillir ce que tu ressens aujourd'hui.",
    "Pourquoi je me sens si fatiguée?": "Cette fatigue fait partie du rythme naturel de ton corps. Honore ce besoin de ralentir.",
    "Quels aliments me recommandes-tu?": "Pense à des aliments nourrissants : bouillons, légumes de saison, tout ce qui réconforte."
  },
  christine: {
    "Comment te sens-tu aujourd'hui?": "Bonjour. Comment se présente cette journée pour vous ?",
    "Pourquoi je me sens si fatiguée?": "La fatigue accompagne souvent les changements hormonaux. C'est tout à fait normal.",
    "Quels aliments me recommandes-tu?": "Privilégiez une alimentation équilibrée, riche en nutriments essentiels pour cette période."
  }
};

class ChatService {
  constructor() {
    this.deviceId = null;
    this.isInitialized = false;
    this.conversationContext = {
      messageCount: 0,
      topics: [],
      lastPhase: null,
      userPatterns: {}
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.deviceId = await this.getOrGenerateDeviceId();
      this.isInitialized = true;
      
      this.loadConversationContext();
      
      console.info('🚀 ChatService Initialized:', {
        deviceId: this.deviceId,
        timestamp: new Date().toISOString(),
        conversationContext: this.conversationContext,
        environment: __DEV__ ? 'development' : 'production'
      });
    } catch (error) {
      console.error('🚨 ChatService Initialization Error:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      this.deviceId = 'fallback-device-id';
      this.isInitialized = true;
      
      console.info('🔄 ChatService Fallback Initialized:', {
        deviceId: this.deviceId,
        fallback: true
      });
    }
  }

  async getOrGenerateDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      
      if (!deviceId) {
        deviceId = this.generateDeviceId();
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('🚨 Erreur Device ID, fallback:', error);
      return this.generateDeviceId();
    }
  }

  generateDeviceId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `moodcycle-${timestamp}-${random}`;
  }

  // ✅ NOUVEAU : Contexte intelligent
  loadConversationContext() {
    try {
      const chatStore = useChatStore.getState();
      const engagementStore = useEngagementStore.getState();
      
      this.conversationContext = {
        messageCount: chatStore.getMessagesCount().total,
        topics: this.extractTopicsFromMessages(chatStore.messages),
        lastPhase: null,
        userPatterns: engagementStore.getPatterns?.() || {}
      };
    } catch (error) {
      console.error('🚨 Erreur load context:', error);
    }
  }

  extractTopicsFromMessages(messages) {
    const recentMessages = messages.slice(-10);
    const topics = [];
    
    recentMessages.forEach(msg => {
      if (msg.type === 'user') {
        // Extraction basique de topics
        const content = msg.content.toLowerCase();
        if (content.includes('fatigue') || content.includes('fatiguée') || content.includes('énergie')) topics.push('energy');
        if (content.includes('humeur') || content.includes('émotions')) topics.push('mood');
        if (content.includes('douleur') || content.includes('mal')) topics.push('pain');
        if (content.includes('alimentation') || content.includes('manger')) topics.push('nutrition');
      }
    });
    
    return [...new Set(topics)];
  }

  // ✅ NOUVEAU: Préparer contexte optimisé (3-4 messages)
  prepareConversationContext(currentMessage, previousMessages = []) {
    // Garder seulement 3 derniers échanges (6 messages max)
    const recentMessages = previousMessages.slice(-6);
    
    // Formatter pour l'API Claude
    const formattedContext = recentMessages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text,
      // Métadonnées légères
      metadata: {
        timestamp: msg.timestamp,
        phase: msg.phase || null
      }
    }));
    
    return {
      messages: formattedContext,
      summary: this.generateContextSummary(recentMessages),
      continuity: this.checkConversationContinuity(recentMessages)
    };
  }
  
  // ✅ Résumé intelligent pour économiser tokens
  generateContextSummary(messages) {
    const topics = new Set();
    const emotions = new Set();
    
    messages.forEach(msg => {
      if (msg.isUser) {
        // Extraction basique topics/émotions
        const content = msg.text.toLowerCase();
        if (content.includes('douleur') || content.includes('mal')) topics.add('pain');
        if (content.includes('fatigue')) topics.add('fatigue');
        if (content.includes('stress')) emotions.add('stressed');
        if (content.includes('bien')) emotions.add('good');
      }
    });
    
    return {
      topics: Array.from(topics),
      emotions: Array.from(emotions),
      messageCount: messages.length
    };
  }
  
  // ✅ Vérifier continuité conversation
  checkConversationContinuity(messages) {
    if (messages.length < 2) return { isNew: true, gap: 0 };
    
    const lastMessage = messages[messages.length - 1];
    const now = Date.now();
    const timeSinceLastMessage = now - (lastMessage.timestamp || now);
    
    return {
      isNew: timeSinceLastMessage > 30 * 60 * 1000,
      gap: timeSinceLastMessage,
      contextual: timeSinceLastMessage < 5 * 60 * 1000
    };
  }
  
  // ✅ Instructions contextuelles pour l'API
  getContextualInstructions(context) {
    const { phase, persona } = context;
    
    const baseInstructions = [
      `Tu es Mélune, guide bienveillante de MoodCycle`,
      `Persona active: ${persona?.assigned || 'emma'}`,
      `Phase cyclique: ${phase || 'non détectée'}`,
      `Réponds en français, avec empathie et personnalisation`
    ];

    const phaseInstructions = {
      menstrual: "Focus sur le réconfort et l'acceptation de cette phase",
      follicular: "Encourage l'énergie montante et les nouveaux projets",
      ovulatory: "Valorise la communication et l'expression de soi",
      luteal: "Guide vers l'introspection et l'écoute intérieure"
    };

    if (phase && phaseInstructions[phase]) {
      baseInstructions.push(phaseInstructions[phase]);
    }

    return baseInstructions.join('\n');
  }

  async sendMessage(message, conversationContext = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.info('📝 SendMessage Start:', {
      messageLength: message.length,
      contextLength: conversationContext.length,
      deviceId: this.deviceId,
      timestamp: new Date().toISOString()
    });

    try {
      const enrichedContext = await this.buildEnrichedContext(message);

      this.trackEngagement(message, enrichedContext);

      const conversationPrepared = this.prepareConversationContext(message, conversationContext);
      
      console.info('🧠 Enriched Context Built:', {
        phase: enrichedContext.phase,
        persona: enrichedContext.persona?.assigned,
        hasProfile: !!enrichedContext.profile,
        contextSize: conversationPrepared.messages.length,
        topics: enrichedContext.conversationSummary?.topics || []
      });

      let response;
      
      try {
        response = await this.callChatAPI(message, {
          ...enrichedContext,
          conversation: conversationPrepared
        });
      } catch (apiError) {
        console.error('🔄 API Error, using fallback:', apiError.message);
        response = null;
      }

      if (!response) {
        console.info('🔄 API returned null, using fallback response');
        response = this.getSmartFallbackResponse(message);
        console.info('💾 Fallback response used:', {
          length: response.length,
          source: 'smart_fallback'
        });
      }

      this.learnFromResponse(message, response, enrichedContext);

      console.info('🎉 SendMessage Success:', {
        responseLength: response.length,
        processingTime: Date.now() - new Date().getTime(),
        usedFallback: !response.includes('claude') && !response.includes('api')
      });

      return response;

    } catch (error) {
      console.error('🚨 SendMessage Critical Error:', {
        error: error.message,
        stack: error.stack,
        message: message.substring(0, 100)
      });

      const netInfo = await require('@react-native-community/netinfo').default.fetch();
      if (!netInfo.isConnected) {
        console.info('📡 Network Error Detected - Enqueueing message');
        
        const queueManager = new NetworkQueue();
        await queueManager.enqueueChatMessage(message, conversationContext, this.deviceId);
        
        const fallbackResponse = this.getSmartFallbackResponse(message);
        console.info('💾 Message Queued - Fallback response:', {
          response: fallbackResponse.substring(0, 50) + '...',
          queued: true
        });
        return fallbackResponse;
      }

      return this.getSmartFallbackResponse(message);
    }
  }

  // ✅ NOUVEAU : Contexte enrichi
  async buildEnrichedContext(message) {
    const userStore = useUserStore.getState();
    const cycleStore = useCycleStore.getState();
    const chatStore = useChatStore.getState();
    const intelligenceStore = useUserIntelligence.getState();

    // Déterminer le mode de maturité
    const observationCount = intelligenceStore.observationPatterns.totalObservations;
    const maturityMode = observationCount < 5 ? 'discovery' : 
                        observationCount > 20 ? 'autonomous' : 'learning';

    const context = {
      message,
      profile: userStore.profile,
      persona: userStore.persona,
      cycle: userStore.cycle,
      phase: getCurrentPhase(userStore.cycle),
      preferences: userStore.preferences,
      conversationSummary: this.generateContextSummary(chatStore.messages.slice(-10)),
      maturityMode, // Nouveau : mode de maturité
      timestamp: new Date().toISOString(),
      deviceId: this.deviceId
    };

    return context;
  }

  // ✅ NOUVEAU : Tracking engagement
  trackEngagement(message, context) {
    try {
      const engagementStore = useEngagementStore.getState();
      engagementStore.trackEngagement?.({
        type: 'chat_message',
        content: message.substring(0, 100),
        phase: context.phase,
        persona: context.persona?.assigned,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('🚨 Engagement tracking error:', error);
    }
  }

  // ✅ NOUVEAU : Apprentissage patterns
  learnFromResponse(message, response, context) {
    if (!response) {
      return;
    }

    try {
      const intelligenceStore = useUserIntelligence.getState();
      intelligenceStore.learnFromInteraction?.({
        userMessage: message,
        response: response,
        context: {
          phase: context.phase,
          persona: context.persona?.assigned,
          timestamp: context.timestamp
        }
      });
    } catch (error) {
      console.error('🚨 Learning error:', error);
    }
  }

  async callChatAPI(message, context) {
    try {
      const endpoint = getEndpointUrl('chat');
      const config = getApiRequestConfig(this.deviceId);
      
      const payload = {
        message,
        context: {
          phase: context.phase,
          persona: context.persona?.assigned || 'emma',
          profile: {
            prenom: context.profile?.prenom,
            age: context.profile?.age
          },
          conversation: context.conversation?.messages || [],
          preferences: context.preferences,
          userIntelligence: context.userIntelligence,
          instructions: this.getContextualInstructions(context)
        },
        metadata: {
          timestamp: context.timestamp,
          version: '5.0'
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(payload),
        timeout: config.timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || data.message || null;

    } catch (error) {
      console.info('🔄 API indisponible, utilisation des fallbacks intelligents');
      throw error;
    }
  }

  // ✅ NOUVEAU : Fallbacks intelligents
  getSmartFallbackResponse(message) {
    const userStore = useUserStore.getState();
    const persona = userStore.persona?.assigned || 'emma';
    
    const personaFallbacks = SMART_FALLBACKS[persona] || SMART_FALLBACKS.emma;
    
    const normalizedMessage = message.trim().replace(/[?!.]*$/, '');
    
    for (const [pattern, response] of Object.entries(personaFallbacks)) {
      if (normalizedMessage.toLowerCase().includes(pattern.toLowerCase().substring(0, 10))) {
        return response;
      }
    }

    const defaultResponses = {
      emma: "Je t'écoute avec bienveillance 💕 Peux-tu m'en dire plus sur ce que tu ressens ?",
      laure: "Analysons ensemble votre situation. Quels sont les détails importants ?",
      clara: "Wow, merci de partager ça avec moi ! Explorons ensemble ce que ton corps te dit ✨",
      sylvie: "Je comprends, ma chère. Prenons le temps d'accueillir ce que tu vis.",
      christine: "Je vous écoute. Pouvez-vous préciser ce que vous ressentez ?"
    };

    return defaultResponses[persona] || defaultResponses.emma;
  }

  // ✅ NOUVEAU : Suggestions intelligentes
  async getSmartSuggestions() {
    try {
      const userStore = useUserStore.getState();
      const phase = getCurrentPhase(userStore.cycle);
      const persona = userStore.persona?.assigned || 'emma';
      
      const suggestions = this.getDefaultSuggestions(phase);
      
      return suggestions.slice(0, 3);
    } catch (error) {
      console.error('🚨 Smart suggestions error:', error);
      return ['Comment te sens-tu ?', 'Raconte-moi ta journée', 'As-tu des questions ?'];
    }
  }

  getDefaultSuggestions(phase) {
    const suggestions = {
      menstrual: [
        'Comment gérer mes douleurs ?',
        'Que faire contre la fatigue ?',
        'Quels aliments privilégier ?'
      ],
      follicular: [
        'Comment optimiser mon énergie ?',
        'Quels projets commencer ?',
        'Comment profiter de cette phase ?'
      ],
      ovulatory: [
        'Comment me sentir confiante ?',
        'Que faire de cette énergie ?',
        'Comment bien communiquer ?'
      ],
      luteal: [
        'Comment gérer mes émotions ?',
        'Que faire avant mes règles ?',
        'Comment me préparer ?'
      ]
    };

    return suggestions[phase] || suggestions.follicular;
  }

  // ✅ MÉTHODES UTILITAIRES
  async clearContext() {
    this.conversationContext = {
      messageCount: 0,
      topics: [],
      lastPhase: null,
      userPatterns: {}
    };
  }

  getStats() {
    return {
      deviceId: this.deviceId,
      isInitialized: this.isInitialized,
      conversationContext: this.conversationContext
    };
  }

  async generateContextualResponse(message, options = {}) {
    const context = await this.buildEnrichedContext(message);
    const conversationContext = options.conversationContext || [];
    
    try {
      const response = await this.callChatAPI(message, {
        ...context,
        conversation: this.prepareConversationContext(message, conversationContext)
      });
      
      return response || this.getSmartFallbackResponse(message);
    } catch (error) {
      console.error('🚨 Contextual response error:', error);
      return this.getSmartFallbackResponse(message);
    }
  }

  async getChatContext() {
    const userStore = useUserStore.getState();
    const cycleStore = useCycleStore.getState();
    
    return {
      phase: getCurrentPhase(userStore.cycle),
      persona: userStore.persona?.assigned,
      preferences: userStore.preferences,
      deviceId: this.deviceId
    };
  }
}

export default new ChatService();