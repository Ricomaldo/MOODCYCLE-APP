// ═══════════════════════════════════════════════════════════
// ⚙️ AdaptiveGuidance.js - Service Guidance Contextuelle
// ═══════════════════════════════════════════════════════════

// Import des données des phases pour enrichir la communication
import phasesData from '../data/phases.json';

// ───────────────────────────────────────────────────────────
// 🎯 TEMPLATES GUIDANCE PAR PERSONA
// ───────────────────────────────────────────────────────────

const GUIDANCE_TEMPLATES = {
  emma: {
    discovery: {
      welcome: "Hey ! 🌟 Prête à explorer ton cycle comme jamais ?",
      suggestion: "Teste cette vignette, elle va te surprendre !",
      encouragement: "Tu découvres super bien, continue !",
      nextStep: "Et si on explorait ta phase {phase} ?"
    },
    learning: {
      welcome: "Tu commences à capter ton rythme ! 💫",
      suggestion: "Cette action va t'aider à mieux comprendre",
      encouragement: "Tes observations sont top !",
      nextStep: "Ready pour le niveau suivant ?"
    },
    autonomous: {
      welcome: "Tu maîtrises ton cycle comme une boss ! 🔥",
      suggestion: "Tu pourrais créer tes propres insights",
      encouragement: "Ton autonomie cyclique est inspirante",
      nextStep: "Et si tu partageais ton expérience ?"
    }
  },
  
  laure: {
    discovery: {
      welcome: "Bienvenue dans votre apprentissage cyclique",
      suggestion: "Cette fonctionnalité optimisera votre suivi",
      encouragement: "Votre progression est méthodique",
      nextStep: "Prochaine étape : analyse de votre phase {phase}"
    },
    learning: {
      welcome: "Votre compréhension cyclique s'affine",
      suggestion: "Cet outil s'intègre parfaitement à votre routine",
      encouragement: "Excellente régularité dans vos observations",
      nextStep: "Planifiez votre semaine selon votre énergie"
    },
    autonomous: {
      welcome: "Maîtrise cyclique complète atteinte",
      suggestion: "Optimisez vos projets selon vos phases",
      encouragement: "Votre autonomie cyclique est remarquable",
      nextStep: "Affinez vos stratégies de performance"
    }
  },
  
  clara: {
    discovery: {
      welcome: "Bienvenue dans cette aventure transformante ! ✨",
      suggestion: "Cette pépite va révolutionner ta vision !",
      encouragement: "Tu rayonnes déjà de conscience cyclique !",
      nextStep: "Prête à transcender ta compréhension de {phase} ?"
    },
    learning: {
      welcome: "Ta transformation cyclique s'épanouit ! 🌺",
      suggestion: "Cette magie va amplifier ton pouvoir féminin",
      encouragement: "Chaque observation nourrit ton évolution !",
      nextStep: "Libère tout ton potentiel cyclique !"
    },
    autonomous: {
      welcome: "Tu incarnes la maîtrise cyclique absolue ! 👑",
      suggestion: "Deviens ambassadrice de la sagesse cyclique",
      encouragement: "Tu inspires toutes les femmes !",
      nextStep: "Partage ta lumière cyclique avec le monde"
    }
  },
  
  sylvie: {
    discovery: {
      welcome: "Prenons le temps d'apprendre ensemble",
      suggestion: "Cette approche respecte votre rythme naturel",
      encouragement: "Votre écoute de vous-même est précieuse",
      nextStep: "Explorons doucement votre phase {phase}"
    },
    learning: {
      welcome: "Votre sagesse cyclique grandit sereinement",
      suggestion: "Cet outil honore votre expérience",
      encouragement: "Votre bienveillance envers vous-même inspire",
      nextStep: "Cultivez cette connexion à votre cycle"
    },
    autonomous: {
      welcome: "Vous incarnez la sagesse cyclique mature",
      suggestion: "Transmettez cette connaissance précieuse",
      encouragement: "Votre parcours est exemplaire",
      nextStep: "Guidez d'autres femmes dans leur découverte"
    }
  },
  
  christine: {
    discovery: {
      welcome: "Chaque âge offre de nouvelles compréhensions",
      suggestion: "Cette approche respecte votre expérience",
      encouragement: "Votre sagesse enrichit cette découverte",
      nextStep: "Approfondissons votre connaissance de {phase}"
    },
    learning: {
      welcome: "Votre expérience de vie éclaire ce chemin",
      suggestion: "Cet outil honore votre parcours",
      encouragement: "Votre réflexion est d'une grande richesse",
      nextStep: "Votre sagesse guide cette exploration"
    },
    autonomous: {
      welcome: "Vous maîtrisez votre cycle avec sagesse",
      suggestion: "Votre expérience est un trésor à partager",
      encouragement: "Votre autonomie cyclique inspire",
      nextStep: "Transmettez cette connaissance précieuse"
    }
  }
};

