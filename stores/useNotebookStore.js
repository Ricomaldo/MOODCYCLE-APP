// stores/useNotebookStore.js - ENRICHI AVEC TAGS + RECHERCHE
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useNotebookStore = create(
    persist(
      (set, get) => ({
        entries: [],
        
        // ✅ NOUVEAU : Système de tags automatiques + manuels
        availableTags: [
          '#recette', '#rdv', '#inspiration', '#objectif', '#découverte', 
          '#émotion', '#conseil', '#symptôme', '#bien-être', '#réflexion'
        ],
        
        addEntry: (content, type = 'personal', metadata = {}) => {
          const entry = {
            id: Date.now().toString(),
            content,
            type, // 'saved' | 'personal' | 'tracking'
            metadata: {
              phase: metadata.phase || 'menstrual',
              mood: metadata.mood || null,
              energy: metadata.energy || null,
              symptoms: metadata.symptoms || [],
              tags: metadata.tags || [],
              ...metadata
            },
            timestamp: Date.now(),
            // ✅ NOUVEAU : Tags automatiques
            autoTags: get().generateAutoTags(content, type, metadata)
          };
          
          set(state => ({
            entries: [entry, ...state.entries]
          }));
        },

        // ✅ NOUVEAU : Génération tags automatiques
        generateAutoTags: (content, type, metadata) => {
          const tags = [];
          
          // Tags par type
          switch (type) {
            case 'saved': tags.push('#sauvegardé'); break;
            case 'personal': tags.push('#personnel'); break;
            case 'tracking': tags.push('#tracking'); break;
          }
          
          // Tag phase cyclique
          if (metadata.phase) {
            tags.push(`#${metadata.phase}`);
          }
          
          // Tags basés sur le contenu
          const contentLower = content.toLowerCase();
          if (contentLower.includes('recette') || contentLower.includes('cuisine')) {
            tags.push('#recette');
          }
          if (contentLower.includes('rdv') || contentLower.includes('rendez-vous')) {
            tags.push('#rdv');
          }
          if (contentLower.includes('idée') || contentLower.includes('inspiration')) {
            tags.push('#inspiration');
          }
          if (contentLower.includes('objectif') || contentLower.includes('but')) {
            tags.push('#objectif');
          }
          
          // Tags émotionnels
          if (metadata.mood === 'sad') tags.push('#émotion');
          if (metadata.symptoms?.length > 0) tags.push('#symptôme');
          
          return [...new Set(tags)]; // Éliminer doublons
        },

        // ✅ NOUVEAU : Recherche unifiée avancée
        searchEntries: (query, filters = {}) => {
          const { entries } = get();
          
          if (!query && !filters.tags && !filters.type && !filters.phase) {
            return entries;
          }
          
          return entries.filter(entry => {
            // Recherche textuelle
            if (query) {
              const searchIn = `${entry.content} ${entry.metadata.tags?.join(' ')} ${entry.autoTags?.join(' ')}`.toLowerCase();
              if (!searchIn.includes(query.toLowerCase())) {
                return false;
              }
            }
            
            // Filtre par tags
            if (filters.tags && filters.tags.length > 0) {
              const entryTags = [...(entry.autoTags || []), ...(entry.metadata.tags || [])];
              const hasRequiredTag = filters.tags.some(tag => entryTags.includes(tag));
              if (!hasRequiredTag) return false;
            }
            
            // Filtre par type
            if (filters.type && entry.type !== filters.type) {
              return false;
            }
            
            // Filtre par phase
            if (filters.phase && entry.metadata.phase !== filters.phase) {
              return false;
            }
            
            return true;
          });
        },

        // ✅ NOUVEAU : Suggestions tags intelligentes
        getSuggestedTags: (content) => {
          const { availableTags } = get();
          const contentLower = content.toLowerCase();
          
          return availableTags.filter(tag => {
            const tagWord = tag.substring(1); // Enlever le #
            return contentLower.includes(tagWord) || 
                   contentLower.includes(tagWord.substring(0, 3)); // Match partiel
          });
        },

        // ✅ NOUVEAU : Stats tags pour insights
        getTagStats: () => {
          const { entries } = get();
          const tagCount = {};
          
          entries.forEach(entry => {
            const allTags = [...(entry.autoTags || []), ...(entry.metadata.tags || [])];
            allTags.forEach(tag => {
              tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
          });
          
          return Object.entries(tagCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10); // Top 10 tags
        },

        // ✅ NOUVEAU : Ajouter tag manuel à une entrée
        addTagToEntry: (entryId, tag) => {
          set(state => ({
            entries: state.entries.map(entry => 
              entry.id === entryId 
                ? {
                    ...entry,
                    metadata: {
                      ...entry.metadata,
                      tags: [...(entry.metadata.tags || []), tag]
                    }
                  }
                : entry
            )
          }));
        },

        // ✅ NOUVEAU : Supprimer tag d'une entrée
        removeTagFromEntry: (entryId, tag) => {
          set(state => ({
            entries: state.entries.map(entry => 
              entry.id === entryId 
                ? {
                    ...entry,
                    metadata: {
                      ...entry.metadata,
                      tags: (entry.metadata.tags || []).filter(t => t !== tag)
                    }
                  }
                : entry
            )
          }));
        },

        // Fonctions existantes conservées...
        addQuickTracking: (energy, mood, symptoms = []) => {
          get().addEntry('', 'tracking', { energy, mood, symptoms });
        },

        saveFromChat: (message, phase) => {
          get().addEntry(message, 'saved', { phase });
        },

        calculateTrends: () => {
          const { entries } = get();
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          
          const trackingEntries = entries
            .filter(entry => entry.type === 'tracking' && entry.timestamp >= sevenDaysAgo)
            .sort((a, b) => a.timestamp - b.timestamp);

          if (trackingEntries.length < 2) return null;

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

        getEntriesForDate: (dateString) => {
          const { entries } = get();
          return entries.filter(entry => {
            const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
            return entryDate === dateString;
          });
        },

        formatEntriesForCalendar: () => {
          const { entries } = get();
          return entries.reduce((acc, entry) => {
            const date = new Date(entry.timestamp).toISOString().split('T')[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push(entry);
            return acc;
          }, {});
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