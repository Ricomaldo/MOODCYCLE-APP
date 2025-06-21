# 📱 MoodCycle App - React Native

> **Application mobile React Native - Compagnon IA cycle féminin**
> État : Sprint 2 Notebook en cours ⏳ - Architecture offline-first validée

## ✨ Fonctionnalités Principales

- 🗣️ **Chat IA Melune** - Conversations personnalisées par 5 personas adaptatifs
- 📊 **Roue du Cycle** - Visualisation interactive phases menstruelles
- 📝 **Carnet Personnel** - Journal intime et notes quotidiennes (Sprint 2)
- 🎯 **Insights Thérapeutiques** - 890 recommandations personnalisées
- 🤖 **Personas Intelligents** - Emma/Laure/Sylvie/Christine/Clara
- 🌙 **Onboarding Conversationnel** - 7 écrans introduction avec Melune

## 🏗️ Stack Technique Mobile

### Framework Core

- **React Native** + Expo SDK 53
- **Navigation** : Expo Router (file-based routing)
- **State Management** : Zustand avec persistence
- **Storage** : AsyncStorage (offline-first)
- **Networking** : Fetch API + Network detection

### UI/UX

- **Components** : React Native natives + Expo Vector Icons
- **Fonts** : Quintessential (titres) + Quicksand (corps)
- **Design** : Cohérence visuelle Chat/Insights/Cycle

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
git clone https://github.com/votre-repo/MOODCYCLE-APP.git
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

## 📁 Structure Architecture

```
MOODCYCLE-APP/
├── app/                    # 🚀 Expo Router (Routes)
│   ├── _layout.jsx        # Layout racine + Theme Provider
│   ├── index.jsx          # Écran accueil ou redirection
│   ├── onboarding/        # Flow personas (7 écrans)
│   │   ├── 100-promesse.jsx
│   │   ├── 200-rencontre.jsx
│   │   ├── 300-confiance.jsx
│   │   ├── 375-age.jsx
│   │   ├── 400-cycle.jsx
│   │   ├── 500-preferences.jsx
│   │   ├── 550-prenom.jsx
│   │   ├── 600-avatar.jsx
│   │   └── 700-paywall.jsx
│   └── (tabs)/            # Navigation principale
│       ├── home/          # Accueil + insights personnalisés
│       ├── cycle/         # Roue cycle + phases détaillées
│       ├── chat/          # Conversations Melune
│       └── notebook/      # Carnet personnel (Sprint 2)
├── src/stores/                 # 🏪 Zustand State Management
│   ├── useAppStore.js     # État global application
│   ├── useOnboardingStore.js # Onboarding + personas
│   ├── useCycleStore.js   # Données cycle menstruel
│   ├── useChatStore.js    # Conversations + historique
│   └── useNotebookStore.js # Journal personnel (WIP)
├── components/             # 🎨 Composants Réutilisables
│   ├── ChatBubble/        # Bulles conversation + avatars
│   ├── CycleWheel/        # Roue interactive cycle
│   ├── MeluneAvatar/      # Avatar IA personnalisé
│   ├── InsightCard/       # Cartes recommandations
│   └── Typography/        # Système typographique
├── src/services/               # 🔌 Services & Logique Métier
│   ├── ChatService.js     # API conversation Claude
│   ├── PersonaEngine.js   # Calcul algorithme personas
│   ├── ContentManager.js  # Gestion insights offline
│   └── InsightsEngine.js  # Filtrage recommandations
├── utils/                  # 🛠️ Utilitaires
│   └── dateUtils.js       # Calculs dates/phases cycle
└── config/                 # ⚙️ Configuration
    ├── api.js             # URLs endpoints backend
    ├── theme.js           # Couleurs + styles globaux
    └── personaProfiles.js # Définitions 5 personas
```

## 🏪 Architecture Zustand Stores

### useOnboardingStore.js - Système Personas

