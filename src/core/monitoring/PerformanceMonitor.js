//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/monitoring/PerformanceMonitor.js
// 🧩 Type: Performance Monitoring v2.1 - iOS Optimized
// 📚 Description: Monitoring silencieux par défaut - Toolbox DEV controllable
// 🕒 Version: 2.1 - 2025-06-23 - Démarrage cristallin iOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

class PerformanceMonitor {
    constructor() {
      this.metrics = {
        storeHydration: {},
        asyncStorage: {},
        renders: {},
        memory: {},
        alerts: []
      };
      
      // Seuils adaptés iOS + Intelligence Stack (mode développement plus tolérant)
      this.thresholds = {
        hydrationTime: 500, // ms - Stores complexes OK
        asyncStorageRead: 300, // ms - Plus tolérant pour développement
        asyncStorageWrite: 400, // ms - Plus tolérant pour développement  
        renderCount: 12, // renders/sec - iOS 60fps natif
        memoryUsage: 60 // MB - iOS mieux optimisé mémoire
      };
      
      // Mode silencieux STRICT - zéro logs au démarrage
      this.silentMode = true;
      this.initialized = false;
    }
  
    // ═══════════════════════════════════════════════════════
    // 🛠️ TOOLBOX DEV INTEGRATION
    // ═══════════════════════════════════════════════════════
    
    enableVerboseMode() {
      this.silentMode = false;
      if (__DEV__) {
        console.log('🛠️ PerformanceMonitor: Mode verbose activé via Toolbox DEV');
      }
    }
    
    disableVerboseMode() {
      this.silentMode = true;
      if (__DEV__) {
        console.log('🛠️ PerformanceMonitor: Retour mode silencieux');
      }
    }
    
    // ═══════════════════════════════════════════════════════
    // 📊 STORE HYDRATION MONITORING (iOS Optimized)
    // ═══════════════════════════════════════════════════════
    
    startStoreHydration(storeName) {
      this.metrics.storeHydration[storeName] = {
        startTime: performance.now(),
        status: 'loading'
      };
    }
  
    endStoreHydration(storeName, success = true) {
      const metric = this.metrics.storeHydration[storeName];
      if (!metric) return;
  
      const duration = performance.now() - metric.startTime;
      metric.endTime = performance.now();
      metric.duration = duration;
      metric.status = success ? 'success' : 'error';
  
      // Alert seulement si vraiment problématique (iOS seuils)
      if (duration > this.thresholds.hydrationTime) {
        this.addAlert('slow_hydration', `Store ${storeName}: ${duration.toFixed(1)}ms`);
      }
  
      // ZÉRO logs en mode silencieux (démarrage propre)
      if (__DEV__ && !this.silentMode) {
        console.log(`🏪 Store ${storeName} hydrated in ${duration.toFixed(1)}ms`);
      }
    }
  
    // ═══════════════════════════════════════════════════════
    // 💾 ASYNCSTORAGE MONITORING (iOS Optimized)
    // ═══════════════════════════════════════════════════════
    
    wrapAsyncStorage() {
      // Wrap silencieux - AUCUN log automatique
      const originalGetItem = require('@react-native-async-storage/async-storage').default.getItem;
      const originalSetItem = require('@react-native-async-storage/async-storage').default.setItem;
      
      // Wrap getItem
      require('@react-native-async-storage/async-storage').default.getItem = async (key) => {
        const startTime = performance.now();
        try {
          const result = await originalGetItem(key);
          const duration = performance.now() - startTime;
          this.logAsyncStorageOperation('read', key, duration, true);
          return result;
        } catch (error) {
          const duration = performance.now() - startTime;
          this.logAsyncStorageOperation('read', key, duration, false);
          throw error;
        }
      };
  
      // Wrap setItem
      require('@react-native-async-storage/async-storage').default.setItem = async (key, value) => {
        const startTime = performance.now();
        try {
          const result = await originalSetItem(key, value);
          const duration = performance.now() - startTime;
          this.logAsyncStorageOperation('write', key, duration, true);
          return result;
        } catch (error) {
          const duration = performance.now() - startTime;
          this.logAsyncStorageOperation('write', key, duration, false);
          throw error;
        }
      };
    }
  
