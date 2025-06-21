//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/notebook/NotebookView.jsx
// 🧩 Type : Composant Écran
// 📚 Description : Composant affichant l'écran principal
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : /notebook notebook route
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useState, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert, Share, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { theme } from '../../../src/config/theme';
import { Heading, BodyText, Caption } from '../../../src/core/ui/Typography';
import { useNotebookStore } from '../../../src/stores/useNotebookStore';
import QuickTrackingModal from '../../../src/features/notebook/QuickTrackingModal';
import FreeWritingModal from '../../../src/features/notebook/FreeWritingModal';
import EntryDetailModal from '../../../src/features/shared/EntryDetailModal';
import SwipeableEntryIOS from '../../../src/features/notebook/SwipeableEntryIOS';
import ToolbarIOS from '../../../src/features/notebook/ToolbarIOS';
import {
  AnimatedSearchBar,
  AnimatedFilterPill,
  EntryLoadingSkeleton,
} from '../../../src/core/ui/AnimatedComponents';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import DevNavigation from '../../../src/core/dev/DevNavigation';


const FILTER_PILLS = [
  { id: 'all', label: 'Tout', icon: 'layers' },
  { id: 'saved', label: 'Sauvegardé', icon: 'bookmark' },
  { id: 'personal', label: 'Personnel', icon: 'edit-3' },
  { id: 'tracking', label: 'Tracking', icon: 'bar-chart-2' },
];

const PHASE_FILTERS = [
  { id: 'menstruelle', label: 'Mens.', color: theme.colors.phases.menstrual },
  { id: 'folliculaire', label: 'Foll.', color: theme.colors.phases.follicular },
  { id: 'ovulatoire', label: 'Ovu.', color: theme.colors.phases.ovulatory },
  { id: 'lutéale', label: 'Lutéale', color: theme.colors.phases.luteal },
];

