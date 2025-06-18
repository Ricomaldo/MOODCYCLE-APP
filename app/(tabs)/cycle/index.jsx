import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import CycleWheel from '../../../components/CycleWheel';
import CalendarView from '../../../components/CalendarView';
import { Heading, BodyText, Caption } from '../../../components/Typography';
import DevNavigation from '../../../components/DevNavigation/DevNavigation';
import { useCycleStore } from '../../../stores/useCycleStore';
import { useOnboardingStore } from '../../../stores/useOnboardingStore';
import EntryDetailModal from '../../../components/EntryDetailModal';
import phases from '../../../data/phases.json';

export default function CycleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [viewMode, setViewMode] = useState('wheel'); // 'wheel' | 'calendar'
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  const { getCurrentPhaseInfo, initializeFromOnboarding } = useCycleStore();
  const { userInfo, cycleData } = useOnboardingStore();
  
  useEffect(() => {
    if (cycleData.lastPeriodDate) {
      initializeFromOnboarding(cycleData);
    }
  }, [cycleData.lastPeriodDate]);
  
  const currentPhaseInfo = getCurrentPhaseInfo();
  const currentPhase = currentPhaseInfo.phase;
  const cycleDay = currentPhaseInfo.day;
  const cycleLength = cycleData.averageCycleLength || 28;
  const prenom = userInfo.prenom || 'Utilisatrice';
  
  const phaseInfo = phases;

  const navigateToPhase = (phaseId) => {
    router.push(`/cycle/phases/${phaseId}`);
  };

  const toggleView = () => {
    setViewMode(prev => prev === 'wheel' ? 'calendar' : 'wheel');
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DevNavigation />
      
      {/* Header avec toggle */}
      <View style={styles.header}>
        <Heading style={styles.title}>Mon Cycle</Heading>
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={toggleView}
        >
          <Ionicons 
            name={viewMode === 'wheel' ? 'calendar-outline' : 'radio-button-on-outline'} 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoContainer}>
        <Caption>Jour {cycleDay} sur {cycleLength}</Caption>
        <Heading style={styles.phaseTitle}>
          Phase {phaseInfo[currentPhase].name}
        </Heading>
        <BodyText style={styles.phaseDescription}>
          {phaseInfo[currentPhase].description}
        </BodyText>
      </View>
      
      {/* Vue conditionnelle */}
      {viewMode === 'wheel' ? (
        <View style={styles.wheelViewContainer}>
          <View style={styles.wheelContainer}>
            <CycleWheel 
              currentPhase={currentPhase}
              cycleDay={cycleDay}
              userName={prenom}
              size={250}
              onPhasePress={navigateToPhase}
            />
          </View>
          
          <View style={styles.legendContainer}>
            {Object.entries(phaseInfo).map(([phase, info]) => (
              <TouchableOpacity 
                key={phase} 
                style={styles.legendItem}
                onPress={() => navigateToPhase(phase)}
              >
                <View 
                  style={[
                    styles.colorDot, 
                    { backgroundColor: theme.colors.phases[phase] }
                  ]} 
                />
                <Caption>{info.name}</Caption>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.calendarContainer}>
          <CalendarView 
            currentPhase={currentPhase}
            cycleDay={cycleDay}
            cycleLength={cycleLength}
            lastPeriodDate={cycleData.lastPeriodDate}
            onPhasePress={navigateToPhase}
            onDatePress={(date, entries) => {
              // Afficher toutes les entrées du jour dans la modale
              if (entries.length > 0) {
                setSelectedEntry(entries);
              }
            }}
          />
        </View>
      )}

      <EntryDetailModal
        entries={selectedEntry || []}
        visible={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        showActions={false}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: theme.spacing.l,
  },
  title: {
    flex: 1,
    textAlign: 'center',
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
});