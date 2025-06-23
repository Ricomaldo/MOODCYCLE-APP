//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/ChatService.js
// 🧩 Type: Service
// 📚 Description: Service chat avec stores intégrés + intelligence contextuelle
// 🕒 Version: 5.0 - 2025-06-21 - STORES INTÉGRÉS
// ─────────────────────────────────────────────────────────
//
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../stores/useUserStore.js';
import { useChatStore } from '../stores/useChatStore.js';
import { useEngagementStore } from '../stores/useEngagementStore.js';
import { useUserIntelligence } from '../stores/useUserIntelligence.js';
import { getApiRequestConfig } from '../config/api.js';
import { getCurrentPhase } from '../utils/cycleCalculations.js';

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
      
      // ✅ INITIALISER CONTEXTE INTELLIGENCE
      this.loadConversationContext();
      
      console.log('🚀 ChatService initialisé avec Device ID:', this.deviceId);
    } catch (error) {
      console.error('🚨 Erreur initialisation ChatService:', error);
      this.deviceId = 'fallback-device-id';
      this.isInitialized = true;
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
      console.warn('🚨 Erreur Device ID, fallback:', error);
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
      console.warn('🚨 Erreur load context:', error);
    }
  }

  extractTopicsFromMessages(messages) {
    const recentMessages = messages.slice(-10);
    const topics = [];
    
    recentMessages.forEach(msg => {
      if (msg.type === 'user') {
        // Extraction basique de topics
        const content = msg.content.toLowerCase();
        if (content.includes('fatigue') || content.includes('énergie')) topics.push('energy');
        if (content.includes('humeur') || content.includes('émotions')) topics.push('mood');
        if (content.includes('douleur') || content.includes('mal')) topics.push('pain');
        if (content.includes('alimentation') || content.includes('manger')) topics.push('nutrition');
      }
    });
    
    return [...new Set(topics)];
  }

  async sendMessage(message) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // ✅ NOUVEAU : Contexte enrichi depuis stores
      const enrichedContext = await this.buildEnrichedContext(message);
      
      // ✅ TRACKING ENGAGEMENT
      this.trackEngagement(message, enrichedContext);
      
      const response = await this.callChatAPI(message, enrichedContext);
      
      // ✅ APPRENTISSAGE PATTERNS
      this.learnFromResponse(message, response, enrichedContext);
      
      return {
        success: true,
        message: response,
        source: 'api',
        context: enrichedContext.persona
      };
    } catch (error) {
      console.error('🚨 Erreur sendMessage:', error);
      
      const fallbackResponse = this.getSmartFallbackResponse(message);
      return fallbackResponse;
    }
  }

  // ✅ NOUVEAU : Contexte enrichi
  async buildEnrichedContext(message) {
    const userStore = useUserStore.getState();
    const chatStore = useChatStore.getState();
    const engagementStore = useEngagementStore.getState();
    
    // Contexte de base
    const baseContext = userStore.getContextForAPI();
    
    // Phase actuelle calculée
    const currentPhase = getCurrentPhase(
      userStore.cycle.lastPeriodDate,
      userStore.cycle.length,
      userStore.cycle.periodDuration
    );
    
    // Intelligence contextuelle
    const intelligence = {
      conversationLength: chatStore.messages.length,
      recentTopics: this.conversationContext.topics,
      userEngagement: engagementStore.getEngagementLevel?.() || 'medium',
      patterns: engagementStore.getPatterns?.() || {},
      timeOfDay: new Date().getHours(),
      daysSinceFirstUse: engagementStore.metrics?.daysUsed || 1
    };
    
    // Suggestions contextuelles
    const suggestions = chatStore.getContextualSuggestions();
    
    return {
      ...baseContext,
      phase: currentPhase,
      intelligence,
      suggestions,
      conversationContext: this.conversationContext,
      messageMetadata: {
        isFirstMessage: chatStore.messages.length === 0,
        isReturningUser: intelligence.daysSinceFirstUse > 1,
        hasUsedVignettes: engagementStore.metrics?.vignetteEngagements > 0
      }
    };
  }

  // ✅ NOUVEAU : Tracking engagement
  trackEngagement(message, context) {
    try {
      const engagementStore = useEngagementStore.getState();
      
      engagementStore.trackAction?.('message_sent', {
        messageLength: message.length,
        phase: context.phase,
        persona: context.persona,
        topics: this.extractTopicsFromMessages([{ content: message, type: 'user' }]),
        timeOfDay: new Date().getHours(),
        conversationLength: context.intelligence.conversationLength
      });
      
      // Update conversation context
      this.conversationContext.messageCount++;
      this.conversationContext.lastPhase = context.phase;
    } catch (error) {
      console.warn('🚨 Erreur tracking engagement:', error);
    }
  }

  // ✅ NOUVEAU : Apprentissage patterns
  learnFromResponse(message, response, context) {
    try {
      const userIntelligence = useUserIntelligence.getState();
      
      userIntelligence.recordInteraction?.({
        input: message,
        response: response,
        phase: context.phase,
        persona: context.persona,
        timestamp: Date.now(),
        context: {
          topics: this.extractTopicsFromMessages([{ content: message, type: 'user' }]),
          engagement: context.intelligence.userEngagement
        }
      });
    } catch (error) {
      console.warn('🚨 Erreur learning patterns:', error);
    }
  }

  async callChatAPI(message, context) {
    const apiConfig = getApiRequestConfig(this.deviceId);

    const response = await fetch(`${apiConfig.baseURL}/api/chat`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify({
        message,
        context,
      }),
      timeout: apiConfig.timeout,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.response) return data.response;
    if (data.message) return data.message;
    if (data.data?.message) return data.data.message;
    
    throw new Error('Format de réponse API non reconnu');
  }

  // ✅ NOUVEAU : Fallbacks intelligents
  getSmartFallbackResponse(message) {
    const userStore = useUserStore.getState();
    const persona = userStore.persona.assigned || 'emma';
    
    // Fallback spécifique au persona
    const personaFallbacks = SMART_FALLBACKS[persona] || SMART_FALLBACKS.emma;
    
    // Recherche exacte
    let fallbackMessage = personaFallbacks[message];
    
    // Recherche par mots-clés si pas de match exact
    if (!fallbackMessage) {
      const messageLower = message.toLowerCase();
      
      for (const [key, value] of Object.entries(personaFallbacks)) {
        if (messageLower.includes(key.toLowerCase().split(' ')[0])) {
          fallbackMessage = value;
          break;
        }
      }
    }
    
    // Fallback générique adapté au persona
    if (!fallbackMessage) {
      const genericFallbacks = {
        emma: "Je comprends ! Dis-moi en plus sur ce que tu ressens ? 💜",
        laure: "Je vois. Pouvez-vous préciser votre ressenti ?",
        clara: "Ah ! Quelle belle opportunité d'explorer ensemble ! ✨",
        sylvie: "Je t'écoute. Prenons le temps d'accueillir ce que tu ressens.",
        christine: "Je comprends. Comment puis-je vous accompagner ?"
      };
      
      fallbackMessage = genericFallbacks[persona] || genericFallbacks.emma;
    }

    return {
      success: true,
      message: fallbackMessage,
      source: 'smart_fallback',
      persona: persona
    };
  }

  // ✅ NOUVEAU : Suggestions intelligentes
  async getSmartSuggestions() {
    try {
      const userStore = useUserStore.getState();
      const currentPhase = getCurrentPhase(
        userStore.cycle.lastPeriodDate,
        userStore.cycle.length,
        userStore.cycle.periodDuration
      );
      
      const chatStore = useChatStore.getState();
      const suggestions = chatStore.getContextualSuggestions();
      
      return suggestions.length > 0 ? suggestions : this.getDefaultSuggestions(currentPhase);
    } catch (error) {
      console.warn('🚨 Erreur smart suggestions:', error);
      return ["Comment je me sens ?", "Conseils du jour", "Rituels bien-être"];
    }
  }

  getDefaultSuggestions(phase) {
    const phaseSuggestions = {
      menstrual: [
        "Comment soulager mes douleurs ?",
        "Rituels cocooning règles",
        "Nutrition pendant les règles"
      ],
      follicular: [
        "Optimiser mon énergie montante",
        "Nouveaux projets à commencer",
        "Sport adapté à cette phase"
      ],
      ovulatory: [
        "Profiter de mon pic d'énergie",
        "Communication et relations",
        "Créativité et socialisation"
      ],
      luteal: [
        "Gérer les changements d'humeur",
        "Préparer les prochaines règles",
        "Ralentir et m'écouter"
      ]
    };

    return phaseSuggestions[phase] || phaseSuggestions.menstrual;
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
}

export default new ChatService();