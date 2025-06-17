import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BodyText, Heading3 } from '../Typography';
import { theme } from '../../config/theme';
import { testChatIntegration, runChatIntegrationTests } from '../../scripts/testChatIntegration';

export function ChatDebug() {
  const [testResults, setTestResults] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults('🚀 Lancement des tests...\n');
    
    try {
      // Capture console logs
      const originalLog = console.log;
      let logOutput = '';
      
      console.log = (...args) => {
        logOutput += args.join(' ') + '\n';
        originalLog(...args);
      };
      
      await testChatIntegration();
      
      // Restore console.log
      console.log = originalLog;
      
      setTestResults(logOutput);
    } catch (error) {
      setTestResults(`❌ Erreur: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Heading3>🧪 Debug Chat Integration</Heading3>
        
        <TouchableOpacity 
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={runTests}
          disabled={isRunning}
        >
          <BodyText style={styles.buttonText}>
            {isRunning ? '⏳ Tests en cours...' : '🚀 Lancer les tests'}
          </BodyText>
        </TouchableOpacity>
      </View>

      {testResults ? (
        <View style={styles.resultsContainer}>
          <BodyText style={styles.results}>{testResults}</BodyText>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.m,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContainer: {
    padding: theme.spacing.l,
    backgroundColor: '#000',
    margin: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
  },
  results: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#00ff00',
    lineHeight: 16,
  },
});
