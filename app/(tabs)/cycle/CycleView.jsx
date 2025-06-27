//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/cycle/CycleView.jsx - VERSION ALLÉGÉE FOCUS VISUALISATION
// 🧩 Type: Écran Principal Cycle
// 📚 Description: Page cycle épurée - uniquement roue/calendrier + phase info
// 🕒 Version: 4.0 - 2025-06-27 - ALLÉGÉE (insights transférés vers Accueil)
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/hooks/useTheme';
import { Heading, BodyText } from '../../../src/core/ui/Typography';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import CycleWheel from '../../../src/features/cycle/CycleWheel';
import CalendarView from '../../../src/features/cycle/CalendarView';
import { useCycle } from '../../../src/hooks/useCycle';
import { useUserStore } from '../../../src/stores/useUserStore';
import { PhaseIcon } from '../../../src/config/iconConstants';
import EntryDetailModal from '../../../src/features/shared/EntryDetailModal';

export default function CycleView() {
  const cycleData = useCycle() || {};
  const { currentPhase, currentDay, phaseInfo, hasData, cycle } = cycleData;
  const { profile } = useUserStore();
  const { theme } = useTheme();

  // ✅ Protection contre profile undefined pendant l'hydratation
  const safeProfile = profile || { prenom: null };
  
  // ✅ STATE POUR TOGGLE VUE (CONSERVÉ)
  const [viewMode, setViewMode] = React.useState('wheel'); // 'wheel' ou 'calendar'
  
  // ✅ STATE POUR MODAL ENTRIES DU JOUR (CONSERVÉ)
  const [selectedDayEntries, setSelectedDayEntries] = React.useState([]);
  const [showDayDetail, setShowDayDetail] = React.useState(false);
  
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Plus de refresh vignettes - seulement cycle
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // ✅ HANDLERS POUR LE CALENDRIER (CONSERVÉS)
  const handlePhasePress = React.useCallback((phase) => {
    // Handler pour les phases
  }, []);
  
  const handleDatePress = React.useCallback((dateString, dayEntries) => {
    setSelectedDayEntries(dayEntries);
    setShowDayDetail(true);
  }, []);

  const styles = getStyles(theme);

  // Protection : si cycle est undefined, affichage d'un message temporaire
  if (!cycle) {
    return <ScreenContainer><BodyText>Cycle non initialisé</BodyText></ScreenContainer>;
  }

  if (!hasData) {
    return (
      <ScreenContainer style={styles.container} hasTabs={true}>
        <View style={styles.centerContent}>
          <BodyText style={styles.setupText}>
            Configure ton cycle pour commencer ton voyage avec Melune
          </BodyText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* ✅ HEADER AVEC TOGGLE ET PARAMÈTRES (CONSERVÉ) */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Heading style={styles.title}>Mon Cycle</Heading>
            
            {/* ✅ TOGGLE BUTTON (CONSERVÉ) */}
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={() => setViewMode(viewMode === 'wheel' ? 'calendar' : 'wheel')}
            >
              <Feather 
                name={viewMode === 'wheel' ? 'calendar' : 'target'} 
                size={20} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
          
          <BodyText style={styles.subtitle}>
            Jour {currentDay} • Phase {phaseInfo.name}
          </BodyText>
        </View>

        {/* ✅ VUE CONDITIONNELLE AVEC HAUTEUR FIXE (CONSERVÉE) */}
        <View style={styles.viewContainer}>
          {viewMode === 'wheel' ? (
            /* Roue du cycle */
            <View style={styles.wheelContainer}>
              <CycleWheel 
                currentPhase={currentPhase}
                cycleDay={currentDay}
                cycleLength={cycle?.length || 28}
                userName={safeProfile.prenom || 'Emma'}
              />
            </View>
          ) : (
            /* Vue calendaire */
            <View style={styles.calendarContainer}>
              <CalendarView
                onPhasePress={handlePhasePress}
                onDatePress={handleDatePress}
              />
            </View>
          )}
        </View>

        {/* ✅ PHASE INFO ENRICHIE (AMÉLIORÉE) */}
        <View style={styles.phaseInfoContainer}>
          <View style={styles.phaseHeader}>
            <PhaseIcon 
              phaseKey={currentPhase}
              size={32}
              color={theme.colors.phases[currentPhase]}
            />
            <View style={styles.phaseHeaderText}>
              <Heading style={styles.phaseName}>{phaseInfo.name}</Heading>
              <BodyText style={styles.phaseDay}>Jour {currentDay}</BodyText>
            </View>
          </View>
          
          <BodyText style={styles.phaseDescription}>
            {phaseInfo.description}
          </BodyText>
          
          {/* ✅ NOUVELLES INFOS PHASE DÉTAILLÉES */}
          <View style={styles.phaseDetails}>
            <View style={styles.phaseDetailItem}>
              <BodyText style={styles.phaseDetailLabel}>Énergie</BodyText>
              <BodyText style={styles.phaseDetailValue}>
                {getPhaseEnergyLevel(currentPhase)}
              </BodyText>
            </View>
            
            <View style={styles.phaseDetailItem}>
              <BodyText style={styles.phaseDetailLabel}>Focus</BodyText>
              <BodyText style={styles.phaseDetailValue}>
                {getPhaseFocus(currentPhase)}
              </BodyText>
            </View>
            
            <View style={styles.phaseDetailItem}>
              <BodyText style={styles.phaseDetailLabel}>Durée estimée</BodyText>
              <BodyText style={styles.phaseDetailValue}>
                {getPhaseDuration(currentPhase)} jours
              </BodyText>
            </View>
          </View>
        </View>

        {/* ✅ NAVIGATION VERS PHASES DÉTAILLÉES */}
        <View style={styles.phasesNavigation}>
          <Heading style={styles.sectionTitle}>Explorer les phases</Heading>
          
          <View style={styles.phasesGrid}>
            {['menstrual', 'follicular', 'ovulatory', 'luteal'].map((phase) => (
              <TouchableOpacity 
                key={phase}
                style={[
                  styles.phaseNavItem,
                  currentPhase === phase && styles.phaseNavItemActive
                ]}
              >
                <PhaseIcon 
                  phaseKey={phase}
                  size={24}
                  color={currentPhase === phase ? 'white' : theme.colors.phases[phase]}
                />
                <BodyText style={[
                  styles.phaseNavText,
                  currentPhase === phase && styles.phaseNavTextActive
                ]}>
                  {getPhaseDisplayName(phase)}
                </BodyText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ✅ RACCOURCIS ACTIONS CYCLE */}
        <View style={styles.actionsSection}>
          <Heading style={styles.sectionTitle}>Actions rapides</Heading>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Feather name="plus" size={20} color={theme.colors.primary} />
              </View>
              <BodyText style={styles.actionText}>Noter symptômes</BodyText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Feather name="calendar" size={20} color={theme.colors.secondary} />
              </View>
              <BodyText style={styles.actionText}>Prédictions</BodyText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.phases[currentPhase] + '20' }]}>
                <Feather name="trending-up" size={20} color={theme.colors.phases[currentPhase]} />
              </View>
              <BodyText style={styles.actionText}>Historique</BodyText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Espacement bottom pour tab bar */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ✅ MODAL DETAIL ENTRIES DU JOUR (CONSERVÉE) */}
      <EntryDetailModal
        entries={selectedDayEntries}
        visible={showDayDetail}
        onClose={() => setShowDayDetail(false)}
        showActions={true}
      />
    </ScreenContainer>
  );
}

