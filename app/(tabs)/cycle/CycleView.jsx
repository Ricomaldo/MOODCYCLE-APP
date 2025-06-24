//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/cycle/CycleView.jsx - TOGGLE VUE CYCLE/CALENDRIER
// 🧩 Type: Écran Principal Cycle
// 📚 Description: Page d'accueil cycle avec toggle vue roue/calendrier
// 🕒 Version: 3.0 - 2025-06-23 - TOGGLE VUE RESTAURÉ
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../../src/config/theme';
import { Heading, BodyText } from '../../../src/core/ui/Typography';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import CycleWheel from '../../../src/features/cycle/CycleWheel';
import CalendarView from '../../../src/features/cycle/CalendarView';
import { VignettesContainer } from '../../../src/features/shared/VignetteCard';
import { useCycle } from '../../../src/hooks/useCycle';
import { useVignettes } from '../../../src/hooks/useVignettes';
import { usePersona } from '../../../src/hooks/usePersona';
import { useUserStore } from '../../../src/stores/useUserStore';

export default function CycleView() {
  const insets = useSafeAreaInsets();
  const { currentPhase, currentDay, phaseInfo, hasData, lastPeriodDate, cycleLength } = useCycle();
  const { current: persona } = usePersona();
  const { profile } = useUserStore();
  
  // ✅ STATE POUR TOGGLE VUE
  const [viewMode, setViewMode] = React.useState('wheel'); // 'wheel' ou 'calendar'
  
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

  // ✅ HANDLERS POUR LE CALENDRIER
  const handlePhasePress = React.useCallback((phase) => {
    console.log('Phase pressed:', phase);
  }, []);
  
  const handleDatePress = React.useCallback((dateString, entries) => {
    console.log('Date pressed:', dateString, entries);
  }, []);

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
        {/* Header avec toggle */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Heading style={styles.title}>Mon Cycle</Heading>
            
            {/* ✅ TOGGLE BUTTON */}
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={() => setViewMode(viewMode === 'wheel' ? 'calendar' : 'wheel')}
            >
              <Feather 
                name={viewMode === 'wheel' ? 'calendar' : 'target'} 
                size={20} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
          
          <BodyText style={styles.subtitle}>
            Jour {currentDay} • Phase {phaseInfo.name}
          </BodyText>
        </View>

        {/* ✅ VUE CONDITIONNELLE AVEC HAUTEUR FIXE */}
        <View style={styles.viewContainer}>
          {viewMode === 'wheel' ? (
            /* Roue du cycle */
            <View style={styles.wheelContainer}>
              <CycleWheel 
                currentPhase={currentPhase}
                cycleDay={currentDay}
                cycleLength={cycleLength || 28}
                userName={profile?.prenom || 'Emma'}
              />
            </View>
          ) : (
            /* Vue calendaire */
            <View style={styles.calendarContainer}>
              <CalendarView
                currentPhase={currentPhase}
                cycleDay={currentDay}
                cycleLength={cycleLength || 28}
                lastPeriodDate={lastPeriodDate}
                onPhasePress={handlePhasePress}
                onDatePress={handleDatePress}
              />
            </View>
          )}
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
  
  // Header avec toggle
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  toggleButton: {
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  
  // Conteneur fixe pour éviter les sauts
  viewContainer: {
    height: 320, // ✅ Hauteur fixe pour éviter les sauts
    marginBottom: theme.spacing.xl,
    justifyContent: 'center',
  },
  
  // Conteneurs de vue
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  calendarContainer: {
    height: '100%',
    justifyContent: 'center',
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