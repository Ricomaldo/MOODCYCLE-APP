//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/InsightsEngine.js - OPTIMIZED VERSION
// 🧩 Type: Service Premium
// 📚 Description: Moteur insights personnalisés avec cache intelligent + scoring avancé
// 🕒 Version: 5.0 - 2025-06-27 - POLISH + OPTIMIZATIONS
// 🧭 Features: Cache intelligent + Scoring avancé + Performance + Fallbacks robustes
// ─────────────────────────────────────────────────────────
//
import ContentManager from './ContentManager.js';

// ✅ CACHE INTELLIGENT INSIGHTS
class InsightsCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50; // Limite mémoire
    this.ttl = 10 * 60 * 1000; // 10min cache par contexte
  }
  
  getKey(context) {
    return `${context.phase}_${context.persona}_${context.melune?.tone || 'default'}`;
  }
  
  get(context) {
    const key = this.getKey(context);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.insights;
  }
  
  set(context, insights) {
    const key = this.getKey(context);
    
    // Nettoyer cache si trop plein
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      insights,
      timestamp: Date.now()
    });
  }
}

const insightsCache = new InsightsCache();

// ✅ FALLBACKS ENRICHIS PAR PHASE
const ENRICHED_FALLBACKS = {
  menstrual: [
    { content: "{prenom}, ton corps fait un travail extraordinaire aujourd'hui ✨ Accorde-toi cette douceur.", tone: 'friendly' },
    { content: "Cette pause menstruelle t'invite à ralentir et honorer tes besoins 🌙", tone: 'professional' },
    { content: "Embrace cette phase sacrée de renouveau intérieur 💫", tone: 'inspiring' }
  ],
  follicular: [
    { content: "{prenom}, l'énergie du renouveau circule en toi ! Profite de cette force montante 🌱", tone: 'friendly' },
    { content: "Phase idéale pour initier de nouveaux projets et explorer tes potentiels 🚀", tone: 'professional' },
    { content: "Ton énergie créatrice s'éveille, laisse-la s'exprimer librement ✨", tone: 'inspiring' }
  ],
  ovulatory: [
    { content: "{prenom}, tu rayonnes aujourd'hui ! Exprime ta vérité avec confiance ☀️", tone: 'friendly' },
    { content: "Période optimale pour communication et collaborations importantes 💫", tone: 'professional' },
    { content: "Ta lumière intérieure brille de mille feux, partage cette magie 🌟", tone: 'inspiring' }
  ],
  luteal: [
    { content: "{prenom}, écoute cette sagesse intuitive qui monte en toi 🌙", tone: 'friendly' },
    { content: "Phase propice à l'introspection et à la finalisation de projets 🔮", tone: 'professional' },
    { content: "Ton intuition est ton guide le plus précieux en cette période 💜", tone: 'inspiring' }
  ]
};

// ✅ CLOSINGS ENRICHIS
const ENRICHED_CLOSINGS = {
  emma: {
    body: "Continue cette belle exploration de ton corps 💕",
    nature: "Reste connectée à ton rythme naturel 🌿", 
    emotions: "Accueille tes émotions avec bienveillance 🦋"
  },
  laure: {
    body: "Optimise ce temps pour ton bien-être global 🎯",
    nature: "Intègre cette sagesse cyclique dans ton quotidien 📈",
    emotions: "Gère ces émotions comme un atout professionnel 💼"
  },
  sylvie: {
    body: "Honore cette transition avec patience 🤗",
    nature: "Adapte-toi à ces changements naturels 🍃",
    emotions: "Transforme ces émotions en sagesse 🌺"
  },
  christine: {
    body: "Cette expérience enrichit ta connaissance de toi 📚",
    nature: "Respecte ce rythme ancestral qui t'habite 🌙",
    emotions: "Ces émotions portent une sagesse profonde 💎"
  },
  clara: {
    body: "Comprends ces signaux pour mieux t'adapter 🧠",
    nature: "Optimise ton énergie selon ces cycles naturels ⚡",
    emotions: "Analyse ces patterns émotionnels pour grandir 📊"
  }
};

