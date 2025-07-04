# 🎨 Guide Complet de l'Onboarding MoodCycle V2.0
> Documentation technique sur l'architecture intelligente et les standards de l'onboarding

## 📚 Vue d'ensemble

L'onboarding de MoodCycle utilise une **architecture intelligente progressive** qui s'adapte en temps réel aux choix de l'utilisatrice pour créer une expérience personnalisée invisible mais perceptible. Le système détecte progressivement la persona de l'utilisatrice (confiance 0% → 100%) et adapte les messages, suggestions et pré-sélections en conséquence.

### 🗂 Structure des fichiers

```
app/onboarding/
├── _layout.jsx               # Layout commun onboarding
├── 100-bienvenue.jsx        # Accueil initial
├── 200-bonjour.jsx         # Premier contact
├── 250-rencontre.jsx       # ✨ Choix journey + messages adaptatifs
├── 300-etape-vie.jsx       # ✨ Âge + encouragement personnalisé (40% confiance)
├── 400-prenom.jsx          # ✨ Relation + question/preview/confirmation (40% confiance)
├── 500-avatar.jsx          # ✨ Avatar + suggestions style (45% confiance)
├── 600-terminology.jsx     # ✨ Terminologie + sync persona (facteur 10%)
├── 700-cycle.jsx          # ✨ Cycle + encouragement post-config (65% confiance)
├── 800-preferences.jsx    # ✨ Préférences + pré-sélections automatiques (80% confiance)
├── 900-essai.jsx         # Choix version
└── 950-demarrage.jsx     # Finalisation

src/config/
├── onboardingMessages.js    # 🧠 Messages personnalisés par persona
├── personaProfiles.js      # 🧠 Profils + scoring weights + terminology
└── terminologyMappings.js  # Mapping terminologies

src/services/
├── PersonaEngine.js        # 🧠 Calcul progressif persona + terminology
└── ...

src/hooks/
├── useOnboardingIntelligence.js  # 🧠 Hook intelligence progressive
└── ...
```

## 🧠 Architecture Intelligence

### 🎯 Système de Persona Progressive

L'onboarding détecte progressivement 5 personas principales :

```jsx
const PERSONAS = {
  emma: {     // 18-25 ans, découverte corps
    tone: 'friendly',
    terminology: 'modern',
    style: 'modern'
  },
  laure: {    // 26-35 ans, optimisation bien-être
    tone: 'professional', 
    terminology: 'medical',
    style: 'modern'
  },
  clara: {    // 26-35 ans, empowerment
    tone: 'inspiring',
    terminology: 'energetic',
    style: 'mystique'
  },
  sylvie: {   // 36-45 ans, équilibre naturel
    tone: 'friendly',
    terminology: 'spiritual',
    style: 'classic'
  },
  christine: { // 46+ ans, sagesse spirituelle
    tone: 'inspiring',
    terminology: 'spiritual',
    style: 'mystique'
  }
}
```

### 📊 Facteurs de Scoring

```jsx
const SCORING_WEIGHTS = {
  JOURNEY_CHOICE: 0.25,    // Choix initial (250-rencontre)
  AGE_RANGE: 0.15,        // Tranche d'âge (300-etape-vie)
  PREFERENCES: 0.35,      // Préférences thérapeutiques (800-preferences)
  COMMUNICATION: 0.15,    // Style de communication (500-avatar)
  TERMINOLOGY: 0.10       # 🆕 Facteur terminologie (600-terminology)
}
```

### 🔄 Progression de Confiance

```
0-25%   : Messages par défaut
25-40%  : Détection journey + âge
40-60%  : 🎯 Activation messages personnalisés
60-80%  : 🎯 Suggestions intelligentes
80-100% : 🎯 Pré-sélections automatiques
```

## 🎭 Standards & Composants

### 📝 Typographie Intelligente
```jsx
// Messages adaptatifs selon persona
const getPersonalizedMessage = (screen, persona, key, data = {}) => {
  // Récupère le message personnalisé selon la persona détectée
  return intelligence.getPersonalizedMessage(key, data);
}

// Polices standardisées
const FONTS = {
  heading: 'Quintessential',  // Titres élégants, voix de Mélune
  body: 'Questrial',         // Corps de texte, interface moderne
}
```

### 🧠 Hook Intelligence
Chaque écran utilise le hook d'intelligence progressive :

