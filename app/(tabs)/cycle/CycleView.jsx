//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/cycle/CycleView.jsx
// 🧩 Type: Écran Principal
// 📚 Description: Cycle avec observations Miranda Gray
// 🕒 Version: 7.2 - 2025-06-29
// 🧭 Used in: Navigation principale, vue cycle
// ─────────────────────────────────────────────────────────
//
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../src/hooks/useTheme';
import { BodyText, Caption } from '../../../src/core/ui/typography';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import { CycleHeader } from '../../../src/core/layout/SimpleHeader';
import CycleWheel from '../../../src/features/cycle/CycleWheel';
import { useCycleStore } from '../../../src/stores/useCycleStore';
import { getCurrentCycleDay, getCurrentPhase, getCurrentPhaseInfo, getNextPeriodDate, getDaysUntilNextPeriod } from '../../../src/utils/cycleCalculations';
import { useUserStore } from '../../../src/stores/useUserStore';
import { PhaseIcon } from '../../../src/config/iconConstants';
import QuickTrackingModal from '../../../src/features/notebook/QuickTrackingModal';
import ParametresModal from '../../../src/core/settings/ParametresModal';
import { useTerminology } from '../../../src/hooks/useTerminology';
import { useAdaptiveInterface } from '../../../src/hooks/useAdaptiveInterface';
import { useUserIntelligence } from '../../../src/stores/useUserIntelligence';
import { useEngagementStore } from '../../../src/stores/useEngagementStore';
import { getCurrentPhaseAdaptive } from '../../../src/utils/cycleCalculations';

