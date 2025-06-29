# Système de Personnalisation IA - MoodCycle

## 🚨 **MISSION CAPITALE - UPGRADE PHASES.JSON**

### ⚠️ **ALERTE CRITIQUE - API ADMIN À METTRE À JOUR**

**Date** : 26 juin 2025  
**Priorité** : CRITIQUE  
**Impact** : Système de personnalisation IA  

### 🔄 **Changements Majeurs dans phases.json**

#### **Nouvelle Structure `editableContent`**
```json
{
  "editableContent": {
    "description": "Contenu enrichi et personnalisé",
    "advice": {
      "nutrition": [...],
      "activities": [...], 
      "selfcare": [...],
      "avoid": [...]
    },
    "rituals": [...],
    "affirmation": "..."
  }
}
```

#### **Enrichissements Contextuels Réduits**
- **AVANT** : 5 enrichissements par phase (20 total)
- **MAINTENANT** : 1 enrichissement par phase (4 total)
- **MISSING** : 16 enrichissements à recréer via API admin

### 🎯 **Actions Requises - API Admin**

#### **1. Migration Structure**
```javascript
// Ancien format → Nouveau format
const oldPhase = {
  description: "...",
  advice: {...},
  rituals: [...],
  affirmation: "..."
};

const newPhase = {
  editableContent: {
    description: oldPhase.description,
    advice: oldPhase.advice,
    rituals: oldPhase.rituals,
    affirmation: oldPhase.affirmation
  }
};
```

#### **2. Recréation Enrichissements Contextuels**
- **16 enrichissements manquants** à recréer
- **Structure cible** : 5 personas × 4 phases = 20 enrichissements
- **Format** : `{targetPersona, targetPreferences, targetJourney, tone, contextualText}`

#### **3. Validation Contenu**
- ✅ **4 phases** avec `editableContent` complet
- ❌ **16 enrichissements** à recréer
- ❌ **API admin** à adapter à la nouvelle structure

### 📊 **État de Migration**

| Élément | Status | Actions |
|---------|--------|---------|
| `editableContent` | ✅ **COMPLET** | 4 phases migrées |
| `contextualEnrichments` | ❌ **INCOMPLET** | 16/20 manquants |
| API Admin | ❌ **À METTRE À JOUR** | Structure + Contenu |
| Tests | ❌ **À ADAPTER** | Nouvelle structure |

---

## 🎯 Architecture des Données

### Génération de Conseils Personnalisés
```
Conseil = phases.contextualEnrichments + prénom + insight.personaVariants + closings.journey
```

## 📁 Fichiers Principaux

### `phases.json` (15KB - **4 phases avec editableContent**)
- **Statut** : ✅ Structure migrée, ❌ Enrichissements incomplets
- **Nouveauté** : Structure `editableContent` pour API admin
- **Manquant** : 16 enrichissements contextuels (5 personas × 4 phases - 4 existants)

```json
{
  "menstrual": {
    "editableContent": {
      "description": "Temps de renouvellement profond...",
      "advice": {
        "nutrition": [...],
        "activities": [...],
        "selfcare": [...],
        "avoid": [...]
      },
      "rituals": [...],
      "affirmation": "..."
    },
    "contextualEnrichments": [
      // ❌ SEULEMENT 1/5 enrichissements présents
    ]
  }
}
```

### `phases.backup.json` (15KB - **Ancienne structure complète**)
- **Statut** : Sauvegarde de l'ancienne structure
- **Contient** : 20 enrichissements contextuels complets
- **Usage** : Référence pour recréer les enrichissements manquants

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

**Aujourd'hui (26 juin)** :
- ✅ **178 insights** validés dans `insights.json`
- ✅ **4 phases** avec `editableContent` complet dans `phases.json`
- ❌ **16 enrichissements contextuels** manquants dans `phases.json`
- 🔄 **13 insights** avec variantes dans `insights.future.json`
- 🎯 **MISSION CAPITALE** : API admin à mettre à jour pour nouvelle structure

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