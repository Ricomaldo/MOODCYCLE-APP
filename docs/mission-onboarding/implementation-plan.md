# Plan d'Implémentation - Calcul Progressif Persona

## 📋 Check-list Pré-Implémentation

- [ ] Vérifier que `profile.terminology` existe dans useUserStore
- [ ] Confirmer que 600-terminology.jsx sauvegarde la terminology
- [ ] S'assurer que tous les fichiers onboarding importent useOnboardingIntelligence

## 📊 Tableau de Progression Confidence

| Écran | Données Collectées | Confidence | Adaptation Possible |
|-------|-------------------|------------|-------------------|
| 100-bienvenue | ∅ | 0% | ❌ Aucune |
| 200-bonjour | ∅ | 0% | ❌ Aucune |
| 250-rencontre | journeyChoice | 25% | ❌ Trop faible |
| 300-etape-vie | +ageRange | **40%** | ✅ Messages persona |
| 400-prenom | (inchangé) | 40% | ✅ Preview relation |
| 500-avatar | +melune config | 45% | ✅ Suggestions style |
| 600-terminology | +terminology | **65%** | ✅ Full adaptation |
| 700-cycle | (inchangé) | 65% | ✅ Messages cycle |
| 800-preferences | +preferences | **100%** | ✅ Pré-sélections |
| 900-essai | (inchangé) | 100% | ✅ Arguments vente |
| 950-demarrage | (inchangé) | 100% | ✅ Insight final |

## 🔧 Modifications Détaillées par Fichier

### 1. src/config/personaProfiles.js
```javascript
// MODIFIER les poids (ligne ~340)
export const SCORING_WEIGHTS = {
  JOURNEY_CHOICE: 0.25,   // 25%
  AGE_RANGE: 0.15,        // 15%
  PREFERENCES: 0.35,      // 35% (était 40%)
  COMMUNICATION: 0.15,    // 15% (était 20%)
  TERMINOLOGY: 0.10       // 10% NOUVEAU
};

// AJOUTER coefficient terminology pour chaque persona
// Exemple pour emma (ligne ~50):
coefficients: {
  journey: 1.0, 
  age: 1.2, 
  preferences: 1.1, 
  communication: 1.0,
  terminology: 1.05  // AJOUTER
}
```

### 2. src/services/PersonaEngine.js
**Remplacer ENTIÈREMENT** par la version dans l'artefact

### 3. src/config/onboardingMessages.js
**Créer NOUVEAU FICHIER** avec contenu de l'artefact

### 4. src/hooks/useOnboardingIntelligence.js
**Remplacer ENTIÈREMENT** par la version dans l'artefact

### 5. app/onboarding/600-terminology.jsx
```javascript
// AJOUTER ligne ~95 dans handleContinue()
const handleContinue = () => {
  updateProfile({ terminology: selectedTerminology }); // ← AJOUTER
  intelligence.trackAction('terminology_confirmed', {
    finalTerminology: selectedTerminology
  });
  // ... reste inchangé
};
```

### 6. app/onboarding/300-etape-vie.jsx
```javascript
// REMPLACER le message (ligne ~120)
const intelligence = useOnboardingIntelligence('300-etape-vie');

// Dans le JSX, remplacer :
<BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
  {intelligence.personaConfidence >= 0.4 
    ? intelligence.getPersonalizedMessage('message')
    : "Chaque étape de la vie d'une femme porte sa propre magie... Dis-moi où tu en es de ton voyage"}
</BodyText>
```

### 7. app/onboarding/400-prenom.jsx
```javascript
// MODIFIER generatePersonalizedPreview (ligne ~85)
const generatePersonalizedPreview = () => {
  if (intelligence.personaConfidence >= 0.4) {
    return intelligence.getPersonalizedMessage('preview', { prenom });
  }
  // Fallback existant
  return `${prenom} ! Je suis trop contente de faire ta connaissance ! 💖`;
};
```

### 8. app/onboarding/800-preferences.jsx
```javascript
// AJOUTER après le useState (ligne ~45)
useEffect(() => {
  // Pré-sélections intelligentes selon persona
  if (intelligence.currentPersona && intelligence.personaConfidence >= 0.6) {
    const preselections = {
      emma: { moods: 3, phases: 3 },
      laure: { moods: 3, phases: 5, rituals: 3 },
      clara: { symptoms: 3, moods: 3, phases: 5 },
      sylvie: { symptoms: 3, phyto: 3 },
      christine: { phases: 3, lithotherapy: 3, rituals: 3 }
    };
    
    const suggestions = preselections[intelligence.currentPersona];
    if (suggestions) {
      setCurrentPreferences(prev => ({
        ...prev,
        ...Object.entries(suggestions).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: prev[key] || value
        }), {})
      }));
    }
  }
}, [intelligence.currentPersona]);

// MODIFIER le message principal
<BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
  {intelligence.personaConfidence >= 0.6
    ? intelligence.getPersonalizedMessage('message')
    : "Chaque femme a sa propre sagesse... Dis-moi ce qui résonne en toi"}
</BodyText>
```

## ⚠️ Points de Vérification CRITIQUES

1. **600-terminology DOIT sauvegarder** : `updateProfile({ terminology })`
2. **useUserStore DOIT persister** : `profile.terminology`
3. **Toujours un fallback** : Message par défaut si pas de persona
4. **Jamais exposer** : "Tu es Emma" ou nom de persona dans UI

## 🧪 Tests de Validation

### Test 1: Emma Path
- 250: body_disconnect
- 300: 18-25 → Vérifier message "magie unique"
- 600: modern
- 800: Vérifier moods+phases pré-sélectionnés

### Test 2: Christine Path  
- 250: hiding_nature
- 300: 55+ → Vérifier message "sagesse"
- 600: spiritual
- 800: Vérifier lithotherapy+rituals pré-sélectionnés

### Console Logs Debug
```javascript
// Ajouter temporairement dans useOnboardingIntelligence
console.log(`🎯 ${screenName}: Persona=${currentPersona} Conf=${Math.round(personaConfidence*100)}%`);
```

## 📊 Résultat Attendu

L'utilisatrice doit sentir que l'app s'adapte naturellement sans jamais voir l'algorithme. Messages, suggestions et pré-sélections évoluent subtilement selon ses choix.

---

**Temps total: 1h30**  
**Ordre strict: Backend → Hook → UI**  
**Principe: Adaptation invisible mais perceptible**