//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/ChatService.js
// 🧩 Type: Service
// 📚 Description: Service chat simplifié - Compatible nouveaux stores
// 🕒 Version: 4.0 - 2025-06-21
// ─────────────────────────────────────────────────────────
//
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../stores/useUserStore.js';
import { useChatStore } from '../stores/useChatStore.js';
import { getApiRequestConfig } from '../config/api.js';

const DEVICE_ID_KEY = 'device_id_v1';

const FALLBACK_RESPONSES = {
  "Comment te sens-tu aujourd'hui?": 'Je me sens plutôt bien, et toi?',
  'Pourquoi je me sens si fatiguée?': 'La fatigue est normale pendant cette phase de ton cycle. Ton corps travaille dur et tes hormones fluctuent.',
  'Quels aliments me recommandes-tu?': 'Pendant ta phase actuelle, des aliments riches en fer et en protéines seraient bénéfiques.',
};

class ChatService {
  constructor() {
    this.deviceId = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.deviceId = await this.getOrGenerateDeviceId();
      this.isInitialized = true;
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

  async sendMessage(message) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // ✅ Nouveau : contexte depuis useUserStore unifié
      const context = useUserStore.getState().getContextForAPI();
      
      const response = await this.callChatAPI(message, context);
      
      return {
        success: true,
        message: response,
        source: 'api',
      };
    } catch (error) {
      console.error('🚨 Erreur sendMessage:', error);
      
      const fallbackResponse = this.getFallbackResponse(message);
      return fallbackResponse;
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

  getFallbackResponse(message) {
    const fallbackMessage = FALLBACK_RESPONSES[message] || 
      "Je comprends. Comment puis-je t'accompagner aujourd'hui ?";

    return {
      success: true,
      message: fallbackMessage,
      source: 'fallback',
    };
  }
}

export default new ChatService();