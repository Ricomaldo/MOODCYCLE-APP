// config/personaProfiles.js
// Configuration des 5 personas de référence pour le mapping automatique
// Basé sur implementation-guide.md et les données de simulation personas_valors.md

export const PERSONA_PROFILES = {
  emma: {
    id: 'emma',
    name: 'Emma',
    description: 'Novice curieuse en découverte de son cycle (18-25 ans)',
    // Données de référence selon simulation validation thérapeutique
    ageRange: ['18-25'],
    preferredJourney: ['body_disconnect'], // Reconnexion corporelle
    strongPreferences: ['moods'], // Seule préférence élevée (4)
    communicationStyle: ['friendly'], // Ton amical
    avatarStyle: ['classic'], // Avatar classique rassurant
    // Profil de préférences selon tableau simulation
    referencePreferences: {
      symptoms: 2,        // Modéré
      moods: 4,          // Préférence forte (exploration émotionnelle)
      phyto: 1,          // Faible (novice)
      phases: 3,         // Modéré
      lithotherapy: 1,   // Faible (pas encore intéressée)
      rituals: 2         // Modéré
    },
    coefficients: {
      journey: 1.0,
      age: 1.2,        // Bonus pour âge correspondant
      preferences: 1.1,
      communication: 1.0
    }
  },
  
  laure: {
    id: 'laure',
    name: 'Laure',
    description: 'Professionnelle équilibrée en optimisation (26-40 ans)',
    ageRange: ['26-35', '36-45'], // Couvre 26-40 selon simulation
    preferredJourney: ['hiding_nature'], // Révélation de sa vraie nature
    strongPreferences: ['moods', 'phases', 'rituals'], // Préférences élevées (≥4)
    communicationStyle: ['professional'], // Ton professionnel
    avatarStyle: ['modern'], // Avatar moderne
    // Profil de préférences selon tableau simulation
    referencePreferences: {
      symptoms: 3,       // Modéré
      moods: 4,         // Préférence forte
      phyto: 3,         // Modéré
      phases: 5,        // Préférence maximale (optimisation cyclique)
      lithotherapy: 2,  // Modéré
      rituals: 4        // Préférence forte (productivité bien-être)
    },
    coefficients: {
      journey: 1.2,    // Forte correspondance révélation nature
      age: 1.0,
      preferences: 1.1,
      communication: 1.1
    }
  },
  
  sylvie: {
    id: 'sylvie',
    name: 'Sylvie',
    description: 'Femme en transition gérant des changements (41-55 ans)',
    ageRange: ['46-55'], // Selon onboarding (même si simulation dit 41-55)
    preferredJourney: ['emotional_control'], // Maîtrise émotionnelle
    strongPreferences: ['symptoms', 'phyto'], // Préférences maximales (5)
    communicationStyle: ['friendly'], // Ton amical
    avatarStyle: ['classic'], // Avatar classique
    // Profil de préférences selon tableau simulation
    referencePreferences: {
      symptoms: 5,       // Préférence maximale (gestion transition)
      moods: 3,         // Modéré
      phyto: 5,         // Préférence maximale (solutions naturelles)
      phases: 2,        // Faible (phases perturbées)
      lithotherapy: 1,  // Faible
      rituals: 3        // Modéré
    },
    coefficients: {
      journey: 1.1,
      age: 1.2,        // Forte correspondance âge
      preferences: 1.2, // Forte correspondance symptômes/phyto
      communication: 1.0
    }
  },
  
  christine: {
    id: 'christine',
    name: 'Christine',
    description: 'Sage épanouie en transmission de sagesse (55+ ans)',
    ageRange: ['55+'],
    preferredJourney: ['hiding_nature'], // Révélation avec sagesse spirituelle
    strongPreferences: ['symptoms', 'phases', 'lithotherapy', 'rituals'], // Préférences élevées (≥4)
    communicationStyle: ['inspiring'], // Ton inspirant
    avatarStyle: ['mystique'], // Avatar mystique
    // Profil de préférences selon tableau simulation
    referencePreferences: {
      symptoms: 4,       // Préférence forte (expérience corporelle)
      moods: 3,         // Modéré (sagesse émotionnelle acquise)
      phyto: 2,         // Modéré (préfère spirituel)
      phases: 5,        // Préférence maximale (sagesse cyclique)
      lithotherapy: 5,  // Préférence maximale (spiritualité)
      rituals: 4        // Préférence forte (transmission)
    },
    coefficients: {
      journey: 1.1,
      age: 1.3,        // Très forte correspondance âge
      preferences: 1.2,
      communication: 1.1
    }
  },
  
  clara: {
    id: 'clara',
    name: 'Clara',
    description: 'Power user enthousiaste qui maximise toutes les fonctionnalités (26-35 ans)',
    ageRange: ['26-35'],
    preferredJourney: ['emotional_control'], // ✅ Unique - contrôle total
    strongPreferences: ['symptoms', 'moods', 'phases', 'rituals'], // ✅ 4 préférences fortes
    communicationStyle: ['inspiring'], // ✅ Unique - évangéliste tech
    avatarStyle: ['modern'], // Avatar moderne
    // Profil de préférences "everything maxed out"
    referencePreferences: {
      symptoms: 5,       // Max - track absolument tout
      moods: 5,         // Max - analyse patterns
      phyto: 4,         // Fort - teste solutions
      phases: 5,        // Max - optimise cycles
      lithotherapy: 3,  // Modéré - curieuse
      rituals: 5        // Max - fan de fonctionnalités
    },
    coefficients: {
      journey: 1.2,      // Bonus pour emotional_control
      age: 1.0,
      preferences: 1.3,  // ✅ BONUS POWER USER - pénalise les profils "moyens"
      communication: 1.1
    }
  }
};

