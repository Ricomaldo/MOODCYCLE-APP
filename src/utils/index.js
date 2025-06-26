//
// ─────────────────────────────────────────────────────────
// 📄 File: src/utils/index.js
// 🧩 Type: Utils Index - POINT D'ENTRÉE CENTRALISÉ
// 📚 Description: Export centralisé de toutes les utilities
// 🎯 Objectif: Simplifier les imports dans l'application
// 🕒 Version: 1.0 - 2025-06-26 - CRÉATION
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════════
// 🌙 FORMATAGE GÉNÉRAL
// ═══════════════════════════════════════════════════════════
export {
  formatUserProfile,
  formatPreferences,
  formatPersonaName,
  getPhaseSymbol,
  getPhaseIconData,
  formatPhaseInfo,
  getAllPhaseIcons,
  getPhaseMetadata
} from './formatters';

// ═══════════════════════════════════════════════════════════
// 📊 FORMATAGE TRACKING SPÉCIALISÉ
// ═══════════════════════════════════════════════════════════
export {
  formatTrackingModalStyle,
  formatTrackingEmotional,
  formatTrackingCompact,
  extractEnergyValue,
  getEnergyTrendIcon,
  getMoodColor,
  formatTrendSummary
} from './trackingFormatters';

// ═══════════════════════════════════════════════════════════
// 🧮 CALCULS & DATES
// ═══════════════════════════════════════════════════════════
export {
  getCurrentPhase,
  calculatePhaseDay,
  calculateCycleProgress,
  getPhaseLength,
  getPhaseName,
  isValidCycleDate,
  calculateNextPeriod,
  calculateFertileWindow
} from './cycleCalculations';

export {
  formatDate,
  formatTime,
  formatDuration,
  getRelativeTime,
  isToday,
  isSameDay,
  addDays,
  subtractDays,
  getDaysDifference
} from './dateUtils'; 