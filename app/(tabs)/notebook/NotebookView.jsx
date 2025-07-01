//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/notebook/NotebookView.jsx
// 🧩 Type : Composant Écran Premium
// 📚 Description : Carnet personnel avec StandardHeader + design raffiné
// 🕒 Version : 6.0 - 2025-06-28 - TRANSFORMATION UI + STANDARDHEADER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert, Share, RefreshControl, Animated } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAdaptiveInterface } from '../../../src/hooks/useAdaptiveInterface';
import { useTerminology } from '../../../src/hooks/useTerminology';
import { Heading, BodyText, Caption } from '../../../src/core/ui/Typography';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import { NotebookHeader } from '../../../src/core/layout/SimpleHeader';
import { useNotebookStore } from '../../../src/stores/useNotebookStore';
import { useNavigationStore } from '../../../src/stores/useNavigationStore';
import { useCycleStore } from '../../../src/stores/useCycleStore';
import { getCurrentPhase } from '../../../src/utils/cycleCalculations';

import FreeWritingModal from '../../../src/features/notebook/FreeWritingModal';
import EntryDetailModal from '../../../src/features/notebook/EntryDetailModal';
import SwipeableEntryIOS from '../../../src/features/notebook/SwipeableEntryIOS';
import {
  AnimatedSearchBar,
} from '../../../src/core/ui/AnimatedComponents';
import { formatTrendSummary } from '../../../src/utils/trackingFormatters';
import CalendarView from '../../../src/features/cycle/CalendarView';

