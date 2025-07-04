//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/dev/PerformanceDashboard.jsx
// 🧩 Type: Dev Component
// 📚 Description: Dashboard performance monitoring pour développement
// 🕒 Version: 2.1 - 2025-06-23
// 🧭 Used in: DevNavigation (mode développement uniquement)
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePerformanceDashboard, usePerformanceAlerts } from '../../hooks/usePerformanceMonitoring';
import performanceMonitor from '../monitoring/PerformanceMonitor';

export default function PerformanceDashboard() {
  const { metrics, refreshing, refreshMetrics, criticalAlerts = 0, isHealthy = true } = usePerformanceDashboard();
  const { alerts = [], alertCount = 0, dismissAlert } = usePerformanceAlerts();

  if (!__DEV__) {
    return null;
  }

  if (!metrics) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des métriques...</Text>
      </View>
    );
  }

  const handleExportMetrics = () => {
    if (metrics) {
      const exportData = JSON.stringify(metrics, null, 2);
      Alert.alert(
        '📊 Export Métriques',
        `Données copiées dans les logs console`,
        [{ text: 'OK' }]
      );
      console.info('📊 Performance Metrics Export:', exportData);
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
    
    const avgTimes = Object.values(metrics.asyncStorage).map(data => data.avgReadTime || 0);
    if (avgTimes.length === 0) return 'unknown';
    
    const overallAvg = avgTimes.reduce((sum, time) => sum + time, 0) / avgTimes.length;
    
    if (overallAvg > 250) return 'critical';
    if (overallAvg > 150) return 'warning';
    return 'good';
  };

  const getHealthColor = () => {
    if (criticalAlerts > 5) return '#F44336';
    if (criticalAlerts > 2) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: getHealthColor() }]}>
        <Text style={styles.headerTitle}>📊 Performance Monitor</Text>
        <Text style={styles.headerSubtitle}>
          {isHealthy ? '✅ Système sain' : `⚠️ ${criticalAlerts} alertes critiques`}
        </Text>
      </View>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏪 Hydratation Stores</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {(metrics.hydration?.totalHydrationTime || 0).toFixed(1)}ms
            </Text>
            <Text style={styles.metricLabel}>Temps Total</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {(metrics.hydration?.averageTime || 0).toFixed(1)}ms
            </Text>
            <Text style={styles.metricLabel}>Temps Moyen</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {metrics.hydration?.storeCount || 0}
            </Text>
            <Text style={styles.metricLabel}>Stores</Text>
          </View>
        </View>
        
        {metrics.hydration?.slowestStore?.name && (
          <View style={styles.slowestStore}>
            <Text style={styles.slowestStoreText}>
              🐌 Plus lent: {metrics.hydration.slowestStore.name} 
              ({(metrics.hydration.slowestStore.duration || 0).toFixed(1)}ms)
            </Text>
          </View>
        )}
      </View>

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
        {Object.entries(metrics.asyncStorage || {}).map(([key, data]) => (
          <View key={key} style={styles.storageItem}>
            <Text style={styles.storageKey}>{key}</Text>
            <View style={styles.storageMetrics}>
              <Text style={styles.storageText}>
                📖 {(data.avgReadTime || 0).toFixed(1)}ms
              </Text>
              <Text style={styles.storageText}>
                ✏️ {(data.avgWriteTime || 0).toFixed(1)}ms
              </Text>
              <Text style={styles.storageText}>
                📊 {data.totalOperations || 0} ops
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Renders</Text>
        {Object.entries(metrics.renders || {}).map(([component, data]) => (
          <View key={component} style={styles.renderItem}>
            <Text style={styles.componentName}>{component}</Text>
            <View style={styles.renderMetrics}>
              <Text style={styles.renderText}>
                {data.totalRenders || 0} renders
              </Text>
              <Text style={styles.renderText}>
                {data.recentRenders || 0} récents
              </Text>
              <Text style={styles.renderText}>
                {(data.avgRendersPerSecond || 0).toFixed(1)}/s
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧠 Mémoire</Text>
        {metrics.memory ? (
          <View style={styles.memoryContainer}>
            <Text style={styles.memoryText}>
              Utilisée: {(metrics.memory.usedMB || 0).toFixed(1)}MB
            </Text>
            <Text style={styles.memoryText}>
              Totale: {(metrics.memory.totalMB || 0).toFixed(1)}MB
            </Text>
            <Text style={styles.memoryText}>
              Limite: {(metrics.memory.limitMB || 0).toFixed(1)}MB
            </Text>
          </View>
        ) : (
          <Text style={styles.noDataText}>Données mémoire non disponibles</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.verboseButton]}
            onPress={handleToggleVerbose}
          >
            <Text style={styles.actionButtonText}>
              {performanceMonitor.silentMode ? '🔊 Mode Verbose' : '🔇 Mode Silencieux'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExportMetrics}
          >
            <Text style={styles.actionButtonText}>📊 Exporter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.optimizeButton]}
            onPress={handleOptimizeStorage}
          >
            <Text style={styles.actionButtonText}>🧹 Optimiser Storage</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={handleResetMetrics}
          >
            <Text style={styles.actionButtonText}>🗑️ Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  alertItem: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  alertType: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  alertMessage: {
    fontSize: 13,
    marginVertical: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  slowestStore: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  slowestStoreText: {
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  storageMetrics: {
    flexDirection: 'row',
  },
  storageText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  renderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  componentName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  renderMetrics: {
    flexDirection: 'row',
  },
  renderText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  memoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memoryText: {
    fontSize: 13,
    color: '#666',
  },
  noDataText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  verboseButton: {
    backgroundColor: '#6c757d',
  },
  exportButton: {
    backgroundColor: '#007bff',
  },
  optimizeButton: {
    backgroundColor: '#28a745',
  },
  resetButton: {
    backgroundColor: '#dc3545',
  },
}); 