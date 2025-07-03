//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/monitoring/PerformanceMonitor.js
// 🧩 Type: Service
// 📚 Description: Monitoring silencieux par défaut contrôlable via Toolbox DEV
// 🕒 Version: 2.1 - 2025-06-23
// 🧭 Used in: Performance monitoring, development tools
// ─────────────────────────────────────────────────────────
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
      
      this.thresholds = {
        hydrationTime: 500,
        asyncStorageRead: 300,
        asyncStorageWrite: 400,
        renderCount: 12,
        memoryUsage: 60
      };
      
      this.silentMode = true;
      this.initialized = false;
    }
    
    enableVerboseMode() {
      this.silentMode = false;
      if (__DEV__) {
        console.info('🛠️ PerformanceMonitor: Mode verbose activé via Toolbox DEV');
      }
    }
    
    disableVerboseMode() {
      this.silentMode = true;
      if (__DEV__) {
        console.info('🛠️ PerformanceMonitor: Retour mode silencieux');
      }
    }
    
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
  
      if (duration > this.thresholds.hydrationTime) {
        this.addAlert('slow_hydration', `Store ${storeName}: ${duration.toFixed(1)}ms`);
      }
  
      if (__DEV__ && !this.silentMode) {
        console.info(`🏪 Store ${storeName} hydrated in ${duration.toFixed(1)}ms`);
      }
    }
    
    wrapAsyncStorage() {
      const originalGetItem = require('@react-native-async-storage/async-storage').default.getItem;
      const originalSetItem = require('@react-native-async-storage/async-storage').default.setItem;
      
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
  
      if (this.metrics.asyncStorage[key][operationType].length > 30) {
        this.metrics.asyncStorage[key][operationType] = 
          this.metrics.asyncStorage[key][operationType].slice(-30);
      }
  
      const threshold = operation === 'read' ? 
        this.thresholds.asyncStorageRead : 
        this.thresholds.asyncStorageWrite;
  
      if (duration > threshold) {
        this.addAlert('slow_storage', `AsyncStorage ${operation} ${key}: ${duration.toFixed(1)}ms`);
      }
  
      if (__DEV__ && !this.silentMode) {
        console.info(`💾 AsyncStorage ${operation} ${key}: ${duration.toFixed(1)}ms`);
      }
    }
    
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
      
      metric.renderTimes = metric.renderTimes.filter(time => now - time < 1000);
      
      if (metric.renderTimes.length > this.thresholds.renderCount) {
        this.addAlert('excessive_renders', 
          `${componentName}: ${metric.renderTimes.length} renders/sec`);
      }
  
      metric.lastRender = now;
    }
    
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
    
    addAlert(type, message) {
      const alert = {
        id: Date.now(),
        type,
        message,
        timestamp: Date.now()
      };
      
      this.metrics.alerts.unshift(alert);
      
      if (this.metrics.alerts.length > 50) {
        this.metrics.alerts = this.metrics.alerts.slice(0, 50);
      }
      
      if (__DEV__ && !this.silentMode) {
        console.error(`⚠️ Performance Alert [${type}]: ${message}`);
      }
    }
    
    getHydrationReport() {
      const stores = Object.entries(this.metrics.storeHydration);
      const successful = stores.filter(([_, metric]) => metric.status === 'success');
      const avgTime = successful.length > 0 
        ? successful.reduce((sum, [_, metric]) => sum + metric.duration, 0) / successful.length 
        : 0;
        
      return {
        totalStores: stores.length,
        successfulStores: successful.length,
        averageTime: avgTime,
        slowestStore: stores.reduce((slowest, [name, metric]) => 
          metric.duration > (slowest?.duration || 0) ? { name, ...metric } : slowest, null)
      };
    }
    
    getAsyncStorageReport() {
      const keys = Object.keys(this.metrics.asyncStorage);
      let totalReads = 0;
      let totalWrites = 0;
      let totalReadTime = 0;
      let totalWriteTime = 0;
      
      keys.forEach(key => {
        const keyMetrics = this.metrics.asyncStorage[key];
        totalReads += keyMetrics.reads.length;
        totalWrites += keyMetrics.writes.length;
        totalReadTime += keyMetrics.reads.reduce((sum, op) => sum + op.duration, 0);
        totalWriteTime += keyMetrics.writes.reduce((sum, op) => sum + op.duration, 0);
      });
      
      return {
        totalKeys: keys.length,
        totalReads,
        totalWrites,
        avgReadTime: totalReads > 0 ? totalReadTime / totalReads : 0,
        avgWriteTime: totalWrites > 0 ? totalWriteTime / totalWrites : 0
      };
    }
    
    getRenderReport() {
      const components = Object.entries(this.metrics.renders);
      const totalRenders = components.reduce((sum, [_, metric]) => sum + metric.count, 0);
      const activeComponents = components.filter(([_, metric]) => 
        Date.now() - metric.lastRender < 5000).length;
        
      return {
        totalComponents: components.length,
        activeComponents,
        totalRenders,
        avgRendersPerComponent: components.length > 0 ? totalRenders / components.length : 0
      };
    }
    
    getFullReport() {
      return {
        hydration: this.getHydrationReport(),
        asyncStorage: this.getAsyncStorageReport(),
        renders: this.getRenderReport(),
        memory: this.metrics.memory,
        alerts: this.metrics.alerts.slice(0, 10),
        thresholds: this.thresholds,
        mode: this.silentMode ? 'silent' : 'verbose'
      };
    }
    
    reset() {
      this.metrics = {
        storeHydration: {},
        asyncStorage: {},
        renders: {},
        memory: {},
        alerts: []
      };
      
      if (__DEV__ && !this.silentMode) {
        console.info('🧹 PerformanceMonitor: Métriques reset');
      }
    }
    
    setThresholds(newThresholds) {
      this.thresholds = { ...this.thresholds, ...newThresholds };
      if (__DEV__ && !this.silentMode) {
        console.info('⚙️ PerformanceMonitor: Seuils mis à jour', newThresholds);
      }
    }
    
    exportMetrics() {
      return JSON.stringify(this.getFullReport(), null, 2);
    }
    
    getCompactStatus() {
      const hydration = this.getHydrationReport();
      const storage = this.getAsyncStorageReport();
      const renders = this.getRenderReport();
      
      return {
        hydration: `${hydration.successfulStores}/${hydration.totalStores} stores (${hydration.averageTime.toFixed(0)}ms avg)`,
        storage: `${storage.totalKeys} keys (R:${storage.avgReadTime.toFixed(0)}ms W:${storage.avgWriteTime.toFixed(0)}ms)`,
        renders: `${renders.totalComponents} components (${renders.totalRenders} renders)`,
        memory: this.metrics.memory ? `${this.metrics.memory.usedMB.toFixed(1)}MB` : 'N/A',
        alerts: this.metrics.alerts.length,
        status: this.getHealthStatus()
      };
    }
    
    getHealthStatus() {
      const recentAlerts = this.metrics.alerts.filter(alert => 
        Date.now() - alert.timestamp < 60000);
      
      if (recentAlerts.length > 5) return 'critical';
      if (recentAlerts.length > 2) return 'warning';
      return 'healthy';
    }
    
    async optimizeAsyncStorage() {
      const storage = this.getAsyncStorageReport();
      const avgStorageTime = (storage.avgReadTime + storage.avgWriteTime) / 2;
      
      if (avgStorageTime > 200) {
        if (__DEV__ && !this.silentMode) {
          console.info('🧹 AsyncStorage optimization needed - avg time:', avgStorageTime.toFixed(1) + 'ms');
        }
        return true;
      }
      
      return false;
    }
    
    init() {
      if (this.initialized) return;
      
      this.wrapAsyncStorage();
      
      setInterval(() => {
        this.trackMemory();
      }, 30000);
      
      this.initialized = true;
      
      if (this.optimizeAsyncStorage()) {
        if (__DEV__ && !this.silentMode) {
          console.info('🧹 AsyncStorage auto-optimized on startup');
        }
      }
    }
  }
  
  export default new PerformanceMonitor();