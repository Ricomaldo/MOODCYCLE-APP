// services/ContextFormatter.js
// Formateur de contexte pour API MoodCycle
// Transforme OnboardingStore → Payload API

import { useOnboardingStore } from '../stores/useOnboardingStore.js';
import { getDaysSinceLastPeriod, calculateCurrentPhase } from '../utils/dateUtils.js';

class ContextFormatter {
  
  // ✅ Cache statique pour éviter recalculs
  static _cache = new Map();
  static _cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  /**
   * 🎯 FONCTION PRINCIPALE OPTIMISÉE
   * Transforme le store complet en contexte API
   */
  static formatForAPI(onboardingData = null) {
    const data = onboardingData || useOnboardingStore.getState();
    
    // ✅ Cache basé sur hash des données importantes
    const cacheKey = this._generateCacheKey(data);
    const cached = this._cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this._cacheTimeout) {
      return cached.result;
    }

    // Calcul seulement si pas en cache
    const result = this._computeContext(data);
    
    // ✅ Stocker en cache
    this._cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    // ✅ Nettoyage automatique si cache trop volumineux
    if (this._cache.size > 50) {
      this.clearExpiredCache();
    }

    return result;
  }

  /**
   * 🔧 CALCUL CONTEXTE (logique métier conservée)
   */
  static _computeContext(data) {
    // Vérifier si persona est calculé, sinon le calculer
    const persona = this.ensurePersonaCalculated(data);
    
    return {
      // Persona calculé ou assigné
      persona: persona,
      
      // Profil utilisateur formaté
      userProfile: this.formatUserProfile(data.userInfo),
      
      // Phase actuelle du cycle (si disponible)
      currentPhase: this.getCurrentPhase(data.cycleData),
      
      // Préférences utilisateur (scores 0-5)
      preferences: data.preferences || {},
      
      // Ton de communication basé sur Melune config
      communicationTone: this.mapCommunicationTone(data.melune?.communicationTone),
      
      // Métadonnées contextuelles
      context: {
        journeyChoice: data.journeyChoice?.selectedOption,
        trackingExperience: data.cycleData?.trackingExperience,
        isOnboardingComplete: data.completed,
        lastPersonaCalculation: data.persona?.lastCalculated
      }
    };
  }

  /**
   * 🔑 GÉNÉRATION CLÉ DE CACHE
   */
  static _generateCacheKey(data) {
    const keyData = {
      persona: data.persona?.assigned,
      personaTimestamp: data.persona?.lastCalculated,
      preferences: data.preferences,
      userAge: data.userInfo?.ageRange,
      journey: data.journeyChoice?.selectedOption,
      lastPeriod: data.cycleData?.lastPeriodDate,
      melune: data.melune?.communicationTone
    };
    
    return JSON.stringify(keyData);
  }

  /**
   * 🧮 ASSURER QUE LE PERSONA EST CALCULÉ (OPTIMISÉ)
   */
  static ensurePersonaCalculated(data) {
    // Si persona valide et récent, retourner directement
    if (data.persona?.assigned && data.persona?.lastCalculated) {
      const hoursSinceCalculation = (Date.now() - data.persona.lastCalculated) / (1000 * 60 * 60);
      if (hoursSinceCalculation < 24) { // Valide pendant 24h
        return data.persona.assigned;
      }
    }
    
    // ✅ Calcul optimisé pour éviter blocage
    try {
      const store = useOnboardingStore.getState();
      // ✅ Utiliser autoUpdate si disponible (plus rapide)
      return store.autoUpdatePersona() || store.calculateAndAssignPersona();
    } catch (error) {
      console.warn('🚨 Erreur calcul persona, fallback emma:', error);
      return 'emma'; // Persona par défaut
    }
  }

  /**
   * 🧹 NETTOYAGE CACHE EXPIRÉ
   */
  static clearExpiredCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, value] of this._cache.entries()) {
      if (now - value.timestamp > this._cacheTimeout) {
        this._cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cache nettoyé: ${cleanedCount} entrées expirées supprimées`);
    }
  }

  /**
   * 🔄 INVALIDATION MANUELLE DU CACHE
   */
  static invalidateCache() {
    const size = this._cache.size;
    this._cache.clear();
    console.log(`🔄 Cache invalidé: ${size} entrées supprimées`);
  }

  /**
   * 👤 FORMATER PROFIL UTILISATEUR
   */
  static formatUserProfile(userInfo) {
    if (!userInfo) return {};
    
    return {
      prenom: userInfo.prenom || null,
      ageRange: userInfo.ageRange || null,
      journeyStarted: userInfo.journeyStarted || false,
      startDate: userInfo.startDate || null,
      prenomCollectedAt: userInfo.prenomCollectedAt || null
    };
  }

  /**
   * 🌙 CALCULER PHASE ACTUELLE
   */
  static getCurrentPhase(cycleData) {
    if (!cycleData?.lastPeriodDate) {
      return 'non définie';
    }
    
    try {
      const daysSinceLastPeriod = getDaysSinceLastPeriod(cycleData.lastPeriodDate);
      const cycleLength = cycleData.averageCycleLength || 28;
      const periodLength = cycleData.averagePeriodLength || 5;
      
      const phase = calculateCurrentPhase(daysSinceLastPeriod, cycleLength, periodLength);
      
      // Mapping vers les noms français utilisés dans ce contexte
      const phaseMapping = {
        'menstrual': 'menstruelle',
        'follicular': 'folliculaire', 
        'ovulatory': 'ovulatoire',
        'luteal': 'lutéale'
      };
      
      return phaseMapping[phase] || 'non définie';
    } catch (error) {
      console.warn('🚨 Erreur calcul phase:', error);
      return 'non définie';
    }
  }

  /**
   * 💬 MAPPER TON DE COMMUNICATION
   */
  static mapCommunicationTone(meluneTone) {
    const mapping = {
      'friendly': 'bienveillant',
      'professional': 'direct', 
      'inspiring': 'inspirant'
    };
    
    return mapping[meluneTone] || 'bienveillant';
  }

  /**
   * 🚀 VERSION COMPACTE POUR ÉCONOMISER BANDE PASSANTE
   */
  static formatCompact(onboardingData = null) {
    const fullContext = this.formatForAPI(onboardingData);
    
    // Garder seulement l'essentiel
    return {
      persona: fullContext.persona,
      userProfile: {
        prenom: fullContext.userProfile.prenom,
        ageRange: fullContext.userProfile.ageRange
      },
      currentPhase: fullContext.currentPhase,
      preferences: fullContext.preferences,
      communicationTone: fullContext.communicationTone
    };
  }

  /**
   * 🔍 VALIDATION DU CONTEXTE GÉNÉRÉ
   */
  static validateContext(context) {
    const errors = [];
    
    // Vérifications basiques
    if (!context.persona) {
      errors.push('Persona manquant');
    }
    
    if (!context.preferences || Object.keys(context.preferences).length === 0) {
      errors.push('Préférences manquantes');
    }
    
    if (!context.communicationTone) {
      errors.push('Ton de communication manquant');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 🧪 FONCTION DE TEST/DEBUG
   */
  static debugContext() {
    const context = this.formatForAPI();
    const validation = this.validateContext(context);
    
    console.log('🎯 Context généré:', context);
    console.log('✅ Validation:', validation);
    console.log('📊 Cache stats:', this.getCacheStats());
    
    return { context, validation };
  }

  /**
   * 📊 STATISTIQUES DU CACHE
   */
  static getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const [key, value] of this._cache.entries()) {
      if (now - value.timestamp < this._cacheTimeout) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      totalEntries: this._cache.size,
      validEntries,
      expiredEntries,
      hitRatio: validEntries / Math.max(1, this._cache.size),
      cacheTimeout: this._cacheTimeout / 1000 + 's'
    };
  }
  
  /**
   * 📱 HOOK POUR UTILISATION DANS COMPOSANTS
   */
  static useFormattedContext() {
    const onboardingData = useOnboardingStore();
    
    return {
      formatForAPI: () => this.formatForAPI(onboardingData),
      formatCompact: () => this.formatCompact(onboardingData),
      getCurrentContext: () => this.formatForAPI(onboardingData),
      getCacheStats: () => this.getCacheStats(),
      invalidateCache: () => this.invalidateCache()
    };
  }
}

export default ContextFormatter;

// Export des fonctions utilitaires + nouvelles optimisations
export const formatContextForAPI = ContextFormatter.formatForAPI;
export const formatCompactContext = ContextFormatter.formatCompact;
export const validateAPIContext = ContextFormatter.validateContext;
export const getCacheStats = ContextFormatter.getCacheStats;
export const invalidateContextCache = ContextFormatter.invalidateCache;