// ✅ ALGORITHME SCORING AVANCÉ
const calculateInsightScore = (insight, context, preferences) => {
  let score = 0;
  
  // Base: validation Jeza (0-25 points)
  score += (insight.jezaApproval || 3) * 6.25;
  
  // Persona matching (0-40 points)
  if (insight.targetPersonas?.includes(context.persona)) {
    score += 40;
  } else if (insight.targetPersonas?.length === 0) {
    score += 20; // Insight universel
  }
  
  // Tone matching (0-15 points) 
  if (context.melune?.tone && insight.tone === context.melune.tone) {
    score += 15;
  }
  
  // Préférences matching (0-15 points)
  if (insight.targetPreferences?.length > 0 && preferences) {
    const prefScore = insight.targetPreferences.reduce((sum, pref) => {
      return sum + (preferences[pref] || 0);
    }, 0);
    score += (prefScore / insight.targetPreferences.length) * 3; // Max 15 points
  }
  
  // Status bonus (0-5 points)
  if (insight.status === 'enriched') score += 5;
  if (insight.status === 'validated') score += 3;
  
  return Math.round(score);
};

// ✅ ENRICHISSEMENT CONTEXTUEL COMPLET - FORMULE VRAIE
const enrichInsightWithContext = async (baseContent, context) => {
  const { phase, persona, profile, preferences } = context;
  const prenom = profile?.prenom;
  const journeyChoice = profile?.journeyChoice || 'body';
  
  try {
    // ✅ PHASE 1: Récupérer contextualEnrichments depuis phases.json
    const phasesData = await ContentManager.getPhases();
    let contextualPrefix = '';
    
    if (phasesData && phasesData[phase]?.contextualEnrichments) {
      // Chercher enrichissement correspondant au contexte
      const matchingEnrichment = phasesData[phase].contextualEnrichments.find(enrichment => 
        enrichment.targetPhase === phase &&
        enrichment.targetPersona === persona &&
        enrichment.targetJourney === journeyChoice &&
        enrichment.targetPreferences?.some(pref => preferences?.[pref] >= 4)
      );
      
      if (matchingEnrichment) {
        contextualPrefix = matchingEnrichment.contextualText + '. ';
      }
    }
    
    // ✅ PHASE 2: Prénom personnalisation
    let enriched = baseContent;
    
    if (prenom && enriched.includes('{prenom}')) {
      enriched = enriched.replace('{prenom}', prenom);
    } else if (prenom && !enriched.toLowerCase().includes(prenom.toLowerCase())) {
      enriched = `${prenom}, ${enriched.charAt(0).toLowerCase() + enriched.slice(1)}`;
    }
    
    // ✅ PHASE 3: Closing journey depuis closings.json
    const closingsData = await ContentManager.getClosings();
    let journeyClosing = '';
    
    if (closingsData?.[persona]?.[journeyChoice]) {
      journeyClosing = ` ${closingsData[persona][journeyChoice]}`;
    } else if (ENRICHED_CLOSINGS[persona]?.[journeyChoice]) {
      // Fallback local si API down
      journeyClosing = ` ${ENRICHED_CLOSINGS[persona][journeyChoice]}`;
    }
    
    // ✅ ASSEMBLAGE FINAL: contextualEnrichments + prénom + insight + closing.journey
    const finalInsight = contextualPrefix + enriched + journeyClosing;
    
    return finalInsight;
    
  } catch (error) {
    console.warn('🚨 Erreur enrichissement contextuel:', error);
    
    // Fallback simple si échec
    let enriched = baseContent;
    if (prenom && !enriched.toLowerCase().includes(prenom.toLowerCase())) {
      enriched = `${prenom}, ${enriched.charAt(0).toLowerCase() + enriched.slice(1)}`;
    }
    
    // Fallback closing local
    const personaClosings = ENRICHED_CLOSINGS[persona];
    if (personaClosings) {
      const closing = personaClosings[journeyChoice] || personaClosings.body;
      if (closing && !enriched.includes(closing)) {
        enriched += ` ${closing}`;
      }
    }
    
    return enriched;
  }
};

