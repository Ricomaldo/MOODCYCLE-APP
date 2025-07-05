//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/services/ContentManager.simple.test.js
// 🧩 Type : Test Unitaire Service Content Manager - Version Simplifiée
// 📚 Description : Tests essentiels sans mocks complexes pour éviter les fuites mémoire
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation service contenu critique
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

// Test simple sans mocks complexes
describe('📦 ContentManager - Tests Essentiels', () => {
  
  test('✅ devrait être importable', () => {
    // Test d'import de base
    expect(() => {
      const ContentManager = require('../../../src/services/ContentManager');
      expect(ContentManager).toBeDefined();
    }).not.toThrow();
  });

  test('✅ devrait avoir la structure de cache attendue', () => {
    const ContentManager = require('../../../src/services/ContentManager').default;
    
    expect(ContentManager.cache).toBeDefined();
    expect(ContentManager.cache.insights).toBeDefined();
    expect(ContentManager.cache.phases).toBeDefined();
    expect(ContentManager.cache.closings).toBeDefined();
    expect(ContentManager.cache.vignettes).toBeDefined();
  });

  test('✅ devrait avoir les méthodes principales', () => {
    const ContentManager = require('../../../src/services/ContentManager').default;
    
    expect(typeof ContentManager.getInsights).toBe('function');
    expect(typeof ContentManager.getPhases).toBe('function');
    expect(typeof ContentManager.getClosings).toBe('function');
    expect(typeof ContentManager.getVignettes).toBe('function');
    expect(typeof ContentManager.forceRefresh).toBe('function');
  });

  test('✅ devrait valider le cache correctement', () => {
    const ContentManager = require('../../../src/services/ContentManager').default;
    
    // Cache invalide
    expect(ContentManager.isCacheValid({ data: null, timestamp: null })).toBe(false);
    
    // Cache valide
    const validCache = {
      data: [{ id: 'test' }],
      timestamp: Date.now(),
      ttl: 60000
    };
    expect(ContentManager.isCacheValid(validCache)).toBe(true);
  });

  test('✅ devrait avoir des TTL cohérents', () => {
    const ContentManager = require('../../../src/services/ContentManager').default;
    
    // Insights - 2h (plus fréquent)
    expect(ContentManager.cache.insights.ttl).toBe(2 * 60 * 60 * 1000);
    
    // Phases - 24h (stable)
    expect(ContentManager.cache.phases.ttl).toBe(24 * 60 * 60 * 1000);
    
    // Closings - 7j (très stable)
    expect(ContentManager.cache.closings.ttl).toBe(7 * 24 * 60 * 60 * 1000);
    
    // Vignettes - 24h (stable)
    expect(ContentManager.cache.vignettes.ttl).toBe(24 * 60 * 60 * 1000);
  });
}); 