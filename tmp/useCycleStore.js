import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../config/theme';
import phases from '../data/phases.json';
import { getDaysDifference, calculateCurrentPhase, getCurrentCycleDay } from '../utils/dateUtils.js';

export const useCycleStore = create(
  persist(
    (set, get) => ({
      // Données du cycle actuel
      currentCycle: {
        startDate: null,
        endDate: null,
        length: 28,
        currentDay: 1,
        currentPhase: 'menstrual', // 'menstrual', 'follicular', 'ovulatory', 'luteal'
      },
      
      // Historique des cycles
      cycleHistory: [],
      
      // Prédictions
      predictions: {
        nextPeriod: null,
        nextOvulation: null,
        fertilityWindow: { start: null, end: null },
      },
      
      // Symptômes et sensations
      dailyLogs: {}, // Indexé par date (YYYY-MM-DD)
      
      // Insights personnalisés par phase
      phaseInsights: {
        menstrual: [],
        follicular: [],
        ovulatory: [],
        luteal: [],
      },
      
      // Préférences de suivi
      trackingPreferences: {
        symptoms: true,
        moods: true,
        energy: true,
        intimacy: false,
        temperature: false,
        cervicalMucus: false,
      },
      
      // Actions
      updateCurrentCycle: (cycleData) =>
        set((state) => ({
          currentCycle: { ...state.currentCycle, ...cycleData },
        })),
      
      startNewCycle: (startDate) =>
        set((state) => {
          const newCycle = {
            startDate,
            endDate: null,
            length: state.currentCycle.length,
            currentDay: 1,
            currentPhase: 'menstrual',
          };
          
          return {
            currentCycle: newCycle,
            cycleHistory: [...state.cycleHistory, state.currentCycle].filter(c => c.startDate),
          };
        }),
      
      addDailyLog: (date, logData) =>
        set((state) => ({
          dailyLogs: {
            ...state.dailyLogs,
            [date]: { ...state.dailyLogs[date], ...logData },
          },
        })),
      
      updateTrackingPreferences: (preferences) =>
        set((state) => ({
          trackingPreferences: { ...state.trackingPreferences, ...preferences },
        })),
      
      addPhaseInsight: (phase, insight) =>
        set((state) => ({
          phaseInsights: {
            ...state.phaseInsights,
            [phase]: [...state.phaseInsights[phase], insight],
          },
        })),
      
      // Calculs utilitaires (utilise dateUtils centralisé)
      calculateCurrentPhase: (currentDay, cycleLength = 28, periodLength = 5) => {
        // Convertir currentDay en daysSinceLastPeriod pour utiliser la fonction centralisée
        const daysSinceLastPeriod = currentDay - 1;
        return calculateCurrentPhase(daysSinceLastPeriod, cycleLength, periodLength);
      },
      
      getCurrentPhaseInfo: () => {
        const { currentCycle } = get();
        const phase = currentCycle.currentPhase;
        
        const phaseColors = theme.colors.phases;
        
        // 🎯 SOURCE UNIQUE - Noms depuis phases.json
        const phaseNames = Object.keys(phases).reduce((acc, key) => {
          acc[key] = phases[key].name;
          return acc;
        }, {});
        
        return {
          name: phaseNames[phase],
          color: phaseColors[phase],
          phase: phase,
          day: currentCycle.currentDay,
        };
      },
      
      getInsightsForCurrentPhase: () => {
        const { currentCycle, phaseInsights } = get();
        return phaseInsights[currentCycle.currentPhase] || [];
      },
      
      resetCycleData: () =>
        set(() => ({
          currentCycle: {
            startDate: null,
            endDate: null,
            length: 28,
            currentDay: 1,
            currentPhase: 'menstrual',
          },
          cycleHistory: [],
          dailyLogs: {},
          phaseInsights: {
            menstrual: [],
            follicular: [],
            ovulatory: [],
            luteal: [],
          },
        })),
      
      // Nouvelle fonction pour initialiser depuis l'onboarding
      initializeFromOnboarding: (onboardingCycleData) => {
        const { lastPeriodDate, averageCycleLength = 28, averagePeriodLength = 5 } = onboardingCycleData;
        
        if (lastPeriodDate) {
          const diffDays = getDaysDifference(lastPeriodDate);
          const currentDay = getCurrentCycleDay(diffDays, averageCycleLength);
          const currentPhase = calculateCurrentPhase(diffDays, averageCycleLength, averagePeriodLength);
          
          set((state) => ({
            currentCycle: {
              ...state.currentCycle,
              currentDay,
              currentPhase,
              length: averageCycleLength,
            },
          }));
        }
      },
    }),
    {
      name: 'cycle-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentCycle: state.currentCycle,
        cycleHistory: state.cycleHistory,
        dailyLogs: state.dailyLogs,
        phaseInsights: state.phaseInsights,
        trackingPreferences: state.trackingPreferences,
      }),
    }
  )
); 