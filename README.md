# 📱 MoodCycle App - React Native

> **Application mobile React Native - Compagnon IA cycle féminin**
> État : Sprint 2 Notebook TERMINÉ ✅ - Architecture refactorisée & optimisée

## ✨ Fonctionnalités Principales

- 🗣️ **Chat IA Melune** - Conversations personnalisées par 5 personas adaptatifs
- 📊 **Roue du Cycle** - Visualisation interactive phases menstruelles
- 📝 **Carnet Personnel** - Journal intime et notes quotidiennes ✅ TERMINÉ
- 🎯 **Insights Thérapeutiques** - 890+ recommandations personnalisées
- 🤖 **Personas Intelligents** - Emma/Laure/Sylvie/Christine/Clara
- 🌙 **Onboarding Conversationnel** - 8 écrans introduction avec Melune

## 🏗️ Stack Technique Mobile

### Framework Core

- **React Native** + Expo SDK 53
- **Navigation** : Expo Router (file-based routing)
- **State Management** : Zustand avec persistence (REFACTORISÉ)
- **Storage** : AsyncStorage (offline-first)
- **Networking** : Fetch API + Network detection

### UI/UX

- **Components** : React Native natives + Expo Vector Icons
- **Fonts** : Quintessential (titres) + Quicksand (corps)
- **Design** : Cohérence visuelle Chat/Insights/Cycle/Notebook

### Stratégie Offline-First

```javascript
// Architecture données locales prioritaires
AsyncStorage = Source de vérité ←→ API = Enrichissement + backup
     ↓                                    ↓
Fonctionnement sans backend     Sync conversations + insights
```

## 🚀 Quick Start Développement

### Installation

```bash
git clone https://github.com/Ricomaldo/MOODCYCLE-APP.git
cd MOODCYCLE-APP
npm install
```

### Démarrage

```bash
npm start          # Expo DevTools
npm run android    # Émulateur/device Android
npm run ios        # Simulateur iOS
npm run web        # Développement web
```

### Configuration Backend

```javascript
// app.config.js - Configuration API
export default {
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000",
    environment: process.env.EXPO_PUBLIC_ENV || "development",
  },
};
```

### Test Rapide

1. **Démarrer backend** : `cd ../MOODCYCLE-VPS && npm run dev:api`
2. **Lancer app** : `npm start` puis scan QR code
3. **Test onboarding** : Parcours persona + chat Melune

## 📁 Architecture Refactorisée (Version 5.0)

