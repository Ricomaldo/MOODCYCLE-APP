// ═══════════════════════════════════════════════════════════
// 🧠 PersonalizationEngine.js - Version Propre & Compatible
// ═══════════════════════════════════════════════════════════

import ContentManager from './ContentManager.js';

// ───────────────────────────────────────────────────────────
// 📊 DONNÉES STATIQUES OPTIMISÉES
// ───────────────────────────────────────────────────────────

const PERSONA_PROMPTS = {
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
    ],
    sylvie: [
      "Comment m'offrir la douceur dont j'ai besoin ?",
      "Qu'est-ce que mon corps me demande vraiment ?",
      "Comment honorer cette sagesse que mon corps partage ?"
    ],
    christine: [
      "Comment transformer ce moment en rituel de ressourcement ?",
      "Quelle sagesse mon corps me transmet-il dans cette phase ?",
      "Comment honorer cette période sacrée ?"
    ]
  },
  follicular: {
    emma: [
      "Comment canaliser cette énergie qui remonte ? ✨",
      "Quels nouveaux projets t'inspirent ?",
      "Comment explorer cette renaissance énergétique ?"
    ],
    laure: [
      "Comment structurer tes objectifs pour cette phase énergétique ?",
      "Quelles initiatives vais-je lancer avec cette énergie montante ?",
      "Comment planifier pour maximiser cette phase ?"
    ],
    clara: [
      "Comment exploiter au max cette phase de création ?",
      "Comment transformer cette énergie en résultats concrets ?",
      "Quel potentiel débloquer avec cette énergie ?"
    ],
    sylvie: [
      "Comment cultiver mes aspirations avec douceur ?",
      "Quelles graines vais-je planter pour mon épanouissement ?",
      "Comment nourrir mes rêves naissants ?"
    ],
    christine: [
      "Comment harmoniser cette renaissance avec ma sagesse ?",
      "Quelle vision sage émerge de cette énergie créatrice ?",
      "Comment éveiller mon potentiel avec grâce ?"
    ]
  },
  ovulatory: {
    emma: [
      "Comment utiliser cette énergie communicative ? 🌟",
      "Qu'est-ce que j'ai envie d'exprimer au monde ?",
      "Comment rayonner pleinement aujourd'hui ?"
    ],
    laure: [
      "Comment optimiser mes interactions et présentations ?",
      "Comment maximiser mon impact relationnel aujourd'hui ?",
      "Comment communiquer efficacement avec cette énergie ?"
    ],
    clara: [
      "Comment exploiter cette confiance ultime ?",
      "Comment transformer cette énergie en leadership ?",
      "Comment dominer mes interactions aujourd'hui ?"
    ],
    sylvie: [
      "Comment rayonner ma bienveillance naturelle ?",
      "Comment utiliser cette énergie pour nourrir mes relations ?",
      "Comment partager ma lumière avec le monde ?"
    ],
    christine: [
      "Comment partager mes apprentissages avec grâce ?",
      "Quelle sagesse puis-je offrir avec cette énergie rayonnante ?",
      "Comment transmettre ma sagesse aujourd'hui ?"
    ]
  },
  luteal: {
    emma: [
      "Comment mieux respecter mes limites ? 🍂",
      "Qu'est-ce que j'ai appris sur moi ce cycle ?",
      "Comment écouter mon intuition profonde ?"
    ],
    laure: [
      "Comment structurer mes priorités avec cette énergie focus ?",
      "Quelles améliorations vais-je implémenter ?",
      "Comment organiser et finaliser mes projets ?"
    ],
    clara: [
      "Comment transformer cette intensité en superpouvoir ?",
      "Quels insights révèlent mes patterns lutéaux ?",
      "Comment maîtriser les défis de cette phase ?"
    ],
    sylvie: [
      "Comment accueillir cette sensibilité avec tendresse ?",
      "Quelle sagesse ce cycle m'a-t-il apportée ?",
      "Comment câliner mes émotions intenses ?"
    ],
    christine: [
      "Comment honorer cette phase de transformation intérieure ?",
      "Quelles vérités profondes émergent de cette introspection ?",
      "Comment savourer cette profondeur cyclique ?"
    ]
  }
};

