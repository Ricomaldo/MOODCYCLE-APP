//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/PersonaEngine.js
// 🧩 Type: Service
// 📚 Description: Algorithme pur calcul personas - Fonction pure uniquement
// 🕒 Version: 4.0 - 2025-06-21
// ─────────────────────────────────────────────────────────
//

const PERSONA_PROFILES = {
  emma: {
    ageRange: ['18-25'],
    preferredJourney: ['body_disconnect'],
    referencePreferences: { symptoms: 2, moods: 3, phyto: 4, phases: 3, lithotherapy: 2, rituals: 3 },
    communicationStyle: ['friendly']
  },
  laure: {
    ageRange: ['26-35'],
    preferredJourney: ['hiding_nature'],
    referencePreferences: { symptoms: 3, moods: 4, phyto: 3, phases: 5, lithotherapy: 2, rituals: 4 },
    communicationStyle: ['professional']
  },
  sylvie: {
    ageRange: ['36-45'],
    preferredJourney: ['emotional_control'],
    referencePreferences: { symptoms: 4, moods: 5, phyto: 3, phases: 4, lithotherapy: 2, rituals: 5 },
    communicationStyle: ['inspiring']
  },
  christine: {
    ageRange: ['46-55', '55+'],
    preferredJourney: ['hiding_nature', 'emotional_control'],
    referencePreferences: { symptoms: 3, moods: 4, phyto: 4, phases: 3, lithotherapy: 3, rituals: 5 },
    communicationStyle: ['professional', 'inspiring']
  },
  clara: {
    ageRange: ['26-35'],
    preferredJourney: ['body_disconnect'],
    referencePreferences: { symptoms: 2, moods: 5, phyto: 1, phases: 5, lithotherapy: 1, rituals: 2 },
    communicationStyle: ['friendly']
  }
};

const SCORING_WEIGHTS = {
  JOURNEY_CHOICE: 0.25,
  AGE_RANGE: 0.15,
  PREFERENCES: 0.40,
  COMMUNICATION: 0.20
};

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
 * 📊 CALCUL SCORE INDIVIDUEL
 */
function calculatePersonaScore(userData, personaName) {
  const reference = PERSONA_PROFILES[personaName];
  if (!reference) return 0;

  let totalScore = 0;

  // 1. Score voyage (25%)
  const journeyScore = calculateJourneyScore(userData, reference);
  totalScore += journeyScore * SCORING_WEIGHTS.JOURNEY_CHOICE;

  // 2. Score âge (15%)
  const ageScore = calculateAgeScore(userData, reference);
  totalScore += ageScore * SCORING_WEIGHTS.AGE_RANGE;

  // 3. Score préférences (40%)
  const prefScore = calculatePreferencesScore(userData, reference);
  totalScore += prefScore * SCORING_WEIGHTS.PREFERENCES;

  // 4. Score communication (20%)
  const styleScore = calculateCommunicationScore(userData, reference);
  totalScore += styleScore * SCORING_WEIGHTS.COMMUNICATION;

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
  return Math.max(0, 1 - avgDistance / 5);
}

function calculateCommunicationScore(userData, reference) {
  const userComm = userData.communicationTone;
  return userComm && reference.communicationStyle.includes(userComm) ? 1 : 0;
}