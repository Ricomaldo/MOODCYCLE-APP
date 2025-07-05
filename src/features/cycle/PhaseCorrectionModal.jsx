//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/cycle/PhaseCorrectionModal.jsx
// 🧩 Type: Modal Component
// 📚 Description: Interface douce correction phase avec empathie temporelle
// 🕒 Version: 1.0 - Mission Beta
// 🧭 Used in: CycleView
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Animated,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useTerminology } from '../../hooks/useTerminology';
import { useQuickObservation } from '../../hooks/useQuickObservation';
import { Heading2, BodyText, Caption } from '../../core/ui/typography';
import { PhaseIcon } from '../../config/iconConstants';
import { PHASE_METADATA } from '../../utils/cycleCalculations';

// Empathie temporelle : messages selon phase actuelle
const EMPATHY_MESSAGES = {
  menstrual: {
    title: "Comment te sens-tu vraiment ?",
    subtitle: "C'est normal que les ressentis varient pendant cette phase",
    guidance: "Prends ton temps, écoute ton corps sans pression"
  },
  follicular: {
    title: "Quelle phase ressens-tu ?",
    subtitle: "Ton énergie monte peut-être différemment",
    guidance: "Fais confiance à tes sensations"
  },
  ovulatory: {
    title: "Ajuste selon ton ressenti",
    subtitle: "Chaque cycle est unique",
    guidance: "Tu es la mieux placée pour savoir"
  },
  luteal: {
    title: "Besoin d'ajuster ?",
    subtitle: "Les transitions peuvent être subtiles",
    guidance: "C'est ok si tu n'es pas sûre"
  }
};

export default function PhaseCorrectionModal({ 
  visible, 
  onClose, 
  currentPhase,
  predictedPhase 
}) {
  const theme = useTheme();
  const { getPhaseLabel, getArchetypeLabel } = useTerminology();
  const { correctPhase, confidence, isHybridMode } = useQuickObservation();
  
  const [selectedPhase, setSelectedPhase] = useState(currentPhase);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  const handlePhaseSelect = (phase) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPhase(phase);
    
    if (phase !== currentPhase) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    if (selectedPhase !== currentPhase) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Correction via hook
      const result = correctPhase(selectedPhase);
      
      // Feedback visuel
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
      
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      onClose();
    }
  };

  const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
  const empathyData = EMPATHY_MESSAGES[currentPhase] || EMPATHY_MESSAGES.follicular;
  
  const styles = getStyles(theme);

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.modal,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Header avec empathie */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Heading2 style={styles.title}>{empathyData.title}</Heading2>
              <Caption style={styles.subtitle}>{empathyData.subtitle}</Caption>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Guidance douce */}
          <View style={styles.guidanceContainer}>
            <Feather name="heart" size={16} color={theme.colors.primary} />
            <Caption style={styles.guidanceText}>{empathyData.guidance}</Caption>
          </View>

          {/* Phase actuelle vs prédite */}
          {predictedPhase !== currentPhase && (
            <View style={styles.comparisonCard}>
              <View style={styles.comparisonRow}>
                <Caption style={styles.comparisonLabel}>L'app suggère :</Caption>
                <BodyText style={styles.comparisonValue}>
                  {getPhaseLabel(predictedPhase)}
                </BodyText>
              </View>
              <View style={styles.comparisonRow}>
                <Caption style={styles.comparisonLabel}>Tu ressens :</Caption>
                <BodyText style={[styles.comparisonValue, styles.currentValue]}>
                  {getPhaseLabel(currentPhase)}
                </BodyText>
              </View>
            </View>
          )}

          {/* Sélecteur de phases visuel */}
          <ScrollView 
            style={styles.phasesContainer}
            showsVerticalScrollIndicator={false}
          >
            {phases.map((phase) => {
              const isSelected = selectedPhase === phase;
              const isCurrent = currentPhase === phase;
              
              return (
                <TouchableOpacity
                  key={phase}
                  style={[
                    styles.phaseCard,
                    isSelected && styles.phaseCardSelected,
                    isSelected && theme.getPhaseGlassmorphismStyle(phase, {
                      bgOpacity: 0.15,
                      borderOpacity: 0.3,
                      borderWidth: 2,
                    })
                  ]}
                  onPress={() => handlePhaseSelect(phase)}
                  activeOpacity={0.7}
                >
                  <View style={styles.phaseContent}>
                    <PhaseIcon 
                      phaseKey={phase}
                      size={32}
                      color={isSelected ? theme.colors.phases[phase] : theme.colors.textLight}
                    />
                    <View style={styles.phaseTexts}>
                      <BodyText style={[
                        styles.phaseName,
                        isSelected && { color: theme.colors.phases[phase] }
                      ]}>
                        {getPhaseLabel(phase)}
                      </BodyText>
                      <Caption style={styles.phaseArchetype}>
                        {getArchetypeLabel(phase)}
                      </Caption>
                    </View>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Caption style={styles.currentText}>Actuelle</Caption>
                      </View>
                    )}
                  </View>
                  
                  {/* Description phase au tap */}
                  {isSelected && (
                    <Animated.View style={styles.phaseDescription}>
                      <Caption style={styles.descriptionText}>
                        {PHASE_METADATA[phase].description}
                      </Caption>
                    </Animated.View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Mode observation info */}
          {isHybridMode && (
            <View style={styles.modeInfo}>
              <Feather name="info" size={14} color={theme.colors.primary} />
              <Caption style={styles.modeText}>
                Mode hybride : j'apprends de tes corrections pour m'adapter
              </Caption>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {showConfirmation && selectedPhase !== currentPhase ? (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowConfirmation(false)}
                >
                  <BodyText style={styles.cancelText}>Annuler</BodyText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.button, 
                    styles.confirmButton,
                    { backgroundColor: theme.colors.phases[selectedPhase] }
                  ]}
                  onPress={handleConfirm}
                >
                  <Feather name="check" size={20} color="#fff" />
                  <BodyText style={styles.confirmText}>
                    Confirmer {getPhaseLabel(selectedPhase)}
                  </BodyText>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.button, styles.closeOnlyButton]}
                onPress={onClose}
              >
                <BodyText style={styles.closeText}>Fermer</BodyText>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.m,
  },
  headerContent: {
    flex: 1,
    paddingRight: theme.spacing.m,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.textLight,
    fontSize: 14,
  },
  closeButton: {
    padding: theme.spacing.s,
  },
  guidanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    gap: theme.spacing.s,
  },
  guidanceText: {
    flex: 1,
    color: theme.colors.primary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  comparisonCard: {
    marginHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.m,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  comparisonLabel: {
    color: theme.colors.textLight,
    fontSize: 12,
  },
  comparisonValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  currentValue: {
    color: theme.colors.primary,
  },
  phasesContainer: {
    maxHeight: 300,
    paddingHorizontal: theme.spacing.l,
  },
  phaseCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  phaseCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  phaseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  phaseTexts: {
    flex: 1,
    marginLeft: theme.spacing.m,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  phaseArchetype: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 12,
  },
  currentText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  phaseDescription: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m,
    paddingTop: 0,
  },
  descriptionText: {
    color: theme.colors.textLight,
    fontSize: 12,
    lineHeight: 18,
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: theme.spacing.l,
    marginTop: theme.spacing.m,
    padding: theme.spacing.s,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.s,
    gap: theme.spacing.xs,
  },
  modeText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.primary,
  },
  actions: {
    flexDirection: 'row',
    padding: theme.spacing.l,
    paddingTop: theme.spacing.m,
    gap: theme.spacing.m,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.s,
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: {
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeOnlyButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
});