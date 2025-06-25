// 
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/iconConstants.js
// 🧩 Type: Configuration
// 📚 Description: Configuration centralisée des icônes
// 🕒 Version: 1.0 - 2025-06-24
// ─────────────────────────────────────────────────────────
//

import React from 'react';
import { Feather } from '@expo/vector-icons';
import phasesData from '../data/phases.json';

// Mapping des phases vers les icônes Feather
export const PHASE_ICONS = {
  menstrual: 'droplet',
  follicular: 'feather',
  ovulatory: 'sun',
  luteal: 'wind'
};

// Composant pour rendu d'icône de phase
export const PhaseIcon = ({ phaseKey, size = 24, color = '#000' }) => {
  const iconName = phasesData[phaseKey]?.icon?.name || 'help-circle';
  return <Feather name={iconName} size={size} color={color} />;
};

// Helper pour obtenir juste le nom de l'icône
export const getPhaseIconName = (phaseKey) => {
  return phasesData[phaseKey]?.icon?.name || 'help-circle';
}; 