# 🧠 DevPanel - Tutoriel Développeur

## 🎯 **Qu'est-ce que le DevPanel ?**

Le DevPanel est votre **tableau de bord de développement** qui vous permet de :
- Tester rapidement différents scénarios utilisateur
- Naviguer instantanément dans le cycle menstruel
- Simuler des données pour vos tests
- Déboguer l'intelligence artificielle

## 🚀 **Comment l'ouvrir ?**

1. **Cherchez l'icône 🧠** en haut à droite de votre écran
2. **Tapez dessus** → Le panel s'ouvre
3. **Tapez sur ✕** pour le fermer

> ⚠️ **Visible uniquement en développement** (pas en production)

## 📱 **Les 4 Onglets Principaux**

### 🌟 **Test** - Intelligence & Observations
**Que faire ici ?**
- Simuler différents profils d'utilisatrices
- Ajouter des observations factices pour tester
- Voir les données d'apprentissage de l'IA

**Boutons utiles :**
- `🌙 Active le Soir` → Simule une utilisatrice qui utilise l'app le soir
- `🌅 Matinale Créative` → Simule une utilisatrice créative du matin
- `➕ Add Fake Obs` → Ajoute 5 observations d'exemple
- `🗑️ Clear Observations` → Supprime toutes les observations

### 🔄 **Cycle** - Navigation Temporelle
**Que faire ici ?**
- Sauter à n'importe quel jour du cycle
- Tester différentes phases
- Simuler un cycle complet

**Exemples pratiques :**
- Clic sur `men` → Vous êtes en période de règles
- Clic sur `J14` → Vous êtes au jour 14 (ovulation)
- Clic sur `🎬 Simuler J1→J28` → Regarde le cycle défiler automatiquement

### 🎭 **Persona** - Profils Utilisateur
**Que faire ici ?**
- Tester différents types d'utilisatrices
- Voir comment l'app s'adapte à chaque profil

**Les personas disponibles :**
- **Emma** → Jeune, découvre son cycle
- **Clara** → Experte, utilise tout
- **Miranda** → Coach, accompagne d'autres

### 🧹 **Utils** - Outils & Reset
**Que faire ici ?**
- Naviguer rapidement vers différentes pages
- Voir les statistiques actuelles
- Tout remettre à zéro

## 🎓 **Scénarios de Test Pratiques**

### **Test 1 : Découverte d'une nouvelle utilisatrice**
```
1. Onglet Persona → Clic "Emma"
2. Onglet Test → Clic "🌱 Débutante" 
3. Naviguez dans l'app → Voyez les conseils adaptés
```

### **Test 2 : Utilisatrice experte en phase ovulatoire**
```
1. Onglet Persona → Clic "Clara"
2. Onglet Cycle → Clic "ovu" (ovulatoire)
3. Allez dans Conseils → Voyez le contenu adapté
```

### **Test 3 : Cycle complet avec données**
```
1. Onglet Test → Clic "➕ Add Fake Obs"
2. Onglet Cycle → Clic "🎬 Simuler J1→J28"
3. Observez les changements dans l'app
```

### **Test 4 : Reset complet**
```
1. Onglet Utils → Clic "🗑️ Reset Complet"
2. Confirmez → Tout est remis à zéro
3. Recommencez vos tests
```

## 📊 **Comprendre la Barre de Status**

En haut du panel, vous voyez : `auto | follicular J10 | Conf: 25%`

- **auto** = Persona actuel (ou "auto" si aucun)
- **follicular J10** = Phase actuelle + jour du cycle
- **Conf: 25%** = Niveau de confiance de l'IA (0-100%)

## 💡 **Conseils d'Utilisation**

### **Pour tester une nouvelle fonctionnalité :**
1. Choisissez un persona adapté
2. Mettez-vous dans la bonne phase du cycle
3. Ajoutez des données si nécessaire
4. Testez votre fonctionnalité

### **Pour déboguer un problème :**
1. Reproduisez les conditions du bug
2. Utilisez le bouton "🐛 Debug Intelligence"
3. Consultez les logs dans la console

### **Pour nettoyer après vos tests :**
1. Onglet Utils → "🗑️ Reset Complet"
2. Ou onglet Test → "🧹 Reset Intelligence" (plus ciblé)

## 🚨 **Attention**

- Les changements sont **sauvegardés** (stores persistants)
- Pensez à **reset** entre vos différents tests
- Le panel **disparaît en production** automatiquement

---

**C'est tout ! Vous êtes prêt à développer efficacement avec le DevPanel** 🚀 