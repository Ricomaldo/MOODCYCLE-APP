//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useStoresSync.js
// 🧩 Type: Hook React pour synchronisation stores
// 📚 Description: Interface React pour StoresSyncService
// 🕒 Version: 1.0 - 2025-01-15
// 🧭 Used in: App.js, DevPanel, Settings
// ─────────────────────────────────────────────────────────
//

import { useState, useEffect, useCallback } from 'react';
import storesSyncService from '../services/StoresSyncService';

export const useStoresSync = () => {
  const [syncStatus, setSyncStatus] = useState({
    initialized: false,
    deviceId: null,
    lastSync: null,
    syncInProgress: false,
    lastError: null
  });
  
  const [syncMetrics, setSyncMetrics] = useState(null);

  /**
   * Initialiser le service de sync
   */
  const initializeSync = useCallback(async () => {
    try {
      console.log('🔄 Initializing stores sync...');
      const success = await storesSyncService.initialize();
      
      if (success) {
        // Récupérer le statut initial
        const status = await storesSyncService.getSyncStatus();
        if (status) {
          setSyncStatus({
            initialized: true,
            deviceId: status.deviceId,
            lastSync: status.lastSyncTimestamp,
            syncInProgress: status.syncInProgress,
            lastError: status.lastError
          });
        }
        
        // Récupérer les métriques
        const metrics = storesSyncService.getSyncMetrics();
        setSyncMetrics(metrics);
        
        console.log('✅ Stores sync initialized successfully');
        return true;
      } else {
        console.error('❌ Failed to initialize stores sync');
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing stores sync:', error);
      setSyncStatus(prev => ({
        ...prev,
        lastError: { error: error.message, timestamp: new Date().toISOString() }
      }));
      return false;
    }
  }, []);

  /**
   * Synchronisation automatique
   */
  const autoSync = useCallback(async () => {
    if (!syncStatus.initialized) {
      console.log('⚠️ Sync service not initialized, skipping auto-sync');
      return { success: false, reason: 'not_initialized' };
    }

    try {
      setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
      
      const result = await storesSyncService.autoSync();
      
      // Mettre à jour le statut
      const status = await storesSyncService.getSyncStatus();
      if (status) {
        setSyncStatus({
          initialized: true,
          deviceId: status.deviceId,
          lastSync: status.lastSyncTimestamp,
          syncInProgress: status.syncInProgress,
          lastError: status.lastError
        });
      }
      
      // Mettre à jour les métriques
      const metrics = storesSyncService.getSyncMetrics();
      setSyncMetrics(metrics);
      
      return result;
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastError: { error: error.message, timestamp: new Date().toISOString() }
      }));
      return { success: false, error: error.message };
    }
  }, [syncStatus.initialized]);

  /**
   * Synchronisation manuelle
   */
  const manualSync = useCallback(async () => {
    if (!syncStatus.initialized) {
      console.log('⚠️ Sync service not initialized, initializing first...');
      const initialized = await initializeSync();
      if (!initialized) {
        return { success: false, reason: 'initialization_failed' };
      }
    }

    try {
      setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
      
      const result = await storesSyncService.manualSync();
      
      // Mettre à jour le statut
      const status = await storesSyncService.getSyncStatus();
      if (status) {
        setSyncStatus({
          initialized: true,
          deviceId: status.deviceId,
          lastSync: status.lastSyncTimestamp,
          syncInProgress: status.syncInProgress,
          lastError: status.lastError
        });
      }
      
      // Mettre à jour les métriques
      const metrics = storesSyncService.getSyncMetrics();
      setSyncMetrics(metrics);
      
      return result;
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastError: { error: error.message, timestamp: new Date().toISOString() }
      }));
      return { success: false, error: error.message };
    }
  }, [syncStatus.initialized, initializeSync]);

  /**
   * Réinitialiser les données de sync
   */
  const resetSync = useCallback(async () => {
    try {
      const success = await storesSyncService.resetSync();
      if (success) {
        setSyncStatus(prev => ({
          ...prev,
          lastSync: null,
          lastError: null
        }));
        console.log('✅ Sync data reset successfully');
      }
      return success;
    } catch (error) {
      console.error('❌ Failed to reset sync data:', error);
      return false;
    }
  }, []);

  /**
   * Actualiser le statut et les métriques
   */
  const refreshStatus = useCallback(async () => {
    if (!syncStatus.initialized) return;

    try {
      const status = await storesSyncService.getSyncStatus();
      if (status) {
        setSyncStatus({
          initialized: true,
          deviceId: status.deviceId,
          lastSync: status.lastSyncTimestamp,
          syncInProgress: status.syncInProgress,
          lastError: status.lastError
        });
      }
      
      const metrics = storesSyncService.getSyncMetrics();
      setSyncMetrics(metrics);
    } catch (error) {
      console.error('❌ Failed to refresh sync status:', error);
    }
  }, [syncStatus.initialized]);

  /**
   * Formatage des données pour l'affichage
   */
  const getFormattedSyncInfo = useCallback(() => {
    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date) => {
      if (!date) return 'Jamais';
      return new Date(date).toLocaleString('fr-FR');
    };

    return {
      deviceId: syncStatus.deviceId?.substring(0, 12) + '...' || 'Non défini',
      lastSync: formatDate(syncStatus.lastSync),
      totalDataSize: syncMetrics ? formatBytes(syncMetrics.totalDataSize) : 'N/A',
      storesSizes: syncMetrics ? Object.entries(syncMetrics.storesSizes).map(([store, size]) => ({
        store,
        size: formatBytes(size)
      })) : [],
      hasError: !!syncStatus.lastError,
      errorMessage: syncStatus.lastError?.error || null,
      errorTime: syncStatus.lastError ? formatDate(syncStatus.lastError.timestamp) : null
    };
  }, [syncStatus, syncMetrics]);

  // Initialisation automatique au montage du hook
  useEffect(() => {
    initializeSync();
  }, [initializeSync]);

  return {
    // État
    syncStatus,
    syncMetrics,
    
    // Actions
    initializeSync,
    autoSync,
    manualSync,
    resetSync,
    refreshStatus,
    
    // Utilitaires
    getFormattedSyncInfo,
    
    // Statut simplifié
    isInitialized: syncStatus.initialized,
    isLoading: syncStatus.syncInProgress,
    hasError: !!syncStatus.lastError,
    deviceId: syncStatus.deviceId
  };
}; 