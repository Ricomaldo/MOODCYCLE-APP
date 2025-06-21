# 🗑️ Suppression ContextFormatter.js

## ❌ Fichier à supprimer complètement
```
src/services/ContextFormatter.js
```

## ✅ Remplacé par :

### 1. **useContext.js hook (50 lignes vs 400)**
```javascript
export function useContext() {
  const user = useUserStore();
  
  return {
    getApiContext: () => user.getContextForAPI(),
    getCurrentPhase: () => user.getCurrentPhase(),
    hasMinimumData: () => user.hasMinimumData()
  };
}
```

### 2. **Logique dans useUserStore**
```javascript
// useUserStore.js - méthode déjà présente
getContextForAPI: () => {
  const state = get();
  return {
    persona: state.persona.assigned,
    phase: state.getCurrentPhase(),
    preferences: state.preferences,
    profile: state.profile,
  };
}
```

## 🔄 Migration imports

**Dans tous les fichiers qui importent ContextFormatter :**

```javascript
// ❌ Ancien
import ContextFormatter from '../services/ContextFormatter.js';
const context = ContextFormatter.formatForAPI();

// ✅ Nouveau  
import { useContext } from '../hooks/useContext.js';
const { getApiContext } = useContext();
const context = getApiContext();
```

## 📊 Bénéfices

- **-90% code** (400 → 40 lignes)
- **Cohérence** avec stores unifiés
- **Performance** (plus de cache 5min inutile)
- **Simplicité** (logique centralisée)