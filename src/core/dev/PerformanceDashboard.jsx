//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/dev/PerformanceDashboard.jsx
// 🧩 Type: Dev Component
// 📚 Description: Dashboard performance monitoring v2.0 - Toolbox DEV intégré
// 🕒 Version: 2.0 - 2025-06-23
// 🧭 Used in: DevNavigation (mode développement uniquement)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { usePerformanceDashboard, usePerformanceAlerts } from '../../hooks/usePerformanceMonitoring';
import performanceMonitor from '../monitoring/PerformanceMonitor';

export default function PerformanceDashboard() {
  const { metrics, refreshing, refreshMetrics, criticalAlerts, isHealthy } = usePerformanceDashboard();
  const { alerts, alertCount, dismissAlert } = usePerformanceAlerts();

  if (!__DEV__) {
    return null; // Composant visible uniquement en développement
  }

  const handleExportMetrics = () => {
    if (metrics) {
      const exportData = JSON.stringify(metrics, null, 2);
      Alert.alert(
        '📊 Export Métriques',
        `Données copiées dans les logs console`,
        [{ text: 'OK' }]
      );
      console.log('📊 Performance Metrics Export:', exportData);
    }
  };

  const handleToggleVerbose = () => {
    if (performanceMonitor.silentMode) {
      performanceMonitor.enableVerboseMode();
      Alert.alert('🛠️ Mode Verbose', 'Logs détaillés activés');
    } else {
      performanceMonitor.disableVerboseMode();
      Alert.alert('🛠️ Mode Silencieux', 'Logs minimaux activés');
    }
  };

  const handleResetMetrics = () => {
    Alert.alert(
      '🧹 Reset Métriques',
      'Effacer toutes les métriques de performance ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            performanceMonitor.reset();
            refreshMetrics();
            Alert.alert('✅ Reset Complet', 'Métriques effacées');
          }
        }
      ]
    );
  };

  const handleOptimizeStorage = async () => {
    try {
      const optimized = await performanceMonitor.optimizeAsyncStorage();
      if (optimized) {
        Alert.alert('✅ Storage Optimisé', 'AsyncStorage nettoyé avec succès');
        refreshMetrics();
      } else {
        Alert.alert('ℹ️ Storage OK', 'Aucune optimisation nécessaire');
      }
    } catch (error) {
      Alert.alert('❌ Erreur', `Optimisation échouée: ${error.message}`);
    }
  };

  const getStorageHealthStatus = () => {
    if (!metrics?.asyncStorage) return 'unknown';
    
    const avgTimes = Object.values(metrics.asyncStorage).map(data => data.avgReadTime);
    const overallAvg = avgTimes.reduce((sum, time) => sum + time, 0) / avgTimes.length;
    
    if (overallAvg > 250) return 'critical';
    if (overallAvg > 150) return 'warning';
    return 'good';
  };

  const getHealthColor = () => {
    if (criticalAlerts > 5) return '#F44336'; // Rouge
    if (criticalAlerts > 2) return '#FF9800'; // Orange
    return '#4CAF50'; // Vert
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header avec statut global */}
      <View style={[styles.header, { backgroundColor: getHealthColor() }]}>
        <Text style={styles.headerTitle}>📊 Performance Monitor</Text>
        <Text style={styles.headerSubtitle}>
          {isHealthy ? '✅ Système sain' : `⚠️ ${criticalAlerts} alertes critiques`}
        </Text>
      </View>

      {/* Alertes récentes */}
      {alertCount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Alertes Récentes ({alertCount})</Text>
          {alerts.slice(0, 3).map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={styles.alertItem}
              onPress={() => dismissAlert(alert.id)}
            >
              <Text style={styles.alertType}>{alert.type}</Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>
                {new Date(alert.timestamp).toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Métriques principales */}
      {metrics && (
        <>
          {/* Hydratation des stores */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏪 Hydratation Stores</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {metrics.hydration.totalHydrationTime.toFixed(1)}ms
                </Text>
                <Text style={styles.metricLabel}>Temps Total</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {metrics.hydration.averageTime.toFixed(1)}ms
                </Text>
                <Text style={styles.metricLabel}>Temps Moyen</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {metrics.hydration.storeCount}
                </Text>
                <Text style={styles.metricLabel}>Stores</Text>
              </View>
            </View>
            
            {/* Store le plus lent */}
            {metrics.hydration.slowestStore.name && (
              <View style={styles.slowestStore}>
                <Text style={styles.slowestStoreText}>
                  🐌 Plus lent: {metrics.hydration.slowestStore.name} 
                  ({metrics.hydration.slowestStore.duration?.toFixed(1)}ms)
                </Text>
              </View>
            )}
          </View>

          {/* AsyncStorage */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💾 AsyncStorage</Text>
              <Text style={[styles.healthBadge, {
                backgroundColor: getStorageHealthStatus() === 'critical' ? '#F44336' :
                                getStorageHealthStatus() === 'warning' ? '#FF9800' : '#4CAF50'
              }]}>
                {getStorageHealthStatus() === 'critical' ? '🔴 Critique' :
                 getStorageHealthStatus() === 'warning' ? '🟡 Lent' : '🟢 OK'}
              </Text>
            </View>
            {Object.entries(metrics.asyncStorage).map(([key, data]) => (
              <View key={key} style={styles.storageItem}>
                <Text style={styles.storageKey}>{key}</Text>
                <View style={styles.storageMetrics}>
                  <Text style={styles.storageText}>
                    📖 {data.avgReadTime.toFixed(1)}ms
                  </Text>
                  <Text style={styles.storageText}>
                    ✏️ {data.avgWriteTime.toFixed(1)}ms
                  </Text>
                  <Text style={styles.storageText}>
                    📊 {data.totalOperations} ops
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Renders */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔄 Renders</Text>
            {Object.entries(metrics.renders).map(([component, data]) => (
              <View key={component} style={styles.renderItem}>
                <Text style={styles.componentName}>{component}</Text>
                <View style={styles.renderMetrics}>
                  <Text style={styles.renderText}>
                    Total: {data.totalRenders}
                  </Text>
                  <Text style={styles.renderText}>
                    Récents: {data.recentRenders}
                  </Text>
                  <Text style={styles.renderText}>
                    /sec: {data.avgRendersPerSecond.toFixed(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Mémoire */}
          {metrics.memory.usedMB && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧠 Mémoire</Text>
              <View style={styles.memoryBar}>
                <View 
                  style={[
                    styles.memoryUsed, 
                    { 
                      width: `${(metrics.memory.usedMB / metrics.memory.limitMB) * 100}%`,
                      backgroundColor: metrics.memory.usedMB > 50 ? '#F44336' : '#4CAF50'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.memoryText}>
                {metrics.memory.usedMB.toFixed(1)}MB / {metrics.memory.limitMB.toFixed(1)}MB
              </Text>
            </View>
          )}
        </>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, refreshing && styles.buttonDisabled]}
          onPress={refreshMetrics}
          disabled={refreshing}
        >
          <Text style={styles.buttonText}>
            {refreshing ? '🔄 Actualisation...' : '🔄 Actualiser'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: performanceMonitor.silentMode ? '#4CAF50' : '#FF9800' }]}
          onPress={handleToggleVerbose}
        >
          <Text style={styles.buttonText}>
            {performanceMonitor.silentMode ? '🔊 Verbose' : '🔇 Silencieux'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleExportMetrics}
        >
          <Text style={styles.buttonText}>📤 Export</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#FF9500' }]}
          onPress={handleOptimizeStorage}
        >
          <Text style={styles.buttonText}>🧹 Optimiser</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#f44336' }]}
          onPress={handleResetMetrics}
        >
          <Text style={styles.buttonText}>🧹 Reset</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  healthBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  slowestStore: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
  },
  slowestStoreText: {
    fontSize: 12,
    color: '#856404',
  },
  alertItem: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f44336',
  },
  alertType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#c62828',
  },
  alertMessage: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
  alertTime: {
    fontSize: 11,
    color: '#666',
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  storageKey: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  storageMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  storageText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 6,
  },
  renderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  componentName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  renderMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  renderText: {
    fontSize: 9,
    color: '#666',
    marginLeft: 4,
  },
  memoryBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  memoryUsed: {
    height: '100%',
    borderRadius: 10,
  },
  memoryText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 15,
    gap: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 