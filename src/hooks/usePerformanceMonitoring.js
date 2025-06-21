//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/usePerformanceMonitoring.js
// 🧩 Type: Performance Hooks
// 📚 Description: Hooks monitoring performance stores Zustand
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import performanceMonitor from '../core/monitoring/PerformanceMonitor';

// ═══════════════════════════════════════════════════════
// 🏪 STORE HYDRATION MONITORING
// ═══════════════════════════════════════════════════════

export function useStoreHydrationMonitoring(storeName) {
  const hydrationStarted = useRef(false);

  useEffect(() => {
    if (!hydrationStarted.current && __DEV__) {
      performanceMonitor.startStoreHydration(storeName);
      hydrationStarted.current = true;

      // Simuler fin hydratation après un délai
      const timer = setTimeout(() => {
        performanceMonitor.endStoreHydration(storeName);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [storeName]);
}

// ═══════════════════════════════════════════════════════
// 🔄 RENDER MONITORING
// ═══════════════════════════════════════════════════════

export function useRenderMonitoring(componentName) {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    if (__DEV__) {
      performanceMonitor.trackRender(componentName);
    }
  });

  return renderCount.current;
}

// ═══════════════════════════════════════════════════════
// 📊 OPTIMIZED HOOKS WITH MONITORING
// ═══════════════════════════════════════════════════════

// Hook useCycle optimisé avec monitoring
export function useOptimizedCycle() {
  const startTime = useRef(performance.now());
  
  // Simuler logique cycle avec monitoring
  const currentPhase = useMemo(() => {
    const computeTime = performance.now() - startTime.current;
    if (__DEV__ && computeTime > 10) {
      performanceMonitor.addAlert('slow_computation', 
        `useCycle computation: ${computeTime.toFixed(1)}ms`);
    }
    return 'follicular'; // Exemple
  }, []);

  const getCurrentDay = useCallback(() => {
    return Math.floor(Math.random() * 28) + 1;
  }, []);

  useRenderMonitoring('useCycle');

  return {
    currentPhase,
    currentDay: getCurrentDay(),
    phaseInfo: { name: 'Phase Folliculaire', emoji: '🌱' }
  };
}

// Hook usePersona optimisé avec monitoring
export function useOptimizedPersona() {
  const calculationTime = useRef(0);
  
  const current = useMemo(() => {
    const start = performance.now();
    
    // Simuler calcul persona
    const result = 'emma';
    
    calculationTime.current = performance.now() - start;
    if (__DEV__ && calculationTime.current > 5) {
      performanceMonitor.addAlert('slow_computation', 
        `usePersona calculation: ${calculationTime.current.toFixed(1)}ms`);
    }
    
    return result;
  }, []);

  useRenderMonitoring('usePersona');

  return {
    current,
    confidence: 0.85,
    calculationTime: calculationTime.current
  };
}

// ═══════════════════════════════════════════════════════
// 📈 PERFORMANCE DASHBOARD HOOK
// ═══════════════════════════════════════════════════════

export function usePerformanceDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const refreshMetrics = useCallback(async () => {
    setRefreshing(true);
    // Simule délai
    await new Promise(resolve => setTimeout(resolve, 500));
    setMetrics(performanceMonitor.getFullReport());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refreshMetrics();
    
    // Refresh auto toutes les 30 secondes
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  const criticalAlerts = useMemo(() => {
    if (!metrics) return 0;
    return metrics.alerts.filter(alert => 
      alert.type === 'slow_hydration' || alert.type === 'high_memory'
    ).length;
  }, [metrics]);

  return {
    metrics,
    refreshing,
    refreshMetrics,
    criticalAlerts,
    isHealthy: criticalAlerts === 0
  };
}

// ═══════════════════════════════════════════════════════
// 🚨 ALERTS HOOK
// ═══════════════════════════════════════════════════════

export function usePerformanceAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const checkAlerts = () => {
      const report = performanceMonitor.getFullReport();
      setAlerts(report.alerts.slice(-10)); // 10 dernières
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  return {
    alerts,
    alertCount: alerts.length,
    dismissAlert
  };
} 