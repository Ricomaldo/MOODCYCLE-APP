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
        const validDate = date instanceof Date && !isNaN(date) ? date : new Date();
        set({
          lastPeriodDate: validDate.toISOString(),
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
      addObservation: (feeling = 3, energy = 3, notes = '') => {
        const state = get();
        if (!state.lastPeriodDate) {
          console.warn('Cannot add observation: no cycle initialized');
          return;
        }
        
        // Normaliser les valeurs (0 ou valeurs négatives deviennent 1, valeurs > 5 deviennent 5)
        const normalizedFeeling = feeling === null || feeling === undefined ? 3 : Math.max(1, Math.min(5, feeling));
        const normalizedEnergy = energy === null || energy === undefined ? 3 : Math.max(1, Math.min(5, energy));
        const truncatedNotes = (notes || '').slice(0, 500);
        
        // Calculer la phase et le jour du cycle
        const currentPhase = getCurrentPhase(state.lastPeriodDate, state.length, state.periodDuration);
        const currentDay = getCurrentCycleDay(state.lastPeriodDate, state.length);
        
        const newObservation = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ID unique
          feeling: normalizedFeeling,
          energy: normalizedEnergy,
          notes: truncatedNotes,
          timestamp: new Date().toISOString(),
          phase: currentPhase,
          cycleDay: currentDay
        };

        set(state => {
          const updatedObservations = [...state.observations, newObservation]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .slice(-90); // Limiter à 90 observations

          return {
            observations: updatedObservations
          };
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
  

  
  // ✅ FIX: Validation robuste des données de cycle
  const validLastPeriodDate = state.lastPeriodDate && !isNaN(new Date(state.lastPeriodDate).getTime()) 
    ? state.lastPeriodDate 
    : null;
  
  // ✅ FIX: Validation length plus stricte (permettre 0 comme valeur valide)
  const validLength = (typeof state.length === 'number' && state.length >= CYCLE_DEFAULTS.MIN_LENGTH && state.length <= CYCLE_DEFAULTS.MAX_LENGTH)
    ? state.length 
    : CYCLE_DEFAULTS.LENGTH;
    

    
  const validPeriodDuration = state.periodDuration && state.periodDuration >= CYCLE_DEFAULTS.MIN_PERIOD_DURATION && state.periodDuration <= CYCLE_DEFAULTS.MAX_PERIOD_DURATION
    ? state.periodDuration 
    : CYCLE_DEFAULTS.PERIOD_DURATION;
  
  return {
    lastPeriodDate: validLastPeriodDate,
    length: validLength,
    periodDuration: validPeriodDuration,
    isRegular: state.isRegular,
    trackingExperience: state.trackingExperience,
    observations: state.observations || [],
    detectedPatterns: state.detectedPatterns,
    // Méthodes calculées avec données validées
    currentPhase: getCurrentPhase(validLastPeriodDate, validLength, validPeriodDuration),
    currentDay: getCurrentCycleDay(validLastPeriodDate, validLength),
    phaseInfo: getCurrentPhaseInfo(validLastPeriodDate, validLength, validPeriodDuration),
    nextPeriodDate: getNextPeriodDate(validLastPeriodDate, validLength),
    daysUntilNextPeriod: getDaysUntilNextPeriod(validLastPeriodDate, validLength),
    hasData: !!(validLastPeriodDate && validLength),
    hasObservations: state.observations && state.observations.length > 0
  };
};

export const getCurrentPhaseFromStore = () => {
  const state = useCycleStore.getState();
  const validLastPeriodDate = state.lastPeriodDate && !isNaN(new Date(state.lastPeriodDate).getTime()) 
    ? state.lastPeriodDate 
    : null;
  const validLength = (typeof state.length === 'number' && state.length >= CYCLE_DEFAULTS.MIN_LENGTH && state.length <= CYCLE_DEFAULTS.MAX_LENGTH)
    ? state.length 
    : CYCLE_DEFAULTS.LENGTH;
  const validPeriodDuration = (typeof state.periodDuration === 'number' && state.periodDuration >= CYCLE_DEFAULTS.MIN_PERIOD_DURATION && state.periodDuration <= CYCLE_DEFAULTS.MAX_PERIOD_DURATION)
    ? state.periodDuration 
    : CYCLE_DEFAULTS.PERIOD_DURATION;
  return getCurrentPhase(validLastPeriodDate, validLength, validPeriodDuration);
};

export const getCurrentDayFromStore = () => {
  const state = useCycleStore.getState();
  const validLastPeriodDate = state.lastPeriodDate && !isNaN(new Date(state.lastPeriodDate).getTime()) 
    ? state.lastPeriodDate 
    : null;
  const validLength = (typeof state.length === 'number' && state.length >= CYCLE_DEFAULTS.MIN_LENGTH && state.length <= CYCLE_DEFAULTS.MAX_LENGTH)
    ? state.length 
    : CYCLE_DEFAULTS.LENGTH;
  return getCurrentCycleDay(validLastPeriodDate, validLength);
};

// ═══════════════════════════════════════════════════════
// 🔄 HELPERS ADAPTATIFS (NOUVEAUX)
// ═══════════════════════════════════════════════════════


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