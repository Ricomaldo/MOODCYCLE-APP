//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/notebook/QuickTrackingModal.jsx
// 🧩 Type: UI Component
// 📚 Description: Modal de saisie rapide pour le suivi d’humeur, énergie et symptômes dans le carnet
// 🕒 Version: 3.0 - 2025-06-21
// 🧭 Used in: notebook screen, quick tracking, shared notebook UI
// ─────────────────────────────────────────────────────────
//
import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Heading2, BodyText } from '../../core/ui/Typography';
import { useNotebookStore } from '../../stores/useNotebookStore';

const ENERGY_EMOJIS = ['😴', '😐', '🙂', '😊', '🤩'];
const MOOD_OPTIONS = [
  { emoji: '😢', label: 'Triste', value: 'sad' },
  { emoji: '😐', label: 'Neutre', value: 'neutral' },
  { emoji: '😊', label: 'Bien', value: 'good' },
  { emoji: '😍', label: 'Super', value: 'great' },
  { emoji: '🤩', label: 'Génial', value: 'amazing' },
];

const SYMPTOMS = [
  { id: 'crampes', label: 'Crampes', color: theme.colors.phases.menstrual },
  { id: 'fatigue', label: 'Fatigue', color: theme.colors.phases.luteal },
  {
    id: 'sensibilite',
    label: 'Sensibilité',
    color: theme.colors.phases.ovulatory,
  },
  { id: 'maux_tete', label: 'Maux de tête', color: theme.colors.warning },
  {
    id: 'ballonnements',
    label: 'Ballonnements',
    color: theme.colors.phases.follicular,
  },
];

export default function QuickTrackingModal({ visible, onClose }) {
  const { addQuickTracking } = useNotebookStore();
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState('neutral');
  const [symptoms, setSymptoms] = useState([]);

  const handleSymptomToggle = (symptomId) => {
    setSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    );
  };

  const handleSave = () => {
    addQuickTracking(energy, mood, symptoms);

    // Reset et fermer
    setEnergy(3);
    setMood('neutral');
    setSymptoms([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Heading2 style={styles.title}>Comment tu te sens ?</Heading2>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Énergie */}
            <View style={styles.section}>
              <BodyText style={styles.sectionTitle}>
                Niveau d'énergie {ENERGY_EMOJIS[energy]}
              </BodyText>
              <View style={styles.energyContainer}>
                <TouchableOpacity
                  style={styles.energyButton}
                  onPress={() => setEnergy(Math.max(0, energy - 1))}
                >
                  <BodyText style={styles.energyButtonText}>-</BodyText>
                </TouchableOpacity>

                <View style={styles.energyTrack}>
                  <View style={[styles.energyIndicator, { left: `${(energy / 4) * 100}%` }]} />
                </View>

                <TouchableOpacity
                  style={styles.energyButton}
                  onPress={() => setEnergy(Math.min(4, energy + 1))}
                >
                  <BodyText style={styles.energyButtonText}>+</BodyText>
                </TouchableOpacity>
              </View>

              {/* Points énergie */}
              <View style={styles.energyDots}>
                {ENERGY_EMOJIS.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setEnergy(index)}
                    style={[styles.energyDot, energy === index && styles.energyDotActive]}
                  >
                    <BodyText style={styles.energyEmoji}>{emoji}</BodyText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Humeur */}
            <View style={styles.section}>
              <BodyText style={styles.sectionTitle}>Humeur générale</BodyText>
              <View style={styles.moodContainer}>
                {MOOD_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.moodOption, mood === option.value && styles.moodOptionActive]}
                    onPress={() => setMood(option.value)}
                  >
                    <BodyText style={styles.moodEmoji}>{option.emoji}</BodyText>
                    <BodyText style={styles.moodLabel}>{option.label}</BodyText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Symptômes */}
            <View style={styles.section}>
              <BodyText style={styles.sectionTitle}>Symptômes (optionnel)</BodyText>
              <View style={styles.symptomsContainer}>
                {SYMPTOMS.map((symptom) => (
                  <TouchableOpacity
                    key={symptom.id}
                    style={[
                      styles.symptomPill,
                      { borderColor: symptom.color },
                      symptoms.includes(symptom.id) && {
                        backgroundColor: symptom.color + '20',
                      },
                    ]}
                    onPress={() => handleSymptomToggle(symptom.id)}
                  >
                    <BodyText
                      style={[
                        styles.symptomText,
                        symptoms.includes(symptom.id) && {
                          color: symptom.color,
                        },
                      ]}
                    >
                      {symptom.label}
                    </BodyText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bouton sauvegarder */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <MaterialIcons name="save" size={20} color="white" />
              <BodyText style={styles.saveButtonText}>Sauvegarder</BodyText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    maxHeight: '80%',
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.l,
  },
  title: {
    color: theme.colors.primary,
  },
  closeButton: {
    padding: theme.spacing.s,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },

  // Énergie styles (inspiré de preferences.jsx)
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  energyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
  },
  energyTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.primary + '30',
    borderRadius: 2,
    marginHorizontal: theme.spacing.m,
    position: 'relative',
  },
  energyIndicator: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  energyDots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  energyDot: {
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.small,
    minHeight: 40, // ← Ajoute ça pour éviter la coupure
    minWidth: 40, // ← Et ça
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyDotActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  energyEmoji: {
    fontSize: 20,
    textAlign: 'center', // ← Centrage parfait
  },

  // Humeur styles
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodOption: {
    alignItems: 'center',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    minWidth: 60,
  },
  moodOptionActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  moodLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
  },

  // Symptômes styles
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  symptomPill: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  symptomText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },

  // Bouton save
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.l,
  },
  saveButtonText: {
    color: 'white',
    fontFamily: theme.fonts.bodyBold,
    marginLeft: theme.spacing.s,
  },
});
