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
    late: (hour) => `Même tard vers ${hour}h, tu prends soin de toi. Cette constance m'impressionne. `,
    weekend: (days) => `Les ${days.join(' et ')} sont devenus tes moments privilégiés pour prendre soin de toi. `,
    weekendMorning: () => `Les matins de week-end, tu t'accordes du temps. Ces rituels de douceur me touchent. `,
    weekendEvening: () => `Tes soirées de week-end révèlent ton besoin d'introspection. `
  },
  
  phasePreferences: {
    menstrual: {
      high: (topics, mood) => {
        const moodText = mood ? ` quand tu te sens ${mood === 'high' ? 'énergique' : mood === 'medium' ? 'sereine' : 'plus vulnérable'}` : '';
        return `En phase menstruelle, tu explores souvent ${topics[0]}${moodText}. Ce besoin d'introspection te caractérise. `;
      },
      medium: (topics, mood) => {
        const moodText = mood ? ` J'observe que tu te sens ${mood === 'high' ? 'plus forte' : mood === 'medium' ? 'en équilibre' : 'plus sensible'} pendant cette période.` : '';
        return `Cette phase semble t'inviter à ralentir.${moodText} `;
      },
      low: (topics, mood) => {
        const energyText = mood === 'low' ? ' Ces moments de douceur avec toi-même sont précieux.' : '';
        return `Les règles sont une période unique pour toi.${energyText} `;
      }
    },
    follicular: {
      high: (topics, mood) => {
        const energyText = mood === 'high' ? ' Cette énergie créative qui t\'habite est magnifique !' : '';
        return `Tu sembles préférer explorer ${topics[0]} en phase folliculaire.${energyText} `;
      },
      medium: (topics, mood) => {
        const energyText = mood ? ` Ton énergie ${mood === 'high' ? 'pétillante' : 'naissante'} se ressent.` : '';
        return `Cette phase te donne des ailes, n'est-ce pas ?${energyText} `;
      },
      low: (topics, mood) => {
        const renewalText = mood === 'medium' ? ' Ce renouveau intérieur transparaît.' : '';
        return `Tu sens cette énergie qui remonte ?${renewalText} `;
      }
    },
    ovulatory: {
      high: (topics, mood) => {
        const confidenceText = mood === 'high' ? ' Cette confiance en toi rayonne !' : '';
        return `En ovulation, tu rayonnes ! Tu sembles préférer explorer ${topics[0]} quand tu te sens au sommet.${confidenceText} `;
      },
      medium: (topics, mood) => {
        const glowText = mood ? ` Cette période où tu te sens ${mood === 'high' ? 'invincible' : 'rayonnante'} te va si bien.` : '';
        return `Cette période te donne confiance.${glowText} `;
      },
      low: (topics, mood) => {
        const peakText = mood === 'high' ? ' Et quelle belle énergie tu déploies !' : '';
        return `Ton énergie est à son pic.${peakText} `;
      }
    },
    luteal: {
      high: (topics, mood) => {
        const intensityText = mood === 'low' ? ' Même dans l\'intensité, tu trouves tes ressources.' : mood === 'medium' ? ' Tu navigues cette intensité avec grâce.' : '';
        return `Tu sembles préférer explorer ${topics[0]} en phase lutéale. Tu as trouvé ton rythme !${intensityText} `;
      },
      medium: (topics, mood) => {
        const wisdomText = mood ? ` Ces moments où tu te sens ${mood === 'low' ? 'plus émotionnelle' : mood === 'medium' ? 'en transition' : 'forte'} révèlent ta sagesse intérieure.` : '';
        return `Cette période intense te révèle, j'en suis sûre.${wisdomText} `;
      },
      low: (topics, mood) => {
        const giftText = mood === 'low' ? ' Ta sensibilité est un cadeau, même si elle peut être intense.' : '';
        return `Cette phase a ses défis mais aussi ses cadeaux.${giftText} `;
      }
    }
  },
  
  conversationPatterns: {
    consistent: (count, favoriteTopics) => {
      const topicText = favoriteTopics?.length > 0 ? ` J'observe que tu reviens souvent vers ${favoriteTopics[0]}.` : '';
      return `Nos ${count} conversations révèlent ta régularité. Tu prends vraiment soin de toi !${topicText} `;
    },
    growing: (count, favoriteTopics) => {
      const explorationText = favoriteTopics?.length > 1 ? ` Tu explores de ${favoriteTopics[0]} à ${favoriteTopics[1]}, cette curiosité me plaît.` : '';
      return `${count} échanges déjà ! Tu t'ouvres de plus en plus.${explorationText} `;
    },
    occasional: (count, favoriteTopics) => {
      const depthText = favoriteTopics?.length > 0 ? ` Quand nous parlons de ${favoriteTopics[0]}, tu révèles tant de profondeur.` : '';
      return `Même si nos moments sont espacés, ils sont précieux.${depthText} `;
    },
    thematic: (favoriteTopics) => {
      if (favoriteTopics?.length >= 2) {
        return `Tu sembles préférer explorer ${favoriteTopics[0]} et ${favoriteTopics[1]}. Ces sujets te passionnent vraiment. `;
      }
      return `${favoriteTopics[0]} revient souvent dans nos échanges. Ce thème résonne profondément en toi. `;
    }
  },
  
  cyclicPatterns: {
    autonomous: (regularityLevel) => {
      const regularityText = regularityLevel === 'high' ? ' Ton cycle se dessine avec une belle régularité.' : regularityLevel === 'medium' ? ' Je commence à voir se dessiner ton rythme personnel.' : '';
      return `Tu commences à faire tes propres liens cycle-ressenti. Ça, c'est de l'autonomie !${regularityText} `;
    },
    learning: (regularityLevel) => {
      const patternText = regularityLevel === 'high' ? ' Tes patterns se confirment de cycle en cycle.' : regularityLevel === 'medium' ? ' Des patterns intéressants émergent.' : '';
      return `Je vois que tu observes tes patterns. Continue, c'est passionnant !${patternText} `;
    },
    discovering: (regularityLevel) => {
      const journeyText = regularityLevel ? ` Cette régularité ${regularityLevel === 'high' ? 'que tu développes' : 'naissante'} révèle ta sagesse corporelle.` : '';
      return `Chaque jour t'apprend quelque chose sur ton cycle.${journeyText} `;
    },
    regular: (cycleLength) => {
      return `Ton cycle de ${cycleLength} jours révèle une belle constance. Cette régularité est un cadeau que ton corps te fait. `;
    },
    variable: () => {
      return `Ton cycle unique dance à son propre rythme. Cette variabilité raconte ton histoire personnelle. `;
    },
    evolving: () => {
      return `Je remarque que ton cycle évolue. Ces changements révèlent l'intelligence de ton corps qui s'adapte. `;
    }
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
    const learning = intelligence.learning;

    // 1. Pattern temporel enrichi
    if (intelligenceAnalysis.hasTimePatterns) {
      const favoriteHours = learning.timePatterns.favoriteHours || [];
      const favoriteDays = learning.timePatterns.favoriteDays || [];
      const favoriteHour = favoriteHours[0];
      
      // Détection weekend
      const hasWeekendPattern = favoriteDays.some(day => day === 6 || day === 0); // samedi=6, dimanche=0
      if (hasWeekendPattern) {
        const weekendDays = favoriteDays.filter(day => day === 6 || day === 0)
          .map(day => day === 6 ? 'samedis' : 'dimanches');
        
        if (favoriteHour >= 6 && favoriteHour <= 11) {
          revelations.push(REVELATION_PATTERNS.timePatterns.weekendMorning());
        } else if (favoriteHour >= 18) {
          revelations.push(REVELATION_PATTERNS.timePatterns.weekendEvening());
        } else {
          revelations.push(REVELATION_PATTERNS.timePatterns.weekend(weekendDays));
        }
      } else {
        // Pattern horaire classique
        let timeCategory = 'morning';
        if (favoriteHour >= 12 && favoriteHour < 17) timeCategory = 'afternoon';
        else if (favoriteHour >= 17 && favoriteHour < 22) timeCategory = 'evening';
        else if (favoriteHour >= 22 || favoriteHour < 6) timeCategory = 'late';

        revelations.push(REVELATION_PATTERNS.timePatterns[timeCategory](favoriteHour));
      }
    }

    // 2. Pattern phase enrichi avec ressentis
    if (intelligenceAnalysis.hasPhasePatterns) {
      const topics = intelligenceAnalysis.currentPhaseTopics;
      const mood = intelligenceAnalysis.currentPhaseMood;
      const phasePatterns = REVELATION_PATTERNS.phasePreferences[currentPhase];
      
      if (topics.length >= 2) {
        revelations.push(phasePatterns.high(topics, mood));
      } else if (topics.length === 1) {
        revelations.push(phasePatterns.medium(topics, mood));
      } else {
        revelations.push(phasePatterns.low(topics, mood));
      }
    }

    // 3. Pattern conversationnel enrichi avec thèmes favoris
    if (intelligenceAnalysis.hasConversationHistory) {
      const conversationCount = learning.conversationPrefs.successfulPrompts.length;
      const favoriteTopics = learning.conversationPrefs.favoriteTopics || [];
      
      // Pattern thématique spécialisé si suffisant de données
      if (favoriteTopics.length >= 2 && conversationCount >= 4) {
        revelations.push(REVELATION_PATTERNS.conversationPatterns.thematic(favoriteTopics));
      } else if (conversationCount >= 5) {
        revelations.push(REVELATION_PATTERNS.conversationPatterns.consistent(conversationCount, favoriteTopics));
      } else if (conversationCount >= 2) {
        revelations.push(REVELATION_PATTERNS.conversationPatterns.growing(conversationCount, favoriteTopics));
      } else {
        revelations.push(REVELATION_PATTERNS.conversationPatterns.occasional(conversationCount, favoriteTopics));
      }
    }

    // 4. Pattern cyclique enrichi avec régularité
    const engagementStore = require('../stores/useEngagementStore').useEngagementStore.getState();
    const autonomySignals = engagementStore?.metrics?.autonomySignals || 0;
    
    // Calcul niveau de régularité cyclique
    const cycleHistory = cycleData.history || [];
    let regularityLevel = null;
    if (cycleHistory.length >= 3) {
      const cycleLengths = cycleHistory.map(c => c.length).filter(Boolean);
      if (cycleLengths.length >= 2) {
        const avgLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
        const variance = cycleLengths.reduce((acc, len) => acc + Math.pow(len - avgLength, 2), 0) / cycleLengths.length;
        
        if (variance <= 2) regularityLevel = 'high';
        else if (variance <= 5) regularityLevel = 'medium';
        else regularityLevel = 'low';
      }
    }
    
    // Révélations cycliques
    if (autonomySignals >= 3) {
      revelations.push(REVELATION_PATTERNS.cyclicPatterns.autonomous(regularityLevel));
    } else if (autonomySignals >= 1) {
      revelations.push(REVELATION_PATTERNS.cyclicPatterns.learning(regularityLevel));
    } else if (engagementStore?.metrics?.daysUsed >= 3) {
      revelations.push(REVELATION_PATTERNS.cyclicPatterns.discovering(regularityLevel));
    }
    
    // Révélations spécifiques à la régularité
    if (regularityLevel === 'high' && cycleData.length) {
      revelations.push(REVELATION_PATTERNS.cyclicPatterns.regular(cycleData.length));
    } else if (regularityLevel === 'low') {
      revelations.push(REVELATION_PATTERNS.cyclicPatterns.variable());
    } else if (cycleHistory.length >= 2) {
      revelations.push(REVELATION_PATTERNS.cyclicPatterns.evolving());
    }

    // ✅ ASSEMBLAGE INTELLIGENT
    if (revelations.length === 0) {
      return baseInsight;
    }

    // Prioriser et choisir 1-2 révélations selon niveau
    const prioritizedRevelations = [...revelations];
    
    // Éviter duplication et choisir les plus pertinentes
    const selectedRevelations = prioritizedRevelations
      .slice(0, Math.min(2, prioritizedRevelations.length))
      .filter((rev, index, arr) => 
        // Éviter les révélations trop similaires
        !arr.slice(0, index).some(prevRev => 
          prevRev.includes('cycle') && rev.includes('cycle') ||
          prevRev.includes('conversation') && rev.includes('conversation')
        )
      );

    const revelationText = selectedRevelations.join('');

    // Intégrer avec l'insight de base
    return `${revelationText}${baseInsight}`;

  }, [
    intelligenceAnalysis,
    intelligence.learning,
    currentPhase,
    cycleData
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