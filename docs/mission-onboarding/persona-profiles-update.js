// Modifications à faire dans personaProfiles.js EXISTANT

// 1. LOCALISER et REMPLACER les SCORING_WEIGHTS existants (chercher "SCORING_WEIGHTS")
export const SCORING_WEIGHTS = {
  JOURNEY_CHOICE: 0.25,   // 25% - Choix de voyage
  AGE_RANGE: 0.15,        // 15% - Tranche d'âge  
  PREFERENCES: 0.35,      // 35% - Préférences santé (était 40%)
  COMMUNICATION: 0.15,    // 15% - Style communication (était 20%)
  TERMINOLOGY: 0.10       // 10% - NOUVEAU facteur
};

// 2. Pour CHAQUE persona dans PERSONA_PROFILES, AJOUTER dans coefficients:
// Exemple pour emma (chercher "emma:" puis "coefficients:"):
coefficients: {
  journey: 1.0, 
  age: 1.2, 
  preferences: 1.1, 
  communication: 1.0,
  terminology: 1.05  // ← AJOUTER cette ligne
}