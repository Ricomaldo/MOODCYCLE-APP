//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/dev/DevNavigation.jsx
// 🧩 Type : Composant utilitaire (DEV)
// 📚 Description : Panneau de navigation et d'actions pour développeur (DEV tools)
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : mode développeur, debug, tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// Stores Zustand
import { useUserStore } from '../../stores/useUserStore';
import { useAppStore } from '../../stores/useAppStore';
import { useChatStore } from '../../stores/useChatStore';
import { useNotebookStore } from '../../stores/useNotebookStore';
// Composants UI
import { BodyText, SmallText } from '../ui/Typography';
import PersonaSelector from './PersonaSelector';
import PerformanceDashboard from './PerformanceDashboard';

export default function DevNavigation() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

  // Stores
  const { reset, updateCycle, cycle } = useUserStore();
  const { devMode } = useAppStore();
  const { clearMessages } = useChatStore();
  const { reset: resetNotebook } = useNotebookStore();

  if (!__DEV__ || !devMode) {
    return null;
  }

  // ========================================
  // 🚀 ACTIONS DE RESET
  // ========================================
  
  const resetOnboardingAction = () => {
    reset();
    router.push('/onboarding/100-promesse');
  };

  const resetChatAction = () => {
    clearMessages();
  };

  const resetNotebookAction = () => {
    resetNotebook();
  };

  // ========================================
  // 🔄 ACTIONS DE CYCLE
  // ========================================
  
  // Fonction générique pour avancer le cycle
  const advanceCycle = (daysToAdvance) => {
    const currentDate = new Date();
    
    // Calculer la nouvelle date des dernières règles
    let newLastPeriodDate;
    
    if (cycle.lastPeriodDate) {
      // Si on a déjà une date, avancer de X jours
      const currentLastPeriod = new Date(cycle.lastPeriodDate);
      const daysSince = Math.floor((currentDate - currentLastPeriod) / (1000 * 60 * 60 * 24));
      const newDaysSince = daysSince + daysToAdvance;
      
      // Si on dépasse la longueur du cycle, recommencer au début
      if (newDaysSince >= cycle.length) {
        newLastPeriodDate = new Date(currentDate.getTime() - (cycle.length * 24 * 60 * 60 * 1000));
      } else {
        newLastPeriodDate = new Date(currentLastPeriod.getTime() + (daysToAdvance * 24 * 60 * 60 * 1000));
      }
    } else {
      // Si pas de date, commencer il y a X jours
      newLastPeriodDate = new Date(currentDate.getTime() - (daysToAdvance * 24 * 60 * 60 * 1000));
    }
    
    updateCycle({ lastPeriodDate: newLastPeriodDate.toISOString() });
  };

  const advanceCycleBy1 = () => advanceCycle(1);
  const advanceCycleBy7 = () => advanceCycle(7);

  // Actions pour tester les phases spécifiques
  const setPhase = (targetPhase) => {
    const currentDate = new Date();
    const phaseDays = {
      menstrual: 2,     // Jour 2 du cycle
      follicular: 10,   // Jour 10 du cycle  
      ovulatory: 15,    // Jour 15 du cycle
      luteal: 22        // Jour 22 du cycle
    };
    
    const daysAgo = phaseDays[targetPhase] || 2;
    const newLastPeriodDate = new Date(currentDate.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    updateCycle({ lastPeriodDate: newLastPeriodDate.toISOString() });
  };

  // Action pour tester "Mes règles ont commencé"
  const startNewPeriodAction = () => {
    updateCycle({ lastPeriodDate: new Date().toISOString() });
  };

  return (
    <View style={styles.container}>
      {/* Boutons en ligne */}
      <View style={styles.buttonsRow}>
        {/* Bouton pour montrer/cacher */}
        <TouchableOpacity style={styles.toggleButton} onPress={() => setIsVisible(!isVisible)}>
          <BodyText style={styles.toggleText}>🛠️ DEV</BodyText>
        </TouchableOpacity>

        {/* PersonaSelector */}
        <PersonaSelector />
      </View>

      {isVisible && (
        <View style={styles.panel}>
          {/* Navigation */}
          <BodyText style={styles.sectionTitle}>🧭 Navigation</BodyText>
          
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(tabs)/')}>
            <SmallText style={styles.navButtonText}>🏠 Accueil</SmallText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(tabs)/chat')}>
            <SmallText style={styles.navButtonText}>💬 Chat</SmallText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/(tabs)/notebook')}
          >
            <SmallText style={styles.navButtonText}>📖 Notebook</SmallText>
          </TouchableOpacity>

          {/* Test Bouton Règles */}
          <BodyText style={[styles.sectionTitle, { marginTop: 10 }]}>🩸 Test Règles</BodyText>

          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#F44336'}]} onPress={startNewPeriodAction}>
            <SmallText style={styles.actionButtonText}>🩸 Nouvelles règles</SmallText>
          </TouchableOpacity>

          {/* Actions de Reset */}
          <BodyText style={[styles.sectionTitle, { marginTop: 10 }]}>🚀 Reset</BodyText>

          <TouchableOpacity style={styles.actionButton} onPress={resetOnboardingAction}>
            <SmallText style={styles.actionButtonText}>🚀 Onboarding</SmallText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={resetChatAction}>
            <SmallText style={styles.actionButtonText}>🗑️ Vider Chat</SmallText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={resetNotebookAction}>
            <SmallText style={styles.actionButtonText}>📝 Vider Carnet</SmallText>
          </TouchableOpacity>

          {/* Actions de Cycle */}
          <BodyText style={[styles.sectionTitle, { marginTop: 10 }]}>🔄 Cycle</BodyText>

          <TouchableOpacity style={styles.actionButton} onPress={advanceCycleBy1}>
            <SmallText style={styles.actionButtonText}>J + 1</SmallText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={advanceCycleBy7}>
            <SmallText style={styles.actionButtonText}>J + 7</SmallText>
          </TouchableOpacity>

          {/* Test des phases */}
          <BodyText style={[styles.sectionTitle, { marginTop: 10 }]}>🎨 Phases</BodyText>

          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#F44336'}]} onPress={() => setPhase('menstrual')}>
            <SmallText style={styles.actionButtonText}>🌙 Mens.</SmallText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#FFC107'}]} onPress={() => setPhase('follicular')}>
            <SmallText style={styles.actionButtonText}>🌱 Foll.</SmallText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#00BCD4'}]} onPress={() => setPhase('ovulatory')}>
            <SmallText style={styles.actionButtonText}>☀️ Ovu.</SmallText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#673AB7'}]} onPress={() => setPhase('luteal')}>
            <SmallText style={styles.actionButtonText}>🍂 Lutéale</SmallText>
          </TouchableOpacity>

          {/* Performance Dashboard */}
          <BodyText style={[styles.sectionTitle, { marginTop: 10 }]}>📊 Performance</BodyText>

          <TouchableOpacity 
            style={[styles.actionButton, {backgroundColor: showPerformanceDashboard ? '#FF6B35' : '#007AFF'}]} 
            onPress={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
          >
            <SmallText style={styles.actionButtonText}>
              {showPerformanceDashboard ? '📊 Fermer Dashboard' : '📊 Performance Dashboard'}
            </SmallText>
          </TouchableOpacity>
        </View>
      )}

      {/* Performance Dashboard en plein écran */}
      {showPerformanceDashboard && (
        <View style={styles.dashboardContainer}>
          <PerformanceDashboard />
          <TouchableOpacity 
            style={styles.closeDashboard}
            onPress={() => setShowPerformanceDashboard(false)}
          >
            <BodyText style={styles.closeDashboardText}>✕</BodyText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 1000,
  },
  toggleButton: {
    backgroundColor: '#673AB7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  panel: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
    width: 160,
  },
  sectionTitle: {
    color: '#CDDC39',
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  navButton: {
    backgroundColor: '#E91E63',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  navButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 10,
  },
  actionButton: {
    backgroundColor: '#00BCD4',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeDashboard: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    borderRadius: 10,
  },
  closeDashboardText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
