//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/__mocks__/api.js
// 🧩 Type : Mocks Réutilisables
// 📚 Description : Mocks API ChatService & ContentManager réutilisables pour tests
// 🕒 Version : 1.0 - 2025-06-25
// 🧭 Utilisé dans : tests nécessitant API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

export const captureRef = jest.fn(() => 
  Promise.resolve('/tmp/mock-screenshot-12345.png')
);

export const releaseCapture = jest.fn();

export const captureScreen = jest.fn(() => 
  Promise.resolve('/tmp/mock-screen-67890.png')
);

// Component ViewShot mock
export default class ViewShot {
  static captureRef = captureRef;
  static releaseCapture = releaseCapture;
  
  render() {
    return this.props.children;
  }
}

