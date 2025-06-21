//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/cycle/CycleView.jsx
// 🧩 Type : Composant Écran
// 📚 Description : Composant affichant l'écran principal
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : /notebook cycle route
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActionSheetIOS, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../../src/config/theme';
import CycleWheel from '../../../src/features/cycle/CycleWheel';
import CalendarView from '../../../src/features/cycle/CalendarView';
import { Heading, BodyText, Caption } from '../../../src/core/ui/Typography';
import DevNavigation from '../../../src/core/dev/DevNavigation';
import { useUserStore } from '../../../src/stores/useUserStore';
import EntryDetailModal from '../../../src/features/shared/EntryDetailModal';
import phases from '../../../src/data/phases.json';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import { useCycle } from '../../../src/hooks/useCycle';
import { CYCLE_DEFAULTS } from '../../../src/config/cycleConstants';
import { useRenderMonitoring } from '../../../src/hooks/usePerformanceMonitoring';

export default function CycleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [viewMode, setViewMode] = useState('wheel'); // 'wheel' | 'calendar'
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Utilisation du store unifié
  const { profile, cycle } = useUserStore();
  const { currentPhase, currentDay, phaseInfo, startNewPeriod } = useCycle();

  const cycleLength = cycle.length || CYCLE_DEFAULTS.LENGTH;
  const prenom = profile.prenom || 'Utilisatrice';

  const phasesData = phases;

  // 📊 Monitoring de performance
  const renderCount = useRenderMonitoring('CycleScreen');

  const navigateToPhase = (phaseId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/cycle/phases/${phaseId}`);
  };

  const toggleView = () => {
    setViewMode((prev) => (prev === 'wheel' ? 'calendar' : 'wheel'));
  };

  const handleStartNewPeriod = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: '🩸 Mes règles ont commencé',
          message: 'Confirmer le début de tes règles aujourd\'hui ?',
          options: ['Annuler', 'Confirmer'],
          cancelButtonIndex: 0,
          userInterfaceStyle: 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            startNewPeriod();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // Success ActionSheet
            ActionSheetIOS.showActionSheetWithOptions(
              {
                title: '✨ Merci !',
                message: 'Je m\'adapte à ton rythme unique. Ton cycle est maintenant à jour ! 🌙',
                options: ['Parfait'],
                userInterfaceStyle: 'light',
              },
              () => {}
            );
          }
        }
      );
    }
  };

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      <DevNavigation />

      {/* Header avec toggle */}
      <View style={styles.header}>
        <Heading style={styles.title}>Mon Cycle</Heading>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
          <Feather
            name={viewMode === 'wheel' ? 'calendar' : 'circle'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Caption>
          Jour {currentDay} sur {cycleLength}
        </Caption>
        <Heading style={styles.phaseTitle}>{phasesData[currentPhase].name}</Heading>
        <BodyText style={styles.phaseDescription}>{phasesData[currentPhase].description}</BodyText>
      </View>

      {/* Bouton "Mes règles ont commencé" */}
      <TouchableOpacity style={styles.periodButton} onPress={handleStartNewPeriod}>
        <View style={styles.periodButtonContent}>
          <BodyText style={styles.periodButtonText}>🩸 Mes règles ont commencé</BodyText>
          <Caption style={styles.periodButtonSubtext}>Mettre à jour mon cycle</Caption>
        </View>
      </TouchableOpacity>

      {/* Vue conditionnelle */}
      {viewMode === 'wheel' ? (
        <View style={styles.wheelViewContainer}>
          <View style={styles.wheelContainer}>
            <CycleWheel
              currentPhase={currentPhase}
              cycleDay={currentDay}
              userName={prenom}
              size={250}
              onPhasePress={navigateToPhase}
            />
          </View>

          <View style={styles.legendContainer}>
            {Object.entries(phasesData).map(([phase, info]) => (
              <TouchableOpacity
                key={phase}
                style={styles.legendItem}
                onPress={() => navigateToPhase(phase)}
              >
                <View style={[styles.colorDot, { backgroundColor: theme.colors.phases[phase] }]} />
                <Caption>{info.name}</Caption>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.calendarContainer}>
          <CalendarView
            currentPhase={currentPhase}
            cycleDay={currentDay}
            cycleLength={cycleLength}
            lastPeriodDate={cycle.lastPeriodDate}
            onPhasePress={navigateToPhase}
            onDatePress={(date, entries) => {
              // Afficher toutes les entrées du jour dans la modale
              if (entries.length > 0) {
                setSelectedEntry(entries[0]);
              }
            }}
          />
        </View>
      )}

      <EntryDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
  },
  header: {
    height: 60, // Hauteur standardisée
    flexDirection: 'row',
    justifyContent: 'center', // Centrer le titre
    alignItems: 'center',
    marginBottom: 0, // Pas de margin pour alignement
    position: 'relative', // Pour positionner le bouton toggle
  },
  title: {
    textAlign: 'center',
    fontSize: 20, // Taille standardisée
    fontWeight: '600',
  },
  toggleButton: {
    position: 'absolute',
    right: 0,
    padding: theme.spacing.s,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  phaseTitle: {
    color: theme.colors.phases.follicular,
    marginVertical: theme.spacing.s,
  },
  phaseDescription: {
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  wheelViewContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginTop: theme.spacing.m,
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.m,
  },
  calendarContainer: {
    flex: 1,
    marginTop: theme.spacing.m,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.l,
    flexWrap: 'wrap',
  },
  legendItem: {
    flex: 1,
    flexBasis: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.s,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs,
  },
  periodButton: {
    backgroundColor: theme.colors.phases.menstrual,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginVertical: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButtonContent: {
    alignItems: 'center',
  },
  periodButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  periodButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
});
