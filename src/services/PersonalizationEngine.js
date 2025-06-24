// ═══════════════════════════════════════════════════════════
// 🧠 PersonalizationEngine.js - Service Intelligence Contextuelle
// ═══════════════════════════════════════════════════════════

// Import des données de phases
import phasesData from '../data/phases.json';

// ───────────────────────────────────────────────────────────
// 🎯 PROMPTS PERSONNALISÉS PAR CONTEXTE
// ───────────────────────────────────────────────────────────

const CONTEXTUAL_PROMPTS = {
  // Par phase cyclique
  phases: {
    menstrual: {
      emma: [
        "Comment honorer ton besoin de repos aujourd'hui ? 🌙",
        "Que ressent ton corps pendant tes règles ?",
        "Comment transformer cette période en moment cocooning ?"
      ],
      laure: [
        "Comment adapter ton planning pendant tes règles ?",
        "Quelle organisation optimise ton énergie actuelle ?",
        "Comment maintenir ta productivité en respectant ton corps ?"
      ],
      clara: [
        "Comment transformer l'énergie de tes règles en force ?",
        "Quel superpouvoir découvres-tu pendant cette phase ?",
        "Comment utiliser cette introspection pour grandir ?"
      ]
    },
    
    follicular: {
      emma: [
        "Comment canaliser cette énergie qui remonte ? ✨",
        "Quels nouveaux projets t'inspirent ?",
        "Comment explorer cette renaissance énergétique ?"
      ],
      laure: [
        "Comment structurer tes objectifs pour cette phase ?",
        "Quels projets lancer avec cette énergie montante ?",
        "Comment planifier pour maximiser cette phase ?"
      ],
      clara: [
        "Comment exploiter au max cette phase de création ?",
        "Quel potentiel débloquer avec cette énergie ?",
        "Comment transformer cette énergie en résultats ?"
      ]
    }
  },
  
  // Par préférence dominante
  preferences: {
    symptoms: [
      "Comment soulager naturellement tes symptômes ?",
      "Quels signaux ton corps t'envoie-t-il ?",
      "Comment interpréter ces sensations physiques ?"
    ],
    moods: [
      "Comment accueillir tes émotions cycliques ?",
      "Que révèlent tes changements d'humeur ?",
      "Comment transformer l'intensité émotionnelle ?"
    ],
    phyto: [
      "Quelles plantes peuvent t'accompagner ?",
      "Comment la nature peut-elle soutenir ton cycle ?",
      "Quels remèdes naturels explorer ?"
    ]
  },
  
  // Par moment de la journée
  timeContext: {
    morning: [
      "Comment commencer cette journée cyclique ?",
      "Quelle intention poser ce matin ?",
      "Comment ton corps se réveille-t-il ?"
    ],
    evening: [
      "Comment ta journée a-t-elle honoré ton cycle ?",
      "Que retenir de tes ressentis aujourd'hui ?",
      "Comment préparer un repos réparateur ?"
    ]
  }
};

// ───────────────────────────────────────────────────────────
// 🎨 VARIATIONS TONALES PAR PERSONA
// ───────────────────────────────────────────────────────────

const TONAL_VARIATIONS = {
  emma: {
    prefix: ["Hey ! ", "Coucou ✨ ", "Alors, "],
    style: "exploratrice",
    emojis: true,
    enthusiasm: "high"
  },
  laure: {
    prefix: ["", "Concentrons-nous : ", "Analysons : "],
    style: "professionnelle",
    emojis: false,
    enthusiasm: "measured"
  },
  clara: {
    prefix: ["Tu sais quoi ? ", "Écoute ! ", "Ready ? "],
    style: "énergique",
    emojis: true,
    enthusiasm: "maximum"
  },
  sylvie: {
    prefix: ["Prenons le temps... ", "En douceur, ", "Ensemble, "],
    style: "bienveillante",
    emojis: false,
    enthusiasm: "gentle"
  },
  christine: {
    prefix: ["Avec sagesse, ", "Réfléchissons : ", ""],
    style: "sage",
    emojis: false,
    enthusiasm: "serene"
  }
};

