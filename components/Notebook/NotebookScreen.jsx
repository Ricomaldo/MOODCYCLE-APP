// components/Notebook/NotebookScreen.jsx - VERSION FINALE PHASE 2
import React, { useState, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Heading, BodyText, Caption } from '../Typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import QuickTrackingModal from './QuickTrackingModal';
import FreeWritingModal from './FreeWritingModal';
import EntryDetailModal from '../EntryDetailModal';
import { 
  AnimatedFAB, 
  AnimatedSearchBar, 
  AnimatedFilterPill,
  EntryLoadingSkeleton 
} from './AnimatedComponents';

const FILTER_PILLS = [
  { id: 'all', label: 'Tout', icon: 'all-inclusive' },
  { id: 'saved', label: 'Sauvegardé', icon: 'bookmark' },
  { id: 'personal', label: 'Personnel', icon: 'edit' },
  { id: 'tracking', label: 'Tracking', icon: 'bar-chart' }
];

const PHASE_FILTERS = [
  { id: 'menstruelle', label: 'Mens.', color: theme.colors.phases.menstrual },
  { id: 'folliculaire', label: 'Foll.', color: theme.colors.phases.follicular },
  { id: 'ovulatoire', label: 'Ovu.', color: theme.colors.phases.ovulatory },
  { id: 'lutéale', label: 'Lutéale', color: theme.colors.phases.luteal }
];

