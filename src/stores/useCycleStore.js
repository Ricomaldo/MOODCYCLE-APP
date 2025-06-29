//
// ─────────────────────────────────────────────────────────
// 📄 File: src/stores/useCycleStore.js
// 🧩 Type: Store Cycle Menstruel SIMPLIFIÉ
// 📚 Description: Store unique pour le cycle - ARCHITECTURE CLEAN
// 🕒 Version: 3.1 - 2025-06-29 - AJOUT OBSERVATIONS
// 🧭 Used in: CycleView, CycleWheel, etc.
// ─────────────────────────────────────────────────────────
//
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CYCLE_DEFAULTS } from "../config/cycleConstants";
import {
  getCurrentPhase,
  getCurrentCycleDay,
  getCurrentPhaseInfo,
  getNextPeriodDate,
  getDaysUntilNextPeriod,
  validateCycleData,
  getCurrentPhaseAdaptive,
  getCycleMode
} from "../utils/cycleCalculations";

// ═══════════════════════════════════════════════════════
// 🏪 STORE PRINCIPAL
// ═══════════════════════════════════════════════════════

export const useCycleStore = create(
  persist(
    (set, get) => ({
      // 📊 DONNÉES SIMPLES
      lastPeriodDate: null,
      length: CYCLE_DEFAULTS.LENGTH,
      periodDuration: CYCLE_DEFAULTS.PERIOD_DURATION,
      isRegular: null,
      trackingExperience: null,
      
      // 🆕 OBSERVATIONS
      observations: [],
      detectedPatterns: null,
      
      // 🎯 ACTIONS SIMPLES
      startNewCycle: (date = new Date()) => {
        set({
          lastPeriodDate: date.toISOString(),
          periodDuration: CYCLE_DEFAULTS.PERIOD_DURATION
        });
      },

      endPeriod: () => {
        const state = get();
        const currentDay = getCurrentCycleDay(state.lastPeriodDate, state.length);
        set({ periodDuration: currentDay });
      },

      updateCycle: (data) => {
        set((state) => ({ ...state, ...data }));
      },

      resetCycle: () => {
        set({
          lastPeriodDate: null,
          length: CYCLE_DEFAULTS.LENGTH,
          periodDuration: CYCLE_DEFAULTS.PERIOD_DURATION,
          isRegular: null,
          trackingExperience: null,
          observations: [],
          detectedPatterns: null
        });
      },

      // 🆕 OBSERVATION
      addObservation: (feeling, energy, notes = '') => {
        const state = get();
        
        // Protection cycle non-init
        if (!state.lastPeriodDate) {
          console.warn('Cannot add observation: no cycle initialized');
          return;
        }
        
        const observation = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          feeling: feeling || 3,  // Default neutre
          energy: Math.max(1, Math.min(5, energy || 3)),
          notes: notes.substring(0, 500),
          phase: getCurrentPhase(state.lastPeriodDate, state.length, state.periodDuration),
          cycleDay: getCurrentCycleDay(state.lastPeriodDate, state.length)
        };
        
        // Limite AVANT concat (max 90 jours)
        const observations = state.observations.slice(-89);
        observations.push(observation);
        
        set({ observations });
      },
    }),
    {
      name: "cycle-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastPeriodDate: state.lastPeriodDate,
        length: state.length,
        periodDuration: state.periodDuration,
        isRegular: state.isRegular,
        trackingExperience: state.trackingExperience,
        observations: state.observations,
        detectedPatterns: state.detectedPatterns,
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════
// 🎣 SÉLECTEURS SIMPLES (pas de hooks complexes !)
// ═══════════════════════════════════════════════════════

export const getCycleData = () => {
  const state = useCycleStore.getState();
  return {
    lastPeriodDate: state.lastPeriodDate,
    length: state.length,
    periodDuration: state.periodDuration,
    isRegular: state.isRegular,
    trackingExperience: state.trackingExperience,
    observations: state.observations,
    detectedPatterns: state.detectedPatterns,
    // Méthodes calculées
    currentPhase: getCurrentPhase(state.lastPeriodDate, state.length, state.periodDuration),
    currentDay: getCurrentCycleDay(state.lastPeriodDate, state.length),
    phaseInfo: getCurrentPhaseInfo(state.lastPeriodDate, state.length, state.periodDuration),
    nextPeriodDate: getNextPeriodDate(state.lastPeriodDate, state.length),
    daysUntilNextPeriod: getDaysUntilNextPeriod(state.lastPeriodDate, state.length),
    hasData: !!(state.lastPeriodDate && state.length),
    hasObservations: state.observations && state.observations.length > 0
  };
};

export const getCurrentPhaseFromStore = () => {
  const state = useCycleStore.getState();
  return getCurrentPhase(state.lastPeriodDate, state.length, state.periodDuration);
};
export const getCurrentDayFromStore = () => {
  const state = useCycleStore.getState();
  return getCurrentCycleDay(state.lastPeriodDate, state.length);
};

// ═══════════════════════════════════════════════════════
// 🔄 HELPERS ADAPTATIFS (NOUVEAUX)
// ═══════════════════════════════════════════════════════

/**
 * Helper étendu avec support modes d'observation
 * Nécessite useUserIntelligence et useEngagementStore disponibles
 */
export const getCycleDataAdaptive = () => {
  const state = useCycleStore.getState();
  
  // Import dynamique pour éviter circular dependency
  let intelligence, engagement;
  try {
    const { useUserIntelligence } = require('./useUserIntelligence');
    const { useEngagementStore } = require('./useEngagementStore');
    intelligence = useUserIntelligence.getState();
    engagement = useEngagementStore.getState();
  } catch (error) {
    // Fallback si stores indisponibles
    intelligence = null;
    engagement = null;
  }

  // AJOUT : Phase adaptive si intelligence disponible
  const adaptivePhase = getCurrentPhaseAdaptive(
    state.lastPeriodDate,
    state.length,
    state.periodDuration,
    {
      mode: 'auto',
      userIntelligence: intelligence,
      engagementLevel: engagement?.maturity?.current
    }
  );

  const cycleMode = getCycleMode(intelligence, engagement?.maturity?.current);

  return {
    ...getCycleData(),
    // Existing returns...
    currentPhase: adaptivePhase, // Maintenant adaptive !
    cycleMode,
    isObservationBased: adaptivePhase !== getCurrentPhase(
      state.lastPeriodDate,
      state.length, 
      state.periodDuration
    ),
    // Intelligence metadata
    observationData: intelligence?.observationPatterns || null,
    maturityLevel: engagement?.maturity?.current || 'discovery'
  };
};