// ───────────────────────────────────────────────────────────
// 🎯 ACTIONS CONTEXTUELLES PAR NIVEAU
// ───────────────────────────────────────────────────────────

const CONTEXTUAL_ACTIONS = {
  discovery: {
    primary: [
      {
        type: 'chat',
        label: 'Parler à Melune',
        prompt: 'Comment mieux comprendre ma phase actuelle ?',
        icon: '💬'
      },
      {
        type: 'notebook',
        label: 'Noter mes ressentis',
        prompt: 'Qu\'est-ce que je ressens dans mon corps aujourd\'hui ?',
        icon: '📝'
      }
    ],
    secondary: [
      {
        type: 'explore',
        label: 'Explorer cette phase',
        icon: '🔍'
      }
    ]
  },
  
  learning: {
    primary: [
      {
        type: 'track',
        label: 'Tracker précisément',
        prompt: 'Symptômes et énergie du jour',
        icon: '📊'
      },
      {
        type: 'analyze',
        label: 'Analyser patterns',
        icon: '📈'
      }
    ],
    secondary: [
      {
        type: 'plan',
        label: 'Planifier semaine',
        icon: '📅'
      },
      {
        type: 'insights',
        label: 'Découvrir insights',
        icon: '💡'
      }
    ]
  },
  
  autonomous: {
    primary: [
      {
        type: 'create',
        label: 'Créer insights',
        icon: '✨'
      },
      {
        type: 'optimize',
        label: 'Optimiser cycle',
        icon: '🎯'
      }
    ],
    secondary: [
      {
        type: 'share',
        label: 'Partager sagesse',
        icon: '🤝'
      },
      {
        type: 'mentor',
        label: 'Guider autres',
        icon: '🌟'
      }
    ]
  }
};

// ───────────────────────────────────────────────────────────
// 🏭 FACTORY FUNCTION PRINCIPALE
// ───────────────────────────────────────────────────────────

