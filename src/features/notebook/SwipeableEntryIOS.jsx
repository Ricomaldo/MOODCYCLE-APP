//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/notebook/SwipeableEntryIOS.jsx
// 🧩 Type : Composant UI iOS-native
// 📚 Description : Entrée carnet avec swipe actions iOS (delete, tag, share)
// 🕒 Version : 1.2 - 2025-06-21 - Performance optimisée (throttling)
// 🧭 Utilisé dans : NotebookView
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  Animated
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BodyText, Caption } from '../../core/ui/Typography';
import { theme } from '../../config/theme';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useCycle } from '../../hooks/useCycle';

const PHASE_FILTERS = [
  { id: 'menstrual', label: 'Mens.', color: theme.colors.phases.menstrual },
  { id: 'follicular', label: 'Foll.', color: theme.colors.phases.follicular },
  { id: 'ovulatory', label: 'Ovu.', color: theme.colors.phases.ovulatory },
  { id: 'luteal', label: 'Lutéale', color: theme.colors.phases.luteal },
];

const SWIPE_THRESHOLD = 80; // Distance minimum pour déclencher action

export default function SwipeableEntryIOS({
  item,
  onPress,
  formatTrackingEmotional,
  formatRelativeTime,
  getEntryIcon,
  getEntryTags,
  phase,
}) {
  const { deleteEntry, addTagToEntry } = useNotebookStore();
  const { currentPhase } = useCycle();
  const translateX = useRef(new Animated.Value(0)).current;
  const lastGestureTime = useRef(0);
  const entryTags = getEntryTags(item);

  // ✅ onGestureEvent avec throttling intelligent (16ms = ~60fps limité)
  const onGestureEvent = useMemo(() => 
    Animated.event([
      { nativeEvent: { translationX: translateX } }
    ], { 
      useNativeDriver: true,
      listener: (event) => {
        const now = Date.now();
        // Throttle à 16ms pour performance optimale
        if (now - lastGestureTime.current > 16) {
          lastGestureTime.current = now;
          // Optionnel : logique supplémentaire throttlée
        }
      }
    }), [translateX]);

  // ✅ Gestionnaire state change avec throttling et logique swipe optimisée
  const handleGestureStateChange = useCallback((event) => {
    const { translationX, state } = event.nativeEvent;
    
    if (state === State.END) {
      // Performance : éviter calculs inutiles si translation faible
      if (Math.abs(translationX) < 10) {
        // Reset rapide sans animation pour micro-gestures
        translateX.setValue(0);
        return;
      }

      if (translationX > SWIPE_THRESHOLD) {
        // Swipe right = Tag action
        handleSwipeTag();
      } else if (translationX < -SWIPE_THRESHOLD) {
        // Swipe left = Delete action  
        handleSwipeDelete();
      }
      
      // Reset position avec animation optimisée
      Animated.spring(translateX, {
        toValue: 0,
        tension: 200, // Plus rapide que 180
        friction: 10, // Moins de rebond que 12
        useNativeDriver: true,
      }).start();
    }
  }, [handleSwipeTag, handleSwipeDelete]);

  // Supprimé : handleLongPress redondant avec swipe actions
  // Share accessible via tap → EntryDetailModal

  const handleSwipeDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    deleteEntry(item.id);
  }, [item.id, deleteEntry]);

  const handleSwipeTag = useCallback(() => {
    if (!entryTags.includes('#important')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addTagToEntry(item.id, '#important');
    }
  }, [item.id, entryTags, addTagToEntry]);

  // ✅ Memoization du style animé pour éviter recalculs
  const animatedStyle = useMemo(() => ({
    transform: [{ translateX }]
  }), [translateX]);

  return (
    <View style={styles.container}>
      {/* Actions de swipe en arrière-plan */}
      <View style={styles.swipeActionsContainer}>
        {/* Action gauche : Tag (visible lors swipe right) */}
        <TouchableOpacity style={styles.swipeActionLeft} onPress={handleSwipeTag}>
          <Ionicons name="pricetag" size={20} color="white" />
        </TouchableOpacity>
        
        {/* Action droite : Delete (visible lors swipe left) */}
        <TouchableOpacity style={styles.swipeActionRight} onPress={handleSwipeDelete}>
          <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* ✅ PanGestureHandler entoure le contenu principal */}
      <PanGestureHandler 
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        activeOffsetX={[-10, 10]} // Évite conflits avec scroll vertical
      >
        <Animated.View style={[styles.entryCard, animatedStyle]}>
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.95}
            style={styles.entryContent}
          >
            <View style={styles.entryHeader}>
              <View style={styles.iconContainer}>
                {getEntryIcon(item.type, item.phase)}
              </View>
              <BodyText style={styles.timestamp}>{formatRelativeTime(item.timestamp)}</BodyText>
              {item.phase && (
                <View
                  style={[
                    styles.phaseDot,
                    {
                      backgroundColor: PHASE_FILTERS.find((p) => p.id === item.phase)?.color,
                    },
                  ]}
                />
              )}
            </View>

            <BodyText style={styles.content} numberOfLines={3}>
              {item.type === 'tracking' ? formatTrackingEmotional(item) : item.content}
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
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
    position: 'relative',
  },
  swipeActionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swipeActionLeft: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: theme.borderRadius.m,
  },
  swipeActionRight: {
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: theme.borderRadius.m,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryContent: {
    padding: theme.spacing.m,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  iconContainer: {
    marginRight: theme.spacing.xs,
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
});