// ═══════════════════════════════════════════════════════════
// 🌙 STORES SIMPLIFIÉS MOODCYCLE - VERSION UNIFIÉE
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
// 📱 useAppStore.js - État global simplifié
// ─────────────────────────────────────────────────────────
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAppStore = create(
  persist(
    (set) => ({
      // État minimal nécessaire
      isFirstLaunch: true,
      currentTheme: "light",
      notifications: { enabled: true },
      
      // Actions essentielles
      setFirstLaunch: (isFirst) => set({ isFirstLaunch: isFirst }),
      setTheme: (theme) => set({ currentTheme: theme }),
      updateNotifications: (settings) => set(state => ({
        notifications: { ...state.notifications, ...settings }
      })),
    }),
    { name: "app-storage", storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ─────────────────────────────────────────────────────────
// 👤 useUserStore.js - Données utilisateur + cycle unifié
// ─────────────────────────────────────────────────────────
import { calculatePersona } from "../services/PersonaEngine";

export const useUserStore = create(
  persist(
    (set, get) => ({
      // Profil utilisateur
      profile: {
        prenom: null,
        ageRange: null,
        completed: false,
      },
      
      // Préférences (0-5)
      preferences: {
        symptoms: 3, moods: 3, phyto: 3,
        phases: 3, lithotherapy: 3, rituals: 3,
      },
      
      // Cycle (SOURCE UNIQUE)
      cycle: {
        lastPeriodDate: null,
        length: 28,
        periodDuration: 5,
      },
      
      // Persona calculé
      persona: {
        assigned: null,
        confidence: 0,
        lastCalculated: null,
      },
      
      // Melune config
      melune: {
        avatarStyle: "classic",
        tone: "friendly",
      },

      // Actions
      updateProfile: (data) => set(state => ({
        profile: { ...state.profile, ...data }
      })),
      
      updatePreferences: (data) => set(state => ({
        preferences: { ...state.preferences, ...data }
      })),
      
      updateCycle: (data) => set(state => ({
        cycle: { ...state.cycle, ...data }
      })),
      
      updateMelune: (data) => set(state => ({
        melune: { ...state.melune, ...data }
      })),
      
      // Calcul persona automatique
      calculatePersona: () => {
        const state = get();
        const result = calculatePersona(state);
        set({ persona: result });
        return result.assigned;
      },
      
      // Phase actuelle (calcul centralisé)
      getCurrentPhase: () => {
        const { cycle } = get();
        if (!cycle.lastPeriodDate) return "menstrual";
        
        const daysSince = Math.floor(
          (Date.now() - new Date(cycle.lastPeriodDate)) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSince <= cycle.periodDuration) return "menstrual";
        if (daysSince <= cycle.length * 0.4) return "follicular";
        if (daysSince <= cycle.length * 0.6) return "ovulatory";
        if (daysSince < cycle.length) return "luteal";
        return "menstrual"; // Nouveau cycle
      },
      
      getCurrentDay: () => {
        const { cycle } = get();
        if (!cycle.lastPeriodDate) return 1;
        
        const daysSince = Math.floor(
          (Date.now() - new Date(cycle.lastPeriodDate)) / (1000 * 60 * 60 * 24)
        );
        
        return (daysSince % cycle.length) + 1;
      },
    }),
    { name: "user-storage", storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ─────────────────────────────────────────────────────────
// 💬 useChatStore.js - Chat simplifié
// ─────────────────────────────────────────────────────────
export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      
      addMessage: (type, content, metadata = {}) => {
        const message = {
          id: Date.now().toString(),
          type,
          content,
          timestamp: Date.now(),
          ...metadata,
        };
        
        set(state => ({
          messages: [...state.messages, message]
        }));
      },
      
      setTyping: (isTyping) => set({ isTyping }),
      
      clearMessages: () => set({ messages: [] }),
      
      getLastMessages: (count = 5) => {
        const { messages } = get();
        return messages.slice(-count);
      },
    }),
    { 
      name: "chat-storage", 
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ messages: state.messages }) // Pas de sessions
    }
  )
);

// ─────────────────────────────────────────────────────────
// 📓 useNotebookStore.js - Carnet simplifié
// ─────────────────────────────────────────────────────────
export const useNotebookStore = create(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (content, type = "personal", tags = []) => {
        const entry = {
          id: Date.now().toString(),
          content,
          type, // 'personal' | 'saved' | 'tracking'
          tags,
          timestamp: Date.now(),
          phase: useUserStore.getState().getCurrentPhase(), // Auto-phase
        };
        
        set(state => ({
          entries: [entry, ...state.entries]
        }));
      },
      
      // Tracking rapide unifié
      addTracking: (mood, energy, symptoms = []) => {
        get().addEntry(
          `Humeur: ${mood} • Énergie: ${energy}`,
          "tracking",
          ["#tracking", ...symptoms.map(s => `#${s}`)]
        );
      },
      
      // Recherche simple par tags
      searchByTag: (tag) => {
        const { entries } = get();
        return entries.filter(entry => 
          entry.tags.includes(tag) || entry.content.includes(tag)
        );
      },
      
      deleteEntry: (id) => set(state => ({
        entries: state.entries.filter(entry => entry.id !== id)
      })),
    }),
    { name: "notebook-storage", storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ═══════════════════════════════════════════════════════════
// 🎯 BÉNÉFICES DE LA SIMPLIFICATION
// ═══════════════════════════════════════════════════════════

/*
✅ RÉDUCTION DRASTIQUE :
- 4 stores → 4 stores (mais 80% moins de code)
- 1 seule source cycle dans useUserStore
- Calculs phase centralisés et simples
- Tags automatiques supprimés (over-engineering)

✅ COHÉRENCE :
- Phase = fonction pure basée sur lastPeriodDate
- Jour cycle = calcul unifié
- Persona = recalculé uniquement quand nécessaire

✅ PERFORMANCE :
- Moins de watchers Zustand
- Calculs à la demande vs stockage
- Persistance sélective (partialize)

✅ MAINTENABILITÉ :
- Logic métier claire dans chaque store
- Pas de duplication entre stores
- API simple et prédictible
*/