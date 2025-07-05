//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/notebook/QuickTrackingModal.jsx
// 🧩 Type: UI Component Premium
// 📚 Description: Modal de tracking élégant avec symptômes étendus
// 🕒 Version: 4.1 - 2025-06-29 - AJOUT OBSERVATIONS CYCLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Heading2, BodyText, Caption } from '../../core/ui/typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useCycleStore, getCycleDataAdaptive } from '../../stores/useCycleStore';
import { useUserIntelligence } from '../../stores/useUserIntelligence';
import { getCurrentPhase } from '../../utils/cycleCalculations';

const MOOD_OPTIONS = [
  { emoji: '😢', label: 'Maussade', value: 'sad' },
  { emoji: '😐', label: 'Moyenne', value: 'neutral' },
  { emoji: '😊', label: 'Bonne', value: 'good' },
  { emoji: '😍', label: 'Très bonne', value: 'great' },
  { emoji: '🤩', label: 'Excellente', value: 'amazing' },
];

const ENERGY_LEVELS = [
  { level: 1, icon: '🔋', color: '#F44336' },
  { level: 2, icon: '🔋', color: '#FF9800' },
  { level: 3, icon: '⚡', color: '#FFC107' },
  { level: 4, icon: '⚡', color: '#8BC34A' },
  { level: 5, icon: '⚡', color: '#4CAF50' },
];

