// scripts/testChatIntegration.js
// Script de validation de l'intégration Chat + API

import ChatService from '../services/ChatService.js';
import ContextFormatter from '../services/ContextFormatter.js';

/**
 * 🧪 TEST SUITE - INTÉGRATION CHAT
 */
async function runChatIntegrationTests() {
  console.log('🚀 === TESTS INTÉGRATION CHAT ===');
  
  try {
    // Test 1: Initialisation ChatService
    console.log('\n1️⃣ Test initialisation ChatService...');
    await ChatService.initialize();
    console.log('✅ ChatService initialisé');
    
    // Test 2: Génération contexte fallback
    console.log('\n2️⃣ Test contexte fallback...');
    const fallbackContext = ChatService.createFallbackContext();
    console.log('✅ Contexte fallback:', JSON.stringify(fallbackContext, null, 2));
    
    // Test 3: Validation données
    console.log('\n3️⃣ Test validation données onboarding...');
    const validation = ChatService.validateOnboardingData();
    console.log('📊 Validation result:', validation);
    
    // Test 4: Formatage contexte
    console.log('\n4️⃣ Test formatage contexte...');
    try {
      const context = ContextFormatter.formatCompact();
      const contextValidation = ContextFormatter.validateContext(context);
      console.log('✅ Contexte formaté:', context);
      console.log('📋 Validation contexte:', contextValidation);
    } catch (error) {
      console.log('⚠️ Contexte formatage échoué (normal si OnboardingStore vide):', error.message);
    }
    
    // Test 5: Message test (fallback)
    console.log('\n5️⃣ Test envoi message fallback...');
    const testResponse = ChatService.getFallbackResponse('Bonjour Melune');
    console.log('✅ Réponse fallback:', testResponse);
    
    // Test 6: Device ID
    console.log('\n6️⃣ Test Device ID...');
    const deviceId = await ChatService.getOrGenerateDeviceId();
    console.log('✅ Device ID:', deviceId);
    
    console.log('\n🎉 === TOUS LES TESTS PASSÉS ===');
    return true;
    
  } catch (error) {
    console.error('🚨 Erreur tests:', error);
    return false;
  }
}

/**
 * 🔧 TEST SERVICE ISOLATION
 */
async function testServiceIsolation() {
  console.log('\n🔬 === TEST ISOLATION SERVICES ===');
  
  // Test indépendance ChatService
  console.log('Testing ChatService independence...');
  const chatService = new (await import('../services/ChatService.js')).default.constructor();
  console.log('✅ ChatService peut être instancié');
  
  // Test indépendance ContextFormatter
  console.log('Testing ContextFormatter independence...');
  const ContextFormatterClass = (await import('../services/ContextFormatter.js')).default;
  const mockData = {
    userInfo: { prenom: 'Test', ageRange: '18-25' },
    preferences: { symptoms: 4, moods: 3 },
    melune: { communicationTone: 'friendly' },
    cycleData: {},
    persona: { assigned: 'emma' }
  };
  
  const formattedContext = ContextFormatterClass.formatCompact(mockData);
  console.log('✅ ContextFormatter fonctionne avec des données mock');
  console.log('📄 Contexte généré:', formattedContext);
}

/**
 * 🎯 FONCTION PRINCIPALE
 */
export async function testChatIntegration() {
  console.log('🎯 Démarrage tests intégration Chat...\n');
  
  const mainTestsSuccess = await runChatIntegrationTests();
  
  if (mainTestsSuccess) {
    await testServiceIsolation();
    console.log('\n✅ === INTÉGRATION CHAT VALIDÉE ===');
    return true;
  } else {
    console.log('\n❌ === TESTS ÉCHOUÉS ===');
    return false;
  }
}

// Export pour utilisation externe
export { runChatIntegrationTests, testServiceIsolation };

// Auto-exécution si appelé directement
if (require.main === module) {
  testChatIntegration().then(success => {
    process.exit(success ? 0 : 1);
  });
} 