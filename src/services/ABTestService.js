// ═══════════════════════════════════════════════════════════
// 🧪 ABTestService.js - Service Tests A/B Intelligence
// ═══════════════════════════════════════════════════════════

import { getCurrentPhase, getCurrentPhaseAdaptive } from '../utils/cycleCalculations';

// ───────────────────────────────────────────────────────────
// 📊 MÉTRIQUES DE PERFORMANCE
// ───────────────────────────────────────────────────────────

const AB_TEST_METRICS = {
  PREDICTIVE_ACCURACY: 85, // % de précision prédictive théorique
  MIN_OBSERVATIONS: 7,     // Nombre minimum d'observations pour test
  CONFIDENCE_THRESHOLD: 0.6, // Seuil de confiance pour observation
  PERFORMANCE_WEIGHT: 0.3,   // Poids performance dans scoring
  ACCURACY_WEIGHT: 0.7       // Poids précision dans scoring
};

// ───────────────────────────────────────────────────────────
// 🧪 FONCTION PRINCIPALE A/B TEST
// ───────────────────────────────────────────────────────────

export const runABTest = (params) => {
  const { observations, lastPeriodDate, cycleLength, periodDuration = 5 } = params;
  
  // ✅ Validation des données
  if (!observations || observations.length < AB_TEST_METRICS.MIN_OBSERVATIONS) {
    return {
      canRun: false,
      reason: 'insufficient_observations',
      winnerPhase: getCurrentPhase(lastPeriodDate, cycleLength, periodDuration),
      mode: 'predictive'
    };
  }
  
  const results = {
    predictive: { time: 0, accuracy: 0, score: 0 },
    observation: { time: 0, accuracy: 0, score: 0 }
  };
  
  // 🚀 Test Mode Prédictif
  const predStart = performance.now();
  const predPhase = getCurrentPhase(lastPeriodDate, cycleLength, periodDuration);
  results.predictive.time = performance.now() - predStart;
  results.predictive.accuracy = AB_TEST_METRICS.PREDICTIVE_ACCURACY;
  
  // 🚀 Test Mode Observation
  const obsStart = performance.now();
  const obsPhase = getCurrentPhaseAdaptive(
    lastPeriodDate,
    cycleLength,
    periodDuration,
    { 
      mode: 'observation',
      userIntelligence: {
        learning: { confidence: calculateObservationConfidence(observations) },
        observationPatterns: { 
          lastObservations: observations.slice(-10), // 10 dernières observations
          consistency: calculateConsistency(observations),
          totalObservations: observations.length
        } 
      } 
    }
  );
  results.observation.time = performance.now() - obsStart;
  results.observation.accuracy = calculateObservationAccuracy(observations, predPhase);
  
  // 🎯 Calcul des scores pondérés
  results.predictive.score = calculateWeightedScore(
    results.predictive.time,
    results.predictive.accuracy,
    'predictive'
  );
  
  results.observation.score = calculateWeightedScore(
    results.observation.time,
    results.observation.accuracy,
    'observation'
  );
  
  // 🏆 Déterminer le gagnant
  const winner = results.observation.score > results.predictive.score ? 'observation' : 'predictive';
  const winnerPhase = winner === 'observation' ? obsPhase : predPhase;
  
  return {
    canRun: true,
    winner,
    winnerPhase,
    mode: winner,
    results,
    metadata: {
      observationsCount: observations.length,
      testDuration: Math.max(results.predictive.time, results.observation.time),
      confidence: results.observation.accuracy
    }
  };
};

// ───────────────────────────────────────────────────────────
// 🧮 FONCTIONS UTILITAIRES
// ───────────────────────────────────────────────────────────

const calculateObservationConfidence = (observations) => {
  if (!observations || observations.length === 0) return 0;
  
  // Calculer la confiance basée sur la cohérence des observations
  const recentObs = observations.slice(-5); // 5 dernières observations
  const phaseConsistency = calculatePhaseConsistency(recentObs);
  const dataQuality = Math.min(observations.length / 10, 1); // Normaliser sur 10 obs
  
  return Math.min(phaseConsistency * dataQuality * 100, 100);
};

const calculatePhaseConsistency = (observations) => {
  if (observations.length < 2) return 0;
  
  // Analyser la cohérence des phases observées
  const phases = observations.map(obs => obs.phase).filter(Boolean);
  const uniquePhases = new Set(phases);
  
  // Plus il y a de phases uniques, moins c'est cohérent
  const consistency = 1 - (uniquePhases.size - 1) / Math.max(phases.length - 1, 1);
  
  return Math.max(0, consistency);
};

const calculateConsistency = (observations) => {
  if (observations.length < 3) return 0;
  
  // Calculer la cohérence des patterns
  const recentObs = observations.slice(-5);
  let consistentCount = 0;
  
  for (let i = 1; i < recentObs.length; i++) {
    const prev = recentObs[i - 1];
    const curr = recentObs[i];
    
    // Vérifier la cohérence des patterns (mood, energy, symptoms)
    if (prev.mood === curr.mood || prev.energy === curr.energy) {
      consistentCount++;
    }
  }
  
  return consistentCount / (recentObs.length - 1);
};

const calculateObservationAccuracy = (observations, predictedPhase) => {
  if (!observations || observations.length === 0) return 0;
  
  // Calculer la précision basée sur la correspondance avec les prédictions
  const recentObs = observations.slice(-3); // 3 dernières observations
  let matches = 0;
  
  recentObs.forEach(obs => {
    if (obs.phase === predictedPhase) {
      matches++;
    }
  });
  
  const baseAccuracy = matches / recentObs.length;
  
  // Bonus pour la qualité des données
  const dataQualityBonus = Math.min(observations.length / 20, 0.2); // +20% max
  
  return Math.min((baseAccuracy + dataQualityBonus) * 100, 100);
};

const calculateWeightedScore = (time, accuracy, mode) => {
  // Normaliser le temps (objectif < 10ms)
  const normalizedTime = Math.max(0, 1 - (time / 10));
  
  // Normaliser la précision (0-100%)
  const normalizedAccuracy = accuracy / 100;
  
  // Score pondéré
  const score = (normalizedTime * AB_TEST_METRICS.PERFORMANCE_WEIGHT) + 
                (normalizedAccuracy * AB_TEST_METRICS.ACCURACY_WEIGHT);
  
  // Bonus pour l'observation si données suffisantes
  if (mode === 'observation' && accuracy > 70) {
    return score * 1.1; // +10% bonus
  }
  
  return score;
};

// ───────────────────────────────────────────────────────────
// 📊 TRACKING ET ANALYTICS
// ───────────────────────────────────────────────────────────

export const trackABTestResult = (result) => {
  if (!result || !result.canRun) return;
  
  // Log pour analytics
  console.log('🧪 AB Test Result:', {
    winner: result.winner,
    winnerPhase: result.winnerPhase,
    predictiveScore: result.results.predictive.score,
    observationScore: result.results.observation.score,
    metadata: result.metadata
  });
  
  // TODO: Envoyer à analytics service
  // analytics.track('ab_test_result', result);
};

// ───────────────────────────────────────────────────────────
// 🎯 API PUBLIQUE
// ───────────────────────────────────────────────────────────

export default {
  runABTest,
  trackABTestResult,
  AB_TEST_METRICS
}; 