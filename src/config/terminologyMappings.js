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

export const getPhaseLabel = (phaseKey, terminology = 'medical', type = 'phases') => {
  // ✅ Triple fallback pour robustesse maximale
  return TERMINOLOGY_MAPPINGS[terminology]?.[type]?.[phaseKey] || 
         TERMINOLOGY_MAPPINGS.medical[type][phaseKey] || 
         phaseKey;
};

// ═══════════════════════════════════════════════════════
// 🔧 HELPERS UTILITAIRES
// ═══════════════════════════════════════════════════════

export const getAvailableTerminologies = () => {
  return Object.keys(TERMINOLOGY_MAPPINGS);
};

export const isValidTerminology = (terminology) => {
  return terminology && TERMINOLOGY_MAPPINGS.hasOwnProperty(terminology);
};

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

export const getTerminologyMetadata = (terminology) => {
  return TERMINOLOGY_METADATA[terminology] || TERMINOLOGY_METADATA.medical;
};
