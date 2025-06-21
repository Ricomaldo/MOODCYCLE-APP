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
  const { cycle, updateCycle } = useUserStore();

  // ═══════════════════════════════════════════════════════
  // 🧮 CALCULS MEMOIZÉS
  // ═══════════════════════════════════════════════════════
  
  const currentPhase = useMemo(() => 
    getCurrentPhase(cycle.lastPeriodDate, cycle.length, cycle.periodDuration),
    [cycle.lastPeriodDate, cycle.length, cycle.periodDuration]
  );

  const currentDay = useMemo(() =>
    getCurrentCycleDay(cycle.lastPeriodDate, cycle.length),
    [cycle.lastPeriodDate, cycle.length]
  );

  const phaseInfo = useMemo(() =>
    getCurrentPhaseInfo(cycle.lastPeriodDate, cycle.length, cycle.periodDuration),
    [cycle.lastPeriodDate, cycle.length, cycle.periodDuration]
  );

  const daysSinceLastPeriod = useMemo(() =>
    getDaysSinceLastPeriod(cycle.lastPeriodDate),
    [cycle.lastPeriodDate]
  );

  const nextPeriodDate = useMemo(() =>
    getNextPeriodDate(cycle.lastPeriodDate, cycle.length),
    [cycle.lastPeriodDate, cycle.length]
  );

  const daysUntilNextPeriod = useMemo(() =>
    getDaysUntilNextPeriod(cycle.lastPeriodDate, cycle.length),
    [cycle.lastPeriodDate, cycle.length]
  );

  const validation = useMemo(() =>
    validateCycleData(cycle),
    [cycle]
  );

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
      menstrual: [1, cycle.periodDuration],
      follicular: [cycle.periodDuration + 1, Math.floor(cycle.length * 0.4)],
      ovulatory: [Math.floor(cycle.length * 0.4) + 1, Math.floor(cycle.length * 0.6)],
      luteal: [Math.floor(cycle.length * 0.6) + 1, cycle.length]
    };

    const [start, end] = phaseRanges[currentPhase] || [1, 1];
    const progress = Math.min(100, ((currentDay - start) / (end - start)) * 100);
    
    return Math.max(0, progress);
  };

  const hasMinimumData = () => {
    return !!(cycle.lastPeriodDate && cycle.length);
  };

  // ═══════════════════════════════════════════════════════
  // 📊 RETOUR API
  // ═══════════════════════════════════════════════════════

  return {
    // Données brutes
    cycle,
    
    // Calculs principaux
    currentPhase,
    currentDay,
    phaseInfo,
    daysSinceLastPeriod,
    
    // Prédictions
    nextPeriodDate,
    daysUntilNextPeriod,
    
    // Métadonnées
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
    isLate: daysUntilNextPeriod !== null && daysUntilNextPeriod < 0,
  };
};

/**
 * Hook léger pour phase actuelle uniquement
 */
export const useCurrentPhase = () => {
  const { cycle } = useUserStore();
  
  return useMemo(() => 
    getCurrentPhase(cycle.lastPeriodDate, cycle.length, cycle.periodDuration),
    [cycle.lastPeriodDate, cycle.length, cycle.periodDuration]
  );
};

/**
 * Hook pour infos phase enrichies
 */
export const usePhaseInfo = () => {
  const { cycle } = useUserStore();
  
  return useMemo(() =>
    getCurrentPhaseInfo(cycle.lastPeriodDate, cycle.length, cycle.periodDuration),
    [cycle.lastPeriodDate, cycle.length, cycle.periodDuration]
  );
};