export const createAdaptiveGuidance = (userProfile, engagementData, currentPhase) => {
  
  // ──────────────────────────────────────────────────────
  // 💬 GÉNÉRATION MESSAGES CONTEXTUELS
  // ──────────────────────────────────────────────────────
  
  const generateContextualMessage = (persona, maturityLevel, messageType, context = {}) => {
    // Si une phase est fournie, tenter d'enrichir avec les données phases.json
    if (context.phase && phasesData && phasesData[context.phase]) {
      try {
        const phaseConfig = phasesData[context.phase];
        const meluneConfig = phaseConfig.melune;
        
        if (meluneConfig) {
          const { tone, vocabulary, communicationStyle } = meluneConfig;
          
          // Construction du message enrichi avec les données de la phase
          const vocabularyText = vocabulary && vocabulary.length >= 2 
            ? `${vocabulary[0]}, ${vocabulary[1]}` 
            : vocabulary?.[0] || 'bien-être';
            
          const enrichedMessage = `Avec un ton ${tone}, utilisant ${vocabularyText} et style ${communicationStyle}`;
          
          return enrichedMessage;
        }
      } catch (error) {
        console.warn('Erreur lors de l\'enrichissement du message avec phases.json:', error);
        // Fallback sur le template statique en cas d'erreur
      }
    }
    
    // Fallback sur les templates statiques existants
    const template = GUIDANCE_TEMPLATES[persona]?.[maturityLevel]?.[messageType];
    
    if (!template) {
      return getFallbackMessage(messageType);
    }
    
    // Remplacement variables contextuelles
    let message = template;
    if (context.phase) {
      message = message.replace('{phase}', context.phase);
    }
    
    return message;
  };
  
  // ──────────────────────────────────────────────────────
  // 🎯 ACTIONS RECOMMANDÉES CONTEXTUELLES
  // ──────────────────────────────────────────────────────
  
  const getContextualActions = (maturityLevel, persona, currentPhase) => {
    const baseActions = CONTEXTUAL_ACTIONS[maturityLevel] || CONTEXTUAL_ACTIONS.discovery;
    
    // Adaptation selon persona
    const adaptedActions = adaptActionsToPersona(baseActions, persona, currentPhase);
    
    return adaptedActions;
  };
  
  // ──────────────────────────────────────────────────────
  // 🎭 ADAPTATION ACTIONS SELON PERSONA
  // ──────────────────────────────────────────────────────
  
  const adaptActionsToPersona = (actions, persona, phase) => {
    const adapted = structuredClone(actions); // Modern deep clone
    
    switch (persona) {
      case 'emma':
        adapted.primary = adapted.primary.map(action => ({
          ...action,
          label: action.label.replace('Tracker', 'Explorer').replace('Analyser', 'Découvrir')
        }));
        break;
        
      case 'laure':
        adapted.primary = adapted.primary.map(action => ({
          ...action,
          label: action.label.replace('Explorer', 'Optimiser').replace('Noter', 'Structurer')
        }));
        break;
        
      case 'clara':
        adapted.primary = adapted.primary.map(action => ({
          ...action,
          label: action.label.replace('Tracker', 'Transformer').replace('Analyser', 'Révéler')
        }));
        break;
    }
    
    return adapted;
  };
  
  // ──────────────────────────────────────────────────────
  // 🎯 GÉNÉRATION VIGNETTES INTELLIGENTES
  // ──────────────────────────────────────────────────────
  
  const generateSmartVignettes = (userProfile, engagementMetrics, currentPhase) => {
    const { persona, cycle } = userProfile;
    const { maturity } = engagementMetrics;
    
    const vignettes = [];
    
    // Vignette 1: Action principale adaptée
    const primaryAction = getContextualActions(maturity.current, persona.assigned, currentPhase).primary[0];
    vignettes.push({
      id: `primary_${currentPhase}`,
      type: 'action',
      title: generateContextualMessage(persona.assigned, maturity.current, 'suggestion'),
      action: primaryAction,
      priority: 'high',
      phase: currentPhase
    });
    
    // Vignette 2: Guidance personnalisée
    if (maturity.current !== 'autonomous') {
      vignettes.push({
        id: `guidance_${currentPhase}`,
        type: 'guidance',
        title: generateContextualMessage(persona.assigned, maturity.current, 'nextStep', { phase: currentPhase }),
        action: {
          type: 'chat',
          prompt: getPhaseSpecificPrompt(currentPhase, persona.assigned),
          icon: '💬'
        },
        priority: 'medium',
        phase: currentPhase
      });
    }
    
    // Vignette 3: Exploration ou création
    const explorationAction = maturity.current === 'autonomous' ? 
      { type: 'create', label: 'Créer insight', icon: '✨' } :
      { type: 'explore', label: 'Explorer phase', icon: '🔍' };
      
    vignettes.push({
      id: `explore_${currentPhase}`,
      type: 'exploration',
      title: maturity.current === 'autonomous' ? 
        'Créez votre propre sagesse' : 
        'Découvrez cette phase',
      action: explorationAction,
      priority: 'low',
      phase: currentPhase
    });
    
    return vignettes.slice(0, 3); // Max 3 vignettes
  };
  
  // ──────────────────────────────────────────────────────
  // 📝 PROMPTS SPÉCIFIQUES PAR PHASE
  // ──────────────────────────────────────────────────────
  
  const getPhaseSpecificPrompt = (phase, persona) => {
    const prompts = {
      menstrual: {
        emma: "Comment honorer mon besoin de repos pendant mes règles ?",
        laure: "Comment adapter ma productivité pendant mes règles ?",
        clara: "Comment transformer l'énergie de mes règles ?",
        sylvie: "Comment prendre soin de moi pendant mes règles ?",
        christine: "Comment respecter mon rythme pendant mes règles ?"
      },
      follicular: {
        emma: "Comment exploiter cette énergie qui remonte ?",
        laure: "Comment planifier mes projets pendant ma phase folliculaire ?",
        clara: "Comment maximiser ma créativité folliculaire ?",
        sylvie: "Comment nourrir mes projets en phase folliculaire ?",
        christine: "Comment canaliser cette nouvelle énergie ?"
      },
      ovulatory: {
        emma: "Comment briller pendant mon ovulation ?",
        laure: "Comment optimiser ma communication en ovulation ?",
        clara: "Comment rayonner de mon pouvoir ovulatoire ?",
        sylvie: "Comment partager ma lumière ovulatoire ?",
        christine: "Comment exprimer ma sagesse en ovulation ?"
      },
      luteal: {
        emma: "Comment gérer cette sensibilité pré-menstruelle ?",
        laure: "Comment maintenir ma performance en phase lutéale ?",
        clara: "Comment transformer cette intensité lutéale ?",
        sylvie: "Comment accueillir cette phase introspective ?",
        christine: "Comment honorer cette sagesse lutéale ?"
      }
    };
    
    return prompts[phase]?.[persona] || `Comment mieux vivre ma phase ${phase} ?`;
  };
  
  // ──────────────────────────────────────────────────────
  // 🆘 FALLBACKS
  // ──────────────────────────────────────────────────────
  
  const getFallbackMessage = (messageType) => {
    const fallbacks = {
      welcome: "Bienvenue dans votre parcours cyclique",
      suggestion: "Explorez cette fonctionnalité",
      encouragement: "Vous progressez bien",
      nextStep: "Continuez votre apprentissage"
    };
    
    return fallbacks[messageType] || "Continuez votre exploration";
  };
  
  // ──────────────────────────────────────────────────────
  // 🎯 API PUBLIQUE PRINCIPALE
  // ──────────────────────────────────────────────────────
  
  const createAdaptiveExperience = () => {
    return {
      // Messages contextuels
      welcomeMessage: generateContextualMessage(
        userProfile.persona.assigned,
        engagementData.maturity.current,
        'welcome'
      ),
      
      encouragement: generateContextualMessage(
        userProfile.persona.assigned,
        engagementData.maturity.current,
        'encouragement'
      ),
      
      // Actions recommandées
      contextualActions: getContextualActions(
        engagementData.maturity.current,
        userProfile.persona.assigned,
        currentPhase
      ),
      
      // Vignettes intelligentes
      smartVignettes: generateSmartVignettes(
        userProfile,
        engagementData,
        currentPhase
      ),
      
      // Métadonnées
      metadata: {
        persona: userProfile.persona.assigned,
        maturityLevel: engagementData.maturity.current,
        currentPhase,
        confidence: engagementData.maturity.confidence
      }
    };
  };
  
  // ──────────────────────────────────────────────────────
  // 🔄 API PUBLIQUE - MÉTHODES EXPOSÉES
  // ──────────────────────────────────────────────────────
  
  return {
    generateContextualMessage,
    getContextualActions,
    adaptActionsToPersona,
    generateSmartVignettes,
    getPhaseSpecificPrompt,
    getFallbackMessage,
    createAdaptiveExperience
  };
};

// ───────────────────────────────────────────────────────────
// 🎯 EXPORT CLEAN - API MODERNE UNIQUEMENT  
// ───────────────────────────────────────────────────────────

// Export uniquement de la factory function moderne
// Plus de classe wrapper obsolète - Architecture unifiée