// Coefficients de pondération globaux pour l'algorithme (selon implementation-guide.md)
export const SCORING_WEIGHTS = {
  JOURNEY_CHOICE: 0.25,    // 25% - Choix de voyage
  AGE_RANGE: 0.15,         // 15% - Tranche d'âge
  PREFERENCES: 0.40,       // 40% - Préférences de santé (plus important)
  COMMUNICATION: 0.20      // 20% - Style de communication préféré
};

// Seuils et paramètres pour l'algorithme
export const SCORING_MODIFIERS = {
  EXACT_MATCH_BONUS: 20,     // Bonus pour correspondance exacte
  PARTIAL_MATCH_BONUS: 10,   // Bonus pour correspondance partielle
  MISMATCH_PENALTY: -15,     // Malus pour non-correspondance
  CONFIDENCE_THRESHOLD: 60,  // Seuil de confiance minimum (sur 100)
  PREFERENCE_VARIANCE: 1.5   // Écart acceptable sur préférences (selon implementation-guide.md)
};

// Mapping des vrais choix de l'onboarding vers les profils personas
export const ONBOARDING_MAPPING = {
  // Vrais choix de l'écran 200-rencontre.jsx
  journeyChoice: {
    'body_disconnect': 'body_disconnect',      // "Je ne me reconnais plus dans mon corps"
    'hiding_nature': 'hiding_nature',          // "Je sens que je cache ma vraie nature"  
    'emotional_control': 'emotional_control'   // "Je veux arrêter de subir mes émotions"
  },
  
  // Vraies tranches d'âge de l'écran 375-age.jsx
  ageRange: {
    '18-25': '18-25',
    '26-35': '26-35',
    '36-45': '36-45', 
    '46-55': '46-55',
    '55+': '55+'
  },
  
  // Vraies préférences de l'écran 500-preferences.jsx (échelle 0-5)
  preferences: [
    'symptoms',     // Symptômes physiques
    'moods',        // Humeurs
    'phyto',        // Phyto/HE
    'phases',       // Énergie des phases
    'lithotherapy', // Lithothérapie
    'rituals'       // Rituels bien-être
  ],
  
  // Vrais tons de l'écran 600-avatar.jsx
  communicationStyle: {
    'friendly': 'friendly',           // Amicale
    'professional': 'professional',   // Professionnelle
    'inspiring': 'inspiring'          // Inspirante
  },
  
  // Vrais styles d'avatar de l'écran 600-avatar.jsx
  avatarStyle: {
    'classic': 'classic',   // Classique - Bienveillante et douce
    'modern': 'modern',     // Moderne - Énergique et directe
    'mystique': 'mystique'  // Mystique - Sage et spirituelle
  }
};

