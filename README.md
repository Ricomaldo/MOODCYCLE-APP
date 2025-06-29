# 📱 MoodCycle App - Intelligence Cyclique Évolutive

> **Vision** : Première IA thérapeutique spécialisée cycle féminin avec architecture d'intelligence adaptative
> 
> **État Actuel** : MVP Fonctionnel + Intelligence Partiellement Connectée | **Version** : 7.0-alpha | **Statut** : En Développement 🚧

---

## 🎯 **VISION & OBJECTIF**

### **Problème Identifié**
- **Rupture d'expérience** : Onboarding prometteur → outils excellents mais sans guidance personnalisée
- **Paradoxe du choix** : Trop d'options parfaites créent l'immobilisme
- **Désengagement précoce** : 60% abandon après J7, faute de personnalisation effective

### **Solution Cible : 3 Systèmes Intégrés**
1. **🎭 Intelligence Comportementale** : 5 personas × patterns temporels × préférences
2. **📈 Progression Adaptative** : Interface évolutive selon maturité utilisateur
3. **💬 Guidance Contextuelle** : Suggestions intelligentes temps réel

---

## 📊 **ÉTAT ACTUEL - ARCHITECTURE RÉELLE**

### **🏗️ Architecture Stores/Services/Hooks (Sophistiquée)**

```
src/
├── stores/                           # ✅ STATE MANAGEMENT ZUSTAND
│   ├── useUserStore.js              # ✅ Profil utilisateur + préférences
│   ├── useCycleStore.js             # ✅ NOUVEAU - Store cycle dédié
│   ├── useUserIntelligence.js       # ✅ Patterns comportementaux
│   ├── useEngagementStore.js        # ✅ Métriques progression
│   ├── useChatStore.js              # ✅ Conversations + historique
│   └── useNotebookStore.js          # ✅ Journal + entries
│
├── services/                        # ✅ BUSINESS LOGIC
│   ├── PersonalizationEngine.js     # ✅ Factory 5 personas × 4 phases
│   ├── AdaptiveGuidance.js          # ✅ Templates guidance contextuelle
│   ├── InsightsEngine.js            # ✅ Sélection insights + cache
│   ├── VignettesService.js          # ✅ Contenus adaptatifs
│   ├── ChatService.js               # ✅ IA conversationnelle
│   └── ExportService.js             # ✅ Export données + partage
│
├── hooks/                           # ✅ ORCHESTRATION INTELLIGENCE
│   ├── useSmartSuggestions.js       # ✅ Suggestions contextuelles
│   ├── usePersonalizedInsight.js    # ✅ Insights personnalisés
│   ├── useAdaptiveInterface.js      # ✅ Interface évolutive
│   ├── useVignettes.js              # ✅ Contenus adaptatifs
│   ├── useOnboardingIntelligence.js # ✅ Intelligence onboarding
│   ├── usePersona.js                # ✅ Gestion personas
│   ├── useTheme.js                  # ✅ Thèmes adaptatifs
│   ├── useNetworkStatus.js          # ✅ Gestion offline
│   └── usePerformanceMonitoring.js  # ✅ Monitoring performance
│
└── data/                           # ✅ Données Thérapeutiques Validées
    ├── phases.json                 # ✅ 330 lignes - Contextes
    ├── insights.json               # ✅ 178 lignes - Conseils
    ├── vignettes.json              # ✅ 571 lignes - Contenus
    └── closings.json               # ✅ 27 lignes - Formules
```

---

## 🔌 **CONNEXIONS INTELLIGENCE - ÉTAT RÉEL**

### **✅ COMPOSANTS CONNECTÉS (Intelligence Active)**

#### **🗣️ ChatModal** 
- ✅ **useSmartSuggestions** : Prompts personnalisés par persona + phase
- ✅ **useAdaptiveInterface** : Interface adaptée maturité utilisateur
- ✅ **useCurrentPhase** : Contexte cyclique temps réel

#### **💡 ConseilsView**
- ✅ **usePersonalizedInsight** : Insights personnalisés par contexte
- ✅ **useVignettes** : Contenus adaptatifs par phase + persona
- ✅ **useCycleData** : Contexte cycle pour personnalisation

#### **📝 NotebookView** (Partiel)
- ✅ **useAdaptiveInterface** : Interface évolutive selon maturité
- ✅ **useCurrentPhase** : Contexte phase pour suggestions
- 🟡 **Manque** : useSmartSuggestions pour prompts d'écriture

### **🟡 COMPOSANTS PARTIELLEMENT CONNECTÉS**

#### **🔄 CycleView** (À Connecter)
- ✅ **useCycleStore** : Données cycle + actions
- 🔴 **Manque** : useSmartSuggestions pour guidance cycle
- 🔴 **Manque** : useAdaptiveInterface pour progression

---

## 🔄 **MIGRATION EN COURS : useCycle → useCycleStore**

### **✅ Migration Réussie (24 fichiers)**
- ✅ **Hooks d'intelligence** : useSmartSuggestions, usePersonalizedInsight, useVignettes
- ✅ **Services** : ChatService, ExportService, SyncManager
- ✅ **Composants** : CycleView, CalendarView, ChatModal, NotebookView
- ✅ **Tests** : Tous mockent useCycleStore

### **🗑️ Ancien Hook Supprimé**
- ✅ **src/hooks/useCycle.js** : Supprimé avec succès
- ✅ **Logique migrée** : vers useCycleStore + cycleCalculations.js

