//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useQuickObservation.js
// 🧩 Type: Hook
// 📚 Description: Hook pour observation rapide du cycle
// 🕒 Version: 1.0 - 2025-06-21
// 🧭 Used in: components, modals
// ─────────────────────────────────────────────────────────
//

import { useCallback } from 'react';
import { useUserIntelligence } from '../stores/useUserIntelligence';
import { useEngagementStore } from '../stores/useEngagementStore';
import { useCycleStore } from '../stores/useCycleStore';
import { getCurrentPhase, getCurrentPhaseAdaptive, getCycleMode } from '../utils/cycleCalculations';
import CycleObservationEngine from '../services/CycleObservationEngine';

// ═══════════════════════════════════════════════════════
// 🎣 HOOK OBSERVATION RAPIDE
// ═══════════════════════════════════════════════════════

export function useQuickObservation() {
  const intelligence = useUserIntelligence();
  const engagement = useEngagementStore();
  const cycleData = useCycleStore((state) => state);

  // Calculer données cycle avec mode adaptatif
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

  const cycleMode = getCycleMode(intelligence, engagement?.maturity?.current);

  // ──────────────────────────────────────────────────────
  // 📝 TRACKER OBSERVATION
  // ──────────────────────────────────────────────────────

  const trackObservation = useCallback((observation) => {
    // Enrichir avec phase actuelle
    const enrichedObs = {
      ...observation,
      phase: currentPhase,
      timestamp: Date.now()
    };
    
    // Tracker dans intelligence
    intelligence.trackObservation(enrichedObs);
    
    // Tracker engagement
    engagement.trackAction('observation_tracked', {
      phase: currentPhase,
      hasSymptoms: !!observation.symptoms?.length,
      hasMood: !!observation.mood,
      hasEnergy: !!observation.energy
    });
    
    // Vérifier si correction de prédiction
    const predictedPhase = getCurrentPhase(
      cycleData.lastPeriodDate,
      cycleData.length,
      cycleData.periodDuration
    );
    
    if (observation.observedPhase && observation.observedPhase !== predictedPhase) {
      CycleObservationEngine.detectPredictionCorrection(
        observation.observedPhase,
        predictedPhase,
        intelligence
      );
    }

    // Analyser qualité observation
    const quality = CycleObservationEngine.analyzeObservationQuality(enrichedObs);
    
    // Tracker signal si observation détaillée
    if (quality.quality === 'excellent') {
      intelligence.trackAutonomySignal('detailed_observation');
    }

    return {
      success: true,
      quality,
      phase: currentPhase,
      mode: cycleMode
    };
  }, [intelligence, engagement, cycleData, currentPhase, cycleMode]);

  // ──────────────────────────────────────────────────────
  // 🎯 SUGGESTIONS CONTEXTUELLES
  // ──────────────────────────────────────────────────────

  const getSuggestions = useCallback(() => {
    return CycleObservationEngine.getSuggestedObservations(
      currentPhase,
      intelligence.observationPatterns?.lastObservations || []
    );
  }, [currentPhase, intelligence.observationPatterns]);

  const getIntelligentPrompts = useCallback(() => {
    return CycleObservationEngine.getIntelligentObservationPrompts(
      currentPhase,
      intelligence.observationPatterns?.lastObservations || []
    );
  }, [currentPhase, intelligence.observationPatterns]);

  // ──────────────────────────────────────────────────────
  // 📊 ÉTAT ET MÉTRIQUES
  // ──────────────────────────────────────────────────────

  const observationReadiness = intelligence.getObservationReadiness?.() || {
    hasEnoughData: false,
    hasGoodConsistency: false,
    readyForHybrid: false,
    readyForObservation: false,
    confidence: 0
  };

  const observationGuidance = CycleObservationEngine.getObservationGuidance(
    currentPhase,
    intelligence,
    engagement?.maturity?.current
  );

  // ──────────────────────────────────────────────────────
  // 🔄 CORRECTION PHASE MANUELLE
  // ──────────────────────────────────────────────────────

  const correctPhase = useCallback((observedPhase) => {
    const predictedPhase = getCurrentPhase(
      cycleData.lastPeriodDate,
      cycleData.length,
      cycleData.periodDuration
    );

    // Tracker correction
    const correctionResult = CycleObservationEngine.detectPredictionCorrection(
      observedPhase,
      predictedPhase,
      intelligence
    );

    // Tracker autonomie signal
    intelligence.trackAutonomySignal('manual_phase_change', {
      from: predictedPhase,
      to: observedPhase,
      timestamp: Date.now()
    });

    // Tracker engagement
    engagement.trackAction('phase_corrected', {
      from: predictedPhase,
      to: observedPhase
    });

    return correctionResult;
  }, [intelligence, engagement, cycleData]);

  // ──────────────────────────────────────────────────────
  // 🎯 API PUBLIQUE
  // ──────────────────────────────────────────────────────

  return {
    // Actions principales
    trackObservation,
    correctPhase,
    
    // Suggestions
    suggestions: getSuggestions(),
    intelligentPrompts: getIntelligentPrompts(),
    
    // État actuel
    currentMode: cycleMode,
    currentPhase,
    isReady: observationReadiness,
    guidance: observationGuidance,
    
    // Métriques
    totalObservations: intelligence.observationPatterns?.totalObservations || 0,
    consistency: intelligence.observationPatterns?.consistency || 0,
    confidence: intelligence.observationPatterns?.confidence || 0,
    
    // Helpers
    isObservationMode: cycleMode !== 'predictive',
    isHybridMode: cycleMode === 'hybrid',
    canSwitchToObservation: observationReadiness.readyForObservation,
    
    // Patterns
    mostObservedPhase: intelligence.getMostObservedPhase?.(),
    recentObservations: intelligence.observationPatterns?.lastObservations?.slice(0, 5) || []
  };
}

// ──────────────────────────────────────────────────────
// 🎯 HOOKS SPÉCIALISÉS
// ──────────────────────────────────────────────────────

/**
 * Hook pour observer une phase spécifique
 */
export function usePhaseObservation(targetPhase) {
  const quickObs = useQuickObservation();
  
  const trackPhaseObservation = useCallback((observation) => {
    return quickObs.trackObservation({
      ...observation,
      phase: targetPhase // Force la phase
    });
  }, [quickObs, targetPhase]);

  return {
    ...quickObs,
    trackObservation: trackPhaseObservation,
    targetPhase,
    isTargetPhase: quickObs.currentPhase === targetPhase
  };
}

/**
 * Hook pour suggestions d'observation uniquement
 */
export function useObservationSuggestions() {
  const quickObs = useQuickObservation();
  
  return {
    suggestions: quickObs.suggestions,
    intelligentPrompts: quickObs.intelligentPrompts,
    currentPhase: quickObs.currentPhase,
    guidance: quickObs.guidance
  };
} 