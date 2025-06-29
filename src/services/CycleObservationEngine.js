//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/CycleObservationEngine.js
// 🧩 Type: Service
// 📚 Description: Moteur d'observation et apprentissage cycle
// 🕒 Version: 1.0 - 2025-06-21
// 🧭 Used in: hooks, components
// ─────────────────────────────────────────────────────────
//

import { CYCLE_MODES } from '../utils/cycleCalculations';

// ═══════════════════════════════════════════════════════
// 🎯 MOTEUR OBSERVATION CYCLE
// ═══════════════════════════════════════════════════════

class CycleObservationEngine {
  /**
   * Génère des suggestions d'observation contextuelles
   */
  static getSuggestedObservations(currentPhase, lastObservations = []) {
    const phaseObservations = {
      menstrual: [
        {
          prompt: "Comment te sens-tu physiquement aujourd'hui ?",
          type: 'symptoms',
          focus: ['cramps', 'fatigue', 'mood'],
          icon: '🌙'
        },
        {
          prompt: "Quel est ton niveau d'énergie en ce moment ?",
          type: 'energy',
          focus: ['rest', 'recovery'],
          icon: '💤'
        }
      ],
      follicular: [
        {
          prompt: "Sens-tu ton énergie qui remonte ?",
          type: 'energy',
          focus: ['rising', 'motivation'],
          icon: '🌱'
        },
        {
          prompt: "As-tu des projets qui t'inspirent ?",
          type: 'mood',
          focus: ['creativity', 'planning'],
          icon: '✨'
        }
      ],
      ovulatory: [
        {
          prompt: "Te sens-tu confiante et rayonnante ?",
          type: 'mood',
          focus: ['confidence', 'social'],
          icon: '☀️'
        },
        {
          prompt: "Comment vis-tu ce pic d'énergie ?",
          type: 'energy',
          focus: ['peak', 'connection'],
          icon: '🔥'
        }
      ],
      luteal: [
        {
          prompt: "As-tu besoin de plus de calme aujourd'hui ?",
          type: 'mood',
          focus: ['sensitivity', 'introspection'],
          icon: '🍂'
        },
        {
          prompt: "Ressens-tu des tensions physiques ?",
          type: 'symptoms',
          focus: ['pms', 'tension'],
          icon: '⚡'
        }
      ]
    };

    // Éviter les observations récentes similaires
    const recentTypes = lastObservations.slice(0, 3).map(obs => obs.type);
    const suggestions = phaseObservations[currentPhase] || [];
    
    return suggestions.filter(suggestion => 
      !recentTypes.includes(suggestion.type)
    ).slice(0, 2);
  }

  /**
   * Génère une guidance d'observation contextuelle
   */
  static getObservationGuidance(currentPhase, intelligence, engagementLevel) {
    const observationPatterns = intelligence?.observationPatterns;
    
    if (!observationPatterns) {
      return {
        message: "Commence à observer tes ressentis pour personnaliser ton expérience",
        confidence: 0,
        mode: CYCLE_MODES.PREDICTIVE
      };
    }

    const { consistency, totalObservations, confidence } = observationPatterns;

    // Guidance selon progression
    if (totalObservations < 5) {
      return {
        message: "Continue d'observer pour que j'apprenne tes patterns uniques",
        confidence: confidence || 0,
        mode: CYCLE_MODES.PREDICTIVE,
        nextStep: "Ajoute quelques observations de plus"
      };
    }

    if (totalObservations >= 5 && consistency > 0.4) {
      return {
        message: "Je commence à voir tes patterns ! Mode hybride activé",
        confidence: confidence || 0,
        mode: CYCLE_MODES.HYBRID,
        nextStep: "Continues pour encore plus de précision"
      };
    }

    if (totalObservations >= 20 && consistency > 0.7) {
      return {
        message: "Je me base maintenant sur tes ressentis uniques",
        confidence: confidence || 0,
        mode: CYCLE_MODES.OBSERVATION,
        nextStep: "Tu connais ton corps mieux que quiconque"
      };
    }

    return {
      message: "J'apprends de tes observations pour t'accompagner",
      confidence: confidence || 0,
      mode: CYCLE_MODES.PREDICTIVE
    };
  }

  /**
   * Détecte et traite une correction de prédiction
   */
  static detectPredictionCorrection(observedPhase, predictedPhase, intelligence) {
    if (observedPhase !== predictedPhase) {
      intelligence.trackAutonomySignal('corrects_prediction', {
        observed: observedPhase,
        predicted: predictedPhase,
        timestamp: Date.now()
      });
      
      return {
        correctionDetected: true,
        message: "Merci pour cette correction ! J'apprends de tes observations"
      };
    }
    
    return { correctionDetected: false };
  }

  /**
   * Génère des prompts d'observation intelligents
   */
  static getIntelligentObservationPrompts(currentPhase, observationHistory = []) {
    const basePrompts = this.getSuggestedObservations(currentPhase, observationHistory);
    
    // Adapter selon historique
    const hasSymptomFocus = observationHistory.some(obs => obs.symptoms?.length > 0);
    const hasMoodFocus = observationHistory.some(obs => obs.mood);
    const hasEnergyFocus = observationHistory.some(obs => obs.energy);

    // Encourager diversité d'observation
    if (!hasSymptomFocus) {
      basePrompts.unshift({
        prompt: "Ressens-tu des sensations physiques particulières ?",
        type: 'symptoms',
        focus: ['physical', 'body_awareness'],
        icon: '🎯',
        priority: 'high'
      });
    }

    if (!hasMoodFocus) {
      basePrompts.unshift({
        prompt: "Comment décrirais-tu ton état émotionnel ?",
        type: 'mood',
        focus: ['emotional', 'feelings'],
        icon: '💝',
        priority: 'high'
      });
    }

    return basePrompts.slice(0, 3);
  }

  /**
   * Analyse la qualité d'une observation
   */
  static analyzeObservationQuality(observation) {
    let qualityScore = 0;
    const feedback = [];

    // Scoring détail
    if (observation.symptoms?.length > 0) {
      qualityScore += 30;
      feedback.push("Bien détaillé physiquement");
    }

    if (observation.mood) {
      qualityScore += 25;
      feedback.push("État émotionnel noté");
    }

    if (observation.energy) {
      qualityScore += 25;
      feedback.push("Niveau d'énergie capturé");
    }

    if (observation.notes && observation.notes.length > 10) {
      qualityScore += 20;
      feedback.push("Notes personnelles riches");
    }

    return {
      score: qualityScore,
      quality: qualityScore > 60 ? 'excellent' : qualityScore > 30 ? 'good' : 'basic',
      feedback: feedback.join(", "),
      suggestions: this.getQualityImprovementSuggestions(qualityScore)
    };
  }

  /**
   * Suggestions pour améliorer la qualité d'observation
   */
  static getQualityImprovementSuggestions(currentScore) {
    if (currentScore > 70) {
      return ["Parfait ! Continue comme ça"];
    }

    const suggestions = [];
    if (currentScore < 30) suggestions.push("Ajoute quelques détails sur ton ressenti physique");
    if (currentScore < 50) suggestions.push("Note ton humeur du moment");
    if (currentScore < 70) suggestions.push("Décris ton niveau d'énergie");

    return suggestions;
  }
}

export default CycleObservationEngine;