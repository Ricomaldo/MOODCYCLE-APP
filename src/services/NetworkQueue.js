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
const RETRY_DELAYS = [1000, 3000, 5000];

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
      await this.loadQueue();
      
      this.unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected && state.isInternetReachable) {
          this.processQueue();
        }
      });

      this.initialized = true;
      console.info('✅ NetworkQueue initialisé avec', this.queue.length, 'requêtes en attente');
    } catch (error) {
      console.error('❌ Erreur init NetworkQueue:', error);
    }
  }

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
    
    this.notifyListeners('enqueued', queueItem);
    this.processQueue();

    return queueItem.id;
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      if (item.status === 'processing') continue;
      
      try {
        item.status = 'processing';
        await this.processItem(item);
        
        this.queue.shift();
        this.notifyListeners('completed', item);
        
      } catch (error) {
        item.retries++;
        item.status = 'pending';
        item.lastError = error.message;
        
        if (item.retries >= MAX_RETRIES) {
          this.queue.shift();
          this.notifyListeners('failed', item);
          console.error('❌ Échec définitif:', item.id, error);
        } else {
          const delay = RETRY_DELAYS[item.retries - 1] || 5000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    await this.saveQueue();
    this.processing = false;
  }

  async processItem(item) {
    const { request } = item;
    
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
    
    if (item.callback && typeof item.callback === 'function') {
      try {
        await item.callback(data, null);
      } catch (error) {
        console.error('⚠️ Erreur callback:', error);
      }
    }

    return data;
  }

  async saveQueue() {
    try {
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
        console.info('📥 Queue chargée:', this.queue.length, 'items');
      }
    } catch (error) {
      console.error('❌ Erreur chargement queue:', error);
      this.queue = [];
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('❌ Erreur listener queue:', error);
      }
    });
  }

  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(item => item.status === 'pending').length,
      processing: this.queue.filter(item => item.status === 'processing').length,
      isProcessing: this.processing
    };
  }

  async clearQueue() {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  async removeItem(id) {
    this.queue = this.queue.filter(item => item.id !== id);
    await this.saveQueue();
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.listeners.clear();
  }

  async enqueueChatMessage(message, context, deviceId) {
    return this.enqueue({
      url: '/api/chat',
      method: 'POST',
      body: { message, context },
      metadata: { deviceId, type: 'chat' },
      callback: (response, error) => {
        if (error) {
          console.error('❌ Chat message failed:', error);
        } else {
          console.info('✅ Chat message sent offline');
        }
      }
    });
  }
}

export default NetworkQueue;