```
MOODCYCLE-APP/
├── app/                    # 🚀 Expo Router (Routes)
│   ├── _layout.jsx        # Layout racine + Theme Provider
│   ├── index.jsx          # Écran accueil ou redirection
│   ├── onboarding/        # Flow personas (8 écrans)
│   │   ├── 100-promesse.jsx
│   │   ├── 200-rencontre.jsx
│   │   ├── 300-confiance.jsx
│   │   ├── 375-age.jsx
│   │   ├── 400-cycle.jsx
│   │   ├── 500-preferences.jsx
│   │   ├── 550-prenom.jsx
│   │   ├── 600-avatar.jsx
│   │   ├── 700-paywall.jsx
│   │   └── 800-cadeau.jsx
│   └── (tabs)/            # Navigation principale
│       ├── chat/          # Conversations Melune
│       ├── cycle/         # Roue cycle + phases détaillées
│       ├── notebook/      # Carnet personnel ✅ TERMINÉ
│       └── phases/        # Détails phases cycle
├── src/
│   ├── stores/            # 🏪 Zustand State Management (UNIFIÉ)
│   │   ├── useAppStore.js     # État global application
│   │   ├── useUserStore.js    # Profil + Cycle + Persona unifié
│   │   ├── useChatStore.js    # Conversations simplifiées
│   │   └── useNotebookStore.js # Journal personnel complet
│   ├── hooks/             # 🎣 Hooks React Spécialisés (NOUVEAUX)
│   │   ├── useCycle.js        # API cycle optimisée
│   │   ├── usePersona.js      # Gestion personas
│   │   ├── usePersonalizedInsight.js # Insights premium
│   │   ├── useInsightsList.js # Listes insights
│   │   └── useNetworkStatus.js # État réseau
│   ├── services/          # 🔌 Services Épurés (SIMPLIFIÉS)
│   │   ├── ChatService.js     # API conversation Claude
│   │   ├── PersonaEngine.js   # Algorithme pur personas
│   │   ├── ContentManager.js  # Gestion contenus offline
│   │   └── InsightsEngine.js  # Génération insights
│   ├── utils/             # 🛠️ Utilitaires Purs (NOUVEAUX)
│   │   ├── cycleCalculations.js # Calculs cycle menstruel
│   │   ├── dateUtils.js       # Utilitaires dates
│   │   └── formatters.js      # Formatage données
│   ├── config/            # ⚙️ Configuration
│   │   ├── api.js             # URLs endpoints backend
│   │   ├── theme.js           # Couleurs + styles globaux
│   │   ├── cycleConstants.js  # Constantes cycle
│   │   └── personaProfiles.js # Définitions 5 personas
│   ├── features/          # 🎨 Composants Métier
│   │   ├── chat/
│   │   │   └── ChatBubble.jsx
│   │   ├── cycle/
│   │   │   ├── CalendarView.jsx
│   │   │   └── CycleWheel.jsx
│   │   ├── notebook/
│   │   │   ├── FreeWritingModal.jsx
│   │   │   ├── QuickTrackingModal.jsx
│   │   │   └── SwipeableEntry.jsx
│   │   └── shared/
│   │       ├── EntryDetailModal.jsx
│   │       ├── InsightCard.jsx
│   │       ├── MeluneAvatar.jsx
│   │       └── ShareableCard.jsx
│   ├── core/              # 🏗️ Infrastructure
│   │   ├── dev/           # Outils développement
│   │   ├── layout/        # Layouts réutilisables
│   │   └── ui/            # Composants UI de base
│   ├── data/              # 📊 Données Statiques
│   │   ├── insights.json
│   │   ├── phases.json
│   │   ├── closings.json
│   │   └── vignettes.json
│   └── assets/            # 🎨 Assets
│       ├── fonts/
│       └── images/
└── docs/                  # 📚 Documentation Technique
    ├── architecture-insights-final.md
    ├── migration-plan.md
    └── services-refactoring-plan.md
```

## 🏪 Architecture Zustand Stores Unifiée

### useUserStore.js - Store Principal Unifié

