//
// ─────────────────────────────────────────────────────────
// 📄 File: src/stores/useNotebookStore.js
// 🧩 Type: Store Notebook
// 📚 Description: Carnet personnel + tracking - Version épurée
// 🕒 Version: 4.0 - 2025-06-21
// 🧭 Used in: notebook screen, quick tracking, sauvegarde chat
// ─────────────────────────────────────────────────────────
//
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import performanceMonitor from '../core/monitoring/PerformanceMonitor';
import { useCycleStore, getCycleData } from './useCycleStore';

// 🚀 Démarrer le monitoring de l'hydratation
performanceMonitor.startStoreHydration('notebookStore');

export const useNotebookStore = create(
  persist(
    (set, get) => ({
      // ═══════════════════════════════════════════════════════
      // 📝 ENTRÉES CARNET
      // ═══════════════════════════════════════════════════════
      entries: [],

      // Tags prédéfinis simples
      availableTags: [
        "#personnel",
        "#tracking",
        "#melune",
        "#recette",
        "#rdv",
        "#inspiration",
        "#objectif",
        "#bien-être",
        "#symptôme",
        "#émotion",
        "#menstrual",
        "#follicular", 
        "#ovulatory",
        "#luteal",
      ],

      // ═══════════════════════════════════════════════════════
      // ✏️ CRÉATION ENTRÉES
      // ═══════════════════════════════════════════════════════
      addEntry: (content, type = "personal", tags = []) => {
        // Import dynamique pour phase actuelle - utilise les nouvelles utils
        const { getCurrentPhase } = require("../utils/cycleCalculations");
        const { useUserStore } = require("./useUserStore");
        const cycleData = getCycleData();
        const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);

        const entry = {
          id: Date.now().toString(),
          content,
          type, // 'personal' | 'saved' | 'tracking'
          tags: [...tags, `#${currentPhase}`], // Auto-ajouter phase
          timestamp: Date.now(),
          phase: currentPhase,
        };

        set((state) => ({
          entries: [entry, ...state.entries],
        }));

        return entry.id;
      },

      // Tracking rapide unifié (humeur + énergie + symptômes)
      addQuickTracking: (mood, energy, symptoms = []) => {
        const trackingText = `Humeur: ${mood} • Énergie: ${energy}/5`;
        const trackingTags = [
          "#tracking",
          ...symptoms.map((s) => `#${s.toLowerCase()}`),
        ];

        return get().addEntry(trackingText, "tracking", trackingTags);
      },

      // Sauvegarde depuis chat Melune
      saveFromChat: (messageContent, persona = null) => {
        const tags = ["#melune"];
        if (persona) tags.push(`#${persona}`);

        return get().addEntry(messageContent, "saved", tags);
      },

      // Note personnelle rapide
      addPersonalNote: (content, tags = []) => {
        return get().addEntry(content, "personal", ["#personnel", ...tags]);
      },

      // ═══════════════════════════════════════════════════════
      // 🔍 RECHERCHE & FILTRES
      // ═══════════════════════════════════════════════════════
      searchEntries: (query, filters = {}) => {
        const { entries } = get();

        if (!query && !filters.tags && !filters.type && !filters.phase) {
          return entries;
        }

        return entries.filter((entry) => {
          // Recherche textuelle
          if (query) {
            const tagsText = entry.tags && Array.isArray(entry.tags) ? entry.tags.join(" ") : "";
            const searchText = `${entry.content} ${tagsText}`.toLowerCase();
            if (!searchText.includes(query.toLowerCase())) {
              return false;
            }
          }

          // Filtre par tags
          if (filters.tags && filters.tags.length > 0) {
            if (!entry.tags || !Array.isArray(entry.tags)) return false;
            const hasTag = filters.tags.some((tag) => entry.tags.includes(tag));
            if (!hasTag) return false;
          }

          // Filtre par type
          if (filters.type && entry.type !== filters.type) {
            return false;
          }

          // Filtre par phase
          if (filters.phase && entry.phase !== filters.phase) {
            return false;
          }

          return true;
        });
      },

      // Recherche par tag spécifique
      getEntriesByTag: (tag) => {
        const { entries } = get();
        return entries.filter((entry) => entry.tags && Array.isArray(entry.tags) && entry.tags.includes(tag));
      },

      // Recherche par phase
      getEntriesByPhase: (phase) => {
        const { entries } = get();
        return entries.filter((entry) => entry.phase === phase);
      },

      // Recherche par type
      getEntriesByType: (type) => {
        const { entries } = get();
        return entries.filter((entry) => entry.type === type);
      },

      // ═══════════════════════════════════════════════════════
      // 📊 ANALYTICS & INSIGHTS
      // ═══════════════════════════════════════════════════════
      
      // Stats tags populaires
      getPopularTags: (limit = 10) => {
        const { entries } = get();
        const tagCount = {};

        entries.forEach((entry) => {
          if (entry.tags && Array.isArray(entry.tags)) {
            entry.tags.forEach((tag) => {
              tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
          }
        });

        return Object.entries(tagCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([tag, count]) => ({ tag, count }));
      },

      // Tendances énergie/humeur (derniers 7 jours)
      getRecentTrends: () => {
        const { entries } = get();
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const recentTracking = entries.filter(
          (entry) => entry.type === "tracking" && entry.timestamp >= weekAgo
        );

        if (recentTracking.length < 2) return null;

        // Parsing simple du tracking "Humeur: X • Énergie: Y/5"
        const energyValues = recentTracking
          .map((entry) => {
            const match = entry.content.match(/Énergie: (\d+)/);
            return match ? parseInt(match[1]) : null;
          })
          .filter((val) => val !== null);

        if (energyValues.length === 0) return null;

        const avgEnergy = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
        
        return {
          avgEnergy: Math.round(avgEnergy * 10) / 10,
          entriesCount: recentTracking.length,
          trend: energyValues.length >= 2 ? 
            (energyValues[energyValues.length - 1] > energyValues[0] ? "hausse" : "baisse") : 
            "stable",
        };
      },

      // ✅ NOUVEAU : Formatage émotionnel pour tracking
      formatTrackingEmotional: (entry) => {
        if (entry.type !== "tracking") return entry.content;

        const moodMatch = entry.content.match(/Humeur: ([^•]+)/);
        const energyMatch = entry.content.match(/Énergie: (\d+)/);
        
        if (!moodMatch && !energyMatch) return entry.content;

        const mood = moodMatch ? moodMatch[1].trim() : "Non spécifiée";
        const energy = energyMatch ? parseInt(energyMatch[1]) : null;

        let energyIcon = "⚡";
        if (energy !== null) {
          if (energy >= 4) energyIcon = "⚡⚡⚡";
          else if (energy >= 2) energyIcon = "⚡⚡";
          else energyIcon = "⚡";
        }

        return `${energyIcon} Humeur: ${mood}${energy !== null ? ` • Énergie: ${energy}/5` : ""}`;
      },

      // ✅ NOUVEAU : Calcul des tendances avancées
      calculateTrends: () => {
        const { entries } = get();
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const recentTracking = entries.filter(
          (entry) => entry.type === "tracking" && entry.timestamp >= weekAgo
        );

        if (recentTracking.length < 2) return null;

        // Analyse énergie
        const energyValues = recentTracking
          .map((entry) => {
            const match = entry.content.match(/Énergie: (\d+)/);
            return match ? parseInt(match[1]) : null;
          })
          .filter((val) => val !== null);

        if (energyValues.length === 0) return null;

        const avgEnergy = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
        const energyTrend = energyValues.length >= 2 ? 
          (energyValues[energyValues.length - 1] > energyValues[0] ? "↗️ en hausse" : "↘️ en baisse") : 
          "→ stable";

        // Analyse symptômes
        const allSymptoms = [];
        recentTracking.forEach(entry => {
          if (entry.tags && Array.isArray(entry.tags)) {
            entry.tags.forEach(tag => {
              if (tag.includes('#') && !tag.includes('tracking')) {
                allSymptoms.push(tag.replace('#', ''));
              }
            });
          }
        });

        const symptomCount = {};
        allSymptoms.forEach(symptom => {
          symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
        });

        const topSymptom = Object.entries(symptomCount)
          .sort(([,a], [,b]) => b - a)[0];

        return {
          avgEnergy: Math.round(avgEnergy * 10) / 10,
          energyTrend,
          energyIcon: avgEnergy >= 4 ? "⚡⚡⚡" : avgEnergy >= 2 ? "⚡⚡" : "⚡",
          topSymptom: topSymptom ? topSymptom[0] : null,
          entriesCount: recentTracking.length,
        };
      },

      // Statistiques générales
      getStats: () => {
        const { entries } = get();
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

        return {
          total: entries.length,
          thisWeek: entries.filter((e) => e.timestamp >= weekAgo).length,
          thisMonth: entries.filter((e) => e.timestamp >= monthAgo).length,
          byType: {
            personal: entries.filter((e) => e.type === "personal").length,
            tracking: entries.filter((e) => e.type === "tracking").length,
            saved: entries.filter((e) => e.type === "saved").length,
          },
        };
      },

      // ═══════════════════════════════════════════════════════
      // 📅 GESTION DATES
      // ═══════════════════════════════════════════════════════
      
      // Entrées pour une date spécifique (YYYY-MM-DD)
      getEntriesForDate: (dateString) => {
        const { entries } = get();
        return entries.filter((entry) => {
          const entryDate = new Date(entry.timestamp).toISOString().split("T")[0];
          return entryDate === dateString;
        });
      },

      // Format pour calendrier (groupé par date)
      getEntriesGroupedByDate: () => {
        const { entries } = get();
        return entries.reduce((acc, entry) => {
          const date = new Date(entry.timestamp).toISOString().split("T")[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(entry);
          return acc;
        }, {});
      },

      // ═══════════════════════════════════════════════════════
      // ✏️ MODIFICATION & SUPPRESSION
      // ═══════════════════════════════════════════════════════
      
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        })),

      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),

      // Ajouter tag à une entrée existante
      addTagToEntry: (entryId, tag) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  tags: [...new Set([...(entry.tags || []), tag])], // Éviter doublons
                }
              : entry
          ),
        })),

      // Supprimer tag d'une entrée
      removeTagFromEntry: (entryId, tag) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  tags: (entry.tags || []).filter((t) => t !== tag),
                }
              : entry
          ),
        })),

      // ═══════════════════════════════════════════════════════
      // 💡 SUGGESTIONS & AIDE
      // ═══════════════════════════════════════════════════════
      
      // Suggestions tags intelligentes basées sur contenu
      getSuggestedTags: (content) => {
        const { availableTags } = get();
        const contentLower = content.toLowerCase();

        return availableTags.filter((tag) => {
          const tagWord = tag.substring(1); // Enlever le #
          return (
            contentLower.includes(tagWord) ||
            contentLower.includes(tagWord.substring(0, 3)) // Match partiel
          );
        });
      },

      // Suggestions d'entrées basées sur phase actuelle
      getPhaseBasedSuggestions: () => {
        const { getCurrentPhase } = require("../utils/cycleCalculations");
        const { useUserStore } = require("./useUserStore");
        const cycleData = getCycleData();
        const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);

        const suggestions = {
          menstrual: [
            "Comment je me sens pendant mes règles",
            "Rituels cocooning aujourd'hui",
            "Douleurs et remèdes naturels",
          ],
          follicular: [
            "Nouveaux projets à démarrer",
            "Objectifs pour cette énergie montante",
            "Activités créatives inspirantes",
          ],
          ovulatory: [
            "Moments de connexion sociale",
            "Communications importantes",
            "Pic de créativité et d'énergie",
          ],
          luteal: [
            "Préparation aux prochaines règles",
            "Besoins de ralentissement",
            "Gestion des émotions fortes",
          ],
        };

        return suggestions[currentPhase] || suggestions.menstrual;
      },

      // ═══════════════════════════════════════════════════════
      // 📤 EXPORT & SAUVEGARDE
      // ═══════════════════════════════════════════════════════
      
      // Export pour partage/backup
      exportEntries: (filters = {}) => {
        const { searchEntries } = get();
        const entries = searchEntries("", filters);
        
        return {
          timestamp: new Date().toISOString(),
          totalEntries: entries.length,
          entries: entries.map((entry) => ({
            content: entry.content,
            type: entry.type,
            tags: entry.tags,
            phase: entry.phase,
            date: new Date(entry.timestamp).toLocaleDateString("fr-FR"),
          })),
        };
      },

      // Import d'entrées (pour restore)
      importEntries: (importedData) => {
        if (!importedData.entries || !Array.isArray(importedData.entries)) {
          return false;
        }

        const newEntries = importedData.entries.map((entry) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          content: entry.content,
          type: entry.type || "personal",
          tags: entry.tags || [],
          phase: entry.phase || "menstrual",
          timestamp: entry.timestamp || Date.now(),
        }));

        set((state) => ({
          entries: [...newEntries, ...state.entries],
        }));

        return true;
      },

      // ═══════════════════════════════════════════════════════
      // 🗑️ NETTOYAGE & MAINTENANCE
      // ═══════════════════════════════════════════════════════
      
      // Supprimer entrées anciennes (+ de X jours)
      cleanOldEntries: (daysToKeep = 365) => {
        const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
        
        set((state) => ({
          entries: state.entries.filter((entry) => entry.timestamp >= cutoffDate),
        }));
      },

      // Nettoyer tags orphelins (non utilisés)
      cleanUnusedTags: () => {
        const { entries } = get();
        const usedTags = new Set();
        
        entries.forEach((entry) => {
          if (entry.tags && Array.isArray(entry.tags)) {
            entry.tags.forEach((tag) => usedTags.add(tag));
          }
        });

        const cleanedAvailableTags = get().availableTags.filter((tag) =>
          usedTags.has(tag)
        );

        set({ availableTags: cleanedAvailableTags });
      },

      // Reset complet
      reset: () =>
        set({
          entries: [],
          availableTags: [
            "#personnel",
            "#tracking", 
            "#melune",
            "#recette",
            "#rdv",
            "#inspiration",
            "#objectif",
            "#bien-être",
            "#symptôme",
            "#émotion",
            "#menstrual",
            "#follicular",
            "#ovulatory", 
            "#luteal",
          ],
        }),
    }),
    {
      name: "notebook-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        entries: state.entries.slice(-50), // Limiter à 50 entrées les plus récentes pour optimiser AsyncStorage
        availableTags: state.availableTags,
      }),
    }
  )
);

// ✅ Marquer la fin de l'hydratation du store
performanceMonitor.endStoreHydration('notebookStore');
      