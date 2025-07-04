# 🎨 Guide Complet de l'Onboarding MoodCycle
> Documentation technique sur l'architecture et les standards de l'onboarding

## 📚 Vue d'ensemble

L'onboarding de MoodCycle utilise une architecture modulaire et standardisée, conçue pour offrir une expérience fluide, cohérente et élégante à travers tous les écrans.

### 🗂 Structure des fichiers

```
app/onboarding/
├── _layout.jsx               # Layout commun onboarding
├── 100-bienvenue.jsx        # Accueil initial
├── 200-bonjour.jsx         # Premier contact
├── 250-rencontre.jsx       # Rencontre avec Mélune
├── 300-etape-vie.jsx       # Étape de vie
├── 400-prenom.jsx          # Personnalisation relation
├── 500-avatar.jsx          # Personnalisation Mélune
├── 600-terminology.jsx     # Choix terminologie
├── 700-cycle.jsx          # Configuration cycle
├── 800-preferences.jsx    # Préférences utilisateur
├── 900-essai.jsx         # Choix version
└── 950-demarrage.jsx     # Finalisation

src/core/ui/animations/
├── OnboardingAnimations.jsx # Composants d'animation
├── constants/
│   └── animationPresets.js  # Presets et configurations
└── index.js                 # Export centralisé
```

## 🎭 Standards & Composants

### 📝 Typographie
```jsx
// Polices standardisées
const FONTS = {
  heading: 'Quintessential',  // Titres élégants, voix de Mélune
  body: 'Questrial',         // Corps de texte, interface moderne
}

// Tailles de texte
const TEXT_SIZES = {
  message: 18,      // Messages principaux
  title: 24,        // Titres des sections
  button: 16,       // Texte des boutons
  label: 14        // Labels et textes secondaires
}
```

### 🎯 Composants Communs

#### OnboardingScreen
Wrapper standard pour tous les écrans d'onboarding :
```jsx
import OnboardingScreen from '../../src/core/layout/OnboardingScreen';

export default function MonEcran() {
  return (
    <OnboardingScreen currentScreen="screen-id">
      <AnimatedOnboardingScreen>
        {/* Contenu */}
      </AnimatedOnboardingScreen>
    </OnboardingScreen>
  );
}
```

#### StandardOnboardingButton
Bouton standardisé avec animation :
```jsx
<AnimatedOnboardingButton style={styles.buttonContainer}>
  <StandardOnboardingButton
    title="Continuer"
    onPress={handleContinue}
    variant="primary"
  />
</AnimatedOnboardingButton>
```

### 🎨 Styles Standards

```jsx
const baseStyles = (theme) => ({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // ScrollView standard
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },

  // Section message
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },

  // Bouton de continuation
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
});
```

## ⚡ Animations

### AnimatedRevealMessage
Message avec révélation progressive.
```jsx
<AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
  <BodyText style={styles.message}>Votre message ici</BodyText>
</AnimatedRevealMessage>
```

### AnimatedOnboardingButton
Bouton avec apparition élégante.
```jsx
<AnimatedOnboardingButton {...ANIMATION_CONFIGS.onboarding.welcome.button}>
  <StandardOnboardingButton />
</AnimatedOnboardingButton>
```

### AnimatedCascadeCard
Cartes avec animation en cascade.
```jsx
{items.map((item, index) => (
  <AnimatedCascadeCard key={item.id} index={index}>
    {/* Contenu de la carte */}
  </AnimatedCascadeCard>
))}
```

### AnimatedLogo
Logo avec effet "breath" subtil.
```jsx
<AnimatedLogo>
  <Image source={require('path/to/logo')} />
</AnimatedLogo>
```

### AnimatedSparkle
Éléments décoratifs flottants.
```jsx
<AnimatedSparkle index={index} style={styles.sparkle} />
```

## ⚙️ Configuration

