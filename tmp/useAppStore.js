import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // État de l'application
      isFirstLaunch: true,
      currentTheme: 'light',
      isOnline: true,
      
      // Navigation
      currentRoute: null,
      previousRoute: null,
      
      // Configuration globale
      notifications: {
        enabled: true,
        cycleReminders: true,
        insightNotifications: true,
        dailyReflection: true,
      },
      
      // État de développement
      devMode: false,
      debugInfo: false,
      
      // Actions
      setFirstLaunch: (isFirst) =>
        set(() => ({ isFirstLaunch: isFirst })),
      
      setTheme: (theme) =>
        set(() => ({ currentTheme: theme })),
      
      setOnlineStatus: (isOnline) =>
        set(() => ({ isOnline })),
      
      updateRoute: (route) =>
        set((state) => ({
          previousRoute: state.currentRoute,
          currentRoute: route,
        })),
      
      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
      
      toggleDevMode: () =>
        set((state) => ({ devMode: !state.devMode })),
      
      toggleDebugInfo: () =>
        set((state) => ({ debugInfo: !state.debugInfo })),
      
      // Utilitaires
      canNavigate: () => {
        const { isOnline } = get();
        return true; // Pour l'instant, toujours possible (mode offline)
      },
      
      resetApp: () =>
        set(() => ({
          isFirstLaunch: true,
          currentRoute: null,
          previousRoute: null,
          devMode: false,
          debugInfo: false,
        })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isFirstLaunch: state.isFirstLaunch,
        currentTheme: state.currentTheme,
        notifications: state.notifications,
        devMode: state.devMode,
      }),
    }
  )
); 