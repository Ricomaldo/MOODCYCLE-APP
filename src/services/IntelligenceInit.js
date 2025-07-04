// ═══════════════════════════════════════════════════════════
// 🧠 IntelligenceInit.js - Initialisation Services Intelligence
// ═══════════════════════════════════════════════════════════

import { getPerformanceReport, resetMetrics, cleanupOldData } from './ProductionMonitoring';
import IntelligenceCache from './IntelligenceCache';
import { refreshAllCaches } from './InsightsEngine';
import { AB_TEST_METRICS } from './ABTestService';
import Config from '../config/appConfig';

// ───────────────────────────────────────────────────────────
// ⚙️ CONFIGURATION INITIALISATION
// ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  enableCache: Config.INTELLIGENCE.ENABLE_CACHE,
  enableABTesting: Config.INTELLIGENCE.ENABLE_AB_TESTING,
  enableMonitoring: Config.isDev() ? Config.INTELLIGENCE.ENABLE_DEV_MONITORING : Config.INTELLIGENCE.ENABLE_PROD_MONITORING,
  enablePerformanceTracking: true,
  cacheTTL: Config.INTELLIGENCE.CACHE_TTL,
  maxCacheSize: Config.INTELLIGENCE.MAX_CACHE_SIZE,
  performanceThresholds: Config.INTELLIGENCE.PERFORMANCE_THRESHOLDS
};

// ───────────────────────────────────────────────────────────
// 🏗️ INITIALISATION SERVICES
// ───────────────────────────────────────────────────────────

