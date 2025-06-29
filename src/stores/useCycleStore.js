//
// ─────────────────────────────────────────────────────────
// 📄 File: src/stores/useCycleStore.js
// 🧩 Type: Store Cycle Menstruel SIMPLIFIÉ
// 📚 Description: Store unique pour le cycle - ARCHITECTURE CLEAN
// 🕒 Version: 3.0 - 2025-06-28 - SIMPLIFICATION RADICALE
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
  validateCycleData
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
          trackingExperience: null
        });
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
    // Méthodes calculées
    currentPhase: getCurrentPhase(state.lastPeriodDate, state.length, state.periodDuration),
    currentDay: getCurrentCycleDay(state.lastPeriodDate, state.length),
    phaseInfo: getCurrentPhaseInfo(state.lastPeriodDate, state.length, state.periodDuration),
    nextPeriodDate: getNextPeriodDate(state.lastPeriodDate, state.length),
    daysUntilNextPeriod: getDaysUntilNextPeriod(state.lastPeriodDate, state.length),
    hasData: !!(state.lastPeriodDate && state.length)
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