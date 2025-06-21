//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/notebook/SwipeableEntryIOS.jsx
// 🧩 Type : Composant UI iOS-native
// 📚 Description : Entrée carnet avec swipe actions iOS (delete, tag, share)
// 🕒 Version : 1.0 - 2025-06-21
// 🧭 Utilisé dans : NotebookView
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useRef } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  ActionSheetIOS, 
  Share, 
  Platform,
  Animated
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BodyText, Caption } from '../../core/ui/Typography';
import { theme } from '../../config/theme';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useCycle } from '../../hooks/useCycle';

const PHASE_FILTERS = [
  { id: 'menstruelle', label: 'Mens.', color: theme.colors.phases.menstrual },
  { id: 'folliculaire', label: 'Foll.', color: theme.colors.phases.follicular },
  { id: 'ovulatoire', label: 'Ovu.', color: theme.colors.phases.ovulatory },
  { id: 'lutéale', label: 'Lutéale', color: theme.colors.phases.luteal },
];

export default function SwipeableEntryIOS({
  item,
  onPress,
  formatTrackingEmotional,
  formatRelativeTime,
  getEntryIcon,
  getEntryTags,
}) {
  const { deleteEntry, addTagToEntry } = useNotebookStore();
  const { currentPhase } = useCycle();
  const translateX = useRef(new Animated.Value(0)).current;
  const panRef = useRef(null);

  const entryTags = getEntryTags(item);

  const handleLongPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const actions = ['Annuler'];
      const destructiveButtonIndex = [];
      
      // Action Tag #important
      if (!entryTags.includes('#important')) {
        actions.push('🏷️ Tag #important');
      }
      
      // Action Partager (sauf pour personal)
      if (item.type !== 'personal') {
        actions.push('📤 Partager');
      }
      
      // Action Supprimer
      actions.push('🗑️ Supprimer');
      destructiveButtonIndex.push(actions.length - 1);

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Actions sur l\'entrée',
          message: 'Que veux-tu faire ?',
          options: actions,
          cancelButtonIndex: 0,
          destructiveButtonIndex,
          userInterfaceStyle: 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return; // Annuler
          
          let actionIndex = 1;
          
          // Tag #important
          if (!entryTags.includes('#important')) {
            if (buttonIndex === actionIndex) {
              addTagToEntry(item.id, '#important');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              return;
            }
            actionIndex++;
          }
          
          // Partager
          if (item.type !== 'personal') {
            if (buttonIndex === actionIndex) {
              Share.share({
                message: item.content || formatTrackingEmotional(item),
                title: 'Mon carnet MoodCycle',
              });
              return;
            }
            actionIndex++;
          }
          
          // Supprimer
          if (buttonIndex === actionIndex) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteEntry(item.id);
          }
        }
      );
    }
  };

  const handleSwipeDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    deleteEntry(item.id);
  };

  const handleSwipeTag = () => {
    if (!entryTags.includes('#important')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addTagToEntry(item.id, '#important');
    }
  };

  return (
    <View style={styles.container}>
      {/* Actions de swipe en arrière-plan */}
      <View style={styles.swipeActionsContainer}>
        {/* Action gauche : Tag */}
        <TouchableOpacity style={styles.swipeActionLeft} onPress={handleSwipeTag}>
          <Ionicons name="pricetag" size={20} color="white" />
        </TouchableOpacity>
        
        {/* Action droite : Delete */}
        <TouchableOpacity style={styles.swipeActionRight} onPress={handleSwipeDelete}>
          <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Contenu principal de l'entrée */}
      <Animated.View style={[styles.entryCard, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          onPress={onPress}
          onLongPress={handleLongPress}
          delayLongPress={600}
          activeOpacity={0.95}
          style={styles.entryContent}
        >
          <View style={styles.entryHeader}>
            {getEntryIcon(item.type)}
            <BodyText style={styles.timestamp}>{formatRelativeTime(item.timestamp)}</BodyText>
            {item.metadata?.phase && (
              <View
                style={[
                  styles.phaseDot,
                  {
                    backgroundColor: PHASE_FILTERS.find((p) => p.id === item.metadata.phase)?.color,
                  },
                ]}
              />
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
      </Animated.View>
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