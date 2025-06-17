import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { testPersonaMapping } from '../../services/PersonaEngine';
import { getAllPersonas, getPersonaById } from '../../config/personaProfiles';
import { theme } from '../../config/theme';

/**
 * 🧪 INTERFACE DE DEBUG POUR LE SYSTÈME PERSONA
 * Permet de visualiser, tester et valider l'algorithme de mapping
 */
export const PersonaDebug = () => {
  const { 
    persona, 
    calculateAndAssignPersona, 
    autoUpdatePersona,
    userInfo,
    journeyChoice,
    preferences,
    melune 
  } = useOnboardingStore();
  
  const [testResults, setTestResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleRecalculate = () => {
    const result = calculateAndAssignPersona();
    Alert.alert(
      '✨ Persona Recalculé',
      result ? `Assigné: ${result.toUpperCase()}` : 'Aucun persona assigné',
      [{ text: 'OK' }]
    );
  };

  const handleAutoUpdate = () => {
    const result = autoUpdatePersona();
    Alert.alert(
      '🔄 Auto-Update',
      result ? `Persona: ${result.toUpperCase()}` : 'Données insuffisantes',
      [{ text: 'OK' }]
    );
  };

  const handleRunTests = () => {
    const results = testPersonaMapping();
    setTestResults(results);
    
    const passedTests = Object.values(results).filter(r => r.correct).length;
    const totalTests = Object.keys(results).length;
    
    Alert.alert(
      '🧪 Tests Terminés',
      `Réussite: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`,
      [{ text: 'Voir Détails', onPress: () => setShowDetails(true) }]
    );
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return theme.colors.success;
    if (confidence >= 0.6) return theme.colors.warning;
    return theme.colors.error;
  };

  const getPersonaEmoji = (personaName) => {
    const emojis = {
      emma: '🌱',
      laure: '💼', 
      sylvie: '🦋',
      christine: '🌟',
      clara: '⚡'
    };
    return emojis[personaName] || '❓';
  };

  return (
    <ScrollView style={styles.container}>
      {/* 📊 STATUS ACTUEL */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Status Persona Actuel</Text>
        
        <View style={styles.card}>
          <Text style={styles.label}>Persona Assigné:</Text>
          <Text style={[styles.value, { color: persona.assigned ? theme.colors.primary : theme.colors.textSecondary }]}>
            {persona.assigned ? `${getPersonaEmoji(persona.assigned)} ${persona.assigned.toUpperCase()}` : 'Aucun'}
          </Text>
          
          <Text style={styles.label}>Confiance:</Text>
          <Text style={[styles.value, { color: getConfidenceColor(persona.confidence) }]}>
            {(persona.confidence * 100).toFixed(1)}% ({persona.confidenceLevel || 'N/A'})
          </Text>
          
          <Text style={styles.label}>Dernière MAJ:</Text>
          <Text style={styles.value}>
            {persona.lastCalculated 
              ? new Date(persona.lastCalculated).toLocaleString() 
              : 'Jamais calculé'
            }
          </Text>
        </View>
      </View>

      {/* 🎯 SCORES DÉTAILLÉS */}
      {Object.keys(persona.scores || {}).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Scores Détaillés</Text>
          
          {Object.entries(persona.scores).map(([name, score]) => (
            <View key={name} style={styles.scoreRow}>
              <Text style={styles.scorePersona}>
                {getPersonaEmoji(name)} {name.toUpperCase()}
              </Text>
              <View style={styles.scoreBar}>
                <View 
                  style={[styles.scoreProgress, { 
                    width: `${score * 100}%`,
                    backgroundColor: name === persona.assigned ? theme.colors.primary : theme.colors.secondary
                  }]}
                />
              </View>
              <Text style={styles.scoreValue}>{(score * 100).toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* 🔍 DONNÉES D'ENTRÉE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Données d'Entrée</Text>
        
        <View style={styles.dataGrid}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Âge:</Text>
            <Text style={styles.dataValue}>{userInfo?.ageRange || 'Non défini'}</Text>
          </View>
          
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Journey:</Text>
            <Text style={styles.dataValue}>{journeyChoice?.selectedOption || 'Non défini'}</Text>
          </View>
          
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Avatar:</Text>
            <Text style={styles.dataValue}>{melune?.avatarStyle || 'Non défini'}</Text>
          </View>
          
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Ton:</Text>
            <Text style={styles.dataValue}>{melune?.communicationTone || 'Non défini'}</Text>
          </View>
        </View>

        {preferences && (
          <View style={styles.preferences}>
            <Text style={styles.preferencesTitle}>Préférences:</Text>
            {Object.entries(preferences).map(([pref, value]) => (
              <Text key={pref} style={styles.preferenceItem}>
                {pref}: {value}/5
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* 🎮 ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Actions Debug</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleRecalculate}>
          <Text style={styles.buttonText}>🔄 Recalculer Persona</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleAutoUpdate}>
          <Text style={styles.buttonText}>⚡ Auto-Update</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleRunTests}>
          <Text style={styles.buttonText}>🧪 Tests Validation</Text>
        </TouchableOpacity>
      </View>

      {/* 🧪 RÉSULTATS TESTS */}
      {testResults && showDetails && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Résultats Tests</Text>
          
          {Object.entries(testResults).map(([expected, result]) => (
            <View key={expected} style={[styles.testResult, { 
              backgroundColor: result.correct ? '#E8F5E8' : '#FFF2F2' 
            }]}>
              <Text style={styles.testPersona}>
                {getPersonaEmoji(expected)} {expected.toUpperCase()}
              </Text>
              <Text style={styles.testStatus}>
                {result.correct ? '✅' : '❌'} 
                Assigné: {result.assigned?.toUpperCase() || 'AUCUN'}
              </Text>
              <Text style={styles.testConfidence}>
                Confiance: {(result.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowDetails(false)}
          >
            <Text style={styles.closeButtonText}>Fermer Détails</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 📚 PROFILS DE RÉFÉRENCE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Profils de Référence</Text>
        
        {getAllPersonas().map(profile => (
          <View key={profile.id} style={styles.referenceProfile}>
            <Text style={styles.referenceName}>
              {getPersonaEmoji(profile.id)} {profile.name.toUpperCase()}
            </Text>
            <Text style={styles.referenceDescription}>
              {profile.description}
            </Text>
            <Text style={styles.referenceDetails}>
              {profile.ageRange.join(', ')} • {profile.tone}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  value: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  scorePersona: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    width: 80,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 4,
    marginHorizontal: theme.spacing.sm,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dataItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  dataLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  dataValue: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  preferences: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  preferencesTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  preferenceItem: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    textAlign: 'center',
  },
  testResult: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  testPersona: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  testStatus: {
    fontSize: theme.typography.caption.fontSize,
    marginTop: theme.spacing.xs,
  },
  testConfidence: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  closeButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  },
  closeButtonText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  referenceProfile: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  referenceName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  referenceDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  referenceDetails: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
}; 