//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/InsightsEngine.js
// 🧩 Type: Service
// 📚 Description: Service pour la génération, l'enrichissement et la personnalisation des insights cycliques
// 🕒 Version: 4.0 - 2025-06-21 (ÉPURÉ - Interface simplifiée)
// 🧭 Used in: hooks/usePersonalizedInsight, onboarding, API
// ─────────────────────────────────────────────────────────
//
import ContentManager from './ContentManager.js';
import localInsights from '../data/insights.json';
import localClosings from '../data/closings.json';

// 🎯 MAPPING Journey Options vers Journey Targets
const JOURNEY_MAPPING = {
  body: 'body_disconnect',
  nature: 'hiding_nature',
  emotions: 'emotional_control',
};

// 🎯 FALLBACK SIMPLE
const getFallbackInsight = (phase, persona = null, prenom = null) => {
  const fallbacks = {
    menstrual: "Prends soin de toi aujourd'hui ✨",
    follicular: "L'énergie revient, profite-en ! 🌱",
    ovulatory: "Tu rayonnes aujourd'hui ! ☀️",
    luteal: 'Écoute ton intuition 🌙',
  };

  let baseContent = fallbacks[phase] || 'Belle journée à toi ! 💕';
  return prenom ? `${prenom}, ${baseContent.toLowerCase()}` : baseContent;
};

// 🎯 CLOSINGS PERSONNALISÉS
const getPersonalizedClosing = async (persona, journeyChoice) => {
  try {
    const closings = await ContentManager.getClosings();

    if (!closings[persona]) {
      return 'Continue ton chemin avec confiance';
    }

    const journeyKey = journeyChoice || 'body';
    return closings[persona][journeyKey] || closings[persona].body;
  } catch (error) {
    // Fallback local si API down
    if (!localClosings[persona]) return 'Continue ton chemin avec confiance';
    const journeyKey = journeyChoice || 'body';
    return localClosings[persona][journeyKey] || localClosings[persona].body;
  }
};

// 🎯 ENRICHISSEMENT CONTEXTUEL - VERSION SIMPLIFIÉE
const enrichInsightWithContext = async (baseVariant, userContext) => {
  try {
    const prenom = userContext?.profile?.prenom;
    const persona = userContext?.persona?.assigned;
    const journeyChoice = userContext?.profile?.journeyChoice;

    // Enrichissement simple : prénom + insight + closing personnalisé
    let enrichedMessage = prenom ? `${prenom}, ${baseVariant}` : baseVariant;

    // Ajouter closing personnalisé
    if (persona && journeyChoice) {
      const personalizedClosing = await getPersonalizedClosing(persona, journeyChoice);
      if (personalizedClosing) {
        enrichedMessage += ` ${personalizedClosing}`;
      }
    }

    return enrichedMessage;
  } catch (error) {
    console.warn('🚨 Erreur enrichissement:', error);
    return baseVariant;
  }
};

// 🎯 FONCTION PRINCIPALE - VERSION ÉPURÉE
export const getPersonalizedInsight = async (context, options = {}) => {
  const {
    phase,
    persona,
    preferences,
    melune,
    profile
  } = context;

  const {
    usedInsights = [],
    enrichWithContext = false
  } = options;

  if (!phase) {
    return {
      content: getFallbackInsight(phase, persona, profile?.prenom),
      id: null,
      source: 'fallback-no-phase',
    };
  }

  try {
    // 🌐 FETCH DEPUIS API AVEC FALLBACK
    const insights = await ContentManager.getInsights();
    const phaseInsights = insights[phase];

    if (!phaseInsights || phaseInsights.length === 0) {
      return {
        content: getFallbackInsight(phase, persona, profile?.prenom),
        id: null,
        source: 'fallback-no-phase-data',
      };
    }

    // Logique de sélection (algorithme existant)
    let availableInsights = phaseInsights;

    // Filtrage par ton si spécifié
    if (melune?.tone) {
      const toneInsights = phaseInsights.filter(
        (insight) => insight.tone === melune.tone
      );
      if (toneInsights.length > 0) availableInsights = toneInsights;
    }

    // Anti-répétition
    let unusedInsights = availableInsights.filter((insight) => !usedInsights.includes(insight.id));

    // Reset à 80%
    if (unusedInsights.length / availableInsights.length < 0.2) {
      unusedInsights = availableInsights;
    }

    if (unusedInsights.length === 0) {
      return {
        content: getFallbackInsight(phase, persona, profile?.prenom),
        id: null,
        source: 'fallback-no-insights',
      };
    }

    // Scoring (algorithme existant)
    const scoredInsights = unusedInsights.map((insight) => {
      let score = 0;
      if (insight.targetPersonas?.includes(persona)) score += 100;
      score += (insight.jezaApproval || 3) * 5;
      if (insight.status === 'enriched') score += 20;
      return { ...insight, relevanceScore: score };
    });

    scoredInsights.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const selectedInsight = scoredInsights[0];

    // Sélection du contenu (variant vs baseContent)
    let content = '';
    if (selectedInsight.personaVariants?.[persona]) {
      content = selectedInsight.personaVariants[persona];
    } else if (selectedInsight.baseContent) {
      content = selectedInsight.baseContent;
    } else {
      content = selectedInsight.content || getFallbackInsight(phase, persona);
    }

    // Enrichissement contextuel optionnel
    if (enrichWithContext) {
      content = await enrichInsightWithContext(content, context);
    }

    return {
      content,
      id: selectedInsight.id,
      persona: persona,
      relevanceScore: selectedInsight.relevanceScore,
      source: 'api-with-enrichment',
    };
  } catch (error) {
    console.error('🚨 Erreur API insights, fallback local:', error);
    return {
      content: getFallbackInsight(phase, persona, profile?.prenom),
      id: null,
      source: 'fallback-error',
    };
  }
};

// 🎯 EXPORTS
export { enrichInsightWithContext, getPersonalizedClosing };
