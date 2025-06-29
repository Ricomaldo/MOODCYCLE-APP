//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useTerminology.js
// 🧩 Type: Hook Terminologie
// 📚 Description: Hook pour gestion terminologies cycliques utilisateur
// 🎯 Mission: Interface entre mapping terminologique et préférences user
// 🕒 Version: 1.0 - 2025-06-28 - Architecture additive stricte
// 🧭 Used in: CycleView, phases components, UI affichage
// ─────────────────────────────────────────────────────────
//

import { useCallback, useMemo } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { 
  getPhaseLabel, 
  getAvailableTerminologies, 
  isValidTerminology,
  getTerminologyLabels,
  getTerminologyMetadata,
  TERMINOLOGY_MAPPINGS 
} from '../config/terminologyMappings';

/**
 * 🎯 Hook principal pour gestion terminologies
 * @returns {object} Interface terminologie complète
 */
export const useTerminology = () => {
  // ✅ Récupération préférence avec fallback sécurisé
  const terminology = useUserStore(state => state.preferences?.terminology || 'medical');
  const updatePreferences = useUserStore(state => state.updatePreferences);

  // ✅ Fonction getPhaseLabel mémorisée avec terminologie courante
  const getPhaseDisplayLabel = useCallback((phaseKey, type = 'phases') => {
    return getPhaseLabel(phaseKey, terminology, type);
  }, [terminology]);

  // ✅ Setter terminologie avec validation
  const setTerminology = useCallback((newTerminology) => {
    if (isValidTerminology(newTerminology)) {
      updatePreferences({ terminology: newTerminology });
    } else {
      console.warn(`Terminologie invalide: ${newTerminology}. Fallback vers 'medical'.`);
      updatePreferences({ terminology: 'medical' });
    }
  }, [updatePreferences]);

  // ✅ Métadonnées courantes mémorisées
  const currentMetadata = useMemo(() => {
    return getTerminologyMetadata(terminology);
  }, [terminology]);

  // ✅ Labels terminologie courante mémorisés
  const currentLabels = useMemo(() => {
    return getTerminologyLabels(terminology);
  }, [terminology]);

  // ✅ Liste complète des phases avec labels actuels
  const allPhasesLabeled = useMemo(() => {
    const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
    return phases.map(phaseKey => ({
      key: phaseKey,
      label: getPhaseDisplayLabel(phaseKey, 'phases'),
      archetype: getPhaseDisplayLabel(phaseKey, 'archetype')
    }));
  }, [getPhaseDisplayLabel]);

  return {
    // État terminologie courante
    terminology,
    isValid: isValidTerminology(terminology),
    metadata: currentMetadata,
    labels: currentLabels,

    // Fonctions d'affichage
    getPhaseLabel: getPhaseDisplayLabel,
    getArchetypeLabel: useCallback((phaseKey) => {
      return getPhaseDisplayLabel(phaseKey, 'archetype');
    }, [getPhaseDisplayLabel]),

    // Gestion terminologies
    setTerminology,
    availableTerminologies: getAvailableTerminologies(),
    allPhasesLabeled,

    // Helpers utilitaires
    isTerminology: useCallback((checkTerminology) => {
      return terminology === checkTerminology;
    }, [terminology]),

    // Migration helper pour composants existants
    replacePhaseDisplayName: useCallback((phase) => {
      // Remplace l'ancienne fonction getPhaseDisplayName
      return getPhaseDisplayLabel(phase, 'archetype');
    }, [getPhaseDisplayLabel])
  };
};

/**
 * 🔧 Hook léger pour récupération rapide de labels
 * @param {string} phaseKey - Clé phase technique
 * @param {string} type - Type label (phases/archetype)
 * @returns {string} Label formaté
 */
export const usePhaseLabel = (phaseKey, type = 'phases') => {
  const { getPhaseLabel } = useTerminology();
  return useMemo(() => {
    return getPhaseLabel(phaseKey, type);
  }, [getPhaseLabel, phaseKey, type]);
};

/**
 * 🎨 Hook pour sélecteur terminologies (pour UI settings)
 * @returns {object} Props pour composant sélecteur
 */
export const useTerminologySelector = () => {
  const { 
    terminology, 
    setTerminology, 
    availableTerminologies 
  } = useTerminology();

  const terminologyOptions = useMemo(() => {
    return availableTerminologies.map(key => ({
      key,
      ...getTerminologyMetadata(key),
      selected: key === terminology
    }));
  }, [availableTerminologies, terminology]);

  return {
    currentTerminology: terminology,
    options: terminologyOptions,
    onSelect: setTerminology
  };
};

// ═══════════════════════════════════════════════════════
// 🔄 MIGRATION HELPERS LEGACY
// ═══════════════════════════════════════════════════════

/**
 * Helper de migration pour remplacer getPhaseDisplayName existant
 * @param {string} phase - Clé phase
 * @returns {string} Label archetype
 * @deprecated Utiliser useTerminology().getArchetypeLabel() à la place
 */
export const migrateGetPhaseDisplayName = (phase) => {
  console.warn('migrateGetPhaseDisplayName est deprecated. Utiliser useTerminology().getArchetypeLabel()');
  return getPhaseLabel(phase, 'medical', 'archetype');
}; 