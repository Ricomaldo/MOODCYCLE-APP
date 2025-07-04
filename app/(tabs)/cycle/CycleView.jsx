//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/cycle/CycleView.jsx
// 🧩 Type: Écran Principal
// 📚 Description: Cycle avec intelligence adaptative
// 🕒 Version: 8.0 - Merge Intelligence ALPHA
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
import { getCycleDataAdaptive, useCycleStore } from '../../../src/stores/useCycleStore';
import { useUserStore } from '../../../src/stores/useUserStore';
import { PhaseIcon } from '../../../src/config/iconConstants';
import QuickTrackingModal from '../../../src/features/shared/QuickTrackingModal';
import ParametresModal from '../../../src/core/settings/ParametresModal';
import PhaseCorrectionModal from '../../../src/features/cycle/PhaseCorrectionModal';
import { useTerminology } from '../../../src/hooks/useTerminology';
import { useAdaptiveInterface } from '../../../src/hooks/useAdaptiveInterface';
import { useSmartSuggestions } from '../../../src/hooks/useSmartSuggestions';
import { useQuickObservation } from '../../../src/hooks/useQuickObservation';
import { useEngagementStore } from '../../../src/stores/useEngagementStore';
import { useUserIntelligence } from '../../../src/stores/useUserIntelligence';
import CycleProgressionIndicator from '../../../src/features/cycle/CycleProgressionIndicator';
import CycleObservationEngine from '../../../src/services/CycleObservationEngine';

