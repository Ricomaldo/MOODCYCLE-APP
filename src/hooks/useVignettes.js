// ═══════════════════════════════════════════════════════════
// 🎣 useVignettes.js - Hook Intégration Vignettes
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useEngagementStore } from '../stores/useEngagementStore';
import { useCycle } from './useCycle';
import { useAdaptiveInterface } from './useAdaptiveInterface';
import { useSmartSuggestions } from './useSmartSuggestions';
import VignettesService from '../services/VignettesService';

export function useVignettes(forcePhase = null, forcePersona = null) {
  const [vignettes, setVignettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stores & hooks
  const { persona } = useUserStore();
  const cycleData = forcePhase ? null : useCycle();
  const cycleCurrentPhase = cycleData?.currentPhase || 'follicular';
  const currentPhase = forcePhase || cycleCurrentPhase;
  const { trackAction } = useEngagementStore();
  const { layout } = useAdaptiveInterface();
  const suggestions = useSmartSuggestions();

  // ✅ Protection contre l'hydratation et les valeurs undefined
  const safePersona = persona || { assigned: 'emma' };
  const currentPersona = forcePersona || safePersona.assigned;

  // Assurer que layout et layout.config existent avant de les utiliser
  const adaptiveVignettesLimit = layout?.config?.adaptiveVignettes || 3;
  const firstSuggestionAction = suggestions?.contextualActions?.[0];

  // ✅ LOGIQUE ADAPTATIVE SIMPLE
  const { getEngagementScore } = useEngagementStore();
  
  const getAdaptiveVignettesLimit = useMemo(() => {
    // Si useAdaptiveInterface fonctionne, utiliser sa logique
    if (layout?.config?.maturityLevel) {
      switch(layout.config.maturityLevel) {
        case 'autonomous': return 4;
        case 'learning': return 3;
        case 'discovery': return 2;
        default: return 2;
      }
    }
    
    // Sinon, logique de fallback basée sur l'engagement
    const engagementScore = getEngagementScore();
    
    if (engagementScore >= 70) return 4;      // Expert
    if (engagementScore >= 40) return 3;      // Intermédiaire
    return 2;                                 // Débutant
  }, [layout?.config?.maturityLevel, getEngagementScore]);

  // ──────────────────────────────────────────────────────
  // 🔄 CHARGEMENT VIGNETTES
  // ──────────────────────────────────────────────────────
  
  useEffect(() => {
    loadVignettes();
  }, [currentPhase, currentPersona]);

  const loadVignettes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rawVignettes = await VignettesService.getVignettes(
        currentPhase, 
        currentPersona
      );
      
      // ✅ Filtrage adaptatif sécurisé
      const adaptedVignettes = layout?.limitVignettes 
        ? layout.limitVignettes(rawVignettes) 
        : (Array.isArray(rawVignettes) ? rawVignettes.slice(0, adaptiveVignettesLimit) : []);
      
      setVignettes(Array.isArray(rawVignettes) ? rawVignettes : []);
    } catch (err) {
      console.error('🚨 useVignettes error:', err);
      setError(err);
      
      // ✅ Fallback emergency sécurisé
      const emergencyVignettes = VignettesService.getEmergencyVignettes(currentPhase);
      setVignettes(Array.isArray(emergencyVignettes) ? emergencyVignettes : []);
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────
  // 🎯 VIGNETTES ENRICHIES + SUGGESTIONS
  // ──────────────────────────────────────────────────────
  
  const enrichedVignettes = useMemo(() => {
    const baseVignettes = Array.isArray(vignettes) ? [...vignettes] : [];
    
    // Ajouter suggestions intelligentes comme vignettes
    if (firstSuggestionAction) {
      const smartVignette = {
        id: `smart_${currentPhase}_${Date.now()}`,
        icon: '🎯',
        title: firstSuggestionAction.label,
        action: firstSuggestionAction.type,
        prompt: firstSuggestionAction.prompt,
        category: 'smart_suggestion',
        priority: 'high'
      };
      
      // Insérer en première position si suggestion prioritaire
      if (firstSuggestionAction.priority === 'high') {
        baseVignettes.unshift(smartVignette);
      } else {
        baseVignettes.push(smartVignette);
      }
    }
    
    return baseVignettes.slice(0, getAdaptiveVignettesLimit);
  }, [vignettes, firstSuggestionAction, currentPhase, getAdaptiveVignettesLimit]);

  // ──────────────────────────────────────────────────────
  // 📊 TRACKING ENGAGEMENT
  // ──────────────────────────────────────────────────────
  
  const trackVignetteEngagement = (vignette) => {
    trackAction('vignette_engaged', {
      vignetteId: vignette.id,
      phase: currentPhase,
      persona: currentPersona,
      action: vignette.action,
      category: vignette.category
    });
  };

  // ──────────────────────────────────────────────────────
  // 🧭 HELPER NAVIGATION MODERNE
  // ──────────────────────────────────────────────────────
  
  const getNavigationParams = (vignette) => {
    // Use VignettesService helper but through modern hook interface
    return VignettesService.getNavigationParams(
      vignette, 
      currentPhase, 
      currentPersona
    );
  };

  // ──────────────────────────────────────────────────────
  // 🎯 API PUBLIQUE
  // ──────────────────────────────────────────────────────
  
  return {
    // Données principales
    vignettes: enrichedVignettes,
    loading,
    error,
    
    // Contexte
    currentPhase,
    currentPersona,
    
    // Actions
    refresh: loadVignettes,
    trackEngagement: trackVignetteEngagement,
    getNavigationParams,
    
    // Métadonnées
    hasSmartSuggestions: !!firstSuggestionAction,
    totalAvailable: Array.isArray(vignettes) ? vignettes.length : 0,
    maxDisplayed: getAdaptiveVignettesLimit,
    
    // Debug
    rawVignettes: vignettes,
    suggestions: suggestions.contextualActions
  };
}

// ──────────────────────────────────────────────────────
// 🎯 HOOK SPÉCIALISÉ POUR PHASE SPÉCIFIQUE
// ──────────────────────────────────────────────────────

export function usePhaseVignettes(phase) {
  return useVignettes(phase, null);
}

// ──────────────────────────────────────────────────────
// 🎯 HOOK SPÉCIALISÉ POUR PERSONA SPÉCIFIQUE
// ──────────────────────────────────────────────────────

export function usePersonaVignettes(persona) {
  return useVignettes(null, persona);
}