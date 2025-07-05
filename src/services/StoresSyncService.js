//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/StoresSyncService.js
// 🧩 Type: Service de Synchronisation des Stores
// 📚 Description: Collecte et envoie tous les stores Zustand vers l'API
// 🕒 Version: 1.0 - 2025-01-15
// 🧭 Used in: App initialization, background sync
// ─────────────────────────────────────────────────────────
//

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApiUrl } from '../config/api';

// Import de tous les stores
import { useUserStore } from '../stores/useUserStore';
import { useCycleStore } from '../stores/useCycleStore';
import { useChatStore } from '../stores/useChatStore';
import { useNotebookStore } from '../stores/useNotebookStore';
import { useEngagementStore } from '../stores/useEngagementStore';
import { useUserIntelligence } from '../stores/useUserIntelligence';
import { useNavigationStore } from '../stores/useNavigationStore';
import { useAppStore } from '../stores/useAppStore';
import behaviorAnalytics from './BehaviorAnalyticsService';
import deviceMetrics from './DeviceMetricsService';

class StoresSyncService {
  constructor() {
    this.syncInProgress = false;
    this.lastSyncTimestamp = null;
    this.deviceId = null;
    this.apiUrl = getApiUrl();
  }

  /**
   * Initialiser le service avec un deviceId unique
   */
  async initialize() {
    try {
      // Récupérer ou créer un deviceId unique
      let deviceId = await AsyncStorage.getItem('moodcycle_device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('moodcycle_device_id', deviceId);
        console.log('🆔 New device ID created:', deviceId);
      }
      
      this.deviceId = deviceId;
      
      // Récupérer le timestamp de la dernière sync
      const lastSync = await AsyncStorage.getItem('moodcycle_last_sync');
      if (lastSync) {
        this.lastSyncTimestamp = new Date(lastSync);
      }
      
      console.log('📊 StoresSyncService initialized');
      console.log(`🆔 Device ID: ${this.deviceId}`);
      console.log(`🕒 Last sync: ${this.lastSyncTimestamp?.toLocaleString('fr-FR') || 'Never'}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize StoresSyncService:', error);
      return false;
    }
  }

  /**
   * Collecter tous les stores actuels
   */
  collectAllStores() {
    try {
      console.log('🔄 Starting store collection...');
      
      // Fonction helper pour collecter un store en sécurité
      const safeCollectStore = (storeName, collectFn) => {
        try {
          const result = collectFn();
          console.log(`✅ ${storeName} collected successfully`);
          return result;
        } catch (error) {
          console.error(`❌ Failed to collect ${storeName}:`, error);
          return { 
            __collection_failed: true, 
            __store_name: storeName,
            __error: error.message 
          };
        }
      };
      
      // Utiliser getState() pour récupérer l'état actuel des stores
      const stores = {
        userStore: safeCollectStore('userStore', () => useUserStore.getState()),
        cycleStore: safeCollectStore('cycleStore', () => useCycleStore.getState()),
        chatStore: safeCollectStore('chatStore', () => useChatStore.getState()),
        notebookStore: safeCollectStore('notebookStore', () => useNotebookStore.getState()),
        engagementStore: safeCollectStore('engagementStore', () => useEngagementStore.getState()),
        userIntelligence: safeCollectStore('userIntelligence', () => useUserIntelligence.getState()),
        navigationStore: safeCollectStore('navigationStore', () => useNavigationStore.getState()),
        appStore: safeCollectStore('appStore', () => useAppStore.getState()),
        // Ajouter les données comportementales
        behaviorStore: safeCollectStore('behaviorStore', () => behaviorAnalytics.getSyncData()),
        // Ajouter les métriques device
        deviceStore: safeCollectStore('deviceStore', () => deviceMetrics.getSyncData())
      };

      console.log('🔄 Cleaning stores data...');
      // Nettoyer les données pour éviter les références circulaires
      const cleanStores = this.sanitizeStores(stores);
      
      console.log('📊 Stores collected successfully');
      console.log('📈 Store sizes:', {
        userStore: Object.keys(cleanStores.userStore || {}).length,
        cycleStore: Object.keys(cleanStores.cycleStore || {}).length,
        chatStore: cleanStores.chatStore?.messages?.length || 0,
        notebookStore: cleanStores.notebookStore?.entries?.length || 0,
        engagementStore: Object.keys(cleanStores.engagementStore || {}).length,
        userIntelligence: Object.keys(cleanStores.userIntelligence || {}).length,
        behaviorStore: cleanStores.behaviorStore?.behaviors?.length || 0,
        deviceStore: cleanStores.deviceStore?.metrics?.length || 0
      });
      
      return cleanStores;
    } catch (error) {
      console.error('❌ Failed to collect stores:', error);
      return null;
    }
  }

  /**
   * Nettoyer les stores pour supprimer les fonctions et références circulaires
   */
  sanitizeStores(stores) {
    const sanitized = {};
    
    for (const [storeName, store] of Object.entries(stores)) {
      sanitized[storeName] = this.cleanObject(store);
    }
    
    return sanitized;
  }

  /**
   * Nettoyer récursivement un objet
   */
  cleanObject(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObject(item));
    }
    
    // Protection contre les Map, Set, et autres objets non-itérables
    if (obj instanceof Map) {
      return Object.fromEntries(obj);
    }
    
    if (obj instanceof Set) {
      return Array.from(obj);
    }
    
    // Protection contre les objets avec Symbol.iterator malformé
    try {
      // Vérifier si Object.entries peut être appelé en sécurité
      if (typeof obj === 'object' && obj.constructor === Object) {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          // Exclure les fonctions et propriétés internes
          if (typeof value === 'function') continue;
          if (key.startsWith('_')) continue;
          if (key.includes('hydrate')) continue;
          if (key.includes('persist')) continue;
          
          cleaned[key] = this.cleanObject(value);
        }
        return cleaned;
      } else {
        // Pour les objets complexes, essayer de les sérialiser
        try {
          const serialized = JSON.parse(JSON.stringify(obj));
          return this.cleanObject(serialized);
        } catch (serializationError) {
          // Si la sérialisation échoue, retourner un objet vide avec info
          console.warn('⚠️ Object serialization failed:', serializationError);
          return { 
            __serialization_failed: true, 
            __type: obj.constructor?.name || 'unknown',
            __error: serializationError.message 
          };
        }
      }
    } catch (error) {
      console.warn('⚠️ Object cleaning failed:', error);
      return { 
        __cleaning_failed: true, 
        __type: obj.constructor?.name || 'unknown',
        __error: error.message 
      };
    }
  }

  /**
   * Envoyer les stores vers l'API
   */
  async syncStores(force = false) {
    if (this.syncInProgress && !force) {
      console.log('⏳ Sync already in progress, skipping...');
      return { success: false, reason: 'sync_in_progress' };
    }

    if (!this.deviceId) {
      console.log('❌ Device ID not initialized');
      return { success: false, reason: 'device_id_missing' };
    }

    try {
      this.syncInProgress = true;
      console.log('🚀 Starting stores sync...');
      
      // Collecter tous les stores
      const stores = this.collectAllStores();
      if (!stores) {
        throw new Error('Failed to collect stores');
      }

      // Préparer les métadonnées
      const metadata = {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        appVersion: '1.0.0', // TODO: Récupérer depuis app.json
        deviceModel: Platform.constants?.Model || 'unknown',
        osVersion: Platform.constants?.Release || 'unknown',
        syncType: force ? 'manual' : 'automatic'
      };

      // Payload à envoyer
      const payload = {
        stores,
        metadata
      };

      // Headers requis
      const headers = {
        'Content-Type': 'application/json',
        'X-Device-ID': this.deviceId
      };

      console.log('📡 Sending stores to API...');
      console.log(`🎯 URL: ${this.apiUrl}/api/stores/sync`);
      console.log(`📦 Payload size: ${JSON.stringify(payload).length} chars`);

      // Envoyer vers l'API
      const response = await fetch(`${this.apiUrl}/api/stores/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        timeout: 30000 // 30 secondes timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Sauvegarder le timestamp de sync
        this.lastSyncTimestamp = new Date();
        await AsyncStorage.setItem('moodcycle_last_sync', this.lastSyncTimestamp.toISOString());
        
        console.log('✅ Stores synced successfully');
        console.log('📊 Server response:', {
          deviceId: result.deviceId,
          timestamp: result.timestamp,
          totalUsers: result.aggregatedMetrics?.totalUsers
        });
        
        return {
          success: true,
          timestamp: result.timestamp,
          deviceId: result.deviceId,
          aggregatedMetrics: result.aggregatedMetrics
        };
      } else {
        throw new Error(result.error || 'Unknown server error');
      }

    } catch (error) {
      console.error('❌ Stores sync failed:', error);
      
      // Sauvegarder l'erreur pour debug
      await AsyncStorage.setItem('moodcycle_last_sync_error', JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }));
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Synchronisation automatique en arrière-plan
   */
  async autoSync() {
    // Ne sync que si pas de sync récente (dernières 24h)
    if (this.lastSyncTimestamp) {
      const hoursSinceLastSync = (Date.now() - this.lastSyncTimestamp.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSync < 24) {
        console.log(`⏰ Last sync was ${Math.round(hoursSinceLastSync)}h ago, skipping auto-sync`);
        return { success: false, reason: 'too_recent' };
      }
    }

    console.log('🔄 Starting automatic stores sync...');
    return await this.syncStores(false);
  }

