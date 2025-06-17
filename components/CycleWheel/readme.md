# CycleWheel Component v1.0-alpha

## 🌙 Description
Composant de visualisation interactive du cycle menstruel sous forme de roue rotative. La roue affiche les 4 phases du cycle avec des dégradés fluides entre chaque phase, et tourne automatiquement pour maintenir la position actuelle en haut (comme une montre).

## ✨ Fonctionnalités

### 🔄 Rotation dynamique
- **Position fixe** : La position actuelle reste toujours en haut (12h)
- **Roue rotative** : La roue tourne selon le jour du cycle
- **Marqueur statique** : Indicateur fixe en position 12h comme référence

### 🎯 Interactivité
- **Quartiers cliquables** : Chaque section de la roue est cliquable
- **Navigation dynamique** : Redirection vers les pages de détail de chaque phase
- **Feedback visuel** : Retour tactile lors du clic sur une phase

### 🎨 Dégradés fluides
- **Transitions seamless** : Couleurs qui se fondent naturellement entre les phases
- **Continuité parfaite** : Aucune cassure visuelle aux frontières
- **Couleurs centrées** : Chaque phase a sa couleur pure au centre, avec dégradés vers les phases adjacentes

### 📅 Structure cyclique
- **7 arcs par phase** : Correspondance 1:1 avec les jours du cycle (1 arc = 1 jour)
- **28 arcs total** : Cycle complet de 28 jours
- **4 phases distinctes** : Menstruelle, Folliculaire, Ovulatoire, Lutéale

### 🎯 Éléments visuels
- **Séparations pointillées** : Lignes délimitant les phases avec dépassement symétrique
- **Prénom personnalisé** : Affiché au centre, coloré selon la phase actuelle
- **Background unifié** : Couleur cohérente avec le thème général

## 📋 Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `currentPhase` | `string` | `'menstrual'` | Phase actuelle du cycle |
| `size` | `number` | `250` | Taille de la roue en pixels |
| `userName` | `string` | `'Emma'` | Prénom à afficher au centre |
| `cycleDay` | `number` | `8` | Jour actuel du cycle (1-28) |
| `cycleLength` | `number` | `28` | Longueur totale du cycle en jours |

### Valeurs possibles pour `currentPhase`
- `'menstrual'` - Phase menstruelle (jours 1-7)
- `'follicular'` - Phase folliculaire (jours 8-14)
- `'ovulatory'` - Phase ovulatoire (jours 15-21)
- `'luteal'` - Phase lutéale (jours 22-28)

## 🎨 Palette de couleurs
- **Menstruelle** : Grenat Doux (`#F44336`)
- **Folliculaire** : Miel Doré (`#FFC107`)  
- **Ovulatoire** : Lagune Calme (`#00BCD4`)
- **Lutéale** : Lavande Mystique (`#673AB7`)

## 💻 Utilisation

### Import
```jsx
import CycleWheel from '../../components/CycleWheel';
```

### Utilisation basique
```jsx
<CycleWheel 
  currentPhase="follicular"
  cycleDay={8}
  userName="Emma"
/>
```

### Utilisation complète
```jsx
<CycleWheel 
  currentPhase="ovulatory"
  cycleDay={15}
  cycleLength={30}
  userName="Marguerite"
  size={350}
/>
```

### Dans un écran
```jsx
import { View, StyleSheet } from 'react-native';
import CycleWheel from '../../components/CycleWheel';

export default function CycleScreen() {
  const [currentPhase] = useState('follicular');
  const [cycleDay] = useState(8);
  
  return (
    <View style={styles.container}>
      <CycleWheel 
        currentPhase={currentPhase}
        cycleDay={cycleDay}
        userName="Emma"
        size={300}
      />
    </View>
  );
}
```

## 🔧 Choix techniques

### Architecture
- **Framework** : React Native avec react-native-svg
- **Approche** : Composant fonctionnel avec hooks
- **Rendu** : SVG pour une qualité vectorielle parfaite