const FILTER_PILLS = [
  { id: 'all', label: 'Tout', icon: 'layers' },
  { id: 'saved', label: 'Sauvegardé', icon: 'bookmark' },
  { id: 'personal', label: 'Personnel', icon: 'edit-3' },
  { id: 'tracking', label: 'Tracking', icon: 'bar-chart-2' },
];

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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

  // Indicator pour phase (utilisé dans le menu compact)
  phaseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Trend card premium
  trendCard: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 12,
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
    paddingBottom: 80,
    paddingHorizontal: 12,
  },

  // FAB iOS pour écrire
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: insets.bottom + 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },

  // Bouton filtre compact
  filterButton: {
    position: 'absolute',
    left: 20,
    bottom: insets.bottom + 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.border + '40',
    zIndex: 1000,
  },

  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },

  // Menu filtre
  filterMenu: {
    position: 'absolute',
    left: 20,
    bottom: insets.bottom + 80,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.border + '30',
    zIndex: 999,
  },

  filterSection: {
    marginBottom: 16,
  },

  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  compactFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  compactFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },

  compactFilterPillActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },

  compactFilterText: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '500',
  },

  compactFilterTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default function NotebookView() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);
  
  // ✅ Hook terminologie pour affichage dynamique des phases (défini en premier)
  const { getPhaseLabel } = useTerminology();
  
  // Phase filters avec accès au thème et terminologie dynamique
  const PHASE_FILTERS = useMemo(() => [
    { id: 'menstrual', label: getPhaseLabel('menstrual')?.slice(0, 8) || 'Mens.', color: theme?.colors?.phases?.menstrual || '#E53935' },
    { id: 'follicular', label: getPhaseLabel('follicular')?.slice(0, 8) || 'Foll.', color: theme?.colors?.phases?.follicular || '#F57C00' },
    { id: 'ovulatory', label: getPhaseLabel('ovulatory')?.slice(0, 8) || 'Ovu.', color: theme?.colors?.phases?.ovulatory || '#0097A7' },
    { id: 'luteal', label: getPhaseLabel('luteal')?.slice(0, 8) || 'Lutéale', color: theme?.colors?.phases?.luteal || '#673AB7' },
  ], [theme, getPhaseLabel]);
  
  const {
    entries,
    searchEntries,
    formatTrackingEmotional,
    calculateTrends,
    getPopularTags,
    deleteEntry,
    addEntry,
    addPersonalNote,
  } = useNotebookStore();

  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const { notebookFilters, setNotebookFilter } = useNavigationStore();
  const { features, config, maturityLevel } = useAdaptiveInterface();

  // États
  const filter = notebookFilters.type || 'all';
  const phaseFilter = notebookFilters.phase;
  const selectedTags = notebookFilters.tags || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [showFreeWriting, setShowFreeWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [vignetteContext, setVignetteContext] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  
  // Animation pour header premium
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Navigation vignettes
  const handleVignetteNavigation = useCallback(() => {
    const { initialPrompt, sourcePhase, sourcePersona, vignetteId, mode } = params;
    
    if (!initialPrompt && !mode && !sourcePhase) return;
    
    if (initialPrompt) {
      setVignetteContext({
        prompt: initialPrompt,
        phase: sourcePhase,
        persona: sourcePersona,
        vignetteId,
        suggestedTags: [`#${sourcePhase}`, '#vignette', '#guidé']
      });
      setShowFreeWriting(true);
    } else if (sourcePhase) {
      setVignetteContext({
        phase: sourcePhase,
        persona: sourcePersona,
        vignetteId
      });
      setNotebookFilter('phase', sourcePhase);
    }
  }, [params.initialPrompt, params.sourcePhase, params.mode, params.vignetteId, setNotebookFilter]);

  const handleVignetteNavigationRef = useRef(handleVignetteNavigation);
  handleVignetteNavigationRef.current = handleVignetteNavigation;
  
  useFocusEffect(
    useCallback(() => {
      if (params.context === 'vignette') {
        if (handleVignetteNavigationRef.current) {
          handleVignetteNavigationRef.current();
        }
      }
      
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

  // Formatters memoized
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
          Guidance {getPhaseLabel(vignetteContext.phase)}
          {vignetteContext.prompt && ` • ${vignetteContext.prompt.slice(0, 30)}...`}
        </BodyText>
      </Animated.View>
    );
  };

  // Menu filtre compact
  const hasActiveFilters = filter !== 'all' || phaseFilter || selectedTags.length > 0;
  
  const renderFilterMenu = () => {
    if (!showFilterMenu) return null;

    return (
      <Animated.View 
        style={[
          styles.filterMenu,
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
        {/* Filtres par type */}
        <View style={styles.filterSection}>
          <Caption style={styles.filterSectionTitle}>Type</Caption>
          <View style={styles.compactFilterRow}>
            {FILTER_PILLS.filter(pill => 
              maturityLevel === 'autonomous' || 
              ['all', 'personal', 'saved'].includes(pill.id)
            ).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.compactFilterPill, 
                  filter === item.id && styles.compactFilterPillActive
                ]}
                onPress={() => handleFilterChange(item.id)}
              >
                <Feather
                  name={item.icon}
                  size={12}
                  color={filter === item.id ? theme.colors.primary : theme.colors.textLight}
                />
                <BodyText style={[
                  styles.compactFilterText, 
                  filter === item.id && styles.compactFilterTextActive
                ]}>
                  {item.label}
                </BodyText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filtres phases */}
        {entries.some(entry => entry.phase) && (
          <View style={styles.filterSection}>
            <Caption style={styles.filterSectionTitle}>Phase</Caption>
            <View style={styles.compactFilterRow}>
              {PHASE_FILTERS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.compactFilterPill,
                    phaseFilter === item.id && styles.compactFilterPillActive,
                  ]}
                  onPress={() => handlePhaseFilter(item.id)}
                >
                  <View style={[styles.phaseIndicator, { backgroundColor: item.color }]} />
                  <BodyText
                    style={[
                      styles.compactFilterText,
                      phaseFilter === item.id && styles.compactFilterTextActive,
                    ]}
                  >
                    {item.label}
                  </BodyText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tags populaires */}
        {tagStats.length > 0 && features.advanced_tracking && (
          <View style={[styles.filterSection, { marginBottom: 0 }]}>
            <Caption style={styles.filterSectionTitle}>Tags populaires</Caption>
            <View style={styles.compactFilterRow}>
              {tagStats.slice(0, 6).map((item) => (
                <TouchableOpacity
                  key={item.tag}
                  style={[
                    styles.compactFilterPill, 
                    selectedTags.includes(item.tag) && styles.compactFilterPillActive
                  ]}
                  onPress={() => handleTagFilter(item.tag)}
                >
                  <BodyText
                    style={[
                      styles.compactFilterText,
                      selectedTags.includes(item.tag) && styles.compactFilterTextActive,
                    ]}
                  >
                    {item.tag}
                  </BodyText>
                  <Caption style={[
                    styles.compactFilterText,
                    { fontSize: 10, opacity: 0.7 }
                  ]}>
                    {item.count}
                  </Caption>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  // État vide amélioré
  if (entries.length === 0) {
    return (
      <ScreenContainer style={styles.container} hasTabs={true}>
        <NotebookHeader />
        
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
      <NotebookHeader 
        onToggleCalendar={() => setShowCalendarView(!showCalendarView)}
        onToggleSearch={() => setShowSearch(!showSearch)}
        showCalendar={showCalendarView}
      />

      {showCalendarView ? (
        <CalendarView onPhasePress={handlePhaseFilter} onDatePress={() => {}} />
      ) : (
        <>
          {renderVignetteContext()}

          <AnimatedSearchBar
            visible={showSearch}
            query={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />

          {renderFilterMenu()}

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
        </>
      )}

      {/* FAB iOS pour écrire - TOUJOURS visible */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setShowFreeWriting(true)}
        activeOpacity={0.8}
      >
        <Feather name="edit-3" size={22} color="white" />
      </TouchableOpacity>

      {/* Bouton filtre compact - TOUJOURS visible */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterMenu(!showFilterMenu)}
        activeOpacity={0.8}
      >
        <Feather name="filter" size={20} color={theme.colors.primary} />
        {hasActiveFilters && <View style={styles.filterDot} />}
      </TouchableOpacity>

      {/* Modales - TOUJOURS visibles, pas dans le bloc conditionnel */}
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