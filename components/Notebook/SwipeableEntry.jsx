// components/Notebook/SwipeableEntry.jsx
import React from 'react';
import { 
  View, TouchableOpacity, StyleSheet, Alert, Share 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { BodyText, Caption } from '../Typography';
import { useNotebookStore } from '../../stores/useNotebookStore';

export default function SwipeableEntry({ 
  item, 
  onPress, 
  formatTrackingEmotional,
  formatRelativeTime,
  getEntryIcon,
  getEntryTags 
}) {
  const { deleteEntry, addTagToEntry } = useNotebookStore();
  const entryTags = getEntryTags(item);

  const handleLongPress = () => {
    Alert.alert(
      "Actions",
      "Que veux-tu faire ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Tag #important", 
          onPress: () => {
            if (!entryTags.includes('#important')) {
              addTagToEntry(item.id, '#important');
            }
          }
        },
        { 
          text: "Partager", 
          onPress: handleShare 
        },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: handleDelete 
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: item.content || formatTrackingEmotional(item),
        title: 'Mon carnet MoodCycle'
      });
    } catch (error) {
      console.warn('Erreur partage:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer",
      "Supprimer cette entrée ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: () => deleteEntry(item.id)
        }
      ]
    );
  };

  const getPhaseDotColor = () => {
    const phaseColors = {
      menstruelle: theme.colors.phases.menstrual,
      folliculaire: theme.colors.phases.follicular,
      ovulatoire: theme.colors.phases.ovulatory,
      lutéale: theme.colors.phases.luteal
    };
    return phaseColors[item.metadata?.phase] || theme.colors.textLight;
  };

  return (
    <TouchableOpacity 
      style={styles.entryCard}
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={800}
      activeOpacity={0.95}
    >
      <View style={styles.entryHeader}>
        {getEntryIcon(item.type)}
        <BodyText style={styles.timestamp}>
          {formatRelativeTime(item.timestamp)}
        </BodyText>
        {item.metadata?.phase && (
          <View style={[
            styles.phaseDot,
            { backgroundColor: getPhaseDotColor() }
          ]} />
        )}
      </View>
      
      <BodyText style={styles.content} numberOfLines={3}>
        {item.content || formatTrackingEmotional(item)}
      </BodyText>
      
      {/* Tags */}
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

      {/* Indicateur long press */}
      <View style={styles.actionIndicator}>
        <MaterialIcons name="more-horiz" size={16} color={theme.colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    position: 'relative',
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
  actionIndicator: {
    position: 'absolute',
    right: theme.spacing.s,
    top: theme.spacing.s,
    opacity: 0.3,
  },
});