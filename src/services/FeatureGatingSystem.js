// ═══════════════════════════════════════════════════════════
// 🎯 FeatureGatingSystem.js - Système Révélation Progressive
// ═══════════════════════════════════════════════════════════

import { useEngagementStore } from '../stores/useEngagementStore';
import { useUserIntelligence } from '../stores/useUserIntelligence';

// ───────────────────────────────────────────────────────────
// 🔓 RÈGLES ACTIVATION FEATURES
// ───────────────────────────────────────────────────────────

const FEATURE_GATES = {
  // Navigation & Discovery
  calendar_view: {
    type: 'progressive',
    requirements: {
      daysUsed: 3,
      conversationsCount: 1
    },
    category: 'navigation',
    description: 'Vue calendrier détaillée'
  },

  phase_details: {
    type: 'progressive', 
    requirements: {
      phasesExplored: 2,
      daysUsed: 5
    },
    category: 'knowledge',
    description: 'Détails approfondis phases'
  },

  // Chat & Intelligence
  advanced_prompts: {
    type: 'progressive',
    requirements: {
      conversationsCompleted: 2,
      intelligence: { confidence: 30 }
    },
    category: 'chat',
    description: 'Questions personnalisées avancées'
  },

  conversation_insights: {
    type: 'progressive',
    requirements: {
      conversationsStarted: 5,
      intelligence: { patterns: 3 }
    },
    category: 'chat',
    description: 'Analyse patterns conversations'
  },

  // Notebook & Tracking
  advanced_tracking: {
    type: 'progressive',
    requirements: {
      notebookEntriesCreated: 5,
      cycleTrackedDays: 7
    },
    category: 'tracking',
    description: 'Tracking symptoms détaillé'
  },

  pattern_analysis: {
    type: 'progressive',
    requirements: {
      notebookEntriesCreated: 10,
      autonomySignals: 3,
      intelligence: { confidence: 60 }
    },
    category: 'analysis',
    description: 'Analyse patterns personnels'
  },

  // Création & Autonomie
  insight_creation: {
    type: 'autonomous',
    requirements: {
      insightsSaved: 3,
      autonomySignals: 5,
      maturityLevel: 'autonomous'
    },
    category: 'creation',
    description: 'Création insights personnels'
  },

  cycle_predictions: {
    type: 'autonomous',
    requirements: {
      cyclesCompleted: 1,
      intelligence: { confidence: 70 }
    },
    category: 'prediction',
    description: 'Prédictions cycle IA'
  },

  // Social & Sharing
  sharing_features: {
    type: 'social',
    requirements: {
      insightsSaved: 1,
      maturityLevel: ['learning', 'autonomous']
    },
    category: 'social',
    description: 'Partage expériences'
  }
};

// ───────────────────────────────────────────────────────────
// 🧠 CACHE SYSTÈME POUR PERFORMANCES
// ───────────────────────────────────────────────────────────

const featureCache = new Map();
const CACHE_MAX_SIZE = 50; // Limite pour éviter memory leak

// Helper pour nettoyer le cache si trop grand
function cleanupCache() {
  if (featureCache.size > CACHE_MAX_SIZE) {
    const firstKey = featureCache.keys().next().value;
    featureCache.delete(firstKey);
  }
}

// ───────────────────────────────────────────────────────────
// 🎯 CLASSE PRINCIPALE FEATURE GATING
// ───────────────────────────────────────────────────────────

class FeatureGatingSystem {
  
  // ──────────────────────────────────────────────────────
  // 🔍 ÉVALUATION FEATURE UNIQUE
  // ──────────────────────────────────────────────────────
  
  static evaluateFeature(featureKey, userMetrics, userIntelligence, maturityLevel) {
    const feature = FEATURE_GATES[featureKey];
    if (!feature) return { available: false, reason: 'Feature not found' };
    
    const { requirements } = feature;
    const checks = [];
    
    // Check métriques engagement
    Object.entries(requirements).forEach(([metric, required]) => {
      if (metric === 'intelligence') {
        // Check intelligence requirements
        Object.entries(required).forEach(([intelligenceMetric, value]) => {
          const current = userIntelligence[intelligenceMetric] || 0;
          checks.push({
            metric: `intelligence.${intelligenceMetric}`,
            required: value,
            current,
            passed: current >= value
          });
        });
      } else if (metric === 'maturityLevel') {
        // Check maturity level
        const requiredLevels = Array.isArray(required) ? required : [required];
        checks.push({
          metric: 'maturityLevel',
          required: requiredLevels,
          current: maturityLevel,
          passed: requiredLevels.includes(maturityLevel)
        });
      } else if (metric === 'phasesExplored') {
        // Check phases explored count
        const current = userMetrics.phasesExplored?.length || 0;
        checks.push({
          metric,
          required,
          current,
          passed: current >= required
        });
      } else {
        // Check standard metrics
        const current = userMetrics[metric] || 0;
        checks.push({
          metric,
          required,
          current,
          passed: current >= required
        });
      }
    });
    
    const allPassed = checks.every(check => check.passed);
    const progress = checks.reduce((acc, check) => {
      const percentage = check.passed ? 100 : (check.current / check.required) * 100;
      return acc + Math.min(100, percentage);
    }, 0) / checks.length;
    
    return {
      available: allPassed,
      progress: Math.round(progress),
      checks,
      feature,
      nextRequirement: checks.find(check => !check.passed)
    };
  }
  
