//
// ─────────────────────────────────────────────────────────
// 📄 File: src/stores/useUserStore.js
// 🧩 Type: Store Utilisateur
// 📚 Description: Profil + Cycle + Persona + Melune - Source unique
// 🕒 Version: 5.0 - 2025-06-21 (ÉPURÉ - calculs déplacés)
// 🧭 Used in: onboarding, avec hooks/useCycle pour calculs
// ─────────────────────────────────────────────────────────
//
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculatePersona } from "../services/PersonaEngine";
import performanceMonitor from '../core/monitoring/PerformanceMonitor';

// 🚀 Démarrer le monitoring de l'hydratation
performanceMonitor.startStoreHydration('userStore');

export const useUserStore = create(
  persist(
    (set, get) => ({
      // ═══════════════════════════════════════════════════════
      // 👤 PROFIL UTILISATEUR
      // ═══════════════════════════════════════════════════════
      profile: {
        prenom: null,
        ageRange: null, // '18-25', '26-35', '36-45', '46-55', '55+'
        journeyChoice: null, // 'body', 'nature', 'emotions'
        completed: false,
      },

      // ═══════════════════════════════════════════════════════
      // 🎯 PRÉFÉRENCES (0-5)
      // ═══════════════════════════════════════════════════════
      preferences: {
        symptoms: 0,     // Symptômes physiques
        moods: 0,        // Gestion émotionnelle
        phyto: 0,        // Phytothérapie
        phases: 0,       // Énergie cyclique
        lithotherapy: 0, // Lithothérapie
        rituals: 0,      // Rituels bien-être
        terminology: 'medical', // ✨ NOUVEAU - Terminologie cyclique
      },



      // ═══════════════════════════════════════════════════════
      // 🎭 PERSONA CALCULÉ
      // ═══════════════════════════════════════════════════════
      persona: {
        assigned: "emma",      // 'emma', 'laure', 'sylvie', 'christine', 'clara'
        confidence: 0.8,       // 0-1
        lastCalculated: null,
        scores: {},          // Debug scores
      },

      // ═══════════════════════════════════════════════════════
      // 🤖 CONFIGURATION MELUNE
      // ═══════════════════════════════════════════════════════
      melune: {
        avatarStyle: "classic",    // 'classic', 'modern', 'mystique'
        tone: "friendly",          // 'friendly', 'professional', 'inspiring'
        personalityMatch: null,
        position: "bottom-right",  // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
        animated: true,            // true/false pour les animations
      },

      // ═══════════════════════════════════════════════════════
      // 🔄 MÉTADONNÉES DE SYNCHRONISATION
      // ═══════════════════════════════════════════════════════
      syncMetadata: {
        lastSyncAt: null,
        pendingSync: false
      },

      // ═══════════════════════════════════════════════════════
      // 🎯 ACTIONS - PROFIL
      // ═══════════════════════════════════════════════════════
      updateProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
        })),

      updatePreferences: (data) =>
        set((state) => ({
          preferences: { ...state.preferences, ...data },
        })),



      updateMelune: (data) =>
        set((state) => ({
          melune: { ...state.melune, ...data },
        })),

      updateSyncMetadata: (data) => set(state => ({
        syncMetadata: { ...state.syncMetadata, ...data }
      })),

      completeProfile: () =>
        set((state) => ({
          profile: { ...state.profile, completed: true },
        })),

      // ═══════════════════════════════════════════════════════
      // 🎭 GESTION PERSONA
      // ═══════════════════════════════════════════════════════
      calculatePersona: () => {
        const { profile, preferences } = get();
        
        const result = calculatePersona({ profile, preferences });
        
        set((state) => ({
          persona: {
            ...state.persona,
            assigned: result.assigned,
            confidence: result.confidence,
            scores: result.scores,
            lastCalculated: Date.now(),
          },
        }));

        return result.assigned;
      },

      setPersona: (persona, confidence = 1) =>
        set((state) => ({
          persona: {
            ...state.persona,
            assigned: persona,
            confidence,
            lastCalculated: Date.now(),
          },
        })),

      // ═══════════════════════════════════════════════════════
      // 🔄 UTILITAIRES (LEGACY - utiliser hooks/useCycle)
      // ═══════════════════════════════════════════════════════
      
      // Export données pour services externes
      getContextForAPI: () => {
        const state = get();
        
        return {
          persona: state.persona?.assigned,
          preferences: state.preferences || {},
          profile: state.profile || {},
        };
      },

      // Check si données minimum pour fonctionner
      hasMinimumData: () => {
        const { profile, preferences } = get();
        return !!(
          profile?.ageRange &&
          profile?.journeyChoice &&
          preferences && Object.keys(preferences).length > 0
        );
      },

      // Reset complet
      reset: () =>
        set({
          profile: {
            prenom: null,
            ageRange: null,
            journeyChoice: null,
            completed: false,
          },
          preferences: {
            symptoms: 0,
            moods: 0,
            phyto: 0,
            phases: 0,
            lithotherapy: 0,
            rituals: 0,
            terminology: 'medical',
          },

          persona: {
            assigned: "emma",
            confidence: 0.8,
            lastCalculated: null,
            scores: {},
          },
          melune: {
            avatarStyle: "classic",
            tone: "friendly",
            personalityMatch: null,
            position: "bottom-right",
            animated: true,
          },
          syncMetadata: {
            lastSyncAt: null,
            pendingSync: false
          },
        }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
        persona: state.persona,
        melune: state.melune,
        syncMetadata: state.syncMetadata,
      }),
    }
  )
);

// ✅ Marquer la fin de l'hydratation du store
performanceMonitor.endStoreHydration('userStore');