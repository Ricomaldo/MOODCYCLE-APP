//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/usePersonalizedInsight.js - OPTIMIZED VERSION
// 🧩 Type: Hook React Premium
// 📚 Description: Hook insights avec cache intelligent + performance + états enrichis
// 🕒 Version: 2.0 - 2025-06-27 - POLISH + PERFORMANCE
// 🧭 Features: Cache hooks + États enrichis + Performance + Memoization avancée
// ─────────────────────────────────────────────────────────
//
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useCycle } from './useCycle';
import { getPersonalizedInsight, refreshInsightsCache } from '../services/InsightsEngine';

// ✅ CACHE HOOK-LEVEL (différent du cache service)
const hookCache = new Map();
const HOOK_CACHE_TTL = 5 * 60 * 1000; // 5min

export function usePersonalizedInsight(options = {}) {
  const user = useUserStore();
  const { currentPhase } = useCycle();
  
  // ✅ États enrichis
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usedInsights, setUsedInsights] = useState([]);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [generationCount, setGenerationCount] = useState(0);
  
  // ✅ Refs optimisées
  const lastContextRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isFirstRun = useRef(true);

  // ✅ Options avec defaults intelligents
  const {
    enrichWithContext = true,
    autoRefresh = true,
    cacheEnabled = true,
    maxUsedInsights = 20,
    ...serviceOptions
  } = options;

  // ✅ Contexte memoized pour éviter recalculs
  const contextKey = useMemo(() => {
    if (!user.hasMinimumData()) return null;
    
    return JSON.stringify({
      persona: user.persona.assigned,
      phase: currentPhase,
      prenom: user.profile?.prenom,
      tone: user.melune?.tone,
      journey: user.profile?.journeyChoice,
      hasMinimumData: true
    });
  }, [
    user.persona.assigned,
    currentPhase, 
    user.profile?.prenom,
    user.melune?.tone,
    user.profile?.journeyChoice,
    user.hasMinimumData()
  ]);

  // ✅ Vérification cache hook
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

  // ✅ Sauvegarde cache hook
  const setCachedInsight = useCallback((key, data) => {
    if (!cacheEnabled) return;
    
    hookCache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Nettoyer cache si trop plein
    if (hookCache.size > 10) {
      const firstKey = hookCache.keys().next().value;
      hookCache.delete(firstKey);
    }
  }, [cacheEnabled]);

  // ✅ Génération insight optimisée
  const generateInsight = useCallback(async (forceRefresh = false) => {
    if (!contextKey) {
      setInsight(null);
      setError(null);
      return null;
    }

    // Annuler requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Vérifier cache d'abord
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
      // Contexte unifié pour InsightsEngine
      const context = {
        phase: currentPhase,
        persona: user.persona.assigned,
        preferences: user.preferences,
        melune: user.melune,
        profile: user.profile,
      };

      // Options pour le service
      const serviceOpts = {
        usedInsights: forceRefresh ? [] : usedInsights.slice(-maxUsedInsights),
        enrichWithContext,
        signal: abortControllerRef.current.signal,
        ...serviceOptions
      };

      const result = await getPersonalizedInsight(context, serviceOpts);

      // Vérifier si la requête n'a pas été annulée
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      // ✅ Enrichir résultat avec métadonnées
      const enrichedResult = {
        ...result,
        generatedAt: Date.now(),
        contextKey,
        isFromCache: false
      };

      setInsight(enrichedResult);
      setLastGenerated(Date.now());
      setGenerationCount(prev => prev + 1);
      
      // Tracking anti-répétition intelligent
      if (result.id && !usedInsights.includes(result.id)) {
        setUsedInsights(prev => {
          const updated = [...prev, result.id];
          // Garder seulement les N derniers
          return updated.slice(-maxUsedInsights);
        });
      }

      // Sauvegarder en cache
      setCachedInsight(contextKey, enrichedResult);

      return enrichedResult;

    } catch (err) {
      if (err.name === 'AbortError') {
        return null; // Requête annulée
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
    setCachedInsight
  ]);

  // ✅ Auto-génération intelligente avec debounce
  useEffect(() => {
    console.log('🪝 === AUTO-REFRESH EFFECT ===');
    console.log('🪝 autoRefresh:', autoRefresh);
    console.log('🪝 contextKey:', contextKey);
    console.log('🪝 lastContextRef.current:', lastContextRef.current);
    console.log('🪝 isFirstRun.current:', isFirstRun.current);
    console.log('🪝 Current insight:', insight?.content?.substring(0, 50));
    
    if (!autoRefresh || !contextKey) {
      console.log('🪝 Skipping auto-refresh (no autoRefresh or contextKey)');
      return;
    }

    // ✅ FIX : Générer si pas d'insight OU contexte changé
    const shouldGenerate = 
      !insight ||                                              // Pas d'insight actuel
      !insight.content ||                                      // Insight vide
      lastContextRef.current !== contextKey ||                 // Contexte changé
      isFirstRun.current;                                      // Premier run

    console.log('🪝 Should generate:', shouldGenerate);
    console.log('🪝 Reasons:', {
      noInsight: !insight,
      noContent: !insight?.content,
      contextChanged: lastContextRef.current !== contextKey,
      firstRun: isFirstRun.current
    });

    if (!shouldGenerate) {
      console.log('🪝 Skipping generation - insight already exists and context unchanged');
      return;
    }

    console.log('🪝 Proceeding with generation...');
    lastContextRef.current = contextKey;
    isFirstRun.current = false;

    // Debounce pour éviter trop de requêtes
    const timeoutId = setTimeout(() => {
      console.log('🪝 Debounce timeout - calling generateInsight');
      generateInsight();
    }, 100);

    return () => {
      console.log('🪝 Cleaning up timeout');
      clearTimeout(timeoutId);
    };
  }, [contextKey, generateInsight, autoRefresh, insight]); // ✅ AJOUT insight dans les deps

  // ✅ Cleanup au démontage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ✅ Fonctions utilitaires memoized
  const actions = useMemo(() => ({
    refresh: () => generateInsight(true),
    generate: () => generateInsight(false),
    resetUsedInsights: () => {
      setUsedInsights([]);
      setCachedInsight(contextKey + '_used', []);
    },
    clearCache: () => {
      hookCache.clear();
      refreshInsightsCache();
    }
  }), [generateInsight, contextKey, setCachedInsight]);

  // ✅ États calculés memoized
  const computedState = useMemo(() => ({
    // Contenu facilement accessible
    content: insight?.content || null,
    hasInsight: !!insight?.content,
    
    // Métadonnées enrichies
    source: insight?.source || null,
    relevanceScore: insight?.relevanceScore || 0,
    insightId: insight?.id || null,
    tone: insight?.tone || null,
    jezaApproval: insight?.jezaApproval || 0,
    
    // États avancés
    usedInsightsCount: usedInsights.length,
    isReady: !!contextKey && !loading,
    isFromCache: insight?.isFromCache || false,
    lastGenerated,
    generationCount,
    
    // Timing
    isRecent: lastGenerated && (Date.now() - lastGenerated < 60000), // < 1min
    age: lastGenerated ? Date.now() - lastGenerated : null,
    
    // Qualité
    quality: insight?.relevanceScore > 80 ? 'excellent' : 
             insight?.relevanceScore > 60 ? 'good' : 
             insight?.relevanceScore > 40 ? 'fair' : 'basic'
  }), [insight, usedInsights.length, contextKey, loading, lastGenerated, generationCount]);

  return {
    // ✅ État principal
    insight,
    loading,
    error,
    
    // ✅ États calculés
    ...computedState,
    
    // ✅ Actions
    ...actions,
    
    // ✅ Debug (dev uniquement)
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        contextKey,
        usedInsights,
        cacheSize: hookCache.size,
        generationCount
      }
    })
  };
}

// ✅ HOOKS SPÉCIALISÉS OPTIMISÉS

export function useOnboardingInsight() {
  return usePersonalizedInsight({
    enrichWithContext: true,
    autoRefresh: false,
    cacheEnabled: false, // Toujours frais pour onboarding
    maxUsedInsights: 5
  });
}

export function useNotebookInsight() {
  return usePersonalizedInsight({
    enrichWithContext: false, // Contenu plus brut
    autoRefresh: true,
    cacheEnabled: true,
    maxUsedInsights: 15
  });
}

export function useDailyInsight() {
  return usePersonalizedInsight({
    enrichWithContext: true,
    autoRefresh: true,
    cacheEnabled: true,
    maxUsedInsights: 10
  });
}

// ✅ HOOK BATCH POUR PREVIEWS
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