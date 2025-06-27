//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/dev/DevPanel.jsx
// 🧩 Type : Dev Component Simplifié
// 📚 Description : Panel développement quotidien - Version allégée
// 🕒 Version : 1.0 - 2025-06-27 - SIMPLIFIED
// 🧭 Utilisé dans : Layout app (mode dev uniquement)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';

// Stores
import { useUserStore } from '../../stores/useUserStore';
import { useChatStore } from '../../stores/useChatStore';
import { useNotebookStore } from '../../stores/useNotebookStore';

// Hooks
import { useCycle } from '../../hooks/useCycle';

// Config
import { PERSONA_PROFILES } from '../../config/personaProfiles';

export default function DevPanel() {
  const router = useRouter();
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('cycle');

  // Stores
  const { profile, persona, updateProfile, updateCycle, setPersona, reset: resetUser } = useUserStore();
  const { addMessage, clearMessages, getMessagesCount } = useChatStore();
  const { addEntry, addQuickTracking, reset: resetNotebook, entries } = useNotebookStore();
  
  // Cycle hook
  const cycle = useCycle();

  // Ne pas afficher en production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // ═══════════════════════════════════════════════════════
  // 🔄 CYCLE CONTROL
  // ═══════════════════════════════════════════════════════

  const jumpToDay = (targetDay) => {
    try {
      const today = new Date();
      const cycleStart = new Date(today);
      cycleStart.setDate(today.getDate() - targetDay + 1);
      
      updateCycle({ lastPeriodDate: cycleStart.toISOString() });
      Alert.alert('🔄 Cycle Mis à Jour', `Maintenant à J${targetDay} du cycle`);
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible de modifier le cycle');
    }
  };

  const adjustDay = (direction) => {
    try {
      const currentDay = cycle?.currentDay || 1;
      const newDay = direction === 'next' ? currentDay + 1 : Math.max(1, currentDay - 1);
      jumpToDay(newDay);
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible d\'ajuster le jour');
    }
  };

  const jumpToPhase = (targetPhase) => {
    const phaseDays = { 
      menstrual: 2, 
      follicular: 10, 
      ovulatory: 15, 
      luteal: 22 
    };
    jumpToDay(phaseDays[targetPhase]);
  };

  // ═══════════════════════════════════════════════════════
  // 🎭 PERSONA & TESTS
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
    Alert.alert('🎭 Persona Activée', `${personaData.name} configurée !`);
  };

  const testChatContext = async () => {
    const testMessage = "Comment me sens-je dans ma phase actuelle ?";
    const currentPersona = persona?.currentPersona || 'emma';
    const currentPhase = cycle?.currentPhase || 'follicular';
    
    addMessage(testMessage, 'user');
    
    // Message de test contextuel
    const contextResponses = {
      emma: {
        menstrual: "C'est normal de te sentir plus introspective en phase menstruelle 🌙",
        follicular: "Tu débordas d'énergie en phase folliculaire ! ✨",
        ovulatory: "Phase ovulatoire = ton moment de rayonnement 🌟",
        luteal: "Phase lutéale, temps de ralentir et d'écouter ton corps 🍂"
      },
      laure: {
        menstrual: "Optimise cette phase pour la réflexion stratégique 📋",
        follicular: "Phase parfaite pour lancer de nouveaux projets 🚀",
        ovulatory: "Communication et networking au top ! 💼",
        luteal: "Finalise tes projets avant la prochaine phase 📊"
      },
      clara: {
        menstrual: "Phase cocooning, on se dorlote ! 🛁",
        follicular: "On sort, on explore, on découvre ! 🌸",
        ovulatory: "Tu rayonnes, profites-en ! ✨",
        luteal: "Temps de créativité et d'introspection 🎨"
      }
    };

    const response = contextResponses[currentPersona]?.[currentPhase] || 
                    "Je m'adapte à ta phase et ta personnalité ! 💫";
    
    addMessage(response, 'assistant', { 
      persona: currentPersona, 
      phase: currentPhase,
      context: 'dev-test' 
    });

    Alert.alert(
      '💬 Test Chat Contexte', 
      `Message adapté pour ${currentPersona} en phase ${currentPhase}`
    );
  };

  // ═══════════════════════════════════════════════════════
  // 📊 DATA PLAYGROUND
  // ═══════════════════════════════════════════════════════

  const fillRealisticData = () => {
    Alert.alert(
      '📊 Générer Données Réalistes',
      'Quel type de données ?',
      [
        { text: 'Notebook Complet', onPress: () => generateNotebookData() },
        { text: 'Chat History', onPress: () => generateChatData() },
        { text: 'Tout Générer', onPress: () => generateAllData() },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const generateNotebookData = () => {
    const sampleEntries = [
      "Journée pleine d'énergie, j'ai envie de tout entreprendre !",
      "Sensation d'hypersensibilité aujourd'hui, émotions à fleur de peau",
      "Créativité au maximum, mes idées fusent !",
      "Besoin de calme et de cocooning, phase introspective",
      "Confiance en moi au top, je rayonne !",
      "Fatigue inhabituelle, j'écoute mon corps",
      "Irritabilité légère, je prends du recul",
      "Motivation au rendez-vous pour mes projets"
    ];

    sampleEntries.forEach((text, index) => {
      addEntry(text, "personal", [`#jour${index + 1}`, "#observation"]);
      if (index % 2 === 0) {
        addQuickTracking("humeur", Math.floor(Math.random() * 5) + 1, ["énergie"]);
      }
    });

    Alert.alert('✅ Carnet Rempli', `${sampleEntries.length} entrées ajoutées`);
  };

  const generateChatData = () => {
    const conversations = [
      { user: "Salut Melune ! Comment vas-tu ?", assistant: "Coucou ! Je vais bien, et toi dans ta phase actuelle ? ✨" },
      { user: "J'ai des crampes aujourd'hui", assistant: "Je comprends, c'est inconfortable. As-tu essayé la bouillotte ? 🤗" },
      { user: "Pourquoi je me sens si créative ?", assistant: "C'est magnifique ! Ta phase influence ta créativité naturelle 🎨" },
      { user: "Mes émotions sont intenses", assistant: "C'est normal, ton cycle influence tes ressentis. Veux-tu en parler ? 💙" }
    ];

    conversations.forEach(conv => {
      addMessage(conv.user, 'user');
      addMessage(conv.assistant, 'assistant', { context: 'demo-data' });
    });

    Alert.alert('✅ Chat Généré', `${conversations.length} conversations ajoutées`);
  };

  const generateAllData = () => {
    generateNotebookData();
    setTimeout(() => generateChatData(), 500);
  };

  // ═══════════════════════════════════════════════════════
  // 🧹 DEV UTILS
  // ═══════════════════════════════════════════════════════

  const navigateTo = (route) => {
    try {
      router.push(route);
      setShowPanel(false);
    } catch (error) {
      Alert.alert('❌ Navigation', `Impossible de naviguer vers ${route}`);
    }
  };

  const resetSpecific = () => {
    Alert.alert(
      '🧹 Reset Spécifique',
      'Que veux-tu réinitialiser ?',
      [
        { text: 'Chat seulement', onPress: () => { clearMessages(); Alert.alert('✅ Chat Vidé'); }},
        { text: 'Carnet seulement', onPress: () => { resetNotebook(); Alert.alert('✅ Carnet Vidé'); }},
        { text: 'Profil seulement', onPress: () => { resetUser(); Alert.alert('✅ Profil Reset'); }},
        { text: 'Tout Reset', style: 'destructive', onPress: () => {
          resetUser();
          clearMessages();
          resetNotebook();
          Alert.alert('✅ Reset Complet', 'Toutes les données effacées');
        }},
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const copyCurrentState = () => {
    const state = {
      persona: persona?.currentPersona,
      phase: cycle?.currentPhase,
      day: cycle?.currentDay,
      messages: getMessagesCount()?.total || 0,
      entries: entries?.length || 0
    };
    
    console.log('📋 Current Dev State:', JSON.stringify(state, null, 2));
    Alert.alert('📋 État Copié', 'State copié dans la console');
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
        <Text style={styles.toggleText}>{showPanel ? '✕' : '🛠️'}</Text>
      </TouchableOpacity>

      {/* Dev Panel */}
      {showPanel && (
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🛠️ Dev Panel</Text>
            <Text style={styles.status}>
              {persona?.currentPersona || 'auto'} | {cycle?.currentPhase || 'loading'} J{cycle?.currentDay || 0}
            </Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {[
              { id: 'cycle', icon: '🔄', label: 'Cycle' },
              { id: 'persona', icon: '🎭', label: 'Persona' },
              { id: 'data', icon: '📊', label: 'Data' },
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
            {/* 🔄 CYCLE TAB */}
            {activeTab === 'cycle' && (
              <View>
                <Text style={styles.sectionTitle}>🔄 Contrôle Cycle</Text>
                
                {/* Navigation jours */}
                <View style={styles.dayControl}>
                  <TouchableOpacity style={styles.dayButton} onPress={() => adjustDay('prev')}>
                    <Text style={styles.dayButtonText}>← J-1</Text>
                  </TouchableOpacity>
                  <Text style={styles.currentDay}>J{cycle?.currentDay || 0}</Text>
                  <TouchableOpacity style={styles.dayButton} onPress={() => adjustDay('next')}>
                    <Text style={styles.dayButtonText}>J+1 →</Text>
                  </TouchableOpacity>
                </View>

                {/* Jump phases */}
                <Text style={styles.subTitle}>Sauter à la phase :</Text>
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

                {/* Jump jours spécifiques */}
                <Text style={styles.subTitle}>Sauter au jour :</Text>
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
              </View>
            )}

            {/* 🎭 PERSONA TAB */}
            {activeTab === 'persona' && (
              <View>
                <Text style={styles.sectionTitle}>🎭 Personas & Tests</Text>
                
                <Text style={styles.subTitle}>Switch Persona :</Text>
                <View style={styles.buttonGrid}>
                  {Object.keys(PERSONA_PROFILES).slice(0, 3).map(personaId => (
                    <TouchableOpacity
                      key={personaId}
                      style={[styles.personaButton, persona?.currentPersona === personaId && styles.personaActive]}
                      onPress={() => switchPersona(personaId)}
                    >
                      <Text style={styles.personaText}>{PERSONA_PROFILES[personaId].name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.testButton} onPress={testChatContext}>
                  <Text style={styles.testButtonText}>💬 Test Chat Contexte</Text>
                  <Text style={styles.testButtonSub}>Message adapté persona + phase</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 📊 DATA TAB */}
            {activeTab === 'data' && (
              <View>
                <Text style={styles.sectionTitle}>📊 Data Playground</Text>
                
                <TouchableOpacity style={styles.dataButton} onPress={fillRealisticData}>
                  <Text style={styles.dataButtonText}>📝 Générer Données Réalistes</Text>
                </TouchableOpacity>

                <View style={styles.dataStats}>
                  <Text style={styles.statsText}>💬 {getMessagesCount()?.total || 0} messages</Text>
                  <Text style={styles.statsText}>📝 {entries?.length || 0} entrées carnet</Text>
                </View>
              </View>
            )}

            {/* 🧹 UTILS TAB */}
            {activeTab === 'utils' && (
              <View>
                <Text style={styles.sectionTitle}>🧹 Dev Utils</Text>
                
                <Text style={styles.subTitle}>Navigation :</Text>
                <View style={styles.buttonGrid}>
                  {[
                    { route: '/(tabs)/home', label: 'Home' },
                    { route: '/(tabs)/chat', label: 'Chat' },
                    { route: '/(tabs)/cycle', label: 'Cycle' },
                    { route: '/(tabs)/notebook', label: 'Carnet' },
                    { route: '/onboarding/100-promesse', label: 'Onboard' }
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

                <TouchableOpacity style={styles.utilButton} onPress={resetSpecific}>
                  <Text style={styles.utilButtonText}>🗑️ Reset Spécifique</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.utilButton} onPress={copyCurrentState}>
                  <Text style={styles.utilButtonText}>📋 Copy Current State</Text>
                </TouchableOpacity>
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
    backgroundColor: '#007AFF',
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
    width: 300,
    height: 600,
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
    fontSize: 12,
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
    fontSize: 16,
  },
  
  tabLabel: {
    fontSize: 10,
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
  
  dayControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  
  dayButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  dayButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  currentDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
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
  
  testButton: {
    backgroundColor: '#00D4AA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
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
  
  dataButton: {
    backgroundColor: '#FF9500',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  
  dataButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  dataStats: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  
  statsText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
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
    marginBottom: 8,
  },
  
  utilButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});