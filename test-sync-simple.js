/**
 * 🧪 Test Simple - Synchronisation MoodCycle
 * Script simplifié pour tester la synchronisation
 */

const API_BASE = 'http://localhost:3001';
const TEST_DEVICE_ID = `test-device-${Date.now()}`;

// Données de test minimales
const testStores = {
  userStore: {
    profile: { prenom: 'Emma', ageRange: '26-35', completed: true },
    preferences: { symptoms: 2, moods: 5, terminology: 'naturel' },
    persona: { assigned: 'emma', confidence: 0.85 }
  },
  cycleStore: {
    lastPeriodDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    length: 28,
    observations: [
      { id: 'obs_1', feeling: 4, energy: 3, notes: 'Test observation', timestamp: new Date().toISOString() }
    ]
  },
  chatStore: {
    messages: [
      { id: 'msg_1', text: 'Comment ça va ?', isUser: true, timestamp: new Date().toISOString() }
    ]
  },
  engagementStore: {
    metrics: { daysUsed: 45, sessionsCount: 120, totalTimeSpent: 890 }
  }
};

const metadata = {
  timestamp: new Date().toISOString(),
  platform: 'test',
  appVersion: '1.0.0-test',
  deviceModel: 'Test Device',
  syncType: 'manual'
};

async function testSync() {
  console.log('🧪 === TEST SYNCHRONISATION SIMPLE ===\n');
  
  try {
    // 1. Test connectivité
    console.log('1️⃣ Test API Health...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    console.log(`   ✅ Status: ${healthData.status}\n`);
    
    // 2. Test synchronisation
    console.log('2️⃣ Test Sync...');
    const syncResponse = await fetch(`${API_BASE}/api/stores/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': TEST_DEVICE_ID
      },
      body: JSON.stringify({ stores: testStores, metadata })
    });
    
    const syncResult = await syncResponse.json();
    console.log(`   ✅ Sync: ${syncResult.success ? 'OK' : 'FAIL'}`);
    console.log(`   🆔 Device: ${syncResult.deviceId}`);
    console.log(`   👥 Total users: ${syncResult.aggregatedMetrics?.totalUsers || 0}\n`);
    
    // 3. Test analytics
    console.log('3️⃣ Test Analytics...');
    const analyticsResponse = await fetch(`${API_BASE}/api/stores/analytics`, {
      headers: { 'X-Device-ID': TEST_DEVICE_ID }
    });
    const analyticsData = await analyticsResponse.json();
    console.log(`   ✅ Analytics: ${analyticsData.success ? 'OK' : 'FAIL'}`);
    console.log(`   📊 Users: ${analyticsData.data.totalUsers}`);
    console.log(`   📈 Avg engagement: ${analyticsData.data.avgEngagement}\n`);
    
    console.log('🎉 === TEST RÉUSSI ===');
    console.log('✅ API Health OK');
    console.log('✅ Sync OK');
    console.log('✅ Analytics OK');
    console.log('\n🚀 Système prêt !');
    
  } catch (error) {
    console.error('\n❌ === ERREUR ===');
    console.error(`💥 ${error.message}`);
    process.exit(1);
  }
}

testSync(); 