  /**
   * Synchronisation manuelle forcée
   */
  async manualSync() {
    console.log('👆 Manual stores sync requested');
    return await this.syncStores(true);
  }

  /**
   * Obtenir le statut de la dernière sync
   */
  async getSyncStatus() {
    try {
      const lastError = await AsyncStorage.getItem('moodcycle_last_sync_error');
      
      return {
        deviceId: this.deviceId,
        lastSyncTimestamp: this.lastSyncTimestamp,
        syncInProgress: this.syncInProgress,
        lastError: lastError ? JSON.parse(lastError) : null
      };
    } catch (error) {
      console.error('❌ Failed to get sync status:', error);
      return null;
    }
  }

  /**
   * Réinitialiser les données de sync (pour debug)
   */
  async resetSync() {
    try {
      await AsyncStorage.removeItem('moodcycle_last_sync');
      await AsyncStorage.removeItem('moodcycle_last_sync_error');
      this.lastSyncTimestamp = null;
      console.log('🔄 Sync data reset');
      return true;
    } catch (error) {
      console.error('❌ Failed to reset sync data:', error);
      return false;
    }
  }

  /**
   * Obtenir les métriques de synchronisation
   */
  getSyncMetrics() {
    const stores = this.collectAllStores();
    if (!stores) return null;

    return {
      deviceId: this.deviceId,
      lastSync: this.lastSyncTimestamp,
      storesSizes: {
        userStore: JSON.stringify(stores.userStore || {}).length,
        cycleStore: JSON.stringify(stores.cycleStore || {}).length,
        chatStore: JSON.stringify(stores.chatStore || {}).length,
        notebookStore: JSON.stringify(stores.notebookStore || {}).length,
        engagementStore: JSON.stringify(stores.engagementStore || {}).length,
        userIntelligence: JSON.stringify(stores.userIntelligence || {}).length,
        behaviorStore: JSON.stringify(stores.behaviorStore || {}).length,
        deviceStore: JSON.stringify(stores.deviceStore || {}).length
      },
      totalDataSize: JSON.stringify(stores).length,
      syncInProgress: this.syncInProgress
    };
  }
}

// Instance singleton
const storesSyncService = new StoresSyncService();

export default storesSyncService; 