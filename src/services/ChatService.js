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
      
      // ✅ INITIALISER CONTEXTE INTELLIGENCE
      this.loadConversationContext();
      
      // ✅ LOG INITIALISATION DÉTAILLÉE
      console.log('🚀 ChatService Initialized:', {
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
      
      console.log('🔄 ChatService Fallback Initialized:', {
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
    const timeSinceLastMessage = Date.now() - (lastMessage.timestamp || Date.now());
    const gapMinutes = Math.floor(timeSinceLastMessage / 60000);
    
    return {
      isNew: gapMinutes > 30, // Nouvelle conversation après 30min
      gap: gapMinutes,
      shouldRecap: gapMinutes > 10 && gapMinutes < 30
    };
  }
  
  // ✅ Instructions contextuelles pour l'API
  getContextualInstructions(context) {
    const instructions = [];
    
    if (context.continuity.isNew) {
      instructions.push("C'est une nouvelle conversation, accueille chaleureusement.");
    } else if (context.continuity.shouldRecap) {
      instructions.push("La conversation a eu une pause, fais un léger rappel si pertinent.");
    }
    
    if (context.summary.topics.includes('pain')) {
      instructions.push("Sois particulièrement empathique concernant la douleur mentionnée.");
    }
    
    if (context.messages.length > 4) {
      instructions.push("Continue naturellement la conversation en cours.");
    }
    
    return instructions;
  }

  async sendMessage(message, conversationContext = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // ✅ LOG DÉBUT - SendMessage
    console.log('📝 SendMessage Start:', {
      messagePreview: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      messageLength: message.length,
      conversationContextLength: conversationContext.length,
      timestamp: new Date().toISOString()
    });

    try {
      // ✅ Préparer contexte optimisé
      const optimizedContext = this.prepareConversationContext(message, conversationContext);
      
      // ✅ NOUVEAU : Contexte enrichi depuis stores
      const enrichedContext = await this.buildEnrichedContext(message);
      
      // ✅ Fusionner contextes
      const finalContext = {
        ...enrichedContext,
        conversation: optimizedContext,
        // Instructions spéciales pour l'API
        instructions: this.getContextualInstructions(optimizedContext)
      };
      
      // ✅ LOG CONTEXTE ENRICHI
      console.log('🧠 Enriched Context Built:', {
        phase: finalContext.phase,
        persona: finalContext.persona,
        conversationLength: finalContext.intelligence?.conversationLength || 0,
        optimizedMessagesCount: optimizedContext.messages.length,
        continuityGap: optimizedContext.continuity.gap,
        isFirstMessage: finalContext.messageMetadata?.isFirstMessage || false
      });
      
      // ✅ TRACKING ENGAGEMENT
      this.trackEngagement(message, finalContext);
      
      const response = await this.callChatAPI(message, finalContext);
      
      // ✅ Vérification que response n'est pas null
      if (!response) {
        console.log('🔄 API returned null, using fallback response');
        const fallbackResponse = this.getSmartFallbackResponse(message);
        
        console.log('💾 Fallback response used:', {
          fallbackUsed: true,
          persona: fallbackResponse.persona,
          source: fallbackResponse.source
        });
        
        return fallbackResponse;
      }
      
      // ✅ APPRENTISSAGE PATTERNS
      this.learnFromResponse(message, response, finalContext);
      
      // ✅ LOG SUCCÈS COMPLET
      console.log('🎉 SendMessage Success:', {
        phase: finalContext.phase,
        persona: finalContext.persona,
        responsePreview: response.substring(0, 50) + (response.length > 50 ? '...' : ''),
        source: 'api'
      });
      
      return {
        success: true,
        message: response,
        source: 'api',
        context: finalContext.persona
      };
    } catch (error) {
      console.error('🚨 SendMessage Error:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Si offline, enqueue
      if (error.message.includes('Network')) {
        console.log('📡 Network Error Detected - Enqueueing message');
        await NetworkQueue.enqueueChatMessage(message, enrichedContext, this.deviceId);
        
        const fallbackResponse = this.getSmartFallbackResponse(message);
        
        console.log('💾 Message Queued - Fallback response:', {
          fallbackUsed: true,
          queued: true,
          persona: fallbackResponse.persona
        });
        
        return {
          ...fallbackResponse,
          queued: true
        };
      }
      
      // ✅ LOG FALLBACK STANDARD
      const fallbackResponse = this.getSmartFallbackResponse(message);
      console.log('🔄 Fallback Response:', {
        fallbackUsed: true,
        persona: fallbackResponse.persona,
        source: fallbackResponse.source
      });
      
      return fallbackResponse;
    }
  }

  // ✅ NOUVEAU : Contexte enrichi
  async buildEnrichedContext(message) {
    try {
      const userStore = useUserStore.getState();
      const chatStore = useChatStore.getState();
      const engagementStore = useEngagementStore.getState();
      
      // Contexte de base avec protection
      let baseContext;
      try {
        baseContext = userStore.getContextForAPI();
      } catch (contextError) {
        console.error('🚨 Error getting baseContext:', contextError);
        // Fallback context
        baseContext = {
          persona: userStore.persona?.assigned || 'emma',
          phase: 'menstrual',
          preferences: userStore.preferences || {},
          profile: userStore.profile || {}
        };
      }
      
      // ✅ Protection contre cycle undefined
      const cycleData = getCycleData();
      const safeCycle = cycleData || {
        lastPeriodDate: null,
        length: 28,
        periodDuration: 5
      };
      
      // Phase actuelle calculée
      const currentPhase = getCurrentPhase(
        safeCycle.lastPeriodDate,
        safeCycle.length,
        safeCycle.periodDuration
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
    } catch (error) {
      console.error('🚨 buildEnrichedContext error:', error);
      // Return minimal context as fallback
      return {
        persona: 'emma',
        phase: 'menstrual',
        preferences: {},
        profile: {},
        intelligence: {
          conversationLength: 0,
          recentTopics: [],
          userEngagement: 'medium',
          patterns: {},
          timeOfDay: new Date().getHours(),
          daysSinceFirstUse: 1
        },
        suggestions: [],
        conversationContext: this.conversationContext,
        messageMetadata: {
          isFirstMessage: true,
          isReturningUser: false,
          hasUsedVignettes: false
        }
      };
    }
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
      // ✅ Vérification que response n'est pas null
      if (!response) {
        console.log('🔄 Skipping learning from null response');
        return;
      }
      
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
    // ✅ Vérification du deviceId
    if (!this.deviceId) {
      console.error('❌ Device ID manquant - Réinitialisation...');
      await this.initialize();
      if (!this.deviceId) {
        throw new Error('Impossible de générer un Device ID');
      }
    }

    const apiConfig = getApiRequestConfig(this.deviceId);

    // ✅ Payload optimisé
    const payload = {
      message,
      context: {
        // Données essentielles seulement
        persona: context.persona,
        phase: context.phase,
        // Contexte conversation compact
        conversation: context.conversation ? {
          recent: context.conversation.messages.slice(-4), // 4 derniers max
          summary: context.conversation.summary,
          continuity: context.conversation.continuity
        } : null,
        // Instructions pour personnalisation
        instructions: context.instructions
      }
    };

    // ✅ Utiliser la nouvelle fonction pour récupérer l'URL complète
    const chatEndpointUrl = getEndpointUrl('chat');

    const response = await fetch(chatEndpointUrl, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify(payload),
      timeout: apiConfig.timeout,
    });

    if (!response.ok) {
      console.error('❌ API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        phase: context.phase,
        persona: context.persona
      });
      
      // ✅ Pour 404/503, utiliser directement les fallbacks au lieu de throw
      if (response.status === 404 || response.status === 503) {
        console.log('🔄 API indisponible, utilisation des fallbacks intelligents');
        return null; // Signal pour utiliser les fallbacks
      }
      
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // Retourner la réponse formatée
    return data.response || data.message || data.data?.message || null;
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
      
      // ✅ Protection contre cycle undefined
      const cycleData = getCycleData();
      const safeCycle = cycleData || {
        lastPeriodDate: null,
        length: 28,
        periodDuration: 5
      };
      
      const currentPhase = getCurrentPhase(
        safeCycle.lastPeriodDate,
        safeCycle.length,
        safeCycle.periodDuration
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

  async generateContextualResponse(message, options = {}) {
    try {
      // Obtenir le contexte utilisateur
      const userStore = useUserStore.getState();
      const cycleData = getCycleData();
      
      // Protection contre cycle undefined
      const safeCycle = cycleData || {
        lastPeriodDate: null,
        length: 28,
        periodDuration: 5
      };

      const currentPhase = getCurrentPhase(
        safeCycle.lastPeriodDate,
        safeCycle.length,
        safeCycle.periodDuration
      );
      // ... existing code ...
    } catch (error) {
      console.error('Erreur génération réponse:', error);
    }
  }

  async getChatContext() {
    try {
      const userStore = useUserStore.getState();
      const cycleData = getCycleData();
      
      const safeCycle = cycleData || {
        lastPeriodDate: null,
        length: 28,
        periodDuration: 5
      };

      const currentPhase = getCurrentPhase(
        safeCycle.lastPeriodDate,
        safeCycle.length,
        safeCycle.periodDuration
      );
      // ... existing code ...
    } catch (error) {
      console.error('Erreur contexte chat:', error);
    }
  }
}

export default new ChatService();