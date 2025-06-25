# 📱 MoodCycle App - Intelligence Cyclique Évolutive

> **Vision** : Première IA thérapeutique spécialisée cycle féminin avec architecture d'intelligence adaptative
> 
> **État Actuel** : MVP Fonctionnel + Architecture Intelligence (Partiellement Connectée) | **Version** : 7.0-alpha | **Statut** : En Développement 🚧

---

## 🎯 **VISION & OBJECTIF**

### **Problème Identifié**
- **Rupture d'expérience** : Onboarding prometteur → outils excellents mais sans guidance  
- **Paradoxe du choix** : Trop d'options parfaites créent l'immobilisme
- **Désengagement précoce** : 60% abandon après J7, faute de personnalisation

### **Solution Cible : 3 Systèmes Intégrés**
1. **🎭 Intelligence Comportementale** : 5 personas × patterns temporels × préférences
2. **📈 Progression Adaptative** : Discovery → Learning → Autonomous (Méthodologie Jeza)  
3. **🎯 Révélation Contextuelle** : 3 vignettes personnalisées vs 15 options paralysantes

### **📊 ÉTAT ACTUEL vs OBJECTIF**

| Composant | État Actuel | Objectif | Connexions |
|-----------|-------------|----------|-------------|
| **MVP Core** | ✅ **COMPLET** | ✅ | Chat, Cycle, Notebook fonctionnels |
| **Architecture Intelligence** | 🟡 **CRÉÉE** | ✅ | Services/Hooks créés mais **partiellement connectés** |
| **Données Thérapeutiques** | ✅ **VALIDÉES** | ✅ | 2329+ insights validés par thérapeute |
| **Personas Engine** | ✅ **TESTÉ** | ✅ | Algorithme fonctionnel + tests |
| **Connexions Intelligence** | 🔴 **MANQUANTES** | ✅ | **PRIORITÉ** : Connecter services → composants |
| **Expérience Adaptative** | 🔴 **À IMPLÉMENTER** | ✅ | Vignettes contextuelles, suggestions |

---

## ✨ **FONCTIONNALITÉS ACTUELLES**

### **🟢 Fonctionnalités Opérationnelles**
- 🗣️ **Chat IA Melune** - Conversations de base (sans personnalisation persona)
- 📊 **Roue du Cycle** - Affichage phases + données statiques
- 📝 **Carnet Personnel** - Journal avec swipe actions iOS natives ✅
- ⚙️ **Paramètres Utilisateur** - Modification profil, préférences, avatar ✅
- 🌙 **Onboarding Complet** - 8 écrans avec calcul persona ✅

### **🟡 Fonctionnalités Partielles**
- 🎯 **Insights Thérapeutiques** - 2329+ disponibles mais sélection non-intelligente
- 🎭 **Personas** - Calculées mais non-utilisées dans l'expérience
- 📈 **Tracking Intelligence** - Collecté mais non-exploité

### **🔴 Fonctionnalités À Connecter**
- **Navigation Contextuelle** - Vignettes intelligentes selon persona/phase
- **Suggestions Adaptatives** - Recommandations basées sur patterns
- **Interface Évolutive** - Adaptation selon maturité utilisateur
- **Chat Personnalisé** - Réponses selon persona + contexte

---

## 🏗️ **ARCHITECTURE - ÉTAT IMPLÉMENTATION**

### **🟢 Couches Implémentées**

```
📊 DATA LAYER ✅
├── phases.json (330 lignes) - Contextes par phase
├── insights.json (2329 lignes) - Conseils personnalisés  
├── vignettes.json (571 lignes) - Contenus adaptatifs
└── closings.json (27 lignes) - Formules persona

🏪 STORES LAYER ✅  
├── useUserStore.js - Hub central + profil
├── useUserIntelligence.js - Patterns comportementaux
├── useEngagementStore.js - Métriques progression
├── useChatStore.js - Conversations
└── useNotebookStore.js - Journal

🔌 SERVICES LAYER ✅ (Créés mais non-connectés)
├── PersonalizationEngine.js - Factory contexts
├── AdaptiveGuidance.js - Messages adaptatifs  
├── VignettesService.js - Navigation enrichie
├── PersonaEngine.js - Algorithme personas (testé)
└── InsightsEngine.js - Sélection insights
```

### **🔴 Connexions Manquantes**

```
🚧 INTEGRATION GAPS
├── Services → Composants (non-connectés)
├── Intelligence → UX (statique)
├── Personas → Chat (non-personnalisé)
├── Patterns → Suggestions (non-exploités)
└── Données → Interface (sélection manuelle)
```

---

## 🎯 **PRIORITÉS DÉVELOPPEMENT**

### **Phase 1 : Connexions Core** 🔥
1. **PersonalizationEngine** → Chat personnalisé par persona
2. **VignettesService** → Navigation contextuelle CycleView
3. **InsightsEngine** → Sélection intelligente vs liste statique
4. **AdaptiveGuidance** → Suggestions basées sur patterns