export default function CycleView() {
  const cycleData = useCycleStore((state) => state);
  const startNewCycle = useCycleStore((state) => state.startNewCycle);
  const endPeriod = useCycleStore((state) => state.endPeriod);
  const observations = useCycleStore((state) => state.observations || []);
  
  // AJOUT : Intelligence stores
  const intelligence = useUserIntelligence();
  const engagement = useEngagementStore();
  
  // MODIFICATION : Phase adaptive
  const currentPhase = getCurrentPhaseAdaptive(
    cycleData.lastPeriodDate,
    cycleData.length,
    cycleData.periodDuration,
    {
      mode: 'auto',
      userIntelligence: intelligence,
      engagementLevel: engagement?.maturity?.current
    }
  );
  
  const currentDay = getCurrentCycleDay(cycleData.lastPeriodDate, cycleData.length);
  const phaseInfo = getCurrentPhaseInfo(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const nextPeriodDate = getNextPeriodDate(cycleData.lastPeriodDate, cycleData.length);
  const daysUntilNextPeriod = getDaysUntilNextPeriod(cycleData.lastPeriodDate, cycleData.length);
  const hasData = !!(cycleData.lastPeriodDate && cycleData.length);

  const { profile } = useUserStore();
  const { theme } = useTheme();
  const { getPhaseLabel, getArchetypeLabel } = useTerminology('spiritual');
  
  // AJOUT : Adaptive interface
  const { 
    layout,
    features,
    maturityLevel,
    config
  } = useAdaptiveInterface();

  const safeProfile = profile || { prenom: null };
  const [showQuickTracking, setShowQuickTracking] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLastObservation, setShowLastObservation] = useState(false);

  const lastObservation = observations[observations.length - 1];

  const getObservationInsights = () => {
    if (observations.length < 3) return null;
    
    const phaseObservations = observations.reduce((acc, obs) => {
      if (!acc[obs.phase]) acc[obs.phase] = [];
      acc[obs.phase].push(obs);
      return acc;
    }, {});
    
    const insights = [];
    Object.entries(phaseObservations).forEach(([phase, phaseObs]) => {
      if (phaseObs.length >= 2) {
        const avgEnergy = phaseObs.reduce((sum, obs) => sum + obs.energy, 0) / phaseObs.length;
        const energyTrend = avgEnergy > 3.5 ? 'haute' : avgEnergy < 2.5 ? 'douce' : 'modérée';
        
        const symptoms = phaseObs
          .map(obs => obs.notes)
          .filter(note => note && note.includes('Symptômes:'))
          .join(' ');
        
        insights.push({
          phase,
          energy: energyTrend,
          count: phaseObs.length,
          symptoms
        });
      }
    });
    
    return insights.length > 0 ? insights : null;
  };

  const observationInsights = getObservationInsights();

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
    return getArchetypeLabel(phases[nextIndex]);
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

  const handlePeriodStart = React.useCallback(() => {
    console.info('🩸 Démarrage nouveau cycle');
    startNewCycle();
  }, [startNewCycle]);

  const handlePeriodEnd = React.useCallback(() => {
    console.info('✅ Fin des règles');
    endPeriod();
  }, [endPeriod]);

  const handleBadgeTap = React.useCallback(() => {
    if (lastObservation) {
      setShowLastObservation(!showLastObservation);
    }
  }, [lastObservation, showLastObservation]);

  const formatLastObservation = () => {
    if (!lastObservation) return '';
    
    const date = new Date(lastObservation.timestamp);
    const timeAgo = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
    const timeText = timeAgo === 0 ? "aujourd'hui" : 
                     timeAgo === 1 ? "hier" : 
                     `il y a ${timeAgo} jours`;
    
    const energyText = lastObservation.energy === 5 ? "pleine d'énergie" :
                       lastObservation.energy === 4 ? "énergique" :
                       lastObservation.energy === 3 ? "équilibrée" :
                       lastObservation.energy === 2 ? "calme" : "douce";
    
    return `Tu te sentais ${energyText} ${timeText}`;
  };

  const styles = getStyles(theme, currentPhase);

  if (!cycleData) {
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
        <View style={styles.cycleContainer}>
          <CycleWheel 
            onPhasePress={handlePhasePress}
            phase={currentPhase}
            cycleDay={currentDay}
            cycleLength={cycleData.length}
            periodDuration={cycleData.periodDuration}
            nextPeriodDate={nextPeriodDate}
            interactive={true}
          />
          
          <View style={styles.phaseInfoContainer}>
            <View style={styles.phaseHeader}>
              <PhaseIcon 
                phaseKey={currentPhase}
                size={20}
                color={theme.colors.phases[currentPhase]}
              />
              <BodyText style={styles.phaseTitle}>
                {getPhaseLabel(currentPhase)}
              </BodyText>
            </View>
            
            <Caption style={styles.dayCounter}>
              Jour {currentDay} de {cycleData.length}
            </Caption>
            
            {phaseInfo && phaseInfo.description && (
              <BodyText style={styles.phaseDescription}>
                {phaseInfo.description}
              </BodyText>
            )}
          </View>
        </View>

        {/* 🌙 Rituel du jour */}
        {phaseInfo.rituals && phaseInfo.rituals.length > 0 && (
          <View style={styles.ritualContainer}>
            <View style={styles.ritualHeader}>
              <Feather name="sun" size={20} color={theme.colors.phases[currentPhase]} />
              <BodyText style={styles.ritualTitle}>Rituel du jour</BodyText>
            </View>
            <BodyText style={styles.ritualText}>
              {phaseInfo.rituals[0]}
            </BodyText>
          </View>
        )}

        <View style={styles.obsSection}>
          <View style={styles.obsHeader}>
            <BodyText style={styles.obsTitle}>Mes observations</BodyText>
            <TouchableOpacity 
              style={[styles.obsBadge, lastObservation && styles.obsBadgeActive]}
              onPress={handleBadgeTap}
            >
              <Caption style={[styles.obsBadgeText, lastObservation && styles.obsBadgeTextActive]}>
                {observations.length} {observations.length === 1 ? 'observation' : 'observations'}
              </Caption>
            </TouchableOpacity>
          </View>

          {showLastObservation && lastObservation && (
            <View style={styles.lastObsCard}>
              <Caption style={styles.lastObsText}>
                {formatLastObservation()}
              </Caption>
            </View>
          )}

          {observationInsights && (
            <View style={styles.insightsContainer}>
              <Caption style={styles.insightsTitle}>Tes patterns</Caption>
              {observationInsights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <Caption style={styles.insightText}>
                    {getPhaseLabel(insight.phase)}: énergie {insight.energy} ({insight.count} observations)
                  </Caption>
                </View>
              ))}
            </View>
          )}
        </View>

        {config.showProgressBar && maturityLevel !== 'autonomous' && (
          <View style={styles.progressSection}>
            <Caption style={styles.progressTitle}>
              Niveau {maturityLevel === 'discovery' ? 'Découverte' : 'Apprentissage'}
            </Caption>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${engagement.maturity.confidence}%` }
                ]} 
              />
            </View>
          </View>
        )}

        <View style={styles.actionsGrid}>
          {layout.getVisibleActions([
            {
              type: 'observation',
              component: (
                <TouchableOpacity 
                  style={[
                    styles.actionCard, 
                    theme.getPhaseGlassmorphismStyle(currentPhase, {
                      bgOpacity: theme.glassmorphism.opacity.medium,
                      borderRadius: 12,
                      shadowOpacity: 0,
                    })
                  ]}
                  onPress={handleSymptomTracking}
                >
                  <Feather name="plus-circle" size={24} color={theme.colors.phases[currentPhase]} />
                  <BodyText style={styles.actionText}>Observer</BodyText>
                </TouchableOpacity>
              )
            },
            {
              type: 'predictions',
              component: (
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={handlePredictions}
                >
                  <Feather name="calendar" size={24} color={theme.colors.secondary} />
                  <BodyText style={styles.actionText}>Prédictions</BodyText>
                </TouchableOpacity>
              )
            },
            {
              type: 'history',
              component: (
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={handleHistory}
                >
                  <Feather name="clock" size={24} color={theme.colors.textSecondary} />
                  <BodyText style={styles.actionText}>Historique</BodyText>
                </TouchableOpacity>
              )
            }
          ]).map(action => (
            <React.Fragment key={action.type}>
              {action.component}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.periodControlsContainer}>
          {currentPhase === 'menstrual' ? (
            <TouchableOpacity 
              style={[styles.periodButton, styles.endPeriodButton]}
              onPress={handlePeriodEnd}
            >
              <Feather name="check-circle" size={20} color="#fff" />
              <BodyText style={styles.periodButtonText}>Fin des règles</BodyText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.periodButton, styles.startPeriodButton]}
              onPress={handlePeriodStart}
            >
              <Feather name="circle" size={20} color="#fff" />
              <BodyText style={styles.periodButtonText}>Nouveau cycle</BodyText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <QuickTrackingModal 
        visible={showQuickTracking}
        onClose={() => setShowQuickTracking(false)}
        phase={currentPhase}
        cycleDay={currentDay}
      />
      
      <ParametresModal 
        visible={showParams}
        onClose={() => setShowParams(false)}
      />
    </ScreenContainer>
  );
}

const getPhaseEnergyLevel = (phase) => {
  const energyLevels = {
    menstrual: 'Douce',
    follicular: 'Montante',
    ovulatory: 'Haute',
    luteal: 'Variable'
  };
  return energyLevels[phase] || 'Variable';
};

const getPhaseFocus = (phase) => {
  const focuses = {
    menstrual: 'Repos et régénération',
    follicular: 'Nouveaux projets',
    ovulatory: 'Communication',
    luteal: 'Finalisation'
  };
  return focuses[phase] || 'Écoute intérieure';
};

const getPhaseDuration = (phase) => {
  const durations = {
    menstrual: '3-7 jours',
    follicular: '7-10 jours',
    ovulatory: '3-5 jours',
    luteal: '10-14 jours'
  };
  return durations[phase] || 'Variable';
};

const getStyles = (theme, currentPhase) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  setupText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  cycleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  phaseInfoContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    width: '100%',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: theme.colors.text,
  },
  dayCounter: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  phaseDescription: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  // Rituels
  ritualContainer: {
    backgroundColor: theme.colors.phases[currentPhase] + '10',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.phases[currentPhase] + '30',
  },
  ritualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.m,
  },
  ritualTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.phases[currentPhase],
  },
  ritualText: {
    fontSize: 15,
    lineHeight: 24,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  obsSection: {
    marginBottom: 24,
  },
  obsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  obsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  obsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  obsBadgeActive: {
    ...theme.getGlassmorphismStyle(theme.colors.primary, {
      bgOpacity: theme.glassmorphism.opacity.medium,
      borderWidth: 0,
      shadowOpacity: 0,
    }),
  },
  obsBadgeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  obsBadgeTextActive: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  lastObsCard: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  lastObsText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  insightsContainer: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  insightCard: {
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  periodControlsContainer: {
    alignItems: 'center',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startPeriodButton: {
    backgroundColor: theme.colors.phases.menstrual,
  },
  endPeriodButton: {
    backgroundColor: theme.colors.secondary,
  },
  periodButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  progressSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  progressTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.phases[currentPhase],
    borderRadius: 2,
  },
});