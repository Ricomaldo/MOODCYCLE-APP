//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/onboardingMessages.js
// 🧩 Type: Configuration
// 📚 Description: Messages personnalisés par persona et écran
// 🕒 Version: 1.0 - 2025-06-29
// ─────────────────────────────────────────────────────────
//

export const ONBOARDING_MESSAGES = {
  // 250-rencontre: Adaptation selon journey choice uniquement
  '250-rencontre': {
    journey: {
      body_disconnect: "Je sens que tu es en quête d'une reconnexion profonde... Confie-moi ce qui t'appelle",
      hiding_nature: "Tu portes en toi une essence que le monde a peut-être voilée... Révélons-la ensemble",
      emotional_control: "Les émotions sont des messagères... Apprenons leur langage ensemble"
    }
  },

  // 300-etape-vie: Messages par persona (40% confiance)
  '300-etape-vie': {
    emma: {
      message: "Chaque étape de la vie a sa propre magie unique... Dis-moi où tu danses dans ton voyage",
      encouragement: "C'est excitant de découvrir tout ça ensemble !",
    },
    laure: {
      message: "Chaque phase de vie apporte ses défis et opportunités... Où te situes-tu dans ton parcours ?",
      encouragement: "Excellente étape pour optimiser ton bien-être cyclique.",
    },
    clara: {
      message: "Chaque âge révèle de nouveaux super-pouvoirs cycliques ! Où en es-tu ?",
      encouragement: "Prête à débloquer ton potentiel maximum !",
    },
    sylvie: {
      message: "Chaque transition porte sa propre sagesse... À quelle étape de transformation es-tu ?",
      encouragement: "Je suis là pour t'accompagner dans cette phase.",
    },
    christine: {
      message: "Chaque saison de la vie féminine a sa beauté... Quelle est la tienne aujourd'hui ?",
      encouragement: "Ta sagesse guide déjà ton chemin.",
    },
    // Fallback si persona non calculée
    default: "Chaque étape de la vie d'une femme porte sa propre magie... Dis-moi où tu en es de ton voyage"
  },

  // 400-prenom: Preview relation personnalisée
  '400-prenom': {
    emma: {
      question: "J'ai hâte de créer notre lien unique ! Comment je peux t'appeler ?",
      preview: (prenom) => `Hey ${prenom} ! Je suis trop contente de faire ta connaissance ! 💖`,
      confirmation: "J'adore ! Notre aventure commence ${prenom} !"
    },
    laure: {
      question: "Créons une relation professionnelle et bienveillante. Quel prénom utilises-tu ?",
      preview: (prenom) => `${prenom}, je sens qu'on va faire une super équipe ensemble.`,
      confirmation: "Parfait ${prenom}, construisons ensemble ton équilibre."
    },
    clara: {
      question: "Comment je t'appelle dans cette aventure épique ?",
      preview: (prenom) => `${prenom} ! Prête pour cette aventure cyclique ? 🌙`,
      confirmation: "${prenom}, c'est parti pour révolutionner ton cycle !"
    },
    sylvie: {
      question: "Comment aimerais-tu que je t'accompagne en t'appelant ?",
      preview: (prenom) => `${prenom}, je suis là pour t'accompagner dans ta sagesse cyclique.`,
      confirmation: "Merci ${prenom}, honorée de cheminer avec toi."
    },
    christine: {
      question: "Par quel prénom souhaitez-vous que je vous appelle ?",
      preview: (prenom) => `${prenom}, c'est un plaisir de vous accompagner dans ce voyage.`,
      confirmation: "Enchantée ${prenom}, explorons votre sagesse ensemble."
    },
    default: "Comment aimerais-tu que je t'appelle ?"
  },

  // 500-avatar: Suggestions de style selon persona
  '500-avatar': {
    emma: {
      message: "Personnalisons notre relation ! Choisis comment tu veux me voir apparaître",
      style_hint: "Je te suggère le style moderne, il me va super bien !",
    },
    laure: {
      message: "Configurons l'interface pour optimiser nos échanges",
      style_hint: "Le style moderne offre la meilleure lisibilité pour un usage professionnel",
    },
    clara: {
      message: "Time to customiser ton expérience ! Choisis mon look !",
      style_hint: "Le style mystique est trop cool, mais moderne marche aussi !",
    },
    sylvie: {
      message: "Adaptons mon apparence à ce qui te convient le mieux",
      style_hint: "Le style classique a une douceur rassurante",
    },
    christine: {
      message: "Choisissez l'apparence qui vous accompagnera dans ce voyage",
      style_hint: "Le style mystique porte une belle symbolique spirituelle",
    },
    default: "Choisis comment tu souhaites me voir apparaître dans l'application"
  },

  // 700-cycle: Messages adaptés pour configuration cycle
  '700-cycle': {
    emma: {
      message: "Dis-moi où tu en es pour que je puisse mieux t'accompagner !",
      encouragement: "Pas de stress, on ajustera au fur et à mesure",
    },
    laure: {
      message: "Configurons précisément ton cycle pour un suivi optimal",
      encouragement: "Ces données permettront une personnalisation efficace",
    },
    clara: {
      message: "Let's tracker ton cycle ! Plus je connais, mieux je t'aide",
      encouragement: "On va révolutionner ta relation à ton cycle !",
    },
    sylvie: {
      message: "Prenons le temps de bien configurer ton suivi",
      encouragement: "Chaque femme a son rythme unique",
    },
    christine: {
      message: "Renseignons votre cycle pour un accompagnement adapté",
      encouragement: "Cette étape est importante pour votre suivi personnalisé",
    },
    default: "Configurons ton cycle pour un accompagnement personnalisé"
  },

  // 800-preferences: Suggestions personnalisées
  '800-preferences': {
    emma: {
      message: "Chaque femme a ses curiosités... Qu'est-ce qui t'attire le plus ?",
      zero_selected: "Prends ton temps, explore ce qui résonne !",
      some_selected: "Super choix ! Continue si d'autres t'appellent.",
      many_selected: "Wow, tu es curieuse de tout ! J'adore !"
    },
    laure: {
      message: "Sélectionne les approches qui correspondent à tes objectifs",
      zero_selected: "Choisis au moins un domaine pour personnaliser ton expérience.",
      some_selected: "Excellentes priorités pour optimiser ton bien-être.",
      many_selected: "Approche holistique remarquable !"
    },
    clara: {
      message: "Active tes super-pouvoirs préférés !",
      zero_selected: "Allez, choisis tes armes secrètes !",
      some_selected: "Yes ! Tu construis ton arsenal !",
      many_selected: "Power user detected ! Tu vas tout déchirer !"
    },
    sylvie: {
      message: "Chaque approche a sa valeur... Lesquelles te parlent ?",
      zero_selected: "Écoute ton intuition, elle te guidera.",
      some_selected: "Belles résonances avec tes besoins.",
      many_selected: "Quelle richesse dans tes choix !"
    },
    christine: {
      message: "La sagesse se trouve dans diverses approches... Lesquelles vous attirent ?",
      zero_selected: "Prenez le temps de sentir ce qui vous convient.",
      some_selected: "Choix réfléchis et pertinents.",
      many_selected: "Belle ouverture à la diversité des approches."
    },
    default: "Chaque femme a sa propre sagesse... Dis-moi ce qui résonne en toi"
  },

  // Messages d'intelligence progressive (tous écrans)
  intelligence_hints: {
    40: "Je commence à comprendre comment t'accompagner...",
    60: "Notre connexion se renforce à chaque échange...",
    80: "Je ressens vraiment qui tu es maintenant !",
    100: "Notre lien est créé, unique comme toi !"
  }
};

// Helper pour obtenir le message approprié
export function getOnboardingMessage(screen, persona, key, data = {}) {
  const screenMessages = ONBOARDING_MESSAGES[screen];
  if (!screenMessages) return null;

  // Cas spécial pour 250-rencontre (journey-based)
  if (screen === '250-rencontre' && screenMessages.journey) {
    return screenMessages.journey[data.journeyChoice] || screenMessages.journey.body_disconnect;
  }

  // Messages par persona
  const personaMessages = screenMessages[persona] || screenMessages.default;
  if (!personaMessages) return null;

  const message = personaMessages[key];
  
  // Si c'est une fonction (comme preview), l'appeler avec les données
  if (typeof message === 'function') {
    return message(data);
  }

  // Remplacer les variables dans le message
  if (typeof message === 'string' && data) {
    return message.replace(/\${(\w+)}/g, (match, key) => data[key] || match);
  }

  return message;
}