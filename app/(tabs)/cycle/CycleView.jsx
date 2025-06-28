//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/cycle/CycleView.jsx - AVEC CYCLEHEADER
// 🧩 Type: Écran Principal Cycle
// 📚 Description: Cycle avec header spécialisé + modal paramètres
// 🕒 Version: 6.0 - 2025-06-28 - ARCHITECTURE FINALE
// ─────────────────────────────────────────────────────────
//
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../src/hooks/useTheme';
import { BodyText } from '../../../src/core/ui/Typography';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import { CycleHeader } from '../../../src/core/layout/SimpleHeader';
import CycleWheel from '../../../src/features/cycle/CycleWheel';
import { useCycle } from '../../../src/hooks/useCycle';
import { useUserStore } from '../../../src/stores/useUserStore';
import { PhaseIcon } from '../../../src/config/iconConstants';
import QuickTrackingModal from '../../../src/features/notebook/QuickTrackingModal';
import ParametresModal from '../../../src/core/settings/ParametresModal';

export default function CycleView() {
  const cycleData = useCycle() || {};
  const { currentPhase, currentDay, phaseInfo, hasData, cycle, nextPeriodDate, daysUntilNextPeriod } = cycleData;
  const { profile } = useUserStore();
  const { theme } = useTheme();

  const safeProfile = profile || { prenom: null };
  const [showQuickTracking, setShowQuickTracking] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handlePhasePress = React.useCallback((phase) => {
    router.push(`/(tabs)/cycle/phases/${phase}`);
  }, []);

  const handleSymptomTracking = React.useCallback(() => {
    setShowQuickTracking(true);
  }, []);

  const getNextPhase = (currentPhase) => {
    const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
    const currentIndex = phases.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;
    return getPhaseDisplayName(phases[nextIndex]);
  };

  const handlePredictions = React.useCallback(() => {
    if (nextPeriodDate && daysUntilNextPeriod !== null) {
      const nextDate = new Date(nextPeriodDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric', 
        month: 'long'
      });
      
      Alert.alert(
        '🔮 Tes prédictions',
        `📅 Prochaines règles : ${nextDate}\n⏰ Dans ${daysUntilNextPeriod} jours\n\n🌟 Phase suivante : ${getNextPhase(currentPhase)}`,
        [{ text: 'Parfait !', style: 'default' }]
      );
    } else {
      Alert.alert(
        '🔮 Prédictions',
        'Continue à utiliser MoodCycle pour que je puisse te donner des prédictions plus précises ! 💫',
        [{ text: 'Compris !', style: 'default' }]
      );
    }
  }, [nextPeriodDate, daysUntilNextPeriod, currentPhase]);

  const handleHistory = React.useCallback(() => {
    router.push({
      pathname: '/(tabs)/notebook',
      params: {
        filterPhase: currentPhase,
        mode: 'history'
      }
    });
  }, [currentPhase]);

  const handlePhaseNavigation = React.useCallback((phase) => {
    router.push(`/(tabs)/cycle/phases/${phase}`);
  }, []);

  const styles = getStyles(theme);

  if (!cycle) {
    return <ScreenContainer><BodyText>Cycle non initialisé</BodyText></ScreenContainer>;
  }

  if (!hasData) {
    return (
      <ScreenContainer style={styles.container} hasTabs={true}>
        <CycleHeader onSettingsPress={() => setShowParams(true)} />
        <View style={styles.centerContent}>
          <BodyText style={styles.setupText}>
            Configure ton cycle pour commencer ton voyage avec Melune
          </BodyText>
        </View>
        <ParametresModal visible={showParams} onClose={() => setShowParams(false)} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      <CycleHeader onSettingsPress={() => setShowParams(true)} />
      
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
        
        {/* Subtitle avec prédictions */}
        <View style={styles.header}>
          <BodyText style={styles.subtitle}>
            Jour {currentDay} • Phase {phaseInfo.name}
          </BodyText>
          {daysUntilNextPeriod !== null && (
            <BodyText style={styles.prediction}>
              Prochaines règles dans {daysUntilNextPeriod} jours
            </BodyText>
          )}
        </View>

        {/* Roue du cycle */}
        <View style={styles.wheelContainer}>
          <CycleWheel
            currentPhase={currentPhase}
            size={240}
            userName={safeProfile.prenom || 'Emma'}
            cycleDay={currentDay}
            cycleLength={cycle?.length || 28}
            onPhasePress={handlePhasePress}
          />
        </View>

        {/* 🩸 BOUTON RÈGLES - ESSENTIEL */}
        <View style={styles.periodButtonContainer}>
          {currentPhase === 'menstrual' ? (
            <TouchableOpacity 
              style={[styles.periodButton, styles.periodEndButton]}
              onPress={handlePeriodEnd}
            >
              <BodyText style={styles.periodButtonText}>
                Mes règles sont terminées
              </BodyText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.periodButton, styles.periodStartButton]}
              onPress={handlePeriodStart}
            >
              <BodyText style={styles.periodButtonText}>
                Mes règles ont commencé
              </BodyText>
            </TouchableOpacity>
          )}
        </View>

        {/* Phase info */}
        <View style={styles.phaseInfoContainer}>
          <View style={styles.phaseHeader}>
            <PhaseIcon 
              phaseKey={currentPhase}
              size={32}
              color={theme.colors.phases[currentPhase]}
            />
            <View style={styles.phaseHeaderText}>
              <BodyText style={styles.phaseName}>{phaseInfo.name}</BodyText>
              <BodyText style={styles.phaseDay}>Jour {currentDay}</BodyText>
            </View>
          </View>
          
          <BodyText style={styles.phaseDescription}>
            {phaseInfo.description}
          </BodyText>
          
          <View style={styles.phaseDetails}>
            <View style={styles.phaseDetailItem}>
              <BodyText style={styles.phaseDetailLabel}>Énergie</BodyText>
              <BodyText style={styles.phaseDetailValue}>
                {getPhaseEnergyLevel(currentPhase)}
              </BodyText>
            </View>
            
            <View style={styles.phaseDetailItem}>
              <BodyText style={styles.phaseDetailLabel}>Focus</BodyText>
              <BodyText style={styles.phaseDetailValue}>
                {getPhaseFocus(currentPhase)}
              </BodyText>
            </View>
            
            <View style={styles.phaseDetailItem}>
              <BodyText style={styles.phaseDetailLabel}>Durée estimée</BodyText>
              <BodyText style={styles.phaseDetailValue}>
                {getPhaseDuration(currentPhase)} jours
              </BodyText>
            </View>
          </View>
        </View>

        {/* Navigation phases */}
        <View style={styles.phasesNavigation}>
          <BodyText style={styles.sectionTitle}>Explorer les phases</BodyText>
          
          <View style={styles.phasesGrid}>
            {['menstrual', 'follicular', 'ovulatory', 'luteal'].map((phase) => (
              <TouchableOpacity 
                key={phase}
                style={[
                  styles.phaseNavItem,
                  currentPhase === phase && styles.phaseNavItemActive
                ]}
                onPress={() => handlePhaseNavigation(phase)}
              >
                <PhaseIcon 
                  phaseKey={phase}
                  size={24}
                  color={currentPhase === phase ? 'white' : theme.colors.phases[phase]}
                />
                <BodyText style={[
                  styles.phaseNavText,
                  currentPhase === phase && styles.phaseNavTextActive
                ]}>
                  {getPhaseDisplayName(phase)}
                </BodyText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsSection}>
          <BodyText style={styles.sectionTitle}>Actions rapides</BodyText>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={handleSymptomTracking}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Feather name="plus" size={20} color={theme.colors.primary} />
              </View>
              <BodyText style={styles.actionText}>Noter symptômes</BodyText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={handlePredictions}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Feather name="calendar" size={20} color={theme.colors.secondary} />
              </View>
              <BodyText style={styles.actionText}>Prédictions</BodyText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={handleHistory}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.phases[currentPhase] + '20' }]}>
                <Feather name="trending-up" size={20} color={theme.colors.phases[currentPhase]} />
              </View>
              <BodyText style={styles.actionText}>Historique</BodyText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <QuickTrackingModal
        visible={showQuickTracking}
        onClose={() => setShowQuickTracking(false)}
        defaultTags={[`#${currentPhase}`]}
      />

      <ParametresModal
        visible={showParams}
        onClose={() => setShowParams(false)}
      />
    </ScreenContainer>
  );
}