const PREFERENCE_PROMPTS = {
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
  ],
  phases: [
    "Comment optimiser cette phase cyclique ?",
    "Quelle énergie cette phase t'offre-t-elle ?",
    "Comment honorer cette période unique ?"
  ],
  rituals: [
    "Quels rituels honorer aujourd'hui ?",
    "Comment créer un moment sacré pour toi ?",
    "Comment transformer cette journée en rituel ?"
  ]
};

const ACTION_CONFIG = {
  chat: {
    icons: { menstrual: '💭', follicular: '🌱', ovulatory: '💬', luteal: '🔮' },
    titles: {
      emma: 'Explore tes ressentis',
      laure: 'Optimise ta communication', 
      clara: 'Exprime ta puissance',
      sylvie: 'Partage tes émotions',
      christine: 'Transmets ta sagesse'
    }
  },
  notebook: {
    icons: { menstrual: '✍️', follicular: '💡', ovulatory: '🎨', luteal: '📚' },
    titles: {
      emma: 'Note tes découvertes',
      laure: 'Structure tes observations',
      clara: 'Capture tes insights', 
      sylvie: 'Recueille tes ressentis',
      christine: 'Consigne ta sagesse'
    }
  },
  phase_detail: {
    icons: { menstrual: '🌙', follicular: '🌸', ovulatory: '☀️', luteal: '🍂' },
    titles: {
      emma: 'Découvre cette phase',
      laure: 'Maîtrise cette phase',
      clara: 'Conquiers cette phase',
      sylvie: 'Comprends cette phase', 
      christine: 'Explore le mystère'
    }
  }
};

// ───────────────────────────────────────────────────────────
// 🏭 FACTORY FUNCTION PRINCIPALE
// ───────────────────────────────────────────────────────────

