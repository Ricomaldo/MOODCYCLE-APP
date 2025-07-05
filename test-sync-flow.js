#!/usr/bin/env node

/**
 * 🧪 Script de Test - Flux Complet Synchronisation MoodCycle
 * 
 * Ce script teste :
 * 1. Génération données réalistes
 * 2. Synchronisation vers API
 * 3. Vérification données reçues
 * 4. Analytics calculés
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';
const TEST_DEVICE_ID = `test-device-${Date.now()}`;

// Données de test réalistes
const generateTestStores = () => {
  return {
    userStore: {
      profile: {
        prenom: 'Emma',
        ageRange: '26-35',
        journeyChoice: 'emotions',
        completed: true
      },
      preferences: {
        symptoms: 2,
        moods: 5,
        phyto: 3,
        phases: 4,
        lithotherapy: 1,
        rituals: 3,
        terminology: 'naturel'
      },
      persona: {
        assigned: 'emma',
        confidence: 0.85,
        lastCalculated: new Date().toISOString(),
        scores: { emma: 0.85, laure: 0.45, sylvie: 0.32 }
      },
      melune: {
        avatarStyle: 'classic',
        tone: 'friendly',
        personalityMatch: 'high',
        position: 'bottom-right',
        animated: true
      }
    },
    
    cycleStore: {
      lastPeriodDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      length: 28,
      periodDuration: 5,
      isRegular: true,
      trackingExperience: 'intermediate',
      observations: [
        {
          id: 'obs_1',
          feeling: 4,
          energy: 3,
          notes: 'Bien dormi, énergie stable',
          timestamp: new Date().toISOString(),
          phase: 'follicular',
          cycleDay: 15
        },
        {
          id: 'obs_2',
          feeling: 3,
          energy: 4,
          notes: 'Motivation créative',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          phase: 'follicular',
          cycleDay: 14
        }
      ],
      detectedPatterns: {
        regularityScore: 0.85,
        averageCycleLength: 28.2,
        phaseConsistency: 0.78
      }
    },
    
    chatStore: {
      messages: [
        {
          id: 'msg_1',
          text: 'Comment je me sens aujourd\'hui ?',
          isUser: true,
          timestamp: new Date().toISOString(),
          phase: 'follicular',
          conversationId: 'conv_1'
        },
        {
          id: 'msg_2',
          text: 'Tu sembles en harmonie avec ton cycle aujourd\'hui 🌙',
          isUser: false,
          timestamp: new Date().toISOString(),
          phase: 'follicular',
          conversationId: 'conv_1'
        }
      ],
      conversationStats: {
        totalMessages: 24,
        averagePerDay: 2.1,
        longestConversation: 8,
        topicDistribution: { cycle: 45, emotions: 35, symptoms: 20 }
      }
    },
    
    notebookStore: {
      entries: [
        {
          id: 'entry_1',
          content: 'Aujourd\'hui j\'ai ressenti une énergie créative incroyable. Cette phase folliculaire me donne des ailes !',
          type: 'personal',
          tags: ['#émotion', '#follicular', '#créativité'],
          timestamp: Date.now(),
          phase: 'follicular',
          wordCount: 15,
          sentiment: 'positive'
        }
      ],
      writingPatterns: {
        averageEntryLength: 89,
        writingFrequency: 0.6,
        preferredWritingTime: 'evening',
        emotionalTone: 'reflective'
      }
    },
    
    engagementStore: {
      metrics: {
        daysUsed: 45,
        sessionsCount: 120,
        totalTimeSpent: 890,
        lastActiveDate: new Date().toDateString(),
        conversationsStarted: 25,
        conversationsCompleted: 18,
        notebookEntriesCreated: 67,
        cycleTrackedDays: 40,
        insightsSaved: 12,
        vignettesEngaged: 34,
        phasesExplored: ['menstrual', 'follicular', 'ovulatory', 'luteal'],
        cyclesCompleted: 3,
        autonomySignals: 8
      },
      maturity: {
        current: 'learning',
        progression: 0.6,
        levelChangedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        signals: {
          autonomySignals: 8,
          deepEngagement: 15,
          consistentUsage: 22
        }
      }
    },
    
    userIntelligence: {
      learning: {
        confidence: 68,
        timePatterns: {
          favoriteHours: [8, 14, 20],
          activeDays: ['monday', 'wednesday', 'friday'],
          sessionDuration: 8
        },
        conversationPrefs: {
          responseLength: 'medium',
          questionTypes: ['emotional', 'cycle'],
          successfulPrompts: [
            { prompt: 'Comment te sens-tu ?', phase: 'luteal', timestamp: new Date().toISOString() }
          ],
          avoidedTopics: ['stress']
        },
        phasePatterns: {
          menstrual: { mood: 'calm', energy: 2, topics: ['repos', 'cocooning'] },
          follicular: { mood: 'energetic', energy: 4, topics: ['projets', 'créativité'] },
          ovulatory: { mood: 'confident', energy: 5, topics: ['communication', 'social'] },
          luteal: { mood: 'introspective', energy: 3, topics: ['préparation', 'sensibilité'] }
        }
      },
      observationPatterns: {
        consistency: 0.8,
        confidence: 75,
        preferredMode: 'hybrid',
        lastObservations: [],
        autonomySignals: {
          correctsPredictions: 5,
          manualPhaseChanges: 3,
          detailedObservations: 12,
          patternRecognitions: 4
        },
        totalObservations: 28
      }
    },
    
    navigationStore: {
      notebookFilters: {
        type: 'all',
        phase: 'follicular',
        tags: ['#émotion'],
        searchQuery: '',
        sortBy: 'recent'
      },
      navigationHistory: {
        lastTab: 'notebook',
        lastVignetteId: 'vignette_123',
        vignetteInteractions: { 'vignette_123': 5, 'vignette_456': 2 }
      }
    },
    
    appStore: {
      isFirstLaunch: false,
      currentTheme: 'dark',
      isOnline: true,
      devMode: true,
      notifications: {
        enabled: true,
        cycleReminders: true,
        dailyReflection: false
      }
    }
  };
};

// Test du flux complet
async function testSyncFlow() {
  console.log('🧪 === TEST FLUX SYNCHRONISATION MOODCYCLE ===\n');
  
  try {
    // 1. Vérifier que l'API est accessible
    console.log('1️⃣ Test connectivité API...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    console.log(`   ✅ API Health: ${healthData.status}\n`);
    
    // 2. Générer et envoyer les données de test
    console.log('2️⃣ Génération données test...');
    const testStores = generateTestStores();
    const metadata = {
      timestamp: new Date().toISOString(),
      platform: 'ios',
      appVersion: '1.0.0-test',
      deviceModel: 'iPhone 14',
      osVersion: '17.2',
      syncType: 'manual'
    };
    
    const payload = { stores: testStores, metadata };
    console.log(`   📦 Taille payload: ${JSON.stringify(payload).length} chars`);
    console.log(`   👤 Persona: ${testStores.userStore.persona.assigned}`);
    console.log(`   🩸 Cycle: ${testStores.cycleStore.length} jours`);
    console.log(`   💬 Messages: ${testStores.chatStore.messages.length}`);
    console.log(`   📝 Entrées: ${testStores.notebookStore.entries.length}`);
    console.log(`   📊 Engagement: ${testStores.engagementStore.metrics.daysUsed} jours\n`);
    
    // 3. Synchronisation vers API
    console.log('3️⃣ Synchronisation vers API...');
    const syncResponse = await fetch(`${API_BASE}/api/stores/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': TEST_DEVICE_ID
      },
      body: JSON.stringify(payload)
    });
    
    const syncResult = await syncResponse.json();
    if (syncResult.success) {
      console.log('   ✅ Sync réussie !');
      console.log(`   🆔 Device ID: ${syncResult.deviceId}`);
      console.log(`   ⏰ Timestamp: ${syncResult.timestamp}`);
      console.log(`   📊 Utilisateurs total: ${syncResult.aggregatedMetrics?.totalUsers || 'N/A'}\n`);
    } else {
      throw new Error(`Sync failed: ${syncResult.error}`);
    }
    
    // 4. Vérification analytics
    console.log('4️⃣ Vérification analytics...');
    const analyticsResponse = await fetch(`${API_BASE}/api/stores/analytics`, {
      headers: { 'X-Device-ID': TEST_DEVICE_ID }
    });
    
    const analyticsData = await analyticsResponse.json();
    if (analyticsData.success) {
      const metrics = analyticsData.data;
      console.log('   ✅ Analytics calculés :');
      console.log(`   👥 Total utilisateurs: ${metrics.totalUsers}`);
      console.log(`   📈 Engagement moyen: ${metrics.avgEngagement}`);
      console.log(`   🎭 Distribution personas: ${JSON.stringify(metrics.storeBreakdown.userStore.personaDistribution)}`);
      console.log(`   🧠 Confiance IA moyenne: ${metrics.intelligenceMetrics.avgConfidence}%`);
      console.log(`   🔄 Cycles réguliers: ${metrics.storeBreakdown.cycleStore.regularCycles}`);
      console.log(`   💬 Messages total: ${metrics.conversationMetrics.totalMessages}\n`);
    } else {
      throw new Error(`Analytics failed: ${analyticsData.error}`);
    }
    
    // 5. Test récupération données
    console.log('5️⃣ Test récupération données...');
    const allStoresResponse = await fetch(`${API_BASE}/api/stores/all`, {
      headers: { 'X-Device-ID': TEST_DEVICE_ID }
    });
    
    const allStoresData = await allStoresResponse.json();
    if (allStoresData.success) {
      console.log('   ✅ Données récupérées :');
      console.log(`   📊 Nombre devices: ${allStoresData.data.length}`);
      console.log(`   📅 Dernière mise à jour: ${allStoresData.lastUpdate}\n`);
    } else {
      throw new Error(`Data retrieval failed: ${allStoresData.error}`);
    }
    
    // 6. Résumé final
    console.log('🎉 === TEST COMPLET RÉUSSI ===');
    console.log('✅ Connectivité API');
    console.log('✅ Génération données test');
    console.log('✅ Synchronisation stores');
    console.log('✅ Calcul analytics');
    console.log('✅ Récupération données');
    console.log('\n🚀 Le système est prêt pour les testeuses !');
    
  } catch (error) {
    console.error('\n❌ === ERREUR TEST ===');
    console.error(`💥 ${error.message}`);
    console.error(`🔍 Stack: ${error.stack}`);
    process.exit(1);
  }
}

// Lancer le test
if (import.meta.url === `file://${process.argv[1]}`) {
  testSyncFlow();
}

export { testSyncFlow, generateTestStores }; 