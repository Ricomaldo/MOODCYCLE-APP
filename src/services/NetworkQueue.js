//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/NetworkQueue.js
// 🧩 Type: Service
// 📚 Description: File d'attente pour requêtes offline avec retry intelligent
// 🕒 Version: 1.0 - 2025-01-21
// 🧭 Used in: ChatService, stores, sync operations
// ─────────────────────────────────────────────────────────
//
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getApiRequestConfig } from '../config/api';

const QUEUE_STORAGE_KEY = 'network_queue_v1';
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // Progressive delay

class NetworkQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.listeners = new Set();
    this.unsubscribe = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Charger la queue depuis storage
      await this.loadQueue();
      
      // Écouter les changements réseau
      this.unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected && state.isInternetReachable) {
          this.processQueue();
        }
      });

      this.initialized = true;
      console.log('✅ NetworkQueue initialisé avec', this.queue.length, 'requêtes en attente');
    } catch (error) {
      console.error('❌ Erreur init NetworkQueue:', error);
    }
  }

  // ═══════════════════════════════════════════════════════
  // 📥 AJOUT À LA QUEUE
  // ═══════════════════════════════════════════════════════
  
  async enqueue(request) {
    const queueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      request: {
        url: request.url,
        method: request.method || 'POST',
        headers: request.headers || {},
        body: request.body,
        metadata: request.metadata || {}
      },
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
      callback: request.callback || null
    };

    this.queue.push(queueItem);
    await this.saveQueue();
    
    // Notifier les listeners
    this.notifyListeners('enqueued', queueItem);

    // Tenter de traiter immédiatement
    this.processQueue();

    return queueItem.id;
  }

  // ═══════════════════════════════════════════════════════
  // 🔄 TRAITEMENT DE LA QUEUE
  // ═══════════════════════════════════════════════════════
  
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    // Vérifier connexion
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      console.log('📡 Pas de connexion, queue en attente');
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      if (item.status === 'processing') continue;
      
      try {
        item.status = 'processing';
        await this.processItem(item);
        
        // Succès : retirer de la queue
        this.queue.shift();
        this.notifyListeners('completed', item);
        
      } catch (error) {
        item.retries++;
        item.status = 'pending';
        item.lastError = error.message;
        
        if (item.retries >= MAX_RETRIES) {
          // Échec définitif
          this.queue.shift();
          this.notifyListeners('failed', item);
          console.error('❌ Échec définitif:', item.id, error);
        } else {
          // Retry avec delay
          const delay = RETRY_DELAYS[item.retries - 1] || 5000;
          console.log(`⏳ Retry ${item.retries}/${MAX_RETRIES} dans ${delay}ms`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    await this.saveQueue();
    this.processing = false;
  }

  async processItem(item) {
    const { request } = item;
    
    // Construire la requête complète
    const deviceId = request.metadata.deviceId || 'offline-device';
    const apiConfig = getApiRequestConfig(deviceId);
    
    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        ...apiConfig.headers,
        ...request.headers
      },
      body: request.body ? JSON.stringify(request.body) : undefined,
      timeout: apiConfig.timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Exécuter callback si fourni
    if (item.callback && typeof item.callback === 'function') {
      try {
        await item.callback(data, null);
      } catch (error) {
        console.warn('⚠️ Erreur callback:', error);
      }
    }

    return data;
  }

  // ═══════════════════════════════════════════════════════
  // 💾 PERSISTENCE
  // ═══════════════════════════════════════════════════════
  
  async saveQueue() {
    try {
      // Nettoyer les callbacks avant sauvegarde (non sérialisables)
      const cleanQueue = this.queue.map(item => ({
        ...item,
        callback: null
      }));
      
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(cleanQueue));
    } catch (error) {
      console.error('❌ Erreur sauvegarde queue:', error);
    }
  }

  async loadQueue() {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
        console.log('📥 Queue chargée:', this.queue.length, 'items');
      }
    } catch (error) {
      console.error('❌ Erreur chargement queue:', error);
      this.queue = [];
    }
  }

  // ═══════════════════════════════════════════════════════
  // 📢 LISTENERS
  // ═══════════════════════════════════════════════════════
  
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.warn('⚠️ Erreur listener:', error);
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  // 🔍 UTILITAIRES
  // ═══════════════════════════════════════════════════════
  
  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(i => i.status === 'pending').length,
      processing: this.queue.filter(i => i.status === 'processing').length,
      failed: this.queue.filter(i => i.retries >= MAX_RETRIES).length
    };
  }

  async clearQueue() {
    this.queue = [];
    await this.saveQueue();
    this.notifyListeners('cleared', {});
  }

  async removeItem(id) {
    this.queue = this.queue.filter(item => item.id !== id);
    await this.saveQueue();
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.initialized = false;
  }

  // ═══════════════════════════════════════════════════════
  // 🔄 CHAT OFFLINE HELPERS
  // ═══════════════════════════════════════════════════════
  
  async enqueueChatMessage(message, context, deviceId) {
    return this.enqueue({
      url: `${getApiRequestConfig().baseURL}/api/chat`,
      method: 'POST',
      body: { message, context },
      metadata: { 
        type: 'chat',
        deviceId,
        originalMessage: message
      },
      callback: async (response) => {
        // Ajouter la réponse au store quand elle arrive
        const { useChatStore } = require('../stores/useChatStore');
        useChatStore.getState().addMeluneMessage(response.message || response.response, {
          isOffline: false,
          delayed: true
        });
      }
    });
  }
}

// Singleton
export default new NetworkQueue();