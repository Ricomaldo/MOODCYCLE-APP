import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Heading, BodyText } from '../Typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import QuickTrackingModal from './QuickTrackingModal';
import EntryDetailModal from '../EntryDetailModal';

export default function NotebookScreen() {
  const insets = useSafeAreaInsets();
  const { entries, formatTrackingEmotional, calculateTrends } = useNotebookStore();
  const [filter, setFilter] = useState('all');
  const [showQuickTracking, setShowQuickTracking] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

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
    
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return new Date(timestamp).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatFullDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            📍 Symptôme principal: {trends.topSymptom}
          </BodyText>
        )}
        <BodyText style={styles.trendSubtext}>
          {trends.entriesCount} entrée{trends.entriesCount > 1 ? 's' : ''} cette semaine
        </BodyText>
      </View>
    );
  };

  const renderEntry = ({ item }) => (
    <TouchableOpacity 
      style={styles.entryCard}
      onPress={() => setSelectedEntry(item)}
    >
      <View style={styles.entryHeader}>
        {getEntryIcon(item.type)}
        <BodyText style={styles.timestamp}>
          {formatRelativeTime(item.timestamp)}
        </BodyText>
      </View>
      <BodyText style={styles.content} numberOfLines={3}>
        {item.content || formatTrackingEmotional(item)}
      </BodyText>
    </TouchableOpacity>
  );

  // État vide pour première utilisation
  if (entries.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Heading style={styles.title}>Mon Carnet</Heading>
        <BodyText style={styles.description}>
          Sauvegarde tes moments marquants avec Melune, écris tes ressentis, note tes observations.
        </BodyText>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => setShowQuickTracking(true)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <BodyText style={styles.startButtonText}>Commencer</BodyText>
        </TouchableOpacity>

        <QuickTrackingModal 
          visible={showQuickTracking}
          onClose={() => setShowQuickTracking(false)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Heading style={styles.title}>Mon Carnet</Heading>
      
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={item => item.id}
        style={styles.list}
        ListHeaderComponent={renderTrendingInsight}
      />

      <TouchableOpacity 
        style={[styles.fab, { bottom: theme.spacing.xl + insets.bottom + 60 }]}
        onPress={() => setShowQuickTracking(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      <QuickTrackingModal 
        visible={showQuickTracking}
        onClose={() => setShowQuickTracking(false)}
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
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.l,
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
  },
  content: {
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.l,
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