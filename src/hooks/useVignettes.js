// ═══════════════════════════════════════════════════════════
// 🎣 useVignettes.js - Hook Intégration Vignettes
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useEngagementStore } from '../stores/useEngagementStore';
import { useCycleStore } from '../stores/useCycleStore';
import { getCurrentPhase } from '../utils/cycleCalculations';
import { useAdaptiveInterface } from './useAdaptiveInterface';
import { useSmartSuggestions } from './useSmartSuggestions';
import VignettesService from '../services/VignettesService';
import vignettesData from '../data/vignettes.json';

export function useVignettes(forcePhase = null, forcePersona = null) {
  const [vignettes, setVignettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stores & hooks
  const { persona, profile } = useUserStore();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = forcePhase ? null : useCycleStore((state) => state);
  const calculatedPhase = cycleData ? getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration) : 'follicular';
  const currentPhase = forcePhase || calculatedPhase;
  const currentDay = cycleData?.currentDay || 1;
  const { trackAction } = useEngagementStore();
  const adaptiveInterface = useAdaptiveInterface();
  const layout = adaptiveInterface?.layout || { config: { adaptiveVignettes: 3, maturityLevel: 'learning' } };
  const suggestions = useSmartSuggestions();

  // ✅ Protection contre l'hydratation et les valeurs undefined
  const safePersona = persona || { assigned: 'emma' };
  const currentPersona = forcePersona || safePersona.assigned;

  // Assurer que layout et layout.config existent avant de les utiliser
  const adaptiveVignettesLimit = layout.config?.adaptiveVignettes || 3;
  const firstSuggestionAction = suggestions?.contextualActions?.[0];

  // ✅ LOGIQUE ADAPTATIVE SIMPLE - fixée pour éviter les boucles
  const adaptiveLimit = useMemo(() => {
    // Valeur statique basée sur le maturity level seulement
    const maturityLevel = layout.config?.maturityLevel;
    
    switch(maturityLevel) {
      case 'autonomous': return 4;
      case 'learning': return 3;
      case 'discovery': return 2;
      default: return 3; // valeur par défaut
    }
  }, [layout.config?.maturityLevel]);

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
    
    return baseVignettes.slice(0, adaptiveLimit);
  }, [vignettes, firstSuggestionAction, currentPhase, adaptiveLimit]);

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
    maxDisplayed: adaptiveLimit,
    
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

// Fonction utilitaire pour les noms de phases
const getPhaseDisplayName = (phase) => {
  const phaseNames = {
    menstrual: 'menstruelle',
    follicular: 'folliculaire', 
    ovulatory: 'ovulatoire',
    luteal: 'lutéale'
  };
  return phaseNames[phase] || phase;
};