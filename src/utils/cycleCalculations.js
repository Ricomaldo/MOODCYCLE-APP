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
// 🔄 CYCLE OBSERVATION MODES
// ═══════════════════════════════════════════════════════

export const CYCLE_MODES = {
  PREDICTIVE: 'predictive',  // Mode actuel (calculs uniquement)
  HYBRID: 'hybrid',         // Observation + prédictif
  OBSERVATION: 'observation' // Patterns utilisatrice pure
};

export const getCycleMode = (userIntelligence, engagementLevel) => {
  // Fallback défaut = mode actuel pour backward compatibility
  if (!userIntelligence || !engagementLevel) {
    return CYCLE_MODES.PREDICTIVE;
  }

  const { observationPatterns, learning } = userIntelligence;
  const confidence = learning?.confidence || 0;
  const hasObservations = observationPatterns?.lastObservations?.length > 0;
  const observationConsistency = observationPatterns?.consistency || 0;

  // Mode forcé par utilisatrice
  if (observationPatterns?.preferredMode) {
    return observationPatterns.preferredMode;
  }

  // Logique auto-switching selon maturité
  switch (engagementLevel) {
    case 'autonomous':
      // Autonome + observations consistantes = observation pure
      if (hasObservations && observationConsistency > 0.7) {
        return CYCLE_MODES.OBSERVATION;
      }
      // Sinon hybrid pour transition douce
      return CYCLE_MODES.HYBRID;
      
    case 'learning':
      // Learning + confiance moyenne = hybrid
      if (confidence > 40 && hasObservations) {
        return CYCLE_MODES.HYBRID;
      }
      // Sinon prédictif avec invitations observer
      return CYCLE_MODES.PREDICTIVE;
      
    case 'discovery':
    default:
      // Débutantes = prédictif (mode actuel)
      return CYCLE_MODES.PREDICTIVE;
  }
};

export const getCurrentPhaseAdaptive = (
  lastPeriodDate, 
  cycleLength = CYCLE_DEFAULTS.LENGTH, 
  periodDuration = CYCLE_DEFAULTS.PERIOD_DURATION,
  options = {}
) => {
  const { mode = 'auto', userIntelligence, engagementLevel } = options;
  
  // Déterminer mode si auto
  const effectiveMode = mode === 'auto' 
    ? getCycleMode(userIntelligence, engagementLevel)
    : mode;

  // Mode PREDICTIVE = comportement actuel exact
  if (effectiveMode === CYCLE_MODES.PREDICTIVE) {
    return getCurrentPhase(lastPeriodDate, cycleLength, periodDuration);
  }

  // Mode HYBRID = observation avec fallback prédictif
  if (effectiveMode === CYCLE_MODES.HYBRID) {
    const observedPhase = getObservedPhase(userIntelligence);
    if (observedPhase && observedPhase.confidence > 0.5) {
      return observedPhase.phase;
    }
    // Fallback sur calculs
    return getCurrentPhase(lastPeriodDate, cycleLength, periodDuration);
  }

  // Mode OBSERVATION = patterns utilisatrice uniquement
  if (effectiveMode === CYCLE_MODES.OBSERVATION) {
    const observedPhase = getObservedPhase(userIntelligence);
    if (observedPhase) {
      return observedPhase.phase;
    }
    // Fallback sécurité si aucune observation
    console.error('Mode observation sans données, fallback predictive');
    return getCurrentPhase(lastPeriodDate, cycleLength, periodDuration);
  }

  // Défaut = comportement actuel
  return getCurrentPhase(lastPeriodDate, cycleLength, periodDuration);
};

const getObservedPhase = (userIntelligence) => {
  // GARDE NULL SAFETY
  if (!userIntelligence?.observationPatterns?.lastObservations) {
    return null;
  }
  
  if (!userIntelligence.observationPatterns.lastObservations.length) {
    return null;
  }

  const recent = userIntelligence.observationPatterns.lastObservations[0];
  
  // Analyse patterns pour déterminer phase
  const patterns = analyzeObservationPatterns(
    userIntelligence.observationPatterns.lastObservations
  );
  
  return {
    phase: patterns.mostLikelyPhase || 'menstrual',
    confidence: patterns.confidence || 0,
    basedOn: patterns.signals || []
  };
};

const analyzeObservationPatterns = (observations) => {
  if (!observations || observations.length === 0) {
    return { mostLikelyPhase: null, confidence: 0 };
  }

  // Analyse simple basée sur les patterns récents
  const recentObs = observations.slice(0, 5);
  const phaseScores = {
    menstrual: 0,
    follicular: 0,
    ovulatory: 0,
    luteal: 0
  };

  recentObs.forEach(obs => {
    // Scoring basé sur symptômes/ressentis
    if (obs.symptoms?.includes('cramps') || obs.mood === 'low_energy') {
      phaseScores.menstrual += 1;
    }
    if (obs.energy === 'rising' || obs.mood === 'optimistic') {
      phaseScores.follicular += 1;
    }
    if (obs.energy === 'peak' || obs.mood === 'confident') {
      phaseScores.ovulatory += 1;
    }
    if (obs.mood === 'sensitive' || obs.symptoms?.includes('pms')) {
      phaseScores.luteal += 1;
    }
  });

  // Déterminer phase la plus probable
  const maxScore = Math.max(...Object.values(phaseScores));
  const mostLikelyPhase = Object.keys(phaseScores).find(
    phase => phaseScores[phase] === maxScore
  );

  return {
    mostLikelyPhase,
    confidence: maxScore / recentObs.length,
    signals: Object.entries(phaseScores)
      .filter(([_, score]) => score > 0)
      .map(([phase, score]) => ({ phase, score }))
  };
};

