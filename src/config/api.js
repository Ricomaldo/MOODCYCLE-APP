//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/api.js
// 🧩 Type: Config
// 📚 Description: Configuration centralisée des endpoints et options API pour l'app MoodCycle
// 🕒 Version: 3.0 - 2025-06-21
// 🧭 Used in: global API config, services, data fetching
// ─────────────────────────────────────────────────────────
//
const API_CONFIG = {
  development: {
    baseURL: "http://localhost:3001",
    endpoints: {
      chat: '/api/chat',
      health: '/api/health',
      // Endpoints publics pour l'app mobile (pas d'auth requise)
      insights: '/api/insights',
      phases: '/api/phases',
      closings: '/api/closings',
      vignettes: '/api/vignettes',
      // Endpoints stores sync
      storesSync: '/api/stores/sync',
      storesAnalytics: '/api/stores/analytics',
      // Endpoints admin pour l'édition (auth requise)
      admin: {
        insights: '/api/admin/insights',
        phases: '/api/admin/phases', 
        closings: '/api/admin/closings',
        vignettes: '/api/admin/vignettes',
      }
    },
    timeout: 10000,
    retries: 2,
  },
  production: {
    baseURL: "https://moodcycle.irimwebforge.com",
    endpoints: {
      chat: '/api/chat',
      health: '/api/health',
      // Endpoints publics pour l'app mobile (pas d'auth requise)
      insights: '/api/insights',
      phases: '/api/phases',
      closings: '/api/closings',
      vignettes: '/api/vignettes',
      // Endpoints stores sync
      storesSync: '/api/stores/sync',
      storesAnalytics: '/api/stores/analytics',
      // Endpoints admin pour l'édition (auth requise)
      admin: {
        insights: '/api/admin/insights',
        phases: '/api/admin/phases',
        closings: '/api/admin/closings', 
        vignettes: '/api/admin/vignettes',
      }
    },
    timeout: 15000,
    retries: 3,
  },
};

export const getApiConfig = () => {
  const config = __DEV__ ? API_CONFIG.development : API_CONFIG.production;
  if (__DEV__) {
    console.info("🔧 API Config (DEV):", config.baseURL);
  }

  return config;
};

export const getApiUrl = () => {
  return getApiConfig().baseURL;
};

export const getEndpointUrl = (endpointName) => {
  const config = getApiConfig();
  
  if (endpointName.includes('.')) {
    const [category, endpoint] = endpointName.split('.');
    const categoryEndpoints = config.endpoints?.[category];
    const endpointPath = categoryEndpoints?.[endpoint];
    
    if (!endpointPath) {
      console.error(`⚠️ Endpoint '${endpointName}' non trouvé dans la config`);
      return `${config.baseURL}/api/${category}/${endpoint}`;
    }
    
    return `${config.baseURL}${endpointPath}`;
  }
  
  const endpoint = config.endpoints?.[endpointName];
  
  if (!endpoint) {
    console.error(`⚠️ Endpoint '${endpointName}' non trouvé dans la config`);
    return `${config.baseURL}/api/${endpointName}`;
  }
  
  return `${config.baseURL}${endpoint}`;
};

export const getApiRequestConfig = (deviceId) => {
  const config = getApiConfig();

  if (!deviceId) {
    console.error('⚠️ Device ID manquant dans getApiRequestConfig');
  }

  return {
    baseURL: config.baseURL,
    endpoints: config.endpoints,
    timeout: config.timeout,
    headers: {
      "Content-Type": "application/json",
      "X-Device-ID": deviceId || 'fallback-device-id',
      "X-App-Version": "1.0.0-mvp",
      "Accept": "application/json"
    },
    retries: config.retries,
  };
};

export default {
  getApiConfig,
  getApiUrl,
  getEndpointUrl,
  getApiRequestConfig,
};
