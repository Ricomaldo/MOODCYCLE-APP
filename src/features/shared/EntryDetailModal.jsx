//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/shared/EntryDetailModal.jsx
// 🧩 Type : Composant UI (Modal)
// 📚 Description : Modale de détail d'entrée du carnet, partageable
// 🕒 Version : 3.1 - 2025-06-21
// 🧭 Utilisé dans : NotebookView, CycleView, partages
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useRef, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import { theme } from '../../config/theme';
import { BodyText } from '../../core/ui/Typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import ShareableCard from '../../features/shared/ShareableCard';

export default function EntryDetailModal({ entries = [], visible, onClose, showActions = true }) {
  const { deleteEntry, formatTrackingEmotional, calculateTrends } = useNotebookStore();
  const [isSharing, setIsSharing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const shareCardRef = useRef();

  // Reset index when entries change or modal opens
  React.useEffect(() => {
    if (visible && entries.length > 0) {
      setCurrentIndex(0);
    }
  }, [entries, visible]);

  const currentEntry = entries[currentIndex];
  const hasMultipleEntries = entries.length > 1;

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
      month: 'short',
    });
  };

  const formatFullDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEntryIcon = (type) => {
    const iconProps = { size: 16, color: theme.colors.primary };
    switch (type) {
      case 'saved':
        return <MaterialIcons name="bookmark" {...iconProps} />;
      case 'personal':
        return <MaterialIcons name="edit" {...iconProps} />;
      case 'tracking':
        return <MaterialIcons name="bar-chart" {...iconProps} />;
      default:
        return <MaterialIcons name="edit" {...iconProps} />;
    }
  };

  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const navigateToNext = () => {
    if (currentIndex < entries.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer cette entrée ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          deleteEntry(currentEntry.id);
          // Si c'était la dernière entrée, fermer la modale
          if (entries.length === 1) {
            onClose();
          } else {
            // Ajuster l'index si nécessaire
            if (currentIndex >= entries.length - 1) {
              setCurrentIndex(Math.max(0, currentIndex - 1));
            }
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    if (!currentEntry) return;

    try {
      setIsSharing(true);

      setTimeout(async () => {
        const uri = await captureRef(shareCardRef, {
          format: 'png',
          quality: 1.0,
          result: 'tmpfile',
        });

        await Share.share({
          url: uri,
          message: 'Mes perles de sagesse MoodCycle 🌙',
        });

        setIsSharing(false);
      }, 200);
    } catch (error) {
      setIsSharing(false);
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
          <BodyText style={styles.trendText}>📍 Symptôme principal: {trends.topSymptom}</BodyText>
        )}
        <BodyText style={styles.trendSubtext}>
          {trends.entriesCount} entrée{trends.entriesCount > 1 ? 's' : ''} cette semaine
        </BodyText>
      </View>
    );
  };

  if (!currentEntry || entries.length === 0) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.detailOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.shareableCard}>
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderLeft}>
                  {getEntryIcon(currentEntry.type)}
                  <View style={styles.timestampContainer}>
                    <BodyText style={styles.detailTimestamp}>
                      {formatRelativeTime(currentEntry.timestamp)}
                    </BodyText>
                    <BodyText style={styles.fullDate}>
                      {formatFullDate(currentEntry.timestamp)}
                    </BodyText>
                  </View>
                </View>

                {/* Navigation et indicateur pour plusieurs entrées */}
                {hasMultipleEntries && (
                  <View style={styles.navigationContainer}>
                    <TouchableOpacity
                      onPress={navigateToPrevious}
                      disabled={currentIndex === 0}
                      style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
                    >
                      <MaterialIcons
                        name="chevron-left"
                        size={20}
                        color={currentIndex === 0 ? theme.colors.textLight : theme.colors.primary}
                      />
                    </TouchableOpacity>

                    <BodyText style={styles.entryIndicator}>
                      {currentIndex + 1}/{entries.length}
                    </BodyText>

                    <TouchableOpacity
                      onPress={navigateToNext}
                      disabled={currentIndex === entries.length - 1}
                      style={[
                        styles.navButton,
                        currentIndex === entries.length - 1 && styles.navButtonDisabled,
                      ]}
                    >
                      <MaterialIcons
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

                <TouchableOpacity onPress={onClose}>
                  <MaterialIcons name="close" size={24} color={theme.colors.textLight} />
                </TouchableOpacity>
              </View>

              <BodyText style={styles.detailContent}>
                {currentEntry.content || formatTrackingEmotional(currentEntry)}
              </BodyText>

              {/* Symptômes badges pour tracking */}
              {currentEntry.type === 'tracking' && currentEntry.metadata?.symptoms?.length > 0 && (
                <View style={styles.symptomsSection}>
                  <BodyText style={styles.symptomsSectionTitle}>Symptômes</BodyText>
                  <View style={styles.symptomsContainer}>
                    {currentEntry.metadata.symptoms.map((symptomId) => {
                      const symptomLabels = {
                        crampes: { label: 'Crampes', color: theme.colors.phases.menstrual },
                        fatigue: { label: 'Fatigue', color: theme.colors.phases.luteal },
                        sensibilite: { label: 'Sensibilité', color: theme.colors.phases.ovulatory },
                        maux_tete: { label: 'Maux de tête', color: theme.colors.warning },
                        ballonnements: {
                          label: 'Ballonnements',
                          color: theme.colors.phases.follicular,
                        },
                      };
                      const symptom = symptomLabels[symptomId] || {
                        label: symptomId,
                        color: theme.colors.primary,
                      };

                      return (
                        <View
                          key={symptomId}
                          style={[
                            styles.symptomBadge,
                            {
                              borderColor: symptom.color,
                              backgroundColor: symptom.color + '20',
                            },
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
              {currentEntry.type === 'tracking' && (
                <View style={styles.trackingDetails}>{renderTrendingInsight()}</View>
              )}
            </View>

            {/* Actions */}
            {showActions && (
              <View style={styles.actionButtons}>
                {currentEntry.type !== 'tracking' && (
                  <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <MaterialIcons name="share" size={20} color={theme.colors.primary} />
                    <BodyText style={styles.actionButtonText}>Partager</BodyText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <MaterialIcons name="delete" size={20} color={theme.colors.error} />
                  <BodyText style={[styles.actionButtonText, { color: theme.colors.error }]}>
                    Supprimer
                  </BodyText>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.detailCloseButton} onPress={onClose}>
              <BodyText style={styles.detailCloseText}>Fermer</BodyText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ShareableCard hors écran pour capture Instagram */}
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

const styles = StyleSheet.create({
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
    minHeight: 400, // Hauteur minimale pour éviter le redimensionnement
    flexDirection: 'column', // Structure en colonne
  },
  shareableCard: {
    backgroundColor: 'white',
    flex: 1, // Prend l'espace disponible
    marginBottom: theme.spacing.l, // Espace pour le bouton
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

  // Navigation styles
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.m,
  },
  navButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  entryIndicator: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '600',
    marginHorizontal: theme.spacing.s,
    minWidth: 30,
    textAlign: 'center',
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
    marginTop: 'auto', // Se place automatiquement en bas
  },
  detailCloseText: {
    color: 'white',
    fontWeight: '600',
  },
});
