# 🌙 MoodCycle App

Application React Native pour le suivi du cycle menstruel avec intelligence adaptative.

## 🏗️ Architecture V8.0

### Structure Finale

src/
├── 🎨 config/theme/              # Design System Complet
│   ├── typography/               # Typography (data + components)
│   ├── colors.js                 # Couleurs & phases
│   ├── effects/glassmorphism.js  # Effets signature
│   └── index.js                  # Hub theme
├── 🧩 core/                      # UI Interactions
│   ├── ui/animations/            # Animations modulaires V5.0
│   ├── layout/                   # ScreenContainer, Headers
│   └── settings/                 # Paramètres
├── 🪝 hooks/                     # Custom hooks
├── 🗃️ stores/                    # State management (Zustand)
├── 🎯 features/                  # Composants métier
└── 🔧 utils/                     # Utilitaires

### Imports Patterns

```javascript
// Typography & Theme
import { Heading1, BodyText, BRAND_COLORS } from '@/config/theme';

// Animations & Layout  
import { AnimatedLogo, ScreenContainer } from '@/core';

// Logic & State
import { useTheme, useNotebookStore } from '@/src';
```

## ✨ Features

- 🎨 **Design System** - Typography, couleurs, effets modulaires
- ✨ **Animations** - Interactions fluides et performantes  
- 🌙 **Theme** - Clair/sombre avec glassmorphism
- 📱 **Responsive** - Adaptation multi-plateformes
- 🧠 **Intelligence** - Recommendations personnalisées

## 🚀 Getting Started

```bash
npm install
npx expo start
```

## 📚 Documentation

- `docs/ARCHITECTURE_V8_COMPLETE.md` - Architecture complète
- `docs/PERSONAS_ARCHITECTURE_PLAN.md` - Plan personas (future)

---

**Architecture React Native de classe enterprise** ⭐