### **Phase 2 : Intelligence Adaptative**
1. **useSmartSuggestions** → Actions prioritaires contextuelles
2. **useAdaptiveInterface** → Layout évolutif selon maturité
3. **FeatureGatingSystem** → Révélation progressive fonctionnalités
4. **OnboardingContinuum** → Guidance post-onboarding

### **Phase 3 : Optimisation**
1. **Performance** - Cache intelligent, optimisations
2. **Tests** - Coverage intelligence services
3. **Analytics** - Métriques efficacité suggestions

---

## 📁 **STRUCTURE PROJET ACTUELLE**

```
MOODCYCLE-APP/
├── __tests__/                          # 🧪 Tests (626 lignes)
│   ├── cycleCalculations.test.js       # ✅ Tests calculs cycle  
│   └── PersonaEngine.test.js           # ✅ Tests algorithme personas
├── app/                                # 🚀 Expo Router
│   ├── onboarding/                     # ✅ 8 écrans fonctionnels
│   └── (tabs)/                         # ✅ Navigation principale
│       ├── chat/                       # 🟡 Chat basique (non-personnalisé)
│       ├── cycle/                      # 🟡 Affichage statique
│       └── notebook/                   # ✅ Journal iOS natif complet
├── src/
│   ├── stores/                         # ✅ State Management Complet
│   │   ├── useUserStore.js             # ✅ Hub central + profil
│   │   ├── useUserIntelligence.js      # 🟡 Collecte patterns (non-exploité)
│   │   ├── useEngagementStore.js       # 🟡 Métriques (non-utilisées)
│   │   ├── useChatStore.js             # ✅ Conversations
│   │   └── useNotebookStore.js         # ✅ Journal personnel
│   ├── services/                       # 🔴 Services Créés (Non-Connectés)
│   │   ├── PersonalizationEngine.js    # 🔴 Factory contexts
│   │   ├── AdaptiveGuidance.js         # 🔴 Messages adaptatifs
│   │   ├── VignettesService.js         # 🔴 Navigation enrichie
│   │   ├── PersonaEngine.js            # ✅ Algorithme testé
│   │   ├── ChatService.js              # ✅ API Claude
│   │   └── InsightsEngine.js           # 🔴 Sélection intelligente
│   ├── hooks/                          # 🔴 Hooks Spécialisés (Non-Utilisés)
│   │   ├── useSmartSuggestions.js      # 🔴 Orchestration
│   │   ├── useAdaptiveInterface.js     # 🔴 Interface évolutive
│   │   ├── usePersonalizedInsight.js   # 🔴 Insights premium
│   │   └── useVignettes.js             # 🔴 Intégration complète
│   ├── features/                       # 🎨 Composants Métier
│   │   ├── shared/
│   │   │   ├── ParametresModal.jsx     # ✅ Paramètres complets
│   │   │   └── MeluneAvatar.jsx        # ✅ Avatar réactif
│   │   └── notebook/
│   │       ├── SwipeableEntryIOS.jsx   # ✅ Swipe natif
│   │       └── ToolbarIOS.jsx          # ✅ Toolbar native
│   └── data/                           # ✅ Données Thérapeutiques Validées
       ├── phases.json                 # ✅ 330 lignes - Contextes
       ├── insights.json               # ✅ 2329 lignes - Conseils
       ├── vignettes.json              # ✅ 571 lignes - Contenus
       └── closings.json               # ✅ 27 lignes - Formules
```

---

## 🎯 **PROCHAINES ÉTAPES**

### **Objectif Immédiat : MVP Intelligence** 
Connecter les services d'intelligence existants aux composants pour créer une première expérience adaptative.

### **Sessions de Développement Planifiées**
1. **Session Audit** - Cartographier connexions manquantes
2. **Session Core** - Connecter PersonalizationEngine + VignettesService  
3. **Session Intelligence** - Implémenter suggestions adaptatives

### **Résultat Attendu**
Transformer l'app statique actuelle en expérience intelligente avec navigation contextuelle et suggestions personnalisées.

---

## 🚀 **QUICK START**

### **Installation**

```bash
git clone https://github.com/your-repo/MOODCYCLE-APP.git
cd MOODCYCLE-APP
npm install
```

### **Démarrage**

```bash
npm start          # Expo DevTools
npm run ios        # Simulateur iOS
npm run android    # Émulateur Android

# Tests
npm test              # Tests unitaires (626 lignes)
```

### **Stack Technique**

- **Framework** : React Native + Expo SDK 53
- **Navigation** : Expo Router (file-based)
- **State** : Zustand + persistence
- **Storage** : AsyncStorage (offline-first)
- **Tests** : Jest + tests algorithmes
- **iOS** : ActionSheetIOS, Haptics, Share API natifs

---

**📱 Application cycle menstruel avec vision d'intelligence adaptative**  
**État** : MVP Fonctionnel + Architecture Intelligence (Connexions en cours) 🚧
