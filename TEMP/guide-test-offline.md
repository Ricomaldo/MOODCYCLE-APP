# 🧪 Guide de Test Mode Offline - MoodCycle

## 📋 Test rapide (5 minutes)

### 1. Préparer le simulateur
```bash
# Lancer Expo
npx expo start

# Ouvrir sur simulateur iOS (touche 'i')
```

### 2. Activer mode offline
```bash
# Dans un nouveau terminal
chmod +x offline-simulator.sh
./offline-simulator.sh on
```

### 3. Tester dans l'app

#### Option A - Via Console React Native
```javascript
// Ouvrir DevMenu (Cmd+D dans simulateur)
// Aller dans "Open JS Debugger"

// Tester NetworkQueue
import NetworkQueue from './src/services/NetworkQueue';
await NetworkQueue.initialize();

// Envoyer message offline
await NetworkQueue.enqueue({
  url: 'https://moodcycle.irimwebforge.com/api/chat',
  method: 'POST',
  body: { message: 'Test offline' }
});

// Vérifier
NetworkQueue.getQueueStatus();
// → { total: 1, pending: 1, processing: 0, failed: 0 }
```

#### Option B - Via l'app directement
1. Aller dans l'onglet Chat
2. Envoyer un message à Melune
3. Observer : message devrait s'afficher avec indicateur "en attente"

### 4. Rétablir connexion
```bash
# Dans le terminal
./offline-simulator.sh off
```

### 5. Observer la synchronisation
- Les messages en attente devraient partir automatiquement
- Melune devrait répondre après quelques secondes
- La queue devrait se vider

## 🔍 Logs à observer

**Succès :**
- "📤 Requête ajoutée avec ID: xxx"
- "🔄 Connexion rétablie - queue devrait se vider"
- "✅ Queue vidée automatiquement"

**Erreurs possibles :**
- "❌ Aucun simulateur iOS en cours" → Lancer Expo d'abord
- "Unable to resolve expo-haptics" → Commenter les imports Haptics temporairement

## 💡 Test avancé

```javascript
// Test multiple messages
for (let i = 1; i <= 3; i++) {
  await NetworkQueue.enqueue({
    url: 'https://moodcycle.irimwebforge.com/api/chat',
    method: 'POST',
    body: { message: `Message ${i}` }
  });
}
NetworkQueue.getQueueStatus();
// → { total: 3, pending: 3, ... }
```

## ✅ Validation

Le mode offline fonctionne si :
1. Les messages sont stockés localement quand offline
2. La queue se vide automatiquement au retour connexion
3. Les réponses Melune arrivent après sync
4. Aucune perte de données