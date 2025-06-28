//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/cycleConstants.js
// 🧩 Type: Configuration
// 📚 Description: Constantes centralisées pour le cycle menstruel
// 🕒 Version: 1.0 - 2025-06-21
// 🧭 Used in: utils, hooks, components
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════
// 📊 CONSTANTES CYCLE
// ═══════════════════════════════════════════════════════

export const CYCLE_DEFAULTS = {
  LENGTH: 28,
  PERIOD_DURATION: 5,
  MIN_LENGTH: 21,
  MAX_LENGTH: 45,
  MIN_PERIOD_DURATION: 2,
  MAX_PERIOD_DURATION: 10,
};

// ═══════════════════════════════════════════════════════
// 🎯 PHASES DU CYCLE
// ═══════════════════════════════════════════════════════

export const PHASE_NAMES = {
  MENSTRUAL: 'menstrual',
  FOLLICULAR: 'follicular',
  OVULATORY: 'ovulatory',
  LUTEAL: 'luteal',
};

export const PHASE_RANGES = {
  [PHASE_NAMES.MENSTRUAL]: { start: 1, end: 5, peak: 3 },
  [PHASE_NAMES.FOLLICULAR]: { start: 6, end: 13, peak: 10 },
  [PHASE_NAMES.OVULATORY]: { start: 14, end: 16, peak: 15 },
  [PHASE_NAMES.LUTEAL]: { start: 17, end: 28, peak: 22 },
};

// ═══════════════════════════════════════════════════════
// 📅 CALENDRIER
// ═══════════════════════════════════════════════════════

export const CALENDAR_CONSTANTS = {
  DAYS_OF_WEEK: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  MONTHS: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
};

// ═══════════════════════════════════════════════════════
// 🎨 STYLES CALENDRIER
// ═══════════════════════════════════════════════════════

export const CALENDAR_STYLES = {
  PHASE_OPACITY: {
    MIN: 0.15,
    MAX: 0.55,
    MULTIPLIER: 0.4,
  },
  ENTRY_INDICATORS: {
    MAX_VISIBLE: 3,
  },
};

// ═══════════════════════════════════════════════════════
// 🧮 HELPERS
// ═══════════════════════════════════════════════════════

/**
 * Obtient la phase à partir du jour de cycle
 */
export const getPhaseFromCycleDay = (cycleDay, periodDuration = CYCLE_DEFAULTS.PERIOD_DURATION) => {
  if (cycleDay <= periodDuration) return PHASE_NAMES.MENSTRUAL;
  if (cycleDay <= 13) return PHASE_NAMES.FOLLICULAR;
  if (cycleDay <= 16) return PHASE_NAMES.OVULATORY;
  return PHASE_NAMES.LUTEAL;
};

/**
 * Calcule la position dans la phase (0 = début, 1 = pic, 0 = fin)
 */
export const getPhasePosition = (cycleDay) => {
  const phaseRanges = Object.values(PHASE_RANGES);
  const currentPhase = phaseRanges.find((p) => cycleDay >= p.start && cycleDay <= p.end);
  
  if (!currentPhase) return 0;

  const distanceFromPeak = Math.abs(cycleDay - currentPhase.peak);
  const maxDistance = Math.max(
    currentPhase.peak - currentPhase.start,
    currentPhase.end - currentPhase.peak
  );

  return Math.max(0, 1 - distanceFromPeak / maxDistance);
};

// ═══════════════════════════════════════════════════════
// 🎡 CONSTANTES CYCLE WHEEL
// ═══════════════════════════════════════════════════════

export const WHEEL_CONSTANTS = {
  STROKE_WIDTH: 28,
  SEPARATOR_OPACITY: 0.6,
  EMOJI_SIZE: 12,
  SHOW_LEGEND: false,
  SHOW_EMOJIS: false,
  ARCS_PER_QUARTER: 7,
  SEPARATOR_EXTENSION: 6,
  MAX_NAME_LENGTH: 12,
  MARKER_RADIUS: 8,
  FONT_SIZE: {
    LARGE: 22,
    SMALL: 16,
  },
  SIZE_THRESHOLD: 200,
};

// ═══════════════════════════════════════════════════════
// 🔮 CONSTANTES ROUE THÉRAPEUTIQUE
// ═══════════════════════════════════════════════════════

export const THERAPEUTIC_WHEEL = {
  // Axes cardinaux comme dans la roue spirituelle
  CARDINAL_AXES: false,
  AXIS_STROKE_WIDTH: 4,
  AXIS_COLOR: '#333333',
  AXIS_OPACITY: 0.8,
  
  // Descriptions énergétiques des phases
  PHASE_DESCRIPTIONS: {
    menstrual: 'Sorcière',
    follicular: 'Jeune fille', 
    ovulatory: 'Mère',
    luteal: 'Enchanteresse',
  },
  
  // Configuration texte courbe
  CURVED_TEXT: {
    ENABLED: true,
    RADIUS_OFFSET: 8,
    FONT_SIZE: 10,
    LETTER_SPACING: 2,
  },
  
  // Style mandala
  MANDALA_STYLE: {
    SHOW_GEOMETRIC_PATTERNS: true,
    INNER_CIRCLE_DECORATION: true,
    INNER_CIRCLE_RADIUS: 12,
    SACRED_GEOMETRY: true,
  },
}; 