```javascript
const useOnboardingStore = create(
  persist(
    (set, get) => ({
      // Profil utilisatrice
      userInfo: {
        prenom: "",
        ageRange: null, // '18-25', '26-35', '36-45', '46+'
        preferences: {
          symptoms: 3, // 1-5 intérêt symptômes physiques
          moods: 4, // 1-5 gestion émotionnelle
          phases: 5, // 1-5 énergie cyclique
          phyto: 2, // 1-5 phytothérapie
        },
      },

      // Persona calculé automatiquement
      persona: {
        assigned: null, // 'emma' | 'laure' | 'sylvie' | 'christine' | 'clara'
        lastCalculated: null, // Timestamp calcul
        confidence: 0, // Score confiance 0-1
      },

      // Actions
      setUserInfo: (info) =>
        set((state) => ({
          userInfo: { ...state.userInfo, ...info },
        })),

      calculatePersona: () => {
        const state = get();
        const { persona, confidence } = PersonaEngine.calculate(state.userInfo);
        set({
          persona: {
            assigned: persona,
            lastCalculated: Date.now(),
            confidence,
          },
        });
      },
    }),
    {
      name: "moodcycle-onboarding", // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### useCycleStore.js - Données Cycle

```javascript
const useCycleStore = create(
  persist(
    (set, get) => ({
      cycleData: {
        lastPeriodDate: null, // Date dernières règles
        cycleLength: 28, // Durée cycle moyenne
        currentDay: 1, // Jour actuel du cycle
        currentPhase: "menstrual", // Phase calculée
      },

      // Calcul phase automatique
      getCurrentPhase: () => {
        const { lastPeriodDate, cycleLength } = get().cycleData;
        if (!lastPeriodDate) return "unknown";

        const daysSince = Math.floor(
          (Date.now() - new Date(lastPeriodDate)) / (1000 * 60 * 60 * 24)
        );
        const currentDay = (daysSince % cycleLength) + 1;

        // Logique calcul phase selon jour cycle
        if (currentDay <= 5) return "menstrual";
        if (currentDay <= 13) return "follicular";
        if (currentDay <= 16) return "ovulatory";
        return "luteal";
      },

      updateCycleData: (data) =>
        set((state) => ({
          cycleData: { ...state.cycleData, ...data },
        })),
    }),
    {
      name: "moodcycle-cycle",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### useChatStore.js - Conversations Melune

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
        const { persona } = useOnboardingStore.getState();
        const { getCurrentPhase } = useCycleStore.getState();

        // Message utilisatrice
        get().addMessage({
          type: "user",
          content,
          persona: null,
        });

        set({ isTyping: true });

        try {
          // Appel API avec contexte enrichi
          const response = await ChatService.sendMessage(content, {
            persona: persona.assigned,
            phase: getCurrentPhase(),
            timestamp: Date.now(),
          });

          // Réponse Melune
          get().addMessage({
            type: "melune",
            content: response.message,
            persona: persona.assigned,
          });
        } catch (error) {
          // Fallback offline avec message persona
          const fallbackMessage = getFallbackMessage(persona.assigned, error);
          get().addMessage({
            type: "melune",
            content: fallbackMessage,
            persona: persona.assigned,
            isOffline: true,
          });
        } finally {
          set({ isTyping: false });
        }
      },
    }),
    {
      name: "moodcycle-chat",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

## 🎨 Composants Signature

### ChatBubble - Système Conversation

```jsx
// src/features/chat/ChatBubble/index.jsx
import { useOnboardingStore } from '../../src/stores/useOnboardingStore'

const ChatBubble = ({ message, type, persona }) => {
  const { userInfo } = useOnboardingStore()

  return (
    <View style={[styles.bubble, styles[type]]}>
      {type === 'melune' && (
        <MeluneAvatar persona={persona} size="small" />
      )}
      <View style={styles.messageContainer}>
        <Text style={[styles.message, styles[persona]}>
          {message}
        </Text>
        <Text style={styles.timestamp}>
          {formatTime(timestamp)}
        </Text>
      </View>
    </View>
  )
}

// Usage avec personas adaptatifs
<ChatBubble
  type="melune"
  persona="emma"  // Style Emma moderne + émojis
  message="Salut ! 😊 Comment tu te sens aujourd'hui ?"
/>
<ChatBubble
  type="melune"
  persona="laure" // Style Laure professionnelle
  message="Analysons ensemble tes patterns énergétiques."
/>
```

### CycleWheel - Roue Interactive

```jsx
// components/CycleWheel/index.jsx
import { useCycleStore } from "../../src/stores/useCycleStore";

const CycleWheel = ({ onPhaseSelect }) => {
  const { cycleData, getCurrentPhase } = useCycleStore();
  const currentPhase = getCurrentPhase();

  return (
    <View style={styles.wheelContainer}>
      <Svg width={300} height={300}>
        {/* 4 phases colorées selon état actuel */}
        <Circle
          cx={150}
          cy={150}
          r={120}
          fill={getPhaseColor("menstrual", currentPhase)}
          onPress={() => onPhaseSelect("menstrual")}
        />
        {/* Autres phases... */}
      </Svg>

      <View style={styles.centerInfo}>
        <Text style={styles.currentDay}>Jour {cycleData.currentDay}</Text>
        <Text style={styles.currentPhase}>{getPhaseLabel(currentPhase)}</Text>
      </View>
    </View>
  );
};
```

### MeluneAvatar - Avatar IA

```jsx
// src/features/shared/MeluneAvatar/index.jsx
const MeluneAvatar = ({ persona, emotion = "neutral", size = "medium" }) => {
  const avatarSrc = getAvatarSource(persona, emotion);

  return (
    <View style={[styles.avatarContainer, styles[size]]}>
      <Image source={avatarSrc} style={styles.avatar} resizeMode="cover" />
      {emotion === "thinking" && (
        <ActivityIndicator style={styles.thinkingIndicator} />
      )}
    </View>
  );
};

// 5 avatars différents selon persona
// src/assets/images/melune/emma.png (moderne, jeune)
// src/assets/images/melune/laure.png (professionnelle)
// src/assets/images/melune/sylvie.png (maternelle)
// src/assets/images/melune/christine.png (sage)
// src/assets/images/melune/clara.png (enthousiaste)
```

## 🎭 Système Personas Intelligent

### PersonaEngine.js - Calcul Algorithmique

```javascript
// src/services/PersonaEngine.js
export class PersonaEngine {
  static calculate(userInfo) {
    const { ageRange, preferences } = userInfo;
    const scores = {};

    // Calcul scores par persona selon âge + préférences
    PERSONAS.forEach((persona) => {
      scores[persona.id] = this.calculateCompatibility(
        ageRange,
        preferences,
        persona.traits
      );
    });

    // Persona avec score maximum
    const bestMatch = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];

    return {
      persona: bestMatch[0],
      confidence: bestMatch[1],
      allScores: scores,
    };
  }

  static calculateCompatibility(age, preferences, traits) {
    let score = 0;

    // Facteur âge (50% du score)
    if (this.isAgeCompatible(age, traits.targetAge)) {
      score += 0.5;
    }

    // Facteur préférences (50% du score)
    const prefScore = this.calculatePreferenceMatch(
      preferences,
      traits.strongPreferences
    );
    score += prefScore * 0.5;

    return score;
  }
}

// 5 Personas avec traits distinctifs
export const PERSONAS = [
  {
    id: "emma",
    name: "Emma",
    targetAge: ["18-25"],
    traits: {
      style: "moderne, émojis, spontanée",
      tone: "copine, décontractée",
      vocabulary: ["super", "carrément", "trop bien"],
      strongPreferences: ["phyto", "symptoms"],
    },
  },
  {
    id: "laure",
    name: "Laure",
    targetAge: ["26-35"],
    traits: {
      style: "professionnelle, équilibrée",
      tone: "coach bienveillante",
      vocabulary: ["optimiser", "efficace", "équilibre"],
      strongPreferences: ["phases", "moods"],
    },
  },
  // ... autres personas
];
```

## 📱 Écrans Principaux

### Onboarding Flow (7 écrans)

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
└── 700-paywall.jsx     # Premium features (futur)
```

### Navigation Principale (4 onglets)

```
app/(tabs)/
├── home/index.jsx      # Dashboard insights + accueil
├── cycle/index.jsx     # Roue + détails phases
├── chat/index.jsx      # Conversations Melune
└── notebook/index.jsx  # Journal personnel (Sprint 2)
```

## 🔧 Services Core

### ChatService.js - API Claude

```javascript
// src/services/ChatService.js
export class ChatService {
  static async sendMessage(message, context) {
    const deviceId = await getDeviceId();

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-ID": deviceId,
        },
        body: JSON.stringify({
          message,
          context: {
            persona: context.persona,
            phase: context.phase,
            currentDate: new Date().toLocaleString("fr-FR", {
              timeZone: "Europe/Paris",
            }),
            preferences: context.preferences,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("ChatService error:", error);
      throw error;
    }
  }
}
```

### ContentManager.js - Insights Offline

```javascript
// src/services/ContentManager.js
export class ContentManager {
  static async getPersonalizedInsights(persona, phase, preferences) {
    try {
      // Tentative API pour derniers insights
      const response = await fetch(`${API_URL}/insights`, {
        headers: { "X-Persona": persona, "X-Phase": phase },
      });

      if (response.ok) {
        const insights = await response.json();
        this.cacheInsights(insights); // Cache local
        return insights;
      }
    } catch (error) {
      console.log("API indisponible, utilisation cache local");
    }

    // Fallback cache local/bundled
    return this.getCachedInsights(persona, phase);
  }

  static getCachedInsights(persona, phase) {
    // Insights bundlés avec app pour fonctionnement offline
    const bundledInsights = require("../src/data/insights.json");
    return bundledInsights
      .filter(
        (insight) => insight.persona === persona && insight.phase === phase
      )
      .slice(0, 5); // Limite 5 insights
  }
}
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
// app/debug/ - Écrans développement
├── chat.jsx      # Test conversations directes
├── insights.jsx  # Preview insights par persona
└── persona.jsx   # Test algorithme calcul personas
```

---

**📱 App mobile innovante - Personnalisation IA conversationnelle**
_Architecture offline-first pour expérience fluide toujours disponible_
