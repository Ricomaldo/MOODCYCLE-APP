/**
 * 📝 FORMATAGE SIMPLE DONNÉES
 */

import { getCurrentPhase } from './cycleCalculations';
import phasesData from '../data/phases.json';

//
// ─────────────────────────────────────────────────────────
// 📄 File: src/utils/formatters.js
// 🧩 Type: Utility Functions - FORMATAGE GÉNÉRAL
// 📚 Description: Formatters pour les données générales de l'application
// 🎯 Responsabilités: 
//    - Profils utilisateur et personas
//    - Phases du cycle (symboles, métadonnées, icônes)
//    - Préférences et informations générales
// 🕒 Version: 2.0 - 2025-06-26 - NETTOYAGE & AMÉLIORATION
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════════
// 👤 FORMATAGE PROFIL UTILISATEUR
// ═══════════════════════════════════════════════════════════

export const formatUserProfile = (user) => ({
  prenom: user.profile?.prenom,
  age: user.profile?.ageRange,
  phase: getCurrentPhase(user.cycle?.lastPeriodDate, user.cycle?.length, user.cycle?.periodDuration),
  persona: user.persona?.assigned
});

export const formatPreferences = (preferences) => 
  Object.entries(preferences)
    .filter(([, val]) => val >= 4)
    .map(([key]) => key);

export const formatPersonaName = (persona) => {
  const names = {
    emma: 'Emma',
    laure: 'Laure', 
    sylvie: 'Sylvie',
    christine: 'Christine',
    clara: 'Clara'
  };
  return names[persona] || 'Melune';
};

// ═══════════════════════════════════════════════════════════
// 🌙 FORMATAGE PHASES DU CYCLE
// ═══════════════════════════════════════════════════════════

/**
 * Récupère l'emoji d'une phase depuis phases.json
 * @param {string} phaseKey - Clé de la phase (menstrual, follicular, ovulatory, luteal)
 * @param {string} fallback - Icône de fallback si la phase n'est pas trouvée
 * @returns {string} L'emoji de la phase
 */
export const getPhaseSymbol = (phaseKey, fallback = '✨') => {
  if (!phaseKey) return fallback;
  const phase = phasesData[phaseKey];
  return phase?.symbol || fallback;
};

/**
 * Récupère les données d'icône Feather d'une phase
 * @param {string} phaseKey - Clé de la phase
 * @returns {Object|null} Données de l'icône ou null
 */
export const getPhaseIconData = (phaseKey) => {
  if (!phaseKey) return null;
  const phase = phasesData[phaseKey];
  return phase?.icon || null;
};

export const formatPhaseInfo = (phaseInfo) => ({
  name: phaseInfo.name,
  emoji: getPhaseSymbol(phaseInfo.phase),
  color: phaseInfo.color,
  day: `Jour ${phaseInfo.day}`
});

/**
 * Récupère toutes les icônes de phase dans un objet
 * @returns {Object} Objet avec les clés de phase et leurs icônes
 */
export const getAllPhaseIcons = () => {
  const icons = {};
  Object.keys(phasesData).forEach(phaseKey => {
    icons[phaseKey] = phasesData[phaseKey].symbol;
  });
  return icons;
};

/**
 * Récupère les métadonnées complètes d'une phase
 * @param {string} phaseKey - Clé de la phase
 * @returns {Object|null} Les métadonnées de la phase ou null si non trouvée
 */
export const getPhaseMetadata = (phaseKey) => {
  if (!phaseKey) return null;
  return phasesData[phaseKey] || null;
};