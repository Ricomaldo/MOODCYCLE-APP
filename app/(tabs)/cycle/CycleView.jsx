//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/cycle/CycleView.jsx - INTÉGRATION VIGNETTES
// 🧩 Type: Écran Principal Cycle
// 📚 Description: Page d'accueil cycle avec vignettes contextuelles
// 🕒 Version: 2.0 - 2025-06-21 - VIGNETTES INTÉGRÉES
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../src/config/theme';
import { Heading, BodyText } from '../../../src/core/ui/Typography';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import CycleWheel from '../../../src/features/cycle/CycleWheel';
import { VignettesContainer } from '../../../src/features/shared/VignetteCard';
import { useCycle } from '../../../src/hooks/useCycle';
import { useVignettes } from '../../../src/hooks/useVignettes';
import { usePersona } from '../../../src/hooks/usePersona';
import { useUserStore } from '../../../src/stores/useUserStore';


export default function CycleView() {
  const insets = useSafeAreaInsets();
  const { currentPhase, currentDay, phaseInfo, hasData } = useCycle();
  const { current: persona } = usePersona();
  const { profile } = useUserStore();
  
  // ✅ HOOK VIGNETTES INTÉGRÉ
  const { 
    vignettes, 
    loading: vignettesLoading, 
    refresh: refreshVignettes,
    trackEngagement 
  } = useVignettes();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshVignettes();
    setRefreshing(false);
  }, [refreshVignettes]);

  // ✅ HANDLER VIGNETTE PRESS
  const handleVignettePress = (vignette) => {
    trackEngagement(vignette);
    // Navigation automatique gérée par VignetteCard
  };

  if (!hasData) {
    return (
      <ScreenContainer style={styles.container} hasTabs={true}>
        <View style={styles.centerContent}>
          <BodyText style={styles.setupText}>
            Configure ton cycle pour commencer ton voyage avec Melune
          </BodyText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Heading style={styles.title}>Mon Cycle</Heading>
          <BodyText style={styles.subtitle}>
            Jour {currentDay} • Phase {phaseInfo.name}
          </BodyText>
        </View>

        {/* Roue du cycle */}
        <View style={styles.wheelContainer}>
          <CycleWheel 
            currentPhase={currentPhase}
            cycleDay={currentDay}
            cycleLength={28}
            userName={profile?.prenom || 'Emma'}
          />
        </View>

        {/* Phase info */}
        <View style={styles.phaseInfoContainer}>
          <BodyText style={styles.phaseTitle}>
            {phaseInfo.emoji} {phaseInfo.name}
          </BodyText>
          <BodyText style={styles.phaseDescription}>
            {phaseInfo.description}
          </BodyText>
        </View>

        {/* ✅ VIGNETTES CONTEXTUELLES */}
        <View style={styles.vignettesSection}>
          <Heading style={styles.sectionTitle}>Pour toi aujourd'hui</Heading>
          
          {vignettesLoading ? (
            <View style={styles.loadingVignettes}>
              <BodyText style={styles.loadingText}>Personnalisation...</BodyText>
            </View>
          ) : (
            <VignettesContainer
              vignettes={vignettes}
              onVignettePress={handleVignettePress}
              maxVisible={3}
              showCategories={false}
            />
          )}
          
          {vignettes.length === 0 && !vignettesLoading && (
            <BodyText style={styles.noVignettesText}>
              Aucune suggestion disponible pour le moment
            </BodyText>
          )}
        </View>

        {/* Espacement bottom pour tab bar */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.l,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  setupText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: 16,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  
  // Roue
  wheelContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  // Phase info
  phaseInfoContainer: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  phaseDescription: {
    fontSize: 15,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // ✅ Section vignettes
  vignettesSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: theme.spacing.l,
    color: theme.colors.text,
  },
  loadingVignettes: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.textLight,
    fontSize: 14,
  },
  noVignettesText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: 14,
    fontStyle: 'italic',
    padding: theme.spacing.l,
  },
});