//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/api.js
// 🧩 Type: Config
// 📚 Description: Configuration centralisée des endpoints et options API pour l’app MoodCycle
// 🕒 Version: 3.0 - 2025-06-21
// 🧭 Used in: global API config, services, data fetching
// ─────────────────────────────────────────────────────────
//
/**
 * 🎯 CONFIGURATION API MVP
 * Simple et pragmatique - évite over-engineering
 */
const API_CONFIG = {
  development: {
    baseURL: "https://moodcycle.irimwebforge.com", // Supprimé /api pour éviter le double /api
    timeout: 10000,
    retries: 2,
  },
  production: {
    baseURL: "https://moodcycle.irimwebforge.com",
    timeout: 15000,
    retries: 3,
  },
};

/**
 * 🔧 RÉCUPÉRATION CONFIG ACTIVE
 * Auto-sélection développement/production
 */
export const getApiConfig = () => {
  const config = __DEV__ ? API_CONFIG.development : API_CONFIG.production;

  if (__DEV__) {
    console.log("🔧 API Config (DEV):", config.baseURL);
  }

  return config;
};

/**
 * 🌐 URL API RAPIDE (backward compatibility)
 * Pour migration facile du code existant
 */
export const getApiUrl = () => {
  return getApiConfig().baseURL;
};

/**
 * ⚙️ CONFIGURATION COMPLÈTE
 * Headers, timeout, etc. pour les appels
 */
export const getApiRequestConfig = (deviceId) => {
  const config = getApiConfig();

  return {
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      "Content-Type": "application/json",
      "X-Device-ID": deviceId,
      "X-App-Version": "1.0.0-mvp",
    },
    retries: config.retries,
  };
};

// Export par défaut pour compatibilité
export default {
  getApiConfig,
  getApiUrl,
  getApiRequestConfig,
};
