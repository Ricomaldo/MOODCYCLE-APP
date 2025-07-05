//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/settings/tabs/SyncMetricsTab.jsx
// 🧩 Type: Settings Tab Component
// 📚 Description: Onglet métriques synchronisation analytics
// 🕒 Version: 1.0 - 2025-01-15
// 🧭 Used in: ParametresModal
// ─────────────────────────────────────────────────────────
//

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { useStoresSync } from '../../../hooks/useStoresSync';

export default function SyncMetricsTab() {
  const theme = useTheme();
  const { 
    initialized, 
    loading, 
    error, 
    metrics, 
    manualSync, 
    resetSync 
  } = useStoresSync();

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getStatusColor = () => {
    if (error) return theme.colors.error;
    if (loading) return theme.colors.warning;
    if (initialized) return theme.colors.success;
    return theme.colors.text.secondary;
  };

  const getStatusText = () => {
    if (error) return 'Erreur';
    if (loading) return 'Synchronisation...';
    if (initialized) return 'Connecté';
    return 'Initialisation...';
  };

  const handleManualSync = async () => {
    try {
      const result = await manualSync();
      if (result.success) {
        Alert.alert(
          '✅ Synchronisation réussie',
          `Données envoyées vers l'analytics.\n\nTimestamp: ${formatDate(result.timestamp)}`
        );
      } else {
        Alert.alert(
          '❌ Échec synchronisation',
          result.error || 'Erreur inconnue'
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Erreur',
        error.message || 'Erreur lors de la synchronisation'
      );
    }
  };

  const handleResetSync = () => {
    Alert.alert(
      '🔄 Réinitialiser la synchronisation',
      'Cette action va réinitialiser les paramètres de synchronisation. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Réinitialiser', 
          style: 'destructive',
          onPress: () => {
            resetSync();
            Alert.alert('✅ Réinitialisé', 'La synchronisation a été réinitialisée.');
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Status Section */}
      <View style={[styles.section, { borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          📊 État de la Synchronisation
        </Text>
        
        <View style={styles.statusRow}>
          <MaterialCommunityIcons 
            name={error ? "alert-circle" : initialized ? "check-circle" : "clock"}
            size={20} 
            color={getStatusColor()} 
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {error && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
      </View>

      {/* Metrics Section */}
      <View style={[styles.section, { borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          📈 Métriques
        </Text>
        
        <View style={styles.metricRow}>
          <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>
            Dernière synchronisation
          </Text>
          <Text style={[styles.metricValue, { color: theme.colors.text.primary }]}>
            {formatDate(metrics?.lastSync)}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>
            Taille des données
          </Text>
          <Text style={[styles.metricValue, { color: theme.colors.text.primary }]}>
            {formatFileSize(metrics?.dataSize)}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>
            Synchronisations réussies
          </Text>
          <Text style={[styles.metricValue, { color: theme.colors.text.primary }]}>
            {metrics?.successCount || 0}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>
            Dernière erreur
          </Text>
          <Text style={[styles.metricValue, { color: theme.colors.text.primary }]}>
            {formatDate(metrics?.lastError)}
          </Text>
        </View>
      </View>

      {/* Actions Section */}
      <View style={[styles.section, { borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          ⚡ Actions
        </Text>
        
        <TouchableOpacity
          style={[
            styles.actionButton,
            { 
              backgroundColor: loading ? theme.colors.disabled : theme.colors.primary,
              opacity: loading ? 0.6 : 1
            }
          ]}
          onPress={handleManualSync}
          disabled={loading}
        >
          <MaterialCommunityIcons 
            name={loading ? "loading" : "sync"} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.actionButtonText}>
            {loading ? 'Synchronisation...' : 'Synchroniser maintenant'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
          onPress={handleResetSync}
        >
          <MaterialCommunityIcons name="restart" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>
            Réinitialiser la synchronisation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={[styles.section, { borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          ℹ️ À propos
        </Text>
        
        <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
          La synchronisation envoie anonymement les données de vos stores vers notre système d'analytics 
          pour améliorer l'expérience utilisateur. Aucune donnée personnelle identifiable n'est transmise.
        </Text>
        
        <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
          • Synchronisation automatique toutes les 24h{'\n'}
          • Données chiffrées et anonymisées{'\n'}
          • Respect total de votre confidentialité{'\n'}
          • Contribue à l'amélioration de MoodCycle
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metricLabel: {
    fontSize: 14,
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
}); 