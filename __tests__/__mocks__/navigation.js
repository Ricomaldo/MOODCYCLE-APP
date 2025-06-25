//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/__mocks__/navigation.js
// 🧩 Type : Mocks Réutilisables
// 📚 Description : Mocks navigation Expo Router réutilisables pour tests
// 🕒 Version : 1.0 - 2025-06-25
// 🧭 Utilisé dans : tests nécessitant navigation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

export const mockNavigation = {
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
      replace: jest.fn()
    })
  };