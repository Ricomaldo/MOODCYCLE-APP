//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/dev/DevPanel.jsx - RÉVÉLATION TESTING
// 🚀 CASCADE 3.1: Testing Intelligence Revelation
// ─────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ScrollView, Text, Animated, Platform, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PerformanceDashboard from './PerformanceDashboard';

// Stores
import { useUserStore } from '../../stores/useUserStore';
import { useChatStore } from '../../stores/useChatStore';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useUserIntelligence } from '../../stores/useUserIntelligence';
import { useEngagementStore } from '../../stores/useEngagementStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { useAppStore } from '../../stores/useAppStore';
import { useNavigationStore } from '../../stores/useNavigationStore';

// Hooks


// Config
import { PERSONA_PROFILES } from '../../config/personaProfiles';

export default function DevPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('navigation');
  const [showPerformance, setShowPerformance] = useState(false);
  const [showStoreDebug, setShowStoreDebug] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const panelAnim = useRef(new Animated.Value(0)).current;
  
  // 🆕 ÉTATS VISUELS POUR LES BOUTONS
  const [buttonStates, setButtonStates] = useState({
    // Cycle states
    menstrual: false,
    follicular: false,
    ovulatory: false,
    luteal: false,
    testData: false,
    advanceDay: false,
    
    // Persona states
    personas: {},
    
    // Intelligence states
    eveningActive: false,
    morningCreative: false,
    beginner: false,
    
    // Theme states
    lightTheme: false,
    darkTheme: false,
    systemTheme: false,
  });

  useEffect(() => {
    if (showPanel) {
      Animated.spring(panelAnim, {
        toValue: 1,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(panelAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    }
  }, [showPanel]);

  // Stores
  const { profile, persona, updateProfile, setPersona, reset: resetUser } = useUserStore();
  const { addMessage, clearMessages, getMessagesCount } = useChatStore();
  const { addEntry, addQuickTracking, reset: resetNotebook, entries } = useNotebookStore();
  const intelligence = useUserIntelligence();
  const engagement = useEngagementStore();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const updateCycle = useCycleStore((state) => state.updateCycle);
  const { devMode, toggleDevMode, setTheme, currentTheme, isOnline } = useAppStore();
  const navigation = useNavigationStore();
  
      // Cycle data
    const cycle = cycleData;

  // 🆕 HELPER POUR LES ÉTATS DES BOUTONS
  const toggleButtonState = (buttonKey, duration = 2000) => {
    setButtonStates(prev => ({ ...prev, [buttonKey]: true }));
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [buttonKey]: false }));
    }, duration);
  };

  const getButtonStyle = (baseColor, buttonKey) => {
    const isActive = buttonStates[buttonKey];
    return {
      backgroundColor: isActive ? baseColor : `${baseColor}80`, // 50% opacity quand inactif
      opacity: isActive ? 1 : 0.7,
      transform: [{ scale: isActive ? 1.05 : 1 }],
      shadowColor: isActive ? baseColor : 'transparent',
      shadowOffset: { width: 0, height: isActive ? 4 : 0 },
      shadowOpacity: isActive ? 0.3 : 0,
      shadowRadius: isActive ? 8 : 0,
      elevation: isActive ? 8 : 2,
    };
  };

  // Masquer sur toutes les pages d'onboarding sauf la première
  const isHidden = pathname.startsWith('/onboarding/') && pathname !== '/onboarding/100-bienvenue';
  
  if (isHidden || !__DEV__) return null;

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

    toggleButtonState(scenario, 2000);
    console.log(`🌟 Intelligence Simulée: Scenario "${scenario}" activé - Confiance: ${data.confidence}%`);
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

    console.info('🪄 Intelligence Debug:', JSON.stringify(debugInfo, null, 2));
    
    Alert.alert(
      '🪄 État Intelligence',
      `Étape: ${intelligence.currentStep}\nPhase: ${intelligence.currentPhase}`,
      [{ text: 'Voir Console', onPress: () => console.info('🪄 Full Intelligence:', intelligence.learning) }]
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
    // ✅ CORRECTION : Utiliser la méthode addObservation du store au lieu de manipuler directement
    const addObservation = useCycleStore.getState().addObservation;
    
    // Vérifier qu'un cycle est initialisé
    const cycleState = useCycleStore.getState();
    if (!cycleState.lastPeriodDate) {
      Alert.alert('❌ Cycle non initialisé', 'Veuillez d\'abord initialiser un cycle');
      return;
    }

    // Créer des observations réalistes sur les 7 derniers jours
    const observations = [
      { feeling: 2, energy: 2, notes: 'Fatigue, besoin de repos', daysAgo: 6 },
      { feeling: 3, energy: 3, notes: 'Énergie qui revient doucement', daysAgo: 5 },
      { feeling: 4, energy: 4, notes: 'Créativité qui émerge', daysAgo: 4 },
      { feeling: 5, energy: 5, notes: 'Très énergique, sociale', daysAgo: 3 },
      { feeling: 4, energy: 4, notes: 'Équilibre, projets en cours', daysAgo: 2 },
      { feeling: 3, energy: 3, notes: 'Émotions sensibles', daysAgo: 1 },
      { feeling: 2, energy: 2, notes: 'Fatigue prémenstruelle', daysAgo: 0 }
    ];

    // Ajouter chaque observation avec la bonne date
    observations.forEach((obs, index) => {
      const observationDate = new Date();
      observationDate.setDate(observationDate.getDate() - obs.daysAgo);
      
      // Temporairement modifier lastPeriodDate pour simuler l'observation à la bonne date
      const originalDate = cycleState.lastPeriodDate;
      useCycleStore.getState().updateCycle({ 
        lastPeriodDate: observationDate.toISOString() 
      });
      
      // Ajouter l'observation
      addObservation(obs.feeling, obs.energy, obs.notes);
      
      // Restaurer la date originale
      useCycleStore.getState().updateCycle({ 
        lastPeriodDate: originalDate 
      });
    });

    toggleButtonState('testData', 2000);
    console.log(`✅ Observations Test: ${observations.length} observations ajoutées sur 7 jours`);
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
      console.log(`🔄 Cycle: J${targetDay}`);
    } catch (error) {
      console.error('❌ Erreur cycle:', error);
    }
  };

  const jumpToPhase = (targetPhase) => {
    const phaseDays = { menstrual: 2, follicular: 10, ovulatory: 15, luteal: 22 };
    jumpToDay(phaseDays[targetPhase]);
    toggleButtonState(targetPhase, 1500);
  };

  const advanceOneDay = () => {
    try {
      const currentDay = cycle?.currentDay || 1;
      const nextDay = currentDay + 1;
      
      // Si on dépasse 28 jours, on revient à J1
      const targetDay = nextDay > 28 ? 1 : nextDay;
      jumpToDay(targetDay);
      toggleButtonState('advanceDay', 1500);
    } catch (error) {
      console.error('❌ Erreur cycle:', error);
    }
  };

  const advanceDays = (daysToAdvance) => {
    try {
      const currentDay = cycle?.currentDay || 1;
      const nextDay = currentDay + daysToAdvance;
      
      // Si on dépasse 28 jours, on calcule le modulo pour rester dans le cycle
      const targetDay = nextDay > 28 ? ((nextDay - 1) % 28) + 1 : nextDay;
      jumpToDay(targetDay);
      console.log(`🔄 Cycle: Avancé de ${daysToAdvance} jours → J${targetDay}`);
    } catch (error) {
      console.error('❌ Erreur cycle:', error);
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
    toggleButtonState(`persona_${personaId}`, 2000);
    console.log(`🎭 Persona: ${personaData.name} activée`);
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

  const renderNavigationTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.buttonGrid}>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#9B59B6' }]} 
          onPress={() => router.push('/(tabs)/cycle')}>
          <Text style={styles.buttonText}>🌙 Cycle</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#4A90E2' }]} 
          onPress={() => router.push('/(tabs)/conseils')}>
          <Text style={styles.buttonText}>💡 Conseils</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#E67E22' }]} 
          onPress={() => router.push('/(tabs)/notebook')}>
          <Text style={styles.buttonText}>📔 Notes</Text>
        </TouchableOpacity>
    
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#50C878' }]} 
          onPress={() => router.push('/onboarding/100-bienvenue')}>
          <Text style={styles.buttonText}>🎯 Onboarding</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCycleTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#FF69B4', 'menstrual')]} 
          onPress={() => jumpToPhase('menstrual')}>
          <Text style={styles.buttonText}>🌺 Menstruelle</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#98FB98', 'follicular')]} 
          onPress={() => jumpToPhase('follicular')}>
          <Text style={styles.buttonText}>🌱 Folliculaire</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#FFD700', 'ovulatory')]} 
          onPress={() => jumpToPhase('ovulatory')}>
          <Text style={styles.buttonText}>☀️ Ovulation</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#DDA0DD', 'luteal')]} 
          onPress={() => jumpToPhase('luteal')}>
          <Text style={styles.buttonText}>🌙 Lutéale</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#20B2AA', 'testData')]} 
          onPress={simulateFakeObservations}>
          <Text style={styles.buttonText}>📊 Données Test</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#FF6B35', 'advanceDay')]} 
          onPress={advanceOneDay}>
          <Text style={styles.buttonText}>⏭️ J+1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPersonaTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.buttonGrid}>
        {Object.entries(PERSONA_PROFILES).map(([id, profile]) => (
          <TouchableOpacity
            key={id}
            style={[styles.button, getButtonStyle(profile.color || '#7B68EE', `persona_${id}`)]}
            onPress={() => switchPersona(id)}>
            <Text style={styles.buttonText}>{profile.emoji} {profile.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStoresTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.storeHeader}>
        <Text style={styles.storeTitle}>🏪 État des Stores</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
          onPress={() => setShowStoreDebug(true)}>
          <Text style={styles.buttonText}>🔍 Debug Détaillé</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.storeList}>
        {/* App Store */}
        <View style={styles.storeItem}>
          <Text style={styles.storeName}>📱 App Store</Text>
          <View style={styles.storeInfo}>
            <Text style={styles.storeText}>Theme: {currentTheme}</Text>
            <Text style={styles.storeText}>Dev: {devMode ? 'ON' : 'OFF'}</Text>
            <Text style={styles.storeText}>Online: {isOnline ? 'ON' : 'OFF'}</Text>
          </View>
        </View>

        {/* User Store */}
        <View style={styles.storeItem}>
          <Text style={styles.storeName}>👤 User Store</Text>
          <View style={styles.storeInfo}>
            <Text style={styles.storeText}>Persona: {persona?.currentPersona || 'auto'}</Text>
            <Text style={styles.storeText}>Profile: {profile?.name || 'N/A'}</Text>
          </View>
        </View>

        {/* Cycle Store */}
        <View style={styles.storeItem}>
          <Text style={styles.storeName}>🌙 Cycle Store</Text>
          <View style={styles.storeInfo}>
            <Text style={styles.storeText}>Phase: {cycleData?.currentPhase || '?'}</Text>
            <Text style={styles.storeText}>Jour: J{cycleData?.currentDay || 0}</Text>
            <Text style={styles.storeText}>Obs: {cycleData?.observations?.length || 0}</Text>
          </View>
        </View>

        {/* Chat Store */}
        <View style={styles.storeItem}>
          <Text style={styles.storeName}>💬 Chat Store</Text>
          <View style={styles.storeInfo}>
            <Text style={styles.storeText}>Messages: {getMessagesCount()?.total || 0}</Text>
            <Text style={styles.storeText}>Non lus: {getMessagesCount()?.unread || 0}</Text>
          </View>
        </View>

        {/* Notebook Store */}
        <View style={styles.storeItem}>
          <Text style={styles.storeName}>📔 Notebook Store</Text>
          <View style={styles.storeInfo}>
            <Text style={styles.storeText}>Entrées: {entries?.length || 0}</Text>
            <Text style={styles.storeText}>Quick: {entries?.filter(e => e.type === 'quick')?.length || 0}</Text>
          </View>
        </View>

        {/* Intelligence Store */}
        <View style={styles.storeItem}>
          <Text style={styles.storeName}>🧠 Intelligence Store</Text>
          <View style={styles.storeInfo}>
            <Text style={styles.storeText}>Confiance: {intelligence.learning.confidence || 0}%</Text>
            <Text style={styles.storeText}>Patterns: {Object.keys(intelligence.learning.phasePatterns || {}).length}</Text>
          </View>
        </View>

        {/* Engagement Store */}
        <View style={styles.storeItem}>
          <Text style={styles.storeName}>📊 Engagement Store</Text>
          <View style={styles.storeInfo}>
            <Text style={styles.storeText}>Jours: {engagement.metrics.daysUsed || 0}</Text>
            <Text style={styles.storeText}>Signaux: {engagement.metrics.autonomySignals || 0}</Text>
          </View>
        </View>

        {/* Navigation Store */}
        <View style={styles.storeItem}>
          <Text style={styles.storeName}>🧭 Navigation Store</Text>
          <View style={styles.storeInfo}>
            <Text style={styles.storeText}>Route: {pathname}</Text>
            <Text style={styles.storeText}>History: {navigation.history?.length || 0}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#FF5722' }]}
          onPress={resetAll}>
          <Text style={styles.buttonText}>🗑️ Reset Global</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#009688' }]}
          onPress={() => {
            Alert.alert(
              '📦 Export Stores',
              'Exporter l\'état de tous les stores ?',
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'Exporter', 
                  onPress: () => {
                    const state = {
                      app: { currentTheme, devMode, isOnline },
                      user: { profile, persona },
                      cycle: cycleData,
                      chat: { messages: getMessagesCount() },
                      notebook: { entries },
                      intelligence: intelligence.learning,
                      engagement: engagement.metrics,
                      navigation: { current: pathname, history: navigation.history }
                    };
                    console.info('📦 Stores State:', JSON.stringify(state, null, 2));
                    Alert.alert('✅ Export', 'État exporté dans la console');
                  }
                }
              ]
            );
          }}>
          <Text style={styles.buttonText}>📦 Export État</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDebugTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#3F51B5' }]}
          onPress={() => {
            const errors = [];
            if (!isOnline) errors.push('Offline');
            if (intelligence.learning.confidence < 30) errors.push('Low Confidence');
            if (!cycleData.observations?.length) errors.push('No Observations');
            Alert.alert('🔍 Diagnostic', 
              errors.length ? `Issues:\n${errors.join('\n')}` : 'Tout est OK !'
            );
          }}>
          <Text style={styles.buttonText}>🔍 Diagnostic</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#795548' }]}
          onPress={() => {
            Alert.alert('📱 Info Device', `
OS: ${Platform.OS}
Version: ${Platform.Version}
Screen: ${Dimensions.get('window').width}x${Dimensions.get('window').height}
            `);
          }}>
          <Text style={styles.buttonText}>📱 Info Device</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#607D8B' }]}
          onPress={() => {
            const networkInfo = isOnline ? 'Online' : 'Offline';
            const syncStatus = 'OK'; // À implémenter
            Alert.alert('🌐 Network', `
Status: ${networkInfo}
Sync: ${syncStatus}
            `);
          }}>
          <Text style={styles.buttonText}>🌐 Network</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#9C27B0' }]}
          onPress={() => {
            Alert.alert('🎯 Tests',
              'Lancer les tests ?',
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'UI', 
                  onPress: () => testRevelationComponents() 
                },
                { 
                  text: 'Data', 
                  onPress: () => simulateIntelligenceData('evening_active')
                }
              ]
            );
          }}>
          <Text style={styles.buttonText}>🎯 Tests</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>🔄 Dernières Actions</Text>
        <ScrollView style={styles.debugLog}>
          {/* Simuler un log d'actions */}
          {[
            { time: '10:30:15', action: 'Navigation: /cycle' },
            { time: '10:30:00', action: 'Store Update: cycle.currentDay' },
            { time: '10:29:45', action: 'Intelligence Update' }
          ].map((log, i) => (
            <Text key={i} style={styles.debugText}>
              {log.time} - {log.action}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderTestTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#FF6B6B', 'evening_active')]} 
          onPress={() => simulateIntelligenceData('evening_active')}>
          <Text style={styles.buttonText}>🌙 Profil Soir</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#4ECDC4', 'morning_creative')]} 
          onPress={() => simulateIntelligenceData('morning_creative')}>
          <Text style={styles.buttonText}>🌅 Profil Matin</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#95A5A6', 'beginner')]} 
          onPress={() => simulateIntelligenceData('beginner')}>
          <Text style={styles.buttonText}>🌱 Débutante</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#8E44AD' }]} 
          onPress={showIntelligenceDebug}>
          <Text style={styles.buttonText}>🔍 Debug Intel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#E74C3C' }]} 
          onPress={resetIntelligence}>
          <Text style={styles.buttonText}>🗑️ Reset Intel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPerformanceTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#2ECC71', marginBottom: 8 }]} 
        onPress={() => setShowPerformance(true)}>
        <Text style={styles.buttonText}>📊 Dashboard Performance</Text>
      </TouchableOpacity>
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#3498DB', 'lightTheme')]} 
          onPress={() => {
            setTheme('light');
            toggleButtonState('lightTheme', 1500);
          }}>
          <Text style={styles.buttonText}>☀️ Light</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#34495E', 'darkTheme')]} 
          onPress={() => {
            setTheme('dark');
            toggleButtonState('darkTheme', 1500);
          }}>
          <Text style={styles.buttonText}>🌙 Dark</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, getButtonStyle('#95A5A6', 'systemTheme')]} 
          onPress={() => {
            setTheme('system');
            toggleButtonState('systemTheme', 1500);
          }}>
          <Text style={styles.buttonText}>⚙️ System</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const tabs = [
    { id: 'navigation', icon: '🛠', content: renderNavigationTab },
    { id: 'cycle', icon: '🌗', content: renderCycleTab },
    { id: 'persona', icon: '👤', content: renderPersonaTab },
    { id: 'stores', icon: '📦', content: renderStoresTab },
    { id: 'debug', icon: '🐛', content: renderDebugTab },
    { id: 'test', icon: '🧠', content: renderTestTab },
    { id: 'performance', icon: '📊', content: renderPerformanceTab }
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowPanel(!showPanel)}>
        <MaterialCommunityIcons name="dev-to" size={24} color="#fff" />
      </TouchableOpacity>

      {showPanel && (
        <Animated.View
          style={[
            styles.panel,
            {
              transform: [
                {
                  translateY: panelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-300, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.tabBar}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.id)}>
                <Text style={styles.tabText}>{tab.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.content}>
            {tabs.find(tab => tab.id === activeTab)?.content()}
          </View>
        </Animated.View>
      )}

      {showPerformance && (
        <View style={styles.performanceOverlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPerformance(false)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <PerformanceDashboard />
        </View>
      )}

      {showStoreDebug && (
        <View style={styles.performanceOverlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowStoreDebug(false)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <ScrollView style={styles.container}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📦 Debug Stores</Text>
              {Object.entries({
                app: { currentTheme, devMode, isOnline }, profile, cycleData, intelligence, engagement, navigation
              }).map(([name, store]) => (
                <View key={name} style={styles.debugItem}>
                  <Text style={styles.debugItemTitle}>{name}</Text>
                  <Text style={styles.debugItemContent}>
                    {JSON.stringify(store, null, 2)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// 🎨 STYLES
// ═══════════════════════════════════════════════════════

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  panel: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    right: 10,
    width: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    padding: 8,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
  },
  content: {
    padding: 4,
  },
  tabContent: {
    gap: 8,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  performanceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1001,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  storeList: {
    maxHeight: 400,
  },
  storeItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeInfo: {
    marginLeft: 8,
  },
  storeText: {
    fontSize: 12,
    color: '#666',
    marginVertical: 1,
  },
  debugSection: {
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugLog: {
    maxHeight: 200,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugItem: {
    marginBottom: 8,
  },
  debugItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  debugItemContent: {
    fontSize: 12,
    color: '#666',
  },
});