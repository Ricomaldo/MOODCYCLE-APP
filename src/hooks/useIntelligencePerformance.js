// src/hooks/useIntelligencePerformance.js
import { useRef, useCallback } from 'react';

export function useIntelligencePerformance() {
    const metricsRef = useRef({
      pipelineExecutions: 0,
      averageTime: 0,
      slowQueries: 0,
      cacheHits: 0,
      cacheMisses: 0
    });
  
    const trackPipelineExecution = useCallback((duration) => {
      const metrics = metricsRef.current;
      metrics.pipelineExecutions++;
      
      // Moyenne mobile exponentielle
      metrics.averageTime = metrics.averageTime * 0.9 + duration * 0.1;
      
      if (duration > 50) {
        metrics.slowQueries++;
        
        if (__DEV__) {
          console.warn(`⚠️ Slow pipeline execution: ${duration}ms`);
        }
      }
    }, []);
  
    const getPerformanceReport = useCallback(() => {
      const metrics = metricsRef.current;
      const cacheRate = metrics.cacheHits / 
        (metrics.cacheHits + metrics.cacheMisses) || 0;
      
      return {
        ...metrics,
        cacheHitRate: (cacheRate * 100).toFixed(1) + '%',
        health: metrics.averageTime < 30 ? 'excellent' : 
                metrics.averageTime < 50 ? 'good' : 'needs-optimization'
      };
    }, []);
  
    return { trackPipelineExecution, getPerformanceReport };
  }