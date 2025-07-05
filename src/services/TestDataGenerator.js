//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/TestDataGenerator.js
// 🧩 Type: Test Service
// 📚 Description: Générateur de données réalistes pour tester la sync
// 🕒 Version: 1.0 - 2025-01-15
// 🧭 Used in: DevPanel, tests
// ─────────────────────────────────────────────────────────
//

import { useUserStore } from '../stores/useUserStore';
import { useCycleStore } from '../stores/useCycleStore';
import { useChatStore } from '../stores/useChatStore';
import { useNotebookStore } from '../stores/useNotebookStore';
import { useEngagementStore } from '../stores/useEngagementStore';
import { useUserIntelligence } from '../stores/useUserIntelligence';
import { useNavigationStore } from '../stores/useNavigationStore';
import { useAppStore } from '../stores/useAppStore';

class TestDataGenerator {
  
  /**
   * Générer un profil utilisateur réaliste
   */
  static generateUserProfile(persona = 'emma') {
    const profiles = {
      emma: {
        prenom: 'Emma',
        ageRange: '26-35',
        journeyChoice: 'emotions',
        preferences: {
          symptoms: 2,
          moods: 5,
          phyto: 3,
          phases: 4,
          lithotherapy: 1,
          rituals: 3,
          terminology: 'naturel'
        }
      },
      laure: {
        prenom: 'Laure',
        ageRange: '36-45',
        journeyChoice: 'body',
        preferences: {
          symptoms: 5,
          moods: 3,
          phyto: 4,
          phases: 3,
          lithotherapy: 2,
          rituals: 4,
          terminology: 'medical'
        }
      },
      sylvie: {
        prenom: 'Sylvie',
        ageRange: '18-25',
        journeyChoice: 'nature',
        preferences: {
          symptoms: 1,
          moods: 4,
          phyto: 5,
          phases: 5,
          lithotherapy: 4,
          rituals: 5,
          terminology: 'naturel'
        }
      }
    };

    return profiles[persona] || profiles.emma;
  }

  /**
   * Générer des données de cycle réalistes
   */
  static generateCycleData() {
    const today = new Date();
    const lastPeriodDate = new Date(today.getTime() - (Math.random() * 28 + 1) * 24 * 60 * 60 * 1000);
    
    return {
      lastPeriodDate: lastPeriodDate.toISOString(),
      length: Math.floor(Math.random() * 7) + 25, // 25-32 jours
      periodDuration: Math.floor(Math.random() * 3) + 4, // 4-7 jours
      isRegular: Math.random() > 0.3,
      trackingExperience: ['beginner', 'intermediate', 'expert'][Math.floor(Math.random() * 3)],
      observations: this.generateObservations(10)
    };
  }

  /**
   * Générer des observations réalistes
   */
  static generateObservations(count = 10) {
    const observations = [];
    const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
    const moods = ['calm', 'energetic', 'confident', 'sensitive', 'optimistic', 'introspective'];
    const symptoms = ['crampes', 'fatigue', 'énergie', 'sensibilité', 'motivation', 'tension'];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      observations.push({
        id: `obs_${Date.now()}_${i}`,
        feeling: Math.floor(Math.random() * 5) + 1,
        energy: Math.floor(Math.random() * 5) + 1,
        notes: `Observation jour ${i + 1} - ${symptoms[Math.floor(Math.random() * symptoms.length)]}`,
        timestamp: timestamp.toISOString(),
        phase: phases[Math.floor(Math.random() * phases.length)],
        cycleDay: Math.floor(Math.random() * 28) + 1,
        mood: moods[Math.floor(Math.random() * moods.length)]
      });
    }

    return observations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Générer des messages de chat réalistes
   */
  static generateChatMessages(count = 20) {
    const messages = [];
    const userQuestions = [
      'Comment je me sens aujourd\'hui ?',
      'Que me dit mon cycle ?',
      'Comment honorer mon énergie ?',
      'Quels rituels pour cette phase ?',
      'Comment gérer mes émotions ?'
    ];
    const meluneResponses = [
      'Tu sembles en phase avec ton cycle aujourd\'hui 🌙',
      'Cette énergie que tu ressens est précieuse, comment l\'honorer ?',
      'Ton corps te parle, que lui réponds-tu ?',
      'Cette sensibilité est un cadeau, pas un fardeau ✨',
      'Chaque phase a sa sagesse, quelle est celle d\'aujourd\'hui ?'
    ];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() - i * 2 * 60 * 60 * 1000); // Toutes les 2h
      const isUser = i % 2 === 0;
      
