//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/monitoring/PerformanceMonitor.js
// 🧩 Type: Performance Monitoring
// 📚 Description: Monitoring stores Zustand + AsyncStorage performance
// 🕒 Version: 1.0 - 2025-06-21
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
      this.thresholds = {
        hydrationTime: 200, // ms
        asyncStorageRead: 50, // ms
        asyncStorageWrite: 100, // ms
        renderCount: 10, // renders/sec
        memoryUsage: 50 // MB
      };
    }
  
    // ═══════════════════════════════════════════════════════
    // 📊 STORE HYDRATION MONITORING
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
  
      // Alert si trop lent
      if (duration > this.thresholds.hydrationTime) {
        this.addAlert('slow_hydration', `Store ${storeName} hydration: ${duration.toFixed(1)}ms`);
      }
  
      if (__DEV__) {
        console.log(`🏪 Store ${storeName} hydrated in ${duration.toFixed(1)}ms`);
      }
    }
  
    // ═══════════════════════════════════════════════════════
    // 💾 ASYNCSTORAGE MONITORING
    // ═══════════════════════════════════════════════════════
    
    wrapAsyncStorage() {
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
  
      const operationType = operation + 's'; // 'reads' or 'writes'
      this.metrics.asyncStorage[key][operationType].push({
        timestamp: Date.now(),
        duration,
        success
      });
  
      // Garder seulement les 50 dernières opérations
      if (this.metrics.asyncStorage[key][operationType].length > 50) {
        this.metrics.asyncStorage[key][operationType] = 
          this.metrics.asyncStorage[key][operationType].slice(-50);
      }
  
      // Alertes
      const threshold = operation === 'read' ? 
        this.thresholds.asyncStorageRead : 
        this.thresholds.asyncStorageWrite;
  
      if (duration > threshold) {
        this.addAlert('slow_storage', `AsyncStorage ${operation} ${key}: ${duration.toFixed(1)}ms`);
      }
  
      if (__DEV__) {
        console.log(`💾 AsyncStorage ${operation} ${key}: ${duration.toFixed(1)}ms`);
      }
    }
  
    // ═══════════════════════════════════════════════════════
    // 🔄 RENDER MONITORING
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
      
      // Alert si trop de renders
      if (metric.renderTimes.length > this.thresholds.renderCount) {
        this.addAlert('excessive_renders', 
          `${componentName}: ${metric.renderTimes.length} renders/sec`);
      }
  
      metric.lastRender = now;
    }
  
    // ═══════════════════════════════════════════════════════
    // 🧠 MEMORY MONITORING
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
    // 🚨 ALERTS SYSTEM
    // ═══════════════════════════════════════════════════════
    
    addAlert(type, message) {
      const alert = {
        type,
        message,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      };
  
      this.metrics.alerts.push(alert);
      
      // Garder seulement les 100 dernières alertes
      if (this.metrics.alerts.length > 100) {
        this.metrics.alerts = this.metrics.alerts.slice(-100);
      }
  
      if (__DEV__) {
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
        averageTime: totalTime / stores.length,
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
            reads: reads.filter(op => !op.success).length / reads.length,
            writes: writes.filter(op => !op.success).length / writes.length
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
        alerts: this.metrics.alerts.slice(-20), // 20 dernières alertes
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
    }
  
    setThresholds(newThresholds) {
      this.thresholds = { ...this.thresholds, ...newThresholds };
    }
  
    // Export pour debugging
    exportMetrics() {
      return JSON.stringify(this.getFullReport(), null, 2);
    }
  }
  
  // Singleton instance
  const performanceMonitor = new PerformanceMonitor();
  
  // Auto-initialize AsyncStorage wrapping
  if (__DEV__) {
    performanceMonitor.wrapAsyncStorage();
    
    // Memory monitoring interval
    setInterval(() => {
      performanceMonitor.trackMemory();
    }, 10000); // Toutes les 10 secondes

    // Test simple du monitoring
    console.log('🚀 PerformanceMonitor initialized');
    console.log('📊 Testing monitoring...');
    
    // Test hydratation
    performanceMonitor.startStoreHydration('testStore');
    setTimeout(() => {
      performanceMonitor.endStoreHydration('testStore');
      console.log('✅ Store hydration test completed');
    }, 50);
    
    // Test render tracking
    performanceMonitor.trackRender('TestComponent');
    console.log('✅ Render tracking test completed');
    
    // Test alert
    performanceMonitor.addAlert('test_alert', 'Test alert message');
    console.log('✅ Alert system test completed');
    
    // Log rapport initial
    setTimeout(() => {
      const report = performanceMonitor.getFullReport();
      console.log('📊 Initial Performance Report:', JSON.stringify(report, null, 2));
    }, 100);
  }
  
  export default performanceMonitor;