export default function CycleView() {
  // 1. Intelligence adaptative
  const cycleData = getCycleDataAdaptive();
  const { 
    currentPhase,
    currentDay,
    phaseInfo,
    nextPeriodDate,
    daysUntilNextPeriod,
    hasData,
    cycleMode,
    isObservationBased,
    maturityLevel
  } = cycleData;

  // 2. Stores
  const startNewCycle = useCycleStore((state) => state.startNewCycle);
  const endPeriod = useCycleStore((state) => state.endPeriod);
  const observations = useCycleStore((state) => state.observations || []);
  const engagement = useEngagementStore();
  
  // 3. Intelligence hooks
  const { layout, features, config } = useAdaptiveInterface();
  const smartSuggestions = useSmartSuggestions();
  
  const { profile } = useUserStore();
  const { theme } = useTheme();
  const { getPhaseLabel, getArchetypeLabel } = useTerminology('spiritual');

  const safeProfile = profile || { prenom: null };
  const [showQuickTracking, setShowQuickTracking] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [showPhaseCorrection, setShowPhaseCorrection] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLastObservation, setShowLastObservation] = useState(false);
  
  // Intelligence observation
  const { isHybridMode, isObservationMode } = useQuickObservation();
  
  // Guidance observation
  const intelligence = useUserIntelligence();
  const observationGuidance = React.useMemo(() => 
    CycleObservationEngine.getObservationGuidance(
      currentPhase, 
      intelligence,
      maturityLevel
    ), [currentPhase, maturityLevel, intelligence]
  );

  const observationPrompts = React.useMemo(() =>
    CycleObservationEngine.getIntelligentObservationPrompts(
      currentPhase,
      observations.slice(-5)
    ), [currentPhase, observations]
  );

  const lastObservation = observations[observations.length - 1];

  // 4. Message guidance intelligent
  const guidanceMessage = React.useMemo(() => {
    if (isObservationBased && cycleMode === 'observation') {
      return "Phase basée sur tes observations 🌟";
    }
    if (cycleMode === 'hybrid') {
      return "J'apprends de tes patterns...";
    }
    if (smartSuggestions.hasHighConfidence) {
      return smartSuggestions.recommendations?.[0];
    }
    return null;
  }, [isObservationBased, cycleMode, smartSuggestions]);

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
        
        insights.push({
          phase,
          energy: energyTrend,
          count: phaseObs.length
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
      
      const message = isObservationBased 
        ? "Basé sur tes observations personnelles"
        : "Basé sur tes cycles précédents";
        
      Alert.alert(
        '🔮 Tes prédictions',
        `${message}\n\n📅 Prochaines règles : ${nextDate}\n⏰ Dans ${daysUntilNextPeriod} jours\n\n🌟 Phase suivante : ${getNextPhase(currentPhase)}`,
        [{ text: 'Parfait !', style: 'default' }]
      );
    } else {
      Alert.alert(
        '🔮 Prédictions',
        'Continue à utiliser MoodCycle pour que je puisse te donner des prédictions plus précises ! 💫',
        [{ text: 'Compris !', style: 'default' }]
      );
    }
  }, [nextPeriodDate, daysUntilNextPeriod, currentPhase, isObservationBased]);

  const handleHistory = React.useCallback(() => {
    router.push({
      pathname: '/(tabs)/notebook',
      params: {
        filterPhase: currentPhase,
        mode: 'history'
      }
    });
  }, [currentPhase]);

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
        {/* Badge mode observation */}
        {isObservationBased && (
          <View style={styles.observationBadge}>
            <Feather name="eye" size={14} color={theme.colors.primary} />
            <Caption style={styles.observationText}>
              Mode observation actif • {cycleMode}
            </Caption>
          </View>
        )}

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
          
          {/* Indicateur progression */}
          {maturityLevel !== 'autonomous' && (
            <CycleProgressionIndicator compact />
          )}
          
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
              {(isHybridMode || isObservationMode || cycleMode !== 'predictive') && (
                <TouchableOpacity 
                  style={styles.correctionButton}
                  onPress={() => setShowPhaseCorrection(true)}
                >
                  <Feather name="edit-2" size={14} color={theme.colors.textLight} />
                </TouchableOpacity>
              )}
            </View>
            
            <Caption style={styles.dayCounter}>
              Jour {currentDay} de {cycleData.length}
            </Caption>
            
            {guidanceMessage && (
              <Caption style={styles.guidanceText}>
                {guidanceMessage}
              </Caption>
            )}
            
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

          {/* Guidance observation contextuelle */}
          {observationGuidance && observationGuidance.mode !== 'predictive' && (
            <View style={styles.guidanceCard}>
              <Feather name="sparkles" size={14} color={theme.colors.primary} />
              <Caption style={styles.guidanceCardText}>
                {observationGuidance.message}
              </Caption>
            </View>
          )}

          {/* Prompts intelligents */}
          {observationPrompts.length > 0 && observations.length < 10 && (
            <View style={styles.promptsContainer}>
              {observationPrompts.slice(0, 1).map((prompt, idx) => (
                <TouchableOpacity 
                  key={idx}
                  style={styles.promptCard}
                  onPress={handleSymptomTracking}
                >
                  <Caption style={styles.promptIcon}>{prompt.icon}</Caption>
                  <Caption style={styles.promptText}>{prompt.prompt}</Caption>
                </TouchableOpacity>
              ))}
            </View>
          )}

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

        {/* Actions adaptatives avec emphasis */}
        <View style={styles.actionsGrid}>
          {layout.getVisibleActions([
            {
              type: 'observation',
              emphasized: smartSuggestions.actions.some(a => a.type === 'observation'),
              component: (
                <TouchableOpacity 
                  style={[
                    styles.actionCard,
                    smartSuggestions.actions.some(a => a.type === 'observation') && styles.actionCardEmphasized,
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
              emphasized: smartSuggestions.actions.some(a => a.type === 'predictions'),
              component: (
                <TouchableOpacity 
                  style={[
                    styles.actionCard,
                    smartSuggestions.actions.some(a => a.type === 'predictions') && styles.actionCardEmphasized
                  ]}
                  onPress={handlePredictions}
                >
                  <Feather name="calendar" size={24} color={theme.colors.secondary} />
                  <BodyText style={styles.actionText}>Prédictions</BodyText>
                </TouchableOpacity>
              )
            },
            {
              type: 'history',
              emphasized: smartSuggestions.actions.some(a => a.type === 'history'),
              component: (
                <TouchableOpacity 
                  style={[
                    styles.actionCard,
                    smartSuggestions.actions.some(a => a.type === 'history') && styles.actionCardEmphasized
                  ]}
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

        {/* Barre de progression maturité */}
        {config.showProgressBar && maturityLevel !== 'autonomous' && (
          <View style={styles.progressSection}>
            <Caption style={styles.progressTitle}>
              Progression : {maturityLevel === 'discovery' ? 'Découverte' : 'Apprentissage'}
            </Caption>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${engagement?.maturity?.confidence || 0}%` }
                ]} 
              />
            </View>
          </View>
        )}

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
      
      <PhaseCorrectionModal
        visible={showPhaseCorrection}
        onClose={() => setShowPhaseCorrection(false)}
        currentPhase={currentPhase}
        predictedPhase={currentPhase}
      />
      
      <ParametresModal 
        visible={showParams}
        onClose={() => setShowParams(false)}
      />
    </ScreenContainer>
  );
}

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
  observationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 16,
    marginBottom: 12,
  },
  observationText: {
    marginLeft: 6,
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
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
  correctionButton: {
    marginLeft: 'auto',
    padding: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
  },
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.s,
    gap: theme.spacing.xs,
  },
  guidanceCardText: {
    flex: 1,
    color: theme.colors.primary,
    fontSize: 12,
  },
  promptsContainer: {
    marginTop: theme.spacing.s,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.s,
  },
  promptIcon: {
    fontSize: 16,
  },
  promptText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
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
  guidanceText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  phaseDescription: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
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
  actionCardEmphasized: {
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    backgroundColor: theme.colors.primary + '08',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  progressSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
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
});