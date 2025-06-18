import React, { useState, useRef } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Modal, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import { theme } from '../../config/theme';
import { Heading, BodyText } from '../Typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import QuickTrackingModal from './QuickTrackingModal';

export default function NotebookScreen() {
  const insets = useSafeAreaInsets();
  const { entries, deleteEntry, formatTrackingEmotional, calculateTrends } = useNotebookStore();
  const [filter, setFilter] = useState('all');
  const [showQuickTracking, setShowQuickTracking] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const shareCardRef = useRef();

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

  const handleDelete = (item) => {
    Alert.alert(
      "Supprimer",
      "Supprimer cette entrée ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: () => {
            deleteEntry(item.id);
            setSelectedEntry(null);
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 0.8,
      });
      
      await Share.share({
        url: uri,
        message: 'Mon suivi MoodCycle 🌙',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager cette entrée');
    }
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

      {/* Modal détail enrichie */}
      <Modal visible={!!selectedEntry} transparent animationType="fade">
        <View style={styles.detailOverlay}>
          <View style={styles.detailModal}>
            <View ref={shareCardRef} style={styles.shareableCard}>
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderLeft}>
                  {selectedEntry && getEntryIcon(selectedEntry.type)}
                  <View style={styles.timestampContainer}>
                    <BodyText style={styles.detailTimestamp}>
                      {selectedEntry && formatRelativeTime(selectedEntry.timestamp)}
                    </BodyText>
                    <BodyText style={styles.fullDate}>
                      {selectedEntry && formatFullDate(selectedEntry.timestamp)}
                    </BodyText>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                  <MaterialIcons name="close" size={24} color={theme.colors.textLight} />
                </TouchableOpacity>
              </View>
              
              <BodyText style={styles.detailContent}>
                {selectedEntry?.content || (selectedEntry && formatTrackingEmotional(selectedEntry))}
              </BodyText>

              {/* Symptômes badges pour tracking */}
              {selectedEntry?.type === 'tracking' && selectedEntry?.metadata?.symptoms?.length > 0 && (
                <View style={styles.symptomsSection}>
                  <BodyText style={styles.symptomsSectionTitle}>Symptômes</BodyText>
                  <View style={styles.symptomsContainer}>
                    {selectedEntry.metadata.symptoms.map((symptomId) => {
                      const symptomLabels = {
                        crampes: { label: 'Crampes', color: theme.colors.phases.menstrual },
                        fatigue: { label: 'Fatigue', color: theme.colors.phases.luteal },
                        sensibilite: { label: 'Sensibilité', color: theme.colors.phases.ovulatory },
                        maux_tete: { label: 'Maux de tête', color: theme.colors.warning },
                        ballonnements: { label: 'Ballonnements', color: theme.colors.phases.follicular },
                      };
                      const symptom = symptomLabels[symptomId] || { label: symptomId, color: theme.colors.primary };
                      
                      return (
                        <View
                          key={symptomId}
                          style={[
                            styles.symptomBadge,
                            { 
                              borderColor: symptom.color,
                              backgroundColor: symptom.color + '20'
                            }
                          ]}
                        >
                          <BodyText style={[styles.symptomBadgeText, { color: symptom.color }]}>
                            {symptom.label}
                          </BodyText>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Trends pour entrées tracking */}
              {selectedEntry?.type === 'tracking' && (
                <View style={styles.trackingDetails}>
                  {renderTrendingInsight()}
                </View>
              )}
            </View>
            
            {/* Actions */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <MaterialIcons name="share" size={20} color={theme.colors.primary} />
                <BodyText style={styles.actionButtonText}>Partager</BodyText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(selectedEntry)}
              >
                <MaterialIcons name="delete" size={20} color={theme.colors.error} />
                <BodyText style={[styles.actionButtonText, { color: theme.colors.error }]}>
                  Supprimer
                </BodyText>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.detailCloseButton}
              onPress={() => setSelectedEntry(null)}
            >
              <BodyText style={styles.detailCloseText}>Fermer</BodyText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  
  // Styles modal détail
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  detailModal: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.l,
    width: '100%',
    maxHeight: '80%',
  },
  shareableCard: {
    backgroundColor: 'white',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timestampContainer: {
    marginLeft: theme.spacing.s,
    flex: 1,
  },
  detailTimestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  detailContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: theme.spacing.s,
  },
  fullDate: {
    fontSize: 10,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    marginTop: 2,
  },
  
  // Tracking details
  trackingDetails: {
    marginTop: theme.spacing.m,
  },
  
  // Symptômes section
  symptomsSection: {
    marginTop: theme.spacing.m,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  symptomsSectionTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  symptomBadge: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    marginBottom: theme.spacing.s,
  },
  symptomBadgeText: {
    fontSize: 14,
  },
  
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.m,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
  },
  deleteButton: {
    // Style spécifique si nécessaire
  },
  actionButtonText: {
    marginLeft: theme.spacing.s,
    fontSize: 14,
    color: theme.colors.primary,
  },
  
  detailCloseButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  detailCloseText: {
    color: 'white',
    fontWeight: '600',
  },
});