### Durées Standardisées
```js
ANIMATION_DURATIONS = {
  // Micro-interactions
  instant: 100,    // Feedback immédiat
  quick: 200,      // Transitions rapides
  
  // Transitions standard
  normal: 300,     // Actions standard
  smooth: 400,     // Transitions fluides
  
  // Animations complexes
  slow: 600,       // Entrées élaborées
  elegant: 800,    // Transitions importantes
  
  // Onboarding spécifique
  welcomeFirstMessage: 1000,
  welcomeSecondMessage: 2500,
  welcomeButton: 5200
}
```

### Presets d'Animation
```js
ANIMATION_PRESETS = {
  gentle: {        // Doux et naturel
    tension: 80,
    friction: 8
  },
  smooth: {        // Équilibré et fluide
    tension: 120,
    friction: 12
  },
  // ... autres presets
}
```

### Configurations Spécifiques
```js
ANIMATION_CONFIGS.onboarding = {
  welcome: {
    pageEnter: {
      fade: { duration: ANIMATION_DURATIONS.slow },
      slide: { ...ANIMATION_PRESETS.gentle }
    },
    button: {
      scale: { ...ANIMATION_PRESETS.gentle },
      fade: { duration: ANIMATION_DURATIONS.elegant }
    }
  }
}
```

## 🎯 Bonnes Pratiques

1. **Structure**
   - Utiliser les composants standards
   - Suivre la nomenclature des fichiers (xxx-nom.jsx)
   - Placer les styles dans un objet StyleSheet séparé

2. **Typographie**
   - Quintessential pour la voix de Mélune
   - Questrial pour l'interface utilisateur
   - Respecter les tailles standardisées

3. **Layout**
   - Centrer verticalement le contenu principal
   - Laisser de l'espace en bas pour le bouton
   - Utiliser les espacements standards du thème

4. **Animations**
   - Utiliser les presets d'animation
   - Respecter les durées standardisées
   - Assurer la fluidité sur tous les appareils

5. **Accessibilité**
   - Textes lisibles (taille et contraste)
   - Boutons assez grands
   - Feedback visuel sur les interactions

## 📱 Exemple Complet d'Écran

```jsx
export default function OnboardingScreen() {
  return (
    <OnboardingScreen currentScreen="screen-id">
      <AnimatedOnboardingScreen>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Message de Mélune */}
          <View style={styles.messageSection}>
            <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
              <BodyText style={[styles.message, { fontFamily: 'Quintessential' }]}>
                Message de Mélune
              </BodyText>
            </AnimatedRevealMessage>
          </View>

          {/* Contenu principal */}
          <View style={styles.mainSection}>
            {/* ... */}
          </View>
        </ScrollView>

        {/* Bouton de continuation */}
        <View style={styles.bottomSection}>
          <AnimatedOnboardingButton {...ANIMATION_CONFIGS.onboarding.welcome.button}>
            <StandardOnboardingButton
              title="Continuer"
              onPress={handleContinue}
              variant="primary"
            />
          </AnimatedOnboardingButton>
        </View>
      </AnimatedOnboardingScreen>
    </OnboardingScreen>
  );
}
```

## 🔄 Processus de Maintenance

1. Toujours mettre à jour cette documentation lors de :
   - L'ajout de nouveaux standards
   - La modification des composants existants
   - L'ajout de nouveaux écrans

2. Vérifier la cohérence lors des revues de code :
   - Structure des fichiers
   - Utilisation des composants standards
   - Respect des animations
   - Typographie et espacements

3. Tests réguliers :
   - Performance sur différents appareils
   - Fluidité des animations
   - Cohérence visuelle

## 🔄 Séquence Type d'un Écran

1. Entrée de page avec `AnimatedOnboardingScreen`
2. Messages avec `AnimatedRevealMessage`
3. Éléments interactifs avec délais appropriés
4. Bouton d'action avec `AnimatedOnboardingButton`

## 🔜 Prochaines Étapes

1. Migration des écrans restants vers l'architecture standardisée
2. Tests de performance sur différents appareils
3. Ajout de nouveaux patterns d'animation si nécessaire
4. Documentation Storybook des composants

## 📝 Notes de Maintenance

- Toujours mettre à jour cette documentation lors de l'ajout de nouveaux patterns
- Vérifier la cohérence des animations lors des revues de code
- Maintenir les presets à jour avec les retours utilisateurs 