// ───────────────────────────────────────────────────────────
// 🎯 FONCTION CONTEXTUELLE AUTONOME
// ───────────────────────────────────────────────────────────

/**
 * Récupère un message contextuel personnalisé selon la phase, persona, journey et préférences
 * @param {string} phase - Phase cyclique (menstrual, follicular, ovulatory, luteal)
 * @param {string} persona - Persona utilisateur (emma, laure, clara, sylvie, christine)
 * @param {string} journey - Parcours utilisateur (body_disconnect, emotional_control, hiding_nature)
 * @param {Array} preferences - Tableau des préférences ordonnées par priorité
 * @returns {string} Message contextuel personnalisé
 */
export const getContextualMessage = (phase, persona, journey, preferences) => {
  // Récupération des données de phase
  const phaseData = phasesData[phase];
  if (!phaseData) {
    return "Explorons ensemble cette période de ton cycle.";
  }

  // Vérification de l'existence des enrichissements contextuels
  const enrichments = phaseData.contextualEnrichments;
  if (!enrichments || enrichments.length === 0) {
    return phaseData.description;
  }

  // Scoring de chaque enrichissement
  let bestEnrichment = null;
  let bestScore = -1;

  for (const enrichment of enrichments) {
    let score = 0;

    // +100 si targetPersona match
    if (enrichment.targetPersona === persona) {
      score += 100;
    }

    // +50 si targetJourney match
    if (enrichment.targetJourney === journey) {
      score += 50;
    }

    // +25 si targetPreferences[0] dans preferences
    if (preferences && preferences.length > 0 && 
        enrichment.targetPreferences && enrichment.targetPreferences.length > 0) {
      if (preferences.includes(enrichment.targetPreferences[0])) {
        score += 25;
      }
    }

    // Mise à jour du meilleur enrichissement
    if (score > bestScore) {
      bestScore = score;
      bestEnrichment = enrichment;
    }
  }

  // Retour du meilleur message ou fallback
  if (bestEnrichment && bestEnrichment.contextualText) {
    return bestEnrichment.contextualText;
  }

  return phaseData.description;
};

// ───────────────────────────────────────────────────────────
// 🏭 FACTORY FUNCTION PRINCIPALE
// ───────────────────────────────────────────────────────────

