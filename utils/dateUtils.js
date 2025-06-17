/**
 * 🗓️ UTILITAIRES DE GESTION DES DATES - MOODCYCLE
 * Centralisation de toute la logique de calcul de dates/cycles
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
 * Calcule les jours écoulés depuis les dernières règles
 */
export const getDaysSinceLastPeriod = (lastPeriodDate) => {
  if (!lastPeriodDate) return null;
  return getDaysDifference(lastPeriodDate, new Date());
};

/**
 * Calcule la phase actuelle du cycle (VERSION UNIFIÉE)
 */
export const calculateCurrentPhase = (daysSinceLastPeriod, cycleLength = 28, periodLength = 5) => {
  if (daysSinceLastPeriod === null || daysSinceLastPeriod < 0) return 'menstrual';
  
  if (daysSinceLastPeriod <= periodLength) return 'menstrual';
  if (daysSinceLastPeriod <= Math.floor(cycleLength / 2) - 2) return 'follicular';
  if (daysSinceLastPeriod <= Math.floor(cycleLength / 2) + 2) return 'ovulatory';
  if (daysSinceLastPeriod < cycleLength) return 'luteal';
  
  return 'menstrual'; // Nouveau cycle commencé
};

/**
 * Calcule le jour actuel du cycle
 */
export const getCurrentCycleDay = (daysSinceLastPeriod, cycleLength = 28) => {
  if (daysSinceLastPeriod === null) return 1;
  return (daysSinceLastPeriod % cycleLength) + 1;
};

/**
 * Formate une date en français
 */
export const formatDateFrench = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Calcule les prédictions du cycle (prochaines règles, ovulation)
 */
export const calculateCyclePredictions = (lastPeriodDate, cycleLength = 28) => {
  if (!lastPeriodDate) return null;
  
  const lastPeriod = new Date(lastPeriodDate);
  const nextPeriod = new Date(lastPeriod);
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
  
  const nextOvulation = new Date(lastPeriod);
  nextOvulation.setDate(nextOvulation.getDate() + Math.floor(cycleLength / 2));
  
  return {
    nextPeriod: nextPeriod.toISOString(),
    nextOvulation: nextOvulation.toISOString(),
    fertilityWindow: {
      start: new Date(nextOvulation.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(nextOvulation.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
  };
};

/**
 * Crée une date relative (il y a X jours)
 */
export const getDateDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};
