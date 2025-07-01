# ✨ ARTIFACT 3 - Intelligence Visible Guidelines

## 📋 CONTEXTE VISIBILITÉ
- **Principe** : "Intelligence invisible = échec produit"
- **Objectif** : Montrer que Melune APPREND activement
- **Touchpoints** : Badge IA + Compteur + Messages + Récap
- **Fichiers** : Tous écrans post-200 + composants partagés

## 🎯 COMPOSANTS À CRÉER/ADAPTER

### 1. BADGE IA UNIVERSEL
```
CRÉER : <IntelligenceBadge /> dans shared/

DESIGN :
- Position : Top-right de chaque écran (après 200)
- Visuel : Cercle 40x40px avec icône cerveau
- États :
  - Inactif : Gris clair (avant écran 200)
  - Activation : Animation pulse + lueur
  - Actif : Couleur persona + micro-animations

COMPORTEMENT :
- Pulse léger quand apprentissage en cours
- Tooltip au tap : "Melune apprend de toi"
- Compteur progression visible
```

### 2. COMPTEUR PROGRESSION
```
INTÉGRER dans IntelligenceBadge :

FORMAT : "15%" → "30%" → "45%"...

CALCUL :
- Écran 200 (journey) : +15%
- Écran 300 (âge) : +10%
- Écran 400 (observation) : +20%
- Écran 500 (préférences) : +15%
- Écran 550 (prénom) : +10%
- Écran 600 (archétype) : +15%
- Écran 700 (essai) : +5%
- Écran 800 : 100%

ANIMATION : Progression smooth sur 1s
```

### 3. MESSAGES APPRENTISSAGE
```
AJOUTER dans meluneMessage de chaque écran :

FORMAT : "[Message contextuel]. {APPRENTISSAGE}"

EXEMPLES :
- Écran 200 : "...qui attend de se révéler. ✨ J'apprends déjà!"
- Écran 300 : "...mieux te connaître. 🧠 Profil: 25%"
- Écran 400 : "...unique. 💫 Patterns détectés!"
- Écran 500 : "...résonne en toi. 🎯 Personnalisation active"
```

### 4. RÉCAP INTELLIGENCE (Écran 800)
```
CRÉER : <IntelligenceRecap /> 

STRUCTURE :
┌─────────────────────────────────┐
│ ✨ Ce que j'ai appris de toi   │
├─────────────────────────────────┤
│ 🎭 Persona sociale : {Emma}     │
│ 🌙 Archétype : {Sorcière}       │
│ 🌊 Phase actuelle : {Lutéale}   │
│ 💫 Patterns uniques : 3 détectés│
│ 🎯 Personnalisation : 95%       │
└─────────────────────────────────┘

ANIMATION : Apparition ligne par ligne
```

### 5. MICRO-FEEDBACKS
```
AJOUTER animations subtiles :

- Choix fait → Badge pulse 1x
- Slider bougé → Lueur douce
- Validation → Check animé dans badge
- Navigation → Trail lumineux entre écrans
```

### 6. HOOK TRACKING
```javascript
// Dans useOnboardingIntelligence
ENRICHIR trackAction() :

trackAction('choice_made', {
  screen,
  choice,
  intelligenceGained: calculatedPercentage,
  patternsDetected: newPatterns
});

// Trigger animation badge à chaque gain
```

## 🚫 ERREURS À ÉVITER
- ❌ Pourcentages qui stagnent
- ❌ Badge trop imposant
- ❌ Animations distrayantes
- ❌ Termes techniques ("ML", "IA")
- ❌ Progression non-linéaire

## ✅ VALIDATIONS REQUISES
- [ ] Badge visible dès écran 200
- [ ] Progression monte à chaque écran
- [ ] Au moins 3 "patterns détectés" affichés
- [ ] Récap final cohérent avec parcours
- [ ] Animations fluides < 60fps

## 💡 ASTUCES IMPLÉMENTATION
1. Utiliser Animated API pour toutes les transitions
2. Store progression dans useOnboardingIntelligence
3. Badge en position absolute pour éviter re-layouts
4. Précharger animations pour fluidité