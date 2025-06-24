# 🎛️ Composant Paramètres

## 📋 Description

Composant modal complet pour modifier les paramètres utilisateur avec 4 onglets :
- **Profil** : Prénom, âge, journey choice
- **Préférences** : 6 sliders thérapeutiques
- **Persona** : Style d'accompagnement + avatar
- **Légal** : Documents légaux (placeholders pour Apple compliance)

## 🎯 Usage

### Intégration simple
```jsx
import ParametresButton from '../../../src/features/shared/ParametresButton';

// Dans votre render
<ParametresButton 
  color={theme.colors.primary}
  style={styles.yourStyle}
/>
```

### Déjà intégré dans :
- ✅ **CycleView** - Header gauche
- ✅ **NotebookView** - Header gauche  
- ✅ **ChatView** - Header gauche

## 🎨 Design Features

### 🎯 **Cohérence parfaite**
- Réutilise les composants de l'onboarding (500, 550, 600)
- Même palette de couleurs et animations
- Adaptatif selon la phase actuelle (colors.phases)

### 📱 **UX Premium**
- Animations fluides iOS-like (scale, slide, fade)
- Haptic feedback sur iOS
- Auto-save en temps réel dans useUserStore
- Bouton intelligent (change selon modifications)

### 🎛️ **Onglets**
- Navigation horizontale avec pills
- Animation de transition entre onglets
- Indicateur visuel de l'onglet actif

## 🔧 Structure Technique

```
src/features/shared/
├── ParametresModal.jsx       # Conteneur principal avec onglets
├── ParametresButton.jsx      # Bouton d'accès réutilisable
└── tabs/
    ├── ProfilTab.jsx         # Prénom, âge, journey
    ├── PreferencesTab.jsx    # 6 sliders thérapeutiques
    ├── PersonaTab.jsx        # Style accompagnement + avatar
    └── LegalTab.jsx          # Documents légaux Apple compliance
```

## 📊 Sauvegarde

**Auto-sync avec useUserStore :**
- `updateProfile()` - ProfilTab
- `updatePreferences()` - PreferencesTab  
- `setPersona()` + `updateMelune()` - PersonaTab
- Pas de sauvegarde pour LegalTab (placeholders)

## 🍎 Apple Compliance

### Documents inclus :
- 🔒 **Politique de confidentialité** (draft)
- 📜 **Conditions d'utilisation** (draft)
- 🩺 **Avertissement médical** (✅ disponible)
- 🏥 **Gestion données de santé** (draft)
- ⚖️ **Mentions légales** (draft)

### Statuts :
- `draft` - En cours de rédaction
- `available` - Disponible avec contenu
- `updated` - Mis à jour récemment

## 🎯 User Testing Ready

**Fonctionnalités testables :**
- ✅ Navigation entre onglets
- ✅ Modification profil en temps réel
- ✅ Ajustement préférences thérapeutiques
- ✅ Changement persona avec preview
- ✅ Preview Apple compliance
- ✅ Animations et feedback haptique

**Placeholders minimaux :**
- Textes légaux (à compléter)
- Timeline indicative (Q1 2025)

## 🚀 Prochaines étapes

1. **User testing** - 2 semaines
2. **Rédaction textes légaux**
3. **Validation juridique** 
4. **Soumission App Store**

## 💡 Notes techniques

- **Performance** : Lazy loading des onglets
- **Mémoire** : Cleanup automatique des animations
- **Accessibilité** : Hit targets 44pt minimum
- **Cross-platform** : Animations adaptées iOS/Android 