export const createPersonalizationEngine = (intelligenceData, preferences, currentPhase, persona) => {
  
  // ──────────────────────────────────────────────────────
  // 🧠 GÉNÉRATION PROMPTS PERSONNALISÉS
  // ──────────────────────────────────────────────────────
  
  const generatePersonalizedPrompts = () => {
    const prompts = [];
    
    // 1. Prompts persona + phase (priorité haute)
    const phasePrompts = PERSONA_PROMPTS[currentPhase]?.[persona] || [];
    prompts.push(...phasePrompts.slice(0, 2));
    
    // 2. Prompts préférence dominante
    const dominantPref = getDominantPreference(preferences);
    if (dominantPref && PREFERENCE_PROMPTS[dominantPref]) {
      prompts.push(PREFERENCE_PROMPTS[dominantPref][0]);
    }
    
    // 3. Prompts apprentissage (si confidence > 30)
    if (intelligenceData.learning.confidence > 30) {
      const learnedPrompts = getLearnedPrompts();
      prompts.push(...learnedPrompts.slice(0, 1));
    }
    
    // 4. Fallback si pas assez de prompts
    if (prompts.length < 3) {
      prompts.push("Comment te sens-tu en ce moment ?");
    }
    
    return prompts.slice(0, 3);
  };

  // ──────────────────────────────────────────────────────
  // 🎯 GÉNÉRATION ACTIONS CONTEXTUELLES  
  // ──────────────────────────────────────────────────────
  
  const generateContextualActions = () => {
    const actions = [];
    
    // Action 1: Chat toujours disponible
    const chatPrompts = generatePersonalizedPrompts();
    actions.push({
      type: 'chat',
      priority: 'high',
      title: ACTION_CONFIG.chat.titles[persona],
      label: ACTION_CONFIG.chat.titles[persona], // Pour useSmartSuggestions
      prompt: chatPrompts[0],
      icon: ACTION_CONFIG.chat.icons[currentPhase],
      confidence: Math.min(intelligenceData.learning.confidence + 30, 100)
    });
    
    // Action 2: Notebook si préférence émotions/tracking
    if (shouldShowNotebook()) {
      actions.push({
        type: 'notebook',
        priority: 'medium',
        title: ACTION_CONFIG.notebook.titles[persona],
        label: ACTION_CONFIG.notebook.titles[persona],
        prompt: getNotebookPrompt(),
        icon: ACTION_CONFIG.notebook.icons[currentPhase],
        confidence: intelligenceData.learning.confidence
      });
    }
    
    // Action 3: Phase detail si confidence faible ou nouvelle phase
    if (shouldShowPhaseDetail()) {
      actions.push({
        type: 'phase_detail', 
        priority: 'low',
        title: ACTION_CONFIG.phase_detail.titles[persona],
        label: ACTION_CONFIG.phase_detail.titles[persona],
        prompt: null,
        icon: ACTION_CONFIG.phase_detail.icons[currentPhase],
        confidence: 100 - intelligenceData.learning.confidence
      });
    }
    
    return actions.slice(0, 3);
  };

  // ──────────────────────────────────────────────────────
  // 🛠️ FONCTIONS UTILITAIRES
  // ──────────────────────────────────────────────────────
  
  const getDominantPreference = (prefs) => {
    if (!prefs || typeof prefs !== 'object') return null;
    
    return Object.entries(prefs)
      .filter(([_, value]) => value >= 4)
      .sort(([_, a], [__, b]) => b - a)[0]?.[0] || null;
  };
  
  const getLearnedPrompts = () => {
    // Simulé - à connecter avec vraie intelligence
    return ["Comment développer ce qui a marché hier ?"];
  };
  
  const shouldShowNotebook = () => {
    return preferences.moods >= 4 || 
           preferences.symptoms >= 4 ||
           currentPhase === 'luteal';
  };
  
  const shouldShowPhaseDetail = () => {
    return intelligenceData.learning.confidence < 50 ||
           !intelligenceData.learning.phasePatterns?.[currentPhase];
  };
  
  const getNotebookPrompt = () => {
    const prompts = {
      menstrual: "Qu'est-ce que mon corps me demande vraiment ?",
      follicular: "Quels projets m'inspirent en ce moment ?", 
      ovulatory: "Comment puis-je rayonner davantage ?",
      luteal: "Que m'enseigne cette sensibilité ?"
    };
    
    return prompts[currentPhase] || "Que ressens-tu maintenant ?";
  };

  // ──────────────────────────────────────────────────────
  // 📊 MÉTADONNÉES PERSONNALISATION
  // ──────────────────────────────────────────────────────
  
  const getPersonalizationMetadata = () => {
    const learning = intelligenceData.learning;
    
    return {
      confidence: learning.confidence,
      dataPoints: {
        timePatterns: learning.timePatterns?.favoriteHours?.length || 0,
        phaseData: Object.keys(learning.phasePatterns || {}).length,
        conversationHistory: learning.conversationCount || 0
      },
      recommendations: getRecommendations(learning.confidence)
    };
  };
  
  const getRecommendations = (confidence) => {
    const recommendations = [];
    
    if (confidence < 30) {
      recommendations.push("Continue tes interactions pour une personnalisation optimale");
    }
    
    if (confidence > 70) {
      recommendations.push("Tes données permettent des suggestions très personnalisées !");
    }
    
    return recommendations;
  };

  // ──────────────────────────────────────────────────────
  // 🎯 API PUBLIQUE
  // ──────────────────────────────────────────────────────
  
  const createPersonalizedExperience = () => {
    return {
      personalizedPrompts: generatePersonalizedPrompts(),
      contextualActions: generateContextualActions(),
      personalization: getPersonalizationMetadata()
    };
  };

  return {
    createPersonalizedExperience,
    generatePersonalizedPrompts,
    generateContextualActions,
    getPersonalizationMetadata
  };
};

// ───────────────────────────────────────────────────────────
// 🎯 FONCTION CONTEXTUELLE AUTONOME (pour l'API backend)
// ───────────────────────────────────────────────────────────

export const getContextualMessage = async (phase, persona, journey, preferences) => {
  try {
    const phasesData = await ContentManager.getPhases();
    const phaseData = phasesData[phase];
    
    if (!phaseData?.contextualEnrichments?.length) {
      return phaseData?.description || "Explorons ensemble cette période de ton cycle.";
    }

    // Scoring enrichissements
    let bestMatch = null;
    let bestScore = -1;

    for (const enrichment of phaseData.contextualEnrichments) {
      let score = 0;
      
      if (enrichment.targetPersona === persona) score += 100;
      if (enrichment.targetJourney === journey) score += 50;
      if (preferences?.includes?.(enrichment.targetPreferences?.[0])) score += 25;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = enrichment;
      }
    }

    return bestMatch?.contextualText || phaseData.description;
  } catch (error) {
    console.warn('🚨 getContextualMessage error:', error);
    return "Explorons ensemble cette période de ton cycle.";
  }
};