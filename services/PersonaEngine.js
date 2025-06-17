// services/PersonaEngine.js
// Algorithme de calcul et scoring des personas MoodCycle
// Version corrigée pour fonctionner avec les vraies données onboarding

import { PERSONA_PROFILES, SCORING_WEIGHTS, SCORING_MODIFIERS } from '../config/personaProfiles.js';

/**
 * 🎯 FONCTION PRINCIPALE DE CALCUL DES SCORES
 * Calcule les scores de correspondance pour tous les personas
 */
export const calculatePersonaScores = (userData) => {
  const scores = {};
  const personaNames = Object.keys(PERSONA_PROFILES);
  
  // Calcul du score pour chaque persona
  personaNames.forEach(personaName => {
    scores[personaName] = calculatePersonaScore(userData, personaName);
  });
  
  return scores;
};

/**
 * 🧮 CALCUL DE SCORE INDIVIDUEL POUR UN PERSONA
 */
const calculatePersonaScore = (userData, personaName) => {
  const reference = PERSONA_PROFILES[personaName];
  if (!reference) return 0;
  
  let totalScore = 0;
  
  // 1. Score choix de voyage (25%)
  const journeyScore = calculateJourneyScore(userData, reference);
  totalScore += journeyScore * SCORING_WEIGHTS.JOURNEY_CHOICE;
  
  // 2. Score tranche d'âge (15%)
  const ageScore = calculateAgeScore(userData, reference);
  totalScore += ageScore * SCORING_WEIGHTS.AGE_RANGE;
  
  // 3. Score préférences (40%) - le plus important
  const prefScore = calculatePreferencesScore(userData, reference);
  totalScore += prefScore * SCORING_WEIGHTS.PREFERENCES;
  
  // 4. Score style communication (20%)
  const styleScore = calculateCommunicationScore(userData, reference);
  totalScore += styleScore * SCORING_WEIGHTS.COMMUNICATION;
  
  // Appliquer coefficients persona
  totalScore *= (reference.coefficients?.preferences || 1.0);
  
  return Math.max(0, Math.min(100, totalScore * 100)); // Score sur 100
};

/**
 * 🌟 CALCUL SCORE CHOIX DE VOYAGE
 * Utilise les vraies valeurs de l'onboarding: 'body_disconnect', 'hiding_nature', 'emotional_control'
 */
const calculateJourneyScore = (userData, reference) => {
  const userJourney = userData.journeyChoice?.selectedOption || userData.journey;
  const refJourneys = reference.preferredJourney;
  
  if (!userJourney || !refJourneys) return 0;
  
  // Correspondance exacte avec les vraies valeurs onboarding
  return refJourneys.includes(userJourney) ? 1 : 0;
};

/**
 * 🎂 CALCUL SCORE TRANCHE D'ÂGE
 */
const calculateAgeScore = (userData, reference) => {
  const userAge = userData.ageRange;
  const refAges = reference.ageRange;
  
  if (!userAge || !refAges) return 0;
  
  // Correspondance exacte
  if (refAges.includes(userAge)) {
    return 1;
  }
  
  // Correspondances adjacentes (score partiel)
  const ageOrder = ['18-25', '26-35', '36-45', '46-55', '55+'];
  const userIndex = ageOrder.indexOf(userAge);
  
  if (userIndex === -1) return 0;
  
  // Chercher si une tranche adjacente match
  for (const refAge of refAges) {
    const refIndex = ageOrder.indexOf(refAge);
    if (refIndex !== -1) {
      const distance = Math.abs(userIndex - refIndex);
      if (distance === 1) return 0.6;
      if (distance === 2) return 0.3;
    }
  }
  
  return 0;
};

/**
 * 💝 CALCUL SCORE PRÉFÉRENCES (Cœur de l'algorithme)
 * Compare directement les scores 0-5 avec les profils de référence
 */
