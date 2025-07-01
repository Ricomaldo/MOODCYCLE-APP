# 🌊 ARTIFACT 2 - Écran 400 Observation Guidelines

## 📋 CONTEXTE TRANSFORMATION
- **Fichier** : `app/onboarding/400-cycle.jsx`
- **Révolution** : De "Quand ?" à "Comment te sens-tu ?"
- **Vision** : Observer patterns personnels vs calculer moyennes
- **Intégration** : CycleObservationEngine existant

## 🎯 TRANSFORMATIONS MAJEURES

### 1. TITRE & APPROCHE
```
REMPLACER :
"Parle-moi de ton rythme naturel"
"Quand ont commencé tes dernières règles ?"

PAR :
"Comment te sens-tu dans ton corps aujourd'hui ?"
"Ton ressenti révèle ton langage cyclique unique"
```

### 2. INTERFACE - 4 Sliders Intuitifs
```
SUPPRIMER : DatePicker + sélection durée cycle

CRÉER : 4 sliders visuels (1-5)

1. 🌊 ÉNERGIE PHYSIQUE
   Labels : "Épuisée" → "Débordante"
   Couleurs : Dégradé bleu foncé → turquoise vif
   
2. 💭 CLARTÉ MENTALE  
   Labels : "Brouillard" → "Cristalline"
   Couleurs : Dégradé gris → blanc brillant
   
3. 💗 ÉTAT ÉMOTIONNEL
   Labels : "Instable" → "Sereine"
   Couleurs : Dégradé violet → rose doux
   
4. 🔮 CONNEXION INTUITIVE
   Labels : "Déconnectée" → "Alignée"
   Couleurs : Dégradé indigo → doré
```

### 3. LOGIQUE DÉTECTION
```javascript
// Après sliders remplis, utiliser :
const observation = {
  energy: sliderValues[0],      // 1-5
  clarity: sliderValues[1],      // 1-5
  emotion: sliderValues[2],      // 1-5
  intuition: sliderValues[3]     // 1-5
};

// CycleObservationEngine existant
const detectedPhase = CycleObservationEngine.inferPhaseFromObservation(observation);

// Messages résultat
MESSAGES_DETECTION = {
  menstrual: "Je sens une énergie d'introspection profonde... Phase de Repos 🌙",
  follicular: "Une belle énergie de renouveau circule... Phase de Renaissance 🌱",
  ovulatory: "Tu rayonnes d'une force communicative... Phase d'Expression ☀️",
  luteal: "Une sagesse intuitive monte en toi... Phase de Transformation 🍂"
}
```

### 4. FALLBACK INTELLIGENT
```
SI détection incertaine :
- Message : "Tes patterns uniques commencent à se révéler..."
- Phase par défaut : "discovery"
- Encouragement : "Continue d'observer, Melune apprend de toi"
```

### 5. VALIDATION UX
```
- Animation douce lors du slide
- Valeur actuelle visible (bulle au-dessus)
- Possibilité de modifier avant validation
- Bouton : "Capturer mon ressenti"
```

### 6. MESSAGES MELUNE ADAPTATIFS
```javascript
APRÈS CAPTURE :
{
  emma: "Super ! J'apprends déjà tes patterns uniques ✨",
  laure: "Observation enregistrée. Votre profil s'affine.",
  clara: "Yes ! On révèle ton pouvoir cyclique ensemble !",
  sylvie: "Merci de partager ton ressenti profond...",
  christine: "Votre sagesse corporelle guide notre chemin."
}
```

## 🚫 ERREURS À ÉVITER
- ❌ Mentionner dates ou durées
- ❌ Forcer une phase si incertain
- ❌ Sliders trop techniques
- ❌ Validation complexe
- ❌ Oublier le fallback

## ✅ VALIDATIONS REQUISES
- [ ] 4 sliders fonctionnels avec icônes
- [ ] Détection phase OU fallback "discovery"
- [ ] Message confirmation personnalisé
- [ ] Sauvegarde dans useCycleStore.observations
- [ ] Transition douce vers écran 500

## 💡 ASTUCE IMPLÉMENTATION
Réutiliser la structure des étapes existante (STEPS) mais remplacer DATE et DURATION par OBSERVATION. Garder INTRO et VALIDATION.