//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/notebook/NotebookView.jsx
// 🧩 Type : Composant Écran Premium
// 📚 Description : Carnet personnel avec design raffiné et UX fluide
// 🕒 Version : 5.0 - 2025-06-21 - DESIGN PREMIUM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert, Share, RefreshControl, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAdaptiveInterface } from '../../../src/hooks/useAdaptiveInterface';
import { Heading, BodyText, Caption } from '../../../src/core/ui/Typography';
import { useNotebookStore } from '../../../src/stores/useNotebookStore';
import { useNavigationStore } from '../../../src/stores/useNavigationStore';
import { useCycle } from '../../../src/hooks/useCycle';
import QuickTrackingModal from '../../../src/features/notebook/QuickTrackingModal';
import FreeWritingModal from '../../../src/features/notebook/FreeWritingModal';
import EntryDetailModal from '../../../src/features/shared/EntryDetailModal';
import SwipeableEntryIOS from '../../../src/features/notebook/SwipeableEntryIOS';
import ToolbarIOS from '../../../src/features/notebook/ToolbarIOS';
import {
  AnimatedSearchBar,
} from '../../../src/core/ui/AnimatedComponents';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import { formatTrendSummary } from '../../../src/utils/trackingFormatters';
import ParametresButton from '../../../src/features/shared/ParametresButton';

const FILTER_PILLS = [
  { id: 'all', label: 'Tout', icon: 'layers' },
  { id: 'saved', label: 'Sauvegardé', icon: 'bookmark' },
  { id: 'personal', label: 'Personnel', icon: 'edit-3' },
  { id: 'tracking', label: 'Tracking', icon: 'bar-chart-2' },
];

// Déplacement de getStyles avant le composant pour éviter l'erreur "Property 'theme' doesn't exist"
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    paddingHorizontal: theme.spacing.l,
    position: 'relative',
  },
  parametresButton: {
    position: 'absolute',
    left: theme.spacing.l,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  searchToggle: {
    position: 'absolute',
    right: theme.spacing.l,
    padding: theme.spacing.s,
  },
  
  // Contexte vignette premium
  vignetteContext: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '08',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: theme.spacing.l,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
    gap: 8,
  },
  vignetteContextText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    flex: 1,
  },



  // Filtres design premium
  filtersContainer: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s + 2,
    marginRight: theme.spacing.s,
    gap: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },

  // Filtres phases premium
  phaseFiltersContainer: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
    gap: 6,
  },
  phaseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseText: {
    fontSize: 13,
    fontWeight: '500',
  },
  phaseTextActive: {
    fontWeight: '700',
  },

  // Tags améliorés
  tagsContainer: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  tagsTitle: {
    marginBottom: theme.spacing.s,
    color: theme.colors.textLight,
    fontSize: 12,
  },
  tagFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.pill,
    paddingLeft: theme.spacing.m,
    paddingRight: theme.spacing.xs,
    paddingVertical: theme.spacing.xs + 2,
    marginRight: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagFilterActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  tagFilterText: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  tagFilterTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tagCount: {
    backgroundColor: theme.colors.textLight + '20',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tagCountText: {
    fontSize: 10,
    color: theme.colors.textLight,
    fontWeight: '600',
  },

  // Trend card premium
  trendCard: {
    backgroundColor: 'white',
    marginHorizontal: theme.spacing.l,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  trendWeek: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  trendSubtitle: {
    fontSize: 15,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  trendDetail: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: theme.spacing.s,
  },
  trendFooter: {
    marginTop: theme.spacing.m,
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  trendCount: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },

  // États vides améliorés
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing.xl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.l,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  emptyState: {
    padding: theme.spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textLight,
    marginTop: theme.spacing.m,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: theme.colors.textLight + '80',
    marginTop: theme.spacing.xs,
  },
  description: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.textLight,
    fontSize: 15,
    lineHeight: 22,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m + 2,
    borderRadius: theme.borderRadius.pill,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    marginLeft: theme.spacing.s,
    fontWeight: '700',
    fontSize: 16,
  },

  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100, // Pour la toolbar
  },
});

