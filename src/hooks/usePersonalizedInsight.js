//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/usePersonalizedInsight.js - RÉVÉLATION VERSION
// 🚀 CASCADE 3.1: Intégration patterns personnels dans insights
// ─────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useUserIntelligence } from '../stores/useUserIntelligence';
import { getPersonalizedInsight, refreshInsightsCache } from '../services/InsightsEngine';
import { useCycleStore } from '../stores/useCycleStore';
import { getCurrentPhase } from '../utils/cycleCalculations';
import { useNotebookStore } from '../stores/useNotebookStore';

// ✅ PATTERNS DE RÉVÉLATION PERSONNELLE
const REVELATION_PATTERNS = {
  timePatterns: {
    morning: (hour) => `J'ai remarqué que tu es souvent active vers ${hour}h du matin. Une lève-tôt ! `,
    afternoon: (hour) => `Tu sembles préférer l'après-midi vers ${hour}h pour nos échanges. `,
    evening: (hour) => `Tu aimes nos moments le soir vers ${hour}h. Ces instants de réflexion te font du bien. `,
    late: (hour) => `Même tard vers ${hour}h, tu prends soin de toi. Cette constance m'impressionne. `
  },
  
  phasePreferences: {
    menstrual: {
      high: (topics) => `En phase menstruelle, tu explores souvent ${topics[0]}. Ce besoin d'introspection te caractérise. `,
      medium: () => `Cette phase semble t'inviter à ralentir. `,
      low: () => `Les règles sont une période unique pour toi. `
    },
    follicular: {
      high: (topics) => `Ta créativité explose en phase folliculaire, surtout autour de ${topics[0]}. `,
      medium: () => `Cette phase te donne des ailes, n'est-ce pas ? `,
      low: () => `Tu sens cette énergie qui remonte ? `
    },
    ovulatory: {
      high: (topics) => `En ovulation, tu rayonnes ! ${topics[0]} te passionne particulièrement. `,
      medium: () => `Cette période te donne confiance. `,
      low: () => `Ton énergie est à son pic. `
    },
    luteal: {
      high: (topics) => `Phase lutéale = ton moment ${topics[0]}. Tu as trouvé ton rythme ! `,
      medium: () => `Cette période intense te révèle, j'en suis sûre. `,
      low: () => `Cette phase a ses défis mais aussi ses cadeaux. `
    }
  },
  
  conversationPatterns: {
    consistent: (count) => `Nos ${count} conversations révèlent ta régularité. Tu prends vraiment soin de toi ! `,
    growing: (count) => `${count} échanges déjà ! Tu t'ouvres de plus en plus. `,
    occasional: () => `Même si nos moments sont espacés, ils sont précieux. `
  },
  
  cyclicPatterns: {
    autonomous: () => `Tu commences à faire tes propres liens cycle-ressenti. Ça, c'est de l'autonomie ! `,
    learning: () => `Je vois que tu observes tes patterns. Continue, c'est passionnant ! `,
    discovering: () => `Chaque jour t'apprend quelque chose sur ton cycle. `
  }
};

// ✅ CACHE HOOK-LEVEL amélioré
const hookCache = new Map();
const HOOK_CACHE_TTL = 5 * 60 * 1000; // 5min

