//
// ─────────────────────────────────────────────────────────
// 📄 File: src/utils/cycleCalculations.js
// 🧩 Type: Cycle Utilities
// 📚 Description: Fonctions pures calculs cycle menstruel
// 🕒 Version: 1.0 - 2025-06-21
// 🧭 Used in: useCycle hook, components
// ─────────────────────────────────────────────────────────
//

import { CYCLE_DEFAULTS } from '../config/cycleConstants';

// ═══════════════════════════════════════════════════════
// 🧮 CALCULS DE BASE
// ═══════════════════════════════════════════════════════

/**
 * Calcule les jours écoulés depuis la dernière période
 */
export const getDaysSinceLastPeriod = (lastPeriodDate) => {
    if (!lastPeriodDate) return 0;
    
    return Math.floor(
      (Date.now() - new Date(lastPeriodDate).getTime()) / (1000 * 60 * 60 * 24)
    );
  };
  
  /**
   * Calcule le jour actuel dans le cycle (1-28+)
   */
  export const getCurrentCycleDay = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
    if (!lastPeriodDate) return 1;
    
    const daysSince = getDaysSinceLastPeriod(lastPeriodDate);
    return (daysSince % cycleLength) + 1;
  };
  
  /**
   * Détermine la phase actuelle du cycle
   */
  export const getCurrentPhase = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH, periodDuration = CYCLE_DEFAULTS.PERIOD_DURATION) => {
    if (!lastPeriodDate) return 'menstrual';
    
    const daysSince = getDaysSinceLastPeriod(lastPeriodDate);
    const currentDay = (daysSince % cycleLength) + 1;
    
    // Logique phases
    if (currentDay <= periodDuration) return 'menstrual';
    if (currentDay <= cycleLength * 0.4) return 'follicular';
    if (currentDay <= cycleLength * 0.6) return 'ovulatory';
    return 'luteal';
  };
  
  // ═══════════════════════════════════════════════════════
  // 📊 INFOS ENRICHIES
  // ═══════════════════════════════════════════════════════
  
  /**
   * Métadonnées des phases - COULEURS SYNCHRONISÉES AVEC THEME.JS
   */
  export const PHASE_METADATA = {
    menstrual: {
      name: 'Menstruelle',
      emoji: '🌙',
      color: '#F44336', // Grenat Doux - sync avec theme.js
      energy: 'repos',
      description: 'Phase de régénération et introspection'
    },
    follicular: {
      name: 'Folliculaire', 
      emoji: '🌱',
      color: '#FFC107', // Miel Doré - sync avec theme.js
      energy: 'croissance',
      description: 'Nouvelle énergie et créativité'
    },
    ovulatory: {
      name: 'Ovulatoire',
      emoji: '☀️', 
      color: '#00BCD4', // Lagune Calme - sync avec theme.js
      energy: 'pic',
      description: 'Énergie et confiance maximales'
    },
    luteal: {
      name: 'Lutéale',
      emoji: '🍂',
      color: '#673AB7', // Lavande Mystique - sync avec theme.js
      energy: 'déclin',
      description: 'Préparation et ralentissement'
    }
  };
  
  /**
   * Retourne les infos complètes de la phase actuelle
   */
  export const getCurrentPhaseInfo = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH, periodDuration = CYCLE_DEFAULTS.PERIOD_DURATION) => {
    const phase = getCurrentPhase(lastPeriodDate, cycleLength, periodDuration);
    const day = getCurrentCycleDay(lastPeriodDate, cycleLength);
    
    return {
      phase,
      day,
      ...PHASE_METADATA[phase]
    };
  };
  
  // ═══════════════════════════════════════════════════════
  // 🔮 PRÉDICTIONS
  // ═══════════════════════════════════════════════════════
  
  /**
   * Calcule la date prévue des prochaines règles
   */
  export const getNextPeriodDate = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
    if (!lastPeriodDate) return null;
    
    const lastDate = new Date(lastPeriodDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + cycleLength);
    
    return nextDate;
  };
  
  /**
   * Jours restants jusqu'aux prochaines règles
   */
  export const getDaysUntilNextPeriod = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
    const nextDate = getNextPeriodDate(lastPeriodDate, cycleLength);
    if (!nextDate) return null;
    
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };
  
  // ═══════════════════════════════════════════════════════
  // 🎯 VALIDATION
  // ═══════════════════════════════════════════════════════
  
  /**
   * Valide si les données cycle sont cohérentes
   */
  export const validateCycleData = (cycleData) => {
    const { lastPeriodDate, length, periodDuration } = cycleData;
    
    const errors = [];
    
    if (!lastPeriodDate) {
      errors.push('Date dernières règles manquante');
    }
    
    if (length < CYCLE_DEFAULTS.MIN_LENGTH || length > CYCLE_DEFAULTS.MAX_LENGTH) {
      errors.push(`Durée cycle invalide (${CYCLE_DEFAULTS.MIN_LENGTH}-${CYCLE_DEFAULTS.MAX_LENGTH} jours)`);
    }
    
    if (periodDuration < CYCLE_DEFAULTS.MIN_PERIOD_DURATION || periodDuration > CYCLE_DEFAULTS.MAX_PERIOD_DURATION) {
      errors.push(`Durée règles invalide (${CYCLE_DEFAULTS.MIN_PERIOD_DURATION}-${CYCLE_DEFAULTS.MAX_PERIOD_DURATION} jours)`);
    }
    
    if (periodDuration >= length) {
      errors.push('Durée règles supérieure au cycle');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // ═══════════════════════════════════════════════════════
  // 🧪 HELPERS DE TEST
  // ═══════════════════════════════════════════════════════
  
  /**
   * Crée des données cycle pour tests
   */
  export const createMockCycleData = (daysAgo = 0, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
    const mockDate = new Date();
    mockDate.setDate(mockDate.getDate() - daysAgo);
    
    return {
      lastPeriodDate: mockDate.toISOString(),
      length: cycleLength,
      periodDuration: CYCLE_DEFAULTS.PERIOD_DURATION,
      isRegular: true
    };
  };
  
  /**
   * Simule un cycle à une phase donnée
   */
  export const createCycleAtPhase = (targetPhase, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
    const phaseDays = {
      menstrual: 2,
      follicular: 10, 
      ovulatory: 15,
      luteal: 22
    };
    
    const daysAgo = phaseDays[targetPhase] || 0;
    return createMockCycleData(daysAgo, cycleLength);
  };