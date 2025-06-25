# 🧪 Tests MoodCycle

## Structure
- `unit/` - Tests unitaires composants isolés
- `integration/` - Tests intégration multi-composants  
- `e2e/` - Tests end-to-end parcours complets
- `__mocks__/` - Mocks réutilisables

## Commandes
```bash
npm test                           # Tous les tests
npm test unit                      # Tests unitaires
npm test integration               # Tests intégration
npm test e2e                       # Tests E2E
npm test intelligence-pipeline     # Test pipeline intelligence
```

## Conventions
- Un test par fichier logique
- Mocks centralisés réutilisables
- Headers standardisés
- Performance < 50ms par test