export const createPersonalizationEngine = (intelligenceData, preferences, currentPhase, persona) => {

  // ──────────────────────────────────────────────────────
  // 🧠 GÉNÉRATION PROMPTS PERSONNALISÉS
  // ──────────────────────────────────────────────────────
  
  const generatePersonalizedPrompts = (phase, persona, preferences, learningData) => {
    const prompts = [];
    
    // 1. Prompts basés sur phase + persona
    const phasePrompts = CONTEXTUAL_PROMPTS.phases[phase]?.[persona] || [];
    prompts.push(...phasePrompts);
    
    // 2. Prompts basés sur préférence dominante
    const dominantPref = getDominantPreference(preferences);
    const prefPrompts = CONTEXTUAL_PROMPTS.preferences[dominantPref] || [];
    prompts.push(...prefPrompts.slice(0, 2));
    
    // 3. Prompts basés sur apprentissage
    if (learningData.confidence > 30) {
      const learnedPrompts = learningData.successfulPrompts || [];
      prompts.push(...learnedPrompts.slice(-2));
    }
    
    // 4. Prompts contextuels temporels
    const timeContext = getTimeContext();
    const timePrompts = CONTEXTUAL_PROMPTS.timeContext[timeContext] || [];
    prompts.push(...timePrompts.slice(0, 1));
    
    return applyTonalVariations(prompts, persona).slice(0, 5);
  };

  // ──────────────────────────────────────────────────────
  // 🎭 APPLICATION VARIATIONS TONALES
  // ──────────────────────────────────────────────────────
  
  const applyTonalVariations = (prompts, persona) => {
    const variations = TONAL_VARIATIONS[persona] || TONAL_VARIATIONS.emma;
    
    return prompts.map(prompt => {
      const prefix = variations.prefix[Math.floor(Math.random() * variations.prefix.length)];
      let adaptedPrompt = prefix + prompt;
      
      // Adaptations stylistiques
      switch (variations.style) {
        case 'professionnelle':
          adaptedPrompt = adaptedPrompt.replace(/tu/g, 'vous').replace(/ton/g, 'votre');
          break;
        case 'énergique':
          adaptedPrompt = adaptedPrompt.replace(/Comment/g, 'Comment est-ce que tu peux');
          if (variations.emojis) adaptedPrompt += ' 🚀';
          break;
        case 'sage':
          adaptedPrompt = adaptedPrompt.replace(/Comment/g, 'De quelle manière');
          break;
      }
      
      return adaptedPrompt;
    });
  };

  // ──────────────────────────────────────────────────────
  // 🎯 SUGGESTIONS ACTIONS CONTEXTUELLES
  // ──────────────────────────────────────────────────────
  
  const generateContextualActions = (phase, persona, preferences, intelligence) => {
    const actions = [];
    
    // Action 1: Toujours chat personnalisé
    const personalizedPrompts = generatePersonalizedPrompts(phase, persona, preferences, intelligence);
    actions.push({
      type: 'chat',
      priority: 'high',
      title: getActionTitle('chat', persona, phase),
      prompt: personalizedPrompts[0],
      confidence: Math.min(intelligence.confidence + 30, 100)
    });
    
    // Action 2: Notebook si patterns émotionnels
    if (preferences.moods >= 4 || intelligence.phasePatterns?.[phase]?.mood) {
      actions.push({
        type: 'notebook',
        priority: 'medium',
        title: getActionTitle('notebook', persona, phase),
        prompt: getNotebookPrompt(phase, persona, intelligence),
        confidence: intelligence.confidence
      });
    }
    
    // Action 3: Exploration phase si nouvelles données
    if (intelligence.confidence < 50 || !intelligence.phasePatterns?.[phase]?.topics.length) {
      actions.push({
        type: 'phase_detail',
        priority: 'low',
        title: getActionTitle('phase_detail', persona, phase),
        confidence: 100 - intelligence.confidence
      });
    }
    
    // Action 4: Suggestions ML si confiance élevée
    if (intelligence.confidence > 70) {
      const mlSuggestion = generateMLSuggestion(phase, persona, intelligence);
      if (mlSuggestion) actions.push(mlSuggestion);
    }
    
    return actions.slice(0, 3); // Max 3 actions
  };

  // ──────────────────────────────────────────────────────
  // 🤖 SUGGESTION ML AVANCÉE
  // ──────────────────────────────────────────────────────
  
  const generateMLSuggestion = (phase, persona, intelligence) => {
    const phaseData = intelligence.phasePatterns[phase];
    const timeOptimal = intelligence.timePatterns?.favoriteHours || [];
    
    // Pattern temporel + phase + mood
    if (phaseData?.mood && timeOptimal.length > 2) {
      const currentHour = new Date().getHours();
      const isOptimalTime = timeOptimal.some(h => Math.abs(h - currentHour) <= 1);
      
      if (isOptimalTime && phaseData.mood === 'positive') {
        return {
          type: 'ml_optimized',
          priority: 'high',
          title: `Moment optimal détecté pour ${phase}`,
          prompt: `Tu es dans ton timing parfait pour ${phase}. Que veux-tu accomplir ?`,
          confidence: intelligence.confidence,
          mlGenerated: true
        };
      }
    }
    
    // Pattern topics récurrents
    if (phaseData?.topics?.length >= 3) {
      const topTopic = phaseData.topics[phaseData.topics.length - 1];
      return {
        type: 'ml_pattern',
        priority: 'medium',
        title: `Retrouver ${topTopic}`,
        prompt: `Tu explores souvent ${topTopic} pendant ${phase}. Continuer ?`,
        confidence: intelligence.confidence,
        mlGenerated: true
      };
    }
    
    return null;
  };

  // ──────────────────────────────────────────────────────
  // 🛠️ UTILITAIRES
  // ──────────────────────────────────────────────────────
  
  const getDominantPreference = (preferences) => {
    return Object.entries(preferences)
      .sort(([,a], [,b]) => b - a)[0][0];
  };
  
  const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };
  
  const getActionTitle = (actionType, persona, phase) => {
    const titles = {
      chat: {
        emma: `Explore ${phase}`,
        laure: `Optimise ${phase}`,
        clara: `Domine ${phase}`,
        sylvie: `Nourris ${phase}`,
        christine: `Honore ${phase}`
      },
      notebook: {
        emma: "Note tes découvertes",
        laure: "Structure tes observations",
        clara: "Capture tes insights",
        sylvie: "Recueille tes ressentis",
        christine: "Consigne ta sagesse"
      },
      phase_detail: {
        emma: "Découvre cette phase",
        laure: "Maîtrise cette phase", 
        clara: "Conquiers cette phase",
        sylvie: "Comprends cette phase",
        christine: "Explore le mystère"
      }
    };
    
    return titles[actionType]?.[persona] || `Action ${actionType}`;
  };
  
  const getNotebookPrompt = (phase, persona, intelligence) => {
    const phasePrompts = {
      menstrual: "Qu'est-ce que mon corps me demande vraiment ?",
      follicular: "Quels projets m'inspirent en ce moment ?",
      ovulatory: "Comment puis-je rayonner davantage ?",
      luteal: "Que m'enseigne cette sensibilité ?"
    };
    
    // Personnalisation selon apprentissage
    if (intelligence.phasePatterns?.[phase]?.mood === 'challenging') {
      return `Comment transformer les défis de ${phase} en force ?`;
    }
    
    return phasePrompts[phase] || "Que ressens-tu maintenant ?";
  };

  // ──────────────────────────────────────────────────────
  // 🎯 API PUBLIQUE PRINCIPALE
  // ──────────────────────────────────────────────────────
  
  const createPersonalizedExperience = () => {
    // Utilisation des données passées en paramètres avec fallback sécurisé
    const learningData = intelligenceData.getPersonalizedPrompts ? 
      intelligenceData.getPersonalizedPrompts(currentPhase, persona) : 
      { successfulPrompts: [] };
    
    return {
      // Prompts conversation personnalisés
      personalizedPrompts: generatePersonalizedPrompts(
        currentPhase, persona, preferences, learningData
      ),
      
      // Actions contextuelles recommandées
      contextualActions: generateContextualActions(
        currentPhase, persona, preferences, intelligenceData.learning
      ),
      
      // Métadonnées personnalisation
      personalization: {
        confidence: intelligenceData.learning.confidence,
        dataPoints: {
          timePatterns: intelligenceData.learning.timePatterns?.favoriteHours?.length || 0,
          phaseData: intelligenceData.learning.phasePatterns?.[currentPhase]?.topics?.length || 0,
          conversationHistory: learningData?.successfulPrompts?.length || 0
        },
        recommendations: getPersonalizationRecommendations(intelligenceData.learning)
      }
    };
  };
  
  const getPersonalizationRecommendations = (learning) => {
    const recommendations = [];
    
    if (learning.confidence < 30) {
      recommendations.push({
        type: 'data_collection',
        message: 'Continue tes interactions pour une personnalisation optimale',
        action: 'engage_more'
      });
    }
    
    if (learning.suggestionEffectiveness.chat.rate < 0.3 && learning.suggestionEffectiveness.chat.shown > 5) {
      recommendations.push({
        type: 'prompt_optimization',
        message: 'Ajustons tes suggestions pour mieux correspondre',
        action: 'refine_prompts'
      });
    }
    
    return recommendations;
  };

  // ──────────────────────────────────────────────────────
  // 🔄 API PUBLIQUE - MÉTHODES EXPOSÉES
  // ──────────────────────────────────────────────────────
  
  return {
    generatePersonalizedPrompts,
    applyTonalVariations,
    generateContextualActions,
    generateMLSuggestion,
    getDominantPreference,
    getTimeContext,
    getActionTitle,
    getNotebookPrompt,
    createPersonalizedExperience,
    getPersonalizationRecommendations,
    getContextualMessage
  };
};

// ───────────────────────────────────────────────────────────
// 🎯 EXPORT CLEAN - API MODERNE UNIQUEMENT
// ───────────────────────────────────────────────────────────

// Export uniquement de la factory function moderne
// Plus de classe wrapper obsolète - API unifiée et performante