      messages.push({
        id: `msg_${Date.now()}_${i}`,
        text: isUser 
          ? userQuestions[Math.floor(Math.random() * userQuestions.length)]
          : meluneResponses[Math.floor(Math.random() * meluneResponses.length)],
        isUser,
        timestamp: timestamp.toISOString(),
        phase: ['menstrual', 'follicular', 'ovulatory', 'luteal'][Math.floor(Math.random() * 4)],
        conversationId: `conv_${Math.floor(i / 4)}`
      });
    }

    return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  /**
   * Générer des entrées de carnet réalistes
   */
  static generateNotebookEntries(count = 15) {
    const entries = [];
    const contents = [
      'Aujourd\'hui j\'ai ressenti une énergie incroyable, comme si tout était possible.',
      'Les crampes sont là mais j\'ai trouvé réconfort dans une tisane de camomille.',
      'Phase ovulatoire = confiance au maximum ! J\'ai osé prendre la parole en réunion.',
      'Besoin de ralentir aujourd\'hui. Mon corps me demande du cocooning.',
      'Nouvelle recette de golden latte testée, parfaite pour cette phase lutéale.',
      'Méditation matinale qui m\'a reconnectée à mon cycle et à mes besoins.',
      'Sortie nature qui m\'a fait du bien, les arbres comprennent mes émotions.',
      'Rdv gynéco prévu, questions à poser sur mes cycles irréguliers.',
      'Objectif du mois : honorer chaque phase sans jugement.',
      'Inspiration du jour : "Ton cycle est ta boussole intérieure" ✨'
    ];
    const tags = ['#personnel', '#tracking', '#melune', '#bien-être', '#émotion', '#cycle'];
    const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];

    for (let i = 0; i < count; i++) {
      const timestamp = Date.now() - i * 24 * 60 * 60 * 1000;
      const content = contents[Math.floor(Math.random() * contents.length)];
      const phase = phases[Math.floor(Math.random() * phases.length)];
      
      entries.push({
        id: `entry_${timestamp}`,
        content,
        type: ['personal', 'tracking', 'saved'][Math.floor(Math.random() * 3)],
        tags: [
          tags[Math.floor(Math.random() * tags.length)],
          `#${phase}`,
          tags[Math.floor(Math.random() * tags.length)]
        ].filter((tag, index, arr) => arr.indexOf(tag) === index), // Dédupliquer
        timestamp,
        phase,
        wordCount: content.split(' ').length,
        sentiment: ['positive', 'neutral', 'reflective'][Math.floor(Math.random() * 3)]
      });
    }

    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Générer des métriques d'engagement réalistes
   */
  static generateEngagementMetrics() {
    const daysUsed = Math.floor(Math.random() * 60) + 15; // 15-75 jours
    
    return {
      daysUsed,
      sessionsCount: daysUsed * 2 + Math.floor(Math.random() * 20),
      totalTimeSpent: daysUsed * 8 + Math.floor(Math.random() * 200), // minutes
      lastActiveDate: new Date().toDateString(),
      conversationsStarted: Math.floor(Math.random() * 30) + 10,
      conversationsCompleted: Math.floor(Math.random() * 25) + 8,
      notebookEntriesCreated: Math.floor(Math.random() * 50) + 15,
      cycleTrackedDays: Math.floor(daysUsed * 0.7),
      insightsSaved: Math.floor(Math.random() * 15) + 3,
      vignettesEngaged: Math.floor(Math.random() * 40) + 10,
      phasesExplored: ['menstrual', 'follicular', 'ovulatory', 'luteal'],
      cyclesCompleted: Math.floor(daysUsed / 28),
      autonomySignals: Math.floor(Math.random() * 15) + 5
    };
  }

  /**
   * Générer des données d'intelligence utilisateur
   */
  static generateIntelligenceData() {
    return {
      learning: {
        confidence: Math.floor(Math.random() * 40) + 50, // 50-90%
        timePatterns: {
          favoriteHours: [8, 14, 20],
          activeDays: ['monday', 'wednesday', 'friday', 'sunday'],
          sessionDuration: Math.floor(Math.random() * 10) + 5
        },
        conversationPrefs: {
          responseLength: ['short', 'medium', 'long'][Math.floor(Math.random() * 3)],
          questionTypes: ['emotional', 'practical', 'cycle'],
          successfulPrompts: [
            { prompt: 'Comment te sens-tu ?', phase: 'luteal', timestamp: new Date().toISOString() },
            { prompt: 'Quelle énergie ressens-tu ?', phase: 'follicular', timestamp: new Date().toISOString() }
          ],
          avoidedTopics: ['stress', 'work']
        },
        phasePatterns: {
          menstrual: { mood: 'calm', energy: 2, topics: ['repos', 'cocooning'] },
          follicular: { mood: 'energetic', energy: 4, topics: ['projets', 'créativité'] },
          ovulatory: { mood: 'confident', energy: 5, topics: ['communication', 'social'] },
          luteal: { mood: 'introspective', energy: 3, topics: ['préparation', 'sensibilité'] }
        }
      },
      observationPatterns: {
        consistency: Math.random() * 0.3 + 0.6, // 0.6-0.9
        confidence: Math.floor(Math.random() * 30) + 60, // 60-90
        preferredMode: ['predictive', 'hybrid', 'observation'][Math.floor(Math.random() * 3)],
        lastObservations: this.generateObservations(5),
        autonomySignals: {
          correctsPredictions: Math.floor(Math.random() * 8) + 2,
          manualPhaseChanges: Math.floor(Math.random() * 5) + 1,
          detailedObservations: Math.floor(Math.random() * 15) + 5,
          patternRecognitions: Math.floor(Math.random() * 6) + 2
        },
        totalObservations: Math.floor(Math.random() * 50) + 20
      }
    };
  }

  /**
   * Populer tous les stores avec des données de test
   */
  static async populateAllStores(persona = 'emma') {
    console.log('🧪 Génération de données de test réalistes...');

    try {
      // 1. User Store
      const userProfile = this.generateUserProfile(persona);
      const userStore = useUserStore.getState();
      userStore.updateProfile(userProfile);
      userStore.setPersona(persona, 0.85);

      // 2. Cycle Store
      const cycleData = this.generateCycleData();
      const cycleStore = useCycleStore.getState();
      cycleStore.updateCycle(cycleData);

      // 3. Chat Store
      const messages = this.generateChatMessages(15);
      const chatStore = useChatStore.getState();
      chatStore.clearMessages();
      messages.forEach(msg => chatStore.addMessage(msg.text, msg.isUser, msg.phase));

      // 4. Notebook Store
      const entries = this.generateNotebookEntries(12);
      const notebookStore = useNotebookStore.getState();
      // Simuler l'ajout d'entrées (on ne peut pas injecter directement)
      entries.slice(0, 5).forEach(entry => {
        notebookStore.addEntry(entry.content, entry.type, entry.tags);
      });

      // 5. Engagement Store
      const engagementMetrics = this.generateEngagementMetrics();
      const engagementStore = useEngagementStore.getState();
      // Simuler des actions pour générer les métriques
      for (let i = 0; i < engagementMetrics.conversationsStarted; i++) {
        engagementStore.trackAction('conversation_started');
      }
      for (let i = 0; i < engagementMetrics.notebookEntriesCreated; i++) {
        engagementStore.trackAction('notebook_entry');
      }

      // 6. Intelligence Store
      const intelligenceData = this.generateIntelligenceData();
      const intelligenceStore = useUserIntelligence.getState();
      // Simuler des interactions pour alimenter l'intelligence
      intelligenceStore.trackInteraction('conversation_start', { phase: 'follicular' });
      intelligenceStore.trackInteraction('phase_mood_tracked', { phase: 'ovulatory', mood: 'confident' });

      // 7. App Store - Configuration réaliste
      const appStore = useAppStore.getState();
      appStore.setTheme(['light', 'dark', 'system'][Math.floor(Math.random() * 3)]);
      appStore.setFirstLaunch(false);

      console.log('✅ Données de test générées avec succès !');
      console.log(`👤 Persona: ${persona}`);
      console.log(`🩸 Cycle: ${cycleData.length} jours`);
      console.log(`💬 Messages: ${messages.length}`);
      console.log(`📝 Entrées: ${entries.length}`);
      console.log(`📊 Engagement: ${engagementMetrics.daysUsed} jours`);

      return {
        success: true,
        persona,
        stats: {
          cycleLength: cycleData.length,
          messagesCount: messages.length,
          entriesCount: entries.length,
          daysUsed: engagementMetrics.daysUsed,
          confidence: intelligenceData.learning.confidence
        }
      };

    } catch (error) {
      console.error('❌ Erreur génération données test:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Générer un rapport de test complet
   */
  static generateTestReport() {
    const stores = {
      user: useUserStore.getState(),
      cycle: useCycleStore.getState(),
      chat: useChatStore.getState(),
      notebook: useNotebookStore.getState(),
      engagement: useEngagementStore.getState(),
      intelligence: useUserIntelligence.getState(),
      navigation: useNavigationStore.getState(),
      app: useAppStore.getState()
    };

    const report = {
      timestamp: new Date().toISOString(),
      stores: {},
      totalDataSize: 0,
      dataQuality: {}
    };

    // Analyser chaque store
    Object.entries(stores).forEach(([storeName, store]) => {
      const storeData = JSON.stringify(store);
      const dataSize = new Blob([storeData]).size;
      
      report.stores[storeName] = {
        size: dataSize,
        hasData: Object.keys(store).length > 0,
        keyCount: Object.keys(store).length
      };
      
      report.totalDataSize += dataSize;
    });

    // Évaluer la qualité des données
    report.dataQuality = {
      userProfileComplete: !!(stores.user.profile?.prenom && stores.user.profile?.ageRange),
      cycleDataPresent: !!(stores.cycle.lastPeriodDate && stores.cycle.length),
      hasObservations: stores.cycle.observations?.length > 0,
      hasMessages: stores.chat.messages?.length > 0,
      hasEntries: stores.notebook.entries?.length > 0,
      intelligenceActive: stores.intelligence.learning?.confidence > 0,
      engagementTracked: stores.engagement.metrics?.daysUsed > 0
    };

    return report;
  }
}

export default TestDataGenerator; 