// ✅ FALLBACK INTELLIGENT ASYNCHRONE
const getSmartFallback = async (context) => {
  const { phase, persona, melune, profile } = context;
  const tone = melune?.tone || 'friendly';
  const prenom = profile?.prenom;
  
  const phaseFallbacks = ENRICHED_FALLBACKS[phase] || ENRICHED_FALLBACKS.menstrual;
  const toneFallback = phaseFallbacks.find(f => f.tone === tone) || phaseFallbacks[0];
  
  let content = toneFallback.content;
  
  // Enrichissement ASYNCHRONE
  try {
    content = await enrichInsightWithContext(content, context);
  } catch (error) {
    // Simple fallback si enrichissement échoue
    if (prenom && !content.includes(prenom)) {
      content = `${prenom}, ${content.charAt(0).toLowerCase() + content.slice(1)}`;
    }
  }
  
  return {
    content,
    id: `fallback_${phase}_${tone}`,
    source: 'smart-fallback',
    relevanceScore: 50,
    persona,
    phase
  };
};

// ✅ FONCTION PRINCIPALE OPTIMISÉE
export const getPersonalizedInsight = async (context, options = {}) => {
  const { phase, persona, preferences, melune, profile } = context;
  const { usedInsights = [], enrichWithContext = true } = options;

  // ✅ Validation entrée
  if (!phase || !persona) {
    return await getSmartFallback(context);
  }

  try {
    // ✅ Vérifier cache d'abord
    const cachedInsights = insightsCache.get(context);
    let phaseInsights;
    
    if (cachedInsights) {
      phaseInsights = cachedInsights;
    } else {
      // ✅ Fetch depuis API/local
      const allInsights = await ContentManager.getInsights();
      phaseInsights = allInsights[phase] || [];
      
      // ✅ Mettre en cache
      insightsCache.set(context, phaseInsights);
    }

    if (phaseInsights.length === 0) {
      return await getSmartFallback(context);
    }

    // ✅ Filtrage intelligent
    let availableInsights = phaseInsights;

    // Filtrage par ton
    if (melune?.tone) {
      const toneFiltered = phaseInsights.filter(insight => insight.tone === melune.tone);
      if (toneFiltered.length > 0) {
        availableInsights = toneFiltered;
      }
    }

    // Anti-répétition intelligente
    let unusedInsights = availableInsights.filter(insight => !usedInsights.includes(insight.id));
    
    // Reset si moins de 20% disponibles
    if (unusedInsights.length / availableInsights.length < 0.2) {
      unusedInsights = availableInsights;
    }

    if (unusedInsights.length === 0) {
      return await getSmartFallback(context);
    }

    // ✅ Scoring et sélection
    const scoredInsights = unusedInsights
      .map(insight => ({
        ...insight,
        relevanceScore: calculateInsightScore(insight, context, preferences)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const selectedInsight = scoredInsights[0];

    // ✅ Sélection contenu optimal
    let content = '';
    
    // Priorité: variant persona > baseContent > content
    if (selectedInsight.personaVariants?.[persona]) {
      content = selectedInsight.personaVariants[persona];
    } else if (selectedInsight.baseContent) {
      content = selectedInsight.baseContent;
    } else {
      content = selectedInsight.content || '';
    }

    if (!content) {
      return await getSmartFallback(context);
    }

    // ✅ Enrichissement contextuel ASYNCHRONE
    if (enrichWithContext) {
      content = await enrichInsightWithContext(content, context);
    }

    return {
      content,
      id: selectedInsight.id,
      persona,
      phase,
      relevanceScore: selectedInsight.relevanceScore,
      source: selectedInsight.personaVariants?.[persona] ? 'persona-variant' : 'base-content',
      tone: selectedInsight.tone,
      jezaApproval: selectedInsight.jezaApproval
    };

  } catch (error) {
    console.error('🚨 InsightsEngine error:', error);
    return await getSmartFallback(context);
  }
};

// ✅ UTILITAIRES AVANCÉS
export const getInsightPreview = async (context, count = 3) => {
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
  
  return insights;
};

export const refreshInsightsCache = () => {
  insightsCache.cache.clear();
};

export const getInsightsByPhase = async (phase, persona, limit = 5) => {
  const context = { phase, persona };
  return getInsightPreview(context, limit);
};

// ✅ EXPORTS
export { 
  enrichInsightWithContext,
  calculateInsightScore, 
  getSmartFallback,
  insightsCache
};