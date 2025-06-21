//
// ─────────────────────────────────────────────────────────
// 📄 File: src/stores/useUserStore.js
// 🧩 Type: Store Utilisateur
// 📚 Description: Profil + Cycle + Persona + Melune - Source unique
// 🕒 Version: 4.0 - 2025-06-21
// 🧭 Used in: onboarding, cycle, chat, persona engine
// ─────────────────────────────────────────────────────────
//
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculatePersona } from "../services/PersonaEngine";

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
        symptoms: 3,     // Symptômes physiques
        moods: 3,        // Gestion émotionnelle
        phyto: 3,        // Phytothérapie
        phases: 3,       // Énergie cyclique
        lithotherapy: 3, // Lithothérapie
        rituals: 3,      // Rituels bien-être
      },

      // ═══════════════════════════════════════════════════════
      // 🌙 CYCLE MENSTRUEL (SOURCE UNIQUE)
      // ═══════════════════════════════════════════════════════
      cycle: {
        lastPeriodDate: null,     // Date dernières règles
        length: 28,               // Durée cycle
        periodDuration: 5,        // Durée règles
        isRegular: null,          // Régularité
        trackingExperience: null, // 'never', 'basic', 'advanced'
      },

      // ═══════════════════════════════════════════════════════
      // 🎭 PERSONA CALCULÉ
      // ═══════════════════════════════════════════════════════
      persona: {
        assigned: null,      // 'emma', 'laure', 'sylvie', 'christine', 'clara'
        confidence: 0,       // 0-1
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

      updateCycle: (data) =>
        set((state) => ({
          cycle: { ...state.cycle, ...data },
        })),

      updateMelune: (data) =>
        set((state) => ({
          melune: { ...state.melune, ...data },
        })),

      completeProfile: () =>
        set((state) => ({
          profile: { ...state.profile, completed: true },
        })),

      // ═══════════════════════════════════════════════════════
      // 🧮 CALCULS CYCLE (FONCTIONS PURES)
      // ═══════════════════════════════════════════════════════
      getCurrentPhase: () => {
        const { cycle } = get();
        if (!cycle.lastPeriodDate) return "menstrual";

        const daysSince = Math.floor(
          (Date.now() - new Date(cycle.lastPeriodDate)) / (1000 * 60 * 60 * 24)
        );

        // Logique phases simplifiée
        if (daysSince <= cycle.periodDuration) return "menstrual";
        if (daysSince <= cycle.length * 0.4) return "follicular";
        if (daysSince <= cycle.length * 0.6) return "ovulatory";
        if (daysSince < cycle.length) return "luteal";
        
        return "menstrual"; // Nouveau cycle commencé
      },

      getCurrentDay: () => {
        const { cycle } = get();
        if (!cycle.lastPeriodDate) return 1;

        const daysSince = Math.floor(
          (Date.now() - new Date(cycle.lastPeriodDate)) / (1000 * 60 * 60 * 24)
        );

        return (daysSince % cycle.length) + 1;
      },

      getDaysSinceLastPeriod: () => {
        const { cycle } = get();
        if (!cycle.lastPeriodDate) return 0;

        return Math.floor(
          (Date.now() - new Date(cycle.lastPeriodDate)) / (1000 * 60 * 60 * 24)
        );
      },

      // Phase info enrichie
      getCurrentPhaseInfo: () => {
        const state = get();
        const phase = state.getCurrentPhase();
        const day = state.getCurrentDay();

        const phaseNames = {
          menstrual: "Menstruelle",
          follicular: "Folliculaire", 
          ovulatory: "Ovulatoire",
          luteal: "Lutéale",
        };

        const phaseColors = {
          menstrual: "#ff6b6b",
          follicular: "#51cf66",
          ovulatory: "#ffd43b", 
          luteal: "#845ef7",
        };

        return {
          phase,
          name: phaseNames[phase],
          color: phaseColors[phase],
          day,
        };
      },

      // ═══════════════════════════════════════════════════════
      // 🎭 GESTION PERSONA
      // ═══════════════════════════════════════════════════════
      calculatePersona: () => {
        const { profile, preferences } = get();
        
        // Utilisation de l'import direct
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
      // 🔄 UTILITAIRES
      // ═══════════════════════════════════════════════════════
      
      // Export données pour services externes
      getContextForAPI: () => {
        const state = get();
        return {
          persona: state.persona.assigned,
          phase: state.getCurrentPhase(),
          preferences: state.preferences,
          profile: state.profile,
        };
      },

      // Check si données minimum pour fonctionner
      hasMinimumData: () => {
        const { profile, preferences } = get();
        return !!(
          profile.ageRange &&
          profile.journeyChoice &&
          Object.keys(preferences).length > 0
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
            symptoms: 3,
            moods: 3,
            phyto: 3,
            phases: 3,
            lithotherapy: 3,
            rituals: 3,
          },
          cycle: {
            lastPeriodDate: null,
            length: 28,
            periodDuration: 5,
            isRegular: null,
            trackingExperience: null,
          },
          persona: {
            assigned: null,
            confidence: 0,
            lastCalculated: null,
            scores: {},
          },
          melune: {
            avatarStyle: "classic",
            tone: "friendly",
            personalityMatch: null,
          },
        }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
        cycle: state.cycle,
        persona: state.persona,
        melune: state.melune,
      }),
    }
  )
);