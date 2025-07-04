// ─────────────────────────────────────────────────────────
// 📄 File: src/config/personaProfiles.js
// 🎯 Mission: Config personas + algorithme scoring
// 🌙 Optimisé: Édition facile profils + préservation technique
// ─────────────────────────────────────────────────────────

export const PERSONA_PROFILES = {
  emma: {
    // ===============================
    // COMPATIBILITÉ API EXISTANTE ✅
    // ===============================
    id: "emma",
    name: "Emma",
    description: "Novice curieuse en découverte de son cycle (18-25 ans)", // ← PRÉSERVÉ pour rétrocompatibilité
    ageRange: ["18-25"],
    preferredJourney: ["body_disconnect"],
    strongPreferences: ["moods"],
    communicationStyle: ["friendly"],
    avatarStyle: ["classic"],
    
    // Algorithme scoring (PersonaEngine.js) - INCHANGÉ
    referencePreferences: {
      symptoms: 2, moods: 4, phyto: 1,
      phases: 3, lithotherapy: 1, rituals: 2
    },
    coefficients: {
      journey: 1.0, age: 1.2, preferences: 1.1, communication: 1.0,
      terminology: 1.05
    },

    // ===============================
    // AJOUT : CONTENU ÉDITABLE JEZA
    // ===============================
    editableContent: {
      voiceCharacteristics: {
        tone: "Complice et bienveillante, comme une grande sœur",
        vocabulary: ["découverte", "exploration", "apprentissage", "patience"],
        communicationStyle: "Questions ouvertes, encouragement constant",
        specialFocus: "Démystifier le cycle, rassurer sur la normalité"
      },
      typicalChallenges: [
        "Méconnaissance de son cycle",
        "Peur des changements corporels", 
        "Besoin de guidance sans jugement"
      ],
      therapeuticApproach: "Accompagnement doux, éducation progressive, validation émotions"
    }
  },

  laure: {
    id: "laure",
    name: "Laure", 
    ageRange: ["26-35", "36-45"],
    preferredJourney: ["hiding_nature"],
    strongPreferences: ["moods", "phases", "rituals"],
    communicationStyle: ["professional"],
    avatarStyle: ["modern"],
    
    referencePreferences: {
      symptoms: 3, moods: 4, phyto: 3,
      phases: 5, lithotherapy: 2, rituals: 4
    },
    coefficients: {
      journey: 1.2, age: 1.0, preferences: 1.1, communication: 1.1,
      terminology: 1.0
    },

    editableContent: {
      description: "Professionnelle équilibrée en optimisation cyclique (26-40 ans)",
      voiceCharacteristics: {
        tone: "Efficace et structurée, coach bienveillante",
        vocabulary: ["optimisation", "équilibre", "performance", "stratégie"],
        communicationStyle: "Conseils pratiques, solutions concrètes",
        specialFocus: "Intégrer cycle dans vie professionnelle"
      },
      typicalChallenges: [
        "Manque de temps pour se connecter",
        "Culpabilité de ralentir pendant règles",
        "Optimiser énergie selon phases"
      ],
      therapeuticApproach: "Approche pragmatique, outils concrets, respect du rythme"
    }
  },

  sylvie: {
    id: "sylvie",
    name: "Sylvie",
    ageRange: ["46-55"],
    preferredJourney: ["emotional_control"],
    strongPreferences: ["symptoms", "phyto"],
    communicationStyle: ["friendly"],
    avatarStyle: ["classic"],
    
    referencePreferences: {
      symptoms: 5, moods: 3, phyto: 5,
      phases: 2, lithotherapy: 1, rituals: 3
    },
    coefficients: {
      journey: 1.1, age: 1.2, preferences: 1.2, communication: 1.0,
      terminology: 1.1
    },

    editableContent: {
      description: "Femme en transition gérant changements hormonaux (41-55 ans)",
      voiceCharacteristics: {
        tone: "Compréhensive et rassurante, experte empathique",
        vocabulary: ["transition", "adaptation", "sagesse", "patience"],
        communicationStyle: "Validation expérience, solutions naturelles",
        specialFocus: "Accompagner changements, solutions douces"
      },
      typicalChallenges: [
        "Cycles irréguliers et imprévisibles",
        "Symptômes nouveaux et intenses",
        "Questionnement sur féminité"
      ],
      therapeuticApproach: "Normalisation vécu, phytothérapie, accompagnement transition"
    }
  },

  christine: {
    id: "christine",
    name: "Christine",
    ageRange: ["55+"],
    preferredJourney: ["hiding_nature"],
    strongPreferences: ["symptoms", "phases", "lithotherapy", "rituals"],
    communicationStyle: ["inspiring"],
    avatarStyle: ["mystique"],
    
    referencePreferences: {
      symptoms: 4, moods: 3, phyto: 2,
      phases: 5, lithotherapy: 5, rituals: 4
    },
    coefficients: {
      journey: 1.1, age: 1.3, preferences: 1.2, communication: 1.1,
      terminology: 1.2
    },

    editableContent: {
      description: "Sage épanouie en transmission de sagesse cyclique (55+ ans)",
      voiceCharacteristics: {
        tone: "Sage et inspirante, mentor spirituelle",
        vocabulary: ["sagesse", "transmission", "spiritualité", "honneur"],
        communicationStyle: "Partage d'expérience, guidance spirituelle",
        specialFocus: "Célébrer sagesse acquise, transmettre connaissances"
      },
      typicalChallenges: [
        "Redéfinir féminité post-ménopause",
        "Valoriser expérience cyclique",
        "Trouver nouveau rôle de guide"
      ],
      therapeuticApproach: "Célébration parcours, spiritualité, transmission aux jeunes"
    }
  },

  clara: {
    id: "clara",
    name: "Clara",
    ageRange: ["26-35"],
    preferredJourney: ["emotional_control"],
    strongPreferences: ["symptoms", "moods", "phases", "rituals"],
    communicationStyle: ["inspiring"],
    avatarStyle: ["modern"],
    
    referencePreferences: {
      symptoms: 5, moods: 5, phyto: 4,
      phases: 5, lithotherapy: 3, rituals: 5
    },
    coefficients: {
      journey: 1.2, age: 1.0, preferences: 1.3, communication: 1.1,
      terminology: 1.0
    },

    editableContent: {
      description: "Power user enthousiaste maximisant toutes fonctionnalités (26-35 ans)",
      voiceCharacteristics: {
        tone: "Enthousiaste et précise, coach tech-savvy",
        vocabulary: ["optimisation", "données", "patterns", "performance"],
        communicationStyle: "Analyse détaillée, suggestions avancées",
        specialFocus: "Maximiser potentiel app, tracking avancé"
      },
      typicalChallenges: [
        "Surinvestissement dans le tracking",
        "Perfectionnisme cyclique",
        "Besoin de contrôle total"
      ],
      therapeuticApproach: "Canaliser enthousiasme, équilibrer analyse et intuition"
    }
  }
};

