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

const normalizeToMidnight = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};


export const getDaysDifference = (date1, date2 = new Date()) => {
  if (!date1 || isNaN(new Date(date1).getTime())) {
    return 0;
  }
  if (!date2 || isNaN(new Date(date2).getTime())) {
    return 0;
  }
  
  const d1 = normalizeToMidnight(date1);
  const d2 = normalizeToMidnight(date2);
  
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

export const formatDateFrench = (date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long", 
    year: "numeric",
  });
};

export const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString("fr-FR");
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getDateDaysAgo = (daysAgo) => {
  if (typeof daysAgo !== 'number' || isNaN(daysAgo)) {
    return new Date().toISOString();
  }
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const getDateDaysFromNow = (days) => {
  if (typeof days !== 'number' || isNaN(days)) {
    return new Date().toISOString();
  }
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    today.getDate() === checkDate.getDate() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getFullYear() === checkDate.getFullYear()
  );
};

export const isThisWeek = (date) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const checkDate = new Date(date);
  return checkDate >= weekAgo && checkDate <= now;
};

export const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
  return new Date(d.setDate(diff));
};

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