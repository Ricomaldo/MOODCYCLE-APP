# 🧠 Intelligence Progressive Onboarding
> **Système de personnalisation automatique basé sur les choix utilisateur**

## 🎯 **PRINCIPE GÉNÉRAL**

L'onboarding détecte progressivement la **persona** de l'utilisatrice (0% → 100% de confiance) et adapte automatiquement :
- **Messages** de Mélune selon la personnalité
- **Suggestions** d'options selon les préférences
- **Pré-sélections** automatiques dans les écrans avancés

## 👥 **PERSONAS DÉTECTÉES**

### **Emma** (18-25 ans) - Découverte
```jsx
{
  tone: 'friendly',
  terminology: 'modern', 
  style: 'modern',
  keywords: ['excitant', 'découvrir', 'aventure', 'hâte']
}
```

### **Laure** (26-35 ans) - Optimisation
```jsx
{
  tone: 'professional',
  terminology: 'medical',
  style: 'modern', 
  keywords: ['optimiser', 'efficace', 'professionnel', 'équipe']
}
```

### **Clara** (26-35 ans) - Empowerment
```jsx
{
  tone: 'inspiring',
  terminology: 'energetic',
  style: 'mystique',
  keywords: ['révolutionner', 'power', 'déchirer', 'épique']
}
```

### **Sylvie** (36-45 ans) - Équilibre naturel
```jsx
{
  tone: 'friendly',
  terminology: 'spiritual',
  style: 'classic',
  keywords: ['sagesse', 'accompagner', 'intuition', 'résonance']
}
```

### **Christine** (46+ ans) - Sagesse spirituelle
```jsx
{
  tone: 'inspiring',
  terminology: 'spiritual', 
  style: 'mystique',
  keywords: ['sagesse', 'spirituel', 'enchantée', 'diversité']
}
```

## 📊 **CALCUL PROGRESSIF DE CONFIANCE**

### **Facteurs de Scoring**
```jsx
const SCORING_WEIGHTS = {
  JOURNEY_CHOICE: 0.25,    // Choix initial (250-rencontre)
  AGE_RANGE: 0.15,        // Tranche d'âge (300-etape-vie)  
  PREFERENCES: 0.35,      // Préférences thérapeutiques (800-preferences)
  COMMUNICATION: 0.15,    // Style de communication (500-avatar)
  TERMINOLOGY: 0.10       // Facteur terminologie (600-terminology)
}
```

### **Progression par Écran**
```
250-rencontre: 25% (journey choice)
300-etape-vie: 40% (+ age range)
500-avatar:    55% (+ communication style)  
600-terminology: 65% (+ terminology preference)
800-preferences: 100% (+ therapeutic preferences)
```

### **Seuils d'Activation**
```jsx
const CONFIDENCE_THRESHOLDS = {
  BASIC_PERSONALIZATION: 0.4,  // Messages personnalisés (40%)
  SMART_SUGGESTIONS: 0.6,      // Suggestions intelligentes (60%)
  AUTO_PRESELECTIONS: 0.8      // Pré-sélections automatiques (80%)
};
```

## 💬 **SYSTÈME DE MESSAGES PERSONNALISÉS**

### **Structure des Messages**
```jsx
// src/config/onboardingMessages.js
export const ONBOARDING_MESSAGES = {
  '300-etape-vie': {
    emma: {
      message: "Chaque étape de la vie a sa propre magie unique...",
      encouragement: "C'est excitant de découvrir tout ça ensemble !",
    },
    laure: {
      message: "Chaque phase de vie apporte ses défis et opportunités...",
      encouragement: "Excellente étape pour optimiser ton bien-être.",
    },
    // ... autres personas
    default: {
      message: "Message de fallback obligatoire",
      encouragement: "Fallback encouragement"
    }
  }
}
```

### **Types de Messages**

#### **1. Messages Simples**
```jsx
// Message statique par persona
emma: {
  message: "Chaque étape de la vie a sa propre magie unique..."
}
```

#### **2. Messages Dynamiques**
```jsx
// Message avec variable
emma: {
  confirmation: "J'adore ! Notre aventure commence ${prenom} !"
}
```

#### **3. Messages Fonctions**
```jsx
// Message généré dynamiquement
emma: {
  preview: (prenom) => `Hey ${prenom} ! Je suis trop contente de faire ta connaissance ! 💖`
}
```

