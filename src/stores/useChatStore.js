//
// ─────────────────────────────────────────────────────────
// 📄 File: src/stores/useChatStore.js
// 🧩 Type: Store Chat
// 📚 Description: Messages + état conversation - Version épurée
// 🕒 Version: 4.0 - 2025-06-21
// 🧭 Used in: chat screen, Melune interactions
// ─────────────────────────────────────────────────────────
//
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useChatStore = create(
  persist(
    (set, get) => ({
      // ═══════════════════════════════════════════════════════
      // 💬 MESSAGES & ÉTAT
      // ═══════════════════════════════════════════════════════
      messages: [],
      isTyping: false,
      isWaitingResponse: false,

      // Suggestions contextuelles simples
      suggestions: [
        "Comment je me sens aujourd'hui ?",
        "Conseils pour ma phase actuelle",
        "Aide-moi à comprendre mon cycle",
        "Rituels de bien-être",
      ],

      // ═══════════════════════════════════════════════════════
      // 📝 GESTION MESSAGES
      // ═══════════════════════════════════════════════════════
      addMessage: (type, content, metadata = {}) => {
        const message = {
          id: Date.now().toString(),
          type, // 'user' | 'melune'
          content,
          timestamp: Date.now(),
          ...metadata,
        };

        set((state) => ({
          messages: [...state.messages, message],
        }));

        return message.id;
      },

      addUserMessage: (text) => {
        const { addMessage } = get();
        return addMessage("user", text);
      },

      addMeluneMessage: (text, options = {}) => {
        const { addMessage } = get();
        return addMessage("melune", text, {
          mood: options.mood || "friendly",
          persona: options.persona || null,
          isOffline: options.isOffline || false,
        });
      },

      // ═══════════════════════════════════════════════════════
      // 🔄 ÉTATS CONVERSATION
      // ═══════════════════════════════════════════════════════
      setTyping: (isTyping) => set({ isTyping }),

      setWaitingResponse: (isWaiting) => set({ isWaitingResponse: isWaiting }),

      // ═══════════════════════════════════════════════════════
      // 🎯 SUGGESTIONS DYNAMIQUES
      // ═══════════════════════════════════════════════════════
      updateSuggestions: (newSuggestions) =>
        set({ suggestions: newSuggestions }),

      getContextualSuggestions: () => {
        // Import useUserStore pour suggestions contextuelles
        const { getCurrentPhase } = require("../utils/cycleCalculations");
        const { useUserStore } = require("./useUserStore");
        const cycle = useUserStore.getState().cycle;
        const currentPhase = getCurrentPhase(cycle.lastPeriodDate, cycle.length, cycle.periodDuration);

        const phaseSuggestions = {
          menstrual: [
            "Comment soulager mes douleurs ?",
            "Rituels cocooning règles",
            "Nutrition pendant les règles",
          ],
          follicular: [
            "Optimiser mon énergie montante",
            "Nouveaux projets à commencer",
            "Sport adapté à cette phase",
          ],
          ovulatory: [
            "Profiter de mon pic d'énergie",
            "Communication et relations",
            "Créativité et socialisation",
          ],
          luteal: [
            "Gérer les changements d'humeur",
            "Préparer les prochaines règles",
            "Ralentir et m'écouter",
          ],
        };

        return phaseSuggestions[currentPhase] || get().suggestions;
      },

      // ═══════════════════════════════════════════════════════
      // 🔍 UTILITAIRES MESSAGES
      // ═══════════════════════════════════════════════════════
      getLastMessages: (count = 5) => {
        const { messages } = get();
        return messages.slice(-count);
      },

      getMessagesByType: (type) => {
        const { messages } = get();
        return messages.filter((msg) => msg.type === type);
      },

      getMessagesCount: () => {
        const { messages } = get();
        return {
          total: messages.length,
          user: messages.filter((m) => m.type === "user").length,
          melune: messages.filter((m) => m.type === "melune").length,
        };
      },

      // ═══════════════════════════════════════════════════════
      // 💾 SAUVEGARDE & EXPORT
      // ═══════════════════════════════════════════════════════
      
      // Sauvegarder message important dans notebook
      saveMessageToNotebook: (messageId) => {
        const { messages } = get();
        const message = messages.find((m) => m.id === messageId);
        
        if (message && message.type === "melune") {
          // Import notebook store
          const { useNotebookStore } = require("./useNotebookStore");
          const { getCurrentPhase } = require("../utils/cycleCalculations");
          const { useUserStore } = require("./useUserStore");
          
          const cycle = useUserStore.getState().cycle;
          const currentPhase = getCurrentPhase(cycle.lastPeriodDate, cycle.length, cycle.periodDuration);
          
          useNotebookStore.getState().addEntry(
            message.content,
            "saved",
            ["#melune", `#${currentPhase}`]
          );
          
          return true;
        }
        
        return false;
      },

      // Export conversation pour partage
      exportConversation: () => {
        const { messages } = get();
        const timestamp = new Date().toLocaleString("fr-FR");
        
        return {
          timestamp,
          messagesCount: messages.length,
          messages: messages.map((m) => ({
            type: m.type,
            content: m.content,
            timestamp: new Date(m.timestamp).toLocaleString("fr-FR"),
          })),
        };
      },

      // ═══════════════════════════════════════════════════════
      // 🗑️ NETTOYAGE
      // ═══════════════════════════════════════════════════════
      clearMessages: () =>
        set({
          messages: [],
          isTyping: false,
          isWaitingResponse: false,
        }),

      deleteMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        })),

      // Garder seulement les X derniers messages (performance)
      limitMessages: (maxCount = 100) =>
        set((state) => ({
          messages: state.messages.slice(-maxCount),
        })),

      reset: () =>
        set({
          messages: [],
          isTyping: false,
          isWaitingResponse: false,
          suggestions: [
            "Comment je me sens aujourd'hui ?",
            "Conseils pour ma phase actuelle",
            "Aide-moi à comprendre mon cycle",
            "Rituels de bien-être",
          ],
        }),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Persister seulement 50 derniers
      }),
    }
  )
);