### Calculs mathématiques
- **Rotation** : `-((cycleDay - 0.5) / cycleLength * 360)°`
- **Positionnement** : Coordonnées polaires vers cartésiennes
- **Dégradés** : Interpolation RGB avec facteurs pondérés

### Optimisations
- **ViewBox ajustée** : Extension de 16px pour les dépassements des lignes
- **Calculs pré-générés** : Toutes les positions calculées une seule fois
- **Clés React** : Optimisation du rendu avec des clés uniques

### Responsive design
- **Taille de police adaptative** : 26px/20px selon la taille de la roue
- **Proportions relatives** : Tous les éléments s'adaptent à la prop `size`
- **Espacement cohérent** : Utilisation du système de spacing du thème

## 📦 Dépendances
- `react-native-svg` : Rendu des éléments vectoriels
- `../../config/theme` : Couleurs et espacement du thème global
- `expo-router` : Navigation entre les écrans

## 🎯 Comportement attendu

### Navigation
- ✅ **Clic sur phase** : Redirection vers la page de détail correspondante
- ✅ **Données dynamiques** : Affichage des informations depuis phases.json
- ✅ **Retour facile** : Navigation fluide entre la roue et les détails

### Pour cycleDay = 8 (phase folliculaire)
- ✅ **Roue tournée** : Zone jaune (folliculaire) visible en haut
- ✅ **Marqueur en haut** : Position 12h fixe
- ✅ **Prénom jaune** : Couleur de la phase folliculaire
- ✅ **Dégradé visible** : Transition rouge→jaune→cyan

### Pour cycleDay = 15 (phase ovulatoire)
- ✅ **Roue tournée** : Zone cyan (ovulatoire) visible en haut
- ✅ **Prénom cyan** : Couleur de la phase ovulatoire
- ✅ **180° de rotation** : Demi-tour depuis la position initiale

## 🚀 Version
**v1.0-alpha** - Version initiale stable avec toutes les fonctionnalités core

### Fonctionnalités implémentées
- [x] Rotation dynamique de la roue
- [x] Dégradés fluides entre phases
- [x] Lignes de séparation pointillées
- [x] Prénom personnalisé et coloré
- [x] Marqueur de position fixe
- [x] Background unifié
- [x] ViewBox ajustée pour dépassements
- [x] Design responsive
- [x] Navigation interactive vers les phases
- [x] Pages de détail dynamiques

### Améliorations futures possibles
- [ ] Animations de transition fluides
- [ ] Support de cycles personnalisés (21-35 jours)
- [ ] Mode nuit/jour
- [ ] Interactions tactiles (glisser pour changer de jour)
- [ ] Export vers d'autres formats (PNG, PDF)
- [ ] Animations de transition entre les pages
- [ ] Favoris et notes personnelles par phase
- [ ] Partage de conseils personnalisés

## 🎨 Design System
Ce composant respecte le design system MoodCycle avec :
- **Couleurs** : Palette harmonieuse inspirée de la nature
- **Typographie** : Police adaptative et lisible
- **Espacement** : Système cohérent avec le thème global
- **Accessibilité** : Contrastes suffisants et lisibilité optimale

## 🗂 Structure des données
Les données des phases sont stockées dans `/data/phases.json` avec la structure suivante pour chaque phase :

```json
{
  "id": "string",
  "name": "string",
  "color": "string (hex)",
  "duration": "string",
  "description": "string",
  "characteristics": {
    "physical": ["string"],
    "emotional": ["string"]
  },
  "advice": {
    "nutrition": ["string"],
    "activities": ["string"]
  },
  "symbol": "string (emoji)",
  "affirmation": "string"
}
```

## 📱 Pages de détail
Les pages de détail (`/app/phases/[id].jsx`) affichent :
- En-tête coloré avec nom et symbole
- Description de la phase
- Caractéristiques principales
- Conseils pratiques
- Affirmation positive
