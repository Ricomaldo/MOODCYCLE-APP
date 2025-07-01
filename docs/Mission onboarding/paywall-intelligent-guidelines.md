# 🚨 ARTIFACT 1 - Écran 700 Paywall Intelligent Guidelines

## 📋 CONTEXTE CRITIQUE
- **Fichier** : `app/onboarding/700-paywall.jsx`
- **Stratégie** : Prove-Then-Scale (14j gratuits + Version Solidaire)
- **Objectif** : Activation essai SANS friction
- **Danger** : L'écran actuel demande paiement immédiat = 80% abandon

## 🎯 TRANSFORMATIONS REQUISES

### 1. HEADER - Invitation vs Vente
```
REMPLACER :
title: "Explore ton cycle comme jamais"
subtitle: "Découvre ta vraie nature cyclique"

PAR :
title: "Continue ton exploration gratuitement"
subtitle: "14 jours pour révéler ton langage cyclique unique"
```

### 2. ARGUMENTS - Essai vs Fonctionnalités
```
SUPPRIMER : Les listes de benefits par persona

AJOUTER :
- Badge "14 JOURS GRATUITS" prominent
- "Sans carte bancaire requise"
- "Annulation simple à tout moment"
```

### 3. STRUCTURE PRICING - Simplifiée
```
AVANT : 3 cartes (monthly/yearly/lifetime)

APRÈS : 2 options claires
1. 🌟 ESSAI PREMIUM
   "14 jours gratuits"
   "Accès complet à l'intelligence"
   [Commencer l'essai gratuit]

2. 🤝 VERSION SOLIDAIRE
   "Essentiel gratuit pour toujours"
   "Chat + Cycle + Journal basiques"
   [Choisir Solidaire]
```

### 4. MESSAGES PERSONA - Adaptation
```javascript
PERSONA_MESSAGES = {
  emma: {
    cta: "Explorer gratuitement 14 jours ✨",
    reassurance: "Aucun engagement, que de la découverte"
  },
  laure: {
    cta: "Tester l'efficacité 14 jours",
    reassurance: "Évaluez avant de vous engager"
  },
  clara: {
    cta: "14 jours de transformation gratuite ! 🚀",
    reassurance: "Zéro risque, 100% potentiel"
  },
  sylvie: {
    cta: "Découvrir en douceur 14 jours",
    reassurance: "Prenez le temps qu'il vous faut"
  },
  christine: {
    cta: "Explorer sereinement 14 jours",
    reassurance: "Sans pression, à votre rythme"
  }
}
```

### 5. CTA PRINCIPAL - Focus gratuit
```
REMPLACER :
- Tous les boutons avec prix
- "Économisez X€"
- Badges "Meilleure offre"

PAR :
- CTA principal : "Activer mes 14 jours gratuits"
- CTA secondaire : "En savoir plus sur la Version Solidaire"
- Lien discret : "Voir les options après l'essai"
```

### 6. FOOTER - Transparence
```
AJOUTER :
"Après 14 jours : 9,99€/mois ou Version Solidaire gratuite"
"Rappel 3 jours avant la fin de l'essai"
```

## 🚫 ERREURS À ÉVITER
- ❌ Afficher les prix en gros
- ❌ Créer urgence ("Offre limitée")
- ❌ Comparer plans pendant onboarding
- ❌ Demander CB pour essai
- ❌ Cacher Version Solidaire

## ✅ VALIDATIONS REQUISES
- [ ] Aucun prix visible dans titre/sous-titre
- [ ] "14 jours gratuits" visible 3 fois minimum
- [ ] Version Solidaire accessible en 1 tap
- [ ] Message persona cohérent avec profil
- [ ] Possibilité skip vers écran 800

## 💡 ASTUCE IMPLÉMENTATION
Garder la structure de sélection mais remplacer le contenu. Ne pas refaire le composant, juste adapter les textes et la logique des boutons.