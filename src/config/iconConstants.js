// ─────────────────────────────────────────────────────────
// 📄 File: src/config/iconConstants.js
// 🎯 Mission: Composant PhaseIcon + mapping icônes
// 🌙 Usage: FreeWritingModal, CycleView, UI components
// ─────────────────────────────────────────────────────────

import React from 'react';
import { Feather } from '@expo/vector-icons';
import phasesData from '../data/phases.json';

// ===============================
// MAPPING PHASES → ICÔNES FEATHER
// ===============================
export const PHASE_ICONS = {
  menstrual: 'droplet',     // 🩸 Phase menstruelle
  follicular: 'feather',   // 🌱 Phase folliculaire (légèreté)
  ovulatory: 'sun',        // ☀️ Phase ovulatoire (rayonnement)
  luteal: 'wind'           // 🌀 Phase lutéale (mouvement intérieur)
};

// ===============================
// COMPOSANT PHASEICON RÉUTILISABLE
// ===============================
export const PhaseIcon = ({ 
  phaseKey, 
  size = 24, 
  color = '#000',
  style = {},
  ...props 
}) => {
  // Lecture depuis phases.json ou fallback
  const iconName = phasesData[phaseKey]?.icon?.name || 
                   PHASE_ICONS[phaseKey] || 
                   'help-circle';
  
  return (
    <Feather 
      name={iconName} 
      size={size} 
      color={color}
      style={style}
      {...props}
    />
  );
};

// ===============================
// HELPER FUNCTIONS
// ===============================

// Obtenir nom d'icône uniquement (pour conditions)
export const getPhaseIconName = (phaseKey) => {
  return phasesData[phaseKey]?.icon?.name || 
         PHASE_ICONS[phaseKey] || 
         'help-circle';
};

// Obtenir couleur par défaut d'une phase
export const getPhaseColor = (phaseKey) => {
  return phasesData[phaseKey]?.color || '#666666';
};

// Composant avec couleur automatique de phase
export const PhaseIconColored = ({ phaseKey, size = 24, ...props }) => {
  const color = getPhaseColor(phaseKey);
  
  return (
    <PhaseIcon 
      phaseKey={phaseKey}
      size={size}
      color={color}
      {...props}
    />
  );
};

// ===============================
// CONSTANTES UI COMMUNES
// ===============================
export const ICON_SIZES = {
  xs: 16,
  sm: 20, 
  md: 24,
  lg: 32,
  xl: 48
};

export const PHASE_EMOJI_FALLBACK = {
  menstrual: '🌸',
  follicular: '🌱', 
  ovulatory: '🌼',
  luteal: '🌀'
};

// Usage recommandé dans composants :
// import { PhaseIcon, PhaseIconColored } from '../config/iconConstants';
// 
// <PhaseIcon phaseKey="menstrual" size={32} color="#E53935" />
// <PhaseIconColored phaseKey={currentPhase} size={24} />