export default function NotebookView() {
  const insets = useSafeAreaInsets();
  const {
    entries,
    searchEntries,
    formatTrackingEmotional,
    calculateTrends,
    getPopularTags,
    availableTags,
    deleteEntry,
  } = useNotebookStore();

  // États filtres et modales
  const [filter, setFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  // Modales
  const [showQuickTracking, setShowQuickTracking] = useState(false);
  const [showFreeWriting, setShowFreeWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Filtrage intelligent avec nouvelle logique
  const filteredEntries = useMemo(() => {
    const filters = {
      type: filter !== 'all' ? filter : null,
      phase: phaseFilter,
      tags: selectedTags.length > 0 ? selectedTags : null,
    };

    return searchEntries(searchQuery, filters);
  }, [entries, filter, phaseFilter, searchQuery, selectedTags, searchEntries]);

  // ✅ Stats pour insights
  const tagStats = useMemo(() => getPopularTags(), [entries]);

  // ✅ Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    // Simule refresh (peut trigger recalcul trends)
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getEntryIcon = (type) => {
    const iconProps = { size: 16, color: theme.colors.primary };
    switch (type) {
      case 'saved':
        return <Feather name="bookmark" {...iconProps} />;
      case 'personal':
        return <Feather name="edit-3" {...iconProps} />;
      case 'tracking':
        return <Feather name="bar-chart-2" {...iconProps} />;
      default:
        return <Feather name="edit-3" {...iconProps} />;
    }
  };

  const formatRelativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  // ✅ Tags d'une entrée (auto + manuels)
  const getEntryTags = (entry) => {
    return [...(entry.autoTags || []), ...(entry.metadata?.tags || [])];
  };

  const toggleTagFilter = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const renderTrendingInsight = () => {
    const trends = calculateTrends();
    if (!trends) return null;

    return (
      <View style={styles.trendCard}>
        <BodyText style={styles.trendTitle}>Cette semaine</BodyText>
        <BodyText style={styles.trendText}>
          {trends.energyIcon} Énergie {trends.energyTrend}
        </BodyText>
        {trends.topSymptom && (
          <BodyText style={styles.trendText}>📍 Symptôme: {trends.topSymptom}</BodyText>
        )}
        <BodyText style={styles.trendSubtext}>
          {trends.entriesCount} entrée{trends.entriesCount > 1 ? 's' : ''}
        </BodyText>
      </View>
    );
  };

  // ✅ NOUVEAU renderEntry avec SwipeableEntryIOS
  const renderEntry = ({ item, index }) => (
    <SwipeableEntryIOS
      item={item}
      onPress={() => setSelectedEntry(item)}
      formatTrackingEmotional={formatTrackingEmotional}
      formatRelativeTime={formatRelativeTime}
      getEntryIcon={getEntryIcon}
      getEntryTags={getEntryTags}
    />
  );

  // État vide
  if (entries.length === 0) {
    return (
      <ScreenContainer style={styles.container} hasTabs={true}>
        <DevNavigation />
        <View style={styles.header}>
          <Heading style={styles.title}>Mon Carnet</Heading>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchToggle}>
            <Feather name="search" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContent}>
          <BodyText style={styles.description}>
            Sauvegarde tes moments avec Melune, écris tes ressentis, note tes observations.
          </BodyText>
          <TouchableOpacity style={styles.startButton} onPress={() => setShowFreeWriting(true)}>
            <Feather name="edit-3" size={20} color="white" />
            <BodyText style={styles.startButtonText}>Commencer à écrire</BodyText>
          </TouchableOpacity>
        </View>
        <FreeWritingModal visible={showFreeWriting} onClose={() => setShowFreeWriting(false)} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      <DevNavigation />
      {/* Header avec recherche */}
              <View style={styles.header}>
          <Heading style={styles.title}>Mon Carnet</Heading>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchToggle}>
            <Feather name="search" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

      {/* Barre de recherche */}
      <AnimatedSearchBar
        visible={showSearch}
        query={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      {/* Filtres par type */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_PILLS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterPill, filter === item.id && styles.filterPillActive]}
              onPress={() => setFilter(item.id)}
            >
              <Feather
                name={item.icon}
                size={16}
                color={filter === item.id ? 'white' : theme.colors.textLight}
              />
              <BodyText style={[styles.filterText, filter === item.id && styles.filterTextActive]}>
                {item.label}
              </BodyText>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Filtres par phase */}
      <View style={styles.phaseFiltersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={PHASE_FILTERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.phasePill,
                { borderColor: item.color },
                phaseFilter === item.id && {
                  backgroundColor: item.color + '20',
                },
              ]}
              onPress={() => setPhaseFilter(phaseFilter === item.id ? null : item.id)}
            >
              <BodyText
                style={[
                  styles.phaseText,
                  { color: item.color },
                  phaseFilter === item.id && styles.phaseTextActive,
                ]}
              >
                {item.label}
              </BodyText>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Tags populaires */}
      {tagStats.length > 0 && (
        <View style={styles.tagsContainer}>
          <Caption style={styles.tagsTitle}>Tags populaires:</Caption>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={tagStats}
            keyExtractor={item => item.tag}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.tagFilter, selectedTags.includes(item.tag) && styles.tagFilterActive]}
                onPress={() => toggleTagFilter(item.tag)}
              >
                <BodyText
                  style={[
                    styles.tagFilterText,
                    selectedTags.includes(item.tag) && styles.tagFilterTextActive,
                  ]}
                >
                  {item.tag} ({item.count})
                </BodyText>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Résultats */}
      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            title="Actualisation..."
            titleColor={theme.colors.textLight}
          />
        }
        ListHeaderComponent={renderTrendingInsight}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <BodyText style={styles.emptyText}>Aucune entrée trouvée pour ces filtres</BodyText>
          </View>
        )}
      />

      {/* FAB Animé */}
      {/* ToolbarIOS pour ajouter des entrées */}
      <ToolbarIOS
        onWritePress={() => setShowFreeWriting(true)}
        onTrackPress={() => setShowQuickTracking(true)}
      />

      {/* Modales */}
      <QuickTrackingModal visible={showQuickTracking} onClose={() => setShowQuickTracking(false)} />

      <FreeWritingModal visible={showFreeWriting} onClose={() => setShowFreeWriting(false)} />

      <EntryDetailModal
        entries={selectedEntry ? [selectedEntry] : []}
        visible={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        showActions={true}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
  },
  header: {
    height: 60, // Hauteur standardisée
    flexDirection: 'row',
    justifyContent: 'center', // Centrer le titre
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    position: 'relative', // Pour positionner le bouton de recherche
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 20, // Taille standardisée
    fontWeight: '600',
  },
  searchToggle: {
    position: 'absolute',
    right: 0,
    padding: theme.spacing.s,
  },

  // Recherche (maintenant dans AnimatedSearchBar)
  // Supprimé - géré par le composant animé

  // Filtres
  filtersContainer: {
    marginBottom: theme.spacing.m,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
    gap: theme.spacing.xs,
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },

  // Filtres phases
  phaseFiltersContainer: {
    marginBottom: theme.spacing.m,
  },
  phasePill: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
  },
  phaseText: {
    fontSize: 12,
  },
  phaseTextActive: {
    fontWeight: '600',
  },

  // Tags
  tagsContainer: {
    marginBottom: theme.spacing.m,
  },
  tagsTitle: {
    marginBottom: theme.spacing.s,
    color: theme.colors.textLight,
  },
  tagFilter: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.s,
  },
  tagFilterActive: {
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  tagFilterText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  tagFilterTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Trend card
  trendCard: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.m,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  trendTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  trendText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  trendSubtext: {
    fontSize: 12,
    color: theme.colors.textLight,
  },

  // Entries


  // États
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing.xl * 2,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textLight,
  },
  description: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    opacity: 0.7,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignSelf: 'center',
  },
  startButtonText: {
    color: 'white',
    marginLeft: theme.spacing.s,
    fontWeight: '600',
  },

  list: {
    flex: 1,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.l,
    alignItems: 'center',
  },
  fabOptions: {
    marginBottom: theme.spacing.m,
    gap: theme.spacing.s,
  },
  fabOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.xs,
  },
  fabOptionText: {
    color: 'white',
    fontSize: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

