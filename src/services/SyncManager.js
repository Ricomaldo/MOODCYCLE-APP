//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/SyncManager.js
// 🧩 Type: Service
// 📚 Description: Synchronisation bidirectionnelle des données
// 🕒 Version: 1.0 - 2025-01-21
// 🧭 Used in: stores, background sync
// ─────────────────────────────────────────────────────────
//
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getApiRequestConfig } from '../config/api';
import NetworkQueue from './NetworkQueue';
import { useCycleStore, getCycleData } from '../stores/useCycleStore';

const SYNC_STORAGE_KEY = 'sync_metadata_v1';
const SYNC_INTERVAL = 5 * 60 * 1000;

class SyncManager {
  constructor() {
    this.syncMetadata = {
      lastSync: {},
      pendingChanges: {},
      conflicts: []
    };
    this.syncing = false;
    this.syncTimer = null;
    this.listeners = new Map();
  }

  async initialize() {
    try {
      await this.loadMetadata();
      await NetworkQueue.initialize();
      this.startPeriodicSync();
      
      console.info('✅ SyncManager initialisé');
    } catch (error) {
      console.error('❌ Erreur init SyncManager:', error);
    }
  }
  
  async syncAll() {
    if (this.syncing) return;
    
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      console.info('📡 Sync annulé: pas de connexion');
      return;
    }

    this.syncing = true;
    this.notifyListeners('sync:start');

    try {
      await this.syncCycle();
      await this.syncNotebook();
      await this.syncChat();
      await this.syncPreferences();
      
      this.syncMetadata.lastSync.all = Date.now();
      await this.saveMetadata();
      
      this.notifyListeners('sync:complete');
      console.info('✅ Sync complet réussi');
      
    } catch (error) {
      console.error('❌ Erreur sync:', error);
      this.notifyListeners('sync:error', error);
    } finally {
      this.syncing = false;
    }
  }
  
  async syncCycle() {
    try {
      const cycleData = getCycleData();
      
      if (!cycleData.lastPeriodDate) return;
      
      const lastSync = this.syncMetadata.lastSync.cycle || 0;
      const hasChanges = this.detectChanges('cycle', cycleData, lastSync);
      
      if (!hasChanges) return;
      
      await NetworkQueue.enqueue({
        url: `${getApiRequestConfig().baseURL}/api/sync/cycle`,
        method: 'POST',
        body: {
          cycle: cycleData,
          lastSync,
          timestamp: Date.now()
        },
        metadata: { type: 'cycle' }
      });
      
      this.syncMetadata.lastSync.cycle = Date.now();
      console.info('📊 Cycle synchronisé');
      
    } catch (error) {
      console.error('❌ Erreur sync cycle:', error);
    }
  }

  async syncNotebook() {
    try {
      const { useNotebookStore } = require('../stores/useNotebookStore');
      const entries = useNotebookStore.getState().entries;
      
      const lastSync = this.syncMetadata.lastSync.notebook || 0;
      const newEntries = entries.filter(e => e.timestamp > lastSync);
      
      if (newEntries.length === 0) return;
      
      const batches = this.createBatches(newEntries, 50);
      
      for (const batch of batches) {
        await NetworkQueue.enqueue({
          url: `${getApiRequestConfig().baseURL}/api/sync/notebook`,
          method: 'POST',
          body: {
            entries: batch,
            lastSync,
            timestamp: Date.now()
          },
          metadata: { type: 'notebook' }
        });
      }
      
      this.syncMetadata.lastSync.notebook = Date.now();
      console.info('📝 Notebook synchronisé:', newEntries.length, 'entrées');
      
    } catch (error) {
      console.error('❌ Erreur sync notebook:', error);
    }
  }

  async syncChat() {
    try {
      const { useChatStore } = require('../stores/useChatStore');
      const messages = useChatStore.getState().messages;
      
      const lastSync = this.syncMetadata.lastSync.chat || 0;
      const newMessages = messages.filter(m => m.timestamp > lastSync);
      
      if (newMessages.length === 0) return;
      
      const userMessages = newMessages.filter(m => m.type === 'user');
      
      if (userMessages.length > 0) {
        await NetworkQueue.enqueue({
          url: `${getApiRequestConfig().baseURL}/api/sync/chat`,
          method: 'POST',
          body: {
            messages: userMessages,
            lastSync,
            timestamp: Date.now()
          },
          metadata: { type: 'chat' }
        });
      }
      
      this.syncMetadata.lastSync.chat = Date.now();
      console.info('💬 Chat synchronisé:', userMessages.length, 'messages');
      
    } catch (error) {
      console.error('❌ Erreur sync chat:', error);
    }
  }

  async syncPreferences() {
    try {
      const { useUserStore } = require('../stores/useUserStore');
      const { preferences, persona } = useUserStore.getState();
      
      const lastSync = this.syncMetadata.lastSync.preferences || 0;
      const hasChanges = this.detectChanges('preferences', { preferences, persona }, lastSync);
      
      if (!hasChanges) return;
      
      await NetworkQueue.enqueue({
        url: `${getApiRequestConfig().baseURL}/api/sync/preferences`,
        method: 'POST',
        body: {
          preferences,
          persona,
          timestamp: Date.now()
        },
        metadata: { type: 'preferences' }
      });
      
      this.syncMetadata.lastSync.preferences = Date.now();
      console.info('⚙️ Préférences synchronisées');
      
    } catch (error) {
      console.error('❌ Erreur sync preferences:', error);
    }
  }
  
  detectChanges(type, data, lastSync) {
    const metadata = this.syncMetadata.pendingChanges[type];
    
    if (!metadata) {
      this.syncMetadata.pendingChanges[type] = {
        timestamp: Date.now(),
        hash: this.hashData(data)
      };
      return true;
    }
    
    const currentHash = this.hashData(data);
    if (currentHash !== metadata.hash) {
      metadata.timestamp = Date.now();
      metadata.hash = currentHash;
      return true;
    }
    
    return false;
  }

  hashData(data) {
    return JSON.stringify(data).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString();
  }
  
  startPeriodicSync() {
    this.stopPeriodicSync();
    
    this.syncTimer = setInterval(() => {
      this.syncAll();
    }, SYNC_INTERVAL);
    
    setTimeout(() => this.syncAll(), 10000);
  }

  stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
  
  async saveMetadata() {
    try {
      await AsyncStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(this.syncMetadata));
    } catch (error) {
      console.error('❌ Erreur sauvegarde metadata:', error);
    }
  }

  async loadMetadata() {
    try {
      const data = await AsyncStorage.getItem(SYNC_STORAGE_KEY);
      if (data) {
        this.syncMetadata = JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement metadata:', error);
    }
  }
  
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('⚠️ Erreur listener:', error);
        }
      });
    }
  }
  
  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  getStatus() {
    return {
      syncing: this.syncing,
      lastSync: this.syncMetadata.lastSync,
      pendingChanges: Object.keys(this.syncMetadata.pendingChanges).length,
      conflicts: this.syncMetadata.conflicts.length
    };
  }

  async forceSync(type) {
    this.syncMetadata.lastSync[type] = 0;
    await this.syncAll();
  }

  cleanup() {
    this.stopPeriodicSync();
  }
}

export default new SyncManager();