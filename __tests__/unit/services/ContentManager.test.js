//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/services/ContentManager.test.js
// 🧩 Type : Test Unitaire Service Content Manager
// 📚 Description : Tests complets du gestionnaire de contenu (cache, API, fallbacks, TTL)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation service contenu critique
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import ContentManager from '../../../src/services/ContentManager';
import { getEndpointUrl } from '../../../src/config/api';

// Mock de l'API config
jest.mock('../../../src/config/api', () => ({
  getEndpointUrl: jest.fn()
}));

// Mock des données locales
jest.mock('../../../src/data/insights.json', () => [
  { id: 'local-insight-1', content: 'Local insight 1', type: 'local' },
  { id: 'local-insight-2', content: 'Local insight 2', type: 'local' }
], { virtual: true });

jest.mock('../../../src/data/phases.json', () => [
  { id: 'local-phase-1', name: 'Phase locale 1', type: 'local' },
  { id: 'local-phase-2', name: 'Phase locale 2', type: 'local' }
], { virtual: true });

jest.mock('../../../src/data/closings.json', () => [
  { id: 'local-closing-1', content: 'Closing local 1', type: 'local' },
  { id: 'local-closing-2', content: 'Closing local 2', type: 'local' }
], { virtual: true });

jest.mock('../../../src/data/vignettes.json', () => [
  { id: 'local-vignette-1', title: 'Vignette locale 1', type: 'local' },
  { id: 'local-vignette-2', title: 'Vignette locale 2', type: 'local' }
], { virtual: true });

// Mock global de fetch
global.fetch = jest.fn();

