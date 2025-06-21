# Structure des Données - Génération de Conseils Personnalisés

## Vue d'ensemble

L'app génère des conseils personnalisés en combinant plusieurs sources de données selon cette formule :

```
Conseil = phases.contextualEnrichments + prénom + insights + closings
```

## Fichiers de Données

### 1. `phases.json`
**Structure des phases du cycle menstruel**

```json
{
  "menstrual": {
    "contextualEnrichments": [
      {
        "targetPersona": "emma",
        "targetPreferences": ["symptoms"],
        "targetJourney": "body_disconnect",
        "contextualText": "Texte contextuel personnalisé..."
      }
    ]
  }
}
```

### 2. `insights.json` (Nouvelle Structure)
**Contenu personnalisé par persona avec variantes**

```json
{
  "menstrual": [
    {
      "id": "M_symptoms_friendly_01",
      "baseContent": "Contenu générique de base...",
      "personaVariants": {
        "emma": "Variante personnalisée pour Emma",
        "laure": "Variante personnalisée pour Laure",
        "sylvie": "Variante personnalisée pour Sylvie",
        "christine": "Variante personnalisée pour Christine",
        "clara": "Variante personnalisée pour Clara"
      },
      "targetPersonas": ["emma", "laure", "sylvie", "christine", "clara"],
      "targetPreferences": ["symptoms"],
      "tone": "friendly",
      "phase": "menstrual",
      "journeyChoice": "body_disconnect"
    }
  ]
}
```

**Nouveaux champs :**
- `personaVariants` : Variantes personnalisées pour chaque persona
- `targetPersonas` : Liste des personas ciblés par ce conseil
- `journeyChoice` : Journey spécifique associé au conseil

### 3. `closings.json`
**Formules de conclusion personnalisées par persona et journey**

```json
{
  "emma": {
    "body": "Je t'accompagne dans cette reconnexion avec ton corps",
    "nature": "Je t'aide à célébrer ta nature cyclique authentique",
    "emotions": "Je te guide vers une relation apaisée avec tes émotions"
  }
}
```

## Processus de Génération (Mis à jour)

1. **Sélection contextuelle** : `phases.contextualEnrichments` selon persona + préférences + journey
2. **Prénom** : Récupéré depuis les stores utilisateur
3. **Contenu principal** : 
   - `insights.personaVariants[persona]` (priorité - variante personnalisée)
   - OU `insights.baseContent` (fallback - contenu générique)
4. **Clôture** : `closings[persona][journey]` selon le journey choisi

## Logique de Sélection des Insights

### Critères de correspondance :
- **Phase** : menstrual, follicular, ovulatory, luteal
- **Préférences** : symptoms, moods, phyto, phases, lithotherapy, rituals
- **Tone** : friendly, professional, inspiring
- **Persona** : emma, laure, sylvie, christine, clara
- **Journey** : body_disconnect, hiding_nature, emotional_control

### Priorité de sélection :
1. Insight avec `personaVariants[persona]` disponible
2. Insight avec `targetPersonas` incluant le persona
3. Insight avec `baseContent` générique

## Données de Personnalisation

Les stores contiennent :
- **Persona** : emma, laure, sylvie, christine, clara
- **Préférences** : symptoms, moods, phyto, phases, lithotherapy, rituals
- **Journey** : body_disconnect, hiding_nature, emotional_control
- **Tone** : friendly, professional, inspiring
- **Prénom** : Nom de l'utilisatrice

## Mapping Journey

Les journeys dans `insights.future.json` correspondent aux clés dans `closings.json` :
- `body_disconnect` → `body`
- `hiding_nature` → `nature`
- `emotional_control` → `emotions`

## Exemple de Génération (Nouveau)

```
Contexte: phases.menstrual.contextualEnrichments[emma][symptoms][body_disconnect]
+ Prénom: "Emma"
+ Contenu: insights.menstrual[M_symptoms_friendly_01].personaVariants.emma
+ Clôture: closings.emma.body
= Conseil personnalisé complet avec variante Emma
```

## Avantages de la Nouvelle Structure

- **Personnalisation maximale** : Chaque persona a sa propre variante
- **Fallback sécurisé** : `baseContent` si pas de variante disponible
- **Ciblage précis** : `targetPersonas` pour optimiser la sélection
- **Cohérence journey** : `journeyChoice` pour aligner avec le parcours utilisateur 