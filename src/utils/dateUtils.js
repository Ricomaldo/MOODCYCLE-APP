// filepath: src/utils/dateUtils.js
//
// ─────────────────────────────────────────────────────────
// 📄 File: src/utils/dateUtils.js  
// 🧩 Type: Utilities
// 📚 Description: Utilitaires dates génériques UNIQUEMENT
// 🕒 Version: 4.0 - 2025-06-21
// 🧭 Used in: formatage, différences, prédictions
// ─────────────────────────────────────────────────────────
//
// ⚠️  LOGIQUE CYCLE SUPPRIMÉE - Maintenant dans useUserStore
// ⚠️  Plus de calculateCurrentPhase, getCurrentCycleDay etc.

/**
 * 🗓️ UTILITAIRES DATES GÉNÉRIQUES SEULEMENT
 */

/**
 * Calcule la différence en jours entre deux dates
 */
export const getDaysDifference = (date1, date2 = new Date()) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

/**
 * Formate une date en français
 */
export const formatDateFrench = (date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long", 
    year: "numeric",
  });
};

/**
 * Formate une date courte (DD/MM/YYYY)
 */
export const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString("fr-FR");
};

/**
 * Formate heure (HH:MM)
 */
export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Crée une date relative (il y a X jours)
 */
export const getDateDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

/**
 * Crée une date future (dans X jours)
 */
export const getDateDaysFromNow = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

/**
 * Vérifie si une date est aujourd'hui
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    today.getDate() === checkDate.getDate() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getFullYear() === checkDate.getFullYear()
  );
};

/**
 * Vérifie si une date est cette semaine
 */
export const isThisWeek = (date) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const checkDate = new Date(date);
  return checkDate >= weekAgo && checkDate <= now;
};

/**
 * Obtient le début de la semaine (lundi)
 */
export const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
  return new Date(d.setDate(diff));
};

/**
 * Obtient la fin de la semaine (dimanche)
 */
export const getEndOfWeek = (date = new Date()) => {
  const startOfWeek = getStartOfWeek(date);
  return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
};

// ═══════════════════════════════════════════════════════════
// 🚫 SUPPRIMÉ - Maintenant dans useUserStore :
// ═══════════════════════════════════════════════════════════
// - calculateCurrentPhase()
// - getCurrentCycleDay() 
// - getDaysSinceLastPeriod()
// - calculateCyclePredictions()
// 
// ✅ Utiliser à la place :
// useUserStore.getState().getCurrentPhase()
// useUserStore.getState().getCurrentDay()
// useUserStore.getState().getDaysSinceLastPeriod()
// ═══════════════════════════════════════════════════════════