# Système de Personnalisation IA - MoodCycle

## 🧠 Architecture des Données pour l'IA

Ce système permet à l'IA de générer des conseils personnalisés en combinant plusieurs sources de données JSON sans avoir besoin d'accéder aux fichiers volumineux directement.

### 🎯 Principe de Génération
```
Conseil Personnalisé = Context(phases) + Persona(insights) + Journey(closings) + Prenom(user)
```

## 📁 Structure des Fichiers de Données

### `phases.json` (15KB - 4 phases cycliques)
**Objectif** : Contenu de base et enrichissements contextuels par phase
**Structure** :
```json
{
  "phase_name": {
    "editableContent": {
      "description": "Description base de la phase",
      "advice": {
        "nutrition": ["conseil1", "conseil2"],
        "activities": ["activité1", "activité2"], 
        "selfcare": ["soin1", "soin2"],
        "avoid": ["éviter1", "éviter2"]
      },
      "rituals": ["rituel1", "rituel2"],
      "affirmation": "Affirmation inspirante"
    },
    "contextualEnrichments": [
      {
        "targetPersona": "emma|laure|clara|sylvie|christine",
        "targetPreferences": ["symptoms", "moods", "phyto", "phases", "lithotherapy", "rituals"],
        "targetJourney": "body_disconnect|hiding_nature|emotional_control",
        "tone": "friendly|professional|inspiring",
        "contextualText": "Texte enrichi selon contexte"
      }
    ]
  }
}
```

### `insights.json` (Production - 178 insights validés)
**Objectif** : Conseils personnalisés par phase/persona/préférences
**Structure actuelle** :
```json
{
  "id": "M_symptoms_friendly_01",
  "baseContent": "Conseil générique applicable à tous",
  "targetPreferences": ["symptoms", "moods"],
  "tone": "friendly|professional|inspiring", 
  "phase": "menstrual|follicular|ovulatory|luteal",
  "targetPersonas": ["emma", "laure"],
  "journeyChoice": "body_disconnect",
  "jezaApproval": 1,
  "status": "validated"
}
```

### `insights.future.json` (Développement - 13 insights avec variantes)
**Objectif** : Evolution vers personnalisation maximale par persona
**Structure cible** :
```json
{
  "id": "M_symptoms_friendly_01",
  "baseContent": "Conseil de base",
  "personaVariants": {
    "emma": "Version adaptée pour Emma (18-25 ans, découverte)",
    "laure": "Version adaptée pour Laure (26-35 ans, optimisation)",
    "clara": "Version adaptée pour Clara (26-35 ans, empowerment)",
    "sylvie": "Version adaptée pour Sylvie (36-45 ans, naturel)",
    "christine": "Version adaptée pour Christine (46+ ans, spirituel)"
  },
  "targetPersonas": ["emma", "laure", "clara", "sylvie", "christine"],
  "journeyChoice": "body_disconnect|hiding_nature|emotional_control"
}
```

### `closings.json` (1KB - 15 clôtures personnalisées)
**Objectif** : Conclusions adaptées par persona et journey
**Structure** :
```json
{
  "persona": {
    "journey_type": "Conclusion personnalisée pour cette combinaison"
  }
}
```

### `vignettes.json` (17KB - 60 actions contextuelles)
**Objectif** : Suggestions d'actions par phase/persona pour navigation IA
**Structure** :
```json
{
  "id": "phase_persona_number",
  "icon": "emoji",
  "title": "Action suggérée",
  "action": "chat|phase|notebook",
  "prompt": "Prompt pré-rempli pour Mélune",
  "category": "emotions|symptoms|energy"
}
```

## 🧠 Logique de Sélection IA

### Critères de Matching
- **Phase cyclique** : menstrual, follicular, ovulatory, luteal
- **Persona** : emma (18-25), laure (26-35), clara (26-35), sylvie (36-45), christine (46+)
- **Préférences** : symptoms, moods, phyto, phases, lithotherapy, rituals
- **Journey** : body_disconnect, hiding_nature, emotional_control
- **Tone** : friendly, professional, inspiring

### Algorithme de Sélection
1. **Filtrage par phase** : Sélectionner les insights de la phase actuelle
2. **Score persona** : Prioriser les insights ciblant la persona détectée
3. **Score préférences** : Pondérer selon les préférences utilisateur
4. **Score journey** : Bonus si correspond au parcours choisi
5. **Fallback** : Si aucun match optimal, utiliser baseContent générique

### Priorité de Génération
1. `insights.future.json` → `personaVariants[persona]` (optimal, futur)
2. `insights.json` → `baseContent` (actuel, fallback)
3. `phases.json` → `contextualEnrichments` pour enrichir le contexte

## 🎯 Patterns d'Utilisation IA

### Génération de Conseil Personnalisé
```javascript
function generatePersonalizedAdvice(user, currentPhase) {
  // 1. Sélectionner insights selon critères
  const insights = selectInsights(user.persona, user.preferences, currentPhase);
  
  // 2. Enrichir avec contexte phase
  const context = getPhaseContext(currentPhase, user.persona);
  
  // 3. Personnaliser avec prénom
  const personalizedContent = personalize(insights.content, user.prenom);
  
  // 4. Ajouter clôture adaptée
  const closing = getClosing(user.persona, user.journey);
  
  return `${context} ${personalizedContent} ${closing}`;
}
```

### Navigation Adaptative
```javascript
function getSuggestedActions(user, currentPhase) {
  // Filtrer vignettes par phase et persona
  return vignettes.filter(v => 
    v.phase === currentPhase && 
    v.targetPersona === user.persona
  ).slice(0, 3); // Top 3 suggestions
}
```

## 🔄 Évolution du Système

### État Actuel
- **insights.json** : 178 conseils validés avec `baseContent` générique
- **phases.json** : Structure `editableContent` prête pour admin
- **Sélection** : Algorithme de matching fonctionnel

### Évolution Cible
- **insights.future.json** : Variants par persona pour personnalisation maximale
- **API Admin** : Interface d'édition pour enrichissements contextuels
- **IA Avancée** : Génération dynamique selon profil complet

## 🎨 Personnalisation par Persona

### Emma (18-25 ans, Découverte)
- **Tone** : friendly, encouraging
- **Keywords** : découverte, apprentissage, première fois
- **Style** : Émojis, langage accessible

### Laure (26-35 ans, Optimisation)  
- **Tone** : professional, efficient
- **Keywords** : optimisation, performance, équilibre
- **Style** : Concis, orienté résultats

### Clara (26-35 ans, Empowerment)
- **Tone** : inspiring, energetic
- **Keywords** : pouvoir, confiance, révolution
- **Style** : Motivant, moderne

### Sylvie (36-45 ans, Naturel)
- **Tone** : gentle, holistic
- **Keywords** : nature, équilibre, sagesse
- **Style** : Apaisant, connecté

### Christine (46+ ans, Spirituel)
- **Tone** : wise, inspiring
- **Keywords** : sagesse, transformation, honneur
- **Style** : Respectueux, profond

## 📊 Métriques de Performance IA

### Scoring des Insights
- **Match exact persona** : +10 points
- **Match préférences** : +5 points par préférence
- **Match journey** : +3 points
- **Phase appropriée** : +15 points
- **Tone adapté** : +2 points

### Optimisation Sélection
- **Cache** : Résultats par (persona, phase, préférences)
- **Fallback** : Toujours garantir une réponse
- **Diversité** : Éviter répétition sur 7 jours

---

*Architecture données optimisée pour collaboration IA sans transfert de fichiers volumineux* 