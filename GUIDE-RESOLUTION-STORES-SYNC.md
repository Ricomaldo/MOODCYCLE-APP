# Guide de Résolution - Erreur Stores Sync

## ❌ Problème Identifié

```
ERROR  ❌ Failed to collect stores: [TypeError: iterator method is not callable]
```

## 🔍 Cause Racine

L'erreur se produit dans la fonction `cleanObject` du `StoresSyncService` quand elle essaie d'appeler `Object.entries()` sur des objets qui contiennent des Maps non correctement sérialisées.

### Problèmes Spécifiques

1. **BehaviorAnalyticsService**: Les `patterns` utilisent des Maps (`new Map()`) qui ne sont pas correctement restaurées depuis AsyncStorage
2. **Fonction cleanObject**: Ne gère pas correctement les objets avec des propriétés `Symbol.iterator` malformées

## ✅ Solutions Implémentées

### 1. Correction de BehaviorAnalyticsService

**Fichier**: `src/services/BehaviorAnalyticsService.js`

```javascript
// AVANT (problématique)
async loadStoredBehaviors() {
  const data = JSON.parse(stored);
  this.patterns = data.patterns || this.patterns; // ❌ Écrase les Maps avec des objets
}

// APRÈS (corrigé)
async loadStoredBehaviors() {
  const data = JSON.parse(stored);
  if (data.patterns) {
    // Restaurer les Maps depuis les objets sérialisés
    this.patterns = {
      navigation: new Map(Object.entries(data.patterns.navigation || {})),
      interactions: new Map(Object.entries(data.patterns.interactions || {})),
      timing: new Map(Object.entries(data.patterns.timing || {})),
      sequences: data.patterns.sequences || []
    };
  }
}
```

### 2. Amélioration de la fonction cleanObject

**Fichier**: `src/services/StoresSyncService.js`

```javascript
cleanObject(obj) {
  // Protection contre les Map, Set, et autres objets non-itérables
  if (obj instanceof Map) {
    return Object.fromEntries(obj);
  }
  
  if (obj instanceof Set) {
    return Array.from(obj);
  }
  
  // Protection contre les objets avec Symbol.iterator malformé
  try {
    if (typeof obj === 'object' && obj.constructor === Object) {
      // Traitement sécurisé des objets normaux
    } else {
      // Sérialisation de sécurité pour objets complexes
      const serialized = JSON.parse(JSON.stringify(obj));
      return this.cleanObject(serialized);
    }
  } catch (error) {
    // Retour d'erreur informatif
    return { 
      __cleaning_failed: true, 
      __type: obj.constructor?.name || 'unknown',
      __error: error.message 
    };
  }
}
```

### 3. Protection dans collectAllStores

**Fichier**: `src/services/StoresSyncService.js`

```javascript
collectAllStores() {
  // Fonction helper pour collecter un store en sécurité
  const safeCollectStore = (storeName, collectFn) => {
    try {
      const result = collectFn();
      console.log(`✅ ${storeName} collected successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to collect ${storeName}:`, error);
      return { 
        __collection_failed: true, 
        __store_name: storeName,
        __error: error.message 
      };
    }
  };
  
  // Utilisation sécurisée pour chaque store
  const stores = {
    userStore: safeCollectStore('userStore', () => useUserStore.getState()),
    behaviorStore: safeCollectStore('behaviorStore', () => behaviorAnalytics.getSyncData()),
    // ... autres stores
  };
}
```

## 🧪 Test de la Correction

Un script de debug a été créé pour valider les corrections :

```bash
cd MOODCYCLE-APP
node debug-stores-sync.js
```

**Résultat attendu** :
```
🎉 All debug tests completed!
✅ Map: Success
✅ Pattern conversion: Success
✅ Complete sync simulation: Success
```

## 📊 Diagnostic en Temps Réel

### Vérifier les logs dans l'app

```javascript
// Dans DevPanel ou console
console.log('🔍 Checking stores sync...');
const stores = storesSyncService.collectAllStores();
console.log('📊 Stores collected:', Object.keys(stores));

// Vérifier les erreurs spécifiques
Object.entries(stores).forEach(([name, store]) => {
  if (store.__collection_failed) {
    console.error(`❌ ${name} failed:`, store.__error);
  }
});
```

### Vérifier les patterns BehaviorAnalytics

```javascript
// Vérifier que les Maps sont correctement initialisées
console.log('🎯 Behavior patterns:');
console.log('Navigation:', behaviorAnalytics.patterns.navigation instanceof Map);
console.log('Interactions:', behaviorAnalytics.patterns.interactions instanceof Map);
```

## 🔄 Actions de Maintenance

### Reset des données corrompues

Si les données AsyncStorage sont corrompues :

```javascript
// Dans DevPanel
await behaviorAnalytics.resetData();
await deviceMetrics.resetData();
await storesSyncService.resetSync();
```

### Monitoring continu

```javascript
// Ajouter des logs pour surveiller
storesSyncService.on('collection_error', (error) => {
  console.error('Collection error:', error);
  // Envoyer à un service de monitoring
});
```

## 🎯 Prévention Future

### 1. Validation des données

```javascript
// Ajouter des validations dans getSyncData()
getSyncData() {
  const data = {
    patterns: {
      navigation: this.patterns.navigation instanceof Map 
        ? Object.fromEntries(this.patterns.navigation)
        : this.patterns.navigation,
      // ... autres validations
    }
  };
  
  // Vérifier que les données sont sérialisables
  try {
    JSON.stringify(data);
    return data;
  } catch (error) {
    console.error('Data not serializable:', error);
    return { __serialization_error: error.message };
  }
}
```

### 2. Tests automatisés

```javascript
// Ajouter des tests unitaires
describe('StoresSyncService', () => {
  it('should handle Maps correctly', () => {
    const store = { patterns: { navigation: new Map([['key', 'value']]) } };
    const cleaned = service.cleanObject(store);
    expect(cleaned.patterns.navigation).toEqual({ key: 'value' });
  });
});
```

## 📋 Checklist de Vérification

- [ ] BehaviorAnalyticsService restaure correctement les Maps
- [ ] cleanObject gère les Maps et Sets
- [ ] collectAllStores capture les erreurs individuelles
- [ ] Les données sont sérialisables (test JSON.stringify)
- [ ] Les logs montrent "✅ Stores sync initialized successfully"
- [ ] Aucune erreur "iterator method is not callable"

## 🚀 Déploiement

Les corrections sont prêtes à être testées. Redémarrer l'application pour appliquer les changements :

```bash
# Redémarrer Metro
npx react-native start --reset-cache

# Ou redémarrer l'app complètement
```

## 📞 Support

Si le problème persiste :

1. Vérifier les logs complets dans la console
2. Exécuter le script de debug
3. Réinitialiser les données AsyncStorage si nécessaire
4. Vérifier que tous les stores retournent des données sérialisables