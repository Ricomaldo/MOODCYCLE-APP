//
// ─────────────────────────────────────────────────────────
// 📄 File: src/config/terminologyMappings.js
// 🧩 Type: Configuration Terminologies
// 📚 Description: Mapping dynamique des 4 terminologies cycliques
// 🎯 Mission: Permettre changement affichage sans toucher logique technique
// 🕒 Version: 1.0 - 2025-06-28 - Architecture additive stricte
// 🧭 Used in: useTerminology hook, CycleView, phases display
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════
// 🌙 MAPPING TERMINOLOGIES CYCLIQUES
// ═══════════════════════════════════════════════════════

export const TERMINOLOGY_MAPPINGS = {
  medical: {
    phases: {
      menstrual: "Phase menstruelle",
      follicular: "Phase folliculaire", 
      ovulatory: "Phase ovulatoire",
      luteal: "Phase lutéale"
    },
    archetype: {
      menstrual: "Menstruelle",
      follicular: "Folliculaire",
      ovulatory: "Ovulatoire", 
      luteal: "Lutéale"
    }
  },
  spiritual: {
    phases: {
      menstrual: "La Sorcière",
      follicular: "La Jeune Fille",
      ovulatory: "La Mère",
      luteal: "L'Enchanteresse"
    },
    archetype: {
      menstrual: "Sorcière",
      follicular: "Jeune Fille", 
      ovulatory: "Mère",
      luteal: "Enchanteresse"
    }
  },
  energetic: {
    phases: {
      menstrual: "Phase d'Introspection",
      follicular: "Phase de Renaissance",
      ovulatory: "Phase de Rayonnement", 
      luteal: "Phase de Transformation"
    },
    archetype: {
      menstrual: "Introspection",
      follicular: "Renaissance",
      ovulatory: "Rayonnement",
      luteal: "Transformation"
    }
  },
  modern: {
    phases: {
      menstrual: "Phase de Pause",
      follicular: "Phase de Création", 
      ovulatory: "Phase d'Expression",
      luteal: "Phase de Réflexion"
    },
    archetype: {
      menstrual: "Pause",
      follicular: "Création",
      ovulatory: "Expression", 
      luteal: "Réflexion"
    }
  }
};

// ═══════════════════════════════════════════════════════
// 🎯 FONCTION HELPER PRINCIPALE
// ═══════════════════════════════════════════════════════

/**
 * Récupère le label d'affichage d'une phase selon la terminologie
 * @param {string} phaseKey - Clé technique phase (menstrual, follicular, ovulatory, luteal)
 * @param {string} terminology - Terminologie choisie (medical, spiritual, energetic, modern)
 * @param {string} type - Type de label (phases, archetype)
 * @returns {string} Label d'affichage ou fallback
 */
export const getPhaseLabel = (phaseKey, terminology = 'medical', type = 'phases') => {
  // ✅ Triple fallback pour robustesse maximale
  return TERMINOLOGY_MAPPINGS[terminology]?.[type]?.[phaseKey] || 
         TERMINOLOGY_MAPPINGS.medical[type][phaseKey] || 
         phaseKey;
};

// ═══════════════════════════════════════════════════════
// 🔧 HELPERS UTILITAIRES
// ═══════════════════════════════════════════════════════

/**
 * Récupère toutes les terminologies disponibles
 * @returns {string[]} Liste des clés terminologies
 */
export const getAvailableTerminologies = () => {
  return Object.keys(TERMINOLOGY_MAPPINGS);
};

/**
 * Vérifie si une terminologie existe
 * @param {string} terminology - Terminologie à vérifier
 * @returns {boolean} True si existe
 */
export const isValidTerminology = (terminology) => {
  return terminology && TERMINOLOGY_MAPPINGS.hasOwnProperty(terminology);
};

/**
 * Récupère les labels d'une terminologie complète
 * @param {string} terminology - Terminologie demandée
 * @returns {object} Objet avec phases et archétypes ou null
 */
export const getTerminologyLabels = (terminology) => {
  if (!isValidTerminology(terminology)) {
    return null;
  }
  return TERMINOLOGY_MAPPINGS[terminology];
};

// ═══════════════════════════════════════════════════════
// 📋 MÉTADONNÉES TERMINOLOGIES
// ═══════════════════════════════════════════════════════

export const TERMINOLOGY_METADATA = {
  medical: {
    name: "Médical",
    description: "Terminologie médicale classique",
    icon: "⚕️",
    color: "#2563EB"
  },
  spiritual: {
    name: "Spirituel",
    description: "Archétypes féminins sacrés",
    icon: "🌙", 
    color: "#7C3AED"
  },
  energetic: {
    name: "Énergétique",
    description: "Approche énergétique cyclique",
    icon: "✨",
    color: "#059669"
  },
  modern: {
    name: "Moderne",
    description: "Vision contemporaine équilibrée", 
    icon: "🌟",
    color: "#DC2626"
  }
};

/**
 * Récupère les métadonnées d'une terminologie
 * @param {string} terminology - Terminologie demandée  
 * @returns {object} Métadonnées ou fallback medical
 */
export const getTerminologyMetadata = (terminology) => {
  return TERMINOLOGY_METADATA[terminology] || TERMINOLOGY_METADATA.medical;
};
