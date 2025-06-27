//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/dev/DevNavigation.jsx
// 🧩 Type : Intelligence Lab v8.0 - Expérimentation Personas
// 📚 Description : Laboratoire complet pour tester intelligence cyclique
// 🕒 Version : 8.0 - 2025-06-23 - INTELLIGENCE LAB
// 🧭 Utilisé dans : Mode développeur uniquement
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';

// Core hooks
import { useCycle } from '../../hooks/useCycle';

// Stores
import { useUserStore } from '../../stores/useUserStore';
import { useAppStore } from '../../stores/useAppStore';
import { useChatStore } from '../../stores/useChatStore';
import { useNotebookStore } from '../../stores/useNotebookStore';

// Config
import { PERSONA_PROFILES } from '../../config/personaProfiles';

import PerformanceDashboard from './PerformanceDashboard';

// Intelligence Services
import VignettesService from '../../services/VignettesService';
import performanceMonitor from '../monitoring/PerformanceMonitor';

export default function DevNavigation() {
  const router = useRouter();
  
  // États UI intelligents
  const [showToolbox, setShowToolbox] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  
  // Référence pour log unique d'initialisation
  const initializedRef = useRef(false);
  
  // Hooks et stores
  const cycle = useCycle();
  const { profile, preferences, persona, melune, reset: resetUser, updateProfile, updatePreferences, updateMelune, setPersona } = useUserStore();
  const { devMode } = useAppStore();
  const { messages, clearMessages, getMessagesCount } = useChatStore();
  const { entries, reset: resetNotebook, addEntry, addQuickTracking, addPersonalNote } = useNotebookStore();

  // Services Intelligence (optionnels)
  let adaptiveInterface = null;
  let smartSuggestions = null;
  let vignetteHook = null;
  let engagementStore = null;
  let userIntelligenceStore = null;
  
  try {
    const { useAdaptiveInterface } = require('../../hooks/useAdaptiveInterface');
    const { useSmartSuggestions } = require('../../hooks/useSmartSuggestions');
    const { useVignettes } = require('../../hooks/useVignettes');
    const { useEngagementStore } = require('../../stores/useEngagementStore');
    const { useUserIntelligence } = require('../../stores/useUserIntelligence');
    
    adaptiveInterface = useAdaptiveInterface();
    smartSuggestions = useSmartSuggestions();
    vignetteHook = useVignettes();
    engagementStore = useEngagementStore();
    userIntelligenceStore = useUserIntelligence();
  } catch (error) {
    console.log('🧪 Mode Basic: Services intelligence non disponibles');
  }

  // ═══════════════════════════════════════════════════════
  // 🚀 INITIALISATION
  // ═══════════════════════════════════════════════════════
  
  useEffect(() => {
    if (__DEV__ && !initializedRef.current) {
      console.log('🧪 INTELLIGENCE LAB v8.0 - Ready for experimentation');
      initializedRef.current = true;
    }
  }, []);

  if (!__DEV__) {
    return null;
  }

  // ═══════════════════════════════════════════════════════
  // 🧪 BOUTON 1: INTELLIGENCE MONITOR
  // ═══════════════════════════════════════════════════════
  
  const runIntelligenceMonitor = () => {
    try {
      const intelligence = [];
      
      // 🎭 PERSONAS ANALYSIS
      intelligence.push('🎭 PERSONAS INTELLIGENCE');
      intelligence.push(`├─ Actuel: ${persona?.currentPersona || 'aucun'}`);
      intelligence.push(`├─ Confiance: ${Math.round((persona?.confidence || 0) * 100)}%`);
      intelligence.push(`└─ Dernière calc: ${persona?.lastCalculated ? new Date(persona?.lastCalculated).toLocaleTimeString() : 'jamais'}`);
      
      // 🧠 ADAPTIVE INTERFACE
      if (adaptiveInterface) {
        intelligence.push('\n🧠 ADAPTIVE INTERFACE');
        intelligence.push(`├─ Maturité: ${adaptiveInterface.maturityLevel}`);
        intelligence.push(`├─ Confiance: ${adaptiveInterface.confidence}%`);
        intelligence.push(`├─ Features: ${adaptiveInterface.featuresAvailable}/${adaptiveInterface.totalFeatures}`);
        intelligence.push(`└─ Next Steps: ${adaptiveInterface.nextSteps?.length || 0}`);
      }
      
      // 🎯 SMART SUGGESTIONS
      if (smartSuggestions) {
        intelligence.push('\n🎯 SMART SUGGESTIONS');
        intelligence.push(`├─ Actions: ${smartSuggestions.actions?.length || 0}`);
        intelligence.push(`├─ Confiance: ${smartSuggestions.confidence || 0}%`);
        intelligence.push(`├─ Personnalisées: ${smartSuggestions.hasPersonalizedData ? 'Oui' : 'Non'}`);
        intelligence.push(`└─ Apprentissage: ${smartSuggestions.isLearning ? 'Actif' : 'Inactif'}`);
      }
      
      // 🎴 VIGNETTES SYSTEM
      if (vignetteHook) {
        intelligence.push('\n🎴 VIGNETTES SYSTEM');
        intelligence.push(`├─ Affichées: ${vignetteHook.vignettes?.length || 0}`);
        intelligence.push(`├─ Max: ${vignetteHook.maxDisplayed || 3}`);
        intelligence.push(`├─ Smart: ${vignetteHook.hasSmartSuggestions ? 'Oui' : 'Non'}`);
        intelligence.push(`└─ Phase: ${vignetteHook.currentPhase || 'undefined'}`);
      }
      
      // 📊 ENGAGEMENT METRICS
      if (engagementStore) {
        intelligence.push('\n📊 ENGAGEMENT METRICS');
        intelligence.push(`├─ Score: ${engagementStore.getEngagementScore?.() || 0}/100`);
        intelligence.push(`├─ Jours: ${engagementStore.getDaysUsed?.() || 0}`);
        intelligence.push(`├─ Actions: ${engagementStore.getTotalActions?.() || 0}`);
        intelligence.push(`└─ Milestone: ${engagementStore.getCurrentMilestone?.()?.name || 'none'}`);
      }
      
      // 🔄 CYCLE INTELLIGENCE
      intelligence.push('\n🔄 CYCLE INTELLIGENCE');
      intelligence.push(`├─ Phase: ${cycle?.currentPhase || 'loading'}`);
      intelligence.push(`├─ Jour: J${cycle?.currentDay || 0}`);
      intelligence.push(`├─ Progrès: ${cycle?.getPhaseProgress?.() || 0}%`);
      intelligence.push(`└─ Valide: ${cycle?.isValid ? 'Oui' : 'Non'}`);
      
      Alert.alert('🧪 Intelligence Monitor', intelligence.join('\n'), [
        { text: 'Fermer' },
        { text: 'Refresh', onPress: () => setTimeout(runIntelligenceMonitor, 100) }
      ]);
      
    } catch (error) {
      console.error('❌ Erreur Intelligence Monitor:', error);
      Alert.alert('❌ Monitor Failed', `Erreur: ${error.message}`);
    }
  };

  // ═══════════════════════════════════════════════════════
  // 🎭 BOUTON 2: PERSONA SIMULATOR (SUPPRIMÉ)
  // ═══════════════════════════════════════════════════════
  
  // SUPPRIMÉ: runPersonaSimulator et simulateCompleteScenario
  // Les personas et la maturité sont maintenant séparés

  // ═══════════════════════════════════════════════════════
  // 🔬 BOUTON 3: VIGNETTES LAB
  // ═══════════════════════════════════════════════════════
  
  const runVignettesLab = () => {
    Alert.alert(
      '🔬 Vignettes Lab',
      'Expérimenter avec les vignettes intelligentes:',
      [
        { text: 'Test Génération', onPress: testVignetteGeneration },
        { text: 'Cache Management', onPress: manageVignetteCache },
        { text: 'Navigation Test', onPress: testVignetteNavigation },
        { text: 'Performance', onPress: testVignettePerformance },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const testVignetteGeneration = async () => {
    try {
      const results = [];
      
      // Test génération pour toutes combinaisons
      const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
      const personas = ['emma', 'laure', 'sylvie'];
      
      for (const phase of phases) {
        for (const persona of personas) {
          const vignettes = await VignettesService.getVignettes(phase, persona);
          results.push(`${phase}×${persona}: ${vignettes.length} vignettes`);
        }
      }
      
      Alert.alert('🔬 Génération Test', results.join('\n'), [
        { text: 'Emergency Test', onPress: testEmergencyVignettes },
        { text: 'OK' }
      ]);
      
    } catch (error) {
      Alert.alert('❌ Test Failed', error.message);
    }
  };

  const testEmergencyVignettes = () => {
    const emergency = VignettesService.getEmergencyVignettes('menstrual');
    Alert.alert(
      '🆘 Emergency Vignettes',
      `Generated: ${emergency.length} vignettes\n${emergency.map(v => `• ${v.title}`).join('\n')}`
    );
  };

  const manageVignetteCache = () => {
    Alert.alert(
      '💾 Cache Management',
      'Gérer le cache des vignettes:',
      [
        { text: 'Clear Cache', onPress: clearVignetteCache },
        { text: 'Cache Info', onPress: showCacheInfo },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const clearVignetteCache = async () => {
    try {
      await VignettesService.clearCache();
      Alert.alert('✅ Cache Cleared', 'Cache des vignettes vidé');
    } catch (error) {
      Alert.alert('❌ Clear Failed', error.message);
    }
  };

  const showCacheInfo = () => {
    const cacheSize = VignettesService.cache?.size || 0;
    Alert.alert('💾 Cache Info', `Entrées en mémoire: ${cacheSize}`);
  };

  const testVignetteNavigation = () => {
    if (!vignetteHook || !vignetteHook.vignettes?.[0]) {
      Alert.alert('⚠️ No Vignettes', 'Aucune vignette disponible pour test');
      return;
    }
    
    const testVignette = vignetteHook.vignettes[0];
    const navParams = vignetteHook.getNavigationParams(testVignette);
    
    Alert.alert(
      '🧭 Navigation Test',
      `Vignette: ${testVignette.title}\nRoute: ${navParams.route}\nParams: ${JSON.stringify(navParams.params, null, 2)}`,
      [
        { text: 'Navigate', onPress: () => navigateTo(navParams.route) },
        { text: 'Cancel' }
      ]
    );
  };

  const testVignettePerformance = async () => {
    const start = performance.now();
    
    try {
      // Test performance génération
      await Promise.all([
        VignettesService.getVignettes('menstrual', 'emma'),
        VignettesService.getVignettes('follicular', 'laure'),
        VignettesService.getVignettes('ovulatory', 'sylvie'),
      ]);
      
      const duration = performance.now() - start;
      Alert.alert('⚡ Performance Test', `3 générations en ${duration.toFixed(2)}ms`);
      
    } catch (error) {
      Alert.alert('❌ Performance Failed', error.message);
    }
  };

  // ═══════════════════════════════════════════════════════
  // 🎭 FONCTIONS UTILITAIRES
  // ═══════════════════════════════════════════════════════
  
  const simulatePersona = (personaId) => {
    const personaData = PERSONA_PROFILES[personaId];
    if (!personaData) return;

    // Configuration du style/ton seulement (sans maturité)
    updateProfile({
      prenom: personaData.name,
      ageRange: personaData.ageRange[0],
      journeyChoice: personaData.preferredJourney[0],
      completed: true,
    });

    updatePreferences(personaData.referencePreferences);
    setPersona(personaId, 1.0);
    updateMelune({
      avatarStyle: personaData.avatarStyle[0],
      tone: personaData.communicationStyle[0],
      personalityMatch: personaId,
    });
    
    Alert.alert('🎭 Persona Activé', `${personaData.name} configurée !\n\nStyle: ${personaData.avatarStyle[0]}\nTon: ${personaData.communicationStyle[0]}\n\nConfigure maintenant la maturité séparément!`);
  };

  const simulateMaturityLevel = (level) => {
    try {
      if (!engagementStore) {
        Alert.alert('⚠️ Engagement Store', 'Store d\'engagement non disponible');
        return;
      }

      // Configuration des métriques d'engagement selon le niveau
      const maturityConfigs = {
        discovery: {
          engagementScore: 25,
          daysUsed: 7,
          totalActions: 15,
          milestone: 'discovery'
        },
        learning: {
          engagementScore: 60,
          daysUsed: 30,
          totalActions: 80,
          milestone: 'learning'
        },
        autonomous: {
          engagementScore: 95,
          daysUsed: 90,
          totalActions: 200,
          milestone: 'autonomous'
        }
      };

      const config = maturityConfigs[level];
      if (!config) {
        Alert.alert('❌ Niveau invalide', 'Niveau de maturité non reconnu');
        return;
      }

      // Mise à jour du store d'engagement
      engagementStore.setEngagementScore(config.engagementScore);
      engagementStore.setDaysUsed(config.daysUsed);
      engagementStore.setTotalActions(config.totalActions);
      
      // Mise à jour du niveau de maturité dans l'interface adaptative
      if (adaptiveInterface && adaptiveInterface.setMaturityLevel) {
        adaptiveInterface.setMaturityLevel(level);
      }

      // Génération de données contextuelles selon la maturité
      generateMaturityData(level);

      Alert.alert(
        '🎓 Maturité Configurée', 
        `Niveau: ${level}\nScore: ${config.engagementScore}/100\nJours: ${config.daysUsed}\nActions: ${config.totalActions}\n\nTeste maintenant l'intelligence adaptative!`
      );

    } catch (error) {
      console.error('❌ Erreur configuration maturité:', error);
      Alert.alert('❌ Erreur', `Impossible de configurer la maturité: ${error.message}`);
    }
  };

  const generateMaturityData = (level) => {
    try {
      // Messages selon le niveau de maturité
      const maturityMessages = {
        discovery: {
          user: "Je commence à découvrir mon cycle, c'est fascinant !",
          melune: "C'est merveilleux de voir ta curiosité ! ✨ Commençons par explorer ensemble..."
        },
        learning: {
          user: "J'observe des patterns dans mon cycle, je veux en apprendre plus.",
          melune: "Excellente observation ! Analysons ensemble ces patterns pour mieux comprendre ton rythme."
        },
        autonomous: {
          user: "Je maîtrise maintenant mon cycle, je sais comment l'optimiser.",
          melune: "Ta maîtrise est impressionnante ! Tu as développé une vraie sagesse cyclique."
        }
      };

      const messages = maturityMessages[level];
      if (messages) {
        const { addMessage } = useChatStore.getState();
        addMessage(messages.user, 'user');
        addMessage(messages.melune, 'assistant', { 
          maturityLevel: level,
          context: 'maturity-simulation'
        });
      }

      // Entrées carnet selon maturité
      const journalEntries = {
        discovery: "Première exploration de mon cycle. Je découvre un nouveau langage corporel.",
        learning: "Analyse de mes patterns cycliques. J'observe des récurrences intéressantes.",
        autonomous: "Maîtrise de mon cycle. Je sais maintenant comment optimiser chaque phase."
      };

      addEntry(journalEntries[level], "personal", [`#${level}`, "#maturité", "#simulation"]);

    } catch (error) {
      console.error('❌ Erreur génération données maturité:', error);
    }
  };

  const setCyclePhase = (targetPhase) => {
    try {
      const phaseDays = { menstrual: 2, follicular: 10, ovulatory: 15, luteal: 22 };
      const dayInCycle = phaseDays[targetPhase];
      const newDate = new Date();
      newDate.setDate(newDate.getDate() - dayInCycle);
      const { updateCycle } = useUserStore.getState();
      updateCycle({ lastPeriodDate: newDate.toISOString() });
      
      // Refresh vignettes pour nouvelle phase
      if (vignetteHook) {
        vignetteHook.refresh();
      }
      
      Alert.alert('🔄 Phase Changée', `Cycle en phase ${targetPhase} (J${dayInCycle})\n\nVignettes mises à jour!`);
    } catch (error) {
      console.error('❌ Erreur changement phase:', error);
      Alert.alert('❌ Erreur', 'Impossible de changer la phase');
    }
  };

  const generateSampleData = () => {
    try {
      // Chat samples contextuels
      const { addMessage } = useChatStore.getState();
      addMessage("Bonjour ! Comment te sens-tu dans ta phase actuelle ?", 'assistant', { mood: 'friendly' });
      addMessage("Je me sens bien, j'observe mes ressentis plus finement maintenant", 'user');
      addMessage("C'est merveilleux cette conscience cyclique qui grandit en toi ✨", 'assistant', { mood: 'supportive' });
      
      // Notebook samples riches
      addEntry?.("Observation des patterns énergétiques selon ma phase", "personal", ["#observation", "#patterns"]);
      addQuickTracking?.("équilibré", 4, ["focus", "sérénité"]);
      addPersonalNote?.("Prise de conscience: mon cycle guide mes choix naturellement", ["#sagesse", "#autonomie"]);
      
      Alert.alert('📊 Données Générées', 'Dataset d\'expérimentation créé !\n\nTeste maintenant l\'intelligence!');
    } catch (error) {
      console.error('❌ Erreur génération données:', error);
      Alert.alert('❌ Erreur', 'Impossible de générer les données');
    }
  };

  const navigateTo = (route) => {
    try {
      router.push(route);
      setShowToolbox(false);
    } catch (error) {
      console.error('❌ Erreur navigation:', error);
      Alert.alert('❌ Navigation', `Impossible de naviguer vers ${route}`);
    }
  };

  const resetAll = () => {
    Alert.alert(
      '🗑️ Reset Intelligence Lab',
      'Effacer toutes les données d\'expérimentation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Reset Lab', 
          style: 'destructive',
          onPress: () => {
            try {
              resetUser?.();
              clearMessages?.();
              resetNotebook?.();
              
              if (engagementStore?.reset) {
                engagementStore.reset();
              }
              if (userIntelligenceStore?.reset) {
                userIntelligenceStore.reset();
              }
              
              VignettesService.clearCache();
              
              Alert.alert('✅ Lab Reset', 'Intelligence Lab réinitialisé !\n\nPrêt pour nouvelles expérimentations.');
            } catch (error) {
              console.error('❌ Erreur reset:', error);
              Alert.alert('❌ Erreur', `Reset partiel: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const resetCycleOnly = () => {
    Alert.alert(
      '🔄 Reset Cycle',
      'Remettre le cycle à zéro ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Reset Cycle', 
          style: 'destructive',
          onPress: () => {
            try {
              const { updateCycle } = useUserStore.getState();
              updateCycle({
                lastPeriodDate: null,
                length: 28,
                periodDuration: 5,
                isRegular: null,
                trackingExperience: null,
              });
              Alert.alert('✅ Cycle Reset', 'Cycle réinitialisé pour expérimentation');
            } catch (error) {
              console.error('❌ Erreur reset cycle:', error);
              Alert.alert('❌ Erreur', 'Impossible de réinitialiser le cycle');
            }
          }
        }
      ]
    );
  };

  // ═══════════════════════════════════════════════════════
  // 🧹 OPTIMISATION ASYNCSTORAGE
  // ═══════════════════════════════════════════════════════
  
  const optimizeAsyncStorage = async () => {
    try {
      Alert.alert('🧹 Optimisation en cours...', 'Nettoyage AsyncStorage');
      
      const optimized = await performanceMonitor.optimizeAsyncStorage();
      
      if (optimized) {
        Alert.alert(
          '✅ Storage Optimisé', 
          'AsyncStorage nettoyé !\nLes performances devraient s\'améliorer.',
          [
            { text: 'Vérifier', onPress: () => setActivePanel('performance') },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('ℹ️ Storage OK', 'AsyncStorage déjà optimisé\nPerformances normales');
      }
      
    } catch (error) {
      console.error('❌ Erreur optimisation:', error);
      Alert.alert('❌ Optimisation Failed', `Erreur: ${error.message}`);
    }
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDU INTELLIGENCE LAB
  // ═══════════════════════════════════════════════════════

  return (
    <View style={styles.container}>
      {/* TOGGLE BUTTON */}
      <TouchableOpacity 
        style={[styles.toggleButton, showToolbox && styles.toggleActive]} 
        onPress={() => setShowToolbox(!showToolbox)}
      >
        <Text style={styles.toggleText}>
          {showToolbox ? '✕' : '🧪'}
        </Text>
      </TouchableOpacity>

      {/* INTELLIGENCE LAB TOOLBOX */}
      {showToolbox && (
        <View style={styles.toolbox}>
          <ScrollView style={styles.toolboxContent} showsVerticalScrollIndicator={false}>
            
            {/* Header Lab */}
            <Text style={styles.labHeader}>🧪 Intelligence Lab v8.0</Text>
            
            {/* Status Intelligence */}
            <Text style={styles.status}>
              {persona?.currentPersona || 'auto'} | {cycle?.currentPhase || 'loading'} J{cycle?.currentDay || 0}
              {adaptiveInterface ? ` | ${adaptiveInterface.maturityLevel}` : ''}
              {engagementStore ? ` | 🎓 ${engagementStore.getCurrentMilestone?.()?.name || 'none'}` : ''}
            </Text>
            
            {/* 🔬 ACTIONS INTELLIGENCE PRINCIPALES */}
            <Text style={styles.sectionTitle}>🔬 Intelligence Actions</Text>
            
            <TouchableOpacity style={[styles.intelligenceButton, {backgroundColor: '#00D4AA'}]} onPress={runIntelligenceMonitor}>
              <Text style={styles.intelligenceButtonText}>🧪 Intelligence Monitor</Text>
              <Text style={styles.intelligenceButtonSub}>Surveillance IA temps réel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.intelligenceButton, {backgroundColor: '#FF6B6B'}]} onPress={runVignettesLab}>
              <Text style={styles.intelligenceButtonText}>🔬 Vignettes Lab</Text>
              <Text style={styles.intelligenceButtonSub}>Test navigation intelligente</Text>
            </TouchableOpacity>
            
            {/* 🧭 NAVIGATION RAPIDE */}
            <Text style={styles.sectionTitle}>🧭 Navigation</Text>
            <View style={styles.buttonGrid}>
              <TouchableOpacity style={styles.navButton} onPress={() => navigateTo('/onboarding/100-promesse')}>
                <Text style={styles.navButtonText}>Onboarding</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={() => navigateTo('/(tabs)/cycle')}>
                <Text style={styles.navButtonText}>Cycle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={() => navigateTo('/(tabs)/chat')}>
                <Text style={styles.navButtonText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={() => navigateTo('/(tabs)/notebook')}>
                <Text style={styles.navButtonText}>Carnet</Text>
              </TouchableOpacity>
            </View>
            
            {/* 👤 PERSONAS */}
            <Text style={styles.sectionTitle}>👤 Personas</Text>
            <View style={styles.buttonGrid}>
              {Object.keys(PERSONA_PROFILES).slice(0, 3).map(personaId => (
                <TouchableOpacity 
                  key={personaId}
                  style={[styles.quickButton, persona?.currentPersona === personaId && styles.activePersona]} 
                  onPress={() => simulatePersona(personaId)}
                >
                  <Text style={styles.quickButtonText}>
                    {PERSONA_PROFILES[personaId].name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* 🎓 MATURITÉ */}
            <Text style={styles.sectionTitle}>🎓 Maturité</Text>
            <View style={styles.buttonGrid}>
              {['discovery', 'learning', 'autonomous'].map(level => (
                <TouchableOpacity 
                  key={level}
                  style={[styles.quickButton, {backgroundColor: '#FF9500'}, adaptiveInterface?.maturityLevel === level && styles.activeMaturity]} 
                  onPress={() => simulateMaturityLevel(level)}
                >
                  <Text style={styles.quickButtonText}>
                    {level.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* 🔄 CYCLE */}
            <Text style={styles.sectionTitle}>🔄 Cycle</Text>
            <View style={styles.buttonGrid}>
              {['menstrual', 'follicular', 'ovulatory', 'luteal'].map(phase => (
                <TouchableOpacity 
                  key={phase}
                  style={[styles.quickButton, cycle?.currentPhase === phase && styles.activePhase]} 
                  onPress={() => setCyclePhase(phase)}
                >
                  <Text style={styles.quickButtonText}>
                    {phase.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Bouton Reset Cycle spécifique */}
            <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#FF9500', marginBottom: 8}]} onPress={resetCycleOnly}>
              <Text style={styles.actionButtonText}>🔄 Reset Cycle</Text>
            </TouchableOpacity>
            
            {/* ⚡ DONNÉES & OUTILS */}
            <Text style={styles.sectionTitle}>⚡ Données & Outils</Text>
            <TouchableOpacity style={styles.actionButton} onPress={generateSampleData}>
              <Text style={styles.actionButtonText}>📊 Générer Dataset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => setActivePanel('performance')}>
              <Text style={styles.actionButtonText}>📈 Performance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#FF9500'}]} onPress={optimizeAsyncStorage}>
              <Text style={styles.actionButtonText}>🧹 Optimiser Storage</Text>
            </TouchableOpacity>
            
            {/* 📊 INTELLIGENCE STATS */}
            <View style={styles.intelligenceStats}>
              <Text style={styles.statsText}>💬 {getMessagesCount?.()?.total || 0} messages</Text>
              <Text style={styles.statsText}>📝 {entries?.length || 0} entrées</Text>
              <Text style={styles.statsText}>🎭 {Math.round((persona?.confidence || 0) * 100)}%</Text>
              {adaptiveInterface && (
                <Text style={styles.statsText}>🧠 {adaptiveInterface.featuresAvailable}/{adaptiveInterface.totalFeatures} features</Text>
              )}
              {engagementStore && (
                <Text style={styles.statsText}>🎓 {engagementStore.getEngagementScore?.() || 0}/100 engagement</Text>
              )}
            </View>
            
            <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#f44336'}]} onPress={resetAll}>
              <Text style={styles.actionButtonText}>🗑️ Reset Lab</Text>
            </TouchableOpacity>
            
          </ScrollView>
        </View>
      )}

      {/* Performance Dashboard */}
      {activePanel === 'performance' && (
        <View style={styles.performanceModal}>
          <View style={styles.performanceContent}>
            <TouchableOpacity 
              style={styles.closePerformance}
              onPress={() => setActivePanel(null)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <PerformanceDashboard />
          </View>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// 🎨 STYLES INTELLIGENCE LAB
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
  
  // Toggle Button - Intelligence Lab Style
  toggleButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00D4AA',
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
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  
  // Toolbox Intelligence Lab Style
  toolbox: {
    position: 'absolute',
    top: 115,
    right: 15,
    width: 320,
    height: 700,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#00D4AA',
  },
  
  toolboxContent: {
    flex: 1,
  },
  
  // Lab Header
  labHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00D4AA',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'System',
  },
  
  // Status
  status: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    fontWeight: '500',
    fontFamily: 'System',
  },
  
  // Sections
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: -0.3,
    fontFamily: 'System',
  },
  
  // Intelligence Buttons (NOUVEAUX)
  intelligenceButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  intelligenceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'System',
  },
  
  intelligenceButtonSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
    fontFamily: 'System',
  },
  
  // Grilles de boutons
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  
  // Navigation buttons
  navButton: {
    backgroundColor: '#5856D6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 55,
  },
  
  navButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'System',
  },
  
  quickButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  quickButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'System',
  },
  
  activePhase: {
    backgroundColor: '#34C759',
    transform: [{ scale: 1.05 }],
  },
  
  activePersona: {
    backgroundColor: '#FF9500',
    transform: [{ scale: 1.05 }],
  },
  
  activeMaturity: {
    backgroundColor: '#FF6B6B',
    transform: [{ scale: 1.05 }],
  },
  
  // Intelligence Stats (NOUVEAU)
  intelligenceStats: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  
  statsText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'System',
    marginBottom: 2,
  },
  
  // Boutons d'action
  actionButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  actionButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: 'System',
  },
  
  // Performance Modal
  performanceModal: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  performanceContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  
  closePerformance: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 21000,
  },
  
  closeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});