```javascript
const useUserStore = create(
  persist(
    (set, get) => ({
      // 👤 PROFIL UTILISATEUR
      profile: {
        prenom: null,
        ageRange: null, // '18-25', '26-35', '36-45', '46-55', '55+'
        journeyChoice: null, // 'body', 'nature', 'emotions'
        completed: false,
      },

      // 🎯 PRÉFÉRENCES (0-5)
      preferences: {
        symptoms: 3,     // Symptômes physiques
        moods: 3,        // Gestion émotionnelle
        phyto: 3,        // Phytothérapie
        phases: 3,       // Énergie cyclique
        lithotherapy: 3, // Lithothérapie
        rituals: 3,      // Rituels bien-être
      },

      // 🌙 CYCLE MENSTRUEL (données uniquement)
      cycle: {
        lastPeriodDate: null,     // Date dernières règles
        length: 28,               // Durée cycle
        periodDuration: 5,        // Durée règles
        isRegular: null,          // Régularité
        trackingExperience: null, // 'never', 'basic', 'advanced'
      },

      // 🎭 PERSONA CALCULÉ
      persona: {
        assigned: null,      // 'emma', 'laure', 'sylvie', 'christine', 'clara'
        confidence: 0,       // 0-1
        lastCalculated: null,
        scores: {},          // Debug scores
      },

      // 🤖 CONFIGURATION MELUNE
      melune: {
        avatarStyle: "classic",    // 'classic', 'modern', 'mystique'
        tone: "friendly",          // 'friendly', 'professional', 'inspiring'
        personalityMatch: null,
      },

      // Actions
      updateProfile: (data) => set((state) => ({ profile: { ...state.profile, ...data } })),
      updatePreferences: (data) => set((state) => ({ preferences: { ...state.preferences, ...data } })),
      updateCycle: (data) => set((state) => ({ cycle: { ...state.cycle, ...data } })),
      calculatePersona: () => {
        const { profile, preferences } = get();
        const result = PersonaEngine.calculate({ profile, preferences });
        set((state) => ({
          persona: {
            ...state.persona,
            assigned: result.assigned,
            confidence: result.confidence,
            scores: result.scores,
            lastCalculated: Date.now(),
          },
        }));
        return result.assigned;
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### useChatStore.js - Conversations Simplifiées

```javascript
const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      lastSync: null,

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: Date.now().toString(),
              timestamp: Date.now(),
              ...message,
            },
          ],
        })),

      sendMessage: async (content) => {
        // Logique simplifiée avec nouveau useUserStore
        const userContext = useUserStore.getState().getContextForAPI();
        
        get().addMessage({ type: "user", content });
        set({ isTyping: true });

        try {
          const response = await ChatService.sendMessage(content, userContext);
          get().addMessage({
            type: "melune",
            content: response.message,
            persona: userContext.persona,
          });
        } catch (error) {
          // Fallback offline
          get().addMessage({
            type: "melune",
            content: "Je ne peux pas répondre maintenant, mais je suis là pour toi 💕",
            isOffline: true,
          });
        } finally {
          set({ isTyping: false });
        }
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### useNotebookStore.js - Carnet Complet ✅

```javascript
const useNotebookStore = create(
  persist(
    (set, get) => ({
      entries: [],
      quickTrackingData: {
        mood: null,
        energy: null,
        symptoms: [],
        notes: "",
      },

      // Ajout entrée journal
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            {
              id: Date.now().toString(),
              timestamp: Date.now(),
              type: entry.type || "journal", // 'journal', 'quick', 'freewriting'
              ...entry,
            },
            ...state.entries,
          ],
        })),

      // Quick tracking quotidien
      updateQuickTracking: (data) =>
        set((state) => ({
          quickTrackingData: { ...state.quickTrackingData, ...data },
        })),

      saveQuickTracking: () => {
        const { quickTrackingData } = get();
        if (quickTrackingData.mood || quickTrackingData.energy || quickTrackingData.notes) {
          get().addEntry({
            type: "quick",
            data: quickTrackingData,
          });
          set({
            quickTrackingData: {
              mood: null,
              energy: null,
              symptoms: [],
              notes: "",
            },
          });
        }
      },

      // Gestion tags et filtres
      getEntriesByTag: (tag) => {
        return get().entries.filter((entry) => entry.tags?.includes(tag));
      },

      getEntriesByDateRange: (startDate, endDate) => {
        return get().entries.filter((entry) => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= startDate && entryDate <= endDate;
        });
      },
    }),
    {
      name: "notebook-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

## 🎣 Hooks Spécialisés (Nouvelle Architecture)

### useCycle.js - API Cycle Optimisée

```jsx
import { useCycle } from '../src/hooks/useCycle';

const CycleScreen = () => {
  const {
    currentPhase,        // Phase actuelle calculée
    currentDay,          // Jour du cycle
    phaseInfo,          // Infos enrichies phase
    nextPeriodDate,     // Prédiction prochaines règles
    daysUntilNextPeriod, // Jours restants
    startNewPeriod,     // Action nouveau cycle
    updateCycleLength,  // Modifier durée cycle
    isValid,            // Validation données
    hasData,            // Données minimum présentes
  } = useCycle();

  return (
    <View>
      <Text>Phase actuelle: {phaseInfo.name} {phaseInfo.emoji}</Text>
      <Text>Jour {currentDay} du cycle</Text>
      {nextPeriodDate && (
        <Text>Prochaines règles: {nextPeriodDate.toLocaleDateString()}</Text>
      )}
    </View>
  );
};
```

### usePersonalizedInsight.js - Insights Premium

```jsx
import { usePersonalizedInsight, useOnboardingInsight } from '../src/hooks/usePersonalizedInsight';

// Usage générique
const InsightCard = () => {
  const { content, loading, refresh, hasInsight } = usePersonalizedInsight({
    enrichWithContext: true,
    autoRefresh: false
  });

  return (
    <View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text>{content}</Text>
      )}
      <Button title="Nouvel insight" onPress={refresh} />
    </View>
  );
};

// Usage spécialisé onboarding
const OnboardingGift = () => {
  const { content, loading } = useOnboardingInsight();
  
  return (
    <ChatBubble 
      type="melune" 
      message={content} 
      loading={loading}
    />
  );
};
```

### usePersona.js - Gestion Personas

```jsx
import { usePersona } from '../src/hooks/usePersona';

