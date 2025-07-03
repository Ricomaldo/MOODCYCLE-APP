# 🎭 Plan Refactorisation Personas V6.0

**Problème identifié**: Monolithe 290 lignes mixant data + algorithme + tests

## 🏗️ Architecture Cible

src/config/personas/
├── 📄 index.js                    # Hub exports
├── 👥 profiles/
│   ├── emma.js                    # Profil Emma isolé
│   ├── laure.js                   # Profil Laure isolé
│   ├── sylvie.js                  # Profil Sylvie isolé
│   ├── christine.js               # Profil Christine isolé
│   └── clara.js                   # Profil Clara isolé
├── ⚙️ scoring/
│   ├── weights.js                 # Poids algorithme
│   ├── modifiers.js               # Modificateurs
│   └── mappings.js                # Mapping onboarding
└── 🧪 simulation.js               # Données tests

## 📦 Modules Proposés

### profiles/emma.js

```javascript
export const EMMA_PROFILE = {
  id: "emma",
  name: "Emma",
  // Profil complet isolé
};
```

### scoring/weights.js

```javascript
export const SCORING_WEIGHTS = {
  JOURNEY_CHOICE: 0.25,
  // ...
};
```

## 🔄 Migration

### Avant

```javascript
import { PERSONA_PROFILES } from '@/config/personaProfiles';
```

### Après  

```javascript
import { getAllPersonas } from '@/config/personas';
```

## ✅ Bénéfices

- **Séparation**: Profils vs algorithme vs tests
- **Édition**: Facilité pour Jeza
- **Performance**: Imports ciblés par persona
- **Tests**: Simulation isolée
