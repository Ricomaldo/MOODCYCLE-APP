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
import { useCycleStore } from '../stores/useCycleStore';

const SYNC_STORAGE_KEY = 'sync_metadata_v1';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

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
      // Charger metadata
      await this.loadMetadata();
      
      // Initialiser NetworkQueue
      await NetworkQueue.initialize();
      
      // Démarrer sync périodique
      this.startPeriodicSync();
      
      console.log('✅ SyncManager initialisé');
    } catch (error) {
      console.error('❌ Erreur init SyncManager:', error);
    }
  }

  // ═══════════════════════════════════════════════════════
  // 🔄 SYNC PRINCIPAL
  // ═══════════════════════════════════════════════════════
  
  async syncAll() {
    if (this.syncing) return;
    
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      console.log('📡 Sync annulé: pas de connexion');
      return;
    }

    this.syncing = true;
    this.notifyListeners('sync:start');

    try {
      // Sync par priorité
      await this.syncCycle();
      await this.syncNotebook();
      await this.syncChat();
      await this.syncPreferences();
      
      // Mettre à jour metadata
      this.syncMetadata.lastSync.all = Date.now();
      await this.saveMetadata();
      
      this.notifyListeners('sync:complete');
      console.log('✅ Sync complet réussi');
      
    } catch (error) {
      console.error('❌ Erreur sync:', error);
      this.notifyListeners('sync:error', error);
    } finally {
      this.syncing = false;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 🎯 SYNC SPÉCIFIQUES
  // ═══════════════════════════════════════════════════════
  
  async syncCycle() {
    try {
      const cycleData = useCycleStore.getState().getCycleData();
      
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
      console.log('📊 Cycle synchronisé');
      
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
      
      // Batch par 50 entrées
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
      console.log('📝 Notebook synchronisé:', newEntries.length, 'entrées');
      
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
      
      // Ne sync que les messages user (pas les réponses Melune)
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
      console.log('💬 Chat synchronisé:', userMessages.length, 'messages');
      
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
      console.log('⚙️ Préférences synchronisées');
      
    } catch (error) {
      console.error('❌ Erreur sync preferences:', error);
    }
  }

  // ═══════════════════════════════════════════════════════
  // 🔍 DÉTECTION CHANGEMENTS
  // ═══════════════════════════════════════════════════════
  
  detectChanges(type, data, lastSync) {
    // Stratégie simple: timestamp-based
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
    // Hash simple pour détection changements
    return JSON.stringify(data).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString();
  }

  // ═══════════════════════════════════════════════════════
  // ⏱️ SYNC PÉRIODIQUE
  // ═══════════════════════════════════════════════════════
  
  startPeriodicSync() {
    this.stopPeriodicSync();
    
    this.syncTimer = setInterval(() => {
      this.syncAll();
    }, SYNC_INTERVAL);
    
    // Sync initial après 10s
    setTimeout(() => this.syncAll(), 10000);
  }

  stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 💾 PERSISTENCE
  // ═══════════════════════════════════════════════════════
  
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

  // ═══════════════════════════════════════════════════════
  // 📢 LISTENERS
  // ═══════════════════════════════════════════════════════
  
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
          console.warn('⚠️ Erreur listener:', error);
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════
  // 🛠️ UTILITAIRES
  // ═══════════════════════════════════════════════════════
  
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

// Singleton
export default new SyncManager();