const PersonaDisplay = () => {
  const {
    current,        // Persona actuel
    confidence,     // Score confiance
    calculate,      // Recalculer persona
    isAssigned,     // Persona assigné?
    scores,         // Debug scores
  } = usePersona();

  return (
    <View>
      <Text>Persona: {current}</Text>
      <Text>Confiance: {Math.round(confidence * 100)}%</Text>
      <Button title="Recalculer" onPress={calculate} />
    </View>
  );
};
```

## 🔧 Services Épurés (Version 4.0)

### PersonaEngine.js - Algorithme Pur

```javascript
// Fonction pure uniquement - plus d'intégration stores
export function calculatePersona(userStoreData) {
  const userData = {
    journeyChoice: userStoreData.profile?.journeyChoice,
    ageRange: userStoreData.profile?.ageRange,
    preferences: userStoreData.preferences,
    communicationTone: userStoreData.melune?.tone
  };

  const scores = calculatePersonaScores(userData);
  const bestMatch = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    assigned: bestMatch[0],
    confidence: bestMatch[1] / 100,
    scores,
    timestamp: Date.now()
  };
}
```

### InsightsEngine.js - Génération Insights

```javascript
// Interface simplifiée
export const getPersonalizedInsight = async (context, options = {}) => {
  const { phase, persona, preferences, profile } = context;
  const { usedInsights = [], enrichWithContext = false } = options;

  // Algorithme complet de sélection et scoring
  // Anti-répétition intelligente
  // Fallbacks robustes
  // Enrichissement contextuel optionnel

  return {
    content: "Insight personnalisé",
    id: "insight_123",
    persona: persona,
    relevanceScore: 95,
    source: 'api-with-enrichment',
  };
};
```

### ChatService.js - API Simplifiée

```javascript
class ChatService {
  async sendMessage(message) {
    try {
      // Contexte depuis useUserStore unifié
      const context = useUserStore.getState().getContextForAPI();
      
      const response = await this.callChatAPI(message, context);
      
      return {
        success: true,
        message: response,
        source: 'api',
      };
    } catch (error) {
      // Fallback offline simple
      return {
        success: false,
        message: this.getFallbackResponse(message),
        source: 'fallback',
      };
    }
  }
}
```

## 🛠️ Utilitaires Purs (Nouveaux)

### cycleCalculations.js - Calculs Cycle

```javascript
// Fonctions pures pour calculs cycle menstruel
export const getCurrentPhase = (lastPeriodDate, cycleLength, periodDuration) => {
  if (!lastPeriodDate) return 'menstrual';
  
  const daysSince = getDaysSinceLastPeriod(lastPeriodDate);
  const currentDay = (daysSince % cycleLength) + 1;
  
  if (currentDay <= periodDuration) return 'menstrual';
  if (currentDay <= cycleLength * 0.4) return 'follicular';
  if (currentDay <= cycleLength * 0.6) return 'ovulatory';
  return 'luteal';
};

export const getCurrentCycleDay = (lastPeriodDate, cycleLength) => {
  if (!lastPeriodDate) return 1;
  const daysSince = getDaysSinceLastPeriod(lastPeriodDate);
  return (daysSince % cycleLength) + 1;
};

export const getNextPeriodDate = (lastPeriodDate, cycleLength) => {
  if (!lastPeriodDate) return null;
  const lastDate = new Date(lastPeriodDate);
  const nextDate = new Date(lastDate);
  nextDate.setDate(lastDate.getDate() + cycleLength);
  return nextDate;
};
```

### formatters.js - Formatage Données

```javascript
// Formatage simple sans cache complexe
export const formatUserProfile = (user) => ({
  prenom: user.profile.prenom,
  age: user.profile.ageRange,
  phase: user.getCurrentPhase()
});

export const formatPreferences = (prefs) => 
  Object.entries(prefs)
    .filter(([,val]) => val >= 4)
    .map(([key]) => key);

export const formatCycleInfo = (cycle, currentPhase) => ({
  phase: currentPhase,
  day: getCurrentCycleDay(cycle.lastPeriodDate, cycle.length),
  length: cycle.length,
  isRegular: cycle.isRegular
});
```

## 🎨 Composants Signature

### ChatBubble - Système Conversation

```jsx
import { usePersona } from '../../src/hooks/usePersona';

