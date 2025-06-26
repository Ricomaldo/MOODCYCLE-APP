//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/__mocks__/reactNativeViewShot.js
// 🧩 Type : Mock Jest
// 📚 Description : Mock pour react-native-view-shot
// 🕒 Version : 1.0 - 2025-06-26
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