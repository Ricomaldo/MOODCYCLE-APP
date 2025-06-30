# 🎯 Enrichissements Insights - Guide d'utilisation

## 📋 Vue d'ensemble

Le système d'enrichissement des insights a été amélioré pour offrir une personnalisation plus fine et un meilleur debugging.

## 🔧 Améliorations apportées

### 1. **Logique de matching améliorée**
- **Seuil abaissé** : Les préférences sont maintenant considérées à partir de 3 (au lieu de 4)
- **Fallbacks multiples** : 
  1. Matching exact (persona + journey + preferences)
  2. Matching par persona seulement
  3. Enrichissement générique de la phase

### 2. **Logs de debug détaillés**
- Affichage du contexte de recherche
- Détail des enrichissements disponibles
- Résultat du matching
- Insight final généré

### 3. **Enrichissements enrichis**
- **30 nouveaux enrichissements** ajoutés (6 par phase)
- **5 personas** couvertes : emma, laure, sylvie, christine, clara
- **Enrichissements génériques** pour chaque phase

### 4. **Fonctions de refresh**
- `refreshPhasesCache()` : Force le refresh du cache des phases
- `refreshAllCaches()` : Refresh complet de tous les caches
- `debugEnrichments()` : Fonction de debug complète

## 🚀 Utilisation

### Debug des enrichissements
```javascript
import { debugEnrichments } from '../services/InsightsEngine';

// Dans un composant
useEffect(() => {
  debugEnrichments({ 
    phase: 'menstrual', 
    persona: 'emma', 
    profile, 
    preferences: profile?.preferences 
  });
}, [phase, persona, profile]);
```

### Refresh du cache
```javascript
import { refreshPhasesCache, refreshAllCaches } from '../services/InsightsEngine';

// Refresh phases seulement
await refreshPhasesCache();

// Refresh complet
await refreshAllCaches();
```

## 📊 Structure des enrichissements

Chaque enrichissement contient :
```json
{
  "id": "phase_persona_journey_01",
  "targetPersona": "emma",
  "targetPreferences": ["symptoms"],
  "targetJourney": "body_disconnect",
  "tone": "friendly",
  "contextualText": "Texte d'enrichissement..."
}
```

## 🎯 Logique de matching

1. **Matching exact** : `persona` + `journey` + `preferences >= 3`
2. **Fallback persona** : `persona` seulement
3. **Fallback générique** : Aucun critère spécifique

## 🔍 Debug en console

Les logs affichent :
- 🔍 Contexte de recherche
- 📊 Préférences disponibles
- 🎯 Nombre d'enrichissements
- ✅ Enrichissement trouvé
- 🎯 Insight final

## 📝 Exemples d'enrichissements

### Phase menstruelle
- **Emma** : "Cette pause mensuelle t'invite à redécouvrir la sagesse profonde de ton corps..."
- **Laure** : "Cette phase de basse énergie est optimale pour l'analyse et la planification..."
- **Générique** : "Cette phase de renouvellement t'invite à honorer ton besoin naturel de ralentir"

### Phase folliculaire
- **Emma** : "Cette énergie montante t'invite à redécouvrir la joie de bouger..."
- **Laure** : "Cette phase de reconstruction énergétique est idéale pour lancer..."
- **Générique** : "Cette énergie montante t'invite à explorer de nouveaux possibles..."

## 🛠️ Résolution de problèmes

### Enrichissements ne s'appliquent pas
1. Vérifier les logs de debug
2. Forcer le refresh du cache : `refreshPhasesCache()`
3. Vérifier les préférences utilisateur
4. Contrôler la structure des données

### Cache problématique
```javascript
// Vider tous les caches
await refreshAllCaches();

// Ou vider phases seulement
await refreshPhasesCache();
```

## 📈 Métriques

- **30 enrichissements** disponibles
- **5 personas** couvertes
- **4 phases** avec enrichissements
- **3 niveaux** de fallback
- **Logs détaillés** pour debugging

## 🔮 Évolutions futures

- Ajout d'enrichissements basés sur l'historique
- Enrichissements saisonniers
- Intégration avec l'IA pour génération dynamique
- Métriques d'utilisation des enrichissements 