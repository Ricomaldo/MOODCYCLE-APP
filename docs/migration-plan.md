# 🌙 Plan de Migration Stores MoodCycle

## 📋 Étapes de refactorisation

### Phase 1 : Préparation (30min)
1. **Créer branche** : `git checkout -b refactor/unified-stores`
2. **Backup** : Copier stores actuels dans `/stores/legacy/`
3. **Créer nouveaux stores** dans `/stores/`

### Phase 2 : Nouveaux stores (45min)
1. ✅ `useAppStore.js` - État global minimal
2. ✅ `useUserStore.js` - Profil + cycle + persona unifié  
3. ✅ `useChatStore.js` - Messages simplifiés
4. ✅ `useNotebookStore.js` - Carnet épuré

### Phase 3 : Migration composants (90min)
**Ordre prioritaire :**
1. **Onboarding flow** → `useUserStore`
2. **Chat screen** → `useChatStore` v2
3. **Cycle screen** → `useUserStore.getCurrentPhase()`
4. **Notebook** → `useNotebookStore` v2

### Phase 4 : Services (30min)
1. **PersonaEngine** → adapter au nouveau `useUserStore`
2. **dateUtils** → fonctions pures centralisées
3. **ChatService** → simplifier contexte

### Phase 5 : Tests & nettoyage (45min)
1. **Test complet** app avec nouveaux stores
2. **Supprimer** `/stores/legacy/`
3. **Update** imports dans tous les fichiers
4. **Validation** fonctionnalités critiques

---

## 🔄 Correspondances migration

| Ancien store | Nouveau store | Migration |
|--------------|---------------|-----------|
| `useOnboardingStore.userInfo` | `useUserStore.profile` | Direct |
| `useOnboardingStore.persona` | `useUserStore.persona` | Direct |
| `useCycleStore.currentCycle` | `useUserStore.cycle` | Fusion |
| `useChatStore.messages` | `useChatStore.messages` | Simplifié |
| `useNotebookStore.entries` | `useNotebookStore.entries` | Tags épurés |

---

## ⚠️ Points d'attention

1. **Persistance** : Nouveaux stores avec même clés AsyncStorage
2. **Calculs phase** : Vérifier cohérence avec ancienne logique
3. **Imports** : Search/replace global dans VSCode
4. **Tests** : Onboarding flow complet + chat + cycle

---

## 🎯 Résultat attendu

- **-60% code stores** (de ~800 lignes à ~320)
- **1 source vérité** pour cycle/persona
- **API cohérente** entre stores
- **Performance** améliorée (moins watchers)
- **Base solide** pour futures apps