// ===============================
// CONFIGURATION ALGORITHME (statique)
// ===============================
export const SCORING_WEIGHTS = {
  JOURNEY_CHOICE: 0.25,   // 25% - Choix de voyage
  AGE_RANGE: 0.15,        // 15% - Tranche d'âge  
  PREFERENCES: 0.35,      // 35% - Préférences santé (était 40%)
  COMMUNICATION: 0.15,    // 15% - Style communication (était 20%)
  TERMINOLOGY: 0.10       // 10% - NOUVEAU facteur
};

export const SCORING_MODIFIERS = {
  EXACT_MATCH_BONUS: 20,
  PARTIAL_MATCH_BONUS: 10, 
  MISMATCH_PENALTY: -15,
  CONFIDENCE_THRESHOLD: 60,
  PREFERENCE_VARIANCE: 1.5
};

// ===============================
// MAPPING ONBOARDING (technique)
// ===============================
export const ONBOARDING_MAPPING = {
  journeyChoice: {
    body_disconnect: "body_disconnect",
    hiding_nature: "hiding_nature", 
    emotional_control: "emotional_control"
  },
  ageRange: {
    "18-25": "18-25", "26-35": "26-35", "36-45": "36-45",
    "46-55": "46-55", "55+": "55+"
  },
  preferences: ["symptoms", "moods", "phyto", "phases", "lithotherapy", "rituals"],
  communicationStyle: {
    friendly: "friendly", professional: "professional", inspiring: "inspiring"
  },
  avatarStyle: {
    classic: "classic", modern: "modern", mystique: "mystique"
  }
};

// ===============================
// HELPER FUNCTIONS (utilitaires)
// ===============================
export const getPersonaById = (personaId) => PERSONA_PROFILES[personaId] || null;
export const getAllPersonas = () => Object.values(PERSONA_PROFILES);
export const isValidPersona = (personaId) => personaId && PERSONA_PROFILES.hasOwnProperty(personaId);

export const getUserStrongPreferences = (userPreferences) => {
  if (!userPreferences) return [];
  return Object.entries(userPreferences)
    .filter(([key, value]) => value >= 4)
    .map(([key]) => key);
};

export const calculatePreferenceDistance = (userPrefs, referencePrefs) => {
  if (!userPrefs || !referencePrefs) return Infinity;
  
  let totalDistance = 0;
  let prefCount = 0;

  Object.entries(referencePrefs).forEach(([pref, refValue]) => {
    if (userPrefs[pref] !== undefined) {
      totalDistance += Math.abs(userPrefs[pref] - refValue);
      prefCount++;
    }
  });

  return prefCount > 0 ? totalDistance / prefCount : Infinity;
};

// ===============================
// DONNÉES SIMULATION TESTS ✅
// ===============================
export const SIMULATION_PROFILES = {
  emma: {
    journeyChoice: { selectedOption: "body_disconnect" },
    userInfo: { ageRange: "18-25" },
    preferences: { symptoms: 2, moods: 4, phyto: 1, phases: 3, lithotherapy: 1, rituals: 2 },
    melune: { avatarStyle: "classic", communicationTone: "friendly" }
  },
  laure: {
    journeyChoice: { selectedOption: "hiding_nature" },
    userInfo: { ageRange: "26-35" },
    preferences: { symptoms: 3, moods: 4, phyto: 3, phases: 5, lithotherapy: 2, rituals: 4 },
    melune: { avatarStyle: "modern", communicationTone: "professional" }
  },
  sylvie: {
    journeyChoice: { selectedOption: "emotional_control" },
    userInfo: { ageRange: "46-55" },
    preferences: { symptoms: 5, moods: 3, phyto: 5, phases: 2, lithotherapy: 1, rituals: 3 },
    melune: { avatarStyle: "classic", communicationTone: "friendly" }
  },
  christine: {
    journeyChoice: { selectedOption: "hiding_nature" },
    userInfo: { ageRange: "55+" },
    preferences: { symptoms: 4, moods: 3, phyto: 2, phases: 5, lithotherapy: 5, rituals: 4 },
    melune: { avatarStyle: "mystique", communicationTone: "inspiring" }
  },
  clara: {
    journeyChoice: { selectedOption: "emotional_control" },
    userInfo: { ageRange: "26-35" },
    preferences: { symptoms: 5, moods: 5, phyto: 4, phases: 5, lithotherapy: 3, rituals: 5 },
    melune: { avatarStyle: "modern", communicationTone: "inspiring" }
  }
};