// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useInsightsList.js
// 🧩 Type: Hook React
// 📚 Description: Hook pour récupérer une liste d'insights filtrés (usage simple)
// 🕒 Version: 2.0 - 2025-06-21
// 🧭 Used in: composants nécessitant des listes d'insights
// ─────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useCycle } from './useCycle';
import ContentManager from '../services/ContentManager';

export function useInsightsList() {
  const user = useUserStore();
  const { currentPhase } = useCycle();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPersonalized = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const context = user.getContextForAPI();
      const allInsights = await ContentManager.getInsights();
      
      // Filtrage simple par phase et persona
      const phaseInsights = allInsights[context.phase] || [];
      const filtered = phaseInsights.filter(insight => 
        !insight.personas || insight.personas.includes(context.persona)
      ).slice(0, 5);
      
      setInsights(filtered);
    } catch (err) {
      setError(err.message);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-load quand le contexte change
  useEffect(() => {
    if (user.hasMinimumData()) {
      loadPersonalized();
    }
  }, [user.persona.assigned, currentPhase, loadPersonalized]);

  return { 
    insights, 
    loading, 
    error, 
    refresh: loadPersonalized,
    hasData: insights.length > 0
  };
}

// ─────────────────────────────────────────────────────────
// 📄 Hook: useContext (utilitaire contexte API)
// ─────────────────────────────────────────────────────────

export function useContext() {
  const user = useUserStore();
  const { currentPhase, phaseInfo, currentDay, hasData } = useCycle();
  
  return {
    getApiContext: () => user.getContextForAPI(),
    getCurrentPhase: () => currentPhase,
    getCurrentPhaseInfo: () => phaseInfo,
    getCurrentDay: () => currentDay,
    hasMinimumData: () => hasData,
    isComplete: user.profile.completed
  };
}