export default function NotebookScreen() {
  const insets = useSafeAreaInsets();
  const { 
    entries, searchEntries, formatTrackingEmotional, calculateTrends, 
    getTagStats, availableTags 
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
  const [showFabOptions, setShowFabOptions] = useState(false);

  // ✅ Filtrage intelligent avec nouvelle logique
  const filteredEntries = useMemo(() => {
    const filters = {
      type: filter !== 'all' ? filter : null,
      phase: phaseFilter,
      tags: selectedTags.length > 0 ? selectedTags : null
    };
    
    return searchEntries(searchQuery, filters);
  }, [entries, filter, phaseFilter, searchQuery, selectedTags, searchEntries]);

  // ✅ Stats pour insights
  const tagStats = useMemo(() => getTagStats(), [entries]);

  const getEntryIcon = (type) => {
    const iconProps = { size: 16, color: theme.colors.primary };
    switch (type) {
      case 'saved': return <MaterialIcons name="bookmark" {...iconProps} />;
      case 'personal': return <Feather name="edit" {...iconProps} />;
      case 'tracking': return <MaterialIcons name="bar-chart" {...iconProps} />;
      default: return <Feather name="edit" {...iconProps} />;
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
      day: 'numeric', month: 'short' 
    });
  };

  // ✅ Tags d'une entrée (auto + manuels)
  const getEntryTags = (entry) => {
    return [...(entry.autoTags || []), ...(entry.metadata?.tags || [])];
  };

  const toggleTagFilter = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
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
          <BodyText style={styles.trendText}>
            📍 Symptôme: {trends.topSymptom}
          </BodyText>
        )}
        <BodyText style={styles.trendSubtext}>
          {trends.entriesCount} entrée{trends.entriesCount > 1 ? 's' : ''}
        </BodyText>
      </View>
    );
  };

  const renderEntry = ({ item, index }) => {
    const entryTags = getEntryTags(item);
    
    const handleLongPress = () => {
      const actions = [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Tag #important", 
          onPress: () => {
            if (!entryTags.includes('#important')) {
              // addTagToEntry(item.id, '#important'); // TODO: implement
            }
          }
        }
      ];

      // Partage seulement pour 'saved' et 'tracking', pas 'personal'
      if (item.type !== 'personal') {
        actions.splice(-1, 0, { 
          text: "Partager", 
          onPress: () => {
            Share.share({
              message: item.content || formatTrackingEmotional(item),
              title: 'Mon carnet MoodCycle'
            });
          }
        });
      }

      actions.push({ 
        text: "Supprimer", 
        style: "destructive", 
        onPress: () => {
          Alert.alert(
            "Supprimer",
            "Supprimer cette entrée ?",
            [
              { text: "Annuler", style: "cancel" },
              { text: "Supprimer", style: "destructive", onPress: () => deleteEntry(item.id) }
            ]
          );
        }
      });

      Alert.alert("Actions", "Que veux-tu faire ?", actions);
    };
    
    return (
      <TouchableOpacity 
        style={styles.entryCard}
        onPress={() => setSelectedEntry(item)}
        onLongPress={handleLongPress}
        delayLongPress={800}
      >
        <View style={styles.entryHeader}>
          {getEntryIcon(item.type)}
          <BodyText style={styles.timestamp}>
            {formatRelativeTime(item.timestamp)}
          </BodyText>
          {item.metadata?.phase && (
            <View style={[
              styles.phaseDot,
              { backgroundColor: PHASE_FILTERS.find(p => p.id === item.metadata.phase)?.color }
            ]} />
          )}
        </View>
        
        <BodyText style={styles.content} numberOfLines={3}>
          {item.content || formatTrackingEmotional(item)}
        </BodyText>
        
        {entryTags.length > 0 && (
          <View style={styles.entryTags}>
            {entryTags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.entryTag}>
                <Caption style={styles.entryTagText}>{tag}</Caption>
              </View>
            ))}
            {entryTags.length > 3 && (
              <Caption style={styles.moreTagsText}>+{entryTags.length - 3}</Caption>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // État vide
  if (entries.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Heading style={styles.title}>Mon Carnet</Heading>
        <BodyText style={styles.description}>
          Sauvegarde tes moments avec Melune, écris tes ressentis, note tes observations.
        </BodyText>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => setShowFreeWriting(true)}
        >
          <MaterialIcons name="edit" size={20} color="white" />
          <BodyText style={styles.startButtonText}>Commencer à écrire</BodyText>
        </TouchableOpacity>

        <FreeWritingModal 
          visible={showFreeWriting}
          onClose={() => setShowFreeWriting(false)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header avec recherche */}
      <View style={styles.header}>
        <Heading style={styles.title}>Mon Carnet</Heading>
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)}
          style={styles.searchToggle}
        >
          <MaterialIcons name="search" size={24} color={theme.colors.primary} />
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
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterPill,
                filter === item.id && styles.filterPillActive
              ]}
              onPress={() => setFilter(item.id)}
            >
              <MaterialIcons 
                name={item.icon} 
                size={16} 
                color={filter === item.id ? 'white' : theme.colors.textLight} 
              />
              <BodyText style={[
                styles.filterText,
                filter === item.id && styles.filterTextActive
              ]}>
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
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.phasePill,
                { borderColor: item.color },
                phaseFilter === item.id && { backgroundColor: item.color + '20' }
              ]}
              onPress={() => setPhaseFilter(phaseFilter === item.id ? null : item.id)}
            >
              <BodyText style={[
                styles.phaseText,
                { color: item.color },
                phaseFilter === item.id && styles.phaseTextActive
              ]}>
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
            data={tagStats.slice(0, 6)}
            keyExtractor={([tag]) => tag}
            renderItem={({ item: [tag, count] }) => (
              <TouchableOpacity
                style={[
                  styles.tagFilter,
                  selectedTags.includes(tag) && styles.tagFilterActive
                ]}
                onPress={() => toggleTagFilter(tag)}
              >
                <BodyText style={[
                  styles.tagFilterText,
                  selectedTags.includes(tag) && styles.tagFilterTextActive
                ]}>
                  {tag} ({count})
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
        keyExtractor={item => item.id}
        style={styles.list}
        ListHeaderComponent={renderTrendingInsight}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <BodyText style={styles.emptyText}>
              Aucune entrée trouvée pour ces filtres
            </BodyText>
          </View>
        )}
      />

      {/* FAB Animé */}
      <AnimatedFAB
        showOptions={showFabOptions}
        onToggle={() => setShowFabOptions(!showFabOptions)}
        onWritePress={() => {
          setShowFreeWriting(true);
          setShowFabOptions(false);
        }}
        onTrackPress={() => {
          setShowQuickTracking(true);
          setShowFabOptions(false);
        }}
        bottom={theme.spacing.xl + insets.bottom + 60}
      />

      {/* Modales */}
      <QuickTrackingModal 
        visible={showQuickTracking}
        onClose={() => setShowQuickTracking(false)}
      />

      <FreeWritingModal 
        visible={showFreeWriting}
        onClose={() => setShowFreeWriting(false)}
      />

      <EntryDetailModal
        entries={selectedEntry ? [selectedEntry] : []}
        visible={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        showActions={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  searchToggle: {
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
  entryCard: {
    backgroundColor: 'white',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  timestamp: {
    marginLeft: theme.spacing.s,
    fontSize: 12,
    opacity: 0.6,
    flex: 1,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    lineHeight: 20,
    marginBottom: theme.spacing.s,
  },
  entryTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  entryTag: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 2,
  },
  entryTagText: {
    fontSize: 10,
    color: theme.colors.primary,
  },
  moreTagsText: {
    fontSize: 10,
    color: theme.colors.textLight,
  },
  
  // États
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