export default function QuickTrackingModal({ visible, onClose, defaultTags = [] }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { addQuickTracking } = useNotebookStore();
  const cycleData = getCycleDataAdaptive();
  const addObservation = useCycleStore((state) => state.addObservation);
  const { trackObservation } = useUserIntelligence();
  const { currentPhase, cycleMode, isObservationBased } = cycleData;
  
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState('neutral');
  const [symptoms, setSymptoms] = useState([]);
  const [activeTab, setActiveTab] = useState('sorciere'); // 'sorciere', 'jeune_fille', 'mere', 'enchanteresse'
  
  // Symptômes groupés par archétypes Miranda Gray
  const SYMPTOMS_SORCIERE = [
    { id: 'intuition', label: 'Intuition forte', emoji: '🔮', color: theme.colors.phases.menstrual },
    { id: 'introspection', label: 'Besoin solitude', emoji: '🌙', color: theme.colors.phases.menstrual },
    { id: 'crampes', label: 'Crampes', emoji: '🤕', color: theme.colors.phases.menstrual },
    { id: 'fatigue', label: 'Fatigue sacrée', emoji: '😴', color: theme.colors.phases.menstrual },
  ];

  const SYMPTOMS_JEUNE_FILLE = [
    { id: 'creativite', label: 'Créativité', emoji: '✨', color: theme.colors.phases.follicular },
    { id: 'energie', label: 'Énergie montante', emoji: '🌱', color: theme.colors.phases.follicular },
    { id: 'curiosite', label: 'Curiosité', emoji: '👀', color: theme.colors.phases.follicular },
    { id: 'optimisme', label: 'Optimisme', emoji: '😊', color: theme.colors.phases.follicular },
  ];

  const SYMPTOMS_MERE = [
    { id: 'rayonnement', label: 'Rayonnement', emoji: '☀️', color: theme.colors.phases.ovulatory },
    { id: 'communication', label: 'Facilité sociale', emoji: '💬', color: theme.colors.phases.ovulatory },
    { id: 'sensualite', label: 'Sensualité', emoji: '🌺', color: theme.colors.phases.ovulatory },
    { id: 'confiance', label: 'Confiance', emoji: '👑', color: theme.colors.phases.ovulatory },
  ];

  const SYMPTOMS_ENCHANTERESSE = [
    { id: 'organisation', label: 'Besoin organiser', emoji: '📋', color: theme.colors.phases.luteal },
    { id: 'intensite', label: 'Intensité émotionnelle', emoji: '🌪️', color: theme.colors.phases.luteal },
    { id: 'clairvoyance', label: 'Clairvoyance', emoji: '👁️', color: theme.colors.phases.luteal },
    { id: 'transformation', label: 'Énergie transformation', emoji: '🦋', color: theme.colors.phases.luteal },
  ];
  
  // Animations
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  React.useEffect(() => {
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
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const handleSymptomToggle = (symptomId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    );
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Sauvegarder avec le bon format
    const moodOption = MOOD_OPTIONS.find(opt => opt.value === mood);
    const moodLabel = moodOption ? moodOption.value : mood;
    
    // 🆕 DOUBLE SAUVEGARDE : Notebook ET Cycle
    addQuickTracking(moodLabel, energy, symptoms);
    
    // 🆕 AJOUTER L'OBSERVATION AU CYCLE
    // Convertir mood en valeur numérique pour feeling
    const feelingValue = mood === 'sad' ? 1 : 
                        mood === 'neutral' ? 3 : 
                        mood === 'good' ? 4 : 
                        mood === 'great' ? 4.5 : 
                        mood === 'amazing' ? 5 : 3;
    
    const notes = symptoms.length > 0 ? `Symptômes: ${symptoms.join(', ')}` : '';
    addObservation(feelingValue, energy, notes);

    // 🆕 CONNEXION INTELLIGENCE : Alimenter le moteur d'apprentissage
    trackObservation({
      phase: currentPhase,
      mood: feelingValue,
      energy: energy
    });

    // Reset et fermer
    setEnergy(3);
    setMood('neutral');
    setSymptoms([]);
    onClose();
  };

  const getPhaseColor = () => {
    const phaseColors = {
      menstrual: theme.colors.phases.menstrual,
      follicular: theme.colors.phases.follicular,
      ovulatory: theme.colors.phases.ovulatory,
      luteal: theme.colors.phases.luteal,
    };
    return phaseColors[currentPhase] || theme.colors.primary;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modal,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Header avec couleur de phase */}
            <View style={[styles.header, { borderBottomColor: getPhaseColor() + '30' }]}>
              <View style={styles.headerContent}>
                <Heading2 style={styles.title}>Comment tu te sens ?</Heading2>
                <Caption style={[styles.phaseIndicator, { color: getPhaseColor() }]}>
                  Phase {currentPhase}
                </Caption>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Badge mode observation */}
            {isObservationBased && (
              <View style={styles.observationBadge}>
                <Caption style={styles.observationBadgeText}>Mode observation actif</Caption>
              </View>
            )}

            {/* Humeur avec design premium */}
            <View style={styles.section}>
              <BodyText style={styles.sectionTitle}>Humeur générale</BodyText>
              <View style={styles.moodContainer}>
                {MOOD_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.moodOption,
                      mood === option.value && styles.moodOptionActive,
                      mood === option.value && theme.getGlassmorphismStyle(getPhaseColor(), {
                bgOpacity: theme.glassmorphism.opacity.bg,
                borderOpacity: theme.glassmorphism.opacity.border,
                borderWidth: 1,
                shadowOpacity: 0,
              })
                    ]}
                    onPress={() => {
                      setMood(option.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Animated.Text 
                      style={[
                        styles.moodEmoji,
                        mood === option.value && styles.moodEmojiActive
                      ]}
                    >
                      {option.emoji}
                    </Animated.Text>
                    <BodyText 
                      style={[
                        styles.moodLabel,
                        mood === option.value && { color: getPhaseColor() }
                      ]}
                    >
                      {option.label}
                    </BodyText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Énergie avec visualisation améliorée */}
            <View style={styles.section}>
              <BodyText style={styles.sectionTitle}>
                Niveau d'énergie {ENERGY_LEVELS[energy - 1].icon}
              </BodyText>
              
              {/* Slider visuel */}
              <View style={styles.energySlider}>
                <View style={styles.energyTrack}>
                  <Animated.View 
                    style={[
                      styles.energyFill,
                      { 
                        width: `${(energy / 5) * 100}%`,
                        backgroundColor: ENERGY_LEVELS[energy - 1].color
                      }
                    ]}
                  />
                </View>
              </View>
              
              {/* Points énergie cliquables */}
              <View style={styles.energyDots}>
                {ENERGY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.level}
                    onPress={() => {
                      setEnergy(level.level);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.energyDot,
                      energy >= level.level && styles.energyDotActive,
                      energy >= level.level && { backgroundColor: level.color + '20' }
                    ]}
                  >
                    <View 
                      style={[
                        styles.energyDotInner,
                        energy >= level.level && { backgroundColor: level.color }
                      ]}
                    />
                    <Caption style={styles.energyLevel}>{level.level}</Caption>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Symptômes avec tabs */}
            <View style={styles.section}>
              <BodyText style={styles.sectionTitle}>Énergies ressenties (optionnel)</BodyText>
              
              {/* Tabs Archétypes */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                <View style={styles.tabs}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'sorciere' && styles.tabActive]}
                    onPress={() => setActiveTab('sorciere')}
                  >
                    <BodyText style={[
                      styles.tabText,
                      activeTab === 'sorciere' && styles.tabTextActive
                    ]}>
                      🌙 Sorcière
                    </BodyText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'jeune_fille' && styles.tabActive]}
                    onPress={() => setActiveTab('jeune_fille')}
                  >
                    <BodyText style={[
                      styles.tabText,
                      activeTab === 'jeune_fille' && styles.tabTextActive
                    ]}>
                      🌸 Jeune Fille
                    </BodyText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'mere' && styles.tabActive]}
                    onPress={() => setActiveTab('mere')}
                  >
                    <BodyText style={[
                      styles.tabText,
                      activeTab === 'mere' && styles.tabTextActive
                    ]}>
                      ☀️ Mère
                    </BodyText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'enchanteresse' && styles.tabActive]}
                    onPress={() => setActiveTab('enchanteresse')}
                  >
                    <BodyText style={[
                      styles.tabText,
                      activeTab === 'enchanteresse' && styles.tabTextActive
                    ]}>
                      🦋 Enchanteresse
                    </BodyText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              {/* Symptômes grid */}
              <View style={styles.symptomsGrid}>
                {(activeTab === 'sorciere' ? SYMPTOMS_SORCIERE : 
                  activeTab === 'jeune_fille' ? SYMPTOMS_JEUNE_FILLE :
                  activeTab === 'mere' ? SYMPTOMS_MERE :
                  SYMPTOMS_ENCHANTERESSE).map((symptom) => (
                  <TouchableOpacity
                    key={symptom.id}
                    style={[
                      styles.symptomCard,
                      symptoms.includes(symptom.id) && theme.getGlassmorphismStyle(symptom.color, {
                        bgOpacity: theme.glassmorphism.opacity.bg,
                        borderOpacity: theme.glassmorphism.opacity.accent,
                        borderWidth: 1,
                        shadowOpacity: 0,
                      }),
                    ]}
                    onPress={() => handleSymptomToggle(symptom.id)}
                  >
                    <BodyText style={styles.symptomEmoji}>{symptom.emoji}</BodyText>
                    <BodyText
                      style={[
                        styles.symptomText,
                        symptoms.includes(symptom.id) && {
                          color: symptom.color,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {symptom.label}
                    </BodyText>
                    {symptoms.includes(symptom.id) && (
                      <View style={[styles.checkmark, { backgroundColor: symptom.color }]}>
                        <Feather name="check" size={10} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Résumé avant sauvegarde */}
            {(mood !== 'neutral' || energy !== 3 || symptoms.length > 0) && (
              <View style={styles.summary}>
                <Caption style={styles.summaryTitle}>Résumé :</Caption>
                <View style={styles.summaryContent}>
                  <BodyText style={styles.summaryText}>
                    {MOOD_OPTIONS.find(o => o.value === mood)?.emoji} {MOOD_OPTIONS.find(o => o.value === mood)?.label}
                  </BodyText>
                  <BodyText style={styles.summaryText}>
                    {ENERGY_LEVELS[energy - 1].icon} Énergie : {energy}/5
                  </BodyText>
                  {symptoms.length > 0 && (
                    <BodyText style={styles.summaryText}>
                      {symptoms.length} symptôme{symptoms.length > 1 ? 's' : ''}
                    </BodyText>
                  )}
                </View>
              </View>
            )}

            {/* Bouton sauvegarder premium */}
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: getPhaseColor() }]} 
              onPress={handleSave}
            >
              <Feather name="save" size={20} color={theme.getTextColorOnPhase(currentPhase)} />
              <BodyText style={[styles.saveButtonText, { color: theme.getTextColorOnPhase(currentPhase) }]}>
                Sauvegarder
              </BodyText>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    maxHeight: '90%',
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.l,
    borderBottomWidth: 2,
    marginBottom: theme.spacing.l,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  phaseIndicator: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  closeButton: {
    padding: theme.spacing.s,
  },
  observationBadge: {
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    alignItems: 'center',
  },
  observationBadgeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },

  // Humeur styles premium
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs,
  },
  moodOption: {
    alignItems: 'center',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    minWidth: 60,
    backgroundColor: theme.colors.background,
  },
  moodOptionActive: {
    transform: [{ scale: 1.05 }],
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: theme.spacing.xs,
  },
  moodEmojiActive: {
    fontSize: 32,
  },
  moodLabel: {
    fontSize: 11,
    color: theme.colors.textLight,
    fontWeight: '500',
  },

  // Énergie styles premium
  energySlider: {
    marginBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
  },
  energyTrack: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    borderRadius: 4,
  },
  energyDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
  },
  energyDot: {
    alignItems: 'center',
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.medium,
  },
  energyDotActive: {
    transform: [{ scale: 1.1 }],
  },
  energyDotInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    marginBottom: 4,
  },
  energyLevel: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Symptômes styles premium
  tabsContainer: {
    marginBottom: theme.spacing.s,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.s,
    alignItems: 'center',
    borderRadius: theme.borderRadius.medium - 4,
  },
  tabActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  tabTextActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  symptomCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.s,
    position: 'relative',
  },
  symptomEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  symptomText: {
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Résumé
  summary: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  summaryTitle: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  summaryContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.m,
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
  },

  // Bouton save premium
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.m + 2,
    borderRadius: theme.borderRadius.pill,
    marginTop: theme.spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: theme.spacing.s,
    fontSize: 16,
  },
});