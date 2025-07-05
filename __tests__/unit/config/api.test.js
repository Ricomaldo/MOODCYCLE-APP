//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/config/api.test.js
// 🧩 Type : Test Unitaire Config API
// 📚 Description : Tests complets de la configuration API (endpoints, URLs, headers, gestion erreurs)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation configuration API critique
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { 
  getApiConfig, 
  getApiUrl, 
  getEndpointUrl, 
  getApiRequestConfig 
} from '../../../src/config/api.js';

// Mock du __DEV__ pour les tests
const originalDEV = global.__DEV__;

describe('🔧 API Configuration - Tests Complets', () => {
  
  beforeEach(() => {
    // Reset console.info mock
    jest.clearAllMocks();
    global.console.info = jest.fn();
    global.console.error = jest.fn();
  });

  afterEach(() => {
    global.__DEV__ = originalDEV;
    // Nettoyer les mocks
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────
  // 🎯 TESTS CONFIGURATION API
  // ──────────────────────────────────────────────────────

  describe('getApiConfig', () => {
    test('✅ devrait retourner la config production par défaut', () => {
      global.__DEV__ = false;
      
      const config = getApiConfig();
      
      expect(config.baseURL).toBe('https://moodcycle.irimwebforge.com');
      expect(config.timeout).toBe(15000);
      expect(config.retries).toBe(3);
      expect(config.endpoints).toBeDefined();
      expect(config.endpoints.chat).toBe('/api/chat');
      expect(config.endpoints.health).toBe('/api/health');
    });

    test('✅ devrait logger en mode développement', () => {
      global.__DEV__ = true;
      
      const config = getApiConfig();
      
      expect(console.info).toHaveBeenCalledWith(
        '🔧 API Config (DEV):', 
        config.baseURL
      );
    });

    test('✅ devrait avoir tous les endpoints admin', () => {
      const config = getApiConfig();
      
      expect(config.endpoints.admin).toBeDefined();
      expect(config.endpoints.admin.insights).toBe('/api/admin/insights');
      expect(config.endpoints.admin.phases).toBe('/api/admin/phases');
      expect(config.endpoints.admin.closings).toBe('/api/admin/closings');
      expect(config.endpoints.admin.vignettes).toBe('/api/admin/vignettes');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🌐 TESTS URL GENERATION
  // ──────────────────────────────────────────────────────

  describe('getApiUrl', () => {
    test('✅ devrait retourner l\'URL de base', () => {
      const url = getApiUrl();
      
      expect(url).toBe('https://moodcycle.irimwebforge.com');
    });
  });

  describe('getEndpointUrl', () => {
    test('✅ devrait générer l\'URL complète pour endpoint simple', () => {
      const url = getEndpointUrl('chat');
      
      expect(url).toBe('https://moodcycle.irimwebforge.com/api/chat');
    });

    test('✅ devrait générer l\'URL complète pour endpoint health', () => {
      const url = getEndpointUrl('health');
      
      expect(url).toBe('https://moodcycle.irimwebforge.com/api/health');
    });

    test('✅ devrait générer l\'URL complète pour endpoint admin avec notation point', () => {
      const url = getEndpointUrl('admin.insights');
      
      expect(url).toBe('https://moodcycle.irimwebforge.com/api/admin/insights');
    });

    test('✅ devrait générer l\'URL complète pour tous les endpoints admin', () => {
      const urlPhases = getEndpointUrl('admin.phases');
      const urlClosings = getEndpointUrl('admin.closings');
      const urlVignettes = getEndpointUrl('admin.vignettes');
      
      expect(urlPhases).toBe('https://moodcycle.irimwebforge.com/api/admin/phases');
      expect(urlClosings).toBe('https://moodcycle.irimwebforge.com/api/admin/closings');
      expect(urlVignettes).toBe('https://moodcycle.irimwebforge.com/api/admin/vignettes');
    });

    test('✅ devrait gérer les endpoints inexistants avec fallback', () => {
      const url = getEndpointUrl('nonexistent');
      
      expect(url).toBe('https://moodcycle.irimwebforge.com/api/nonexistent');
      expect(console.error).toHaveBeenCalledWith(
        '⚠️ Endpoint \'nonexistent\' non trouvé dans la config'
      );
    });

    test('✅ devrait gérer les endpoints admin inexistants avec fallback', () => {
      const url = getEndpointUrl('admin.nonexistent');
      
      expect(url).toBe('https://moodcycle.irimwebforge.com/api/admin/nonexistent');
      expect(console.error).toHaveBeenCalledWith(
        '⚠️ Endpoint \'admin.nonexistent\' non trouvé dans la config'
      );
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔑 TESTS CONFIGURATION REQUÊTES
  // ──────────────────────────────────────────────────────

  describe('getApiRequestConfig', () => {
    test('✅ devrait retourner la config complète avec device ID', () => {
      const deviceId = 'test-device-123';
      const config = getApiRequestConfig(deviceId);
      
      expect(config.baseURL).toBe('https://moodcycle.irimwebforge.com');
      expect(config.timeout).toBe(15000);
      expect(config.retries).toBe(3);
      expect(config.endpoints).toBeDefined();
      
      expect(config.headers).toEqual({
        'Content-Type': 'application/json',
        'X-Device-ID': deviceId,
        'X-App-Version': '1.0.0-mvp',
        'Accept': 'application/json'
      });
    });

    test('✅ devrait utiliser fallback device ID si manquant', () => {
      const config = getApiRequestConfig();
      
      expect(config.headers['X-Device-ID']).toBe('fallback-device-id');
      expect(console.error).toHaveBeenCalledWith(
        '⚠️ Device ID manquant dans getApiRequestConfig'
      );
    });

    test('✅ devrait utiliser fallback device ID si null', () => {
      const config = getApiRequestConfig(null);
      
      expect(config.headers['X-Device-ID']).toBe('fallback-device-id');
      expect(console.error).toHaveBeenCalledWith(
        '⚠️ Device ID manquant dans getApiRequestConfig'
      );
    });

    test('✅ devrait utiliser fallback device ID si string vide', () => {
      const config = getApiRequestConfig('');
      
      expect(config.headers['X-Device-ID']).toBe('fallback-device-id');
      expect(console.error).toHaveBeenCalledWith(
        '⚠️ Device ID manquant dans getApiRequestConfig'
      );
    });

    test('✅ devrait avoir tous les headers requis', () => {
      const config = getApiRequestConfig('valid-device-id');
      
      expect(config.headers['Content-Type']).toBe('application/json');
      expect(config.headers['X-App-Version']).toBe('1.0.0-mvp');
      expect(config.headers['Accept']).toBe('application/json');
      expect(config.headers['X-Device-ID']).toBe('valid-device-id');
    });
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS GESTION ERREURS
  // ──────────────────────────────────────────────────────

  describe('Error Handling', () => {
    test('✅ devrait logger les erreurs pour endpoints manquants', () => {
      getEndpointUrl('missing-endpoint');
      
      expect(console.error).toHaveBeenCalledWith(
        '⚠️ Endpoint \'missing-endpoint\' non trouvé dans la config'
      );
    });

    test('✅ devrait logger les erreurs pour endpoints admin manquants', () => {
      getEndpointUrl('admin.missing');
      
      expect(console.error).toHaveBeenCalledWith(
        '⚠️ Endpoint \'admin.missing\' non trouvé dans la config'
      );
    });

    test('✅ devrait gérer les endpoints avec notation point invalide', () => {
      const url = getEndpointUrl('invalid.deep.endpoint');
      
      // Devrait traiter comme un endpoint simple
      expect(url).toBe('https://moodcycle.irimwebforge.com/api/invalid.deep.endpoint');
      expect(console.error).toHaveBeenCalledWith(
        '⚠️ Endpoint \'invalid.deep.endpoint\' non trouvé dans la config'
      );
    });
  });

  // ──────────────────────────────────────────────────────
  // ⚡ TESTS PERFORMANCE ET LIMITES
  // ──────────────────────────────────────────────────────

  describe('Performance et Limites', () => {
    test('✅ devrait avoir des timeouts appropriés', () => {
      const config = getApiConfig();
      
      expect(config.timeout).toBeGreaterThan(0);
      expect(config.timeout).toBeLessThanOrEqual(30000); // Max 30s
      expect(config.retries).toBeGreaterThan(0);
      expect(config.retries).toBeLessThanOrEqual(5); // Max 5 retries
    });

    test('✅ devrait maintenir la cohérence entre les méthodes', () => {
      const apiUrl = getApiUrl();
      const config = getApiConfig();
      const requestConfig = getApiRequestConfig('test-device');
      
      expect(apiUrl).toBe(config.baseURL);
      expect(requestConfig.baseURL).toBe(config.baseURL);
      expect(requestConfig.timeout).toBe(config.timeout);
      expect(requestConfig.retries).toBe(config.retries);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS INTÉGRATION
  // ──────────────────────────────────────────────────────

  describe('Intégration', () => {
    test('✅ devrait fonctionner avec tous les endpoints réels', () => {
      const endpoints = ['chat', 'health', 'admin.insights', 'admin.phases', 'admin.closings', 'admin.vignettes'];
      
      endpoints.forEach(endpoint => {
        const url = getEndpointUrl(endpoint);
        expect(url).toMatch(/^https:\/\/moodcycle\.irimwebforge\.com\/api\//);
        expect(url).not.toContain('undefined');
      });
    });

    test('✅ devrait être compatible avec les services existants', () => {
      const config = getApiRequestConfig('service-test-device');
      
      // Vérifier que la config est compatible avec fetch()
      expect(config.headers['Content-Type']).toBe('application/json');
      expect(config.headers['Accept']).toBe('application/json');
      expect(typeof config.timeout).toBe('number');
      expect(typeof config.retries).toBe('number');
    });
  });
}); 