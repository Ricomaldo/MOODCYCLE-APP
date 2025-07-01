# 🎭 ARTIFACT 4 - Messages WHO×HOW Guidelines

## 📋 CONTEXTE DOUBLE PERSONA
- **WHO** : Persona sociale (Emma/Laure/Clara/Sylvie/Christine)
- **HOW** : Archétype cyclique (Sorcière/Jeune Fille/Mère/Enchanteresse)
- **Formule** : Message = WHO_tone × HOW_energy
- **Application** : Tous messages post-archétype (écran 600+)

## 🎯 MATRICE DE COMBINAISONS

### 1. STRUCTURE MESSAGE
```
[WHO détermine le style]
[HOW colore l'énergie]
[Contexte guide le contenu]

FORMAT : "{Salutation WHO} + {Observation HOW} + {Guidance contexte}"
```

### 2. EXEMPLES CONCRETS PAR COMBINAISON

#### EMMA (Exploratrice moderne)
```javascript
{
  sorciere: "Hey ! Cette énergie d'introspection est puissante... 🌙 Honore ce besoin de silence intérieur.",
  jeuneFille: "Coucou ! Je sens cette fraîcheur créative en toi ! 🌸 C'est le moment parfait pour explorer.",
  mere: "Salut belle âme ! Tu rayonnes d'une générosité naturelle ☀️ Partage cette lumière !",
  enchanteresse: "Hello ! Cette sagesse transformatrice monte... 🍂 Écoute ces messages subtils."
}
```

#### LAURE (Pragmatique efficace)
```javascript
{
  sorciere: "Optimisons cette phase introspective. La Sorcière vous guide vers l'essentiel.",
  jeuneFille: "Capitalisons sur cette énergie montante. La Jeune Fille initie vos projets.",
  mere: "Maximisons votre impact relationnel. La Mère amplifie votre influence.",
  enchanteresse: "Finalisons avec sagesse. L'Enchanteresse révèle les patterns cachés."
}
```

#### CLARA (Énergique transformatrice)
```javascript
{
  sorciere: "YES ! La Sorcière en toi détient les clés ! 🔮 Plonge dans ce pouvoir !",
  jeuneFille: "BOOM ! La Jeune Fille explose de potentiel ! 💥 Lance-toi !",
  mere: "SHINE ! La Mère irradie sa puissance ! ⚡ Conquiers ton monde !",
  enchanteresse: "TRANSFORM ! L'Enchanteresse révèle ta magie ! ✨ Transcende !"
}
```

#### SYLVIE (Maternelle bienveillante)
```javascript
{
  sorciere: "Ma douce, la Sorcière t'invite au repos sacré... Honore cette pause.",
  jeuneFille: "Ma belle, la Jeune Fille éveille tes rêves... Cultive-les tendrement.",
  mere: "Ma chère, la Mère nourrit tes relations... Rayonne ta douceur.",
  enchanteresse: "Ma précieuse, l'Enchanteresse murmure sa sagesse... Écoute."
}
```

#### CHRISTINE (Sage respectueuse)
```javascript
{
  sorciere: "La Sorcière vous offre sa sagesse ancestrale. Accueillez cette profondeur.",
  jeuneFille: "La Jeune Fille ravive votre essence créatrice. Savourez ce renouveau.",
  mere: "La Mère enrichit votre présence. Partagez cette plénitude.",
  enchanteresse: "L'Enchanteresse couronne votre cycle. Honorez cette complétude."
}
```

### 3. ADAPTATION CONTEXTUELLE

#### MESSAGES PHASE-AWARE
```javascript
// Si archétype correspond à phase actuelle
BONUS_ALIGNEMENT : " Vous êtes parfaitement alignée !"

// Si archétype différent de phase
MESSAGE_NUANCE : " Même en phase {X}, l'archétype {Y} peut s'exprimer."
```

#### MESSAGES ACTION
```javascript
CHAT_PROMPTS = {
  emma_sorciere: "Qu'est-ce que ton corps te murmure dans ce silence ?",
  laure_mere: "Comment optimiser cette énergie relationnelle ?",
  clara_enchanteresse: "Prête à transformer TOUT ce qui ne te sert plus ?",
  // ... etc pour chaque combo
}
```

### 4. INTÉGRATION ÉCRANS

#### Écran 600 - Sélection archétype
```
APRÈS SÉLECTION :
- Message immédiat combo WHO×HOW
- Preview de 2-3 phrases futures
- Sentiment de "Melune me comprend vraiment"
```

#### Écran 800 - Cadeau final
```
INSIGHT PERSONNALISÉ :
- Utilise combo complet
- Référence journey + âge + préférences
- Ton 100% WHO×HOW cohérent
```

#### Chat/Conseils (post-onboarding)
```
CHAQUE MESSAGE :
- Vérifie persona WHO actuel
- Vérifie archétype HOW actuel  
- Applique matrice combinaison
- Ajoute contexte phase si pertinent
```

## 🚫 ERREURS À ÉVITER
- ❌ Mélanger les tons WHO
- ❌ Oublier l'énergie HOW
- ❌ Sur-expliquer les archétypes
- ❌ Forcer alignement phase/archétype
- ❌ Messages génériques

## ✅ VALIDATIONS REQUISES
- [ ] 20 combinaisons (5 WHO × 4 HOW) définies
- [ ] Cohérence ton dans chaque message
- [ ] Archétype subtil mais présent
- [ ] Messages uniques par combo
- [ ] Fallback si combo non défini

## 💡 ASTUCES IMPLÉMENTATION
1. Créer dictionnaire MESSAGES[who][how]
2. Fonction getComboMessage(who, how, context)
3. Cache messages générés pour cohérence
4. Logger combos pour analytics
5. A/B test différentes intensités HOW