#### **4. Messages Conditionnels**
```jsx
// Messages selon contexte
'250-rencontre': {
  journey: {
    body_disconnect: "Je sens que tu es en quête d'une reconnexion profonde...",
    hiding_nature: "Tu portes en toi une essence que le monde a peut-être voilée...",
    emotional_control: "Les émotions sont des messagères..."
  }
}
```

## 🔧 **UTILISATION DANS LES ÉCRANS**

### **1. Hook Intelligence**
```jsx
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';

export default function MonEcranOnboarding() {
  const intelligence = useOnboardingIntelligence('300-etape-vie');
  
  // Accès aux données
  const persona = intelligence.currentPersona;          // 'emma' | 'laure' | etc.
  const confidence = intelligence.personaConfidence;    // 0.0 → 1.0
  const isReady = confidence >= 0.4;                   // Seuil personnalisation
}
```

### **2. Messages Adaptatifs**
```jsx
// Message principal avec fallback obligatoire
<BodyText style={styles.message}>
  {intelligence.personaConfidence >= 0.4 
    ? intelligence.getPersonalizedMessage('message')
    : "Message par défaut toujours présent"}
</BodyText>

// Message avec données
<BodyText style={styles.preview}>
  {intelligence.getPersonalizedMessage('preview', { prenom: 'Sophie' })}
</BodyText>

// Message conditionnel
{intelligence.personaConfidence >= 0.4 && (
  <BodyText style={styles.encouragement}>
    {intelligence.getPersonalizedMessage('encouragement')}
  </BodyText>
)}
```

### **3. Suggestions Intelligentes**
```jsx
// Pré-sélections selon persona (seuil 60%)
const getPersonalizedDefaults = () => {
  if (intelligence.personaConfidence >= 0.6) {
    const suggestions = {
      emma: { style: 'modern', tone: 'friendly' },
      laure: { style: 'modern', tone: 'professional' },
      clara: { style: 'mystique', tone: 'inspiring' },
      sylvie: { style: 'classic', tone: 'friendly' },
      christine: { style: 'mystique', tone: 'inspiring' }
    };
    return suggestions[intelligence.currentPersona] || defaults;
  }
  return defaults;
};
```

### **4. Pré-sélections Automatiques**
```jsx
// Auto-sélection préférences (seuil 80%)
useEffect(() => {
  if (intelligence.personaConfidence >= 0.8) {
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

## 📋 **HELPER FUNCTIONS**

### **getOnboardingMessage()**
```jsx
import { getOnboardingMessage } from '../../src/config/onboardingMessages';

// Usage basique
const message = getOnboardingMessage('300-etape-vie', 'emma', 'message');

// Avec données
const preview = getOnboardingMessage('400-prenom', 'emma', 'preview', { prenom: 'Sophie' });

// Journey-based (250-rencontre)
const journeyMessage = getOnboardingMessage('250-rencontre', null, 'journey', { 
  journeyChoice: 'body_disconnect' 
});
```

### **Tracking Intelligence**
```jsx
// Track actions avec contexte persona
intelligence.trackAction('preference_selected', {
  preference: 'moods',
  value: 3,
  persona: intelligence.currentPersona,
  confidence: intelligence.personaConfidence,
  screen: '800-preferences'
});
```

## 🎨 **PATTERNS PAR ÉCRAN**

### **250-rencontre** - Journey-based
```jsx
// Messages selon choix journey uniquement
<BodyText style={styles.message}>
  {selectedChoice 
    ? intelligence.getPersonalizedMessage('journey', { journeyChoice: selectedChoice }) 
    : "Message par défaut"}
</BodyText>
```

### **300-etape-vie** - Premier niveau personnalisation
```jsx
// Encouragement post-sélection (40% confiance)
{showEncouragement && intelligence.personaConfidence >= 0.4 && (
  <AnimatedRevealMessage delay={300}>
    <BodyText style={styles.encouragementText}>
      {intelligence.getPersonalizedMessage('encouragement')}
    </BodyText>
  </AnimatedRevealMessage>
)}
```

### **400-prenom** - Messages multiples
```jsx
// Question personnalisée
<BodyText style={styles.meluneMessage}>
  {intelligence.personaConfidence >= 0.4 
    ? intelligence.getPersonalizedMessage('question')
    : "Comment aimerais-tu que je t'appelle ?"}
</BodyText>

