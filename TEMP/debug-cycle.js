// ═══════════════════════════════════════════════════════════
// 🐛 DEBUG SCRIPT - Traquer l'erreur 'length' of undefined
// ═══════════════════════════════════════════════════════════

// Ce script ajoute des logs de debug dans useCycle pour identifier
// exactement où se produit l'erreur "Cannot read property 'length' of undefined"

console.log('🔍 Debug script loaded');

// Override console.log temporairement pour capturer toutes les erreurs
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  originalConsoleLog('[DEBUG]', ...args);
};

console.error = (...args) => {
  originalConsoleError('[ERROR]', ...args);
  // Si c'est notre erreur spécifique, afficher la stack trace
  if (args.some(arg => String(arg).includes('Cannot read property \'length\' of undefined'))) {
    originalConsoleError('[STACK TRACE]', new Error().stack);
  }
};

export default {
  log: console.log,
  error: console.error
}; 