//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useDeviceMetrics.js
// 🧩 Type: Custom Hook
// 📚 Description: Hook pour utiliser DeviceMetricsService
// 🕒 Version: 1.0 - 2025-01-15
// 🧭 Used in: Performance monitoring components
// ─────────────────────────────────────────────────────────
//

import { useEffect, useState, useCallback } from 'react';
import deviceMetrics from '../services/DeviceMetricsService';

/**
 * Hook pour utiliser les métriques device
 */
export function useDeviceMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les métriques
  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = deviceMetrics.getSyncData();
      setMetrics(data);
    } catch (error) {
      console.error('❌ Erreur chargement metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Analyser les métriques
  const analyzeMetrics = useCallback(() => {
    return deviceMetrics.analyzeMetrics();
  }, []);

  // Obtenir les stats
  const getStats = useCallback(() => {
    return deviceMetrics.getStats();
  }, []);

  // Enregistrer un crash
  const recordCrash = useCallback((error, context) => {
    deviceMetrics.recordCrash(error, context);
  }, []);

  // Réinitialiser les données
  const resetData = useCallback(async () => {
    await deviceMetrics.resetData();
    await loadMetrics();
  }, [loadMetrics]);

  // Charger au montage
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    isLoading,
    analyzeMetrics,
    getStats,
    recordCrash,
    resetData,
    reload: loadMetrics
  };
}

/**
 * Hook pour surveiller les performances
 */
export function usePerformanceMonitoring() {
  const [performanceData, setPerformanceData] = useState(null);

  const updatePerformance = useCallback(() => {
    const analysis = deviceMetrics.analyzeMetrics();
    setPerformanceData(analysis.performance);
  }, []);

  // Mettre à jour périodiquement
  useEffect(() => {
    updatePerformance();
    const interval = setInterval(updatePerformance, 30000); // 30 secondes
    return () => clearInterval(interval);
  }, [updatePerformance]);

  return {
    performanceData,
    isGoodPerformance: performanceData?.status === 'good',
    needsOptimization: performanceData?.status === 'poor',
    recommendations: performanceData?.recommendations || []
  };
}

/**
 * Hook pour surveiller le réseau
 */
export function useNetworkMonitoring() {
  const [networkData, setNetworkData] = useState(null);

  const updateNetwork = useCallback(() => {
    const analysis = deviceMetrics.analyzeMetrics();
    setNetworkData(analysis.network);
  }, []);

  // Mettre à jour périodiquement
  useEffect(() => {
    updateNetwork();
    const interval = setInterval(updateNetwork, 10000); // 10 secondes
    return () => clearInterval(interval);
  }, [updateNetwork]);

  return {
    networkData,
    isConnected: networkData?.isConnected,
    connectionType: networkData?.currentConnection,
    isGoodConnection: networkData?.status === 'good',
    averageLatency: networkData?.averageLatency
  };
}

/**
 * Hook pour surveiller la batterie
 */
export function useBatteryMonitoring() {
  const [batteryData, setBatteryData] = useState(null);

  const updateBattery = useCallback(() => {
    const analysis = deviceMetrics.analyzeMetrics();
    setBatteryData(analysis.battery);
  }, []);

  // Mettre à jour périodiquement
  useEffect(() => {
    updateBattery();
    const interval = setInterval(updateBattery, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [updateBattery]);

  return {
    batteryData,
    batteryLevel: batteryData?.currentLevel,
    isCharging: batteryData?.isCharging,
    isLowBattery: batteryData?.status === 'poor',
    appImpact: batteryData?.appImpact
  };
}

/**
 * Hook pour surveiller les crashes
 */
export function useCrashMonitoring() {
  const [crashData, setCrashData] = useState(null);

  const updateCrashes = useCallback(() => {
    const analysis = deviceMetrics.analyzeMetrics();
    setCrashData(analysis.crashes);
  }, []);

  // Enregistrer un crash
  const reportCrash = useCallback((error, context = {}) => {
    deviceMetrics.recordCrash(error, context);
    updateCrashes();
  }, [updateCrashes]);

  // Mettre à jour au montage
  useEffect(() => {
    updateCrashes();
  }, [updateCrashes]);

  return {
    crashData,
    totalCrashes: crashData?.totalCrashes || 0,
    recentCrashes: crashData?.recentCrashes || 0,
    isStable: crashData?.status === 'stable',
    topErrors: crashData?.topErrors || [],
    reportCrash
  };
}

/**
 * Hook pour le score global de santé
 */
export function useDeviceHealthScore() {
  const [healthScore, setHealthScore] = useState(null);

  const updateHealthScore = useCallback(() => {
    const analysis = deviceMetrics.analyzeMetrics();
    setHealthScore(analysis.overallScore);
  }, []);

  // Mettre à jour périodiquement
  useEffect(() => {
    updateHealthScore();
    const interval = setInterval(updateHealthScore, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [updateHealthScore]);

  return {
    healthScore,
    score: healthScore?.score || 0,
    grade: healthScore?.grade || 'N/A',
    recommendations: healthScore?.recommendations || []
  };
}

/**
 * Hook pour les alertes de performance
 */
export function usePerformanceAlerts() {
  const [alerts, setAlerts] = useState([]);

  const checkAlerts = useCallback(() => {
    const analysis = deviceMetrics.analyzeMetrics();
    const newAlerts = [];

    // Alerte performance
    if (analysis.performance.status === 'poor') {
      newAlerts.push({
        type: 'performance',
        level: 'warning',
        message: 'Performance dégradée détectée',
        recommendations: analysis.performance.recommendations
      });
    }

    // Alerte réseau
    if (analysis.network.status === 'poor') {
      newAlerts.push({
        type: 'network',
        level: 'warning',
        message: 'Connexion réseau lente',
        latency: analysis.network.averageLatency
      });
    }

    // Alerte batterie
    if (analysis.battery.status === 'poor') {
      newAlerts.push({
        type: 'battery',
        level: 'critical',
        message: 'Batterie faible',
        level: analysis.battery.currentLevel
      });
    }

    // Alerte crashes
    if (analysis.crashes.status === 'unstable') {
      newAlerts.push({
        type: 'crashes',
        level: 'critical',
        message: 'Crashes fréquents détectés',
        count: analysis.crashes.recentCrashes
      });
    }

    setAlerts(newAlerts);
  }, []);

  // Vérifier les alertes périodiquement
  useEffect(() => {
    checkAlerts();
    const interval = setInterval(checkAlerts, 30000); // 30 secondes
    return () => clearInterval(interval);
  }, [checkAlerts]);

  return {
    alerts,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(a => a.level === 'critical'),
    warningAlerts: alerts.filter(a => a.level === 'warning')
  };
}

export default useDeviceMetrics; 