export default function NotebookView() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // Phase filters avec accès au thème (déplacé dans le composant)
  const PHASE_FILTERS = useMemo(() => [
    { id: 'menstrual', label: 'Mens.', color: theme?.colors?.phases?.menstrual || '#E53935' },
    { id: 'follicular', label: 'Foll.', color: theme?.colors?.phases?.follicular || '#F57C00' },
    { id: 'ovulatory', label: 'Ovu.', color: theme?.colors?.phases?.ovulatory || '#0097A7' },
    { id: 'luteal', label: 'Lutéale', color: theme?.colors?.phases?.luteal || '#673AB7' },
  ], [theme]);
  
  const {
    entries,
    searchEntries,
    formatTrackingEmotional,
    calculateTrends,
    getPopularTags,
    availableTags,
    deleteEntry,
    addEntry,
    addPersonalNote,
  } = useNotebookStore();

  const { currentPhase } = useCycle();
  const { notebookFilters, setNotebookFilter } = useNavigationStore();
  const { features, config, maturityLevel } = useAdaptiveInterface();

  // États
  const filter = notebookFilters.type || 'all';
  const phaseFilter = notebookFilters.phase;
  const selectedTags = notebookFilters.tags || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickTracking, setShowQuickTracking] = useState(false);
  const [showFreeWriting, setShowFreeWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [vignetteContext, setVignetteContext] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation pour header premium
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Navigation vignettes
  const handleVignetteNavigation = useCallback(() => {
    const { initialPrompt, sourcePhase, sourcePersona, vignetteId, mode } = params;
    
    // Éviter les appels inutiles si les valeurs clés n'ont pas changé
    if (!initialPrompt && !mode && !sourcePhase) return;
    
    // Si on a un prompt initial, on ouvre automatiquement la modal d'écriture
    if (initialPrompt) {
      setVignetteContext({
        prompt: initialPrompt,
        phase: sourcePhase,
        persona: sourcePersona,
        vignetteId,
        suggestedTags: [`#${sourcePhase}`, '#vignette', '#guidé']
      });
      setShowFreeWriting(true);
    } else if (mode === 'track') {
      setVignetteContext({
        phase: sourcePhase,
        persona: sourcePersona,
        vignetteId,
        suggestedTags: [`#${sourcePhase}`, '#tracking', '#vignette']
      });
      setShowQuickTracking(true);
    } else if (sourcePhase) {
      setVignetteContext({
        phase: sourcePhase,
        persona: sourcePersona,
        vignetteId
      });
      setNotebookFilter('phase', sourcePhase);
    }
  }, [params.initialPrompt, params.sourcePhase, params.mode, params.vignetteId, setNotebookFilter]);

  // Navigation vignettes
  const handleVignetteNavigationRef = useRef(handleVignetteNavigation);
  handleVignetteNavigationRef.current = handleVignetteNavigation;
  
  useFocusEffect(
    useCallback(() => {
      if (params.context === 'vignette') {
        // Vérification de sécurité
        if (handleVignetteNavigationRef.current) {
          handleVignetteNavigationRef.current();
        }
      }
      
      // Animation header entrée
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      return () => {
        setVignetteContext(null);
      };
    }, [params.context])
  );

  // Filtres memoized
  const filters = useMemo(() => ({
    type: filter !== 'all' ? filter : null,
    phase: phaseFilter,
    tags: selectedTags.length > 0 ? selectedTags : null,
  }), [filter, phaseFilter, selectedTags]);

  // Filtrage optimisé
  const filteredEntries = useMemo(() => {
    return searchEntries(searchQuery, filters);
  }, [searchQuery, filters, entries]);

  // Stats memoized
  const tagStats = useMemo(() => 
    getPopularTags()
  , [entries]);

  // Formatters memoized avec couleurs phase
  const formatters = useMemo(() => ({
    getEntryIcon: (type, phase) => {
      const phaseColors = {
        menstrual: theme.colors.phases.menstrual,
        follicular: theme.colors.phases.follicular,
        ovulatory: theme.colors.phases.ovulatory,
        luteal: theme.colors.phases.luteal
      };
      
      const color = phaseColors[phase] || theme.colors.primary;
      const iconProps = { size: 16, color };
      
      switch (type) {
        case 'saved': return <Feather name="bookmark" {...iconProps} />;
        case 'personal': return <Feather name="edit-3" {...iconProps} />;
        case 'tracking': return <Feather name="bar-chart-2" {...iconProps} />;
        default: return <Feather name="edit-3" {...iconProps} />;
      }
    },
    
    formatRelativeTime: (timestamp) => {
      const diff = Date.now() - timestamp;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 60) return `${minutes}min`;
      if (hours < 24) return `${hours}h`;
      if (days < 7) return `${days}j`;
      return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short',
      });
    },

    getEntryTags: (entry) => [...(entry.tags || []), ...(entry.autoTags || []), ...(entry.metadata?.tags || [])]
  }), [theme]);

  // Handlers optimisés
  const handleFilterChange = useCallback((newFilter) => {
    setNotebookFilter('type', newFilter);
  }, [setNotebookFilter]);

  const handlePhaseFilter = useCallback((phaseId) => {
    setNotebookFilter('phase', phaseId === notebookFilters.phase ? null : phaseId);
  }, [setNotebookFilter, notebookFilters.phase]);

  const handleTagFilter = useCallback((tag) => {
    const currentTags = notebookFilters.tags || [];
    const newTags = currentTags.includes(tag) 
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setNotebookFilter('tags', newTags);
  }, [setNotebookFilter, notebookFilters.tags]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleToolbarAction = useCallback((action) => {
    if (action === 'write') {
      setShowFreeWriting(true);
    } else if (action === 'track') {
      setShowQuickTracking(true);
    }
  }, []);

  // Trending insight amélioré
  const trendingInsight = useMemo(() => {
    const trends = calculateTrends();
    if (!trends) return null;
    
    const formatted = formatTrendSummary(trends);
    if (!formatted) return null;

    return (
      <Animated.View 
        style={[
          styles.trendCard,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        <View style={styles.trendHeader}>
          <BodyText style={styles.trendTitle}>{formatted.title}</BodyText>
          <Caption style={styles.trendWeek}>Cette semaine</Caption>
        </View>
        <BodyText style={styles.trendSubtitle}>{formatted.subtitle}</BodyText>
        {formatted.detail && (
          <BodyText style={styles.trendDetail}>{formatted.detail}</BodyText>
        )}
        <View style={styles.trendFooter}>
          <Caption style={styles.trendCount}>
            {trends.entriesCount} entrée{trends.entriesCount > 1 ? 's' : ''}
          </Caption>
        </View>
      </Animated.View>
    );
  }, [calculateTrends, headerAnim]);

  // renderEntry optimisé
  const renderEntry = useCallback(({ item, index }) => (
    <Animated.View
      style={{
        opacity: headerAnim,
        transform: [{
          translateY: headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0]
          })
        }]
      }}
    >
      <SwipeableEntryIOS
        item={item}
        onPress={() => setSelectedEntry(item)}
        formatTrackingEmotional={formatTrackingEmotional}
        formatRelativeTime={formatters.formatRelativeTime}
        getEntryIcon={(type) => formatters.getEntryIcon(type, item.phase)}
        getEntryTags={formatters.getEntryTags}
      />
    </Animated.View>
  ), [formatTrackingEmotional, formatters, headerAnim]);

  // Contexte vignette
  const renderVignetteContext = () => {
    if (!vignetteContext) return null;
    
    return (
      <Animated.View 
        style={[
          styles.vignetteContext,
          {
            opacity: headerAnim,
            transform: [{
              translateX: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0]
              })
            }]
          }
        ]}
      >
        <Feather name="compass" size={16} color={theme.colors.primary} />
        <BodyText style={styles.vignetteContextText}>
          Guidance {vignetteContext.phase}
          {vignetteContext.prompt && ` • ${vignetteContext.prompt.slice(0, 30)}...`}
        </BodyText>
      </Animated.View>
    );
  };

  // État vide amélioré
  if (entries.length === 0) {
    return (
      <ScreenContainer style={styles.container} hasTabs={true}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [{
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0]
                })
              }]
            }
          ]}
        >
          <Heading style={styles.title}>Mon Carnet</Heading>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchToggle}>
            <Feather name="search" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>
        
        {renderVignetteContext()}
        
        <View style={styles.emptyContent}>
          <View style={styles.emptyIcon}>
            <Feather name="book-open" size={48} color={theme.colors.primary + '40'} />
          </View>
          <Heading style={styles.emptyTitle}>Ton carnet t'attend</Heading>
          <BodyText style={styles.description}>
            Capture tes ressentis, suis ton énergie, explore ton cycle avec bienveillance.
          </BodyText>
          <TouchableOpacity style={styles.startButton} onPress={() => setShowFreeWriting(true)}>
            <Feather name="edit-3" size={20} color="white" />
            <BodyText style={styles.startButtonText}>Commencer à écrire</BodyText>
          </TouchableOpacity>
        </View>
        
        <FreeWritingModal 
          visible={showFreeWriting} 
          onClose={() => setShowFreeWriting(false)}
          initialPrompt={vignetteContext?.prompt}
          suggestedTags={vignetteContext?.suggestedTags}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      
      {/* Header animé */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }]
          }
        ]}
      >
        <ParametresButton 
          color={theme.colors.primary}
          style={styles.parametresButton}
        />
        <Heading style={styles.title}>Mon Carnet</Heading>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchToggle}>
          <Feather name="search" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </Animated.View>



      {renderVignetteContext()}

      <AnimatedSearchBar
        visible={showSearch}
        query={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      {/* Filtres par type avec design premium */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_PILLS.filter(pill => 
            maturityLevel === 'autonomous' || 
            ['all', 'personal', 'saved'].includes(pill.id)
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterPill, filter === item.id && styles.filterPillActive]}
              onPress={() => handleFilterChange(item.id)}
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

      {/* Filtres phases - seulement si entries avec phases */}
      {entries.some(entry => entry.phase) && (
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
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handlePhaseFilter(item.id)}
              >
                <View style={[styles.phaseIndicator, { backgroundColor: item.color }]} />
                <BodyText
                  style={[
                    styles.phaseText,
                    { color: phaseFilter === item.id ? item.color : theme.colors.textLight },
                    phaseFilter === item.id && styles.phaseTextActive,
                  ]}
                >
                  {item.label}
                </BodyText>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Tags populaires améliorés */}
      {tagStats.length > 0 && features.advanced_tracking && (
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
                onPress={() => handleTagFilter(item.tag)}
              >
                <BodyText
                  style={[
                    styles.tagFilterText,
                    selectedTags.includes(item.tag) && styles.tagFilterTextActive,
                  ]}
                >
                  {item.tag}
                </BodyText>
                <View style={styles.tagCount}>
                  <Caption style={styles.tagCountText}>{item.count}</Caption>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Liste avec animations */}
      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            title="Actualisation..."
            titleColor={theme.colors.textLight}
          />
        }
        ListHeaderComponent={trendingInsight}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Feather name="search" size={32} color={theme.colors.textLight + '60'} />
            <BodyText style={styles.emptyText}>Aucune entrée trouvée</BodyText>
            <Caption style={styles.emptySubtext}>Essaie de modifier tes filtres</Caption>
          </View>
        )}
      />

      {/* Toolbar iOS premium */}
      <ToolbarIOS
        onWritePress={() => handleToolbarAction('write')}
        onTrackPress={() => handleToolbarAction('track')}
      />

      {/* Modales */}
      <QuickTrackingModal 
        visible={showQuickTracking} 
        onClose={() => setShowQuickTracking(false)}
        defaultTags={vignetteContext?.suggestedTags}
      />

      <FreeWritingModal 
        visible={showFreeWriting} 
        onClose={() => setShowFreeWriting(false)}
        initialPrompt={vignetteContext?.prompt}
        suggestedTags={vignetteContext?.suggestedTags}
      />

      <EntryDetailModal
        entries={selectedEntry ? [selectedEntry] : []}
        visible={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        showActions={true}
      />
    </ScreenContainer>
  );
}