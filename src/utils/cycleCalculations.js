//
// ─────────────────────────────────────────────────────────
// 📄 File: src/utils/cycleCalculations.js
// 🧩 Type: Cycle Utilities
// 📚 Description: Fonctions pures calculs cycle menstruel
// 🕒 Version: 1.1 - 2025-06-21 - BUGS FIXES
// 🧭 Used in: useCycle hook, components
// ─────────────────────────────────────────────────────────
//

import { CYCLE_DEFAULTS } from '../config/cycleConstants';

// ═══════════════════════════════════════════════════════
// 🧮 CALCULS DE BASE
// ═══════════════════════════════════════════════════════

/**
 * Calcule les jours écoulés depuis la dernière période
 * ✅ FIX: Gestion dates invalides
 */
export const getDaysSinceLastPeriod = (lastPeriodDate) => {
  if (!lastPeriodDate) {
    return 0;
  }
  
  const lastDate = new Date(lastPeriodDate);
  
  if (isNaN(lastDate.getTime())) {
    return 0; // ✅ Date invalide
  }
  
  const result = Math.floor(
    (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return result;
};

/**
 * Calcule le jour actuel dans le cycle (1-28+)
 * ✅ FIX: Gestion dates futures + validation params
 */
export const getCurrentCycleDay = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
  if (!lastPeriodDate) return 1;
  
  // ✅ Sanitize cycleLength
  const sanitizedCycleLength = Math.max(CYCLE_DEFAULTS.MIN_LENGTH, 
    Math.min(CYCLE_DEFAULTS.MAX_LENGTH, cycleLength || CYCLE_DEFAULTS.LENGTH));
  
  const daysSince = getDaysSinceLastPeriod(lastPeriodDate);
  
  // ✅ FIX: Dates futures = jour 1
  if (daysSince < 0) return 1;
  
  return (daysSince % sanitizedCycleLength) + 1;
};

/**
 * Détermine la phase actuelle du cycle
 * ✅ FIX: Logique phases adaptée cycles longs + validation
 */
export const getCurrentPhase = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH, periodDuration = CYCLE_DEFAULTS.PERIOD_DURATION) => {
  if (!lastPeriodDate) {
    return 'menstrual';
  }
  
  // ✅ Sanitize params
  const sanitizedCycleLength = Math.max(CYCLE_DEFAULTS.MIN_LENGTH, 
    Math.min(CYCLE_DEFAULTS.MAX_LENGTH, cycleLength || CYCLE_DEFAULTS.LENGTH));
  const sanitizedPeriodDuration = Math.max(CYCLE_DEFAULTS.MIN_PERIOD_DURATION, 
    Math.min(CYCLE_DEFAULTS.MAX_PERIOD_DURATION, periodDuration || CYCLE_DEFAULTS.PERIOD_DURATION));
  
  const daysSince = getDaysSinceLastPeriod(lastPeriodDate);
  
  // ✅ FIX: Dates futures = menstrual
  if (daysSince < 0) {
    return 'menstrual';
  }
  
  const currentDay = (daysSince % sanitizedCycleLength) + 1;
  
  // ✅ FIX: Logique phases corrigée pour cycles variables
  if (currentDay <= sanitizedPeriodDuration) {
    return 'menstrual';
  }
  
  // Folliculaire: après règles jusqu'à jour 13 (ou 40% du cycle si court)
  const follicularEnd = Math.max(13, Math.floor(sanitizedCycleLength * 0.4));
  
  if (currentDay <= follicularEnd) {
    return 'follicular';
  }
  
  // Ovulatoire: ~3 jours autour de l'ovulation 
  const ovulatoryStart = follicularEnd + 1;
  const ovulatoryEnd = Math.min(ovulatoryStart + 2, Math.floor(sanitizedCycleLength * 0.6));
  
  if (currentDay <= ovulatoryEnd) {
    return 'ovulatory';
  }
  
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
    color: '#E53935', // Grenat Doux - sync avec theme.js - optimisé pour contraste
    energy: 'repos',
    description: 'Phase de régénération et introspection'
  },
  follicular: {
    name: 'Folliculaire', 
    emoji: '🌱',
    color: '#F57C00', // Miel Doré - sync avec theme.js - optimisé pour contraste
    energy: 'croissance',
    description: 'Nouvelle énergie et créativité'
  },
  ovulatory: {
    name: 'Ovulatoire',
    emoji: '☀️', 
    color: '#0097A7', // Lagune Calme - sync avec theme.js - optimisé pour contraste
    energy: 'pic',
    description: 'Énergie et confiance maximales'
  },
  luteal: {
    name: 'Lutéale',
    emoji: '🍂',
    color: '#673AB7', // Lavande Mystique - sync avec theme.js - parfait tel quel
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
 * ✅ FIX: Validation dates + params
 */
export const getNextPeriodDate = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
  if (!lastPeriodDate) return null;
  
  const lastDate = new Date(lastPeriodDate);
  if (isNaN(lastDate.getTime())) return null; // ✅ Date invalide
  
  // ✅ Sanitize cycleLength
  const sanitizedCycleLength = Math.max(CYCLE_DEFAULTS.MIN_LENGTH, 
    Math.min(CYCLE_DEFAULTS.MAX_LENGTH, cycleLength || CYCLE_DEFAULTS.LENGTH));
  
  const nextDate = new Date(lastDate);
  nextDate.setDate(lastDate.getDate() + sanitizedCycleLength);
  
  return nextDate.toISOString();
};

