//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/usePersonalizedInsight.js
// 🧩 Type: Hook React
// 📚 Description: Hook pour générer un insight personnalisé unique avec algorithme complet
// 🕒 Version: 1.0 - 2025-06-21
// 🧭 Used in: onboarding, notebook, chat - partout où on veut UN insight premium
// ─────────────────────────────────────────────────────────
//
import { useState, useCallback, useEffect, useRef } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useCycle } from './useCycle';
import { getPersonalizedInsight } from '../services/InsightsEngine';

export function usePersonalizedInsight(options = {}) {
  const user = useUserStore();
  const { currentPhase } = useCycle();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usedInsights, setUsedInsights] = useState([]);
  
  // Ref pour éviter les boucles infinites
  const lastContextRef = useRef(null);

  const {
    enrichWithContext = true,
    autoRefresh = true,
    ...serviceOptions
  } = options;

  const generateInsight = useCallback(async (forceRefresh = false) => {
    if (!user.hasMinimumData()) {
      setInsight(null);
      return;
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
        usedInsights: forceRefresh ? [] : usedInsights,
        enrichWithContext,
        ...serviceOptions
      };

      const result = await getPersonalizedInsight(context, serviceOpts);

      setInsight(result);
      
      // Tracking anti-répétition
      if (result.id && !usedInsights.includes(result.id)) {
        setUsedInsights(prev => [...prev, result.id]);
      }

    } catch (err) {
      console.error('🚨 Erreur génération insight:', err);
      setError(err.message);
      setInsight(null);
    } finally {
      setLoading(false);
    }
  }, [user, currentPhase, usedInsights, enrichWithContext, serviceOptions]);

  // Auto-génération intelligente
  useEffect(() => {
    if (!autoRefresh) return;

    // Créer une clé de contexte pour détecter les changements significatifs
    const contextKey = JSON.stringify({
      persona: user.persona.assigned,
      phase: currentPhase,
      hasMinimumData: user.hasMinimumData(),
      prenom: user.profile.prenom
    });

    // Générer seulement si le contexte a vraiment changé
    if (lastContextRef.current !== contextKey) {
      lastContextRef.current = contextKey;
      generateInsight();
    }
  }, [user.persona.assigned, currentPhase, user.profile.prenom, generateInsight, autoRefresh]);

  // Fonctions utilitaires
  const refresh = useCallback(() => {
    generateInsight(true);
  }, [generateInsight]);

  const resetUsedInsights = useCallback(() => {
    setUsedInsights([]);
  }, []);

  return {
    // État principal
    insight,
    loading,
    error,
    
    // Contenu facilement accessible
    content: insight?.content || null,
    hasInsight: !!insight?.content,
    
    // Métadonnées
    source: insight?.source || null,
    relevanceScore: insight?.relevanceScore || 0,
    insightId: insight?.id || null,
    
    // Actions
    refresh,
    generate: () => generateInsight(false),
    resetUsedInsights,
    
    // État avancé
    usedInsightsCount: usedInsights.length,
    isReady: user.hasMinimumData() && !loading
  };
}

// ─────────────────────────────────────────────────────────
// 🎯 Hook spécialisé pour l'onboarding
// ─────────────────────────────────────────────────────────
export function useOnboardingInsight() {
  return usePersonalizedInsight({
    enrichWithContext: true,
    autoRefresh: false, // Contrôle manuel pour l'onboarding
  });
}

// ─────────────────────────────────────────────────────────
// 🎯 Hook spécialisé pour le notebook/journal
// ─────────────────────────────────────────────────────────
export function useNotebookInsight() {
  return usePersonalizedInsight({
    enrichWithContext: false, // Contenu plus brut pour le notebook
    autoRefresh: true,
  });
} 