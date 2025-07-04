// ═══════════════════════════════════════════════════════════
// ⚙️ appConfig.js - Configuration Centralisée Application
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 🎯 CONFIGURATION ENVIRONNEMENT
// ───────────────────────────────────────────────────────────

const ENV = {
  DEV: __DEV__,
  PROD: !__DEV__,
  TEST: process.env.NODE_ENV === 'test'
};

// ───────────────────────────────────────────────────────────
// 🧠 CONFIGURATION INTELLIGENCE
// ───────────────────────────────────────────────────────────

const INTELLIGENCE_CONFIG = {
  // Cache
  ENABLE_CACHE: true,
  CACHE_TTL: 300000, // 5 minutes
  MAX_CACHE_SIZE: 100,
  
  // A/B Testing
  ENABLE_AB_TESTING: true,
  AB_TEST_MIN_OBSERVATIONS: 10,
  AB_TEST_CONFIDENCE_THRESHOLD: 0.7,
  
  // Monitoring
  ENABLE_PROD_MONITORING: false, // Désactivé en prod par défaut
  ENABLE_DEV_MONITORING: true,
  MONITORING_INTERVAL: 30000, // 30 secondes
  
  // Performance
  PERFORMANCE_THRESHOLDS: {
    pipelineExecution: 50, // ms
    cacheHitRate: 0.8, // 80%
    errorRate: 0.05, // 5%
    memoryUsage: 100 // MB
  }
};

// ───────────────────────────────────────────────────────────
// 🎨 CONFIGURATION UI/UX
// ───────────────────────────────────────────────────────────

const UI_CONFIG = {
  // Animations
  ENABLE_ANIMATIONS: true,
  ANIMATION_DURATION: 300,
  
  // Thèmes
  DEFAULT_THEME: 'auto',
  ENABLE_DARK_MODE: true,
  
  // Performance UI
  ENABLE_LAZY_LOADING: true,
  ENABLE_VIRTUALIZATION: true
};

// ───────────────────────────────────────────────────────────
// 🌐 CONFIGURATION RÉSEAU
// ───────────────────────────────────────────────────────────

const NETWORK_CONFIG = {
  // API
  API_TIMEOUT: 10000, // 10 secondes
  API_RETRY_ATTEMPTS: 3,
  
  // Sync
  ENABLE_OFFLINE_SYNC: true,
  SYNC_INTERVAL: 60000, // 1 minute
  
  // Cache réseau
  ENABLE_NETWORK_CACHE: true,
  NETWORK_CACHE_TTL: 600000 // 10 minutes
};

// ───────────────────────────────────────────────────────────
// 🔧 CONFIGURATION DÉVELOPPEMENT
// ───────────────────────────────────────────────────────────

const DEV_CONFIG = {
  // Debug
  ENABLE_DEBUG_LOGS: __DEV__,
  ENABLE_PERFORMANCE_LOGS: __DEV__,
  
  // Dev Panel
  ENABLE_DEV_PANEL: __DEV__,
  ENABLE_PERFORMANCE_DASHBOARD: __DEV__,
  
  // Tests
  ENABLE_MOCK_DATA: __DEV__,
  ENABLE_TEST_MODE: process.env.NODE_ENV === 'test'
};

// ───────────────────────────────────────────────────────────
// 📊 CONFIGURATION ANALYTICS
// ───────────────────────────────────────────────────────────

const ANALYTICS_CONFIG = {
  // Tracking
  ENABLE_ANALYTICS: !__DEV__, // Désactivé en dev
  ENABLE_CRASH_REPORTING: !__DEV__,
  
  // Privacy
  ENABLE_USER_TRACKING: false,
  ENABLE_PERFORMANCE_TRACKING: true
};

// ───────────────────────────────────────────────────────────
// 🎯 CONFIGURATION GLOBALE
// ───────────────────────────────────────────────────────────

const Config = {
  // Environnement
  ENV,
  
  // Services
  INTELLIGENCE: INTELLIGENCE_CONFIG,
  UI: UI_CONFIG,
  NETWORK: NETWORK_CONFIG,
  DEV: DEV_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  
  // Utilitaires
  isDev: () => __DEV__,
  isProd: () => !__DEV__,
  isTest: () => process.env.NODE_ENV === 'test',
  
  // Configuration dynamique
  getIntelligenceConfig: () => ({
    enableCache: INTELLIGENCE_CONFIG.ENABLE_CACHE,
    enableABTesting: INTELLIGENCE_CONFIG.ENABLE_AB_TESTING,
    enableMonitoring: __DEV__ ? INTELLIGENCE_CONFIG.ENABLE_DEV_MONITORING : INTELLIGENCE_CONFIG.ENABLE_PROD_MONITORING,
    enablePerformanceTracking: true,
    cacheTTL: INTELLIGENCE_CONFIG.CACHE_TTL,
    maxCacheSize: INTELLIGENCE_CONFIG.MAX_CACHE_SIZE,
    performanceThresholds: INTELLIGENCE_CONFIG.PERFORMANCE_THRESHOLDS
  })
};

// ───────────────────────────────────────────────────────────
// 🎯 EXPORT
// ───────────────────────────────────────────────────────────

export default Config;
export {
  ENV,
  INTELLIGENCE_CONFIG,
  UI_CONFIG,
  NETWORK_CONFIG,
  DEV_CONFIG,
  ANALYTICS_CONFIG
}; 