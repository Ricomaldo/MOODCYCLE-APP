# Utils MoodCycle

Ce dossier contient les utilitaires et algorithmes de calcul pour l'application MoodCycle.

## 📁 Fichiers

### `PersonaEngine.js`
**Algorithme de calcul et d'assignation des personas utilisatrices.**

#### 🎯 Fonctionnalités principales
- **`calculateAndAssignPersona(onboardingData)`** : Point d'entrée principal
- **`calculatePersonaScores(userData)`** : Calcule les scores pour tous les personas
- **`testPersonaMapping()`** : Tests de validation avec données réelles

#### 🧮 Logique de scoring
L'algorithme évalue 4 critères pondérés :

| Critère | Poids | Description |
|---------|-------|-------------|
| **Journey Choice** | 25% | Choix de voyage onboarding (`body_disconnect`, `hiding_nature`, `emotional_control`) |
| **Age Range** | 15% | Tranche d'âge (`18-25`, `26-35`, `36-45`, `46-55`, `55+`) |
| **Preferences** | 40% | Distance euclidienne entre profils de préférences (0-5) |
| **Communication** | 20% | Style de communication (`friendly`, `professional`, `inspiring`) |

#### 🎭 Personas supportés
- **Emma** (18-25) : Novice curieuse
- **Laure** (26-40) : Professionnelle équilibrée  
- **Sylvie** (41-55) : Femme en transition
- **Christine** (55+) : Sage épanouie
- **Clara** (26-35) : Enthousiaste connectée

#### 📊 Format de sortie
```javascript
{
  assigned: 'clara',           // Persona assigné
  scores: {                    // Scores détaillés par persona
    emma: 23.5,
    laure: 67.2,
    clara: 89.1,
    // ...
  },
  confidence: 0.82,            // Confiance 0-1
  confidenceLevel: 'high',     // 'low', 'medium', 'high'
  timestamp: 1704067200000,
  metadata: {
    algorithm: 'v3_onboarding_corrected',
    dataMapping: { /* données mappées */ }
  }
}
```

#### 🧪 Tests
Utiliser `testPersonaMapping()` pour valider l'algorithme avec les profils Clara et Laure.

### `dateUtils.js`
Utilitaires pour la gestion des dates et calculs cycliques.

## 🔄 Workflow de développement

1. **Modification des personas** : Mettre à jour `config/personaProfiles.js`
2. **Test de l'algorithme** : Exécuter `testPersonaMapping()`
3. **Validation** : Vérifier via `components/DevNavigation/PersonaDebug.jsx`

## 📚 Documentation liée

- `config/personaProfiles.js` : Configuration des personas
- `docs/data/personas_valors.md` : Tableau de simulation
- `components/DevNavigation/PersonaDebug.jsx` : Interface de debug

## 🚀 Utilisation

```javascript
import { calculateAndAssignPersona } from '../services/PersonaEngine.js';

// Données onboarding complètes
const onboardingData = {
  journeyChoice: { selectedOption: 'body_disconnect' },
  userInfo: { ageRange: '26-35' },
  preferences: { symptoms: 2, moods: 5, phyto: 1, phases: 5, lithotherapy: 1, rituals: 2 },
  melune: { communicationTone: 'friendly' }
};

const result = calculateAndAssignPersona(onboardingData);
console.log(`Persona assigné: ${result.assigned} (${result.confidence * 100}% confiance)`);
``` 