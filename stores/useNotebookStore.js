import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Version optimisée selon spécs finales + tendances
export const useNotebookStore = create(
    persist(
      (set, get) => ({
        entries: [],
        
        addEntry: (content, type = 'personal', metadata = {}) => {
          const entry = {
            id: Date.now().toString(),
            content,
            type, // 'saved' | 'personal' | 'tracking'
            metadata: {
              phase: metadata.phase || 'menstrual', // Valeur par défaut
              mood: metadata.mood || null,
              energy: metadata.energy || null,
              symptoms: metadata.symptoms || [],
              tags: metadata.tags || [],
              ...metadata
            },
            timestamp: Date.now()
          };
          
          set(state => ({
            entries: [entry, ...state.entries]
          }));
        },
  
        // Quick tracking spécialisé
        addQuickTracking: (energy, mood, symptoms = []) => {
          get().addEntry('', 'tracking', { energy, mood, symptoms });
        },

        // Fonction pour sauvegarder depuis le chat (utilisée par ChatBubble)
        saveFromChat: (message, phase) => {
          get().addEntry(message, 'saved', { phase });
        },

        // Calcul tendances 7 derniers jours
        calculateTrends: () => {
          const { entries } = get();
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          
          const trackingEntries = entries
            .filter(entry => entry.type === 'tracking' && entry.timestamp >= sevenDaysAgo)
            .sort((a, b) => a.timestamp - b.timestamp);

          if (trackingEntries.length < 2) return null;

          // Calcul tendance énergie
          const energyValues = trackingEntries
            .map(entry => entry.metadata.energy)
            .filter(energy => energy !== null);
          
          let energyTrend = 'stable';
          if (energyValues.length >= 2) {
            const first = energyValues.slice(0, Math.ceil(energyValues.length / 2));
            const second = energyValues.slice(Math.floor(energyValues.length / 2));
            const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
            const secondAvg = second.reduce((a, b) => a + b, 0) / second.length;
            
            if (secondAvg > firstAvg + 0.5) energyTrend = 'hausse';
            else if (secondAvg < firstAvg - 0.5) energyTrend = 'baisse';
          }

          // Symptômes les plus fréquents
          const allSymptoms = trackingEntries
            .flatMap(entry => entry.metadata.symptoms || []);
          const symptomCount = allSymptoms.reduce((acc, symptom) => {
            acc[symptom] = (acc[symptom] || 0) + 1;
            return acc;
          }, {});

          const topSymptom = Object.entries(symptomCount)
            .sort(([,a], [,b]) => b - a)[0];

          return {
            energyTrend,
            energyIcon: energyTrend === 'hausse' ? '📈' : energyTrend === 'baisse' ? '📉' : '➡️',
            topSymptom: topSymptom ? topSymptom[0] : null,
            entriesCount: trackingEntries.length
          };
        },

        // Format émotionnel pour tracking
        formatTrackingEmotional: (entry) => {
          if (entry.type !== 'tracking') return 'Données de tracking';
          
          const { energy, mood, symptoms } = entry.metadata;
          const energyEmojis = ['😴', '😐', '🙂', '😊', '🤩'];
          const moodEmojis = { 
            sad: '😢', 
            neutral: '😐', 
            good: '😊', 
            great: '😍', 
            amazing: '🤩' 
          };
          
          let preview = `Énergie: ${energyEmojis[energy] || '😐'}`;
          if (mood && moodEmojis[mood]) {
            preview += ` • Humeur: ${moodEmojis[mood]}`;
          }
          if (symptoms?.length) {
            preview += ` • +${symptoms.length}`;
          }
          
          return preview;
        },
  
        // Recherche unifiée
        searchEntries: (query) => {
          const { entries } = get();
          return entries.filter(entry => 
            entry.content.toLowerCase().includes(query.toLowerCase()) ||
            entry.metadata.tags?.some(tag => tag.includes(query))
          );
        }, 
        
        deleteEntry: (id) => {
          set(state => ({
            entries: state.entries.filter(entry => entry.id !== id)
          }));
        },
      }),
      { name: 'notebook-storage', storage: createJSONStorage(() => AsyncStorage) }
    )
  );