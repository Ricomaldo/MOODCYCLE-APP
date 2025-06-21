//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/PersonaEngine.js
// 🧩 Type: Service
// 📚 Description: Algorithme pur calcul personas - Fonction pure optimisée
// 🕒 Version: 5.0 - 2025-06-21
// ─────────────────────────────────────────────────────────
//
import { PERSONA_PROFILES, SCORING_WEIGHTS } from '../config/personaProfiles.js';

/**
 * 🎯 FONCTION PRINCIPALE - Calcul persona depuis données UserStore
 */
export function calculatePersona(userStoreData) {
  const userData = {
    journeyChoice: userStoreData.profile?.journeyChoice,
    ageRange: userStoreData.profile?.ageRange,
    preferences: userStoreData.preferences,
    communicationTone: userStoreData.melune?.tone
  };

  const scores = calculatePersonaScores(userData);
  const bestMatch = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    assigned: bestMatch[0],
    confidence: bestMatch[1] / 100,
    scores,
    timestamp: Date.now()
  };
}

/**
 * 🧮 CALCUL SCORES POUR TOUS LES PERSONAS
 */
function calculatePersonaScores(userData) {
  const scores = {};
  
  Object.keys(PERSONA_PROFILES).forEach(personaName => {
    scores[personaName] = calculatePersonaScore(userData, personaName);
  });

  return scores;
}

/**
 * 📊 CALCUL SCORE INDIVIDUEL OPTIMISÉ
 */
function calculatePersonaScore(userData, personaName) {
  const reference = PERSONA_PROFILES[personaName];
  if (!reference) return 0;

  // Calcul des scores individuels
  const journeyScore = calculateJourneyScore(userData, reference);
  const ageScore = calculateAgeScore(userData, reference);
  const prefScore = calculatePreferencesScore(userData, reference);
  const styleScore = calculateCommunicationScore(userData, reference);

  // Coefficients persona (plus subtils)
  const coeffs = reference.coefficients || {};
  const journeyCoeff = Math.min(coeffs.journey || 1.0, 1.15); // Max +15%
  const ageCoeff = Math.min(coeffs.age || 1.0, 1.2);          // Max +20%
  const prefCoeff = Math.min(coeffs.preferences || 1.0, 1.2); // Max +20%
  const commCoeff = Math.min(coeffs.communication || 1.0, 1.1); // Max +10%

  // Score pondéré avec coefficients
  let totalScore = 0;
  totalScore += journeyScore * SCORING_WEIGHTS.JOURNEY_CHOICE * journeyCoeff;
  totalScore += ageScore * SCORING_WEIGHTS.AGE_RANGE * ageCoeff;
  totalScore += prefScore * SCORING_WEIGHTS.PREFERENCES * prefCoeff;
  totalScore += styleScore * SCORING_WEIGHTS.COMMUNICATION * commCoeff;

  // 🎯 BONUS DE CORRESPONDANCE MULTIPLE
  let bonus = 0;
  const matchCount = journeyScore + ageScore + (prefScore > 0.7 ? 1 : 0) + styleScore;
  
  if (matchCount >= 4) bonus += 0.15;      // Correspondance parfaite
  else if (matchCount >= 3) bonus += 0.10; // Très bonne correspondance
  else if (matchCount >= 2) bonus += 0.05; // Bonne correspondance

  // Bonus spéciaux pour cohérence
  if (journeyScore > 0 && ageScore > 0) bonus += 0.03;        // Combo âge+voyage
  if (journeyScore > 0 && styleScore > 0) bonus += 0.02;      // Combo voyage+style
  if (ageScore > 0 && styleScore > 0) bonus += 0.02;          // Combo âge+style

  totalScore += bonus;

  return Math.max(0, Math.min(100, totalScore * 100));
}

function calculateJourneyScore(userData, reference) {
  const userJourney = userData.journeyChoice;
  return userJourney && reference.preferredJourney.includes(userJourney) ? 1 : 0;
}

function calculateAgeScore(userData, reference) {
  const userAge = userData.ageRange;
  if (!userAge || !reference.ageRange.includes(userAge)) return 0;
  return 1;
}

/**
 * 🎯 CALCUL PRÉFÉRENCES OPTIMISÉ - Plus tolérant
 */
function calculatePreferencesScore(userData, reference) {
  const userPrefs = userData.preferences;
  const refPrefs = reference.referencePreferences;
  
  if (!userPrefs || !refPrefs) return 0;

  let totalDistance = 0;
  let prefCount = 0;

  Object.entries(refPrefs).forEach(([pref, refValue]) => {
    if (userPrefs[pref] !== undefined) {
      const distance = Math.abs(userPrefs[pref] - refValue);
      totalDistance += distance;
      prefCount++;
    }
  });

  if (prefCount === 0) return 0;

  const avgDistance = totalDistance / prefCount;
  
  // 🎯 COURBE DE TOLÉRANCE AMÉLIORÉE
  if (avgDistance === 0) return 1.0;           // Parfait
  if (avgDistance <= 0.5) return 0.95;         // Quasi-parfait
  if (avgDistance <= 1.0) return 0.85;         // Très bon
  if (avgDistance <= 1.5) return 0.75;         // Bon
  if (avgDistance <= 2.0) return 0.60;         // Acceptable
  if (avgDistance <= 2.5) return 0.45;         // Moyen
  if (avgDistance <= 3.0) return 0.30;         // Faible
  
  // Formule progressive pour distances élevées
  return Math.max(0, 0.30 - (avgDistance - 3.0) * 0.1);
}

function calculateCommunicationScore(userData, reference) {
  const userComm = userData.communicationTone;
  return userComm && reference.communicationStyle.includes(userComm) ? 1 : 0;
}