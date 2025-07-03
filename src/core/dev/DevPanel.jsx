//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/dev/DevPanel.jsx - RÉVÉLATION TESTING
// 🚀 CASCADE 3.1: Testing Intelligence Revelation
// ─────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';

// Stores
import { useUserStore } from '../../stores/useUserStore';
import { useChatStore } from '../../stores/useChatStore';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useUserIntelligence } from '../../stores/useUserIntelligence';
import { useEngagementStore } from '../../stores/useEngagementStore';
import { useCycleStore } from '../../stores/useCycleStore';

// Hooks


// Config
import { PERSONA_PROFILES } from '../../config/personaProfiles';

export default function DevPanel() {
  const router = useRouter();
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('revelation');

  // Stores
  const { profile, persona, updateProfile, setPersona, reset: resetUser } = useUserStore();
  const { addMessage, clearMessages, getMessagesCount } = useChatStore();
  const { addEntry, addQuickTracking, reset: resetNotebook, entries } = useNotebookStore();
  const intelligence = useUserIntelligence();
  const engagement = useEngagementStore();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const updateCycle = useCycleStore((state) => state.updateCycle);
  
      // Cycle data
    const cycle = cycleData;

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // ═══════════════════════════════════════════════════════
  // 🌟 REVELATION TESTING - NOUVEAU
  // ═══════════════════════════════════════════════════════

  const simulateIntelligenceData = (scenario) => {
    const scenarios = {
      // Scenario 1: Utilisatrice active le soir
      evening_active: {
        timePatterns: {
          favoriteHours: [20, 21, 19],
          activeDays: ['monday', 'wednesday', 'friday'],
          sessionDuration: 8
        },
        phasePatterns: {
          menstrual: { mood: 'introspective', topics: ['repos', 'cocooning'] },
          follicular: { mood: 'energetic', topics: ['creativite', 'projets'] },
          ovulatory: { mood: 'confident', topics: ['communication', 'social'] },
          luteal: { mood: 'sensitive', topics: ['emotions', 'reflexion'] }
        },
        conversationPrefs: {
          successfulPrompts: [
            { prompt: 'Comment te sens-tu ?', phase: 'luteal' },
            { prompt: 'Quelle energie ressens-tu ?', phase: 'follicular' },
            { prompt: 'Comment honorer ton besoin ?', phase: 'menstrual' }
          ]
        },
        confidence: 65
      },

      // Scenario 2: Utilisatrice matinale créative
      morning_creative: {
        timePatterns: {
          favoriteHours: [7, 8, 9],
          activeDays: ['tuesday', 'thursday', 'saturday'],
          sessionDuration: 12
        },
        phasePatterns: {
          menstrual: { mood: 'calm', topics: ['meditation', 'lecture'] },
          follicular: { mood: 'inspired', topics: ['art', 'ecriture', 'creativite'] },
          ovulatory: { mood: 'radiant', topics: ['partage', 'expression'] },
          luteal: { mood: 'focused', topics: ['organisation', 'finalisation'] }
        },
        conversationPrefs: {
          successfulPrompts: [
            { prompt: 'Comment exprimer ma creativite ?', phase: 'follicular' },
            { prompt: 'Que me dit mon intuition ?', phase: 'luteal' },
            { prompt: 'Comment rayonner aujourd\'hui ?', phase: 'ovulatory' }
          ]
        },
        confidence: 78
      },

      // Scenario 3: Utilisatrice débutante
      beginner: {
        timePatterns: {
          favoriteHours: [14],
          activeDays: ['sunday'],
          sessionDuration: 5
        },
        phasePatterns: {
          menstrual: { mood: null, topics: [] },
          follicular: { mood: null, topics: ['decouverte'] },
          ovulatory: { mood: null, topics: [] },
          luteal: { mood: null, topics: [] }
        },
        conversationPrefs: {
          successfulPrompts: [
            { prompt: 'Comment fonctionne mon cycle ?', phase: 'follicular' }
          ]
        },
        confidence: 15
      }
    };

    const data = scenarios[scenario];
    if (!data) return;

    // Injection directe dans le store intelligence
    intelligence.learning.timePatterns = data.timePatterns;
    intelligence.learning.phasePatterns = data.phasePatterns;
    intelligence.learning.conversationPrefs = data.conversationPrefs;
    intelligence.learning.confidence = data.confidence;

    // Mise à jour engagement selon scenario
    const engagementData = {
      evening_active: { daysUsed: 12, conversationsStarted: 8, autonomySignals: 2 },
      morning_creative: { daysUsed: 18, conversationsStarted: 12, autonomySignals: 4 },
      beginner: { daysUsed: 3, conversationsStarted: 2, autonomySignals: 0 }
    };

    const engagementUpdate = engagementData[scenario];
    if (engagementUpdate) {
      Object.keys(engagementUpdate).forEach(key => {
        engagement.metrics[key] = engagementUpdate[key];
      });
    }

    Alert.alert(
      '🌟 Intelligence Simulée', 
      `Scenario "${scenario}" activé\nConfiance: ${data.confidence}%\nPatterns: ${data.timePatterns.favoriteHours.length} heures`
    );
  };

  const testRevelationComponents = () => {
    Alert.alert(
      '🧪 Test Composants Révélation',
      'Quel composant tester ?',
      [
        { text: 'PersonalPatterns', onPress: () => navigateTo('/(tabs)/home') },
        { text: 'Insight Enrichi', onPress: () => navigateToInsightTest() },
        { text: 'Accueil Complet', onPress: () => navigateTo('/(tabs)/home') },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const navigateToInsightTest = () => {
    // Forcer refresh de l'insight
    setTimeout(() => {
      navigateTo('/(tabs)/home');
    }, 100);
  };

  const showIntelligenceDebug = () => {
    const debugInfo = {
      confidence: intelligence.learning.confidence,
      timePatterns: intelligence.learning.timePatterns?.favoriteHours?.length || 0,
      phasePatterns: Object.keys(intelligence.learning.phasePatterns || {}).length,
      conversations: intelligence.learning.conversationPrefs?.successfulPrompts?.length || 0,
      autonomySignals: engagement.metrics.autonomySignals
    };

    console.info('🧠 Intelligence Debug:', JSON.stringify(debugInfo, null, 2));
    
    Alert.alert(
      '🧠 État Intelligence',
      `Confiance: ${debugInfo.confidence}%\n` +
      `Patterns temporels: ${debugInfo.timePatterns}\n` +
      `Phases documentées: ${debugInfo.phasePatterns}\n` +
      `Conversations: ${debugInfo.conversations}\n` +
      `Signaux autonomie: ${debugInfo.autonomySignals}`,
      [{ text: 'Voir Console', onPress: () => console.info('🧠 Full Intelligence:', intelligence.learning) }]
    );
  };

  const resetIntelligence = () => {
    Alert.alert(
      '🧹 Reset Intelligence',
      'Réinitialiser toutes les données d\'apprentissage ?',
      [
        { text: 'Oui', style: 'destructive', onPress: () => {
          intelligence.resetLearning();
          engagement.resetEngagement();
          Alert.alert('✅ Intelligence Reset', 'Données d\'apprentissage effacées');
        }},
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  // 🆕 FONCTIONS POUR LES NOUVELLES FONCTIONNALITÉS
  const simulateFakeObservations = () => {
    const fakeObservations = [
      { id: '1', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), feeling: 2, energy: 2, notes: 'Fatigue, besoin de repos', phase: 'menstrual', cycleDay: 3 },
      { id: '2', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), feeling: 4, energy: 4, notes: 'Énergie qui revient, créativité', phase: 'follicular', cycleDay: 8 },
      { id: '3', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), feeling: 5, energy: 5, notes: 'Très énergique, sociale', phase: 'ovulatory', cycleDay: 14 },
      { id: '4', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), feeling: 3, energy: 3, notes: 'Émotions sensibles', phase: 'luteal', cycleDay: 22 },
      { id: '5', timestamp: new Date().toISOString(), feeling: 2, energy: 2, notes: 'Fatigue prémenstruelle', phase: 'luteal', cycleDay: 26 }
    ];
    
    useCycleStore.getState().observations = fakeObservations;
    Alert.alert('✅ Observations Factices', `${fakeObservations.length} observations ajoutées`);
  };

  // ═══════════════════════════════════════════════════════
  // 🔄 CYCLE CONTROL (simplifié)
  // ═══════════════════════════════════════════════════════

  const jumpToDay = (targetDay) => {
    try {
      const today = new Date();
      const cycleStart = new Date(today);
      cycleStart.setDate(today.getDate() - targetDay + 1);
      
      updateCycle({ lastPeriodDate: cycleStart.toISOString() });
      Alert.alert('🔄 Cycle', `J${targetDay}`);
    } catch (error) {
      Alert.alert('❌ Erreur cycle');
    }
  };

  const jumpToPhase = (targetPhase) => {
    const phaseDays = { menstrual: 2, follicular: 10, ovulatory: 15, luteal: 22 };
    jumpToDay(phaseDays[targetPhase]);
  };

  const advanceOneDay = () => {
    try {
      const currentDay = cycle?.currentDay || 1;
      const nextDay = currentDay + 1;
      
      // Si on dépasse 28 jours, on revient à J1
      const targetDay = nextDay > 28 ? 1 : nextDay;
      jumpToDay(targetDay);
      
      Alert.alert('🔄 Cycle', `Avancé à J${targetDay}`);
    } catch (error) {
      Alert.alert('❌ Erreur cycle');
    }
  };

  const advanceDays = (daysToAdvance) => {
    try {
      const currentDay = cycle?.currentDay || 1;
      const nextDay = currentDay + daysToAdvance;
      
      // Si on dépasse 28 jours, on calcule le modulo pour rester dans le cycle
      const targetDay = nextDay > 28 ? ((nextDay - 1) % 28) + 1 : nextDay;
      jumpToDay(targetDay);
      
      Alert.alert('🔄 Cycle', `Avancé de ${daysToAdvance} jours → J${targetDay}`);
    } catch (error) {
      Alert.alert('❌ Erreur cycle');
    }
  };

  // ═══════════════════════════════════════════════════════
  // 🎭 PERSONA CONTROL (simplifié)
  // ═══════════════════════════════════════════════════════

  const switchPersona = (personaId) => {
    const personaData = PERSONA_PROFILES[personaId];
    if (!personaData) return;

    updateProfile({
      prenom: personaData.name,
      ageRange: personaData.ageRange[0],
      journeyChoice: personaData.preferredJourney[0],
    });

    setPersona(personaId, 1.0);
    Alert.alert('🎭 Persona', `${personaData.name} activée`);
  };

  // ═══════════════════════════════════════════════════════
  // 🧹 UTILS (simplifié)
  // ═══════════════════════════════════════════════════════

  const navigateTo = (route) => {
    try {
      router.push(route);
      setShowPanel(false);
    } catch (error) {
      Alert.alert('❌ Navigation', `Erreur: ${route}`);
    }
  };

  const resetAll = () => {
    Alert.alert(
      '🧹 Reset Complet',
      'Effacer toutes les données ?',
      [
        { text: 'Oui', style: 'destructive', onPress: () => {
          resetUser();
          clearMessages();
          resetNotebook();
          intelligence.resetLearning();
          engagement.resetEngagement();
          Alert.alert('✅ Reset Complet');
        }},
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDU
  // ═══════════════════════════════════════════════════════

  return (
    <View style={styles.container}>
      {/* Toggle Button */}
      <TouchableOpacity 
        style={[styles.toggleButton, showPanel && styles.toggleActive]} 
        onPress={() => setShowPanel(!showPanel)}
      >
        <Text style={styles.toggleText}>{showPanel ? '✕' : '🧠'}</Text>
      </TouchableOpacity>

      {/* Dev Panel */}
      {showPanel && (
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🧠 Test Révélation</Text>
            <Text style={styles.status}>
              {persona?.currentPersona || 'auto'} | {cycle?.currentPhase || '?'} J{cycle?.currentDay || 0} | 
              Conf: {intelligence.learning.confidence || 0}%
            </Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {[
              { id: 'revelation', icon: '🌟', label: 'Test' },
              { id: 'cycle', icon: '🔄', label: 'Cycle' },
              { id: 'persona', icon: '🎭', label: 'Persona' },
              { id: 'utils', icon: '🧹', label: 'Utils' }
            ].map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={styles.tabText}>{tab.icon}</Text>
                <Text style={styles.tabLabel}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.content}>
            {/* 🌟 REVELATION TAB - NOUVEAU */}
            {activeTab === 'revelation' && (
              <View>
                <Text style={styles.sectionTitle}>🌟 Test Intelligence Révélation</Text>
                
                <Text style={styles.subTitle}>Scénarios Utilisatrice :</Text>
                <TouchableOpacity 
                  style={styles.scenarioButton} 
                  onPress={() => simulateIntelligenceData('evening_active')}
                >
                  <Text style={styles.scenarioText}>🌙 Active le Soir</Text>
                  <Text style={styles.scenarioSub}>65% conf • Patterns émotionnels</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.scenarioButton} 
                  onPress={() => simulateIntelligenceData('morning_creative')}
                >
                  <Text style={styles.scenarioText}>🌅 Matinale Créative</Text>
                  <Text style={styles.scenarioSub}>78% conf • Patterns artistiques</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.scenarioButton} 
                  onPress={() => simulateIntelligenceData('beginner')}
                >
                  <Text style={styles.scenarioText}>🌱 Débutante</Text>
                  <Text style={styles.scenarioSub}>15% conf • Peu de données</Text>
                </TouchableOpacity>

                <Text style={styles.subTitle}>Tests Composants :</Text>
                <TouchableOpacity style={styles.testButton} onPress={testRevelationComponents}>
                  <Text style={styles.testButtonText}>🧪 Test Composants</Text>
                  <Text style={styles.testButtonSub}>PersonalPatterns + Insight</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.debugButton} onPress={showIntelligenceDebug}>
                  <Text style={styles.debugButtonText}>🐛 Debug Intelligence</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetButton} onPress={resetIntelligence}>
                  <Text style={styles.resetButtonText}>🧹 Reset Intelligence</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.debugButton} 
                  onPress={() => {
                    const hasObs = cycle?.observations?.length > 0;
                    if (hasObs) {
                      // Clear observations
                      useCycleStore.getState().observations = [];
                    } else {
                      // Add fake observations
                      simulateFakeObservations();
                    }
                    Alert.alert('🔄 Observations', hasObs ? 'Cleared' : 'Added fake data');
                  }}
                >
                  <Text style={styles.debugButtonText}>
                    {cycle?.observations?.length > 0 ? '🗑️ Clear Observations' : '➕ Add Fake Obs'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 🔄 CYCLE TAB */}
            {activeTab === 'cycle' && (
              <View>
                <Text style={styles.sectionTitle}>🔄 Contrôle Cycle</Text>
                
                <Text style={styles.subTitle}>Phases Rapides :</Text>
                <View style={styles.buttonGrid}>
                  {['menstrual', 'follicular', 'ovulatory', 'luteal'].map(phase => (
                    <TouchableOpacity
                      key={phase}
                      style={[styles.phaseButton, cycle?.currentPhase === phase && styles.phaseActive]}
                      onPress={() => jumpToPhase(phase)}
                    >
                      <Text style={styles.phaseText}>{phase.slice(0, 3)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.subTitle}>Navigation Rapide :</Text>
                <View style={styles.buttonGrid}>
                  <TouchableOpacity
                    style={[styles.dayJumpButton, { backgroundColor: '#00D4AA' }]}
                    onPress={advanceOneDay}
                  >
                    <Text style={styles.dayJumpText}>J+1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dayJumpButton, { backgroundColor: '#00D4AA' }]}
                    onPress={() => advanceDays(2)}
                  >
                    <Text style={styles.dayJumpText}>J+2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dayJumpButton, { backgroundColor: '#00D4AA' }]}
                    onPress={() => advanceDays(3)}
                  >
                    <Text style={styles.dayJumpText}>J+3</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dayJumpButton, { backgroundColor: '#00D4AA' }]}
                    onPress={() => advanceDays(7)}
                  >
                    <Text style={styles.dayJumpText}>J+7</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.subTitle}>Jours Spécifiques :</Text>
                <View style={styles.buttonGrid}>
                  {[1, 7, 14, 21, 28].map(day => (
                    <TouchableOpacity
                      key={day}
                      style={styles.dayJumpButton}
                      onPress={() => jumpToDay(day)}
                    >
                      <Text style={styles.dayJumpText}>J{day}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.subTitle}>Simulation Complète :</Text>
                <TouchableOpacity
                  style={[styles.dayJumpButton, { backgroundColor: '#FF6B6B', width: '100%' }]}
                  onPress={() => {
                    let day = 1;
                    const interval = setInterval(() => {
                      jumpToDay(day);
                      day++;
                      if (day > 28) {
                        clearInterval(interval);
                        Alert.alert('✅ Cycle Complet', 'J1 → J28 simulé');
                      }
                    }, 500);
                  }}
                >
                  <Text style={styles.dayJumpText}>🎬 Simuler J1→J28</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 🎭 PERSONA TAB */}
            {activeTab === 'persona' && (
              <View>
                <Text style={styles.sectionTitle}>🎭 Personas</Text>
                
                <View style={styles.buttonGrid}>
                  {Object.entries(PERSONA_PROFILES).map(([personaId, data]) => (
                    <TouchableOpacity
                      key={personaId}
                      style={[styles.personaButton, persona?.currentPersona === personaId && styles.personaActive]}
                      onPress={() => switchPersona(personaId)}
                    >
                      <Text style={styles.personaText}>{data.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* 🧹 UTILS TAB */}
            {activeTab === 'utils' && (
              <View>
                <Text style={styles.sectionTitle}>🧹 Utils</Text>
                
                <Text style={styles.subTitle}>Navigation :</Text>
                <View style={styles.buttonGrid}>
                  {[
                    { route: '/onboarding', label: 'Onboarding' },
                    { route: '/(tabs)/cycle', label: 'Cycle' },
                    { route: '/(tabs)/conseil', label: 'Conseil' },
                    { route: '/(tabs)/notebook', label: 'Carnet' }
                  ].map(nav => (
                    <TouchableOpacity
                      key={nav.route}
                      style={styles.navButton}
                      onPress={() => navigateTo(nav.route)}
                    >
                      <Text style={styles.navText}>{nav.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.utilButton} onPress={resetAll}>
                  <Text style={styles.utilButtonText}>🗑️ Reset Complet</Text>
                </TouchableOpacity>

                <View style={styles.statsContainer}>
                  <Text style={styles.statsText}>📊 État Actuel:</Text>
                  <Text style={styles.statsText}>• {getMessagesCount()?.total || 0} messages</Text>
                  <Text style={styles.statsText}>• {entries?.length || 0} entrées</Text>
                  <Text style={styles.statsText}>• {intelligence.learning.confidence || 0}% confiance</Text>
                  <Text style={styles.statsText}>• {engagement.metrics.autonomySignals || 0} signaux auto</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// 🎨 STYLES
// ═══════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 9999,
    width: '100%',
    height: '100%',
    pointerEvents: 'box-none',
  },
  
  toggleButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  toggleActive: {
    backgroundColor: '#FF3B30',
  },
  
  toggleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  panel: {
    position: 'absolute',
    top: 115,
    right: 15,
    width: 320,
    height: 650,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  
  status: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
  },
  
  tab: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
  },
  
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  
  tabText: {
    fontSize: 14,
  },
  
  tabLabel: {
    fontSize: 9,
    color: '#8E8E93',
    marginTop: 2,
  },
  
  content: {
    flex: 1,
    padding: 16,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  
  subTitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 12,
    marginBottom: 8,
  },

  // 🌟 NOUVEAUX STYLES RÉVÉLATION
  scenarioButton: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  
  scenarioText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  scenarioSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  
  testButton: {
    backgroundColor: '#00D4AA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  testButtonSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  
  debugButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  
  debugButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  resetButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  
  resetButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  
  phaseButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  
  phaseActive: {
    backgroundColor: '#FF9500',
  },
  
  phaseText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  dayJumpButton: {
    backgroundColor: '#5856D6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  
  dayJumpText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  
  personaButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  
  personaActive: {
    backgroundColor: '#FF3B30',
  },
  
  personaText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  
  navButton: {
    backgroundColor: '#5856D6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  
  navText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  
  utilButton: {
    backgroundColor: '#8E8E93',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  
  utilButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  statsContainer: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  
  statsText: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
});