```jsx
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';

export default function MonEcranOnboarding() {
  const intelligence = useOnboardingIntelligence('screen-id');
  
  return (
    <OnboardingScreen currentScreen="screen-id">
      <BodyText style={styles.message}>
        {intelligence.personaConfidence >= 0.4 
          ? intelligence.getPersonalizedMessage('message')
          : "Message par défaut"}
      </BodyText>
    </OnboardingScreen>
  );
}
```

### 🎯 Messages Personnalisés

#### Structure des Messages
```jsx
// src/config/onboardingMessages.js
export const ONBOARDING_MESSAGES = {
  '300-etape-vie': {
    emma: {
      message: "Chaque étape de la vie a sa propre magie unique...",
      encouragement: "C'est excitant de découvrir tout ça ensemble !"
    },
    laure: {
      message: "Chaque phase de vie apporte ses défis et opportunités...",
      encouragement: "Excellente étape pour optimiser ton bien-être."
    },
    // ... autres personas
  }
}
```

#### Utilisation dans les Écrans
```jsx
// Message principal adaptatif
<BodyText style={styles.message}>
  {intelligence.personaConfidence >= 0.4 
    ? intelligence.getPersonalizedMessage('message')
    : "Message par défaut"}
</BodyText>

// Messages conditionnels avec données
<BodyText style={styles.preview}>
  {intelligence.getPersonalizedMessage('preview', { prenom: 'Sophie' })}
</BodyText>

// Encouragements post-action
{showEncouragement && intelligence.personaConfidence >= 0.4 && (
  <BodyText style={styles.encouragement}>
    {intelligence.getPersonalizedMessage('encouragement')}
  </BodyText>
)}
```

### 🎨 Pré-sélections Intelligentes

```jsx
// Exemple 800-preferences.jsx
useEffect(() => {
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
      setCurrentPreferences(prev => ({ ...prev, ...suggestions }));
    }
  }
}, [intelligence.currentPersona, intelligence.personaConfidence]);
```

### 🔄 Feedback Adaptatif

```jsx
// Feedback selon nombre de sélections ET persona
{intelligence.personaConfidence >= 0.6 && (
  <BodyText style={styles.feedbackText}>
    {intelligence.getPersonalizedMessage(
      selectedCount === 0 ? 'zero_selected' :
      selectedCount >= 4 ? 'many_selected' :
      'some_selected'
    )}
  </BodyText>
)}
```

## ⚡ Animations Intelligentes

### AnimatedRevealMessage avec Intelligence
```jsx
<AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
  <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
    {intelligence.personaConfidence >= 0.4 
      ? intelligence.getPersonalizedMessage('message')
      : "Message par défaut"}
  </BodyText>
</AnimatedRevealMessage>

// Encouragement conditionnel avec animation
{showEncouragement && intelligence.personaConfidence >= 0.4 && (
  <Animated.View style={{
    opacity: fadeAnim,
    marginTop: theme.spacing.xl
  }}>
    <BodyText style={styles.encouragementText}>
      {intelligence.getPersonalizedMessage('encouragement')}
    </BodyText>
  </Animated.View>
)}
```

### Suggestions Visuelles Intelligentes
```jsx
// Exemple 500-avatar.jsx - Suggestion de style
{category === 'style' && option.id === getRecommendedStyle() && intelligence.personaConfidence >= 0.4 && (
  <BodyText style={styles.styleHint}>
    {intelligence.getPersonalizedMessage('style_hint')}
  </BodyText>
)}

const getRecommendedStyle = () => {
  const recommendations = {
    emma: 'modern',
    laure: 'modern',
    clara: 'mystique',
    sylvie: 'classic',
    christine: 'mystique'
  };
  return recommendations[intelligence.currentPersona] || 'modern';
};
```

## 🎯 Patterns par Écran

### 250-rencontre.jsx - Messages Journey
```jsx
// Messages adaptatifs selon choix journey
<BodyText style={styles.message}>
  {selectedChoice 
    ? intelligence.getPersonalizedMessage('journey', { journeyChoice: selectedChoice }) 
    : "Message par défaut"}
</BodyText>
```

