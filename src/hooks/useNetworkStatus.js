import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '../stores/useAppStore';
import performanceMonitor from '../core/monitoring/PerformanceMonitor';

// Singleton pour gérer un seul listener NetInfo
class NetworkManager {
  constructor() {
    this.listeners = new Set();
    this.currentState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
    };
    this.initialized = false;
    this.unsubscribe = null;
  }

  addListener(callback) {
    this.listeners.add(callback);
    
    // Initialiser le listener seulement au premier abonné
    if (!this.initialized) {
      this.init();
    }
    
    // Retourner l'état actuel immédiatement
    callback(this.currentState);
    
    // Retourner fonction de nettoyage
    return () => {
      this.listeners.delete(callback);
      
      // Si plus d'abonnés, nettoyer le listener NetInfo
      if (this.listeners.size === 0 && this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
        this.initialized = false;
      }
    };
  }

  async init() {
    if (this.initialized) return;
    
    // Obtenir l'état initial
    const state = await NetInfo.fetch();
    this.updateState(state);
    
    // Écouter les changements (un seul listener global)
    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.updateState(state);
    });
    
    this.initialized = true;
  }

  updateState(state) {
    const newState = {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    };
    
    // Seulement si l'état a vraiment changé
    const hasChanged = 
      newState.isConnected !== this.currentState.isConnected ||
      newState.isInternetReachable !== this.currentState.isInternetReachable ||
      newState.type !== this.currentState.type;
    
    if (hasChanged) {
      this.currentState = newState;
      
      // Log silencieux sauf en mode verbose (un seul log)
      if (__DEV__ && !performanceMonitor.silentMode) {
        console.log('Network status changed:', {
          isConnected: newState.isConnected,
          isInternetReachable: newState.isInternetReachable,
          type: newState.type,
          isOnline: newState.isConnected && newState.isInternetReachable,
        });
      }
      
      // Notifier tous les listeners
      this.listeners.forEach(callback => callback(newState));
    }
  }
}

// Instance singleton
const networkManager = new NetworkManager();

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  const { setOnlineStatus } = useAppStore();

  useEffect(() => {
    const cleanup = networkManager.addListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable;
      
      setNetworkState(state);
      setOnlineStatus(isOnline);
    });

    return cleanup;
  }, [setOnlineStatus]);

  return {
    ...networkState,
    isOnline: networkState.isConnected && networkState.isInternetReachable,
  };
}

// Hook simplifié pour juste savoir si on est en ligne
export function useIsOnline() {
  const { isOnline } = useNetworkStatus();
  return isOnline;
}