// Preview dynamique avec fonction
const generatePersonalizedPreview = () => {
  if (!prenom.trim()) return null;
  
  if (intelligence.personaConfidence >= 0.4) {
    return intelligence.getPersonalizedMessage('preview', { prenom: prenom.trim() });
  }
  
  return `${prenom.trim()} ! Je suis trop contente de faire ta connaissance ! 💖`;
};
```

### **700-cycle** - Messages conversationnels
```jsx
// Messages adaptés selon contexte
<BodyText style={styles.conversationalMessage}>
  {intelligence.personaConfidence >= 0.4 
    ? intelligence.getPersonalizedMessage('conversational')
    : "Raconte-moi où tu en es dans ton cycle, on va faire ça ensemble 💕"}
</BodyText>

// Questions personnalisées pour composants
const dateQuestion = intelligence.personaConfidence >= 0.4
  ? getOnboardingMessage('700-cycle-questions', intelligence.currentPersona, 'date')
  : "Quand ont commencé tes dernières règles ?";
```

### **800-preferences** - Feedback adaptatif
```jsx
// Feedback selon sélections ET persona
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

## 🔧 **DEBUGGING INTELLIGENCE**

### **Logs de Debug**
```jsx
// Dans useOnboardingIntelligence.js (à retirer en production)
console.log(`🎯 ${screenName}: Persona=${personaResult.assigned || 'none'} Conf=${Math.round(personaResult.confidence*100)}%`);

if (personaResult.scores) {
  console.log(`📊 Scores:`, Object.entries(personaResult.scores)
    .map(([p, s]) => `${p}=${Math.round(s*100)}%`)
    .join(', '));
}
```

### **Validation Messages**
```jsx
// Vérifier qu'un message existe
const message = intelligence.getPersonalizedMessage('message');
if (!message) {
  console.warn(`Message manquant pour ${intelligence.currentPersona} sur écran ${screenName}`);
}
```

## 📊 **MÉTRIQUES INTELLIGENCE**

### **Tracking Progression**
```jsx
// Évolution confiance par écran
const progressionMetrics = {
  '250-rencontre': confidence,
  '300-etape-vie': confidence,
  '500-avatar': confidence,
  '600-terminology': confidence,
  '800-preferences': confidence
};
```

### **Performance Cache**
```jsx
// Cache personas pour éviter recalculs
let personaCache = {
  data: null,
  result: null,
  timestamp: 0
};

const CACHE_TTL = 5000; // 5 secondes
```

## 🎯 **BONNES PRATIQUES**

### **1. Messages**
- ✅ **Toujours** fournir un fallback par défaut
- ✅ **Tester** tous les cas de personas
- ✅ **Utiliser** les seuils de confiance appropriés
- ❌ **Jamais** exposer l'algorithme de détection

### **2. Performance**
- ✅ **Utiliser** le cache pour éviter recalculs
- ✅ **Limiter** les appels à getPersonalizedMessage
- ✅ **Optimiser** les conditions de re-render

### **3. UX Invisible**
- ✅ **Rendre** l'adaptation naturelle et fluide
- ✅ **Éviter** les changements brusques de messages
- ✅ **Maintenir** la cohérence de personnalité

### **4. Extensibilité**
- ✅ **Architecture** modulaire pour nouveaux écrans
- ✅ **Messages** facilement configurables
- ✅ **Personas** extensibles pour nouveaux profils

---

## 🔮 **EXEMPLE COMPLET**

```jsx
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { getOnboardingMessage } from '../../src/config/onboardingMessages';

export default function MonEcranIntelligent() {
  const intelligence = useOnboardingIntelligence('300-etape-vie');
  const [showEncouragement, setShowEncouragement] = useState(false);

  const handleSelection = (choice) => {
    // Logique de sélection...
    
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
    <View>
      {/* Message principal adaptatif */}
      <BodyText style={styles.message}>
        {intelligence.personaConfidence >= 0.4 
          ? intelligence.getPersonalizedMessage('message')
          : "Message par défaut"}
      </BodyText>

      {/* Encouragement post-sélection */}
      {showEncouragement && intelligence.personaConfidence >= 0.4 && (
        <BodyText style={styles.encouragement}>
          {intelligence.getPersonalizedMessage('encouragement')}
        </BodyText>
      )}
    </View>
  );
}
```

---

**🧠 L'intelligence progressive : personnalisation invisible, expérience magique** ✨🌙 