import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '../stores/useAppStore';

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });
  
  const { setOnlineStatus } = useAppStore();

  useEffect(() => {
    // Obtenir l'état initial du réseau
    const getInitialNetworkState = async () => {
      const state = await NetInfo.fetch();
      const isOnline = state.isConnected && state.isInternetReachable;
      
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
      
      setOnlineStatus(isOnline);
    };

    getInitialNetworkState();

    // Écouter les changements d'état du réseau
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable;
      
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
      
      setOnlineStatus(isOnline);
      
      // Log pour le développement
      if (__DEV__) {
        console.log('Network status changed:', {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          isOnline,
        });
      }
    });

    // Nettoyage de l'abonnement
    return () => unsubscribe();
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