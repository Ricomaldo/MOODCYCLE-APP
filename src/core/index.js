//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/index.js
// 🧩 Type: Core Export Hub  
// 📚 Description: Hub centralisé pour core/ui + core/layout
// 🕒 Version: 7.0 - 2025-06-21
// 🧭 Used in: Toute l'application
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════
// 🧩 UI COMPONENTS (ANIMATIONS ONLY V8.0)
// ═══════════════════════════════════════════════════════
export * from './ui';

// ═══════════════════════════════════════════════════════
// 🏗️ LAYOUT COMPONENTS  
// ═══════════════════════════════════════════════════════
export { default as ScreenContainer } from './layout/ScreenContainer';
export { default as FloatingMelune } from './layout/FloatingMelune';
export { 
  CycleHeader, 
  ConseilsHeader, 
  NotebookHeader 
} from './layout/SimpleHeader';

// ═══════════════════════════════════════════════════════
// ⚙️ SETTINGS COMPONENTS
// ═══════════════════════════════════════════════════════
export { default as ParametresButton } from './settings/ParametresButton';
export { default as ParametresModal } from './settings/ParametresModal';
export { default as ThemeSelector } from './settings/ThemeSelector';

// ═══════════════════════════════════════════════════════
// 🛠️ DEV TOOLS
// ═══════════════════════════════════════════════════════
export * from './dev'; 