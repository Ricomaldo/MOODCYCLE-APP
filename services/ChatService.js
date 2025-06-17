// services/ChatService.js
// Service de gestion du chat avec API MoodCycle
// Gestion cache + personnalisation progressive

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingStore } from '../stores/useOnboardingStore.js';
import ContextFormatter from './ContextFormatter.js';
import { getApiRequestConfig } from '../config/api.js';
const CACHE_KEY = 'conversation_context_v1';
const DEVICE_ID_KEY = 'device_id_v1';

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
   * Calcule et met en cache le contexte personnalisé
   */
  async initializeContext() {
    try {
      // Valider données onboarding
      const validationResult = this.validateOnboardingData();
      if (!validationResult.isValid) {
        console.warn('🚨 Données onboarding invalides:', validationResult.errors);
        return this.createFallbackContext();
      }

      // Générer contexte personnalisé
      const context = ContextFormatter.formatCompact();
      
      // Valider le contexte généré
      const contextValidation = ContextFormatter.validateContext(context);
      if (!contextValidation.valid) {
        console.warn('🚨 Contexte généré invalide:', contextValidation.errors);
        return this.createFallbackContext();
      }

      // Mettre en cache
      await this.cacheContext(context);
      this.cachedContext = context;
      
      console.log('✅ Contexte initialisé et mis en cache');
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
   * Gestion cache + appel API + fallback
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

      // Appel API
      const response = await this.callChatAPI(message, context);
      
      return {
        success: true,
        message: response,
        source: 'api'
      };
      
    } catch (error) {
      console.error('🚨 Erreur sendMessage:', error);
      
      // Fallback simulation locale
      return this.getFallbackResponse(message);
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
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Erreur API inconnue');
    }

    if (!data.data?.message && !data.message) {
      console.warn('⚠️ API retourne success=true mais message vide');
      throw new Error('Message vide reçu de l\'API');
    }

    return data.data?.message || data.message;
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
   * 🧹 NETTOYAGE CACHE
   */
  async clearCache() {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      this.cachedContext = null;
      console.log('🧹 Cache contexte nettoyé');
    } catch (error) {
      console.warn('🚨 Erreur nettoyage cache:', error);
    }
  }

  /**
   * 🔄 INVALIDATION CACHE (si OnboardingStore change)
   */
  async invalidateCache() {
    await this.clearCache();
    console.log('🔄 Cache invalidé - recalcul au prochain message');
  }
}

// Export instance singleton
export default new ChatService(); 