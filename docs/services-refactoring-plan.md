# 🔧 Plan Refactorisation Services MoodCycle

## 🎯 Architecture cible simplifiée

### **Services conservés (épurés)**
```
src/services/
├── ContentManager.js    # ✅ OK - API insights/phases
├── PersonaEngine.js     # 🔄 Simplifié - algorithme pur
└── ChatService.js       # 🔄 Épuré - suppression cache complexe
```

### **Nouvelles utilities**
```
src/utils/
├── dateUtils.js         # ✅ OK - utilitaires dates purs
└── formatters.js        # 🆕 Formatage simple données
```

### **Nouveaux hooks**
```
src/hooks/
├── useNetworkStatus.js  # ✅ Déjà bon
├── usePersona.js        # 🆕 Logique persona + UserStore
└── useInsights.js       # 🆕 Insights personnalisés
```

---

## 📝 Services à refactoriser

### **1. ChatService.js → Simplifié**

**❌ Supprimer :**
- Cache contexte complexe (5min)
- Historique conversationnel lourd  
- ContextFormatter dependency

**✅ Garder :**
- Device ID génération
- API call simple
- Fallbacks basiques

```javascript
// Nouvelle version épurée
class ChatService {
  async sendMessage(message) {
    const context = useUserStore.getState().getContextForAPI();
    
    try {
      const response = await fetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, context })
      });
      return await response.json();
    } catch (error) {
      return this.getFallbackResponse(message);
    }
  }
}
```

### **2. ContextFormatter.js → Hook**

**❌ Supprimer fichier entier** (400 lignes → 0)

**✅ Remplacer par hook simple :**
```javascript
// hooks/useContext.js (50 lignes max)
export function useContext() {
  const user = useUserStore();
  
  return {
    getApiContext: () => user.getContextForAPI(),
    getCurrentPhase: () => user.getCurrentPhase(),
    hasMinimumData: () => user.hasMinimumData()
  };
}
```

### **3. PersonaEngine.js → Algorithme pur**

**✅ Garder :**
- Algorithme calcul (fonction pure)
- Tests mapping

**❌ Supprimer :**
- Intégration stores (maintenant dans useUserStore)

```javascript
// Version épurée - fonction pure uniquement
export function calculatePersona(userData) {
  const scores = calculatePersonaScores(userData);
  const bestMatch = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0];
  
  return {
    assigned: bestMatch[0],
    confidence: bestMatch[1] / 100,
    scores
  };
}
```

### **4. InsightsEngine.js → Hook**

**✅ Transformer en hook :**
```javascript
// hooks/useInsights.js
export function useInsights() {
  const user = useUserStore();
  
  return {
    getPersonalized: async () => {
      const context = user.getContextForAPI();
      return ContentManager.getInsights(context);
    }
  };
}
```

---

## 🗂️ Nouveaux utilitaires

### **utils/formatters.js**
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
```

---

## 🎯 Hooks spécialisés

### **hooks/usePersona.js**
```javascript
export function usePersona() {
  const user = useUserStore();
  
  return {
    current: user.persona.assigned,
    calculate: user.calculatePersona,
    confidence: user.persona.confidence,
    isAssigned: !!user.persona.assigned
  };
}
```

### **hooks/useInsights.js** 
```javascript
export function useInsights() {
  const user = useUserStore();
  const [insights, setInsights] = useState([]);
  
  const loadPersonalized = useCallback(async () => {
    const context = user.getContextForAPI();
    const data = await ContentManager.getInsights();
    // Filtrage simple par phase/persona
    const filtered = data[context.phase]?.filter(
      insight => insight.personas.includes(context.persona)
    ) || [];
    setInsights(filtered);
  }, [user]);
  
  return { insights, loadPersonalized };
}
```

---

## 📊 Bénéfices attendus

### **Réduction drastique**
- **-70% code services** (1200 → 350 lignes)
- **-80% complexité** cache/contexte
- **+100% cohérence** avec stores unifiés

### **Architecture claire**
```
Composants → Hooks → Services → API
     ↓         ↓        ↓       ↓
  usePersona  Pure    Content  External
  useInsights Logic   Manager
  useContext  Only
```

### **Performance**
- Suppression cache mobile inutile
- Moins de watchers React
- Logique centralisée dans stores

---

## ⚡ Actions immédiates

### **Étape 1 : Corrections critiques** (15min)
1. Fixer imports stores dans services
2. Supprimer dateUtils cycle logic
3. Tester chat fonctionne

### **Étape 2 : Création hooks** (45min)  
1. `usePersona.js` 
2. `useInsights.js`
3. `utils/formatters.js`

### **Étape 3 : Simplification services** (60min)
1. Épurer `ChatService.js`
2. Supprimer `ContextFormatter.js`
3. Épurer `PersonaEngine.js`

### **Étape 4 : Migration composants** (30min)
1. Remplacer imports services par hooks
2. Tests fonctionnels
3. Cleanup fichiers obsolètes

---

## 🎭 Philosophie Mélune

**"Simple, utile, maintenable"**

- Services = logique métier pure
- Hooks = pont React intelligent  
- Stores = source de vérité unique
- Utils = fonctions pures réutilisables

Fini le sur-engineering, place à l'efficacité ! ✨