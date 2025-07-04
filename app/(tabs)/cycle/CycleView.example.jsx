// Exemple complet de CycleView.jsx avec toutes les connexions intelligence

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../src/hooks/useTheme';
import { BodyText, Caption } from '../../../src/core/ui/typography';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import { CycleHeader } from '../../../src/core/layout/SimpleHeader';
import CycleWheel from '../../../src/features/cycle/CycleWheel';
import { getCycleDataAdaptive } from '../../../src/stores/useCycleStore';
import { useUserStore } from '../../../src/stores/useUserStore';
import { PhaseIcon } from '../../../src/config/iconConstants';
import QuickTrackingModal from '../../../src/features/notebook/QuickTrackingModal';
import ParametresModal from '../../../src/core/settings/ParametresModal';
import { useTerminology } from '../../../src/hooks/useTerminology';
import { useAdaptiveInterface } from '../../../src/hooks/useAdaptiveInterface';
import { useSmartSuggestions } from '../../../src/hooks/useSmartSuggestions';

export default function CycleView() {
  // 1. Utiliser getCycleDataAdaptive pour phase intelligente
  const cycleData = getCycleDataAdaptive();
  const { 
    currentPhase,      // Phase adaptative !
    currentDay,
    phaseInfo,
    nextPeriodDate,
    daysUntilNextPeriod,
    hasData,
    cycleMode,         // 'predictive', 'hybrid', ou 'observation'
    isObservationBased // true si phase basée sur observations
  } = cycleData;

  // 2. Intelligence hooks
  const { layout, features, maturityLevel, config } = useAdaptiveInterface();
  const smartSuggestions = useSmartSuggestions();
  
  const { profile } = useUserStore();
  const { theme } = useTheme();
  const { getPhaseLabel } = useTerminology();

  const [showQuickTracking, setShowQuickTracking] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 3. Actions adaptatives selon maturité
  const allActions = [
    {
      id: 'track',
      type: 'observation',
      icon: 'plus-circle',
      label: 'Observer',
      color: theme.colors.phases[currentPhase],
      onPress: () => setShowQuickTracking(true),
      emphasized: smartSuggestions.actions.some(a => a.type === 'observation')
    },
    {
      id: 'predict',
      type: 'predictions',
      icon: 'calendar',
      label: 'Prédictions',
      color: theme.colors.secondary,
      onPress: handlePredictions,
      hidden: maturityLevel === 'discovery' && !hasData
    },
    {
      id: 'history',
      type: 'history',
      icon: 'clock',
      label: 'Historique',
      color: theme.colors.textSecondary,
      onPress: handleHistory,
      hidden: maturityLevel === 'discovery'
    },
    {
      id: 'insights',
      type: 'insights',
      icon: 'lightbulb',
      label: 'Découvrir',
      color: theme.colors.primary,
      onPress: () => router.push(`/(tabs)/conseils`),
      hidden: !features.phase_insights
    }
  ];

  // Filtrer et limiter selon interface adaptative
  const visibleActions = layout.getVisibleActions(
    allActions.filter(a => !a.hidden)
  );

  // 4. Message guidance intelligent
  const guidanceMessage = React.useMemo(() => {
    if (isObservationBased && cycleMode === 'observation') {
      return "Phase basée sur tes observations 🌟";
    }
    if (cycleMode === 'hybrid') {
      return "J'apprends de tes patterns...";
    }
    if (smartSuggestions.hasHighConfidence) {
      return smartSuggestions.recommendations[0];
    }
    return null;
  }, [isObservationBased, cycleMode, smartSuggestions]);

  const handlePredictions = React.useCallback(() => {
    if (nextPeriodDate && daysUntilNextPeriod !== null) {
      const message = isObservationBased 
        ? "Basé sur tes observations personnelles"
        : "Basé sur tes cycles précédents";
        
      Alert.alert(
        '🔮 Tes prédictions',
        `${message}\n\n📅 Prochaines règles dans ${daysUntilNextPeriod} jours`,
        [{ text: 'Parfait !', style: 'default' }]
      );
    }
  }, [nextPeriodDate, daysUntilNextPeriod, isObservationBased]);

  const handleHistory = React.useCallback(() => {
    router.push({
      pathname: '/(tabs)/notebook',
      params: { filterPhase: currentPhase, mode: 'history' }
    });
  }, [currentPhase]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const styles = getStyles(theme, currentPhase);

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
            onPhasePress={(phase) => router.push(`/(tabs)/cycle/phases/${phase}`)}
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
            
            {guidanceMessage && (
              <Caption style={styles.guidanceText}>
                {guidanceMessage}
              </Caption>
            )}
          </View>
        </View>

        {/* Actions adaptatives */}
        <View style={styles.actionsGrid}>
          {visibleActions.map((action) => (
            <TouchableOpacity 
              key={action.id}
              style={[
                styles.actionCard,
                action.emphasized && styles.actionCardEmphasized
              ]}
              onPress={action.onPress}
            >
              <Feather name={action.icon} size={24} color={action.color} />
              <BodyText style={styles.actionText}>{action.label}</BodyText>
            </TouchableOpacity>
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
                  { width: `${config.confidence || 0}%` }
                ]} 
              />
            </View>
          </View>
        )}
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

const getStyles = (theme, currentPhase) => StyleSheet.create({
  // ... styles existants ...
  
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
  guidanceText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  actionCardEmphasized: {
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    backgroundColor: theme.colors.primary + '08',
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
});