const calculatePreferencesScore = (userData, reference) => {
  const userPrefs = userData.preferences;
  const refPrefs = reference.referencePreferences;
  
  if (!userPrefs || !refPrefs) return 0;
  
  let totalDistance = 0;
  let prefCount = 0;
  
  // ✅ BONUS POWER USER : détecter les profils "tout à fond"
  const userHighPrefs = Object.values(userPrefs).filter(val => val >= 4).length;
  const refHighPrefs = Object.values(refPrefs).filter(val => val >= 4).length;
  
  // Calculer distance normale
  Object.entries(refPrefs).forEach(([pref, refValue]) => {
    if (userPrefs[pref] !== undefined) {
      const distance = Math.abs(userPrefs[pref] - refValue);
      totalDistance += distance;
      prefCount++;
    }
  });
  
  if (prefCount === 0) return 0;
  
  const avgDistance = totalDistance / prefCount;
  const maxDistance = 5;
  let score = Math.max(0, 1 - (avgDistance / maxDistance));
  
  // ✅ BONUS CLARA : Si user et référence ont tous deux 4+ préférences fortes
  if (userHighPrefs >= 4 && refHighPrefs >= 4) {
    score *= 1.5; // Bonus power user
  }
  
  return Math.min(1, score);
};

/**
 * 💬 CALCUL SCORE COMMUNICATION
 * Utilise les vraies valeurs: 'friendly', 'professional', 'inspiring'
 */
const calculateCommunicationScore = (userData, reference) => {
  const userComm = userData.melune?.communicationTone || userData.communication;
  const refComm = reference.communicationStyle;
  
  if (!userComm || !refComm) return 0;
  
  // Correspondance exacte avec les vraies valeurs onboarding
  return refComm.includes(userComm) ? 1 : 0;
};

/**
 * 🏆 ASSIGNER LE MEILLEUR PERSONA
 * Point d'entrée principal - mappe les données onboarding au format attendu
 */
export const calculateAndAssignPersona = (onboardingData) => {
  // Mapper données onboarding vers format attendu par l'algorithme
  const userData = {
    journeyChoice: onboardingData.journeyChoice,
    ageRange: onboardingData.userInfo?.ageRange,
    preferences: onboardingData.preferences,
    melune: onboardingData.melune
  };
  
  const scores = calculatePersonaScores(userData);
  
  // Trouver le persona avec le meilleur score
  let bestPersona = null;
  let bestScore = -1;
  
  Object.entries(scores).forEach(([persona, score]) => {
    if (score > bestScore) {
      bestScore = score;
      bestPersona = persona;
    }
  });
  
  // ✅ CORRECTION : Confiance = score absolu du persona assigné
  const sortedScores = Object.entries(scores)
    .sort(([,a], [,b]) => b - a);
  
  // Confiance basée sur le score absolu (déjà sur 100, donc /100 pour 0-1)
  const confidenceRaw = bestScore / 100;
  
  // Déterminer niveau de confiance basé sur le score absolu
  let confidenceLevel;
  if (confidenceRaw >= 0.8) confidenceLevel = 'high';   // 80%+
  else if (confidenceRaw >= 0.6) confidenceLevel = 'medium'; // 60%+
  else confidenceLevel = 'low';                         // <60%
  
  return {
    assigned: bestPersona,
    scores,
    confidence: Math.min(1, Math.max(0, confidenceRaw)),
    confidenceLevel,
    timestamp: Date.now(),
    metadata: {
      algorithm: 'v3_onboarding_corrected',
      dataMapping: userData
    }
  };
};

/**
 * 🧪 FONCTION DE TEST AVEC VRAIES DONNÉES
 */
export const testPersonaMapping = () => {
  // Données de test basées sur le vrai format onboarding
  const testProfiles = {
    clara: {
      journeyChoice: { selectedOption: 'body_disconnect' },
      userInfo: { ageRange: '26-35' },
      preferences: { symptoms: 2, moods: 5, phyto: 1, phases: 5, lithotherapy: 1, rituals: 2 },
      melune: { communicationTone: 'friendly' }
    },
    laure: {
      journeyChoice: { selectedOption: 'hiding_nature' },
      userInfo: { ageRange: '26-35' },
      preferences: { symptoms: 3, moods: 4, phyto: 3, phases: 5, lithotherapy: 2, rituals: 4 },
      melune: { communicationTone: 'professional' }
    }
  };
  
  const results = {};
  
  Object.entries(testProfiles).forEach(([expectedPersona, testData]) => {
    const result = calculateAndAssignPersona(testData);
    results[expectedPersona] = {
      expected: expectedPersona,
      assigned: result.assigned,
      confidence: result.confidence,
      correct: result.assigned === expectedPersona,
      scores: result.scores
    };
  });
  
  console.log('🧪 Test Persona Mapping Results:', results);
  return results;
}; 