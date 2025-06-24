//
// ─────────────────────────────────────────────────────────
// 📄 File: src/stores/useNavigationStore.js
// 🧩 Type: Navigation State Store
// 📚 Description: État navigation persisté - filtres, modals, historique
// 🕒 Version: 1.0 - 2025-06-21 - SPRINT 1 CRÉATION
// 🧭 Used in: NotebookView, EntryDetailModal, navigation
// ─────────────────────────────────────────────────────────
//
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import performanceMonitor from '../core/monitoring/PerformanceMonitor';

// 🚀 Monitoring hydratation
performanceMonitor.startStoreHydration('navigationStore');

export const useNavigationStore = create(
  persist(
    (set, get) => ({
      // ═══════════════════════════════════════════════════════
      // 📝 FILTRES NOTEBOOK
      // ═══════════════════════════════════════════════════════
      notebookFilters: {
        type: 'all',          // 'all' | 'personal' | 'saved' | 'tracking'
        phase: null,          // null | 'menstrual' | 'follicular' | 'ovulatory' | 'luteal'
        tags: [],             // Array de tags actifs
        searchQuery: '',      // Recherche textuelle
        sortBy: 'recent',     // 'recent' | 'oldest' | 'phase'
      },

      // ═══════════════════════════════════════════════════════
      // 🎯 ÉTAT MODAL
      // ═══════════════════════════════════════════════════════
      modalState: {
        entryDetail: {
          visible: false,
          entries: [],        // Toutes les entrées filtrées
          currentIndex: 0,    // Index actuel dans la liste
        },
      },

      // ═══════════════════════════════════════════════════════
      // 📊 HISTORIQUE NAVIGATION
      // ═══════════════════════════════════════════════════════
      navigationHistory: {
        lastTab: 'cycle',          // Dernier onglet visité
        lastVignetteId: null,      // Dernière vignette cliquée
        vignetteInteractions: {},  // { vignetteId: clickCount }
      },

      // ═══════════════════════════════════════════════════════
      // 🎬 ACTIONS - FILTRES
      // ═══════════════════════════════════════════════════════
      setNotebookFilter: (key, value) => 
        set((state) => ({
          notebookFilters: { ...state.notebookFilters, [key]: value }
        })),

      resetNotebookFilters: () =>
        set((state) => ({
          notebookFilters: {
            type: 'all',
            phase: null,
            tags: [],
            searchQuery: '',
            sortBy: 'recent',
          }
        })),

      toggleTag: (tag) =>
        set((state) => {
          const tags = [...state.notebookFilters.tags];
          const index = tags.indexOf(tag);
          if (index > -1) {
            tags.splice(index, 1);
          } else {
            tags.push(tag);
          }
          return {
            notebookFilters: { ...state.notebookFilters, tags }
          };
        }),

      // ═══════════════════════════════════════════════════════
      // 🎬 ACTIONS - MODAL
      // ═══════════════════════════════════════════════════════
      openEntryDetailModal: (entries, startIndex = 0) =>
        set((state) => ({
          modalState: {
            ...state.modalState,
            entryDetail: {
              visible: true,
              entries,
              currentIndex: Math.min(startIndex, entries.length - 1)
            }
          }
        })),

      closeEntryDetailModal: () =>
        set((state) => ({
          modalState: {
            ...state.modalState,
            entryDetail: {
              visible: false,
              entries: [],
              currentIndex: 0
            }
          }
        })),

      navigateModalEntry: (direction) =>
        set((state) => {
          const { entries, currentIndex } = state.modalState.entryDetail;
          let newIndex = currentIndex;
          
          if (direction === 'next' && currentIndex < entries.length - 1) {
            newIndex = currentIndex + 1;
          } else if (direction === 'prev' && currentIndex > 0) {
            newIndex = currentIndex - 1;
          }
          
          return {
            modalState: {
              ...state.modalState,
              entryDetail: {
                ...state.modalState.entryDetail,
                currentIndex: newIndex
              }
            }
          };
        }),

      // ═══════════════════════════════════════════════════════
      // 🎬 ACTIONS - HISTORIQUE
      // ═══════════════════════════════════════════════════════
      trackTabVisit: (tabName) =>
        set((state) => ({
          navigationHistory: {
            ...state.navigationHistory,
            lastTab: tabName
          }
        })),

      trackVignetteClick: (vignetteId) =>
        set((state) => {
          const interactions = { ...state.navigationHistory.vignetteInteractions };
          interactions[vignetteId] = (interactions[vignetteId] || 0) + 1;
          
          return {
            navigationHistory: {
              ...state.navigationHistory,
              lastVignetteId: vignetteId,
              vignetteInteractions: interactions
            }
          };
        }),

      // ═══════════════════════════════════════════════════════
      // 🔍 GETTERS
      // ═══════════════════════════════════════════════════════
      getCurrentModalEntry: () => {
        const { entryDetail } = get().modalState;
        return entryDetail.entries[entryDetail.currentIndex] || null;
      },

      getActiveFiltersCount: () => {
        const { notebookFilters } = get();
        let count = 0;
        if (notebookFilters.type !== 'all') count++;
        if (notebookFilters.phase) count++;
        if (notebookFilters.tags.length > 0) count += notebookFilters.tags.length;
        if (notebookFilters.searchQuery) count++;
        return count;
      },

      getMostClickedVignettes: (limit = 5) => {
        const { vignetteInteractions } = get().navigationHistory;
        return Object.entries(vignetteInteractions)
          .sort(([,a], [,b]) => b - a)
          .slice(0, limit)
          .map(([id, count]) => ({ id, count }));
      },

      // ═══════════════════════════════════════════════════════
      // 🔄 MIGRATION & RESET
      // ═══════════════════════════════════════════════════════
      reset: () =>
        set({
          notebookFilters: {
            type: 'all',
            phase: null,
            tags: [],
            searchQuery: '',
            sortBy: 'recent',
          },
          modalState: {
            entryDetail: {
              visible: false,
              entries: [],
              currentIndex: 0,
            },
          },
          navigationHistory: {
            lastTab: 'cycle',
            lastVignetteId: null,
            vignetteInteractions: {},
          },
        }),
    }),
    {
      name: "navigation-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1, // Pour futures migrations
      partialize: (state) => ({
        notebookFilters: state.notebookFilters,
        navigationHistory: state.navigationHistory,
        // modalState n'est PAS persisté (volatile)
      }),
    }
  )
);

// ✅ Fin hydratation
performanceMonitor.endStoreHydration('navigationStore');