// Helper functions pour obtenir les profils
export const getPersonaById = (personaId) => {
  return PERSONA_PROFILES[personaId] || null;
};

export const getAllPersonas = () => {
  return Object.values(PERSONA_PROFILES);
};

export const isValidPersona = (personaId) => {
  return personaId && PERSONA_PROFILES.hasOwnProperty(personaId);
};

// Fonction pour obtenir les préférences fortes d'un utilisateur (score >= 4)
export const getUserStrongPreferences = (userPreferences) => {
  if (!userPreferences) return [];
  
  return Object.entries(userPreferences)
    .filter(([key, value]) => value >= 4)
    .map(([key]) => key);
};

// Fonction pour calculer la distance entre deux profils de préférences
export const calculatePreferenceDistance = (userPrefs, referencePrefs) => {
  if (!userPrefs || !referencePrefs) return Infinity;
  
  let totalDistance = 0;
  let prefCount = 0;
  
  Object.entries(referencePrefs).forEach(([pref, refValue]) => {
    if (userPrefs[pref] !== undefined) {
      const distance = Math.abs(userPrefs[pref] - refValue);
      totalDistance += distance;
      prefCount++;
    }
  });
  
  return prefCount > 0 ? totalDistance / prefCount : Infinity;
};

// 🧪 DONNÉES DE SIMULATION POUR TESTS
// Basé sur le tableau personas_valors.md
export const SIMULATION_PROFILES = {
  emma: {
    journeyChoice: { selectedOption: 'body_disconnect' },
    userInfo: { ageRange: '18-25' },
    preferences: { symptoms: 2, moods: 4, phyto: 1, phases: 3, lithotherapy: 1, rituals: 2 },
    melune: { avatarStyle: 'classic', communicationTone: 'friendly' }
  },
  laure: {
    journeyChoice: { selectedOption: 'hiding_nature' },
    userInfo: { ageRange: '26-35' }, // Utilise première tranche pour test
    preferences: { symptoms: 3, moods: 4, phyto: 3, phases: 5, lithotherapy: 2, rituals: 4 },
    melune: { avatarStyle: 'modern', communicationTone: 'professional' }
  },
  sylvie: {
    journeyChoice: { selectedOption: 'emotional_control' },
    userInfo: { ageRange: '46-55' },
    preferences: { symptoms: 5, moods: 3, phyto: 5, phases: 2, lithotherapy: 1, rituals: 3 },
    melune: { avatarStyle: 'classic', communicationTone: 'friendly' }
  },
  christine: {
    journeyChoice: { selectedOption: 'hiding_nature' },
    userInfo: { ageRange: '55+' },
    preferences: { symptoms: 4, moods: 3, phyto: 2, phases: 5, lithotherapy: 5, rituals: 4 },
    melune: { avatarStyle: 'mystique', communicationTone: 'inspiring' }
  },
  clara: {
    journeyChoice: { selectedOption: 'emotional_control' }, // ✅ Unique
    userInfo: { ageRange: '26-35' },
    preferences: { 
      symptoms: 5,      // ✅ Max out
      moods: 5,        // ✅ Max out  
      phyto: 4,        // ✅ Fort
      phases: 5,       // ✅ Max out
      lithotherapy: 3, // ✅ Modéré
      rituals: 5       // ✅ Max out
    },
    melune: { 
      avatarStyle: 'modern', 
      communicationTone: 'inspiring' // ✅ Unique
    }
  }
}; 