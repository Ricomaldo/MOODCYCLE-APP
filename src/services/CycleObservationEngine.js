// ═══════════════════════════════════════════════════════════
// 🔄 CycleObservationEngine.js - Service Observation Cycle
// ═══════════════════════════════════════════════════════════

import { getCurrentPhase, PHASE_METADATA } from '../utils/cycleCalculations';

// ───────────────────────────────────────────────────────────
// 📊 CONSTANTES OBSERVATION
// ───────────────────────────────────────────────────────────

const OBSERVATION_KEYWORDS = {
  menstrual: {
    symptoms: ['règles', 'saignements', 'crampes', 'douleurs', 'fatigue intense'],
    moods: ['repli', 'introspection', 'besoin repos', 'sensible'],
    energy: ['basse', 'épuisée', 'calme']
  },
  follicular: {
    symptoms: ['légèreté', 'clarté mentale', 'appétit normal'],
    moods: ['optimiste', 'créative', 'motivée', 'curieuse'],
    energy: ['montante', 'stable', 'dynamique']
  },
  ovulatory: {
    symptoms: ['glaire', 'libido haute', 'peau lumineuse'],
    moods: ['confiante', 'sociable', 'communicative', 'rayonnante'],
    energy: ['pic', 'maximale', 'débordante']
  },
  luteal: {
    symptoms: ['tension seins', 'ballonnements', 'fringales', 'SPM'],
    moods: ['irritable', 'émotive', 'anxieuse', 'critique'],
    energy: ['déclinante', 'variable', 'instable']
  }
};

const GUIDANCE_TEMPLATES = {
  discovery: {
    menstrual: "Comment te sens-tu pendant tes règles ? Note tes ressentis 🌙",
    follicular: "Ton énergie remonte ? Observe ce qui change en toi 🌱",
    ovulatory: "Tu rayonnes ? C'est le moment de noter ta vitalité ☀️",
    luteal: "Des changements d'humeur ? C'est normal, observe-les 🍂"
  },
  learning: {
    menstrual: "Je remarque que tu as souvent {symptom} en phase menstruelle",
    follicular: "Tes patterns montrent une belle énergie {energy} à cette période",
    ovulatory: "Tu sembles {mood} pendant l'ovulation, c'est ton pattern !",
    luteal: "J'ai noté que tu ressens {symptom} en phase lutéale"
  },
  autonomous: {
    menstrual: "Tes observations confirment : {pattern}",
    follicular: "Ton corps suit son rythme unique : {pattern}",
    ovulatory: "Tu connais bien cette phase : {pattern}",
    luteal: "Tes patterns lutéaux sont clairs : {pattern}"
  }
};

// ───────────────────────────────────────────────────────────
// 🎯 CLASSE PRINCIPALE
// ───────────────────────────────────────────────────────────

class CycleObservationEngine {
  
  /**
   * Détermine la phase actuelle depuis observations
   * @param {Object} cycleData - Données cycle (lastPeriodDate, length, etc)
   * @param {Object} userIntelligence - Store intelligence utilisateur
   * @returns {Object} { phase, confidence, method, signals }
   */
  static getCurrentPhaseFromObservation(cycleData, userIntelligence) {
    if (!userIntelligence?.observationPatterns?.lastObservations?.length) {
      // Fallback sur calculs prédictifs
      return {
        phase: getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration),
        confidence: 0,
        method: 'predictive',
        signals: []
      };
    }

    const observations = userIntelligence.observationPatterns.lastObservations;
    const recentObs = observations.slice(0, 7); // Dernière semaine
    
    // Analyser patterns récents
    const phaseScores = this._analyzeRecentObservations(recentObs);
    const predictedPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
    
    // Déterminer phase avec plus de confiance
    const { phase, confidence } = this._determinePhaseWithConfidence(
      phaseScores, 
      predictedPhase,
      userIntelligence.observationPatterns
    );
    
