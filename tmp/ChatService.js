// services/ChatService.js
// Service de gestion du chat avec API MoodCycle
// Gestion cache + personnalisation progressive + mémoire conversationnelle

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingStore } from '../stores/useOnboardingStore.js';
import ContextFormatter from './ContextFormatter.js';
import { getApiRequestConfig } from '../config/api.js';

const CACHE_KEY = 'conversation_context_v1';
const DEVICE_ID_KEY = 'device_id_v1';
// ✅ NOUVEAU : Clé pour l'historique conversationnel
const HISTORY_KEY = 'conversation_history_v1';
const MAX_HISTORY_EXCHANGES = 4; // 4 échanges max en mémoire

// Réponses fallback pour simulation locale
const FALLBACK_RESPONSES = {
  "Comment te sens-tu aujourd'hui?": "Je me sens plutôt bien, et toi?",
  "Pourquoi je me sens si fatiguée?": "La fatigue est normale pendant cette phase de ton cycle. Ton corps travaille dur et tes hormones fluctuent. Est-ce que tu arrives à te reposer suffisamment?",
  "Quels aliments me recommandes-tu?": "Pendant ta phase folliculaire actuelle, des aliments riches en fer et en protéines seraient bénéfiques, comme les légumes verts, les lentilles et les œufs. As-tu des préférences alimentaires particulières?"
};

class ChatService {
  
  constructor() {
    this.cachedContext = null;
    this.deviceId = null;
    this.isInitialized = false;
    // ✅ NOUVEAU : Cache mémoire pour l'historique
    this.conversationHistory = [];
  }

