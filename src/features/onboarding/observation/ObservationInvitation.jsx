//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/onboarding/observation/ObservationInvitation.jsx
// 🎯 Status: ✅ NOUVEAU - Composant d'invitation à l'observation
// 📝 Description: Invite l'utilisateur à faire sa première observation pendant l'onboarding
// 🔄 Cycle: Onboarding - Étape 8 (Préférences)
// ─────────────────────────────────────────────────────────
//
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { BodyText, Caption } from '../../../core/ui/typography';
import MeluneAvatar from '../../shared/MeluneAvatar';

export function ObservationInvitation({ 
  persona = 'emma', 
  theme: themeProp, 
  onObservation, 
  visible = false 
}) {
  const theme = useTheme();
  const currentTheme = themeProp || theme;
  const [showModal, setShowModal] = useState(false);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);

  const styles = getStyles(currentTheme);

  const handleInvitationPress = () => {
    setShowModal(true);
  };

  const handleObservationSubmit = () => {
    const observationData = {
      mood,
      energy,
      timestamp: Date.now(),
      context: 'onboarding_preferences'
    };
    
    onObservation(observationData);
    setShowModal(false);
  };

  const getPersonaMessage = () => {
    const messages = {
      emma: "Aide-moi à te connaître : comment te sens-tu maintenant ?",
      laure: "Première donnée pour optimiser : ton ressenti actuel ?",
      clara: "Commençons par capturer ton énergie du moment !",
      sylvie: "Partageons ce moment : comment vas-tu ?",
      christine: "Première observation ensemble : ton état présent ?"
    };
    return messages[persona] || messages.emma;
  };

  const getMoodLabel = (value) => {
    if (value <= 1) return "Très bas";
    if (value <= 2) return "Bas";
    if (value <= 3) return "Neutre";
    if (value <= 4) return "Bon";
    return "Excellent";
  };

  const getEnergyLabel = (value) => {
    if (value <= 1) return "Très faible";
    if (value <= 2) return "Faible";
    if (value <= 3) return "Modérée";
    if (value <= 4) return "Élevée";
    return "Très élevée";
  };

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity 
        style={styles.invitationCard}
        onPress={handleInvitationPress}
        activeOpacity={0.8}
      >
        <View style={styles.invitationContent}>
          <View style={styles.meluneContainer}>
            <MeluneAvatar size={40} />
          </View>
          <View style={styles.textContainer}>
            <BodyText style={styles.invitationTitle}>
              💫 Première observation ensemble
            </BodyText>
            <Caption style={styles.invitationMessage}>
              {getPersonaMessage()}
            </Caption>
          </View>
          <Feather name="plus-circle" size={24} color={currentTheme.colors.primary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MeluneAvatar size={50} />
              <BodyText style={styles.modalTitle}>
                Comment te sens-tu ?
              </BodyText>
            </View>

            {/* Mood Slider */}
            <View style={styles.sliderContainer}>
              <BodyText style={styles.sliderLabel}>Humeur</BodyText>
              <View style={styles.sliderTrack}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.sliderDot,
                      mood >= value && styles.sliderDotActive
                    ]}
                    onPress={() => setMood(value)}
                  />
                ))}
              </View>
              <Caption style={styles.sliderValue}>
                {getMoodLabel(mood)}
              </Caption>
            </View>

            {/* Energy Slider */}
            <View style={styles.sliderContainer}>
              <BodyText style={styles.sliderLabel}>Énergie</BodyText>
              <View style={styles.sliderTrack}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.sliderDot,
                      energy >= value && styles.sliderDotActive
                    ]}
                    onPress={() => setEnergy(value)}
                  />
                ))}
              </View>
              <Caption style={styles.sliderValue}>
                {getEnergyLabel(energy)}
              </Caption>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <BodyText style={styles.cancelButtonText}>
                  Plus tard
                </BodyText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleObservationSubmit}
              >
                <BodyText style={styles.submitButtonText}>
                  Enregistrer
                </BodyText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const getStyles = (theme) => StyleSheet.create({
  invitationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.l,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.l,
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  invitationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
  },

  meluneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  textContainer: {
    flex: 1,
  },

  invitationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },

  invitationMessage: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },

  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 320,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  modalHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.m,
    textAlign: 'center',
  },

  sliderContainer: {
    marginBottom: theme.spacing.l,
  },

  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },

  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },

  sliderDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.border,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },

  sliderDotActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  sliderValue: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginTop: theme.spacing.xl,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textLight,
  },

  submitButton: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },

  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
}); 