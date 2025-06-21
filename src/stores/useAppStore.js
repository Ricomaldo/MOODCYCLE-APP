//
// ─────────────────────────────────────────────────────────
// 📄 File: src/stores/useAppStore.js
// 🧩 Type: Store Global
// 📚 Description: État global application - Version simplifiée
// 🕒 Version: 4.0 - 2025-06-21
// 🧭 Used in: App.js, navigation, thème, notifications
// ─────────────────────────────────────────────────────────
//
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAppStore = create(
  persist(
    (set, get) => ({
      // État application minimal
      isFirstLaunch: true,
      currentTheme: "light", // 'light' | 'dark'
      isOnline: true,

      // Notifications simplifiées
      notifications: {
        enabled: true,
        cycleReminders: true,
        dailyReflection: true,
      },

      // Actions essentielles
      setFirstLaunch: (isFirst) => set({ isFirstLaunch: isFirst }),

      setTheme: (theme) => set({ currentTheme: theme }),

      setOnlineStatus: (isOnline) => set({ isOnline }),

      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      // Utilitaires
      canNavigate: () => {
        const { isOnline } = get();
        return true; // Mode offline-first
      },

      reset: () =>
        set({
          isFirstLaunch: true,
          currentTheme: "light",
          notifications: {
            enabled: true,
            cycleReminders: true,
            dailyReflection: true,
          },
        }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isFirstLaunch: state.isFirstLaunch,
        currentTheme: state.currentTheme,
        notifications: state.notifications,
      }),
    }
  )
);