/**
 * Calcule les jours restants jusqu'aux prochaines règles
 * ✅ FIX: Gestion cycles dépassés + validation
 */
export const getDaysUntilNextPeriod = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
  const nextPeriodDate = getNextPeriodDate(lastPeriodDate, cycleLength);
  if (!nextPeriodDate) return null;
  
  const nextDate = new Date(nextPeriodDate);
  const today = new Date();
  
  return Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// ═══════════════════════════════════════════════════════
// ✅ VALIDATION
// ═══════════════════════════════════════════════════════

/**
 * Valide les données de cycle
 * ✅ FIX: Protection undefined + validation stricte
 */
export const validateCycleData = (cycleData) => {
  if (!cycleData) {
    return {
      isValid: false,
      errors: ['Données de cycle manquantes']
    };
  }

  const { lastPeriodDate, length, periodDuration } = cycleData;
  
  const errors = [];

  // Validation date
  if (!lastPeriodDate) {
    errors.push('Date de dernières règles requise');
  } else {
    const date = new Date(lastPeriodDate);
    if (isNaN(date.getTime())) {
      errors.push('Date de dernières règles invalide');
    } else if (date > new Date()) {
      errors.push('Date de dernières règles ne peut pas être dans le futur');
    }
  }

  // Validation longueur cycle
  if (!length) {
    errors.push('Longueur de cycle requise');
  } else if (length < CYCLE_DEFAULTS.MIN_LENGTH || length > CYCLE_DEFAULTS.MAX_LENGTH) {
    errors.push(`Longueur de cycle doit être entre ${CYCLE_DEFAULTS.MIN_LENGTH} et ${CYCLE_DEFAULTS.MAX_LENGTH} jours`);
  }

  // Validation durée règles
  if (!periodDuration) {
    errors.push('Durée des règles requise');
  } else if (periodDuration < CYCLE_DEFAULTS.MIN_PERIOD_DURATION || periodDuration > CYCLE_DEFAULTS.MAX_PERIOD_DURATION) {
    errors.push(`Durée des règles doit être entre ${CYCLE_DEFAULTS.MIN_PERIOD_DURATION} et ${CYCLE_DEFAULTS.MAX_PERIOD_DURATION} jours`);
  }

  // Validation cohérence
  if (length && periodDuration && periodDuration >= length) {
    errors.push('Durée des règles ne peut pas être supérieure ou égale à la longueur du cycle');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ═══════════════════════════════════════════════════════
// 🛠️ UTILITAIRES TESTING
// ═══════════════════════════════════════════════════════

/**
 * Crée des données de cycle factices pour testing
 * ✅ FIX: Params optionnels + dates cohérentes
 */
export const createMockCycleData = (daysAgo = 0, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
  const lastPeriodDate = new Date();
  lastPeriodDate.setDate(lastPeriodDate.getDate() - daysAgo);
  
  return {
    lastPeriodDate: lastPeriodDate.toISOString(),
    length: cycleLength,
    periodDuration: CYCLE_DEFAULTS.PERIOD_DURATION,
    isRegular: true,
    trackingExperience: 'intermediate'
  };
};

/**
 * Crée un cycle positionné sur une phase spécifique
 */
export const createCycleAtPhase = (targetPhase, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
  const phaseStartDays = {
    'menstrual': 0,
    'follicular': CYCLE_DEFAULTS.PERIOD_DURATION + 1,
    'ovulatory': Math.floor(cycleLength * 0.4),
    'luteal': Math.floor(cycleLength * 0.6)
  };
  
  const daysAgo = phaseStartDays[targetPhase] || 0;
  return createMockCycleData(daysAgo, cycleLength);
};