    logAsyncStorageOperation(operation, key, duration, success) {
      if (!this.metrics.asyncStorage[key]) {
        this.metrics.asyncStorage[key] = { reads: [], writes: [] };
      }
  
      const operationType = operation + 's';
      this.metrics.asyncStorage[key][operationType].push({
        timestamp: Date.now(),
        duration,
        success
      });
  
      // Garder seulement les 30 dernières opérations (iOS optimisé)
      if (this.metrics.asyncStorage[key][operationType].length > 30) {
        this.metrics.asyncStorage[key][operationType] = 
          this.metrics.asyncStorage[key][operationType].slice(-30);
      }
  
      // Alertes seulement pour les cas iOS problématiques
      const threshold = operation === 'read' ? 
        this.thresholds.asyncStorageRead : 
        this.thresholds.asyncStorageWrite;
  
      if (duration > threshold) {
        this.addAlert('slow_storage', `AsyncStorage ${operation} ${key}: ${duration.toFixed(1)}ms`);
      }
  
      // ZÉRO logs automatiques - contrôle via Toolbox uniquement
      if (__DEV__ && !this.silentMode) {
        console.log(`💾 AsyncStorage ${operation} ${key}: ${duration.toFixed(1)}ms`);
      }
    }
  
    // ═══════════════════════════════════════════════════════
    // 🔄 RENDER MONITORING (iOS 60fps Optimized)
    // ═══════════════════════════════════════════════════════
    
    trackRender(componentName) {
      const now = performance.now();
      
      if (!this.metrics.renders[componentName]) {
        this.metrics.renders[componentName] = {
          count: 0,
          lastRender: now,
          renderTimes: []
        };
      }
  
      const metric = this.metrics.renders[componentName];
      metric.count++;
      metric.renderTimes.push(now);
      
      // Garder seulement la dernière seconde
      metric.renderTimes = metric.renderTimes.filter(time => now - time < 1000);
      
      // Alert seulement si problématique pour iOS 60fps
      if (metric.renderTimes.length > this.thresholds.renderCount) {
        this.addAlert('excessive_renders', 
          `${componentName}: ${metric.renderTimes.length} renders/sec`);
      }
  
      metric.lastRender = now;
    }
  
    // ═══════════════════════════════════════════════════════
    // 🧠 MEMORY MONITORING (iOS Optimized)
    // ═══════════════════════════════════════════════════════
    
    trackMemory() {
      if (typeof performance.memory !== 'undefined') {
        const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
        
        this.metrics.memory = {
          timestamp: Date.now(),
          usedMB: memoryMB,
          totalMB: performance.memory.totalJSHeapSize / (1024 * 1024),
          limitMB: performance.memory.jsHeapSizeLimit / (1024 * 1024)
        };
  
        if (memoryMB > this.thresholds.memoryUsage) {
          this.addAlert('high_memory', `Memory usage: ${memoryMB.toFixed(1)}MB`);
        }
      }
    }
  
    // ═══════════════════════════════════════════════════════
    // 🚨 ALERTS SYSTEM (Silent by Default)
    // ═══════════════════════════════════════════════════════
    
    addAlert(type, message) {
      const alert = {
        type,
        message,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      };
  
      this.metrics.alerts.push(alert);
      
      // Garder seulement les 50 dernières alertes (iOS optimisé)
      if (this.metrics.alerts.length > 50) {
        this.metrics.alerts = this.metrics.alerts.slice(-50);
      }
  
      // SILENCE TOTAL en mode silencieux - contrôle via Toolbox
      if (__DEV__ && !this.silentMode) {
        console.warn(`🚨 Performance Alert [${type}]: ${message}`);
      }
    }
  
    // ═══════════════════════════════════════════════════════
    // 📈 ANALYTICS & REPORTS
    // ═══════════════════════════════════════════════════════
    
    getHydrationReport() {
      const stores = Object.entries(this.metrics.storeHydration);
      const totalTime = stores.reduce((sum, [, data]) => sum + (data.duration || 0), 0);
      
      return {
        totalHydrationTime: totalTime,
        storeCount: stores.length,
        averageTime: stores.length > 0 ? totalTime / stores.length : 0,
        slowestStore: stores.reduce((slowest, [name, data]) => 
          (data.duration || 0) > (slowest.duration || 0) ? { name, ...data } : slowest, {}),
        details: this.metrics.storeHydration
      };
    }
  
    getAsyncStorageReport() {
      const report = {};
      
      Object.entries(this.metrics.asyncStorage).forEach(([key, data]) => {
        const reads = data.reads || [];
        const writes = data.writes || [];
        
        report[key] = {
          totalOperations: reads.length + writes.length,
          avgReadTime: reads.length > 0 ? 
            reads.reduce((sum, op) => sum + op.duration, 0) / reads.length : 0,
          avgWriteTime: writes.length > 0 ? 
            writes.reduce((sum, op) => sum + op.duration, 0) / writes.length : 0,
          errorRate: {
            reads: reads.length > 0 ? reads.filter(op => !op.success).length / reads.length : 0,
            writes: writes.length > 0 ? writes.filter(op => !op.success).length / writes.length : 0
          }
        };
      });
  
      return report;
    }
  
