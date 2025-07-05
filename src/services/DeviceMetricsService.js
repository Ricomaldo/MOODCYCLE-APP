//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/DeviceMetricsService.js
// 🧩 Type: Device Metrics Service
// 📚 Description: Service de collecte métriques device et performance
// 🕒 Version: 1.0 - 2025-01-15
// 🧭 Used in: Performance monitoring, optimization
// ─────────────────────────────────────────────────────────
//

import { Platform, Dimensions, PixelRatio } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class DeviceMetricsService {
  constructor() {
    this.metrics = {
      device: {},
      performance: {},
      network: {},
      battery: {},
      memory: {},
      crashes: []
    };
    
    this.collectors = [];
    this.isCollecting = false;
    this.collectionInterval = null;
    this.storageKey = 'device_metrics_data';
    
    // Configuration
    this.config = {
      collectionInterval: 60000, // 1 minute
      maxMetricsHistory: 100,
      maxCrashReports: 20,
      performanceThreshold: {
        fps: 30,
        memoryWarning: 80, // %
        networkLatency: 2000 // ms
      }
    };
    
    this.initializeService();
  }

  /**
   * Initialiser le service
   */
  async initializeService() {
    try {
      // Charger les métriques existantes
      await this.loadStoredMetrics();
      
      // Collecter les infos device de base
      await this.collectDeviceInfo();
      
      // Démarrer la collecte périodique
      this.startPeriodicCollection();
      
      console.log('📊 DeviceMetricsService initialisé');
    } catch (error) {
      console.error('❌ Erreur init DeviceMetricsService:', error);
    }
  }

  /**
   * Charger les métriques stockées
   */
  async loadStoredMetrics() {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.metrics = { ...this.metrics, ...data };
      }
    } catch (error) {
      console.error('❌ Erreur chargement metrics:', error);
    }
  }

  /**
   * Sauvegarder les métriques
   */
  async saveMetrics() {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.metrics));
    } catch (error) {
      console.error('❌ Erreur sauvegarde metrics:', error);
    }
  }

  /**
   * Collecter les informations device
   */
  async collectDeviceInfo() {
    try {
      const { width, height } = Dimensions.get('window');
      const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
      
      this.metrics.device = {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        model: Platform.constants?.Model || 'unknown',
        brand: Platform.constants?.Brand || 'unknown',
        buildNumber: Platform.constants?.Build || 'unknown',
        
        // Dimensions
        screenWidth,
        screenHeight,
        windowWidth: width,
        windowHeight: height,
        pixelRatio: PixelRatio.get(),
        fontScale: PixelRatio.getFontScale(),
        
        // Spécifique iOS
        ...(Platform.OS === 'ios' && {
          systemName: Platform.constants?.systemName,
          systemVersion: Platform.constants?.systemVersion,
          isTablet: Platform.constants?.interfaceIdiom === 'pad'
        }),
        
        // Spécifique Android
        ...(Platform.OS === 'android' && {
          apiLevel: Platform.constants?.Version,
          fingerprint: Platform.constants?.Fingerprint,
          serial: Platform.constants?.Serial
        }),
        
        // Timestamp
        collectedAt: new Date().toISOString()
      };
      
      console.log('📱 Device info collected');
    } catch (error) {
      console.error('❌ Erreur collecte device info:', error);
    }
  }

  /**
   * Collecter les métriques réseau
   */
  async collectNetworkMetrics() {
    try {
      const networkState = await NetInfo.fetch();
      
      const networkMetrics = {
        isConnected: networkState.isConnected,
        type: networkState.type,
        isInternetReachable: networkState.isInternetReachable,
        timestamp: Date.now()
      };
      
      // Informations détaillées selon le type
      if (networkState.details) {
        networkMetrics.details = {
          isConnectionExpensive: networkState.details.isConnectionExpensive,
          ...(networkState.type === 'wifi' && {
            ssid: networkState.details.ssid,
            bssid: networkState.details.bssid,
            strength: networkState.details.strength,
            ipAddress: networkState.details.ipAddress,
            subnet: networkState.details.subnet
          }),
          ...(networkState.type === 'cellular' && {
            cellularGeneration: networkState.details.cellularGeneration,
            carrier: networkState.details.carrier
          })
        };
      }
      
      // Mesurer la latence
      const latencyStart = Date.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD',
          timeout: 5000 
        });
        networkMetrics.latency = Date.now() - latencyStart;
      } catch (error) {
        networkMetrics.latency = -1; // Échec
      }
      
      // Ajouter aux métriques réseau
      if (!this.metrics.network.history) {
        this.metrics.network.history = [];
      }
      
      this.metrics.network.current = networkMetrics;
      this.metrics.network.history.push(networkMetrics);
      
      // Limiter l'historique
      if (this.metrics.network.history.length > this.config.maxMetricsHistory) {
        this.metrics.network.history = this.metrics.network.history.slice(-this.config.maxMetricsHistory);
      }
      
    } catch (error) {
      console.error('❌ Erreur collecte network metrics:', error);
    }
  }

  /**
   * Collecter les métriques de performance
   */
  collectPerformanceMetrics() {
    try {
      const performanceMetrics = {
        timestamp: Date.now(),
        
        // Métriques React Native
        jsHeapSizeUsed: global.performance?.memory?.usedJSHeapSize || 0,
        jsHeapSizeTotal: global.performance?.memory?.totalJSHeapSize || 0,
        jsHeapSizeLimit: global.performance?.memory?.jsHeapSizeLimit || 0,
        
        // Temps de rendu (approximatif)
        renderTime: this.measureRenderTime(),
        
        // Métriques mémoire (si disponibles)
        memoryWarnings: this.getMemoryWarnings(),
        
        // FPS (simulation - React Native n'expose pas directement)
        estimatedFPS: this.estimateFPS()
      };
      
      // Ajouter aux métriques performance
      if (!this.metrics.performance.history) {
        this.metrics.performance.history = [];
      }
      
      this.metrics.performance.current = performanceMetrics;
      this.metrics.performance.history.push(performanceMetrics);
      
      // Limiter l'historique
      if (this.metrics.performance.history.length > this.config.maxMetricsHistory) {
        this.metrics.performance.history = this.metrics.performance.history.slice(-this.config.maxMetricsHistory);
      }
      
    } catch (error) {
      console.error('❌ Erreur collecte performance metrics:', error);
    }
  }

  /**
   * Mesurer le temps de rendu approximatif
   */
  measureRenderTime() {
    const start = Date.now();
    
    // Simuler une opération de rendu
    setTimeout(() => {
      const renderTime = Date.now() - start;
      return renderTime;
    }, 0);
    
    return Date.now() - start;
  }

  /**
   * Obtenir les avertissements mémoire
   */
  getMemoryWarnings() {
    // Simulation - React Native n'expose pas directement ces infos
    return {
      warningCount: 0,
      lastWarning: null,
      memoryPressure: 'normal' // normal, warning, critical
    };
  }

  /**
   * Estimer les FPS
   */
  estimateFPS() {
    // Simulation basique - React Native n'expose pas les FPS
    const frames = [];
    const startTime = Date.now();
    
    const measureFrame = () => {
      frames.push(Date.now());
      if (frames.length > 60) frames.shift();
      
      if (frames.length > 1) {
        const duration = frames[frames.length - 1] - frames[0];
        const fps = (frames.length - 1) / (duration / 1000);
        return Math.round(fps);
      }
      
      return 60; // Valeur par défaut
    };
    
    return measureFrame();
  }

  /**
   * Collecter les métriques batterie (simulation)
   */
  collectBatteryMetrics() {
    try {
      // React Native n'expose pas directement les infos batterie
      // Simulation basée sur l'usage
      const batteryMetrics = {
        timestamp: Date.now(),
        level: this.estimateBatteryLevel(),
        isCharging: this.estimateChargingState(),
        chargingTime: null,
        dischargingTime: null,
        batteryImpact: this.calculateBatteryImpact()
      };
      
      this.metrics.battery.current = batteryMetrics;
      
      if (!this.metrics.battery.history) {
        this.metrics.battery.history = [];
      }
      
      this.metrics.battery.history.push(batteryMetrics);
      
      // Limiter l'historique
      if (this.metrics.battery.history.length > this.config.maxMetricsHistory) {
        this.metrics.battery.history = this.metrics.battery.history.slice(-this.config.maxMetricsHistory);
      }
      
    } catch (error) {
      console.error('❌ Erreur collecte battery metrics:', error);
    }
  }

  /**
   * Estimer le niveau de batterie
   */
  estimateBatteryLevel() {
    // Simulation - valeur aléatoire entre 20-100%
    return Math.floor(Math.random() * 80) + 20;
  }

  /**
   * Estimer l'état de charge
   */
  estimateChargingState() {
    // Simulation - 30% de chance d'être en charge
    return Math.random() < 0.3;
  }

  /**
   * Calculer l'impact batterie de l'app
   */
  calculateBatteryImpact() {
    // Simulation basée sur l'usage
    const sessionDuration = Date.now() - (this.sessionStartTime || Date.now());
    const minutes = sessionDuration / 1000 / 60;
    
    // Estimation : 1% par 30 minutes d'usage
    const impact = Math.round(minutes / 30);
    
    return {
      estimatedDrain: Math.min(impact, 10), // Max 10%
      category: impact < 2 ? 'low' : impact < 5 ? 'medium' : 'high',
      sessionDuration: minutes
    };
  }

  /**
   * Enregistrer un crash
   */
  recordCrash(error, context = {}) {
    try {
      const crashReport = {
        id: `crash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context: {
          screen: context.screen,
          action: context.action,
          userAgent: context.userAgent,
          ...context
        },
        device: this.metrics.device,
        performance: this.metrics.performance.current,
        network: this.metrics.network.current,
        battery: this.metrics.battery.current
      };
      
      this.metrics.crashes.push(crashReport);
      
      // Limiter les rapports de crash
      if (this.metrics.crashes.length > this.config.maxCrashReports) {
        this.metrics.crashes = this.metrics.crashes.slice(-this.config.maxCrashReports);
      }
      
      console.log('💥 Crash recorded:', crashReport.id);
      
      // Sauvegarder immédiatement
      this.saveMetrics();
      
    } catch (saveError) {
      console.error('❌ Erreur enregistrement crash:', saveError);
    }
  }

  /**
   * Démarrer la collecte périodique
   */
  startPeriodicCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }
    
    this.isCollecting = true;
    this.sessionStartTime = Date.now();
    
    this.collectionInterval = setInterval(async () => {
      await this.collectNetworkMetrics();
      this.collectPerformanceMetrics();
      this.collectBatteryMetrics();
      await this.saveMetrics();
    }, this.config.collectionInterval);
    
    console.log('🔄 Collecte périodique démarrée');
  }

  /**
   * Arrêter la collecte périodique
   */
  stopPeriodicCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    
    this.isCollecting = false;
    console.log('⏹️ Collecte périodique arrêtée');
  }

  /**
   * Analyser les métriques
   */
  analyzeMetrics() {
    const analysis = {
      timestamp: Date.now(),
      
      // Analyse performance
      performance: this.analyzePerformance(),
      
      // Analyse réseau
      network: this.analyzeNetwork(),
      
      // Analyse batterie
      battery: this.analyzeBattery(),
      
      // Analyse crashes
      crashes: this.analyzeCrashes(),
      
      // Score global
      overallScore: this.calculateOverallScore()
    };
    
    return analysis;
  }

  /**
   * Analyser les performances
   */
  analyzePerformance() {
    const history = this.metrics.performance.history || [];
    if (history.length === 0) return { status: 'no_data' };
    
    const recent = history.slice(-10); // 10 dernières mesures
    const avgRenderTime = recent.reduce((sum, m) => sum + m.renderTime, 0) / recent.length;
    const avgFPS = recent.reduce((sum, m) => sum + m.estimatedFPS, 0) / recent.length;
    
    return {
      status: avgFPS > 45 ? 'good' : avgFPS > 30 ? 'fair' : 'poor',
      averageRenderTime: Math.round(avgRenderTime),
      averageFPS: Math.round(avgFPS),
      memoryUsage: this.metrics.performance.current?.jsHeapSizeUsed || 0,
      recommendations: this.getPerformanceRecommendations(avgFPS, avgRenderTime)
    };
  }

  /**
   * Analyser le réseau
   */
  analyzeNetwork() {
    const history = this.metrics.network.history || [];
    if (history.length === 0) return { status: 'no_data' };
    
    const recent = history.slice(-10);
    const avgLatency = recent
      .filter(m => m.latency > 0)
      .reduce((sum, m) => sum + m.latency, 0) / recent.length;
    
    const connectionTypes = recent.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      status: avgLatency < 500 ? 'good' : avgLatency < 1000 ? 'fair' : 'poor',
      averageLatency: Math.round(avgLatency),
      connectionTypes,
      currentConnection: this.metrics.network.current?.type || 'unknown',
      isConnected: this.metrics.network.current?.isConnected || false
    };
  }

  /**
   * Analyser la batterie
   */
  analyzeBattery() {
    const current = this.metrics.battery.current;
    if (!current) return { status: 'no_data' };
    
    return {
      status: current.level > 50 ? 'good' : current.level > 20 ? 'fair' : 'poor',
      currentLevel: current.level,
      isCharging: current.isCharging,
      appImpact: current.batteryImpact?.category || 'unknown',
      estimatedDrain: current.batteryImpact?.estimatedDrain || 0
    };
  }

  /**
   * Analyser les crashes
   */
  analyzeCrashes() {
    const crashes = this.metrics.crashes || [];
    const recentCrashes = crashes.filter(c => Date.now() - c.timestamp < 24 * 60 * 60 * 1000);
    
    return {
      totalCrashes: crashes.length,
      recentCrashes: recentCrashes.length,
      status: recentCrashes.length === 0 ? 'stable' : recentCrashes.length < 3 ? 'fair' : 'unstable',
      topErrors: this.getTopErrors(crashes)
    };
  }

  /**
   * Calculer le score global
   */
  calculateOverallScore() {
    const analysis = {
      performance: this.analyzePerformance(),
      network: this.analyzeNetwork(),
      battery: this.analyzeBattery(),
      crashes: this.analyzeCrashes()
    };
    
    const scores = {
      good: 100,
      fair: 70,
      poor: 40,
      stable: 100,
      unstable: 30,
      no_data: 50
    };
    
    const totalScore = Object.values(analysis).reduce((sum, metric) => {
      return sum + (scores[metric.status] || 50);
    }, 0);
    
    const avgScore = totalScore / Object.keys(analysis).length;
    
    return {
      score: Math.round(avgScore),
      grade: avgScore > 80 ? 'A' : avgScore > 60 ? 'B' : avgScore > 40 ? 'C' : 'D',
      recommendations: this.getOverallRecommendations(analysis)
    };
  }

  /**
   * Obtenir les recommandations performance
   */
  getPerformanceRecommendations(fps, renderTime) {
    const recommendations = [];
    
    if (fps < 30) {
      recommendations.push('Optimiser les animations et transitions');
    }
    
    if (renderTime > 100) {
      recommendations.push('Réduire la complexité des composants');
    }
    
    return recommendations;
  }

  /**
   * Obtenir les erreurs les plus fréquentes
   */
  getTopErrors(crashes) {
    const errorCounts = crashes.reduce((acc, crash) => {
      const errorType = crash.error.name || 'Unknown';
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));
  }

  /**
   * Obtenir les recommandations générales
   */
  getOverallRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.performance.status === 'poor') {
      recommendations.push('Optimiser les performances de l\'app');
    }
    
    if (analysis.network.status === 'poor') {
      recommendations.push('Améliorer la gestion réseau');
    }
    
    if (analysis.battery.status === 'poor') {
      recommendations.push('Optimiser la consommation batterie');
    }
    
    if (analysis.crashes.status === 'unstable') {
      recommendations.push('Corriger les bugs critiques');
    }
    
    return recommendations;
  }

  /**
   * Obtenir les données pour synchronisation
   */
  getSyncData() {
    return {
      device: this.metrics.device,
      performance: {
        current: this.metrics.performance.current,
        summary: this.analyzePerformance()
      },
      network: {
        current: this.metrics.network.current,
        summary: this.analyzeNetwork()
      },
      battery: {
        current: this.metrics.battery.current,
        summary: this.analyzeBattery()
      },
      crashes: this.metrics.crashes.slice(-5), // 5 derniers crashes
      analysis: this.analyzeMetrics(),
      collectionInfo: {
        isCollecting: this.isCollecting,
        sessionDuration: Date.now() - (this.sessionStartTime || Date.now()),
        lastCollection: Date.now()
      }
    };
  }

  /**
   * Obtenir les statistiques
   */
  getStats() {
    return {
      device: this.metrics.device?.model || 'Unknown',
      isCollecting: this.isCollecting,
      sessionDuration: Date.now() - (this.sessionStartTime || Date.now()),
      metricsCount: {
        performance: this.metrics.performance.history?.length || 0,
        network: this.metrics.network.history?.length || 0,
        battery: this.metrics.battery.history?.length || 0,
        crashes: this.metrics.crashes.length || 0
      },
      currentStatus: {
        performance: this.analyzePerformance().status,
        network: this.analyzeNetwork().status,
        battery: this.analyzeBattery().status,
        crashes: this.analyzeCrashes().status
      }
    };
  }

  /**
   * Réinitialiser les données
   */
  async resetData() {
    this.metrics = {
      device: {},
      performance: {},
      network: {},
      battery: {},
      crashes: []
    };
    
    await AsyncStorage.removeItem(this.storageKey);
    console.log('🔄 DeviceMetricsService réinitialisé');
  }
}

// Instance singleton
const deviceMetrics = new DeviceMetricsService();

export default deviceMetrics; 