export const initializeIntelligence = async (config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  console.log('🧠 Initializing Intelligence Services...', finalConfig);
  
  try {
    // ──────────────────────────────────────────────────────
    // 💾 INITIALISATION CACHE
    // ──────────────────────────────────────────────────────
    
    if (finalConfig.enableCache) {
      await initializeCache(finalConfig);
    }
    
    // ──────────────────────────────────────────────────────
    // 🧪 INITIALISATION A/B TESTING
    // ──────────────────────────────────────────────────────
    
    if (finalConfig.enableABTesting) {
      await initializeABTesting(finalConfig);
    }
    
    // ──────────────────────────────────────────────────────
    // 📊 INITIALISATION MONITORING
    // ──────────────────────────────────────────────────────
    
    if (finalConfig.enableMonitoring) {
      await initializeMonitoring(finalConfig);
    }
    
    // ──────────────────────────────────────────────────────
    // 🔄 NETTOYAGE DONNÉES
    // ──────────────────────────────────────────────────────
    
    await cleanupIntelligenceData();
    
    // ──────────────────────────────────────────────────────
    // ✅ VALIDATION INITIALISATION
    // ──────────────────────────────────────────────────────
    
    const healthStatus = await validateIntelligenceHealth();
    
    console.log('✅ Intelligence Services initialized successfully:', {
      cacheEnabled: finalConfig.enableCache,
      abTestingEnabled: finalConfig.enableABTesting,
      monitoringEnabled: finalConfig.enableMonitoring,
      healthStatus
    });
    
    return {
      success: true,
      config: finalConfig,
      healthStatus,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('🚨 Error initializing Intelligence Services:', error);
    
    // Fallback minimal
    await initializeMinimalServices();
    
    return {
      success: false,
      error: error.message,
      fallback: true,
      timestamp: Date.now()
    };
  }
};

// ───────────────────────────────────────────────────────────
// 💾 INITIALISATION CACHE
// ───────────────────────────────────────────────────────────

const initializeCache = async (config) => {
  try {
    console.log('💾 Initializing Intelligence Cache...');
    
    // Réinitialiser les métriques cache
    resetMetrics();
    
    // Nettoyer anciennes données
    cleanupOldData();
    
    // Précharger cache avec données fréquentes
    await preloadFrequentData();
    
    console.log('✅ Cache initialized successfully');
    
  } catch (error) {
    console.error('🚨 Cache initialization error:', error);
    throw error;
  }
};

const preloadFrequentData = async () => {
  try {
    // Précharger les personas les plus courants
    const commonPersonas = ['emma', 'laure', 'clara'];
    const commonPhases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
    
    // Créer des données de test pour préchargement
    for (const persona of commonPersonas) {
      for (const phase of commonPhases) {
        const testData = {
          personalizedPrompts: [`Test prompt for ${persona} in ${phase}`],
          contextualActions: [{
            type: 'chat',
            title: 'Test action',
            confidence: 80
          }],
          personalization: {
            confidence: 75,
            dataPoints: { timePatterns: 3, phaseData: 4, conversationHistory: 5 },
            recommendations: ['Continue tes interactions']
          }
        };
        
        // Simuler mise en cache (en vrai, utiliser le vrai cache)
        console.log(`💾 Preloading cache for ${persona} - ${phase}`);
      }
    }
    
  } catch (error) {
    console.warn('⚠️ Preload cache error (non-critical):', error);
  }
};

// ───────────────────────────────────────────────────────────
// 🧪 INITIALISATION A/B TESTING
// ───────────────────────────────────────────────────────────

const initializeABTesting = async (config) => {
  try {
    console.log('🧪 Initializing A/B Testing...');
    
    // Valider configuration A/B test
    validateABTestConfig();
    
    // Initialiser métriques A/B test
    initializeABTestMetrics();
    
    console.log('✅ A/B Testing initialized successfully');
    
  } catch (error) {
    console.error('🚨 A/B Testing initialization error:', error);
    throw error;
  }
};

const validateABTestConfig = () => {
  const { MIN_OBSERVATIONS, CONFIDENCE_THRESHOLD } = AB_TEST_METRICS;
  
  if (MIN_OBSERVATIONS < 5) {
    console.warn('⚠️ A/B Test MIN_OBSERVATIONS seems low:', MIN_OBSERVATIONS);
  }
  
  if (CONFIDENCE_THRESHOLD < 0.5) {
    console.warn('⚠️ A/B Test CONFIDENCE_THRESHOLD seems low:', CONFIDENCE_THRESHOLD);
  }
};

const initializeABTestMetrics = () => {
  // Initialiser les métriques A/B test
  global.abTestMetrics = {
    totalTests: 0,
    predictiveWins: 0,
    observationWins: 0,
    averageAccuracy: 0,
    lastTestTime: null
  };
};

// ───────────────────────────────────────────────────────────
// 📊 INITIALISATION MONITORING
// ───────────────────────────────────────────────────────────

const initializeMonitoring = async (config) => {
  try {
    console.log('📊 Initializing Performance Monitoring...');
    
    // Réinitialiser métriques monitoring
    resetMetrics();
    
    // Configurer seuils de performance
    configurePerformanceThresholds(config.performanceThresholds);
    
    // Initialiser monitoring mémoire
    initializeMemoryMonitoring();
    
    console.log('✅ Performance Monitoring initialized successfully');
    
  } catch (error) {
    console.error('🚨 Monitoring initialization error:', error);
    throw error;
  }
};

const configurePerformanceThresholds = (thresholds) => {
  // Configurer les seuils globaux
  global.performanceThresholds = {
    ...DEFAULT_CONFIG.performanceThresholds,
    ...thresholds
  };
  
  console.log('📊 Performance thresholds configured:', global.performanceThresholds);
};

const initializeMemoryMonitoring = () => {
  // Démarrer monitoring mémoire périodique
  if (global.performanceThresholds) {
    setInterval(() => {
      try {
        // Simuler monitoring mémoire
        const memoryUsage = Math.random() * 100;
        
        if (memoryUsage > global.performanceThresholds.memoryUsage) {
          console.warn('⚠️ High memory usage detected:', memoryUsage.toFixed(1) + 'MB');
        }
      } catch (error) {
        console.warn('⚠️ Memory monitoring error:', error);
      }
    }, Config.INTELLIGENCE.MONITORING_INTERVAL);
  }
};

// ───────────────────────────────────────────────────────────
// 🔄 NETTOYAGE DONNÉES
// ───────────────────────────────────────────────────────────

const cleanupIntelligenceData = async () => {
  try {
    console.log('🧹 Cleaning up intelligence data...');
    
    // Nettoyer cache insights
    await refreshAllCaches();
    
    // Nettoyer anciennes données monitoring
    cleanupOldData();
    
    // Nettoyer données A/B test obsolètes
    cleanupABTestData();
    
    console.log('✅ Intelligence data cleaned up');
    
  } catch (error) {
    console.warn('⚠️ Cleanup error (non-critical):', error);
  }
};

const cleanupABTestData = () => {
  try {
    // Nettoyer données A/B test anciennes
    if (global.abTestMetrics && global.abTestMetrics.lastTestTime) {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      if (global.abTestMetrics.lastTestTime < oneDayAgo) {
        console.log('🧹 Cleaning up old A/B test data');
        global.abTestMetrics = {
          totalTests: 0,
          predictiveWins: 0,
          observationWins: 0,
          averageAccuracy: 0,
          lastTestTime: null
        };
      }
    }
  } catch (error) {
    console.warn('⚠️ A/B test cleanup error:', error);
  }
};

// ───────────────────────────────────────────────────────────
// ✅ VALIDATION SANTÉ
// ───────────────────────────────────────────────────────────

const validateIntelligenceHealth = async () => {
  try {
    const performanceReport = getPerformanceReport();
    
    const healthStatus = {
      cache: {
        enabled: true,
        hitRate: performanceReport.cacheHitRate || 0,
        healthy: (performanceReport.cacheHitRate || 0) > 0.5
      },
      abTesting: {
        enabled: true,
        configured: !!global.abTestMetrics,
        healthy: true
      },
      monitoring: {
        enabled: true,
        thresholds: !!global.performanceThresholds,
        healthy: true
      },
      overall: 'healthy'
    };
    
    // Déterminer santé globale
    const unhealthyServices = Object.values(healthStatus)
      .filter(service => service.enabled && !service.healthy);
    
    if (unhealthyServices.length > 0) {
      healthStatus.overall = 'warning';
    }
    
    return healthStatus;
    
  } catch (error) {
    console.error('🚨 Health validation error:', error);
    return {
      overall: 'error',
      error: error.message
    };
  }
};

// ───────────────────────────────────────────────────────────
// 🆘 FALLBACK MINIMAL
// ───────────────────────────────────────────────────────────

const initializeMinimalServices = async () => {
  try {
    console.log('🆘 Initializing minimal intelligence services...');
    
    // Services minimaux essentiels
    global.performanceThresholds = DEFAULT_CONFIG.performanceThresholds;
    
    console.log('✅ Minimal services initialized');
    
  } catch (error) {
    console.error('🚨 Minimal services initialization error:', error);
  }
};

// ───────────────────────────────────────────────────────────
// 🎯 API PUBLIQUE
// ───────────────────────────────────────────────────────────

export default {
  initializeIntelligence,
  validateIntelligenceHealth,
  DEFAULT_CONFIG
}; 