// ✅ FONCTIONS UTILITAIRES PHASE
const getPhaseEnergyLevel = (phase) => {
  const energyLevels = {
    menstrual: 'Basse',
    follicular: 'Montante',
    ovulatory: 'Haute',
    luteal: 'Descendante'
  };
  return energyLevels[phase] || 'Variable';
};

const getPhaseFocus = (phase) => {
  const phaseFocus = {
    menstrual: 'Repos & introspection',
    follicular: 'Nouveaux projets',
    ovulatory: 'Communication',
    luteal: 'Finalisation'
  };
  return phaseFocus[phase] || 'Équilibre';
};

const getPhaseDuration = (phase) => {
  const durations = {
    menstrual: '3-7',
    follicular: '7-10',
    ovulatory: '3-5',
    luteal: '10-14'
  };
  return durations[phase] || '5-7';
};

const getPhaseDisplayName = (phase) => {
  const names = {
    menstrual: 'Règles',
    follicular: 'Folliculaire',
    ovulatory: 'Ovulation',
    luteal: 'Lutéale'
  };
  return names[phase] || phase;
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.l,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  setupText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: 16,
  },
  
  // ✅ HEADER AVEC TOGGLE (CONSERVÉ)
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  
  // ✅ CONTENEUR FIXE POUR ÉVITER LES SAUTS (CONSERVÉ)
  viewContainer: {
    height: 320,
    marginBottom: theme.spacing.xl,
    justifyContent: 'center',
  },
  
  // ✅ CONTENEURS DE VUE (CONSERVÉS)
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  calendarContainer: {
    height: '100%',
    justifyContent: 'center',
  },
  
  // ✅ PHASE INFO ENRICHIE
  phaseInfoContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  phaseHeaderText: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '600',
  },
  phaseDay: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  phaseDescription: {
    fontSize: 15,
    color: theme.colors.textLight,
    lineHeight: 22,
    marginBottom: theme.spacing.l,
  },
  
  // ✅ DÉTAILS PHASE
  phaseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phaseDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  phaseDetailLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  phaseDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  // ✅ SECTIONS
  phasesNavigation: {
    marginBottom: theme.spacing.xl,
  },
  actionsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: theme.spacing.l,
    color: theme.colors.text,
  },
  
  // ✅ NAVIGATION PHASES
  phasesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.s,
  },
  phaseNavItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  phaseNavItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  phaseNavText: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  phaseNavTextActive: {
    color: 'white',
  },
  
  // ✅ ACTIONS RAPIDES
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});