// ═══════════════════════════════════════════════════════
// 🔧 HELPERS OBSERVATION
// ═══════════════════════════════════════════════════════

export const isReadyForObservationMode = (userIntelligence, engagementMetrics) => {
  const hasEnoughData = userIntelligence?.observationPatterns?.lastObservations?.length >= 10;
  const hasGoodConsistency = userIntelligence?.observationPatterns?.consistency > 0.6;
  const isEngaged = engagementMetrics?.daysUsed >= 14;
  
  return hasEnoughData && hasGoodConsistency && isEngaged;
};

export const getCycleModeGuidance = (currentMode, phase) => {
  const guidance = {
    [CYCLE_MODES.PREDICTIVE]: {
      message: "Je calcule ta phase selon tes dernières règles",
      action: "Note tes ressentis pour personnaliser",
      icon: "📊"
    },
    [CYCLE_MODES.HYBRID]: {
      message: "J'apprends de tes observations pour affiner",
      action: "Continue à observer tes patterns",
      icon: "🔄"
    },
    [CYCLE_MODES.OBSERVATION]: {
      message: "Je me base sur tes ressentis uniques",
      action: "Tu connais ton corps mieux que quiconque",
      icon: "🌟"
    }
  };

  return guidance[currentMode] || guidance[CYCLE_MODES.PREDICTIVE];
};

// ═══════════════════════════════════════════════════════
// 🧮 CALCULS DE BASE
// ═══════════════════════════════════════════════════════

export const getDaysSinceLastPeriod = (lastPeriodDate) => {
  if (!lastPeriodDate) {
    return 0;
  }
  
  try {
    const lastDate = new Date(lastPeriodDate);
    
    if (isNaN(lastDate.getTime())) {
      console.warn('Date invalide dans getDaysSinceLastPeriod:', lastPeriodDate);
      return 0;
    }
    
    // Normaliser les dates à minuit UTC pour éviter les problèmes de timezone
    const today = new Date(Date.now()); // ✅ FIX: Utiliser Date.now() pour respecter les mocks
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const lastDateUTC = Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    
    const result = Math.floor((todayUTC - lastDateUTC) / (1000 * 60 * 60 * 24));
    
    return result;
  } catch (error) {
    console.error('Erreur dans getDaysSinceLastPeriod:', error);
    return 0;
  }
};

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

export const getCurrentPhase = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH, periodDuration = CYCLE_DEFAULTS.PERIOD_DURATION) => {
  try {
    if (!lastPeriodDate) {
      return 'menstrual';
    }
    
    // Vérifier si la date est valide
    const lastDate = new Date(lastPeriodDate);
    if (isNaN(lastDate.getTime())) {
      console.warn('Date invalide dans getCurrentPhase:', lastPeriodDate);
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
    
    // ✅ FIX: Logique phases originale qui fonctionnait
    if (currentDay <= sanitizedPeriodDuration) {
      return 'menstrual';
    }
    
    // Folliculaire: après règles jusqu'à jour 13 (ou proportionnel pour cycles variables)
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
  } catch (error) {
    console.error('Erreur dans getCurrentPhase:', error);
    return 'menstrual'; // Valeur par défaut en cas d'erreur
  }
};

// ═══════════════════════════════════════════════════════
// 📊 INFOS ENRICHIES
// ═══════════════════════════════════════════════════════

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

export const getDaysUntilNextPeriod = (lastPeriodDate, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
  const nextPeriodDate = getNextPeriodDate(lastPeriodDate, cycleLength);
  if (!nextPeriodDate) return null;
  
  const nextDate = new Date(nextPeriodDate);
  // ✅ FIX: Utiliser Date.now() pour respecter les mocks dans les tests
  const today = new Date(Date.now());
  
  return Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// ═══════════════════════════════════════════════════════
// ✅ VALIDATION
// ═══════════════════════════════════════════════════════

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

export const createMockCycleData = (daysAgo = 0, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
  const lastPeriodDate = new Date(Date.now()); // Utilise Date.now() pour respecter les mocks
  lastPeriodDate.setDate(lastPeriodDate.getDate() - daysAgo);
  
  return {
    lastPeriodDate: lastPeriodDate.toISOString(),
    length: cycleLength,
    periodDuration: CYCLE_DEFAULTS.PERIOD_DURATION,
    isRegular: true,
    trackingExperience: 'intermediate'
  };
};

export const createCycleAtPhase = (targetPhase, cycleLength = CYCLE_DEFAULTS.LENGTH) => {
  // Calcule les jours de début de chaque phase selon la logique originale de getCurrentPhase
  const follicularEnd = Math.max(13, Math.floor(cycleLength * 0.4));
  const ovulatoryStart = follicularEnd + 1;
  const ovulatoryEnd = Math.min(ovulatoryStart + 2, Math.floor(cycleLength * 0.6));
  
  const phaseStartDays = {
    'menstrual': 0,
    'follicular': CYCLE_DEFAULTS.PERIOD_DURATION + 1, // Jour après la fin des règles
    'ovulatory': ovulatoryStart - 1, // Premier jour de la phase ovulatoire
    'luteal': ovulatoryEnd // Premier jour de la phase lutéale
  };
  
  const daysAgo = phaseStartDays[targetPhase] || 0;
  return createMockCycleData(daysAgo, cycleLength);
};