const ChatBubble = ({ message, type, persona }) => {
  const { current } = usePersona();

  return (
    <View style={[styles.bubble, styles[type]]}>
      {type === 'melune' && (
        <MeluneAvatar persona={persona || current} size="small" />
      )}
      <View style={styles.messageContainer}>
        <Text style={[styles.message, styles[persona || current]]}>
          {message}
        </Text>
        <Text style={styles.timestamp}>
          {formatTime(timestamp)}
        </Text>
      </View>
    </View>
  );
};
```

### CycleWheel - Roue Interactive

```jsx
import { useCycle } from "../../src/hooks/useCycle";

const CycleWheel = ({ onPhaseSelect }) => {
  const { currentPhase, currentDay, phaseInfo } = useCycle();

  return (
    <View style={styles.wheelContainer}>
      <Svg width={300} height={300}>
        {/* Roue avec phases colorées selon état actuel */}
        <Circle
          cx={150}
          cy={150}
          r={120}
          fill={phaseInfo.color}
          onPress={() => onPhaseSelect(currentPhase)}
        />
      </Svg>

      <View style={styles.centerInfo}>
        <Text style={styles.currentDay}>Jour {currentDay}</Text>
        <Text style={styles.currentPhase}>
          {phaseInfo.emoji} {phaseInfo.name}
        </Text>
      </View>
    </View>
  );
};
```

### NotebookEntry - Entrée Journal ✅

```jsx
import { useNotebookStore } from "../../src/stores/useNotebookStore";

const NotebookEntry = ({ entry }) => {
  const { updateEntry, deleteEntry } = useNotebookStore();

  return (
    <SwipeableEntry
      onEdit={() => updateEntry(entry.id, { /* modifications */ })}
      onDelete={() => deleteEntry(entry.id)}
    >
      <View style={styles.entryContainer}>
        <Text style={styles.entryDate}>
          {formatDate(entry.timestamp)}
        </Text>
        <Text style={styles.entryContent}>
          {entry.content || entry.data?.notes}
        </Text>
        {entry.tags && (
          <View style={styles.tagsContainer}>
            {entry.tags.map(tag => (
              <Text key={tag} style={styles.tag}>#{tag}</Text>
            ))}
          </View>
        )}
      </View>
    </SwipeableEntry>
  );
};
```

## 📱 Écrans Principaux

### Onboarding Flow (8 écrans)

```
app/onboarding/
├── 100-promesse.jsx    # Promesse app personnalisée
├── 200-rencontre.jsx   # Présentation Melune
├── 300-confiance.jsx   # Construction confiance
├── 375-age.jsx         # Collecte tranche âge
├── 400-cycle.jsx       # Données cycle de base
├── 500-preferences.jsx # Sliders intérêts (1-5)
├── 550-prenom.jsx      # Personnalisation prénom
├── 600-avatar.jsx      # Choix avatar Melune
├── 700-paywall.jsx     # Premium features (futur)
└── 800-cadeau.jsx      # Insight cadeau personnalisé ✨
```

### Navigation Principale (4 onglets)

```
app/(tabs)/
├── chat/index.jsx      # Conversations Melune
├── cycle/index.jsx     # Roue + détails phases
├── notebook/index.jsx  # Journal personnel ✅ TERMINÉ
└── phases/[id].jsx     # Détails phases individuelles
```

## 🔍 Testing & Debug

### Scripts Utiles

```bash
# Tests unitaires
npm test

# Validation TypeScript
npm run type-check

# Linting
npm run lint

# Build production
npm run build

# Clear cache Expo
npx expo start --clear
```

### Debug Features

```javascript
// src/core/dev/ - Outils développement
├── DevNavigation.jsx    # Navigation debug
├── PersonaSelector.jsx  # Test personas
└── index.js            # Exports debug
```

## 📊 Métriques d'Amélioration Post-Refactoring

### Performance
- **-60% code stores** (800 → 320 lignes)
- **-70% code services** (1200 → 350 lignes)
- **+100% cohérence** avec stores unifiés
- **+200% facilité d'usage** hooks spécialisés

### Architecture
- **1 source de vérité** pour cycle/persona (useUserStore)
- **API cohérente** entre tous les stores
- **Séparation claire** responsabilités (Services = logique pure, Hooks = interface React)
- **Fonctions pures** dans utils (testables, réutilisables)

### Développeur Experience
- **Hooks spécialisés** pour chaque usage
- **Auto-completion** améliorée
- **Moins de boilerplate** dans les composants
- **Documentation** technique complète

---

**📱 App mobile innovante - Architecture refactorisée & optimisée**
_Sprint Notebook terminé ✅ - Prêt pour la production_