### 300-etape-vie.jsx - Encouragement Post-Sélection
```jsx
// État pour encouragement
const [showEncouragement, setShowEncouragement] = useState(false);

// Déclenchement après sélection
const handleAgeSelect = (ageRange) => {
  setSelectedAge(ageRange.id);
  updateProfile({ ageRange: ageRange.id });
  
  if (intelligence.personaConfidence >= 0.4) {
    setShowEncouragement(true);
  }
};

// Affichage conditionnel
{showEncouragement && selectedAge && intelligence.personaConfidence >= 0.4 && (
  <AnimatedRevealMessage delay={300}>
    <BodyText style={styles.encouragementText}>
      {intelligence.getPersonalizedMessage('encouragement')}
    </BodyText>
  </AnimatedRevealMessage>
)}
```

### 400-prenom.jsx - Messages Multiples
```jsx
// Question personnalisée
<BodyText style={styles.meluneMessage}>
  {intelligence.personaConfidence >= 0.4 
    ? intelligence.getPersonalizedMessage('question')
    : "Comment aimerais-tu que je t'appelle ?"}
</BodyText>

// Preview dynamique
const generatePersonalizedPreview = () => {
  if (!prenom.trim()) return null;
  
  if (intelligence.personaConfidence >= 0.4) {
    return intelligence.getPersonalizedMessage('preview', { prenom: prenom.trim() });
  }
  
  return `${prenom.trim()} ! Je suis trop contente de faire ta connaissance ! 💖`;
};

// Confirmation post-validation
if (intelligence.personaConfidence >= 0.4) {
  const confirmation = intelligence.getPersonalizedMessage('confirmation', { prenom: trimmedPrenom });
}
```

### 500-avatar.jsx - Suggestions Style
```jsx
// Pré-sélections par défaut selon persona
const getPersonalizedDefaults = () => {
  if (intelligence.personaConfidence >= 0.4) {
    const suggestions = {
      emma: { style: 'modern', tone: 'friendly' },
      laure: { style: 'modern', tone: 'professional' },
      clara: { style: 'mystique', tone: 'inspiring' },
      sylvie: { style: 'classic', tone: 'friendly' },
      christine: { style: 'mystique', tone: 'inspiring' }
    };
    return suggestions[intelligence.currentPersona] || { style: 'classic', tone: 'friendly' };
  }
  return { style: 'classic', tone: 'friendly' };
};
```

### 700-cycle.jsx - Encouragement Post-Configuration
```jsx
// Délai adaptatif selon persona
const handleContinue = () => {
  // ... logique sauvegarde ...
  
  if (intelligence.personaConfidence >= 0.4) {
    setShowEncouragement(true);
    setTimeout(() => {
      router.push('/onboarding/800-preferences');
    }, ANIMATION_DURATIONS.elegant + 500); // Délai augmenté pour lecture
  } else {
    setTimeout(() => {
      router.push('/onboarding/800-preferences');
    }, ANIMATION_DURATIONS.elegant);
  }
};
```

### 800-preferences.jsx - Pré-sélections + Feedback
```jsx
// Computed value pour feedback
const selectedCount = Object.values(currentPreferences).filter(v => v > 0).length;

// Pré-sélections automatiques
useEffect(() => {
  if (intelligence.currentPersona && intelligence.personaConfidence >= 0.6 && Object.values(currentPreferences).every(v => v === 0)) {
    const preselections = {
      emma: { moods: 3, phases: 3 },
      laure: { moods: 3, phases: 5, rituals: 3 },
      clara: { symptoms: 3, moods: 3, phases: 5 },
      sylvie: { symptoms: 3, phyto: 3 },
      christine: { phases: 3, lithotherapy: 3, rituals: 3 }
    };
    
    const suggestions = preselections[intelligence.currentPersona];
    if (suggestions) {
      setCurrentPreferences(prev => ({ ...prev, ...suggestions }));
    }
  }
}, [intelligence.currentPersona, intelligence.personaConfidence]);

// Feedback adaptatif
{intelligence.personaConfidence >= 0.6 && (
  <BodyText style={styles.feedbackText}>
    {intelligence.getPersonalizedMessage(
      selectedCount === 0 ? 'zero_selected' :
      selectedCount >= 4 ? 'many_selected' :
      'some_selected'
    )}
  </BodyText>
)}
```

## 🎨 Styles Intelligents