    return {
      phase,
      confidence,
      method: confidence > 0.6 ? 'observation' : 'hybrid',
      signals: phaseScores[phase]?.signals || []
    };
  }

  /**
   * Génère guidance personnalisée selon observations
   * @param {string} currentPhase - Phase actuelle
   * @param {Object} userIntelligence - Intelligence utilisateur
   * @param {string} maturityLevel - discovery/learning/autonomous
   * @returns {Object} { message, action, insights }
   */
  static getObservationGuidance(currentPhase, userIntelligence, maturityLevel = 'discovery') {
    const templates = GUIDANCE_TEMPLATES[maturityLevel];
    const observationPatterns = userIntelligence?.observationPatterns;
    
    // Guidance basique si pas de patterns
    if (!observationPatterns || observationPatterns.totalObservations < 3) {
      return {
        message: templates[currentPhase],
        action: "Note tes ressentis quotidiens",
        insights: [],
        personalized: false
      };
    }

    // Guidance personnalisée selon patterns
    const phasePattern = observationPatterns.phasePatterns[currentPhase];
    const insights = this._generatePersonalizedInsights(phasePattern, currentPhase);
    
    // Construire message personnalisé
    let message = templates[currentPhase];
    
    if (maturityLevel !== 'discovery' && phasePattern?.occurrences > 0) {
      // Remplacer placeholders avec vraies données
      message = message
        .replace('{symptom}', phasePattern.typicalSymptoms[0] || 'certains symptômes')
        .replace('{mood}', phasePattern.typicalMoods[0] || 'dans un certain état')
        .replace('{energy}', phasePattern.typicalEnergy || 'particulière')
        .replace('{pattern}', insights[0] || 'ton rythme est unique');
    }
    
    return {
      message,
      action: this._getContextualAction(currentPhase, maturityLevel),
      insights,
      personalized: true,
      confidence: observationPatterns.confidence
    };
  }

  /**
   * Analyse si utilisatrice corrige les prédictions
   */
  static detectPredictionCorrection(observedPhase, predictedPhase, userIntelligenceStore) {
    if (observedPhase !== predictedPhase) {
      // Tracker signal d'autonomie via le store passé en paramètre
      if (userIntelligenceStore?.trackAutonomySignal) {
        userIntelligenceStore.trackAutonomySignal('corrects_prediction', {
          observed: observedPhase,
          predicted: predictedPhase,
          timestamp: Date.now()
        });
      }
      
      return {
        corrected: true,
        message: "J'ai noté que tu es en phase " + PHASE_METADATA[observedPhase].name + 
                " plutôt que " + PHASE_METADATA[predictedPhase].name
      };
    }
    
    return { corrected: false };
  }

  /**
   * Suggère observations manquantes pour améliorer précision
   */
  static getSuggestedObservations(currentPhase, existingObservations) {
    const suggestions = [];
    const keywords = OBSERVATION_KEYWORDS[currentPhase];
    
    // Vérifier ce qui manque
    if (!existingObservations.some(obs => obs.energy)) {
      suggestions.push({
        type: 'energy',
        prompt: "Comment est ton niveau d'énergie aujourd'hui ?",
        options: keywords.energy
      });
    }
    
    if (!existingObservations.some(obs => obs.mood)) {
      suggestions.push({
        type: 'mood',
        prompt: "Comment te sens-tu émotionnellement ?",
        options: keywords.moods
      });
    }
    
    if (!existingObservations.some(obs => obs.symptoms?.length > 0)) {
      suggestions.push({
        type: 'symptoms',
        prompt: "As-tu des symptômes particuliers ?",
        options: keywords.symptoms
      });
    }
    
    return suggestions.slice(0, 2); // Max 2 suggestions
  }

  // ───────────────────────────────────────────────────────────
  // 🔧 MÉTHODES PRIVÉES
  // ───────────────────────────────────────────────────────────

  static _analyzeRecentObservations(observations) {
    // GARDE PERFORMANCE : Limiter à 50 observations max
    if (observations.length > 50) {
      observations = observations.slice(0, 50);
    }
    
    const phaseScores = {
      menstrual: { score: 0, signals: [] },
      follicular: { score: 0, signals: [] },
      ovulatory: { score: 0, signals: [] },
      luteal: { score: 0, signals: [] }
    };

    observations.forEach(obs => {
      Object.entries(OBSERVATION_KEYWORDS).forEach(([phase, keywords]) => {
        let matchScore = 0;
        
        // Analyser symptômes
        if (obs.symptoms?.length > 0) {
          const symptomMatches = obs.symptoms.filter(s => 
            keywords.symptoms.some(kw => s.toLowerCase().includes(kw))
          );
          if (symptomMatches.length > 0) {
            matchScore += symptomMatches.length * 2;
            phaseScores[phase].signals.push(...symptomMatches.map(s => ({ type: 'symptom', value: s })));
          }
        }
        
        // Analyser mood
        if (obs.mood && keywords.moods.some(m => obs.mood.toLowerCase().includes(m))) {
          matchScore += 3;
          phaseScores[phase].signals.push({ type: 'mood', value: obs.mood });
        }
        
        // Analyser énergie
        if (obs.energy && keywords.energy.some(e => obs.energy.toLowerCase().includes(e))) {
          matchScore += 2;
          phaseScores[phase].signals.push({ type: 'energy', value: obs.energy });
        }
        
        phaseScores[phase].score += matchScore;
      });
    });

    return phaseScores;
  }

  static _determinePhaseWithConfidence(phaseScores, predictedPhase, patterns) {
    // Trouver phase avec score max
    let maxScore = 0;
    let bestPhase = predictedPhase;
    
    Object.entries(phaseScores).forEach(([phase, data]) => {
      if (data.score > maxScore) {
        maxScore = data.score;
        bestPhase = phase;
      }
    });
    
    // Calculer confiance
    const totalScore = Object.values(phaseScores).reduce((sum, data) => sum + data.score, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0;
    
    // Boost confiance si cohérent avec patterns historiques
    const historicalBoost = patterns.phasePatterns[bestPhase]?.occurrences > 5 ? 0.2 : 0;
    
    return {
      phase: confidence > 0.4 ? bestPhase : predictedPhase,
      confidence: Math.min(1, confidence + historicalBoost)
    };
  }

  static _generatePersonalizedInsights(phasePattern, currentPhase) {
    const insights = [];
    
    if (!phasePattern || phasePattern.occurrences === 0) {
      return insights;
    }
    
    // Insight sur symptômes récurrents
    if (phasePattern.typicalSymptoms.length > 0) {
      insights.push(
        `Tu ressens souvent ${phasePattern.typicalSymptoms.slice(0, 2).join(' et ')} en phase ${PHASE_METADATA[currentPhase].name.toLowerCase()}`
      );
    }
    
    // Insight sur mood dominant
    if (phasePattern.typicalMoods.length > 0) {
      insights.push(
        `Ton mood ${phasePattern.typicalMoods[0]} revient régulièrement à cette période`
      );
    }
    
    // Insight sur énergie
    if (phasePattern.typicalEnergy) {
      insights.push(
        `Ton énergie est généralement ${phasePattern.typicalEnergy} pendant cette phase`
      );
    }
    
    return insights;
  }

  static _getContextualAction(phase, maturityLevel) {
    const actions = {
      discovery: {
        menstrual: "Note ton niveau d'énergie et tes ressentis",
        follicular: "Observe ce qui te donne de l'élan",
        ovulatory: "Remarque tes interactions sociales",
        luteal: "Sois attentive aux changements subtils"
      },
      learning: {
        menstrual: "Compare avec tes cycles précédents",
        follicular: "Identifie tes patterns créatifs",
        ovulatory: "Note tes pics de confiance",
        luteal: "Repère tes déclencheurs émotionnels"
      },
      autonomous: {
        menstrual: "Honore ton besoin de repos",
        follicular: "Lance tes projets importants",
        ovulatory: "Profite de ton rayonnement",
        luteal: "Pratique l'auto-compassion"
      }
    };
    
    return actions[maturityLevel]?.[phase] || "Continue tes observations";
  }
}

export default CycleObservationEngine;