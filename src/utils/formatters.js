/**
 * 📝 FORMATAGE SIMPLE DONNÉES
 */

import React from 'react';
import { Text } from 'react-native';
import { getCurrentPhase } from './cycleCalculations';
import phasesData from '../data/phases.json';
import { PhaseIcon } from '../config/iconConstants';

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
  
  export const formatPhaseInfo = (phaseInfo) => ({
    name: phaseInfo.name,
    emoji: getPhaseSymbol(phaseInfo.phase),
    color: phaseInfo.color,
    day: `Jour ${phaseInfo.day}`
  });
  
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

//
// ─────────────────────────────────────────────────────────
// 📄 File: src/utils/formatters.js
// 🧩 Type: Utility Functions
// 📚 Description: Formatters pour les données de l'application
// 🕒 Version: 1.0 - 2025-01-21
// ─────────────────────────────────────────────────────────
//

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

/**
 * Composant de rendu intelligent pour les indicateurs de phase
 * @param {Object} props - Props du composant
 * @param {string} props.phase - Clé de la phase
 * @param {boolean} props.useIcon - Utiliser l'icône Feather si disponible
 * @param {number} props.size - Taille de l'icône
 * @param {string} props.color - Couleur de l'icône
 */
export const PhaseIndicator = ({ phase, useIcon = true, size = 24, color }) => {
  if (!phase) return null;
  
  const phaseData = phasesData[phase];
  
  if (useIcon && phaseData?.icon?.name) {
    return <PhaseIcon phaseKey={phase} size={size} color={color} />;
  }
  
  return <Text style={{ fontSize: size * 0.75 }}>{phaseData?.symbol || '✨'}</Text>;
};

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