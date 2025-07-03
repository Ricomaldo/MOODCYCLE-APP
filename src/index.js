//
// ─────────────────────────────────────────────────────────
// 📄 File: src/index.js
// 🧩 Type: Main Export Hub  
// 📚 Description: Hub principal pour tous les exports src/
// 🕒 Version: 7.0 - 2025-06-21
// 🧭 Used in: Imports externes vers src/
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════
// 🧩 CORE (UI + Layout + Settings)
// ═══════════════════════════════════════════════════════
export * from './core';

// ═══════════════════════════════════════════════════════
// 🎨 THEME SYSTEM
// ═══════════════════════════════════════════════════════
export * from './config/theme';

// ═══════════════════════════════════════════════════════
// 🪝 HOOKS
// ═══════════════════════════════════════════════════════
export { useTheme } from './hooks/useTheme';
export { usePersona } from './hooks/usePersona';
export { useTerminology } from './hooks/useTerminology';
export { useAdaptiveInterface } from './hooks/useAdaptiveInterface';
export { useVignettes } from './hooks/useVignettes';
export { usePersonalizedInsight } from './hooks/usePersonalizedInsight';
export { useQuickObservation } from './hooks/useQuickObservation';
export { useSmartSuggestions } from './hooks/useSmartSuggestions';

// ═══════════════════════════════════════════════════════
// 🗃️ STORES
// ═══════════════════════════════════════════════════════
export { useAppStore } from './stores/useAppStore';
export { useChatStore } from './stores/useChatStore';
export { useCycleStore } from './stores/useCycleStore';
export { useEngagementStore } from './stores/useEngagementStore';
export { useNavigationStore } from './stores/useNavigationStore';
export { useNotebookStore } from './stores/useNotebookStore';
export { useUserStore } from './stores/useUserStore';
export { useUserIntelligence } from './stores/useUserIntelligence';

// ═══════════════════════════════════════════════════════
// 🔧 UTILS
// ═══════════════════════════════════════════════════════
export * from './utils';

// ═══════════════════════════════════════════════════════
// 🎯 FEATURES (Sélection)
// ═══════════════════════════════════════════════════════
export { default as MeluneAvatar } from './features/shared/MeluneAvatar';
export { default as ChatModal } from './features/chat/ChatModal';
export { default as VignetteCard } from './features/insights/VignetteCard';
export { default as InsightCard } from './features/insights/InsightCard'; 