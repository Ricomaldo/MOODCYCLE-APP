import React from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../config/theme';
import { BodyText } from '../../components/Typography';
import InsightsV2Debug from '../../components/DevNavigation/InsightsV2Debug';

export default function InsightsDebugPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <BodyText style={styles.backButtonText}>← Retour</BodyText>
        </TouchableOpacity>
        <BodyText style={styles.title}>💡 Debug Insights</BodyText>
      </View>
      
      <InsightsV2Debug />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: theme.spacing.s,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 