// Fonctions utilitaires
const getPhaseEnergyLevel = (phase) => {
  const energyLevels = {
    menstrual: 'Basse',
    follicular: 'Montante',
    ovulatory: 'Haute',
    luteal: 'Descendante'
  };
  return energyLevels[phase] || 'Variable';
};

const getPhaseFocus = (phase) => {
  const phaseFocus = {
    menstrual: 'Repos & introspection',
    follicular: 'Nouveaux projets',
    ovulatory: 'Communication',
    luteal: 'Finalisation'
  };
  return phaseFocus[phase] || 'Équilibre';
};

const getPhaseDuration = (phase) => {
  const durations = {
    menstrual: '3-7',
    follicular: '7-10',
    ovulatory: '3-5',
    luteal: '10-14'
  };
  return durations[phase] || '5-7';
};

const getPhaseDisplayName = (phase) => {
  const names = {
    menstrual: 'Règles',
    follicular: 'Folliculaire',
    ovulatory: 'Ovulation',
    luteal: 'Lutéale'
  };
  return names[phase] || phase;
};

const getStyles = (theme) => StyleSheet.create({
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
  
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  prediction: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 320,
    marginBottom: theme.spacing.xl,
  },
  
  phaseInfoContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  phaseHeaderText: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '600',
  },
  phaseDay: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  phaseDescription: {
    fontSize: 15,
    color: theme.colors.textLight,
    lineHeight: 22,
    marginBottom: theme.spacing.l,
  },
  phaseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phaseDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  phaseDetailLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  phaseDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  phasesNavigation: {
    marginBottom: theme.spacing.xl,
  },
  actionsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: theme.spacing.l,
    color: theme.colors.text,
  },
  
  phasesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.s,
  },
  phaseNavItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  phaseNavItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  phaseNavText: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  phaseNavTextActive: {
    color: 'white',
  },
  
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  periodButtonContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  periodStartButton: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
  },
  periodEndButton: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
  },
  periodButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: theme.spacing.s,
  },
});

// 🩸 Handlers pour le bouton règles
const handlePeriodStart = () => {
  // TODO: Logique pour marquer le début des règles
  console.log('Début des règles marqué');
  // Mettre à jour le cycle, recalculer les phases
};

const handlePeriodEnd = () => {
  // TODO: Logique pour marquer la fin des règles  
  console.log('Fin des règles marquée');
  // Transition vers phase folliculaire
};