//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/__mocks__/asyncStorage.js
// 🧩 Type : Mock AsyncStorage
// 📚 Description : Mock AsyncStorage pour Jest (contourne module natif)
// 🕒 Version : 1.0 - 2025-06-25
// 🧭 Utilisé dans : jest moduleNameMapping
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

const AsyncStorageMock = {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  };
  
  export default AsyncStorageMock;