### Styles pour Messages Personnalisés
```jsx
const intelligentStyles = (theme) => ({
  // Messages encouragement
  encouragementContainer: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
    alignItems: 'center',
  },

  encouragementText: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Feedback adaptatif
  feedbackContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.l,
    alignItems: 'center',
  },

  feedbackText: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Hints personnalisés
  styleHint: {
    fontSize: 12,
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
});
```

## ⚙️ Configuration Intelligence

### Cache Performance
```jsx
// Cache personas pour éviter recalculs
let personaCache = {
  data: null,
  result: null,
  timestamp: 0
};

// TTL de 5 secondes pour optimisation
const CACHE_TTL = 5000;
```

### Seuils d'Activation
```jsx
const CONFIDENCE_THRESHOLDS = {
  BASIC_PERSONALIZATION: 0.4,  // Messages personnalisés
  SMART_SUGGESTIONS: 0.6,      // Suggestions intelligentes
  AUTO_PRESELECTIONS: 0.8      // Pré-sélections automatiques
};
```

### Tracking Enrichi
```jsx
// Tracking avec contexte persona
intelligence.trackAction('preference_selected', {
  preference: 'moods',
  value: 3,
  persona: intelligence.currentPersona,
  confidence: intelligence.personaConfidence,
  screen: '800-preferences'
});
```

## 🔄 Cycle de Développement Intelligence

### 1. Ajout Nouveau Message Personnalisé
```jsx
// 1. Ajouter dans onboardingMessages.js
'nouveau-screen': {
  emma: { message: "Message pour Emma" },
  laure: { message: "Message pour Laure" },
  // ... autres personas
}

// 2. Utiliser dans l'écran
{intelligence.personaConfidence >= SEUIL && (
  <BodyText>{intelligence.getPersonalizedMessage('message')}</BodyText>
)}

// 3. Ajouter styles si nécessaire
personalizedMessage: {
  fontSize: 16,
  color: theme.colors.primary,
  fontStyle: 'italic',
}
```

### 2. Tests Intelligence
```jsx
// Tests de progression persona
test('Emma: 18-25 + body_disconnect', () => {
  const result = calculatePersona({
    profile: { 
      journeyChoice: 'body_disconnect',
      ageRange: '18-25'
    }
  });
  expect(result.assigned).toBe('emma');
});

// Tests messages personnalisés
test('Message Emma spécifique', () => {
  const message = getOnboardingMessage('300-etape-vie', 'emma', 'message');
  expect(message).toContain('magie unique');
});
```

## 🛠 Debugging Intelligence

### Logs de Debug (à retirer en production)
```jsx
// Dans useOnboardingIntelligence.js
// console.log(`🎯 ${screenName}: Persona=${personaResult.assigned || 'none'} Conf=${Math.round(personaResult.confidence*100)}%`);
// if (personaResult.scores) {
//   console.log(`📊 Scores:`, Object.entries(personaResult.scores).map(([p, s]) => `${p}=${Math.round(s*100)}%`).join(', '));
// }
```

### Validation Progression
```jsx
// Vérifier que la progression suit la logique attendue
useEffect(() => {
  console.log(`Intelligence: ${intelligence.currentPersona} (${Math.round(intelligence.personaConfidence * 100)}%)`);
}, [intelligence.currentPersona, intelligence.personaConfidence]);
```

## 🎯 Bonnes Pratiques Intelligence

### 1. **Messages Adaptatifs**
- Toujours fournir un fallback par défaut
- Utiliser les seuils de confiance appropriés
- Tester tous les cas de personas

### 2. **Performance**
- Utiliser le cache pour éviter recalculs
- Limiter les appels à getPersonalizedMessage
- Optimiser les conditions de re-render

### 3. **UX Invisible**
- Ne jamais exposer l'algorithme de détection
- Rendre l'adaptation naturelle et fluide
- Éviter les changements brusques de messages

### 4. **Maintenance**
- Documenter tous les seuils et conditions
- Maintenir les tests de progression
- Commenter les logs de debug

### 5. **Extensibilité**
- Architecture modulaire pour nouveaux écrans
- Messages facilement configurables
- Personas extensibles pour nouveaux profils

## 📝 Exemple Complet Écran Intelligent