export function usePersonalizedInsight(options = {}) {
  const user = useUserStore();
  const intelligence = useUserIntelligence();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const { entries } = useNotebookStore();
  
  // États enrichis
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usedInsights, setUsedInsights] = useState([]);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [revelationLevel, setRevelationLevel] = useState(0); // 🌟 NOUVEAU
  
  const lastContextRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isFirstRun = useRef(true);

  const {
    enrichWithContext = true,
    autoRefresh = true,
    cacheEnabled = true,
    maxUsedInsights = 20,
    enableRevelation = true, // 🌟 NOUVEAU
    ...serviceOptions
  } = options;

  // ✅ ANALYSE INTELLIGENCE POUR RÉVÉLATION
  const intelligenceAnalysis = useMemo(() => {
    const learning = intelligence.learning;
    if (!learning || !enableRevelation) return null;

    const analysis = {
      hasTimePatterns: learning.timePatterns?.favoriteHours?.length > 0,
      hasPhasePatterns: false,
      hasConversationHistory: learning.conversationPrefs?.successfulPrompts?.length > 0,
      confidence: learning.confidence || 0
    };

    // Vérifier patterns phases
    if (learning.phasePatterns) {
      const phaseData = learning.phasePatterns[currentPhase];
      analysis.hasPhasePatterns = phaseData?.topics?.length > 0 || phaseData?.mood !== null;
      analysis.currentPhaseTopics = phaseData?.topics || [];
      analysis.currentPhaseMood = phaseData?.mood;
    }

    // Niveau de révélation (0-3)
    let level = 0;
    if (analysis.hasTimePatterns) level++;
    if (analysis.hasPhasePatterns) level++;
    if (analysis.hasConversationHistory) level++;
    analysis.level = level;

    return analysis;
  }, [
    intelligence.learning,
    currentPhase,
    enableRevelation
  ]);

  // ✅ GÉNÉRATION RÉVÉLATION PERSONNELLE
  const generatePersonalRevelation = useCallback((baseInsight) => {
    if (!intelligenceAnalysis || intelligenceAnalysis.level === 0) {
      return baseInsight;
    }

    const revelations = [];

    // 1. Pattern temporel
    if (intelligenceAnalysis.hasTimePatterns) {
      const favoriteHour = intelligence.learning.timePatterns.favoriteHours[0];
      let timeCategory = 'morning';
      if (favoriteHour >= 12 && favoriteHour < 17) timeCategory = 'afternoon';
      else if (favoriteHour >= 17 && favoriteHour < 22) timeCategory = 'evening';
      else if (favoriteHour >= 22 || favoriteHour < 6) timeCategory = 'late';

      revelations.push(REVELATION_PATTERNS.timePatterns[timeCategory](favoriteHour));
    }

    // 2. Pattern phase actuelle
    if (intelligenceAnalysis.hasPhasePatterns) {
      const topics = intelligenceAnalysis.currentPhaseTopics;
      const phasePatterns = REVELATION_PATTERNS.phasePreferences[currentPhase];
      
      if (topics.length >= 2) {
        revelations.push(phasePatterns.high(topics));
      } else if (topics.length === 1) {
        revelations.push(phasePatterns.medium());
      } else {
        revelations.push(phasePatterns.low());
      }
    }

    // 3. Pattern conversationnel
    if (intelligenceAnalysis.hasConversationHistory) {
      const conversationCount = intelligence.learning.conversationPrefs.successfulPrompts.length;
      if (conversationCount >= 5) {
        revelations.push(REVELATION_PATTERNS.conversationPatterns.consistent(conversationCount));
      } else if (conversationCount >= 2) {
        revelations.push(REVELATION_PATTERNS.conversationPatterns.growing(conversationCount));
      } else {
        revelations.push(REVELATION_PATTERNS.conversationPatterns.occasional());
      }
    }

    // 4. Pattern autonomie cyclique
    const engagementStore = require('../stores/useEngagementStore').useEngagementStore.getState();
    const autonomySignals = engagementStore?.metrics?.autonomySignals || 0;
    
    if (autonomySignals >= 3) {
      revelations.push(REVELATION_PATTERNS.cyclicPatterns.autonomous());
    } else if (autonomySignals >= 1) {
      revelations.push(REVELATION_PATTERNS.cyclicPatterns.learning());
    } else if (engagementStore?.metrics?.daysUsed >= 3) {
      revelations.push(REVELATION_PATTERNS.cyclicPatterns.discovering());
    }

    // ✅ ASSEMBLAGE INTELLIGENT
    if (revelations.length === 0) {
      return baseInsight;
    }

    // Choisir 1-2 révélations selon niveau
    const selectedRevelations = revelations.slice(0, Math.min(2, revelations.length));
    const revelationText = selectedRevelations.join('');

    // Intégrer avec l'insight de base
    return `${revelationText}${baseInsight}`;

  }, [
    intelligenceAnalysis,
    intelligence.learning,
    currentPhase
  ]);

  // Contexte memoized
  const contextKey = useMemo(() => {
    if (!user.hasMinimumData()) return null;
    
    return JSON.stringify({
      persona: user.persona.assigned,
      phase: currentPhase,
      prenom: user.profile?.prenom,
      tone: user.melune?.tone,
      journey: user.profile?.journeyChoice,
      hasMinimumData: true,
      // 🌟 AJOUT: inclure niveau révélation dans le cache
      revelationLevel: intelligenceAnalysis?.level || 0,
      confidence: intelligenceAnalysis?.confidence || 0
    });
  }, [
    user.persona.assigned,
    currentPhase, 
    user.profile?.prenom,
    user.melune?.tone,
    user.profile?.journeyChoice,
    user.hasMinimumData(),
    intelligenceAnalysis?.level,
    intelligenceAnalysis?.confidence
  ]);

  // Cache functions (inchangées)
  const getCachedInsight = useCallback((key) => {
    if (!cacheEnabled) return null;
    
    const cached = hookCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > HOOK_CACHE_TTL) {
      hookCache.delete(key);
      return null;
    }
    
    return cached.data;
  }, [cacheEnabled]);

  const setCachedInsight = useCallback((key, data) => {
    if (!cacheEnabled) return;
    
    hookCache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    if (hookCache.size > 10) {
      const firstKey = hookCache.keys().next().value;
      hookCache.delete(firstKey);
    }
  }, [cacheEnabled]);

  // ✅ GÉNÉRATION INSIGHT ENRICHIE
  const generateInsight = useCallback(async (forceRefresh = false) => {
    if (!contextKey) {
      setInsight(null);
      setError(null);
      return null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!forceRefresh) {
      const cached = getCachedInsight(contextKey);
      if (cached) {
        setInsight(cached);
        setError(null);
        setLoading(false);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const context = {
        phase: currentPhase,
        persona: user.persona.assigned,
        preferences: user.preferences,
        melune: user.melune,
        profile: user.profile,
      };

      const serviceOpts = {
        usedInsights: forceRefresh ? [] : usedInsights.slice(-maxUsedInsights),
        enrichWithContext,
        signal: abortControllerRef.current.signal,
        ...serviceOptions
      };

      const result = await getPersonalizedInsight(context, serviceOpts);

      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      // 🌟 RÉVÉLATION INTELLIGENCE
      const enhancedContent = enableRevelation && result.content
        ? generatePersonalRevelation(result.content)
        : result.content;

      const enrichedResult = {
        ...result,
        content: enhancedContent, // Contenu enrichi avec révélations
        originalContent: result.content, // Contenu original conservé
        revelationLevel: intelligenceAnalysis?.level || 0,
        hasPersonalizedElements: enableRevelation && intelligenceAnalysis?.level > 0,
        generatedAt: Date.now(),
        contextKey,
        isFromCache: false
      };

      setInsight(enrichedResult);
      setLastGenerated(Date.now());
      setGenerationCount(prev => prev + 1);
      setRevelationLevel(intelligenceAnalysis?.level || 0);
      
      if (result.id && !usedInsights.includes(result.id)) {
        setUsedInsights(prev => {
          const updated = [...prev, result.id];
          return updated.slice(-maxUsedInsights);
        });
      }

      setCachedInsight(contextKey, enrichedResult);

      return enrichedResult;

    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }
      
      console.error('🚨 usePersonalizedInsight error:', err);
      setError(err.message);
      setInsight(null);
      return null;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [
    contextKey, 
    currentPhase, 
    user, 
    usedInsights, 
    enrichWithContext, 
    serviceOptions,
    maxUsedInsights,
    getCachedInsight,
    setCachedInsight,
    enableRevelation,
    generatePersonalRevelation,
    intelligenceAnalysis
  ]);

  // Auto-génération (inchangée)
  useEffect(() => {
    if (!autoRefresh || !contextKey) return;

    const shouldGenerate = 
      !insight ||
      !insight.content ||
      lastContextRef.current !== contextKey ||
      isFirstRun.current;

    if (!shouldGenerate) return;

    lastContextRef.current = contextKey;
    isFirstRun.current = false;

    const timeoutId = setTimeout(() => {
      generateInsight();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [contextKey, generateInsight, autoRefresh, insight]);

  // Cleanup (inchangé)
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Actions memoized
  const actions = useMemo(() => ({
    refresh: () => generateInsight(true),
    generate: () => generateInsight(false),
    generateInsight,  // ← AJOUTER CETTE LIGNE
    resetUsedInsights: () => {
      setUsedInsights([]);
      setCachedInsight(contextKey + '_used', []);
    },
    clearCache: () => {
      hookCache.clear();
      refreshInsightsCache();
    }
  }), [generateInsight, contextKey, setCachedInsight]);

  // États calculés enrichis
  const computedState = useMemo(() => ({
    // Contenu facilement accessible
    content: insight?.content || null,
    originalContent: insight?.originalContent || null, // 🌟 NOUVEAU
    hasInsight: !!insight?.content,
    
    // Métadonnées enrichies
    source: insight?.source || null,
    relevanceScore: insight?.relevanceScore || 0,
    insightId: insight?.id || null,
    tone: insight?.tone || null,
    jezaApproval: insight?.jezaApproval || 0,
    
    // 🌟 NOUVEAUX: Métadonnées révélation
    revelationLevel,
    hasPersonalizedElements: insight?.hasPersonalizedElements || false,
    intelligenceConfidence: intelligenceAnalysis?.confidence || 0,
    
    // États avancés
    usedInsightsCount: usedInsights.length,
    usedInsights,  // ← AJOUTER CETTE LIGNE
    isReady: !!contextKey && !loading,
    isFromCache: insight?.isFromCache || false,
    lastGenerated,
    generationCount,
    
    // Timing
    isRecent: lastGenerated && (Date.now() - lastGenerated < 60000),
    age: lastGenerated ? Date.now() - lastGenerated : null,
    
    // Qualité enrichie
    quality: insight?.relevanceScore > 80 ? 'excellent' : 
             insight?.relevanceScore > 60 ? 'good' : 
             insight?.relevanceScore > 40 ? 'fair' : 'basic',
    
    // 🌟 NOUVEAU: Statut personnalisation
    personalizationStatus: intelligenceAnalysis?.level >= 2 ? 'high' :
                          intelligenceAnalysis?.level === 1 ? 'medium' : 'basic'
  }), [
    insight, 
    usedInsights.length, 
    contextKey, 
    loading, 
    lastGenerated, 
    generationCount,
    revelationLevel,
    intelligenceAnalysis
  ]);

  return {
    // État principal
    insight,
    loading,
    error,
    
    // États calculés
    ...computedState,
    
    // Actions (doit être après pour ne pas être écrasé)
    ...actions,
    
    // 🌟 NOUVEAU: Données intelligence pour debugging
    intelligenceAnalysis: intelligenceAnalysis,
    
    // Debug (dev uniquement)
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        contextKey,
        usedInsights,
        cacheSize: hookCache.size,
        generationCount,
        revelationLevel,
        intelligenceLevel: intelligenceAnalysis?.level
      }
    })
  };
}

// Hooks spécialisés inchangés
export function useOnboardingInsight() {
  return usePersonalizedInsight({
    enrichWithContext: true,
    autoRefresh: false,
    cacheEnabled: false,
    maxUsedInsights: 5,
    enableRevelation: false // Pas de révélation en onboarding
  });
}

export function useNotebookInsight() {
  return usePersonalizedInsight({
    enrichWithContext: false,
    autoRefresh: true,
    cacheEnabled: true,
    maxUsedInsights: 15,
    enableRevelation: true // 🌟 Révélation activée
  });
}

export function useDailyInsight() {
  return usePersonalizedInsight({
    enrichWithContext: true,
    autoRefresh: true,
    cacheEnabled: true,
    maxUsedInsights: 10,
    enableRevelation: true // 🌟 Révélation activée
  });
}

// Hook batch inchangé
export function useInsightsPreviews(phases = [], count = 3) {
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const user = useUserStore();

  const generatePreviews = useCallback(async () => {
    if (!user.hasMinimumData() || phases.length === 0) return;

    setLoading(true);
    const results = {};

    for (const phase of phases) {
      const context = {
        phase,
        persona: user.persona.assigned,
        preferences: user.preferences,
        melune: user.melune,
        profile: user.profile,
      };

      try {
        const insights = [];
        const usedIds = [];

        for (let i = 0; i < count; i++) {
          const insight = await getPersonalizedInsight(context, {
            usedInsights: usedIds,
            enrichWithContext: false
          });

          if (insight.id && !usedIds.includes(insight.id)) {
            insights.push(insight);
            usedIds.push(insight.id);
          }
        }

        results[phase] = insights;
      } catch (error) {
        console.error(`Error generating previews for ${phase}:`, error);
        results[phase] = [];
      }
    }

    setPreviews(results);
    setLoading(false);
  }, [phases, count, user]);

  useEffect(() => {
    generatePreviews();
  }, [generatePreviews]);

  return {
    previews,
    loading,
    refresh: generatePreviews
  };
}