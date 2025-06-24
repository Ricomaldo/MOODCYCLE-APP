// ═══════════════════════════════════════════════════════════
// 📊 useEngagementStore.js - Tracking Progression Utilisateur
// ═══════════════════════════════════════════════════════════

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useEngagementStore = create(
  persist(
    (set, get) => ({
      // ───────────────────────────────────────────────────────
      // 📈 MÉTRIQUES ENGAGEMENT
      // ───────────────────────────────────────────────────────
      
      metrics: {
        // Utilisation globale
        daysUsed: 0,
        sessionsCount: 0,
        totalTimeSpent: 0, // minutes
        lastActiveDate: null,
        
        // Actions spécifiques
        conversationsStarted: 0,
        conversationsCompleted: 0,
        notebookEntriesCreated: 0,
        cycleTrackedDays: 0,
        insightsSaved: 0,
        vignettesEngaged: 0,
        
        // Progression cyclique
        phasesExplored: [], // ['menstrual', 'follicular']
        cyclesCompleted: 0,
        autonomySignals: 0, // Indique comportements autonomes
      },
      
      // ───────────────────────────────────────────────────────
      // 🎓 NIVEAUX MATURITÉ
      // ───────────────────────────────────────────────────────
      
      maturity: {
        current: 'discovery', // 'discovery' | 'learning' | 'autonomous'
        confidence: 0, // 0-100
        lastCalculated: null,
        
        // Seuils progression (méthodologie Jeza)
        thresholds: {
          discovery: { days: 0, conversations: 0, entries: 0 },
          learning: { days: 7, conversations: 3, entries: 2 },
          autonomous: { days: 21, conversations: 10, entries: 8, cycles: 1 }
        }
      },
      
      // ───────────────────────────────────────────────────────
      // 🎯 ACTIONS TRACKING
      // ───────────────────────────────────────────────────────
      
      trackAction: (actionType, metadata = {}) => {
        const now = Date.now();
        const today = new Date().toDateString();
        
        set(state => {
          const newMetrics = { ...state.metrics };
          
          // Update session tracking
          if (state.metrics.lastActiveDate !== today) {
            newMetrics.daysUsed += 1;
            newMetrics.sessionsCount += 1;
            newMetrics.lastActiveDate = today;
          }
          
          // Action-specific tracking
          switch (actionType) {
            case 'conversation_started':
              newMetrics.conversationsStarted += 1;
              break;
            case 'conversation_completed':
              newMetrics.conversationsCompleted += 1;
              break;
            case 'notebook_entry':
              newMetrics.notebookEntriesCreated += 1;
              break;
            case 'cycle_day_tracked':
              newMetrics.cycleTrackedDays += 1;
              break;
            case 'insight_saved':
              newMetrics.insightsSaved += 1;
              break;
            case 'vignette_engaged':
              newMetrics.vignettesEngaged += 1;
              break;
            case 'phase_explored':
              if (!newMetrics.phasesExplored.includes(metadata.phase)) {
                newMetrics.phasesExplored.push(metadata.phase);
              }
              break;
            case 'autonomy_signal':
              // Utilisatrice fait des liens phase ↔ ressenti
              newMetrics.autonomySignals += 1;
              break;
          }
          
          return { metrics: newMetrics };
        });
        
        // Recalcul maturité après action
        get().calculateMaturity();
      },
      
      // ───────────────────────────────────────────────────────
      // 🧮 CALCUL MATURITÉ
      // ───────────────────────────────────────────────────────
      
      calculateMaturity: () => {
        const { metrics } = get();
        const { thresholds } = get().maturity;
        
        let newLevel = 'discovery';
        let confidence = 0;
        
        // Calcul niveau basé sur seuils
        if (
          metrics.daysUsed >= thresholds.autonomous.days &&
          metrics.conversationsStarted >= thresholds.autonomous.conversations &&
          metrics.notebookEntriesCreated >= thresholds.autonomous.entries &&
          metrics.cyclesCompleted >= thresholds.autonomous.cycles
        ) {
          newLevel = 'autonomous';
          confidence = Math.min(100, 70 + metrics.autonomySignals * 10);
        } else if (
          metrics.daysUsed >= thresholds.learning.days &&
          metrics.conversationsStarted >= thresholds.learning.conversations &&
          metrics.notebookEntriesCreated >= thresholds.learning.entries
        ) {
          newLevel = 'learning';
          confidence = Math.min(100, 40 + metrics.phasesExplored.length * 15);
        } else {
          newLevel = 'discovery';
          confidence = Math.min(100, metrics.daysUsed * 10);
        }
        
        set(state => ({
          maturity: {
            ...state.maturity,
            current: newLevel,
            confidence,
            lastCalculated: Date.now()
          }
        }));
        
        return { level: newLevel, confidence };
      },
      
      // ───────────────────────────────────────────────────────
      // 📊 GETTERS UTILES
      // ───────────────────────────────────────────────────────
      
      getEngagementScore: () => {
        const { metrics } = get();
        
        // Score composite 0-100
        const weights = {
          consistency: metrics.daysUsed * 5, // max 30j = 150pts
          depth: metrics.conversationsCompleted * 10, // max 15 = 150pts
          breadth: metrics.phasesExplored.length * 25, // max 4 = 100pts
          autonomy: metrics.autonomySignals * 20 // bonus autonomie
        };
        
        const total = Object.values(weights).reduce((sum, val) => sum + val, 0);
        return Math.min(100, Math.round(total / 4));
      },
      
      getNextMilestone: () => {
        const { metrics, maturity } = get();
        const currentLevel = maturity.current;
        
        if (currentLevel === 'autonomous') return null;
        
        const nextThresholds = maturity.thresholds[
          currentLevel === 'discovery' ? 'learning' : 'autonomous'
        ];
        
        return {
          level: currentLevel === 'discovery' ? 'learning' : 'autonomous',
          missing: {
            days: Math.max(0, nextThresholds.days - metrics.daysUsed),
            conversations: Math.max(0, nextThresholds.conversations - metrics.conversationsStarted),
            entries: Math.max(0, nextThresholds.entries - metrics.notebookEntriesCreated),
            cycles: nextThresholds.cycles ? Math.max(0, nextThresholds.cycles - metrics.cyclesCompleted) : 0
          }
        };
      },
      
      // ───────────────────────────────────────────────────────
      // 🔄 UTILITIES
      // ───────────────────────────────────────────────────────
      
      resetEngagement: () => set({
        metrics: {
          daysUsed: 0, sessionsCount: 0, totalTimeSpent: 0,
          lastActiveDate: null, conversationsStarted: 0, conversationsCompleted: 0,
          notebookEntriesCreated: 0, cycleTrackedDays: 0, insightsSaved: 0,
          vignettesEngaged: 0, phasesExplored: [], cyclesCompleted: 0,
          autonomySignals: 0
        },
        maturity: {
          current: 'discovery', confidence: 0, lastCalculated: null,
          thresholds: {
            discovery: { days: 0, conversations: 0, entries: 0 },
            learning: { days: 7, conversations: 3, entries: 2 },
            autonomous: { days: 21, conversations: 10, entries: 8, cycles: 1 }
          }
        }
      }),
      
    }),
    { 
      name: "engagement-storage", 
      storage: createJSONStorage(() => AsyncStorage),
      // Optimisation : ne persist que les métriques, pas les fonctions
      partialize: (state) => ({
        metrics: {
          // Persister seulement les métriques essentielles
          daysUsed: state.metrics.daysUsed,
          sessionsCount: state.metrics.sessionsCount,
          lastActiveDate: state.metrics.lastActiveDate,
          cyclesCompleted: state.metrics.cyclesCompleted,
          autonomySignals: state.metrics.autonomySignals,
        },
        maturity: state.maturity
      })
    }
  )
);

// ═══════════════════════════════════════════════════════════
// 🎯 USAGE EXEMPLES
// ═══════════════════════════════════════════════════════════

/*
// Dans Chat.jsx
const { trackAction } = useEngagementStore();

const handleSendMessage = () => {
  trackAction('conversation_started');
  // ... logique chat
};

// Dans Notebook.jsx  
const handleCreateEntry = () => {
  trackAction('notebook_entry');
  // ... logique création
};

// Dans CycleView.jsx
const handlePhaseClick = (phase) => {
  trackAction('phase_explored', { phase });
  // ... navigation détail
};

// Signal autonomie (quand utilisatrice fait lien cycle ↔ ressenti)
const handleAutonomySignal = () => {
  trackAction('autonomy_signal');
};
*/