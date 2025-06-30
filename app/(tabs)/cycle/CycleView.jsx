//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/cycle/CycleView.jsx - AVEC OBSERVATIONS
// 🧩 Type: Écran Principal Cycle
// 📚 Description: Cycle avec observations Miranda Gray
// 🕒 Version: 7.2 - 2025-06-29 - BLOC 2 Badge Compteur
// ─────────────────────────────────────────────────────────
//
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../src/hooks/useTheme';
import { BodyText, Caption } from '../../../src/core/ui/Typography';
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

export default function CycleView() {
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND - ULTRA SIMPLE
  const cycleData = useCycleStore((state) => state);
  const startNewCycle = useCycleStore((state) => state.startNewCycle);
  const endPeriod = useCycleStore((state) => state.endPeriod);
  const observations = useCycleStore((state) => state.observations || []);
  
  // Calculs directs (pas de hooks complexes)
  const currentDay = getCurrentCycleDay(cycleData.lastPeriodDate, cycleData.length);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const phaseInfo = getCurrentPhaseInfo(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const nextPeriodDate = getNextPeriodDate(cycleData.lastPeriodDate, cycleData.length);
  const daysUntilNextPeriod = getDaysUntilNextPeriod(cycleData.lastPeriodDate, cycleData.length);
  const hasData = !!(cycleData.lastPeriodDate && cycleData.length);

  const { profile } = useUserStore();
  const { theme } = useTheme();
  const { getPhaseLabel, getArchetypeLabel } = useTerminology();

  const safeProfile = profile || { prenom: null };
  const [showQuickTracking, setShowQuickTracking] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLastObservation, setShowLastObservation] = useState(false);

  // 🆕 Récupérer dernière observation
  const lastObservation = observations[observations.length - 1];

  // 🆕 Calcul tendances observations
  const getObservationInsights = () => {
    if (observations.length < 3) return null;
    
    // Grouper par phase
    const phaseObservations = observations.reduce((acc, obs) => {
      if (!acc[obs.phase]) acc[obs.phase] = [];
      acc[obs.phase].push(obs);
      return acc;
    }, {});
    
    // Analyser tendances
    const insights = [];
    Object.entries(phaseObservations).forEach(([phase, phaseObs]) => {
      if (phaseObs.length >= 2) {
        const avgEnergy = phaseObs.reduce((sum, obs) => sum + obs.energy, 0) / phaseObs.length;
        const energyTrend = avgEnergy > 3.5 ? 'haute' : avgEnergy < 2.5 ? 'douce' : 'modérée';
        
        // Détecter patterns dans les notes
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

  // 🩸 Handlers pour le bouton règles - SIMPLIFIÉ
  const handlePeriodStart = React.useCallback(() => {
    console.log('🩸 Démarrage nouveau cycle');
    startNewCycle();
  }, [startNewCycle]);

  const handlePeriodEnd = React.useCallback(() => {
    console.log('✅ Fin des règles');
    endPeriod();
  }, [endPeriod]);

  // 🆕 BLOC 2 - Handler badge tap
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

  const styles = getStyles(theme);

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
        
        {/* Subtitle avec prédictions */}
        <View style={styles.header}>
          <BodyText style={styles.subtitle}>
            Jour {currentDay} • {getPhaseLabel(currentPhase)}
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
            size={240}
            userName={safeProfile.prenom || 'Emma'}
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

        {/* 🆕 Bouton Comment te sens-tu AVEC BADGE - MODIFIÉ BLOC 2 */}
        <TouchableOpacity 
          style={styles.observationButton}
          onPress={handleSymptomTracking}
        >
          <View style={styles.observationButtonContent}>
            <Feather name="heart" size={20} color={theme.colors.primary} />
            <BodyText style={styles.observationButtonText}>
              Comment te sens-tu aujourd'hui ?
            </BodyText>
            {observations.length > 0 && (
              <TouchableOpacity 
                style={[styles.observationBadge, {
                  backgroundColor: theme.colors.phases[currentPhase] + '30'
                }]}
                onPress={handleBadgeTap}
              >
                <Caption style={styles.badgeText}>{observations.length}</Caption>
              </TouchableOpacity>
            )}
          </View>
          
          {/* 🆕 Affichage dernière observation au tap */}
          {showLastObservation && lastObservation && (
            <View style={styles.lastObservationContainer}>
              <Caption style={styles.lastObservationText}>
                {formatLastObservation()}
              </Caption>
            </View>
          )}
        </TouchableOpacity>

        {/* Phase info */}
        <View style={styles.phaseInfoContainer}>
          <View style={styles.phaseHeader}>
            <PhaseIcon 
              phaseKey={currentPhase}
              size={32}
              color={theme.colors.phases[currentPhase]}
            />
            <View style={styles.phaseHeaderText}>
              <BodyText style={styles.phaseName}>{getPhaseLabel(currentPhase)}</BodyText>
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

        {/* 🆕 Section Observations */}
        {observationInsights && (
          <View style={styles.observationsContainer}>
            <View style={styles.observationsHeader}>
              <Feather name="eye" size={20} color={theme.colors.secondary} />
              <BodyText style={styles.observationsTitle}>
                Tes observations révèlent...
              </BodyText>
            </View>
            
            {observationInsights.map((insight, index) => (
              <View key={index} style={styles.observationItem}>
                <PhaseIcon 
                  phaseKey={insight.phase}
                  size={16}
                  color={theme.colors.phases[insight.phase]}
                />
                <View style={styles.observationContent}>
                  <BodyText style={styles.observationText}>
                    En {getPhaseLabel(insight.phase)}, tu sembles ressentir une énergie {insight.energy}
                  </BodyText>
                  <Caption style={styles.observationMeta}>
                    Basé sur {insight.count} observations
                  </Caption>
                </View>
              </View>
            ))}
            
            <TouchableOpacity style={styles.observationDisclaimer}>
              <Caption style={styles.observationDisclaimerText}>
                Ces tendances émergent de tes propres observations 🌸
              </Caption>
            </TouchableOpacity>
          </View>
        )}

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
                  {getArchetypeLabel(phase)}
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
  const phaseDurations = {
    menstrual: '3-7',
    follicular: '7-10',
    ovulatory: '3-5',
    luteal: '10-14'
  };
  return phaseDurations[phase] || '?';
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
  
  // 🆕 Styles Observations MODIFIÉS BLOC 2
  observationButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    borderStyle: 'dashed',
    position: 'relative', // Pour le badge absolute
  },
  observationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.l,
    gap: theme.spacing.m,
  },
  observationButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  // 🆕 BADGE COMPTEUR BLOC 2
  observationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text,
  },
  // 🆕 DERNIÈRE OBSERVATION BLOC 2
  lastObservationContainer: {
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    paddingTop: theme.spacing.xs,
  },
  lastObservationText: {
    fontSize: 13,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  observationsContainer: {
    backgroundColor: theme.colors.secondary + '10',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  observationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  observationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  observationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  observationContent: {
    flex: 1,
  },
  observationText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  observationMeta: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  observationDisclaimer: {
    marginTop: theme.spacing.m,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  observationDisclaimerText: {
    fontSize: 13,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});