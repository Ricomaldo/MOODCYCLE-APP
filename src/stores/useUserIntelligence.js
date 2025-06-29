// ═══════════════════════════════════════════════════════════
// 📊 useUserIntelligence.js - Store Apprentissage Comportemental
// ═══════════════════════════════════════════════════════════

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useUserIntelligence = create(
  persist(
    (set, get) => ({
      // ───────────────────────────────────────────────────────
      // 🧠 APPRENTISSAGE COMPORTEMENTAL
      // ───────────────────────────────────────────────────────
      learning: {
        // Confiance globale système (0-100)
        confidence: 0,
        
        // Patterns temporels découverts
        timePatterns: {
          favoriteHours: [], // [8, 14, 20] - heures interaction préférées
          activeDays: [],    // ['monday', 'wednesday'] - jours actifs
          sessionDuration: 5 // minutes moyenne session
        },
        
        // Préférences conversationnelles apprises
        conversationPrefs: {
          responseLength: 'medium', // 'short' | 'medium' | 'long'
          questionTypes: [],        // ['emotional', 'practical', 'cycle']
          successfulPrompts: [],    // Prompts qui ont généré engagement
          avoidedTopics: []         // Topics ignorés/abandonnés
        },
        
        // Patterns phases cycliques
        phasePatterns: {
          menstrual: { mood: null, energy: null, topics: [] },
          follicular: { mood: null, energy: null, topics: [] },
          ovulatory: { mood: null, energy: null, topics: [] },
          luteal: { mood: null, energy: null, topics: [] }
        },
        
        // Efficacité suggestions
        suggestionEffectiveness: {
          chat: { shown: 0, clicked: 0, rate: 0 },
          notebook: { shown: 0, clicked: 0, rate: 0 },
          phase_detail: { shown: 0, clicked: 0, rate: 0 }
        }
      },

      // ───────────────────────────────────────────────────────
      // 🔄 OBSERVATION PATTERNS (NOUVEAU)
      // ───────────────────────────────────────────────────────
      observationPatterns: {
        // Cohérence des observations (0-1)
        consistency: 0,
        
        // Confiance dans les patterns détectés (0-100)
        confidence: 0,
        
        // Mode préféré par utilisatrice
        preferredMode: null, // 'predictive' | 'hybrid' | 'observation' | null
        
        // Historique observations récentes
        lastObservations: [], // Max 30 dernières
        
        // Patterns détectés par phase
        phasePatterns: {
          menstrual: { 
            typicalSymptoms: [], 
            typicalMoods: [], 
            typicalEnergy: null,
            occurrences: 0 
          },
          follicular: { 
            typicalSymptoms: [], 
            typicalMoods: [], 
            typicalEnergy: null,
            occurrences: 0 
          },
          ovulatory: { 
            typicalSymptoms: [], 
            typicalMoods: [], 
            typicalEnergy: null,
            occurrences: 0 
          },
          luteal: { 
            typicalSymptoms: [], 
            typicalMoods: [], 
            typicalEnergy: null,
            occurrences: 0 
          }
        },
        
        // Signaux d'auto-observation
        autonomySignals: {
          correctsPredictions: 0,    // Fois où elle corrige la phase prédite
          manualPhaseChanges: 0,     // Changements manuels de phase
          detailedObservations: 0,   // Observations très détaillées
          patternRecognitions: 0     // Elle identifie ses patterns
        },
        
        // Métadonnées
        lastAnalyzed: null,
        totalObservations: 0
      },

      // ───────────────────────────────────────────────────────
      // 📈 TRACKING INTERACTIONS
      // ───────────────────────────────────────────────────────
      
      trackInteraction: (type, data = {}) => {
        const now = new Date();
        const hour = now.getHours();
        const day = now.toLocaleDateString('en', { weekday: 'lowercase' });
        
        set(state => {
          const newLearning = { ...state.learning };
          
          // Mise à jour patterns temporels
          if (!newLearning.timePatterns.favoriteHours.includes(hour)) {
            newLearning.timePatterns.favoriteHours.push(hour);
            newLearning.timePatterns.favoriteHours.sort((a, b) => a - b);
          }
          
          if (!newLearning.timePatterns.activeDays.includes(day)) {
            newLearning.timePatterns.activeDays.push(day);
          }
          
          // Tracking spécifique par type
          switch (type) {
            case 'conversation_start':
              if (data.prompt) {
                newLearning.conversationPrefs.successfulPrompts.push({
                  prompt: data.prompt,
                  timestamp: now.toISOString(),
                  phase: data.phase
                });
              }
              break;
              
            case 'conversation_abandon':
              if (data.topic) {
                newLearning.conversationPrefs.avoidedTopics.push(data.topic);
              }
              break;
              
            case 'phase_mood_tracked':
              if (data.phase && data.mood) {
                newLearning.phasePatterns[data.phase].mood = data.mood;
              }
              break;
              
            case 'phase_topic_explored':
              if (data.phase && data.topic) {
                if (!newLearning.phasePatterns[data.phase].topics.includes(data.topic)) {
                  newLearning.phasePatterns[data.phase].topics.push(data.topic);
                }
              }
              break;
          }
          
          return { learning: newLearning };
        });
        
        // Recalcul confiance après chaque interaction
        get().updateConfidence();
      },

      // ───────────────────────────────────────────────────────
      // 🎯 TRACKING EFFICACITÉ SUGGESTIONS
      // ───────────────────────────────────────────────────────
      
      trackSuggestionShown: (actionType) => {
        set(state => {
          const newLearning = { ...state.learning };
          const suggestion = newLearning.suggestionEffectiveness[actionType];
          if (suggestion) {
            suggestion.shown += 1;
            suggestion.rate = suggestion.clicked / suggestion.shown;
          }
          return { learning: newLearning };
        });
      },
      
      trackSuggestionClicked: (actionType) => {
        set(state => {
          const newLearning = { ...state.learning };
          const suggestion = newLearning.suggestionEffectiveness[actionType];
          if (suggestion) {
            suggestion.clicked += 1;
            suggestion.rate = suggestion.clicked / suggestion.shown;
          }
          return { learning: newLearning };
        });
      },

      // ───────────────────────────────────────────────────────
      // 📝 TRACKING OBSERVATIONS
      // ───────────────────────────────────────────────────────
      
      trackObservation: (observation) => {
        const now = Date.now();
        
        set(state => {
          const newObservationPatterns = { ...state.observationPatterns };
          
          // Ajouter observation à l'historique
          const newObservation = {
            id: `obs_${now}`,
            timestamp: now,
            ...observation,
            // Enrichir avec contexte si disponible
            deviceTime: new Date().toISOString(),
            dayOfWeek: new Date().getDay()
          };
          
          newObservationPatterns.lastObservations = [
            newObservation,
            ...newObservationPatterns.lastObservations
          ].slice(0, 30); // Garder max 30
          
          newObservationPatterns.totalObservations += 1;
          
          // Analyser patterns si phase fournie
          if (observation.phase && observation.phase !== 'unknown') {
            const phasePattern = newObservationPatterns.phasePatterns[observation.phase];
            if (phasePattern) {
              phasePattern.occurrences += 1;
              
              // Accumuler symptômes typiques
              if (observation.symptoms?.length > 0) {
                observation.symptoms.forEach(symptom => {
                  if (!phasePattern.typicalSymptoms.includes(symptom)) {
                    phasePattern.typicalSymptoms.push(symptom);
                  }
                });
              }
              
              // Accumuler moods typiques
              if (observation.mood) {
                if (!phasePattern.typicalMoods.includes(observation.mood)) {
                  phasePattern.typicalMoods.push(observation.mood);
                }
              }
              
              // Tracker énergie dominante
              if (observation.energy) {
                phasePattern.typicalEnergy = observation.energy;
              }
            }
          }
          
          return { observationPatterns: newObservationPatterns };
        });
        
        // Recalculer consistance après ajout
        get().updateObservationConsistency();
      },

      // ───────────────────────────────────────────────────────
      // 🎯 TRACKING SIGNAUX AUTONOMIE
      // ───────────────────────────────────────────────────────
      
      trackAutonomySignal: (signalType, metadata = {}) => {
        set(state => {
          const newObservationPatterns = { ...state.observationPatterns };
          const signals = newObservationPatterns.autonomySignals;
          
          switch (signalType) {
            case 'corrects_prediction':
              signals.correctsPredictions += 1;
              break;
            case 'manual_phase_change':
              signals.manualPhaseChanges += 1;
              break;
            case 'detailed_observation':
              signals.detailedObservations += 1;
              break;
            case 'pattern_recognition':
              signals.patternRecognitions += 1;
              break;
          }
          
          return { observationPatterns: newObservationPatterns };
        });
      },

      // ───────────────────────────────────────────────────────
      // 📊 ANALYSE CONSISTANCE
      // ───────────────────────────────────────────────────────
      
      updateObservationConsistency: () => {
        set(state => {
          const { lastObservations, phasePatterns } = state.observationPatterns;
          
          if (lastObservations.length < 5) {
            return state; // Pas assez de données
          }
          
          // Calculer consistance basée sur régularité des patterns
          let consistencyScore = 0;
          let factors = 0;
          
          // Facteur 1: Régularité des observations
          const daysSinceFirst = Math.floor(
            (Date.now() - lastObservations[lastObservations.length - 1].timestamp) / 
            (1000 * 60 * 60 * 24)
          );
          const observationRate = lastObservations.length / Math.max(daysSinceFirst, 1);
          if (observationRate > 0.5) { // Plus d'une obs tous les 2 jours
            consistencyScore += 0.3;
            factors++;
          }
          
          // Facteur 2: Cohérence des patterns par phase
          Object.values(phasePatterns).forEach(pattern => {
            if (pattern.occurrences >= 2 && pattern.typicalSymptoms.length > 0) {
              consistencyScore += 0.1;
              factors++;
            }
          });
          
          // Facteur 3: Signaux d'autonomie
          const totalSignals = Object.values(state.observationPatterns.autonomySignals)
            .reduce((sum, val) => sum + val, 0);
          if (totalSignals > 5) {
            consistencyScore += 0.2;
            factors++;
          }
          
          // Normaliser entre 0 et 1
          const finalConsistency = Math.min(1, consistencyScore);
          const confidence = Math.round(finalConsistency * 100);
          
          return {
            observationPatterns: {
              ...state.observationPatterns,
              consistency: finalConsistency,
              confidence,
              lastAnalyzed: Date.now()
            }
          };
        });
      },

      // ───────────────────────────────────────────────────────
      // 🔄 MODE PRÉFÉRENCE
      // ───────────────────────────────────────────────────────
      
      setPreferredCycleMode: (mode) => {
        set(state => ({
          observationPatterns: {
            ...state.observationPatterns,
            preferredMode: mode
          }
        }));
      },

      // ───────────────────────────────────────────────────────
      // 🧮 CALCUL CONFIANCE SYSTÈME
      // ───────────────────────────────────────────────────────
      
      updateConfidence: () => {
        set(state => {
          const { learning } = state;
          let confidence = 0;
          let factors = 0;
          
          // Facteur 1: Données temporelles (max 25 points)
          if (Array.isArray(learning.timePatterns.favoriteHours) && learning.timePatterns.favoriteHours.length > 0) {
      confidence += Math.min(25, learning.timePatterns.favoriteHours.length * 5);
            factors++;
          }
          
          // Facteur 2: Patterns conversation (max 30 points)
          if (Array.isArray(learning.conversationPrefs.successfulPrompts) && learning.conversationPrefs.successfulPrompts.length > 0) {
      confidence += Math.min(30, learning.conversationPrefs.successfulPrompts.length * 3);
            factors++;
          }
          
          // Facteur 3: Patterns phases (max 25 points)
          const phasesWithData = Object.values(learning.phasePatterns)
            .filter(p => (Array.isArray(p.topics) && p.topics.length > 0) || p.mood !== null).length;
          if (phasesWithData > 0) {
            confidence += Math.min(25, phasesWithData * 6);
            factors++;
          }
          
          // Facteur 4: Efficacité suggestions (max 20 points)
          const avgEffectiveness = Object.values(learning.suggestionEffectiveness)
            .reduce((acc, s) => acc + (s.rate || 0), 0) / 3;
          if (avgEffectiveness > 0) {
            confidence += Math.min(20, avgEffectiveness * 100);
            factors++;
          }
          
          // Normalisation selon nombre de facteurs
          const finalConfidence = factors > 0 ? Math.round(confidence / factors * (factors / 4)) : 0;
          
          return {
            learning: {
              ...learning,
              confidence: Math.min(100, finalConfidence)
            }
          };
        });
      },

      // ───────────────────────────────────────────────────────
      // 📊 GETTERS INTELLIGENCE
      // ───────────────────────────────────────────────────────
      
      getPersonalizedPrompts: (phase, persona) => {
        const { learning } = get();
        
        // Prompts réussis pour cette phase
        const phasePrompts = learning.conversationPrefs.successfulPrompts
          .filter(p => p.phase === phase)
          .map(p => p.prompt);
          
        // Topics populaires pour cette phase
        const phaseTopics = learning.phasePatterns[phase]?.topics || [];
        
        return {
          successfulPrompts: phasePrompts.slice(-3), // 3 derniers
          preferredTopics: phaseTopics.slice(-3),    // 3 derniers
          confidence: learning.confidence
        };
      },
      
      getOptimalInteractionTime: () => {
        const { learning } = get();
        const now = new Date();
        const currentHour = now.getHours();
        
        // Heure favorite la plus proche
        const favorites = learning.timePatterns.favoriteHours;
        if (!Array.isArray(favorites) || favorites.length === 0) return null;
        
        const closest = favorites.reduce((prev, curr) => 
          Math.abs(curr - currentHour) < Math.abs(prev - currentHour) ? curr : prev
        );
        
        return {
          optimalHour: closest,
          isOptimalNow: Math.abs(closest - currentHour) <= 1,
          confidence: learning.confidence
        };
      },
      
      getPhasePersonalization: (phase) => {
        const { learning } = get();
        const phaseData = learning.phasePatterns[phase];
        
        return {
          predictedMood: phaseData?.mood,
          preferredTopics: phaseData?.topics || [],
          dataAvailable: (Array.isArray(phaseData?.topics) && phaseData.topics.length > 0) || phaseData?.mood !== null,
          confidence: learning.confidence
        };
      },

      // ───────────────────────────────────────────────────────
      // 📊 GETTERS OBSERVATION
      // ───────────────────────────────────────────────────────
      
      getObservationReadiness: () => {
        const { observationPatterns } = get();
        
        return {
          hasEnoughData: observationPatterns.totalObservations >= 10,
          hasGoodConsistency: observationPatterns.consistency > 0.6,
          readyForHybrid: observationPatterns.totalObservations >= 5 && 
                         observationPatterns.consistency > 0.4,
          readyForObservation: observationPatterns.totalObservations >= 20 && 
                              observationPatterns.consistency > 0.7,
          confidence: observationPatterns.confidence
        };
      },
      
      getMostObservedPhase: () => {
        const { phasePatterns } = get().observationPatterns;
        
        let maxOccurrences = 0;
        let mostObserved = null;
        
        Object.entries(phasePatterns).forEach(([phase, pattern]) => {
          if (pattern.occurrences > maxOccurrences) {
            maxOccurrences = pattern.occurrences;
            mostObserved = phase;
          }
        });
        
        return {
          phase: mostObserved,
          occurrences: maxOccurrences,
          confidence: maxOccurrences / get().observationPatterns.totalObservations
        };
      },

      // ───────────────────────────────────────────────────────
      // 🔄 UTILITAIRES
      // ───────────────────────────────────────────────────────
      
      exportLearningData: () => {
        const { learning } = get();
        return {
          timestamp: new Date().toISOString(),
          confidence: learning.confidence,
          dataPoints: {
            timePatterns: Array.isArray(learning.timePatterns.favoriteHours) ? learning.timePatterns.favoriteHours.length : 0,
            conversations: Array.isArray(learning.conversationPrefs.successfulPrompts) ? learning.conversationPrefs.successfulPrompts.length : 0,
            phaseData: Object.values(learning.phasePatterns)
              .filter(p => Array.isArray(p.topics) && p.topics.length > 0).length,
            suggestionTracking: Object.values(learning.suggestionEffectiveness)
              .reduce((acc, s) => acc + s.shown, 0)
          },
          learning
        };
      },
      
      resetLearning: () => set({
        learning: {
          confidence: 0,
          timePatterns: { favoriteHours: [], activeDays: [], sessionDuration: 5 },
          conversationPrefs: { 
            responseLength: 'medium', questionTypes: [], 
            successfulPrompts: [], avoidedTopics: [] 
          },
          phasePatterns: {
            menstrual: { mood: null, energy: null, topics: [] },
            follicular: { mood: null, energy: null, topics: [] },
            ovulatory: { mood: null, energy: null, topics: [] },
            luteal: { mood: null, energy: null, topics: [] }
          },
          suggestionEffectiveness: {
            chat: { shown: 0, clicked: 0, rate: 0 },
            notebook: { shown: 0, clicked: 0, rate: 0 },
            phase_detail: { shown: 0, clicked: 0, rate: 0 }
          }
        },
        observationPatterns: {
          consistency: 0,
          confidence: 0,
          preferredMode: null,
          lastObservations: [],
          phasePatterns: {
            menstrual: { typicalSymptoms: [], typicalMoods: [], typicalEnergy: null, occurrences: 0 },
            follicular: { typicalSymptoms: [], typicalMoods: [], typicalEnergy: null, occurrences: 0 },
            ovulatory: { typicalSymptoms: [], typicalMoods: [], typicalEnergy: null, occurrences: 0 },
            luteal: { typicalSymptoms: [], typicalMoods: [], typicalEnergy: null, occurrences: 0 }
          },
          autonomySignals: {
            correctsPredictions: 0,
            manualPhaseChanges: 0,
            detailedObservations: 0,
            patternRecognitions: 0
          },
          lastAnalyzed: null,
          totalObservations: 0
        }
      })
    }),
    {
      name: "user-intelligence-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        learning: state.learning,
        observationPatterns: state.observationPatterns 
      })
    }
  )
);