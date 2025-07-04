// ═══════════════════════════════════════════════════════════
// 📊 ProductionMonitoring.js - Monitoring Pipeline Production
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 📈 MÉTRIQUES DE PERFORMANCE
// ───────────────────────────────────────────────────────────

const PERFORMANCE_THRESHOLDS = {
  PIPELINE_EXECUTION: 50,    // ms - seuil pipeline lent
  CACHE_HIT_RATE: 0.8,       // 80% - seuil cache efficace
  MEMORY_USAGE: 50,          // MB - seuil mémoire
  ERROR_RATE: 0.05,          // 5% - seuil erreurs
  SLOW_QUERIES: 0.1          // 10% - seuil requêtes lentes
};

const ALERT_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// ───────────────────────────────────────────────────────────
// 📊 STORE MÉTRIQUES GLOBAL
// ───────────────────────────────────────────────────────────

class MetricsStore {
  constructor() {
    this.metrics = {
      pipelineExecutions: 0,
      totalDuration: 0,
      averageDuration: 0,
      slowExecutions: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      lastAlert: null,
      performanceHistory: []
    };
    
    this.maxHistorySize = 100;
  }
  
  addExecution(duration, cacheHit = false) {
    this.metrics.pipelineExecutions++;
    this.metrics.totalDuration += duration;
    this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.pipelineExecutions;
    
    if (duration > PERFORMANCE_THRESHOLDS.PIPELINE_EXECUTION) {
      this.metrics.slowExecutions++;
    }
    
    if (cacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
    
    // Ajouter à l'historique
    this.metrics.performanceHistory.push({
      duration,
      cacheHit,
      timestamp: Date.now()
    });
    
    // Limiter la taille de l'historique
    if (this.metrics.performanceHistory.length > this.maxHistorySize) {
      this.metrics.performanceHistory.shift();
    }
  }
  
  addError(error) {
    this.metrics.errors++;
  }
  
  getMetrics() {
    const cacheHitRate = this.metrics.cacheHits / 
      (this.metrics.cacheHits + this.metrics.cacheMisses) || 0;
    
    const slowQueryRate = this.metrics.slowExecutions / 
      this.metrics.pipelineExecutions || 0;
    
    const errorRate = this.metrics.errors / 
      this.metrics.pipelineExecutions || 0;
    
    return {
      ...this.metrics,
      cacheHitRate,
      slowQueryRate,
      errorRate,
      health: this.calculateHealth(cacheHitRate, slowQueryRate, errorRate)
    };
  }
  
  calculateHealth(cacheHitRate, slowQueryRate, errorRate) {
    if (errorRate > PERFORMANCE_THRESHOLDS.ERROR_RATE) return 'critical';
    if (slowQueryRate > PERFORMANCE_THRESHOLDS.SLOW_QUERIES) return 'warning';
    if (cacheHitRate < PERFORMANCE_THRESHOLDS.CACHE_HIT_RATE) return 'warning';
    if (this.metrics.averageDuration > PERFORMANCE_THRESHOLDS.PIPELINE_EXECUTION) return 'warning';
    return 'healthy';
  }
  
  reset() {
    this.metrics = {
      pipelineExecutions: 0,
      totalDuration: 0,
      averageDuration: 0,
      slowExecutions: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      lastAlert: null,
      performanceHistory: []
    };
  }
}

// Instance globale
const metricsStore = new MetricsStore();

// ───────────────────────────────────────────────────────────
// 📊 FONCTIONS DE MONITORING
// ───────────────────────────────────────────────────────────

export const trackPipelineExecution = (data) => {
  const { duration, cacheHit, persona, phase, error } = data;
  
  try {
    // Ajouter métriques
    metricsStore.addExecution(duration, cacheHit);
    
    // Vérifier seuils de performance
    const metrics = metricsStore.getMetrics();
    
    // Alert si pipeline lent
    if (duration > PERFORMANCE_THRESHOLDS.PIPELINE_EXECUTION) {
      sendPerformanceAlert({
        type: 'SLOW_PIPELINE',
        level: ALERT_LEVELS.WARNING,
        message: `Pipeline lent: ${duration.toFixed(1)}ms`,
        data: { duration, persona, phase, average: metrics.averageDuration }
      });
    }
    
    // Alert si cache hit rate faible
    if (metrics.cacheHitRate < PERFORMANCE_THRESHOLDS.CACHE_HIT_RATE && metrics.pipelineExecutions > 10) {
      sendPerformanceAlert({
        type: 'LOW_CACHE_HIT',
        level: ALERT_LEVELS.WARNING,
        message: `Cache hit rate faible: ${(metrics.cacheHitRate * 100).toFixed(1)}%`,
        data: { cacheHitRate: metrics.cacheHitRate, hits: metrics.cacheHits, misses: metrics.cacheMisses }
      });
    }
    
    // Log en développement
    if (__DEV__) {
      console.log('📊 Pipeline Execution:', {
        duration: `${duration.toFixed(1)}ms`,
        cacheHit,
        persona,
        phase,
        average: `${metrics.averageDuration.toFixed(1)}ms`,
        health: metrics.health
      });
    }
    
  } catch (error) {
    console.error('🚨 Error tracking pipeline execution:', error);
    metricsStore.addError(error);
  }
};

export const trackError = (error, context = {}) => {
  try {
    metricsStore.addError(error);
    
    const metrics = metricsStore.getMetrics();
    
    // Alert si taux d'erreur élevé
    if (metrics.errorRate > PERFORMANCE_THRESHOLDS.ERROR_RATE) {
      sendPerformanceAlert({
        type: 'HIGH_ERROR_RATE',
        level: ALERT_LEVELS.ERROR,
        message: `Taux d'erreur élevé: ${(metrics.errorRate * 100).toFixed(1)}%`,
        data: { errorRate: metrics.errorRate, errors: metrics.errors, context }
      });
    }
    
    // Log erreur
    console.error('🚨 Pipeline Error:', {
      error: error.message,
      stack: error.stack,
      context,
      metrics: metrics.getMetrics()
    });
    
  } catch (trackingError) {
    console.error('🚨 Error tracking error:', trackingError);
  }
};

export const trackMemoryUsage = () => {
  try {
    // Simuler monitoring mémoire (React Native n'a pas d'API native)
    const memoryInfo = {
      used: Math.random() * 100, // Simulation
      total: 512,
      timestamp: Date.now()
    };
    
    if (memoryInfo.used > PERFORMANCE_THRESHOLDS.MEMORY_USAGE) {
      sendPerformanceAlert({
        type: 'HIGH_MEMORY_USAGE',
        level: ALERT_LEVELS.WARNING,
        message: `Usage mémoire élevé: ${memoryInfo.used.toFixed(1)}MB`,
        data: memoryInfo
      });
    }
    
    return memoryInfo;
  } catch (error) {
    console.error('🚨 Error tracking memory usage:', error);
    return null;
  }
};

// ───────────────────────────────────────────────────────────
// 🚨 SYSTÈME D'ALERTES
// ───────────────────────────────────────────────────────────

const sendPerformanceAlert = (alert) => {
  try {
    // Éviter alertes dupliquées
    const lastAlert = metricsStore.metrics.lastAlert;
    if (lastAlert && 
        lastAlert.type === alert.type && 
        Date.now() - lastAlert.timestamp < 60000) { // 1 minute
      return;
    }
    
    // Mettre à jour dernière alerte
    metricsStore.metrics.lastAlert = {
      ...alert,
      timestamp: Date.now()
    };
    
    // Log alerte
    console.warn(`⚠️ Performance Alert [${alert.level.toUpperCase()}]:`, {
      type: alert.type,
      message: alert.message,
      data: alert.data
    });
    
    // TODO: Envoyer à service externe (Sentry, LogRocket, etc.)
    // if (alert.level === ALERT_LEVELS.CRITICAL) {
    //   crashlytics().recordError(new Error(alert.message));
    // }
    
    // TODO: Notification push pour alertes critiques
    // if (alert.level === ALERT_LEVELS.CRITICAL) {
    //   sendPushNotification(alert);
    // }
    
  } catch (error) {
    console.error('🚨 Error sending performance alert:', error);
  }
};

// ───────────────────────────────────────────────────────────
// 📈 RAPPORTS ET ANALYTICS
// ───────────────────────────────────────────────────────────

export const getPerformanceReport = () => {
  return metricsStore.getMetrics();
};

export const getHealthStatus = () => {
  const metrics = metricsStore.getMetrics();
  return {
    status: metrics.health,
    score: calculateHealthScore(metrics),
    recommendations: generateRecommendations(metrics)
  };
};

const calculateHealthScore = (metrics) => {
  let score = 100;
  
  // Pénaliser les métriques problématiques
  if (metrics.averageDuration > PERFORMANCE_THRESHOLDS.PIPELINE_EXECUTION) {
    score -= 20;
  }
  
  if (metrics.cacheHitRate < PERFORMANCE_THRESHOLDS.CACHE_HIT_RATE) {
    score -= 15;
  }
  
  if (metrics.errorRate > PERFORMANCE_THRESHOLDS.ERROR_RATE) {
    score -= 30;
  }
  
  if (metrics.slowQueryRate > PERFORMANCE_THRESHOLDS.SLOW_QUERIES) {
    score -= 15;
  }
  
  return Math.max(0, score);
};

const generateRecommendations = (metrics) => {
  const recommendations = [];
  
  if (metrics.averageDuration > PERFORMANCE_THRESHOLDS.PIPELINE_EXECUTION) {
    recommendations.push("Optimiser le pipeline de personnalisation");
  }
  
  if (metrics.cacheHitRate < PERFORMANCE_THRESHOLDS.CACHE_HIT_RATE) {
    recommendations.push("Améliorer la stratégie de cache");
  }
  
  if (metrics.errorRate > PERFORMANCE_THRESHOLDS.ERROR_RATE) {
    recommendations.push("Investigation des erreurs pipeline");
  }
  
  if (metrics.slowQueryRate > PERFORMANCE_THRESHOLDS.SLOW_QUERIES) {
    recommendations.push("Optimiser les requêtes lentes");
  }
  
  return recommendations;
};

// ───────────────────────────────────────────────────────────
// 🧹 MAINTENANCE
// ───────────────────────────────────────────────────────────

export const resetMetrics = () => {
  metricsStore.reset();
  console.log('🔄 Metrics reset');
};

export const cleanupOldData = () => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 heures
  
  metricsStore.metrics.performanceHistory = 
    metricsStore.metrics.performanceHistory.filter(
      entry => now - entry.timestamp < maxAge
    );
  
  console.log('🧹 Old performance data cleaned up');
};

// ───────────────────────────────────────────────────────────
// 🎯 API PUBLIQUE
// ───────────────────────────────────────────────────────────

export default {
  trackPipelineExecution,
  trackError,
  trackMemoryUsage,
  getPerformanceReport,
  getHealthStatus,
  resetMetrics,
  cleanupOldData,
  PERFORMANCE_THRESHOLDS,
  ALERT_LEVELS
}; 