```jsx
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';

export default function MonEcranIntelligent() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const intelligence = useOnboardingIntelligence('mon-ecran');
  
  // États pour feedback adaptatif
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [userChoice, setUserChoice] = useState(null);

  const handleChoice = (choice) => {
    setUserChoice(choice);
    
    // Déclencher encouragement si persona disponible
    if (intelligence.personaConfidence >= 0.4) {
      setShowEncouragement(true);
    }
    
    // Tracking enrichi
    intelligence.trackAction('choice_made', {
      choice,
      persona: intelligence.currentPersona,
      confidence: intelligence.personaConfidence
    });
  };

  return (
    <OnboardingScreen currentScreen="mon-ecran">
      <AnimatedOnboardingScreen>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          
          {/* Message principal adaptatif */}
          <View style={styles.messageSection}>
            <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
              <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                {intelligence.personaConfidence >= 0.4 
                  ? intelligence.getPersonalizedMessage('message')
                  : "Message par défaut"}
              </BodyText>
            </AnimatedRevealMessage>
          </View>

          {/* Contenu principal avec choix */}
          <View style={styles.mainSection}>
            {/* Choix avec suggestion intelligente si applicable */}
            {choices.map((choice, index) => (
              <TouchableOpacity
                key={choice.id}
                style={[
                  styles.choiceCard,
                  userChoice === choice.id && styles.choiceCardSelected,
                  // Suggestion visuelle si recommendation persona
                  choice.id === getRecommendedChoice() && intelligence.personaConfidence >= 0.6 && styles.recommendedChoice
                ]}
                onPress={() => handleChoice(choice.id)}
              >
                <BodyText style={styles.choiceTitle}>{choice.title}</BodyText>
                
                {/* Hint personnalisé pour choix recommandé */}
                {choice.id === getRecommendedChoice() && intelligence.personaConfidence >= 0.6 && (
                  <BodyText style={styles.recommendationHint}>
                    {intelligence.getPersonalizedMessage('recommendation_hint')}
                  </BodyText>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Encouragement post-sélection */}
          {showEncouragement && userChoice && intelligence.personaConfidence >= 0.4 && (
            <Animated.View style={styles.encouragementContainer}>
              <AnimatedRevealMessage delay={300}>
                <BodyText style={styles.encouragementText}>
                  {intelligence.getPersonalizedMessage('encouragement')}
                </BodyText>
              </AnimatedRevealMessage>
            </Animated.View>
          )}
          
        </ScrollView>

        {/* Bouton avec feedback adaptatif */}
        <View style={styles.bottomSection}>
          <AnimatedOnboardingButton {...ANIMATION_CONFIGS.onboarding.welcome.button}>
            <StandardOnboardingButton
              title={userChoice ? "Continuer" : "Choisir une option"}
              onPress={handleContinue}
              variant="primary"
              disabled={!userChoice}
            />
          </AnimatedOnboardingButton>
        </View>
        
      </AnimatedOnboardingScreen>
    </OnboardingScreen>
  );
}

// Helper pour recommendation intelligente
const getRecommendedChoice = () => {
  const recommendations = {
    emma: 'option-moderne',
    laure: 'option-efficace', 
    clara: 'option-creative',
    sylvie: 'option-naturelle',
    christine: 'option-spirituelle'
  };
  return recommendations[intelligence.currentPersona];
};

const getStyles = (theme) => StyleSheet.create({
  // Styles standards...
  
  // Styles intelligence
  recommendedChoice: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  
  recommendationHint: {
    fontSize: 12,
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  
  encouragementContainer: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },

  encouragementText: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
```

## 🔜 Évolutions Futures

### Phase 2 - Post-Onboarding
- Messages motivationnels in-app selon persona
- Adaptation contenu selon phase cyclique
- Thèmes visuels adaptatifs
- Notifications personnalisées

### Phase 3 - Intelligence Avancée
- Apprentissage continu post-onboarding
- Affinement persona selon usage réel
- A/B testing messages personnalisés
- Métriques engagement par persona

## 📋 Checklist Nouvel Écran Intelligence

- [ ] Importer et utiliser `useOnboardingIntelligence`
- [ ] Définir messages dans `onboardingMessages.js`
- [ ] Implémenter fallbacks par défaut
- [ ] Ajouter seuils de confiance appropriés
- [ ] Tester toutes les personas
- [ ] Ajouter tracking enrichi
- [ ] Optimiser performance (cache)
- [ ] Documenter patterns spécifiques

---

**L'onboarding MoodCycle : Intelligence invisible, expérience magique** ✨🌙 