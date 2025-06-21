// services/ContextFormatter.js - ENRICHI AVEC DONNÉES NOTEBOOK
import { useOnboardingStore } from '../stores/useOnboardingStore.js';
import { useNotebookStore } from '../stores/useNotebookStore.js';
import { getDaysSinceLastPeriod, calculateCurrentPhase } from '../utils/dateUtils.js';

class ContextFormatter {
  
  static _cache = new Map();
  static _cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  /**
   * 🎯 FONCTION PRINCIPALE ENRICHIE AVEC NOTEBOOK
   */
  static formatForAPI(onboardingData = null, notebookData = null) {
    const data = onboardingData || useOnboardingStore.getState();
    const notebook = notebookData || useNotebookStore.getState();
    
    // ✅ Cache basé sur hash des données + notebook
    const cacheKey = this._generateCacheKey(data, notebook);
    const cached = this._cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this._cacheTimeout) {
      return cached.result;
    }

    // Calcul avec enrichissement Notebook
    const result = this._computeEnrichedContext(data, notebook);
    
    this._cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    if (this._cache.size > 50) {
      this.clearExpiredCache();
    }

    return result;
  }

  /**
   * 🎭 CALCUL CONTEXTE ENRICHI AVEC MÉMOIRE NOTEBOOK
   */
  static _computeEnrichedContext(data, notebook) {
    const persona = this.ensurePersonaCalculated(data);
    const notebookInsights = this.extractNotebookInsights(notebook);
    
    return {
      persona: persona,
      userProfile: this.formatUserProfile(data.userInfo),
      currentPhase: this.getCurrentPhase(data.cycleData),
      preferences: data.preferences || {},
      communicationTone: this.mapCommunicationTone(data.melune?.communicationTone),
      
      // ✅ NOUVEAU : Enrichissements depuis le Notebook
      notebookContext: {
        // Préoccupations récentes détectées
        recentConcerns: notebookInsights.concerns,
        // Sujets d'intérêt identifiés
        interestTopics: notebookInsights.topics,
        // Patterns émotionnels observés
        emotionalPatterns: notebookInsights.emotions,
        // Symptômes récurrents
        recurringSymptoms: notebookInsights.symptoms,
        // Niveau d'engagement avec l'app
        engagementLevel: notebookInsights.engagement,
        // Tags préférés
        favoriteThemes: notebookInsights.themes
      },
      
      context: {
        journeyChoice: data.journeyChoice?.selectedOption,
        trackingExperience: data.cycleData?.trackingExperience,
        isOnboardingComplete: data.completed,
        lastPersonaCalculation: data.persona?.lastCalculated,
        // ✅ Enrichissement Notebook
        hasNotebookData: notebook.entries?.length > 0,
        notebookEntriesCount: notebook.entries?.length || 0,
        lastNotebookActivity: this.getLastActivity(notebook)
      }
    };
  }

  /**
   * ✨ EXTRACTION INSIGHTS DEPUIS NOTEBOOK
   */
  static extractNotebookInsights(notebook) {
    if (!notebook.entries || notebook.entries.length === 0) {
      return this.getEmptyInsights();
    }

    const entries = notebook.entries;
    const recentEntries = this.getRecentEntries(entries, 7); // 7 derniers jours
    
    return {
      concerns: this.detectConcerns(recentEntries),
      topics: this.extractTopics(entries),
      emotions: this.analyzeEmotionalPatterns(entries),
      symptoms: this.getRecurringSymptoms(entries),
      engagement: this.calculateEngagement(entries),
      themes: this.getFavoriteThemes(entries)
    };
  }

  /**
   * 🔍 DÉTECTION PRÉOCCUPATIONS RÉCENTES
   */
  static detectConcerns(recentEntries) {
    const concerns = [];
    const keywords = {
      fatigue: ['fatigue', 'épuisée', 'crevée', 'sans énergie'],
      douleur: ['mal', 'douleur', 'crampes', 'maux'],
      stress: ['stress', 'angoisse', 'anxiété', 'inquiète'],
      sommeil: ['insomnie', 'mal dormi', 'réveils', 'fatigue'],
      humeur: ['triste', 'déprime', 'irritable', 'colère']
    };

    Object.entries(keywords).forEach(([concern, words]) => {
      const mentions = recentEntries.filter(entry => 
        words.some(word => entry.content?.toLowerCase().includes(word))
      ).length;
      
      if (mentions >= 2) { // Seuil de 2 mentions
        concerns.push({ type: concern, mentions, priority: mentions >= 3 ? 'high' : 'medium' });
      }
    });

    return concerns.sort((a, b) => b.mentions - a.mentions).slice(0, 3);
  }

  /**
   * 🏷️ EXTRACTION SUJETS D'INTÉRÊT
   */
  static extractTopics(entries) {
    const topicCounts = {};
    
    entries.forEach(entry => {
      // Compter les tags auto et manuels
      const allTags = [...(entry.autoTags || []), ...(entry.metadata?.tags || [])];
      allTags.forEach(tag => {
        const cleanTag = tag.replace('#', '');
        topicCounts[cleanTag] = (topicCounts[cleanTag] || 0) + 1;
      });
    });

    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, frequency: count }));
  }

  /**
   * 💭 ANALYSE PATTERNS ÉMOTIONNELS
   */
  static analyzeEmotionalPatterns(entries) {
    const trackingEntries = entries.filter(e => e.type === 'tracking');
    if (trackingEntries.length < 3) return null;

    const moodCounts = {};
    const energyLevels = [];

    trackingEntries.forEach(entry => {
      if (entry.metadata?.mood) {
        moodCounts[entry.metadata.mood] = (moodCounts[entry.metadata.mood] || 0) + 1;
      }
      if (entry.metadata?.energy !== null) {
        energyLevels.push(entry.metadata.energy);
      }
    });

    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0];

    const avgEnergy = energyLevels.length > 0 
      ? energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length 
      : null;

    return {
      dominantMood: dominantMood ? dominantMood[0] : null,
      averageEnergy: avgEnergy ? Math.round(avgEnergy * 10) / 10 : null,
      moodVariability: Object.keys(moodCounts).length > 3 ? 'high' : 'stable'
    };
  }

  /**
   * 🏥 SYMPTÔMES RÉCURRENTS
   */
  static getRecurringSymptoms(entries) {
    const symptomCounts = {};
    
    entries
      .filter(e => e.type === 'tracking' && e.metadata?.symptoms)
      .forEach(entry => {
        entry.metadata.symptoms.forEach(symptom => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      });

    return Object.entries(symptomCounts)
      .filter(([, count]) => count >= 2) // Au moins 2 occurrences
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symptom, count]) => ({ symptom, frequency: count }));
  }

  /**
   * 📈 CALCUL NIVEAU D'ENGAGEMENT
   */
  static calculateEngagement(entries) {
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    const recentEntries = entries.filter(e => e.timestamp >= weekAgo).length;
    const monthlyEntries = entries.filter(e => e.timestamp >= monthAgo).length;
    
    const typeDistribution = {
      saved: entries.filter(e => e.type === 'saved').length,
      personal: entries.filter(e => e.type === 'personal').length,
      tracking: entries.filter(e => e.type === 'tracking').length
    };

    let level = 'low';
    if (recentEntries >= 3) level = 'high';
    else if (recentEntries >= 1) level = 'medium';

    return {
      level,
      weeklyEntries: recentEntries,
      monthlyEntries,
      typeDistribution,
      mostUsedFeature: Object.entries(typeDistribution)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
    };
  }

  /**
   * 🎨 THÈMES PRÉFÉRÉS
   */
  static getFavoriteThemes(entries) {
    const savedEntries = entries.filter(e => e.type === 'saved');
    const personalEntries = entries.filter(e => e.type === 'personal');
    
    // Analyser contenu pour détecter thèmes
    const themes = {
      wellbeing: 0,
      nutrition: 0,
      cycle: 0,
      emotions: 0,
      spirituality: 0
    };

    [...savedEntries, ...personalEntries].forEach(entry => {
      const content = entry.content?.toLowerCase() || '';
      
      if (content.includes('bien-être') || content.includes('soin')) themes.wellbeing++;
      if (content.includes('manger') || content.includes('recette')) themes.nutrition++;
      if (content.includes('cycle') || content.includes('phase')) themes.cycle++;
      if (content.includes('ressent') || content.includes('émotion')) themes.emotions++;
      if (content.includes('ritual') || content.includes('méditation')) themes.spirituality++;
    });

    return Object.entries(themes)
      .filter(([, count]) => count > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme, count]) => ({ theme, mentions: count }));
  }

  /**
   * 🕒 UTILITAIRES
   */
  static getRecentEntries(entries, days) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return entries.filter(entry => entry.timestamp >= cutoff);
  }

  static getLastActivity(notebook) {
    if (!notebook.entries || notebook.entries.length === 0) return null;
    return Math.max(...notebook.entries.map(e => e.timestamp));
  }

  static getEmptyInsights() {
    return {
      concerns: [],
      topics: [],
      emotions: null,
      symptoms: [],
      engagement: { level: 'new', weeklyEntries: 0, monthlyEntries: 0 },
      themes: []
    };
  }

  /**
   * 🔑 CLÉ CACHE ENRICHIE
   */
  static _generateCacheKey(data, notebook) {
    const keyData = {
      persona: data.persona?.assigned,
      personaTimestamp: data.persona?.lastCalculated,
      preferences: data.preferences,
      userAge: data.userInfo?.ageRange,
      journey: data.journeyChoice?.selectedOption,
      lastPeriod: data.cycleData?.lastPeriodDate,
      melune: data.melune?.communicationTone,
      // ✅ Enrichissement Notebook
      notebookCount: notebook.entries?.length || 0,
      lastNotebookEntry: notebook.entries?.[0]?.timestamp || 0
    };
    
    return JSON.stringify(keyData);
  }

  // ✅ CONSERVATION MÉTHODES EXISTANTES
  static ensurePersonaCalculated(data) {
    if (data.persona?.assigned && data.persona?.lastCalculated) {
      const hoursSinceCalculation = (Date.now() - data.persona.lastCalculated) / (1000 * 60 * 60);
      if (hoursSinceCalculation < 24) {
        return data.persona.assigned;
      }
    }
    
    try {
      const store = useOnboardingStore.getState();
      return store.autoUpdatePersona() || store.calculateAndAssignPersona();
    } catch (error) {
      console.warn('🚨 Erreur calcul persona, fallback emma:', error);
      return 'emma';
    }
  }

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

  static invalidateCache() {
    const size = this._cache.size;
    this._cache.clear();
    console.log(`🔄 Cache invalidé: ${size} entrées supprimées`);
  }

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

  static getCurrentPhase(cycleData) {
    if (!cycleData?.lastPeriodDate) {
      return 'non définie';
    }
    
    try {
      const daysSinceLastPeriod = getDaysSinceLastPeriod(cycleData.lastPeriodDate);
      const cycleLength = cycleData.averageCycleLength || 28;
      const periodLength = cycleData.averagePeriodLength || 5;
      
      const phase = calculateCurrentPhase(daysSinceLastPeriod, cycleLength, periodLength);
      
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

  static mapCommunicationTone(meluneTone) {
    const mapping = {
      'friendly': 'bienveillant',
      'professional': 'direct', 
      'inspiring': 'inspirant'
    };
    
    return mapping[meluneTone] || 'bienveillant';
  }

  // ✅ VERSION COMPACTE ENRICHIE
  static formatCompact(onboardingData = null, notebookData = null) {
    const fullContext = this.formatForAPI(onboardingData, notebookData);
    
    return {
      persona: fullContext.persona,
      userProfile: {
        prenom: fullContext.userProfile.prenom,
        ageRange: fullContext.userProfile.ageRange
      },
      currentPhase: fullContext.currentPhase,
      preferences: fullContext.preferences,
      communicationTone: fullContext.communicationTone,
      // ✅ Résumé insights Notebook
      notebookInsights: {
        topConcern: fullContext.notebookContext.recentConcerns[0]?.type || null,
        engagementLevel: fullContext.notebookContext.engagementLevel.level,
        dominantMood: fullContext.notebookContext.emotionalPatterns?.dominantMood || null,
        hasContent: fullContext.context.hasNotebookData
      }
    };
  }

  static validateContext(context) {
    const errors = [];
    
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

  static debugContext() {
    const context = this.formatForAPI();
    const validation = this.validateContext(context);
    
    console.log('🎯 Context enrichi généré:', context);
    console.log('✅ Validation:', validation);
    console.log('📊 Cache stats:', this.getCacheStats());
    
    return { context, validation };
  }

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
  
  static useFormattedContext() {
    const onboardingData = useOnboardingStore();
    const notebookData = useNotebookStore();
    
    return {
      formatForAPI: () => this.formatForAPI(onboardingData, notebookData),
      formatCompact: () => this.formatCompact(onboardingData, notebookData),
      getCurrentContext: () => this.formatForAPI(onboardingData, notebookData),
      getCacheStats: () => this.getCacheStats(),
      invalidateCache: () => this.invalidateCache()
    };
  }
}

export default ContextFormatter;