describe('📦 ContentManager - Tests Complets', () => {
  
  beforeEach(() => {
    // Reset tous les mocks
    jest.clearAllMocks();
    global.console.info = jest.fn();
    global.console.error = jest.fn();
    
    // Reset du cache ContentManager
    ContentManager.cache = {
      insights: { data: null, timestamp: null, ttl: 2 * 60 * 60 * 1000 },
      phases: { data: null, timestamp: null, ttl: 24 * 60 * 60 * 1000 },
      closings: { data: null, timestamp: null, ttl: 7 * 24 * 60 * 60 * 1000 },
      vignettes: { data: null, timestamp: null, ttl: 24 * 60 * 60 * 1000 },
    };
    
    // Configuration des mocks par défaut
    getEndpointUrl.mockImplementation((endpoint) => {
      const endpoints = {
        'admin.insights': 'https://moodcycle.irimwebforge.com/api/admin/insights',
        'admin.phases': 'https://moodcycle.irimwebforge.com/api/admin/phases',
        'admin.closings': 'https://moodcycle.irimwebforge.com/api/admin/closings',
        'admin.vignettes': 'https://moodcycle.irimwebforge.com/api/admin/vignettes',
      };
      return endpoints[endpoint] || `https://moodcycle.irimwebforge.com/api/${endpoint}`;
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎯 TESTS RÉCUPÉRATION INSIGHTS
  // ──────────────────────────────────────────────────────

  describe('getInsights', () => {
    test('✅ devrait récupérer les insights depuis l\'API avec succès', async () => {
      const mockApiData = [
        { id: 'api-insight-1', content: 'API insight 1', type: 'api' },
        { id: 'api-insight-2', content: 'API insight 2', type: 'api' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockApiData })
      });

      const result = await ContentManager.getInsights();

      expect(result).toEqual(mockApiData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://moodcycle.irimwebforge.com/api/admin/insights',
        expect.objectContaining({
          timeout: 8000,
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(console.info).toHaveBeenCalledWith('🌐 Fetching insights depuis API...');
      expect(console.info).toHaveBeenCalledWith('✅ insights API chargés');
    });

    test('✅ devrait utiliser le cache si valide', async () => {
      const cachedData = [{ id: 'cached-insight', content: 'Cached insight' }];
      
      // Simuler cache valide
      ContentManager.cache.insights = {
        data: cachedData,
        timestamp: Date.now(),
        ttl: 2 * 60 * 60 * 1000
      };

      const result = await ContentManager.getInsights();

      expect(result).toEqual(cachedData);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith('📦 insights depuis cache');
    });

    test('✅ devrait utiliser fallback local si API échoue', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await ContentManager.getInsights();

      expect(result).toEqual([
        { id: 'local-insight-1', content: 'Local insight 1', type: 'local' },
        { id: 'local-insight-2', content: 'Local insight 2', type: 'local' }
      ]);
      expect(console.info).toHaveBeenCalledWith('🔄 insights fallback local:', 'Network error');
    });

    test('✅ devrait gérer les réponses API avec erreur HTTP', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await ContentManager.getInsights();

      expect(result).toEqual([
        { id: 'local-insight-1', content: 'Local insight 1', type: 'local' },
        { id: 'local-insight-2', content: 'Local insight 2', type: 'local' }
      ]);
      expect(console.info).toHaveBeenCalledWith('🔄 insights fallback local:', 'API Error: 500');
    });

    test('✅ devrait gérer les réponses API sans wrapper data', async () => {
      const mockApiData = [
        { id: 'direct-insight-1', content: 'Direct insight 1' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData) // Pas de wrapper .data
      });

      const result = await ContentManager.getInsights();

      expect(result).toEqual(mockApiData);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🌙 TESTS RÉCUPÉRATION PHASES
  // ──────────────────────────────────────────────────────

  describe('getPhases', () => {
    test('✅ devrait récupérer les phases depuis l\'API', async () => {
      const mockApiData = [
        { id: 'api-phase-1', name: 'Phase API 1', type: 'api' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockApiData })
      });

      const result = await ContentManager.getPhases();

      expect(result).toEqual(mockApiData);
      expect(getEndpointUrl).toHaveBeenCalledWith('admin.phases');
    });

    test('✅ devrait utiliser fallback local pour les phases', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await ContentManager.getPhases();

      expect(result).toEqual([
        { id: 'local-phase-1', name: 'Phase locale 1', type: 'local' },
        { id: 'local-phase-2', name: 'Phase locale 2', type: 'local' }
      ]);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔚 TESTS RÉCUPÉRATION CLOSINGS
  // ──────────────────────────────────────────────────────

  describe('getClosings', () => {
    test('✅ devrait récupérer les closings depuis l\'API', async () => {
      const mockApiData = [
        { id: 'api-closing-1', content: 'Closing API 1', type: 'api' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockApiData })
      });

      const result = await ContentManager.getClosings();

      expect(result).toEqual(mockApiData);
      expect(getEndpointUrl).toHaveBeenCalledWith('admin.closings');
    });

    test('✅ devrait utiliser fallback local pour les closings', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await ContentManager.getClosings();

      expect(result).toEqual([
        { id: 'local-closing-1', content: 'Closing local 1', type: 'local' },
        { id: 'local-closing-2', content: 'Closing local 2', type: 'local' }
      ]);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎨 TESTS RÉCUPÉRATION VIGNETTES
  // ──────────────────────────────────────────────────────

  describe('getVignettes', () => {
    test('✅ devrait récupérer les vignettes depuis l\'API', async () => {
      const mockApiData = [
        { id: 'api-vignette-1', title: 'Vignette API 1', type: 'api' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockApiData })
      });

      const result = await ContentManager.getVignettes();

      expect(result).toEqual(mockApiData);
      expect(getEndpointUrl).toHaveBeenCalledWith('admin.vignettes');
    });

    test('✅ devrait utiliser fallback local pour les vignettes', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await ContentManager.getVignettes();

      expect(result).toEqual([
        { id: 'local-vignette-1', title: 'Vignette locale 1', type: 'local' },
        { id: 'local-vignette-2', title: 'Vignette locale 2', type: 'local' }
      ]);
    });
  });

  // ──────────────────────────────────────────────────────
  // ⏰ TESTS GESTION CACHE ET TTL
  // ──────────────────────────────────────────────────────

  describe('Cache Management', () => {
    test('✅ devrait valider correctement le cache', () => {
      // Cache invalide - pas de données
      expect(ContentManager.isCacheValid({ data: null, timestamp: null })).toBe(false);

      // Cache invalide - pas de timestamp
      expect(ContentManager.isCacheValid({ data: [1, 2, 3], timestamp: null })).toBe(false);

      // Cache invalide - expiré
      const expiredCache = {
        data: [1, 2, 3],
        timestamp: Date.now() - 10000, // 10s ago
        ttl: 5000 // 5s TTL
      };
      expect(ContentManager.isCacheValid(expiredCache)).toBe(false);

      // Cache valide
      const validCache = {
        data: [1, 2, 3],
        timestamp: Date.now() - 1000, // 1s ago
        ttl: 5000 // 5s TTL
      };
      expect(ContentManager.isCacheValid(validCache)).toBe(true);
    });

    test('✅ devrait mettre à jour le cache correctement', () => {
      const testData = [{ id: 'test', content: 'test data' }];
      const beforeTimestamp = Date.now();
      
      ContentManager.updateCache('insights', testData);
      
      const afterTimestamp = Date.now();
      const cacheEntry = ContentManager.cache.insights;
      
      expect(cacheEntry.data).toEqual(testData);
      expect(cacheEntry.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(cacheEntry.timestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    test('✅ devrait avoir des TTL appropriés pour chaque type', () => {
      const cache = ContentManager.cache;
      
      // Insights - 2h (données actives)
      expect(cache.insights.ttl).toBe(2 * 60 * 60 * 1000);
      
      // Phases - 24h (données stables)
      expect(cache.phases.ttl).toBe(24 * 60 * 60 * 1000);
      
      // Closings - 7j (données très stables)
      expect(cache.closings.ttl).toBe(7 * 24 * 60 * 60 * 1000);
      
      // Vignettes - 24h (données stables)
      expect(cache.vignettes.ttl).toBe(24 * 60 * 60 * 1000);
    });

    test('✅ devrait cache même les données de fallback', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await ContentManager.getInsights();

      // Vérifier que les données de fallback sont cachées
      const cacheEntry = ContentManager.cache.insights;
      expect(cacheEntry.data).toEqual([
        { id: 'local-insight-1', content: 'Local insight 1', type: 'local' },
        { id: 'local-insight-2', content: 'Local insight 2', type: 'local' }
      ]);
      expect(cacheEntry.timestamp).toBeTruthy();
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS FORCE REFRESH
  // ──────────────────────────────────────────────────────

  describe('Force Refresh', () => {
    test('✅ devrait forcer le refresh d\'un type spécifique', async () => {
      // Préparer cache valide
      ContentManager.cache.insights = {
        data: [{ id: 'old-data' }],
        timestamp: Date.now(),
        ttl: 2 * 60 * 60 * 1000
      };

      // Force refresh
      await ContentManager.forceRefresh('insights');

      // Le timestamp devrait être null (cache invalidé)
      expect(ContentManager.cache.insights.timestamp).toBeNull();
    });

    test('✅ devrait forcer le refresh de tous les types', async () => {
      // Préparer caches valides
      Object.keys(ContentManager.cache).forEach(type => {
        ContentManager.cache[type] = {
          data: [{ id: 'old-data' }],
          timestamp: Date.now(),
          ttl: ContentManager.cache[type].ttl
        };
      });

      // Force refresh global
      await ContentManager.forceRefresh();

      // Tous les timestamps devraient être null
      Object.keys(ContentManager.cache).forEach(type => {
        expect(ContentManager.cache[type].timestamp).toBeNull();
      });
    });
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS GESTION ERREURS
  // ──────────────────────────────────────────────────────

  describe('Error Handling', () => {
    test('✅ devrait gérer les erreurs de réseau', async () => {
      global.fetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const result = await ContentManager.getInsights();

      expect(result).toEqual([
        { id: 'local-insight-1', content: 'Local insight 1', type: 'local' },
        { id: 'local-insight-2', content: 'Local insight 2', type: 'local' }
      ]);
      expect(console.info).toHaveBeenCalledWith('🔄 insights fallback local:', 'ECONNREFUSED');
    });

    test('✅ devrait gérer les timeouts', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Request timeout'));

      const result = await ContentManager.getInsights();

      expect(result).toEqual([
        { id: 'local-insight-1', content: 'Local insight 1', type: 'local' },
        { id: 'local-insight-2', content: 'Local insight 2', type: 'local' }
      ]);
    });

    test('✅ devrait gérer les réponses JSON malformées', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await ContentManager.getInsights();

      expect(result).toEqual([
        { id: 'local-insight-1', content: 'Local insight 1', type: 'local' },
        { id: 'local-insight-2', content: 'Local insight 2', type: 'local' }
      ]);
    });

    test('✅ devrait gérer les codes d\'erreur HTTP spécifiques', async () => {
      const errorCodes = [400, 401, 403, 404, 500, 502, 503];
      
      for (const code of errorCodes) {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: code
        });

        const result = await ContentManager.getInsights();

        expect(result).toEqual([
          { id: 'local-insight-1', content: 'Local insight 1', type: 'local' },
          { id: 'local-insight-2', content: 'Local insight 2', type: 'local' }
        ]);
      }
    });
  });

  // ──────────────────────────────────────────────────────
  // ⚡ TESTS PERFORMANCE
  // ──────────────────────────────────────────────────────

  describe('Performance', () => {
    test('✅ devrait éviter les appels API multiples simultanés', async () => {
      const mockApiData = [{ id: 'api-insight-1', content: 'API insight 1' }];
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockApiData })
      });

      // Lancer plusieurs appels simultanés
      const promises = [
        ContentManager.getInsights(),
        ContentManager.getInsights(),
        ContentManager.getInsights()
      ];

      const results = await Promise.all(promises);

      // Tous devraient retourner les mêmes données
      results.forEach(result => {
        expect(result).toEqual(mockApiData);
      });

      // Mais fetch ne devrait être appelé qu'une fois grâce au cache
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('✅ devrait avoir un timeout approprié', async () => {
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      const startTime = Date.now();
      await ContentManager.getInsights();
      const endTime = Date.now();

      // Devrait utiliser le fallback rapidement, pas attendre 10s
      expect(endTime - startTime).toBeLessThan(9000);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS INTÉGRATION
  // ──────────────────────────────────────────────────────

  describe('Intégration', () => {
    test('✅ devrait fonctionner avec tous les types de contenu', async () => {
      const mockData = { data: [{ id: 'test', content: 'test' }] };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const [insights, phases, closings, vignettes] = await Promise.all([
        ContentManager.getInsights(),
        ContentManager.getPhases(),
        ContentManager.getClosings(),
        ContentManager.getVignettes()
      ]);

      expect(insights).toEqual(mockData.data);
      expect(phases).toEqual(mockData.data);
      expect(closings).toEqual(mockData.data);
      expect(vignettes).toEqual(mockData.data);

      // Vérifier que tous les endpoints ont été appelés
      expect(getEndpointUrl).toHaveBeenCalledWith('admin.insights');
      expect(getEndpointUrl).toHaveBeenCalledWith('admin.phases');
      expect(getEndpointUrl).toHaveBeenCalledWith('admin.closings');
      expect(getEndpointUrl).toHaveBeenCalledWith('admin.vignettes');
    });

    test('✅ devrait maintenir la cohérence du cache entre les appels', async () => {
      const mockData = [{ id: 'test-insight', content: 'test content' }];
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockData })
      });

      // Premier appel - depuis API
      const result1 = await ContentManager.getInsights();
      expect(result1).toEqual(mockData);

      // Deuxième appel - depuis cache
      const result2 = await ContentManager.getInsights();
      expect(result2).toEqual(mockData);

      // Fetch ne devrait être appelé qu'une fois
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
}); 