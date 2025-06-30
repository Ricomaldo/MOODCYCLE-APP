//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/services/CycleObservationEngine.test.js
// 🧩 Type : Test Unitaire Service Moteur Observations
// 📚 Description : Tests complets du moteur d'observations (patterns, guidance, qualité, learning)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation moteur observations critique
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import CycleObservationEngine from '../../../src/services/CycleObservationEngine';

// Mock dependencies
jest.mock('../../../src/utils/cycleCalculations', () => ({
  CYCLE_MODES: {
    PREDICTIVE: 'predictive',
    HYBRID: 'hybrid',
    OBSERVATION: 'observation'
  }
}));

describe('🔍 CycleObservationEngine - Tests Complets', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────
  // 💡 TESTS SUGGESTIONS OBSERVATIONS
  // ──────────────────────────────────────────────────────

  describe('Observation Suggestions', () => {
    test('✅ devrait générer des suggestions pour phase menstruelle', () => {
      const suggestions = CycleObservationEngine.getSuggestedObservations('menstrual');
      
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].type).toBe('symptoms');
      expect(suggestions[0].focus).toContain('cramps');
      expect(suggestions[0].icon).toBe('🌙');
      expect(suggestions[1].type).toBe('energy');
      expect(suggestions[1].focus).toContain('rest');
    });

    test('✅ devrait générer des suggestions pour phase folliculaire', () => {
      const suggestions = CycleObservationEngine.getSuggestedObservations('follicular');
      
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].type).toBe('energy');
      expect(suggestions[0].focus).toContain('rising');
      expect(suggestions[0].icon).toBe('🌱');
      expect(suggestions[1].type).toBe('mood');
      expect(suggestions[1].focus).toContain('creativity');
    });

    test('✅ devrait générer des suggestions pour phase ovulatoire', () => {
      const suggestions = CycleObservationEngine.getSuggestedObservations('ovulatory');
      
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].type).toBe('mood');
      expect(suggestions[0].focus).toContain('confidence');
      expect(suggestions[0].icon).toBe('☀️');
      expect(suggestions[1].type).toBe('energy');
      expect(suggestions[1].focus).toContain('peak');
    });

    test('✅ devrait générer des suggestions pour phase lutéale', () => {
      const suggestions = CycleObservationEngine.getSuggestedObservations('luteal');
      
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].type).toBe('mood');
      expect(suggestions[0].focus).toContain('sensitivity');
      expect(suggestions[0].icon).toBe('🍂');
      expect(suggestions[1].type).toBe('symptoms');
      expect(suggestions[1].focus).toContain('pms');
    });

    test('✅ devrait éviter les observations récentes similaires', () => {
      const lastObservations = [
        { type: 'symptoms', content: 'Cramps légers' },
        { type: 'energy', content: 'Fatigue' }
      ];
      
      const suggestions = CycleObservationEngine.getSuggestedObservations('menstrual', lastObservations);
      
      // Ne devrait pas suggérer symptoms et energy déjà observés
      const suggestionTypes = suggestions.map(s => s.type);
      expect(suggestionTypes).not.toContain('symptoms');
      expect(suggestionTypes).not.toContain('energy');
    });

    test('✅ devrait gérer les phases invalides', () => {
      const suggestions = CycleObservationEngine.getSuggestedObservations('invalid_phase');
      
      expect(suggestions).toEqual([]);
    });

    test('✅ devrait limiter le nombre de suggestions', () => {
      const suggestions = CycleObservationEngine.getSuggestedObservations('menstrual');
      
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🎯 TESTS GUIDANCE OBSERVATION
  // ──────────────────────────────────────────────────────

  describe('Observation Guidance', () => {
    test('✅ devrait retourner une guidance pour débutant', () => {
      const intelligence = {
        observationPatterns: {
          totalObservations: 2,
          consistency: 0.3,
          confidence: 0.2
        }
      };
      
      const guidance = CycleObservationEngine.getObservationGuidance('menstrual', intelligence, 'discovery');
      
      expect(guidance.message).toContain('Continue d\'observer');
      expect(guidance.confidence).toBe(0.2);
      expect(guidance.mode).toBe('predictive');
      expect(guidance.nextStep).toBeDefined();
    });

    test('✅ devrait retourner une guidance pour intermédiaire', () => {
      const intelligence = {
        observationPatterns: {
          totalObservations: 8,
          consistency: 0.6,
          confidence: 0.5
        }
      };
      
      const guidance = CycleObservationEngine.getObservationGuidance('follicular', intelligence, 'learning');
      
      expect(guidance.message).toContain('Mode hybride activé');
      expect(guidance.confidence).toBe(0.5);
      expect(guidance.mode).toBe('hybrid');
      expect(guidance.nextStep).toBeDefined();
    });

    test('✅ devrait retourner une guidance pour avancé', () => {
      const intelligence = {
        observationPatterns: {
          totalObservations: 25,
          consistency: 0.8,
          confidence: 0.9
        }
      };
      
      const guidance = CycleObservationEngine.getObservationGuidance('ovulatory', intelligence, 'autonomous');
      
      expect(guidance.message).toContain('tes ressentis uniques');
      expect(guidance.confidence).toBe(0.9);
      expect(guidance.mode).toBe('observation');
      expect(guidance.nextStep).toBeDefined();
    });

    test('✅ devrait gérer l\'absence de patterns d\'observation', () => {
      const guidance = CycleObservationEngine.getObservationGuidance('menstrual', null, 'discovery');
      
      expect(guidance.message).toContain('Commence à observer');
      expect(guidance.confidence).toBe(0);
      expect(guidance.mode).toBe('predictive');
    });

    test('✅ devrait gérer les données partielles', () => {
      const intelligence = {
        observationPatterns: {
          totalObservations: 10,
          consistency: null,
          confidence: undefined
        }
      };
      
      const guidance = CycleObservationEngine.getObservationGuidance('luteal', intelligence, 'learning');
      
      expect(guidance.confidence).toBe(0);
      expect(guidance.mode).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS DÉTECTION CORRECTIONS
  // ──────────────────────────────────────────────────────

  describe('Prediction Correction Detection', () => {
    test('✅ devrait détecter une correction de prédiction', () => {
      const intelligence = {
        trackAutonomySignal: jest.fn()
      };
      
      const result = CycleObservationEngine.detectPredictionCorrection(
        'follicular',
        'menstrual',
        intelligence
      );
      
      expect(result.correctionDetected).toBe(true);
      expect(result.message).toContain('Merci pour cette correction');
      expect(intelligence.trackAutonomySignal).toHaveBeenCalledWith(
        'corrects_prediction',
        expect.objectContaining({
          observed: 'follicular',
          predicted: 'menstrual'
        })
      );
    });

    test('✅ devrait ne pas détecter de correction si phases identiques', () => {
      const intelligence = {
        trackAutonomySignal: jest.fn()
      };
      
      const result = CycleObservationEngine.detectPredictionCorrection(
        'menstrual',
        'menstrual',
        intelligence
      );
      
      expect(result.correctionDetected).toBe(false);
      expect(intelligence.trackAutonomySignal).not.toHaveBeenCalled();
    });

    test('✅ devrait gérer l\'absence d\'intelligence', () => {
      const result = CycleObservationEngine.detectPredictionCorrection(
        'follicular',
        'menstrual',
        null
      );
      
      expect(result.correctionDetected).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────
  // 🧠 TESTS PROMPTS INTELLIGENTS
  // ──────────────────────────────────────────────────────

  describe('Intelligent Observation Prompts', () => {
    test('✅ devrait générer des prompts de base', () => {
      const prompts = CycleObservationEngine.getIntelligentObservationPrompts('menstrual');
      
      expect(prompts).toHaveLength(2);
      expect(prompts[0].type).toBeDefined();
      expect(prompts[0].prompt).toBeDefined();
      expect(prompts[0].icon).toBeDefined();
    });

    test('✅ devrait encourager la diversité d\'observation', () => {
      const observationHistory = [
        { symptoms: ['cramps'], mood: null, energy: null },
        { symptoms: ['fatigue'], mood: null, energy: null }
      ];
      
      const prompts = CycleObservationEngine.getIntelligentObservationPrompts('menstrual', observationHistory);
      
      // Devrait suggérer mood et energy car pas encore observés
      const promptTypes = prompts.map(p => p.type);
      expect(promptTypes).toContain('mood');
      expect(promptTypes).toContain('energy');
    });

    test('✅ devrait prioriser les observations manquantes', () => {
      const observationHistory = [
        { symptoms: ['cramps'], mood: 'tired', energy: null }
      ];
      
      const prompts = CycleObservationEngine.getIntelligentObservationPrompts('follicular', observationHistory);
      
      // Devrait prioriser energy car pas encore observé
      const energyPrompt = prompts.find(p => p.type === 'energy');
      expect(energyPrompt).toBeDefined();
      expect(energyPrompt.priority).toBe('high');
    });

    test('✅ devrait limiter le nombre de prompts', () => {
      const prompts = CycleObservationEngine.getIntelligentObservationPrompts('ovulatory');
      
      expect(prompts.length).toBeLessThanOrEqual(3);
    });

    test('✅ devrait gérer l\'historique vide', () => {
      const prompts = CycleObservationEngine.getIntelligentObservationPrompts('luteal', []);
      
      expect(prompts).toBeDefined();
      expect(Array.isArray(prompts)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────
  // 📊 TESTS ANALYSE QUALITÉ
  // ──────────────────────────────────────────────────────

  describe('Observation Quality Analysis', () => {
    test('✅ devrait analyser une observation de haute qualité', () => {
      const observation = {
        feeling: 4,
        energy: 3,
        notes: 'Fatigue légère mais énergie stable. Sensation de repos nécessaire.',
        symptoms: ['fatigue', 'sensibilité'],
        mood: 'calme',
        timestamp: Date.now()
      };
      
      const quality = CycleObservationEngine.analyzeObservationQuality(observation);
      
      expect(quality.score).toBeGreaterThan(0.7);
      expect(quality.details).toBeDefined();
      expect(quality.suggestions).toBeDefined();
    });

    test('✅ devrait analyser une observation de qualité moyenne', () => {
      const observation = {
        feeling: 3,
        energy: 3,
        notes: 'OK',
        symptoms: [],
        mood: null,
        timestamp: Date.now()
      };
      
      const quality = CycleObservationEngine.analyzeObservationQuality(observation);
      
      expect(quality.score).toBeGreaterThan(0.3);
      expect(quality.score).toBeLessThan(0.7);
      expect(quality.suggestions).toHaveLength(1);
    });

    test('✅ devrait analyser une observation de faible qualité', () => {
      const observation = {
        feeling: null,
        energy: null,
        notes: '',
        symptoms: [],
        mood: null,
        timestamp: Date.now()
      };
      
      const quality = CycleObservationEngine.analyzeObservationQuality(observation);
      
      expect(quality.score).toBeLessThan(0.3);
      expect(quality.suggestions).toHaveLength(2);
    });

    test('✅ devrait valoriser les notes détaillées', () => {
      const observationWithNotes = {
        feeling: 3,
        energy: 3,
        notes: 'Description très détaillée de mes ressentis avec contexte émotionnel',
        symptoms: ['fatigue'],
        mood: 'contemplative',
        timestamp: Date.now()
      };
      
      const observationWithoutNotes = {
        feeling: 3,
        energy: 3,
        notes: '',
        symptoms: ['fatigue'],
        mood: 'contemplative',
        timestamp: Date.now()
      };
      
      const qualityWithNotes = CycleObservationEngine.analyzeObservationQuality(observationWithNotes);
      const qualityWithoutNotes = CycleObservationEngine.analyzeObservationQuality(observationWithoutNotes);
      
      expect(qualityWithNotes.score).toBeGreaterThan(qualityWithoutNotes.score);
    });

    test('✅ devrait valoriser la diversité des données', () => {
      const diverseObservation = {
        feeling: 4,
        energy: 2,
        notes: 'Fatigue mais humeur positive',
        symptoms: ['fatigue', 'sensibilité'],
        mood: 'positive',
        timestamp: Date.now()
      };
      
      const limitedObservation = {
        feeling: 3,
        energy: null,
        notes: '',
        symptoms: [],
        mood: null,
        timestamp: Date.now()
      };
      
      const diverseQuality = CycleObservationEngine.analyzeObservationQuality(diverseObservation);
      const limitedQuality = CycleObservationEngine.analyzeObservationQuality(limitedObservation);
      
      expect(diverseQuality.score).toBeGreaterThan(limitedQuality.score);
    });
  });

  // ──────────────────────────────────────────────────────
  // 💡 TESTS SUGGESTIONS AMÉLIORATION
  // ──────────────────────────────────────────────────────

  describe('Quality Improvement Suggestions', () => {
    test('✅ devrait suggérer des améliorations pour score faible', () => {
      const suggestions = CycleObservationEngine.getQualityImprovementSuggestions(0.2);
      
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toContain('détailler');
      expect(suggestions[1]).toContain('ressentis');
    });

    test('✅ devrait suggérer des améliorations pour score moyen', () => {
      const suggestions = CycleObservationEngine.getQualityImprovementSuggestions(0.5);
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toContain('enrichir');
    });

    test('✅ devrait féliciter pour score élevé', () => {
      const suggestions = CycleObservationEngine.getQualityImprovementSuggestions(0.9);
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toContain('excellent');
    });

    test('✅ devrait gérer les scores invalides', () => {
      const suggestions = CycleObservationEngine.getQualityImprovementSuggestions(-1);
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🧮 TESTS CALCULS CONFIANCE
  // ──────────────────────────────────────────────────────

  describe('Confidence Calculations', () => {
    test('✅ devrait calculer la confiance basée sur la cohérence', () => {
      const intelligence = {
        observationPatterns: {
          consistency: 0.8,
          totalObservations: 15,
          phaseAccuracy: 0.9
        }
      };
      
      const guidance = CycleObservationEngine.getObservationGuidance('menstrual', intelligence, 'autonomous');
      
      expect(guidance.confidence).toBe(0.8);
    });

    test('✅ devrait ajuster la confiance selon le niveau d\'engagement', () => {
      const intelligence = {
        observationPatterns: {
          consistency: 0.6,
          totalObservations: 10,
          userEngagement: 0.7
        }
      };
      
      const guidance = CycleObservationEngine.getObservationGuidance('follicular', intelligence, 'learning');
      
      expect(guidance.confidence).toBeGreaterThan(0);
      expect(guidance.confidence).toBeLessThanOrEqual(1);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS GESTION ERREURS
  // ──────────────────────────────────────────────────────

  describe('Error Handling', () => {
    test('✅ devrait gérer les données d\'observation invalides', () => {
      const quality = CycleObservationEngine.analyzeObservationQuality(null);
      
      expect(quality.score).toBe(0);
      expect(quality.details).toBeDefined();
    });

    test('✅ devrait gérer les données d\'intelligence corrompues', () => {
      const intelligence = {
        observationPatterns: {
          consistency: 'invalid',
          totalObservations: -5,
          confidence: 1.5
        }
      };
      
      const guidance = CycleObservationEngine.getObservationGuidance('menstrual', intelligence, 'discovery');
      
      expect(guidance).toBeDefined();
      expect(guidance.confidence).toBe(0);
    });

    test('✅ devrait gérer les phases invalides dans les suggestions', () => {
      const suggestions = CycleObservationEngine.getSuggestedObservations('invalid_phase');
      
      expect(suggestions).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────────────
  // ⚡ TESTS PERFORMANCE
  // ──────────────────────────────────────────────────────

  describe('Performance', () => {
    test('⚡ devrait générer rapidement des suggestions', () => {
      const start = performance.now();
      
      CycleObservationEngine.getSuggestedObservations('menstrual');
      
      const end = performance.now();
      expect(end - start).toBeLessThan(10); // < 10ms
    });

    test('⚡ devrait analyser rapidement la qualité', () => {
      const observation = {
        feeling: 4,
        energy: 3,
        notes: 'Test observation',
        symptoms: ['fatigue'],
        mood: 'calme',
        timestamp: Date.now()
      };
      
      const start = performance.now();
      
      CycleObservationEngine.analyzeObservationQuality(observation);
      
      const end = performance.now();
      expect(end - start).toBeLessThan(5); // < 5ms
    });

    test('⚡ devrait traiter rapidement les corrections', () => {
      const intelligence = { trackAutonomySignal: jest.fn() };
      
      const start = performance.now();
      
      CycleObservationEngine.detectPredictionCorrection('follicular', 'menstrual', intelligence);
      
      const end = performance.now();
      expect(end - start).toBeLessThan(1); // < 1ms
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS INTÉGRATION
  // ──────────────────────────────────────────────────────

  describe('Integration', () => {
    test('✅ devrait intégrer toutes les fonctionnalités', () => {
      const intelligence = {
        observationPatterns: {
          totalObservations: 12,
          consistency: 0.7,
          confidence: 0.8
        },
        trackAutonomySignal: jest.fn()
      };
      
      const observationHistory = [
        { symptoms: ['cramps'], mood: 'tired', energy: 2 },
        { symptoms: ['fatigue'], mood: 'calm', energy: 3 }
      ];
      
      // Test complet du workflow
      const suggestions = CycleObservationEngine.getIntelligentObservationPrompts('menstrual', observationHistory);
      const guidance = CycleObservationEngine.getObservationGuidance('menstrual', intelligence, 'learning');
      const correction = CycleObservationEngine.detectPredictionCorrection('follicular', 'menstrual', intelligence);
      
      expect(suggestions).toBeDefined();
      expect(guidance).toBeDefined();
      expect(correction).toBeDefined();
      expect(intelligence.trackAutonomySignal).toHaveBeenCalled();
    });
  });
}); 