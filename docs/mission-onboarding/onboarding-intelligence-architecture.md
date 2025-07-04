# Architecture Intelligence Onboarding MoodCycle

## 🎯 Objectif
Calcul progressif de persona tout au long de l'onboarding pour personnalisation immédiate et préparation expérience in-app.

## 📊 Flux de Données

### Collecte Progressive
```
Écran               | Données collectées      | Poids     | Confiance | Personnalisation
--------------------|------------------------|-----------|-----------|------------------
100-bienvenue       | ∅                      | -         | 0%        | ∅
200-bonjour         | ∅                      | -         | 0%        | ∅
250-rencontre       | journeyChoice          | 25%       | ~25%      | ❌ Trop faible
300-etape-vie       | + ageRange             | +15%      | ~40%      | ✅ Messages persona
400-prenom          | + prénom               | 0%        | 40%       | ✅ Preview relation
500-avatar          | + tone                 | +15%      | ~55%      | ✅ Suggestions style
600-terminology     | + terminology          | +10%      | ~65%      | ✅ Full adaptation
700-cycle           | + cycle data           | 0%        | 65%       | ✅ Messages cycle
800-preferences     | + 6 preferences        | +35%      | ~100%     | ✅ Pré-sélections
900-essai           | ∅                      | -         | 100%      | ✅ Arguments vente
950-demarrage       | ∅                      | -         | 100%      | ✅ Insight final
```

**Note :** La confiance exacte dépend des scores de matching. Les % indiqués sont approximatifs.

## 🔧 Modifications Requises

### Étape 0: PersonaEngine + Terminology
- Ajouter terminology comme facteur indépendant (10%)
- Ne PAS mapper terminology → communicationStyle
- Affinités terminology par persona :
  - emma : modern (1.0), energetic (0.9)
  - laure : energetic (1.0), medical (0.9)
  - clara : energetic (1.0), modern (0.9)
  - sylvie : spiritual (0.9), energetic (0.8)
  - christine : spiritual (1.0), energetic (0.8)

### Services à Modifier
1. **PersonaEngine.js**
   - Ajouter calculateTerminologyScore() indépendant
   - Terminology = 10% du score total
   - Affinités différentes par persona

2. **useOnboardingIntelligence.js**
   - Remplacer calculatePersonaSuggestion() simpliste
   - Implémenter calculateProgressivePersona()
   - Seuils: <40% = défaut, 40-60% = suggestion, 60%+ = confiance

3. **personaProfiles.js**
   - SCORING_WEIGHTS : 
     - JOURNEY_CHOICE: 25%
     - AGE_RANGE: 15%
     - PREFERENCES: 35%
     - COMMUNICATION: 15%
     - TERMINOLOGY: 10%
   - Ajouter coefficient terminology par persona

## 📝 Points de Personnalisation

### Écrans à Enrichir
- **250-rencontre**: 3 variantes journey
- **300-etape-vie**: 5 messages persona (si confiance ≥40%)
- **400-prenom**: Preview relation personnalisée
- **800-preferences**: Suggestions selon persona
- **900-essai**: Arguments déjà implémentés !
- **950-demarrage**: Insight déjà personnalisé !

### Écrans Sans Modification
- 100, 200: Trop tôt pour personnaliser
- 500, 600, 700: Collecte pure, pas de message

## 🎨 Intelligence Visible

### Badge Progression (OnboardingNavigation)
```javascript
{confidence >= 40 && (
  <Badge>
    <Icon name="sparkles" />
    {Math.round(confidence * 100)}% adapté
  </Badge>
)}
```

### Messages Subtils
- 40%: "Je commence à te connaître..."
- 60%: "Notre connexion se renforce..."
- 80%: "Je te comprends vraiment bien !"

## ⚡ Performance

- Calcul persona: <50ms par écran
- Cache résultats intermédiaires
- Pas de recalcul si données inchangées

## 🔒 Sécurité

- Personas = boîte noire algorithmique
- JAMAIS exposer "Tu es Emma/Clara"
- Adaptation naturelle non expliquée