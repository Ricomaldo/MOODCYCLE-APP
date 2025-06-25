# Système de Personnalisation IA - MoodCycle

## 🎯 Architecture des Données

### Génération de Conseils Personnalisés
```
Conseil = phases.contextualEnrichments + prénom + insight.personaVariants + closings.journey
```

## 📁 Fichiers Principaux

### `insights.json` (Production - **178 insights** validés)
- **Statut** : Contenu validé sans variantes persona
- **Structure** : `baseContent` uniquement
- **Usage** : Système actuel avec fallback générique

```json
{
  "id": "M_symptoms_friendly_01",
  "baseContent": "Tes crampes te parlent aujourd'hui ! 💕 Ton corps fait un travail incroyable. Essaie une bouillotte bien chaude et écoute ce qu'il te demande.",
  "targetPreferences": ["symptoms"],
  "tone": "friendly",
  "phase": "menstrual",
  "jezaApproval": 1,
  "status": "validated"
}
```

### `insights.future.json` (Développement - **13 insights** avec variantes)
- **Statut** : Édition des variantes dans l'interface admin
- **Structure** : `baseContent` + `personaVariants` par persona
- **Usage** : Système cible avec personnalisation maximale

```json
{
  "id": "M_symptoms_friendly_01",
  "baseContent": "Tes crampes te parlent aujourd'hui ! 💕 Ton corps fait un travail incroyable.",
  "personaVariants": {
    "emma": "Tes crampes te parlent aujourd'hui ! 💕 C'est normal, ton corps apprend à communiquer avec toi.",
    "laure": "Tes crampes signalent une phase importante de ton cycle. 💕 Optimise ta journée en t'accordant cette pause.",
    "sylvie": "Ces crampes sont un signal de ton corps en transition. 💕 Accueille-les avec bienveillance.",
    "christine": "Tes crampes portent la sagesse de tes cycles passés. 💕 Honore cette douleur sacrée.",
    "clara": "Tes crampes indiquent le processus physiologique actuel. 💕 Optimise ta récupération avec une thermothérapie."
  },
  "targetPersonas": ["emma", "laure", "sylvie", "christine", "clara"],
  "journeyChoice": "body_disconnect"
}
```

### `phases.json` (15KB - **20 enrichissements** contextuels)
- **Rôle** : Enrichissements contextuels par phase cyclique
- **Sélection** : persona + préférences + journey
- **Usage** : Préfixe contextuel des conseils

```json
{
  "id": "menstrual_emma_body_disconnect_01",
  "targetPersona": "emma",
  "targetPreferences": ["symptoms"],
  "targetJourney": "body_disconnect",
  "tone": "friendly",
  "contextualText": "Cette pause mensuelle t'invite à découvrir la sagesse de ton corps et à honorer tes besoins authentiques"
}
```

### `closings.json` (1KB - **5 personas × 3 journeys = 15** clôtures)
- **Rôle** : Conclusions personnalisées par persona et journey
- **Structure** : `persona → journey → texte_clôture`
- **Usage** : Suffixe des conseils générés

```json
{
  "emma": {
    "body": "Je t'accompagne dans cette reconnexion avec ton corps",
    "nature": "Je t'aide à célébrer ta nature cyclique authentique", 
    "emotions": "Je te guide vers une relation apaisée avec tes émotions"
  }
}
```

### `vignettes.json` (17KB - **60 vignettes** d'actions)
- **Rôle** : Navigation personnalisée par IA
- **Structure** : Suggestions d'actions par phase/persona
- **Usage** : Interface adaptative selon profil utilisateur

```json
{
  "id": "menstrual_emma_1",
  "icon": "💭",
  "title": "Explore tes ressentis",
  "action": "chat",
  "prompt": "Melune, comment mieux honorer mon besoin de repos aujourd'hui ? 🌙",
  "category": "emotions"
}
```

## 🧠 Logique de Sélection IA

### Critères de Matching
- **Phase** : menstrual, follicular, ovulatory, luteal
- **Persona** : emma, laure, sylvie, christine, clara
- **Préférences** : symptoms, moods, phyto, phases, lithotherapy, rituals
- **Journey** : body_disconnect, hiding_nature, emotional_control
- **Tone** : friendly, professional, inspiring

### Priorité de Génération
1. `insights.future.json` → `personaVariants[persona]` (optimal)
2. `insights.json` → `baseContent` (fallback actuel)
3. Sélection par score de correspondance des critères

## 🔄 État de Migration

**Aujourd'hui (25 juin)** :
- ✅ **178 insights** validés dans `insights.json`
- 🔄 **13 insights** avec variantes dans `insights.future.json`
- 🎯 Édition des 165 variantes restantes en cours via interface admin

## 🚀 Système Cible

```javascript
// Génération optimale future
const conseil = {
  contexte: phases[phase].contextualEnrichments[persona][preferences][journey],
  prenom: user.prenom,
  contenu: insights.future[phase].personaVariants[persona], // au lieu de baseContent
  cloture: closings[persona][journey]
}
```

## 📊 Intelligence Adaptative

Les **60 vignettes** permettent à l'IA de proposer des actions contextuelles :
- Suggestions de chat avec prompts pré-remplis
- Navigation vers phases détaillées
- Ouverture du carnet avec questions ciblées
- Adaptation selon persona et phase cyclique (4 phases × 5 personas × 3 actions)

---
*README orienté IA - Structure de données pour personnalisation maximale* 