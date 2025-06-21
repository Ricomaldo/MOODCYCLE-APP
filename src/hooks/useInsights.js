// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useInsights.js
// ─────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import { useUserStore } from '../stores/useUserStore';
import ContentManager from '../services/ContentManager';

export function useInsights() {
  const user = useUserStore();
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
  }, [user.persona.assigned, user.getCurrentPhase(), loadPersonalized]);

  return { 
    insights, 
    loading, 
    error, 
    refresh: loadPersonalized,
    hasData: insights.length > 0
  };
}

// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useContext.js
// ─────────────────────────────────────────────────────────

import { useUserStore } from '../stores/useUserStore';

export function useContext() {
  const user = useUserStore();
  
  return {
    getApiContext: () => user.getContextForAPI(),
    getCurrentPhase: () => user.getCurrentPhase(),
    getCurrentPhaseInfo: () => user.getCurrentPhaseInfo(),
    getCurrentDay: () => user.getCurrentDay(),
    hasMinimumData: () => user.hasMinimumData(),
    isComplete: user.profile.completed
  };
}
