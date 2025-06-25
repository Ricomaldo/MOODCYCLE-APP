//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useCycle.js
// 🧩 Type: Cycle Hook
// 📚 Description: API React optimisée pour données cycle
// 🕒 Version: 1.0 - 2025-06-21
// 🧭 Used in: components cycle, chat, insights
// ─────────────────────────────────────────────────────────
//

import { useMemo } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { CYCLE_DEFAULTS } from '../config/cycleConstants';
import {
  getCurrentPhase,
  getCurrentCycleDay,
  getCurrentPhaseInfo,
  getDaysSinceLastPeriod,
  getNextPeriodDate,
  getDaysUntilNextPeriod,
  validateCycleData,
  PHASE_METADATA
} from '../utils/cycleCalculations';

/**
 * Hook principal pour gestion cycle menstruel
 */
export const useCycle = () => {
  const userStoreData = useUserStore();
  
  // ✅ PROTECTION TOTALE : Si le store n'est pas encore hydraté, retourner des valeurs par défaut
  if (!userStoreData || typeof userStoreData.updateCycle !== 'function') {
    const defaultCycle = {
      lastPeriodDate: null,
      length: CYCLE_DEFAULTS.LENGTH,
      periodDuration: CYCLE_DEFAULTS.PERIOD_DURATION,
      isRegular: null,
      trackingExperience: null
    };
    
    return {
      // État du cycle
      cycle: defaultCycle,
      currentPhase: 'menstrual',
      currentDay: 1,
      phaseInfo: PHASE_METADATA.menstrual,
      daysSinceLastPeriod: 0,
      nextPeriodDate: null,
      daysUntilNextPeriod: 28,
      phaseMetadata: PHASE_METADATA,
      validation: { isValid: false, errors: ['Store non initialisé'] },

      // Actions (no-op pendant l'hydratation)
      updateCycle: () => {},
      startNewPeriod: () => {},
      updateCycleLength: () => {},
      updatePeriodDuration: () => {},
      setCycleRegularity: () => {},
      setTrackingExperience: () => {},

      // Helpers
      isInPhase: () => false,
      getPhaseProgress: () => 0,
      hasMinimumData: () => false,

      // États dérivés
      isValid: false,
      hasData: false,
      isLate: false
    };
  }

  const { cycle, updateCycle } = userStoreData;

  // ✅ CORRECTION : Protection renforcée contre cycle undefined pendant l'hydratation
  const safeCycle = useMemo(() => {
    // Si cycle est undefined (pendant l'hydratation), utiliser les valeurs par défaut
    if (!cycle) {
      return {
        lastPeriodDate: null,
        length: CYCLE_DEFAULTS.LENGTH,
        periodDuration: CYCLE_DEFAULTS.PERIOD_DURATION,
        isRegular: null,
        trackingExperience: null
      };
    }
    
    // Si cycle existe mais certaines propriétés sont undefined, les remplacer par les valeurs par défaut
    return {
      lastPeriodDate: cycle.lastPeriodDate || null,
      length: cycle.length || CYCLE_DEFAULTS.LENGTH,
      periodDuration: cycle.periodDuration || CYCLE_DEFAULTS.PERIOD_DURATION,
      isRegular: cycle.isRegular || null,
      trackingExperience: cycle.trackingExperience || null
    };
  }, [cycle]);

  // ═══════════════════════════════════════════════════════
  // 🧮 CALCULS MEMOIZÉS
  // ═══════════════════════════════════════════════════════
  
  const currentPhase = useMemo(() => {
    return getCurrentPhase(safeCycle.lastPeriodDate, safeCycle.length, safeCycle.periodDuration);
  }, [safeCycle.lastPeriodDate, safeCycle.length, safeCycle.periodDuration]);

  const currentDay = useMemo(() => {
    return getCurrentCycleDay(safeCycle.lastPeriodDate, safeCycle.length);
  }, [safeCycle.lastPeriodDate, safeCycle.length]);

  const phaseInfo = useMemo(() => {
    return getCurrentPhaseInfo(safeCycle.lastPeriodDate, safeCycle.length, safeCycle.periodDuration);
  }, [safeCycle.lastPeriodDate, safeCycle.length, safeCycle.periodDuration]);

  const daysSinceLastPeriod = useMemo(() => {
    return getDaysSinceLastPeriod(safeCycle.lastPeriodDate);
  }, [safeCycle.lastPeriodDate]);

  const nextPeriodDate = useMemo(() => {
    return getNextPeriodDate(safeCycle.lastPeriodDate, safeCycle.length);
  }, [safeCycle.lastPeriodDate, safeCycle.length]);

  const daysUntilNextPeriod = useMemo(() => {
    return getDaysUntilNextPeriod(safeCycle.lastPeriodDate, safeCycle.length);
  }, [safeCycle.lastPeriodDate, safeCycle.length]);

  const validation = useMemo(() => {
    return validateCycleData(safeCycle);
  }, [safeCycle]);

  // ═══════════════════════════════════════════════════════
  // 🎯 ACTIONS
  // ═══════════════════════════════════════════════════════

  const startNewPeriod = (date = new Date()) => {
    updateCycle({
      lastPeriodDate: date.toISOString()
    });
  };

  const updateCycleLength = (length) => {
    updateCycle({ length: Math.max(CYCLE_DEFAULTS.MIN_LENGTH, Math.min(CYCLE_DEFAULTS.MAX_LENGTH, length)) });
  };

  const updatePeriodDuration = (duration) => {
    updateCycle({ periodDuration: Math.max(CYCLE_DEFAULTS.MIN_PERIOD_DURATION, Math.min(CYCLE_DEFAULTS.MAX_PERIOD_DURATION, duration)) });
  };

  const setCycleRegularity = (isRegular) => {
    updateCycle({ isRegular });
  };

  const setTrackingExperience = (experience) => {
    updateCycle({ trackingExperience: experience });
  };

  // ═══════════════════════════════════════════════════════
  // 🔍 HELPERS
  // ═══════════════════════════════════════════════════════

  const isInPhase = (targetPhase) => currentPhase === targetPhase;

  const getPhaseProgress = () => {
    const phaseRanges = {
      menstrual: [1, safeCycle.periodDuration],
      follicular: [safeCycle.periodDuration + 1, Math.floor(safeCycle.length * 0.4)],
      ovulatory: [Math.floor(safeCycle.length * 0.4) + 1, Math.floor(safeCycle.length * 0.6)],
      luteal: [Math.floor(safeCycle.length * 0.6) + 1, safeCycle.length]
    };

    const [start, end] = phaseRanges[currentPhase] || [1, 1];
    const progress = Math.min(100, ((currentDay - start) / (end - start)) * 100);
    return Math.max(0, progress);
  };

  const hasMinimumData = () => {
    return !!(safeCycle.lastPeriodDate && safeCycle.length);
  };

  // ═══════════════════════════════════════════════════════
  // 🎯 RETOUR
  // ═══════════════════════════════════════════════════════

  const returnObject = {
    // État du cycle
    cycle: safeCycle,
    currentPhase,
    currentDay,
    phaseInfo,
    daysSinceLastPeriod,
    nextPeriodDate,
    daysUntilNextPeriod,
    phaseMetadata: PHASE_METADATA,
    validation,

    // Actions
    updateCycle,
    startNewPeriod,
    updateCycleLength,
    updatePeriodDuration,
    setCycleRegularity,
    setTrackingExperience,

    // Helpers
    isInPhase,
    getPhaseProgress,
    hasMinimumData,

    // États dérivés
    isValid: validation.isValid,
    hasData: hasMinimumData(),
    isLate: daysUntilNextPeriod < 0
  };

  return returnObject;
};

// ═══════════════════════════════════════════════════════
// 🔗 HOOKS DÉRIVÉS (optionnels, pour rétrocompatibilité)
// ═══════════════════════════════════════════════════════

/**
 * Hook simplifié pour récupérer juste la phase actuelle
 */
export const useCurrentPhase = () => {
  const { currentPhase } = useCycle();
  return currentPhase;
};

/**
 * Hook simplifié pour récupérer les infos de phase
 */
export const usePhaseInfo = () => {
  const { phaseInfo } = useCycle();
  return phaseInfo;
};