### **🧮 Architecture Cycle Finale**
```
useCycleStore.js ←→ cycleCalculations.js ←→ cycleConstants.js
     ↑                      ↑                      ↑
State Management    Fonctions Pures         Configuration
```

---

## 🧪 **TESTS - COUVERTURE RÉELLE**

### **📊 Métriques Précises**
- **2,442 lignes** de tests au total
- **9 hooks** dans src/hooks/
- **Couverture hooks : ~45%** (4/9 hooks testés)

### **✅ Tests Intégration (TOUS PASSENT)**
- **intelligence-pipeline.test.js** : PersonalizationEngine → useSmartSuggestions → ChatModal
- **vignettes-pipeline.test.js** : VignettesService → useVignettes → ConseilsView  
- **adaptive-interface.test.js** : useAdaptiveInterface → NotebookView + maturité

### **✅ Tests Performance (TOUS PASSENT)**
- **performance-flows.test.js** : Métriques hooks < 200ms, mémoire optimisée
- **useSmartSuggestions** : < 20ms génération suggestions
- **useAdaptiveInterface** : < 50ms calcul interface adaptative

### **✅ Tests Unitaires (PARTIELS)**
- **PersonaEngine.test.js** : Algorithme calcul personas (5 personas × 4 phases)
- **cycleCalculations.test.js** : Calculs cycle menstruel + phases
- **Stores mocks** : Mocks centralisés pour tous les stores

### **🟡 Hooks Non Testés Unitairement**
- usePersona, useTheme, useNetworkStatus, usePerformanceMonitoring, useOnboardingIntelligence

---

## 🎯 **PRIORITÉS DÉVELOPPEMENT**

### **🔥 Priorité 1 : Finaliser Connexions Intelligence**
1. **CycleView** : Connecter useSmartSuggestions + useAdaptiveInterface
2. **NotebookView** : Ajouter useSmartSuggestions pour prompts d'écriture
3. **Tests unitaires** : Couvrir les 5 hooks manquants

### **🔥 Priorité 2 : Optimisation Performance**
1. **Monitoring** : usePerformanceMonitoring dans tous les composants
2. **Cache** : Optimiser cache InsightsEngine + VignettesService
3. **Offline** : Finaliser useNetworkStatus + SyncManager

### **🔥 Priorité 3 : Expérience Utilisateur**
1. **Onboarding** : useOnboardingIntelligence dans parcours complet
2. **Thèmes** : useTheme adaptatif selon persona + phase
3. **Notifications** : Guidance proactive contextuelle

---

## 🚀 **SESSIONS DÉVELOPPEMENT PLANIFIÉES**

### **Session 1 : CycleView Intelligence (2-3h)**
- Connecter useSmartSuggestions pour guidance cycle
- Ajouter useAdaptiveInterface pour progression
- Tests intégration CycleView

### **Session 2 : Tests Coverage (1-2h)**
- Tests unitaires 5 hooks manquants
- Améliorer couverture à 80%+
- CI/CD coverage reporting

### **Session 3 : Performance & Offline (2-3h)**
- usePerformanceMonitoring complet
- useNetworkStatus + SyncManager robuste
- Optimisations cache + mémoire

---

## 📱 **ARCHITECTURE TECHNIQUE**

### **🎭 Personas & Phases (20 Combinaisons)**
```
Emma (Introspective) × [Menstruelle, Folliculaire, Ovulatoire, Lutéale]
Clara (Analytique) × [Menstruelle, Folliculaire, Ovulatoire, Lutéale]  
Laure (Pragmatique) × [Menstruelle, Folliculaire, Ovulatoire, Lutéale]
Sophie (Créative) × [Menstruelle, Folliculaire, Ovulatoire, Lutéale]
Mia (Spontanée) × [Menstruelle, Folliculaire, Ovulatoire, Lutéale]
```

### **🎨 Interface Adaptative (3 Niveaux)**
- **Discovery** : Guidance forte, features limitées
- **Learning** : Équilibre guidance/autonomie, features étendues  
- **Autonomous** : Guidance minimale, toutes features

### **💾 Data Pipeline**
```
User Actions → Intelligence Stores → Services → Hooks → Components
     ↓              ↓                  ↓        ↓         ↓
  Tracking    Pattern Analysis    Personalization  Smart UI  Adaptive UX
```

---

## 🔧 **DÉVELOPPEMENT**

### **Installation**
```bash
npm install
npm run ios # ou npm run android
```

### **Tests**
```bash
npm test                    # Tous les tests
npm run test:integration    # Tests intégration
npm run test:performance    # Tests performance
```

### **Dev Tools**
- **DevPanel** : Monitoring intelligence temps réel
- **Performance** : Métriques hooks + mémoire
- **Mocks** : Stores centralisés pour tests

---

## 📈 **MÉTRIQUES CIBLES**

### **Intelligence**
- ✅ **Personas** : 5 personas × 4 phases = 20 contextes
- ✅ **Insights** : 178 insights thérapeutiques validés
- ✅ **Vignettes** : 571 contenus adaptatifs
- 🎯 **Précision** : >80% pertinence suggestions

### **Performance**  
- ✅ **Hooks** : <50ms calculs intelligence
- ✅ **Mémoire** : <100MB utilisation moyenne
- 🎯 **Offline** : Sync robuste + cache intelligent

### **Engagement**
- 🎯 **Rétention J7** : >70% (vs 40% actuel)
- 🎯 **Sessions** : >5min moyenne
- 🎯 **Progression** : 80% atteignent niveau Learning

---

**🚧 Projet en développement actif - Architecture intelligence sophistiquée partiellement connectée**