    getRenderReport() {
      const report = {};
      
      Object.entries(this.metrics.renders).forEach(([component, data]) => {
        const recentRenders = data.renderTimes.filter(
          time => performance.now() - time < 5000 // 5 dernières secondes
        );
        
        report[component] = {
          totalRenders: data.count,
          recentRenders: recentRenders.length,
          avgRendersPerSecond: recentRenders.length / 5,
          lastRender: new Date(data.lastRender).toLocaleTimeString()
        };
      });
  
      return report;
    }
  
    getFullReport() {
      return {
        timestamp: new Date().toISOString(),
        hydration: this.getHydrationReport(),
        asyncStorage: this.getAsyncStorageReport(),
        renders: this.getRenderReport(),
        memory: this.metrics.memory,
        alerts: this.metrics.alerts.slice(-20),
        summary: {
          totalAlerts: this.metrics.alerts.length,
          criticalAlerts: this.metrics.alerts.filter(a => 
            a.type === 'slow_hydration' || a.type === 'high_memory'
          ).length
        }
      };
    }
  
    // ═══════════════════════════════════════════════════════
    // 🛠️ UTILITIES
    // ═══════════════════════════════════════════════════════
    
    reset() {
      this.metrics = {
        storeHydration: {},
        asyncStorage: {},
        renders: {},
        memory: {},
        alerts: []
      };
      
      if (__DEV__ && !this.silentMode) {
        console.log('🧹 PerformanceMonitor: Métriques reset');
      }
    }
  
    setThresholds(newThresholds) {
      this.thresholds = { ...this.thresholds, ...newThresholds };
      
      if (__DEV__ && !this.silentMode) {
        console.log('⚙️ PerformanceMonitor: Seuils mis à jour', newThresholds);
      }
    }
  
    exportMetrics() {
      return JSON.stringify(this.getFullReport(), null, 2);
    }
  
    getCompactStatus() {
      const hydration = this.getHydrationReport();
      const alerts = this.metrics.alerts.length;
      const critical = this.metrics.alerts.filter(a => 
        a.type === 'slow_hydration' || a.type === 'high_memory'
      ).length;
      
      return {
        stores: hydration.storeCount,
        avgHydration: hydration.averageTime.toFixed(0),
        alerts,
        critical,
        healthy: critical === 0
      };
    }

    // ═══════════════════════════════════════════════════════
    // 🧹 ASYNCSTORAGE OPTIMIZATION
    // ═══════════════════════════════════════════════════════
    
    async optimizeAsyncStorage() {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        
        // Nettoyer les vieilles entrées si performance dégradée
        const avgStorageTime = Object.values(this.metrics.asyncStorage)
          .reduce((acc, data) => {
            const reads = data.reads || [];
            const avgRead = reads.length > 0 ? 
              reads.reduce((sum, op) => sum + op.duration, 0) / reads.length : 0;
            return acc + avgRead;
          }, 0) / Object.keys(this.metrics.asyncStorage).length;

        if (avgStorageTime > 200) {
          console.log('🧹 AsyncStorage optimization needed - avg time:', avgStorageTime.toFixed(1) + 'ms');
          
          // Nettoyer les anciens stores de dev si existants
          const devKeys = ['dev-storage', 'temp-storage', 'test-storage'];
          for (const key of devKeys) {
            try {
              await AsyncStorage.removeItem(key);
            } catch (e) {
              // Ignore si n'existe pas
            }
          }
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('❌ Erreur optimisation AsyncStorage:', error);
        return false;
      }
    }
  }
  
  // Singleton instance
  const performanceMonitor = new PerformanceMonitor();
  
  // Initialisation SILENCIEUSE pour démarrage cristallin iOS
  if (__DEV__) {
    // AsyncStorage wrapping automatique mais silencieux
    performanceMonitor.wrapAsyncStorage();
    
    // Memory monitoring très espacé pour iOS (moins gourmand)
    setInterval(() => {
      performanceMonitor.trackMemory();
    }, 60000); // Toutes les minutes - ultra-discret
    
    // Optimisation AsyncStorage automatique si nécessaire (1x par session)
    setTimeout(async () => {
      try {
        const optimized = await performanceMonitor.optimizeAsyncStorage();
        if (optimized && !performanceMonitor.silentMode) {
          console.log('🧹 AsyncStorage auto-optimized on startup');
        }
      } catch (error) {
        // Ignore les erreurs d'auto-optimisation
      }
    }, 10000); // Après 10 secondes de démarrage
    
    // AUCUN log automatique - Démarrage 100% propre
    // Le seul log viendra du DevNavigation lors de la première ouverture
  }
  
  export default performanceMonitor;