  /**
   * 🔧 INITIALISATION DU SERVICE
   * Génère device ID et prépare le contexte
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Générer ou récupérer Device ID
      this.deviceId = await this.getOrGenerateDeviceId();
      
      // Marquer comme initialisé
      this.isInitialized = true;
      
      console.log('🚀 ChatService initialisé avec Device ID:', this.deviceId);
    } catch (error) {
      console.error('🚨 Erreur initialisation ChatService:', error);
      // Continuer avec des valeurs par défaut
      this.deviceId = 'fallback-device-id';
      this.isInitialized = true;
    }
  }

  /**
   * 📱 GÉNÉRATION/RÉCUPÉRATION DEVICE ID
   */
  async getOrGenerateDeviceId() {
    try {
      // Vérifier si déjà stocké
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      
      if (!deviceId) {
        // Générer nouveau ID (fallback compatible)
        deviceId = this.generateDeviceId();
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.warn('🚨 Erreur Device ID, fallback:', error);
      return this.generateDeviceId();
    }
  }

  /**
   * 🔄 GÉNÉRATION ID UNIQUE
   */
  generateDeviceId() {
    // Fallback compatible cross-platform
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `moodcycle-${timestamp}-${random}`;
  }

  /**
   * 🎯 INITIALISATION CONTEXTE (PREMIER MESSAGE)
   * Calcule et met en cache le contexte personnalisé + charge historique
   */
  async initializeContext() {
    try {
      // Valider données onboarding
      const validationResult = this.validateOnboardingData();
      if (!validationResult.isValid) {
        console.warn('🚨 Données onboarding invalides:', validationResult.errors);
        return this.createFallbackContext();
      }

      // ✅ NOUVEAU : Charger historique conversationnel
      await this.loadConversationHistory();

      // Générer contexte personnalisé
      const context = ContextFormatter.formatCompact();
      
      // ✅ NOUVEAU : Ajouter historique au contexte
      context.conversationHistory = this.conversationHistory;
      
      // Valider le contexte généré
      const contextValidation = ContextFormatter.validateContext(context);
      if (!contextValidation.valid) {
        console.warn('🚨 Contexte généré invalide:', contextValidation.errors);
        return this.createFallbackContext();
      }

      // Mettre en cache
      await this.cacheContext(context);
      this.cachedContext = context;
      
      console.log('✅ Contexte initialisé et mis en cache avec historique:', this.conversationHistory.length, 'échanges');
      return context;
      
    } catch (error) {
      console.error('🚨 Erreur initialisation contexte:', error);
      return this.createFallbackContext();
    }
  }

  /**
   * 🔍 VALIDATION DONNÉES ONBOARDING
   */
  validateOnboardingData() {
    try {
      const onboardingData = useOnboardingStore.getState();
      const errors = [];

      // Vérifications critiques
      if (!onboardingData.userInfo) {
        errors.push('UserInfo manquant');
      }

      if (!onboardingData.preferences) {
        errors.push('Préférences manquantes');
      }

      if (!onboardingData.melune) {
        errors.push('Configuration Melune manquante');
      }

      // Vérifier si onboarding au moins partiellement rempli
      const hasMinimumData = 
        onboardingData.userInfo?.journeyStarted || 
        onboardingData.completed ||
        Object.keys(onboardingData.preferences || {}).length > 0;

      if (!hasMinimumData) {
        errors.push('Données onboarding insuffisantes');
      }

      return {
        isValid: errors.length === 0,
        errors,
        hasMinimumData
      };
    } catch (error) {
      console.error('🚨 Erreur validation onboarding:', error);
      return {
        isValid: false,
        errors: ['Erreur validation'],
        hasMinimumData: false
      };
    }
  }

  /**
   * 🛡️ CONTEXTE FALLBACK
   */
  createFallbackContext() {
    return {
      persona: 'emma',
      userProfile: {
        prenom: null,
        ageRange: null
      },
      currentPhase: 'non définie',
      preferences: {
        symptoms: 3,
        moods: 3,
        phyto: 3,
        phases: 3,
        lithotherapy: 3,
        rituals: 3
      },
      communicationTone: 'bienveillant'
    };
  }

  /**
   * 💾 GESTION CACHE CONTEXTE
   */
  async cacheContext(context) {
    try {
      const cacheData = {
        context,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('🚨 Erreur cache contexte:', error);
    }
  }

  /**
   * 📥 RÉCUPÉRATION CACHE CONTEXTE
   */
  async getCachedContext() {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      
      // Vérifier expiration (24h)
      const age = Date.now() - cacheData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24h
      
      if (age > maxAge) {
        console.log('🕒 Cache contexte expiré');
        await AsyncStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return cacheData.context;
    } catch (error) {
      console.warn('🚨 Erreur lecture cache:', error);
      return null;
    }
  }

  /**
   * 💬 ENVOI MESSAGE PRINCIPAL
   * Gestion cache + historique + appel API + fallback
   */
  async sendMessage(message, isFirstMessage = false) {
    // S'assurer que le service est initialisé
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Récupérer ou initialiser contexte
      let context = this.cachedContext;
      
      if (!context) {
        context = await this.getCachedContext();
      }
      
      if (!context || isFirstMessage) {
        console.log('🎯 Initialisation contexte pour premier message');
        context = await this.initializeContext();
      }

      // ✅ NOUVEAU : Ajouter historique au contexte si pas déjà présent
      if (!context.conversationHistory) {
        await this.loadConversationHistory();
        context.conversationHistory = this.conversationHistory;
      }

      // Appel API
      const response = await this.callChatAPI(message, context);
      
      // ✅ NOUVEAU : Sauvegarder échange dans l'historique
      await this.saveMessageExchange(message, response);
      
      return {
        success: true,
        message: response,
        source: 'api'
      };
      
    } catch (error) {
      console.error('🚨 Erreur sendMessage:', error);
      
      // Fallback simulation locale
      const fallbackResponse = this.getFallbackResponse(message);
      
      // ✅ NOUVEAU : Sauvegarder même les fallbacks
      if (fallbackResponse.success) {
        await this.saveMessageExchange(message, fallbackResponse.message);
      }
      
      return fallbackResponse;
    }
  }

  /**
   * 🌐 APPEL API CHAT
   */
  async callChatAPI(message, context) {
    const apiConfig = getApiRequestConfig(this.deviceId);
    
    const response = await fetch(`${apiConfig.baseURL}/api/chat`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify({
        message,
        context
      }),
      timeout: apiConfig.timeout
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Debug API response
    if (__DEV__) {
      console.log('🔍 API Response complète:', data);
    }
    
    // L'API retourne un format : { response, cost, timestamp, tokensUsed }
    if (data.response) {
      return data.response;
    }
    
    // Format alternatif avec success (si l'API change)
    if (data.success === false) {
      throw new Error(data.error?.message || 'Erreur API inconnue');
    }

    if (data.data?.message) {
      return data.data.message;
    }
    
    if (data.message) {
      return data.message;
    }

    // Si aucun format reconnu
    throw new Error('Format de réponse API non reconnu');
  }

  /**
   * 🔄 FALLBACK SIMULATION LOCALE
   */
  getFallbackResponse(message) {
    const fallbackMessage = FALLBACK_RESPONSES[message] || 
      "Je comprends. Pendant cette phase de ton cycle, ton corps traverse de nombreux changements. Comment puis-je t'accompagner aujourd'hui ?";

    return {
      success: true,
      message: fallbackMessage,
      source: 'fallback'
    };
  }

  /**
   * ✅ NOUVEAU : CHARGEMENT HISTORIQUE DEPUIS ASYNCSTORAGE
   */
  async loadConversationHistory() {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      
      if (!historyJson) {
        this.conversationHistory = [];
        return;
      }
      
      const historyData = JSON.parse(historyJson);
      
      // Validation format
      if (Array.isArray(historyData.exchanges)) {
        this.conversationHistory = historyData.exchanges;
        console.log('📚 Historique chargé:', this.conversationHistory.length, 'échanges');
      } else {
        console.warn('🚨 Format historique invalide, reset');
        this.conversationHistory = [];
      }
      
    } catch (error) {
      console.warn('🚨 Erreur chargement historique:', error);
      this.conversationHistory = [];
    }
  }

  /**
   * ✅ NOUVEAU : SAUVEGARDE ÉCHANGE DANS HISTORIQUE
   */
  async saveMessageExchange(userMessage, meluneResponse) {
    try {
      // Créer nouvel échange
      const newExchange = {
        user: userMessage,
        melune: meluneResponse,
        timestamp: Date.now()
      };
      
      // Ajouter au début (plus récent en premier)
      this.conversationHistory.unshift(newExchange);
      
      // Limiter à MAX_HISTORY_EXCHANGES
      if (this.conversationHistory.length > MAX_HISTORY_EXCHANGES) {
        this.conversationHistory = this.conversationHistory.slice(0, MAX_HISTORY_EXCHANGES);
      }
      
      // Sauvegarder en AsyncStorage
      const historyData = {
        exchanges: this.conversationHistory,
        lastUpdated: Date.now(),
        version: '1.0'
      };
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
      
      console.log('💾 Échange sauvegardé. Total historique:', this.conversationHistory.length);
      
    } catch (error) {
      console.warn('🚨 Erreur sauvegarde échange:', error);
    }
  }

  /**
   * ✅ NOUVEAU : STATS HISTORIQUE (DEBUG)
   */
  getHistoryStats() {
    return {
      count: this.conversationHistory.length,
      maxCount: MAX_HISTORY_EXCHANGES,
      exchanges: this.conversationHistory.map(exchange => ({
        userPreview: exchange.user.substring(0, 30) + '...',
        melunePreview: exchange.melune.substring(0, 30) + '...',
        timestamp: new Date(exchange.timestamp).toLocaleString()
      })),
      totalCharacters: this.conversationHistory.reduce((total, exchange) => 
        total + exchange.user.length + exchange.melune.length, 0)
    };
  }

  /**
   * ✅ NOUVEAU : NETTOYAGE HISTORIQUE (DEBUG)
   */
  async clearHistory() {
    try {
      this.conversationHistory = [];
      await AsyncStorage.removeItem(HISTORY_KEY);
      console.log('🧹 Historique conversationnel nettoyé');
    } catch (error) {
      console.warn('🚨 Erreur nettoyage historique:', error);
    }
  }

  /**
   * 🧹 NETTOYAGE CACHE (MODIFIÉ)
   */
  async clearCache() {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      this.cachedContext = null;
      // ✅ NOUVEAU : Optionnel - garder historique ou non lors du clear cache
      console.log('🧹 Cache contexte nettoyé (historique préservé)');
    } catch (error) {
      console.warn('🚨 Erreur nettoyage cache:', error);
    }
  }

  /**
   * 🔄 INVALIDATION CACHE (MODIFIÉ)
   */
  async invalidateCache() {
    await this.clearCache();
    // ✅ NOUVEAU : Recharger historique au prochain message
    this.conversationHistory = [];
    console.log('🔄 Cache invalidé - recalcul au prochain message avec historique');
  }
}

// Export instance singleton
export default new ChatService(); 