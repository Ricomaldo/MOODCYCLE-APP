//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/EntryDetailModal.jsx
// 🧩 Type: UI Component Premium
// 📚 Description: Modal détail entrée avec patterns journaling modernes
// 🕒 Version: 5.0 - 2025-06-26 - MODERN PATTERNS
// 🧭 Patterns: iOS Sheet + Context Actions + AI Insights + Navigation Fluide
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  ActionSheetIOS,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import { useTheme } from '../../hooks/useTheme';
import { Heading2, BodyText, Caption } from '../../core/ui/typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { getCurrentPhase } from '../../utils/cycleCalculations';
import ShareableCard from '../shared/ShareableCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.85;

export default function EntryDetailModal({ 
  entries = [], 
  visible, 
  onClose, 
  showActions = true,
  initialIndex = 0 
}) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const { deleteEntry, formatTrackingEmotional, calculateTrends, addTagToEntry } = useNotebookStore();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  
  // États
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isSharing, setIsSharing] = useState(false);
  const [showContextActions, setShowContextActions] = useState(false);
  const [aiInsights, setAIInsights] = useState(null);
  
  // Refs
  const shareCardRef = useRef();
  const modalTranslateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // ✅ Entry courante memoized
  const currentEntry = useMemo(() => entries[currentIndex] || null, [entries, currentIndex]);
  const hasMultipleEntries = entries.length > 1;

  // ✅ Reset index on entries change
  useEffect(() => {
    if (visible && entries.length > 0) {
      setCurrentIndex(Math.min(initialIndex, entries.length - 1));
    }
  }, [visible, entries.length, initialIndex]);

  // ✅ Animations modal iOS native
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      modalTranslateY.setValue(MODAL_HEIGHT);
      backdropOpacity.setValue(0);
      contentOpacity.setValue(0);
    }
  }, [visible]);

  // ✅ Swipe to dismiss
  const onGestureEvent = useMemo(() => 
    Animated.event([
      { nativeEvent: { translationY: modalTranslateY } }
    ], { useNativeDriver: true }), [modalTranslateY]);

  const onHandlerStateChange = useCallback((event) => {
    if (event.nativeEvent.state === 5) { // 5 = END state
      const { translationY, velocityY } = event.nativeEvent;
      
      if (translationY > 100 || velocityY > 500) {
        onClose();
      } else {
        Animated.spring(modalTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [onClose]);

  // ✅ Formatters memoized
  const formatters = useMemo(() => ({
    formatRelativeTime: (timestamp) => {
      const diff = Date.now() - timestamp;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 60) return `Il y a ${minutes}min`;
      if (hours < 24) return `Il y a ${hours}h`;
      if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
      return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    },

    formatFullDate: (timestamp) => {
      return new Date(timestamp).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    getEntryIcon: (type, phase) => {
      const color = theme.colors.phases[phase] || theme.colors.primary;
      const iconProps = { size: 18, color };
      
      switch (type) {
        case 'saved': return <Feather name="bookmark" {...iconProps} />;
        case 'personal': return <Feather name="edit-3" {...iconProps} />;
        case 'tracking': return <Feather name="bar-chart-2" {...iconProps} />;
        default: return <Feather name="edit-3" {...iconProps} />;
      }
    }
  }), [theme]);

  // ✅ AI Insights (simulation intelligence contextuelle)
  const generateAIInsights = useCallback((entry) => {
    if (!entry || entry.type === 'tracking') return null;
    
    const content = entry.content?.toLowerCase() || '';
    const insights = [];
    
    // Pattern recognition basique
    if (content.includes('fatigue') || content.includes('tired')) {
      insights.push({
        type: 'pattern',
        text: 'Tu mentionnes souvent la fatigue. Considère un sommeil plus régulier.',
        icon: 'moon'
      });
    }
    
    if (content.includes('stress') || content.includes('anxieux')) {
      insights.push({
        type: 'suggestion',
        text: 'Essaie la respiration 4-7-8 pour apaiser le stress.',
        icon: 'wind'
      });
    }
    
    if (content.includes('joie') || content.includes('heureux')) {
      insights.push({
        type: 'celebration',
        text: 'Belle énergie positive ! Continue à cultiver ces moments.',
        icon: 'sun'
      });
    }
    
    return insights.length > 0 ? insights : null;
  }, []);

  // ✅ Context Actions (Smart suggestions)
  const contextActions = useMemo(() => {
    if (!currentEntry) return [];
    
    const actions = [
      {
        id: 'tag-important',
        label: 'Marquer important',
        icon: 'star',
        color: theme.colors.warning,
        action: () => addTagToEntry(currentEntry.id, '#important')
      }
    ];
    
    if (currentEntry.type === 'personal') {
      actions.push({
        id: 'create-wisdom-card',
        label: 'Créer carte sagesse',
        icon: 'image',
        color: theme.colors.primary,
        action: handleShare
      });
    }
    
    if (currentEntry.phase) {
      actions.push({
        id: 'find-similar',
        label: `Autres entrées ${currentEntry.phase}`,
        icon: 'search',
        color: theme.colors.phases[currentEntry.phase],
        action: () => {} // TODO: Navigation vers filtered view
      });
    }
    
    return actions;
  }, [currentEntry, theme, addTagToEntry]);

  // ✅ Navigation handlers
  const navigateToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const navigateToNext = useCallback(() => {
    if (currentIndex < entries.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, entries.length]);

  // ✅ Action handlers
  const handleDelete = useCallback(() => {
    if (!currentEntry) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Supprimer cette entrée',
          message: 'Cette action est irréversible',
          options: ['Annuler', 'Supprimer'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 1,
          userInterfaceStyle: 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            deleteEntry(currentEntry.id);
            if (entries.length === 1) {
              onClose();
            } else if (currentIndex >= entries.length - 1) {
              setCurrentIndex(Math.max(0, currentIndex - 1));
            }
          }
        }
      );
    }
  }, [currentEntry, entries.length, currentIndex, deleteEntry, onClose]);

  const handleShare = useCallback(async () => {
    if (!currentEntry || currentEntry.type === 'tracking') return;

    try {
      setIsSharing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(async () => {
        const uri = await captureRef(shareCardRef, {
          format: 'png',
          quality: 1.0,
          result: 'tmpfile',
        });

        await Share.share({
          url: uri,
          message: 'Ma perle de sagesse MoodCycle 🌙',
        });

        setIsSharing(false);
      }, 200);
    } catch (error) {
      setIsSharing(false);
      Alert.alert('Erreur', 'Impossible de partager cette entrée');
    }
  }, [currentEntry]);

  // ✅ Load AI insights on entry change
  useEffect(() => {
    if (currentEntry) {
      const insights = generateAIInsights(currentEntry);
      setAIInsights(insights);
    }
  }, [currentEntry, generateAIInsights]);

  // ✅ Trending data memoized
  const trendingData = useMemo(() => {
    if (currentEntry?.type !== 'tracking') return null;
    
    const trends = calculateTrends();
    if (!trends) return null;

    return (
      <View style={styles.trendsSection}>
        <Caption style={styles.sectionTitle}>Tendances cette semaine</Caption>
        <View style={styles.trendCard}>
          <BodyText style={styles.trendText}>
            {trends.energyIcon} Énergie {trends.energyTrend}
          </BodyText>
          {trends.topSymptom && (
            <BodyText style={styles.trendText}>
              📍 Symptôme principal: {trends.topSymptom}
            </BodyText>
          )}
          <Caption style={styles.trendSubtext}>
            {trends.entriesCount} entrée{trends.entriesCount > 1 ? 's' : ''} cette semaine
          </Caption>
        </View>
      </View>
    );
  }, [currentEntry, calculateTrends]);

  if (!currentEntry || entries.length === 0) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="none">
        <View style={styles.overlay}>
          {/* Backdrop avec gesture */}
          <Animated.View 
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          >
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              onPress={onClose}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Modal avec swipe-to-dismiss */}
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.modal,
                {
                  paddingTop: insets.top + 8,
                  paddingBottom: insets.bottom,
                  transform: [{ translateY: modalTranslateY }]
                }
              ]}
            >
              {/* Handle indicator iOS */}
              <View style={styles.handle} />

              <Animated.View style={[styles.modalContent, { opacity: contentOpacity }]}>
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                  
                  {/* ═══ HEADER ZONE ═══ */}
                  <View style={styles.headerZone}>
                    <View style={styles.headerContent}>
                      <View style={styles.headerLeft}>
                        {formatters.getEntryIcon(currentEntry.type, currentEntry.phase)}
                        <View style={styles.timestampContainer}>
                          <BodyText style={styles.relativeTime}>
                            {formatters.formatRelativeTime(currentEntry.timestamp)}
                          </BodyText>
                          <Caption style={styles.fullDate}>
                            {formatters.formatFullDate(currentEntry.timestamp)}
                          </Caption>
                        </View>
                      </View>

                      {/* Navigation fluide */}
                      {hasMultipleEntries && (
                        <View style={styles.navigationContainer}>
                          <TouchableOpacity
                            onPress={navigateToPrevious}
                            disabled={currentIndex === 0}
                            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
                          >
                            <Feather
                              name="chevron-left"
                              size={20}
                              color={currentIndex === 0 ? theme.colors.textLight : theme.colors.primary}
                            />
                          </TouchableOpacity>

                          <View style={styles.progressIndicator}>
                            <BodyText style={styles.entryIndicator}>
                              {currentIndex + 1}/{entries.length}
                            </BodyText>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { width: `${((currentIndex + 1) / entries.length) * 100}%` }
                                ]} 
                              />
                            </View>
                          </View>

                          <TouchableOpacity
                            onPress={navigateToNext}
                            disabled={currentIndex === entries.length - 1}
                            style={[
                              styles.navButton,
                              currentIndex === entries.length - 1 && styles.navButtonDisabled,
                            ]}
                          >
                            <Feather
                              name="chevron-right"
                              size={20}
                              color={
                                currentIndex === entries.length - 1
                                  ? theme.colors.textLight
                                  : theme.colors.primary
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color={theme.colors.textLight} />
                      </TouchableOpacity>
                    </View>

                    {/* Phase indicator */}
                    {currentEntry.phase && (
                      <View style={styles.phaseIndicator}>
                        <View 
                          style={[
                            styles.phaseDot, 
                            { backgroundColor: theme.colors.phases[currentEntry.phase] }
                          ]} 
                        />
                        <Caption style={[
                          styles.phaseLabel,
                          { color: theme.colors.phases[currentEntry.phase] }
                        ]}>
                          Phase {currentEntry.phase}
                        </Caption>
                      </View>
                    )}
                  </View>

                  {/* ═══ CONTENT ZONE ═══ */}
                  <View style={styles.contentZone}>
                    <BodyText style={styles.entryContent}>
                      {currentEntry.content || formatTrackingEmotional(currentEntry)}
                    </BodyText>

                    {/* Tags */}
                    {currentEntry.tags?.length > 0 && (
                      <View style={styles.tagsSection}>
                        <View style={styles.tagsContainer}>
                          {currentEntry.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                              <Caption style={styles.tagText}>{tag}</Caption>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Symptoms pour tracking */}
                    {currentEntry.type === 'tracking' && currentEntry.metadata?.symptoms?.length > 0 && (
                      <View style={styles.symptomsSection}>
                        <Caption style={styles.sectionTitle}>Symptômes ressentis</Caption>
                        <View style={styles.symptomsGrid}>
                          {currentEntry.metadata.symptoms.map((symptomId) => {
                            const symptomLabels = {
                              crampes: { label: 'Crampes', emoji: '🤕', color: theme.colors.phases.menstrual },
                              fatigue: { label: 'Fatigue', emoji: '😴', color: theme.colors.phases.luteal },
                              sensibilite: { label: 'Sensibilité', emoji: '🥺', color: theme.colors.phases.ovulatory },
                            };
                            const symptom = symptomLabels[symptomId] || { label: symptomId, emoji: '📝', color: theme.colors.primary };

                            return (
                              <View key={symptomId} style={[styles.symptomChip, { borderColor: symptom.color }]}>
                                <BodyText style={styles.symptomEmoji}>{symptom.emoji}</BodyText>
                                <Caption style={[styles.symptomLabel, { color: symptom.color }]}>
                                  {symptom.label}
                                </Caption>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    {/* Trending data pour tracking */}
                    {trendingData}

                    {/* AI Insights */}
                    {aiInsights && (
                      <View style={styles.aiInsightsSection}>
                        <Caption style={styles.sectionTitle}>💡 Insights MéLune</Caption>
                        {aiInsights.map((insight, index) => (
                          <View key={index} style={styles.insightCard}>
                            <Feather name={insight.icon} size={16} color={theme.colors.primary} />
                            <BodyText style={styles.insightText}>{insight.text}</BodyText>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* ═══ ACTIONS ZONE ═══ */}
                  {showActions && (
                    <View style={styles.actionsZone}>
                      {/* Context actions */}
                      <View style={styles.contextActions}>
                        {contextActions.slice(0, 3).map((action) => (
                          <TouchableOpacity
                            key={action.id}
                            style={[styles.contextAction, { borderColor: action.color }]}
                            onPress={action.action}
                          >
                            <Feather name={action.icon} size={18} color={action.color} />
                            <Caption style={[styles.contextActionText, { color: action.color }]}>
                              {action.label}
                            </Caption>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Primary actions */}
                      <View style={styles.primaryActions}>
                        {currentEntry.type !== 'tracking' && (
                          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                            <Feather name="share" size={20} color="white" />
                            <BodyText style={styles.shareButtonText}>Partager</BodyText>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                          <Feather name="trash-2" size={20} color={theme.colors.error} />
                          <BodyText style={[styles.deleteButtonText, { color: theme.colors.error }]}>
                            Supprimer
                          </BodyText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                </ScrollView>
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </Modal>

      {/* Shareable card (hidden) */}
      {isSharing && (
        <ShareableCard
          ref={shareCardRef}
          message={currentEntry.content || 'Ma perle de sagesse MoodCycle'}
          visible={true}
        />
      )}
    </>
  );
}

const getStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: MODAL_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // ═══ HEADER ZONE ═══
  headerZone: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '40',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  timestampContainer: {
    marginLeft: 12,
    flex: 1,
  },
  relativeTime: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  fullDate: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  progressIndicator: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  entryIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  progressBar: {
    width: 40,
    height: 2,
    backgroundColor: theme.colors.border,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
  },
  closeButton: {
    padding: 8,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ═══ CONTENT ZONE ═══
  contentZone: {
    flex: 1,
  },
  entryContent: {
    fontSize: 17,
    lineHeight: 26,
    color: theme.colors.text,
    marginBottom: 20,
  },
  tagsSection: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    ...theme.getGlassmorphismStyle(theme.colors.primary, {
      bgOpacity: theme.glassmorphism.opacity.bg,
      borderOpacity: theme.glassmorphism.opacity.border,
      borderWidth: 1,
      shadowOpacity: 0,  // Pas de shadow sur les tags
    }),
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  symptomsSection: {
    marginBottom: 20,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  symptomEmoji: {
    fontSize: 14,
  },
  symptomLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendsSection: {
    marginBottom: 20,
  },
  trendCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  trendText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  trendSubtext: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 8,
  },
  aiInsightsSection: {
    marginBottom: 20,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primary + '08',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },

  // ═══ ACTIONS ZONE ═══
  actionsZone: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '40',
  },
  contextActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  contextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  contextActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  deleteButtonText: {
    fontWeight: '500',
    fontSize: 16,
  },
});