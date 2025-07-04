// ═══════════════════════════════════════════════════════════
// 📦 services/index.js - Export Centralisé Services
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 🧠 SERVICES INTELLIGENCE
// ───────────────────────────────────────────────────────────

// Initialisation
export { default as IntelligenceInit, initializeIntelligence } from './IntelligenceInit';

// Cache et Performance
export { default as IntelligenceCache } from './IntelligenceCache';
export { default as ProductionMonitoring } from './ProductionMonitoring';

// A/B Testing
export { default as ABTestService } from './ABTestService';

// Personnalisation
export { default as PersonalizationEngine } from './PersonalizationEngine';
export { default as PersonaEngine } from './PersonaEngine';

// Insights et Contenu
export { default as InsightsEngine } from './InsightsEngine';
export { default as VignettesService } from './VignettesService';
export { default as ContentManager } from './ContentManager';

// Chat et Communication
export { default as ChatService } from './ChatService';

// Cycle et Observations
export { default as CycleObservationEngine } from './CycleObservationEngine';

// Guidance et Suggestions
export { default as AdaptiveGuidance } from './AdaptiveGuidance';

// Synchronisation et Réseau
export { default as SyncManager } from './SyncManager';
export { default as NetworkQueue } from './NetworkQueue';

// Notifications
export { default as NotificationService } from './NotificationService';

// Export et Utilitaires
export { default as ExportService } from './ExportService';
export { default as FeatureGatingSystem } from './FeatureGatingSystem';

// Onboarding
export { default as OnboardingContinuum } from './OnboardingContinuum';

// ───────────────────────────────────────────────────────────
// 🎯 API UNIFIÉE
// ───────────────────────────────────────────────────────────

// Initialisation rapide de tous les services
export const initializeAllServices = async (config = {}) => {
  const { initializeIntelligence } = await import('./IntelligenceInit');
  return initializeIntelligence(config);
};

// Vérification de santé de tous les services
export const checkAllServicesHealth = async () => {
  const { validateIntelligenceHealth } = await import('./IntelligenceInit');
  const { getPerformanceReport } = await import('./ProductionMonitoring');
  
  return {
    intelligence: await validateIntelligenceHealth(),
    performance: getPerformanceReport()
  };
};

// ───────────────────────────────────────────────────────────
// 🛠️ UTILITAIRES
// ───────────────────────────────────────────────────────────

// Nettoyage de tous les services
export const cleanupAllServices = async () => {
  const { cleanupOldData } = await import('./ProductionMonitoring');
  const { refreshAllCaches } = await import('./InsightsEngine');
  
  try {
    await cleanupOldData();
    await refreshAllCaches();
    console.log('✅ All services cleaned up successfully');
  } catch (error) {
    console.error('🚨 Error cleaning up services:', error);
  }
};

// Reset de tous les services
export const resetAllServices = async () => {
  const { resetMetrics } = await import('./ProductionMonitoring');
  
  try {
    resetMetrics();
    console.log('✅ All services reset successfully');
  } catch (error) {
    console.error('🚨 Error resetting services:', error);
  }
}; 