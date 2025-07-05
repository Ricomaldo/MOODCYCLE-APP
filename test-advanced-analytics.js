#!/usr/bin/env node

/**
 * Test des endpoints analytics avancés
 * Valide le bon fonctionnement de l'AdvancedAnalyticsController
 */

const API_BASE_URL = 'https://moodcycle.irimwebforge.com';

const endpoints = [
  '/api/analytics/behavior',
  '/api/analytics/device', 
  '/api/analytics/performance',
  '/api/analytics/patterns',
  '/api/analytics/crashes',
  '/api/analytics/dashboard',
  '/api/analytics/overview',
  '/api/analytics/recommendations',
  '/api/analytics/health'
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔍 Test ${endpoint}...`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': 'test-analytics-script'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      console.log(`📊 Success: ${data.success}`);
      
      if (data.data) {
        if (endpoint === '/api/analytics/health') {
          console.log(`🏥 Health Status: ${data.data.status}`);
          console.log(`📈 Stores Count: ${data.data.storesCount}`);
        } else if (endpoint === '/api/analytics/overview') {
          console.log(`👥 Total Users: ${data.data.totalUsers}`);
          console.log(`🎯 Total Interactions: ${data.data.totalInteractions}`);
        } else if (endpoint === '/api/analytics/recommendations') {
          console.log(`💡 Recommendations: ${data.data.length}`);
        } else if (endpoint === '/api/analytics/dashboard') {
          console.log(`📋 Dashboard sections: ${Object.keys(data.data).length}`);
        } else {
          console.log(`📦 Data keys: ${Object.keys(data.data).join(', ')}`);
        }
      }
      
      console.log(`⏰ Timestamp: ${data.timestamp}`);
    } else {
      console.log(`❌ ${endpoint} - Error: ${response.status}`);
      console.log(`💬 Message: ${data.error || data.message}`);
    }

  } catch (error) {
    console.log(`💥 ${endpoint} - Exception: ${error.message}`);
  }
}

async function testAllEndpoints() {
  console.log('🚀 Test des Analytics Avancés MoodCycle');
  console.log('=' .repeat(50));
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  
  const startTime = Date.now();

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }

  const duration = Date.now() - startTime;
  
  console.log('\n' + '=' .repeat(50));
  console.log(`✨ Tests terminés en ${duration}ms`);
  console.log(`📊 Endpoints testés: ${endpoints.length}`);
  console.log('🎯 Dashboard admin: https://moodcycle.irimwebforge.com/admin/advanced-analytics');
}

// Test spécifique du dashboard complet
async function testDashboardIntegration() {
  console.log('\n🎛️ Test d\'intégration Dashboard...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
      headers: { 'X-Device-ID': 'admin-dashboard-test' }
    });

    const data = await response.json();

    if (data.success && data.data) {
      const sections = Object.keys(data.data);
      console.log(`✅ Dashboard intégré - ${sections.length} sections`);
      
      sections.forEach(section => {
        const sectionData = data.data[section];
        if (sectionData && typeof sectionData === 'object') {
          const keys = Object.keys(sectionData);
          console.log(`  📊 ${section}: ${keys.length} métriques`);
        }
      });
      
      return true;
    } else {
      console.log('❌ Dashboard non fonctionnel');
      return false;
    }
  } catch (error) {
    console.log(`💥 Erreur dashboard: ${error.message}`);
    return false;
  }
}

// Exécution
async function main() {
  await testAllEndpoints();
  await testDashboardIntegration();
  
  console.log('\n🏁 Test des Analytics Avancés terminé!');
  console.log('📈 Interface admin disponible sur:');
  console.log('   https://moodcycle.irimwebforge.com/admin/advanced-analytics');
}

main().catch(console.error); 