  // ──────────────────────────────────────────────────────
  // 🔓 ÉVALUATION GLOBALE FEATURES (AVEC CACHE)
  // ──────────────────────────────────────────────────────
  
  static evaluateAllFeatures() {
    const engagementStore = useEngagementStore.getState();
    const intelligenceStore = useUserIntelligence.getState();
    
    const { metrics, maturity } = engagementStore;
    const intelligence = intelligenceStore.learning;
    
    // ✅ Génération clé cache basée sur métriques critiques
    const cacheKey = [
      metrics.daysUsed,
      metrics.conversationsStarted,
      metrics.conversationsCompleted,
      metrics.notebookEntriesCreated,
      metrics.insightsSaved,
      metrics.autonomySignals,
      metrics.phasesExplored?.length || 0,
      maturity.current,
      Math.floor(intelligence.confidence / 10) // Granularité 10 pour éviter cache thrashing
    ].join('-');
    
    // ✅ Check cache d'abord
    if (featureCache.has(cacheKey)) {
      return featureCache.get(cacheKey);
    }
    
    // ✅ Calcul si pas en cache
    const results = {};
    
    Object.keys(FEATURE_GATES).forEach(featureKey => {
      results[featureKey] = this.evaluateFeature(
        featureKey,
        metrics,
        intelligence,
        maturity.current
      );
    });
    
    const evaluation = {
      features: results,
      summary: {
        available: Object.values(results).filter(r => r.available).length,
        total: Object.keys(FEATURE_GATES).length,
        categories: this.getCategoryStatus(results)
      }
    };
    
    // ✅ Mise en cache + cleanup si nécessaire
    cleanupCache();
    featureCache.set(cacheKey, evaluation);
    
    return evaluation;
  }
  
  // ──────────────────────────────────────────────────────
  // 🧹 CACHE MANAGEMENT (pour debug/tests)
  // ──────────────────────────────────────────────────────
  
  static clearCache() {
    featureCache.clear();
  }
  
  static getCacheSize() {
    return featureCache.size;
  }
  
  // ──────────────────────────────────────────────────────
  // 📊 STATUS PAR CATÉGORIE
  // ──────────────────────────────────────────────────────
  
  static getCategoryStatus(results) {
    const categories = {};
    
    Object.entries(results).forEach(([featureKey, result]) => {
      const category = result.feature.category;
      if (!categories[category]) {
        categories[category] = { available: 0, total: 0 };
      }
      categories[category].total++;
      if (result.available) categories[category].available++;
    });
    
    return categories;
  }
  
  // ──────────────────────────────────────────────────────
  // 🎯 SUGGESTIONS PROGRESSION
  // ──────────────────────────────────────────────────────
  
  static getProgressionSuggestions() {
    const evaluation = this.evaluateAllFeatures();
    const suggestions = [];
    
    // Find features closest to unlock
    const nearUnlock = Object.entries(evaluation.features)
      .filter(([_, result]) => !result.available && result.progress >= 50)
      .sort((a, b) => b[1].progress - a[1].progress)
      .slice(0, 3);
    
    nearUnlock.forEach(([featureKey, result]) => {
      const nextReq = result.nextRequirement;
      if (nextReq) {
        const remaining = nextReq.required - nextReq.current;
        suggestions.push({
          featureKey,
          description: result.feature.description,
          action: this.getActionSuggestion(nextReq.metric, remaining),
          progress: result.progress,
          priority: result.progress > 70 ? 'high' : 'medium'
        });
      }
    });
    
    return suggestions;
  }
  
  // ──────────────────────────────────────────────────────
  // 💡 SUGGESTIONS ACTIONS
  // ──────────────────────────────────────────────────────
  
  static getActionSuggestion(metric, remaining) {
    const actionMap = {
      daysUsed: `Utilise l'app ${remaining} jour${remaining > 1 ? 's' : ''} de plus`,
      conversationsStarted: `Lance ${remaining} conversation${remaining > 1 ? 's' : ''} avec Melune`,
      conversationsCompleted: `Termine ${remaining} conversation${remaining > 1 ? 's' : ''}`,
      notebookEntriesCreated: `Écris ${remaining} entrée${remaining > 1 ? 's' : ''} dans ton carnet`,
      insightsSaved: `Sauvegarde ${remaining} insight${remaining > 1 ? 's' : ''}`,
      autonomySignals: `Continue à faire des liens cycle-ressentis`,
      'intelligence.confidence': 'Continue tes interactions pour améliorer la personnalisation',
      'intelligence.patterns': 'Utilise plus régulièrement les suggestions'
    };
    
    return actionMap[metric] || `Progresse dans ${metric}`;
  }
  
  // ──────────────────────────────────────────────────────
  // 🚀 API PUBLIQUE
  // ──────────────────────────────────────────────────────
  
  static isFeatureAvailable(featureKey) {
    const evaluation = this.evaluateAllFeatures();
    return evaluation.features[featureKey]?.available || false;
  }
  
  static getFeatureProgress(featureKey) {
    const evaluation = this.evaluateAllFeatures();
    return evaluation.features[featureKey] || null;
  }
  
  static getAvailableFeatures() {
    const evaluation = this.evaluateAllFeatures();
    return Object.entries(evaluation.features)
      .filter(([_, result]) => result.available)
      .map(([key, _]) => key);
  }
  
  static getFeaturesByCategory(category) {
    return Object.entries(FEATURE_GATES)
      .filter(([_, feature]) => feature.category === category)
      .map(([key, _]) => key);
  }
}

export default FeatureGatingSystem;