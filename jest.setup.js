// jest.setup.js
import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => require('./__tests__/__mocks__/expoVectorIcons'));

// Mock expo-router
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn((callback) => {
    const cleanup = callback();
    return cleanup || (() => {});
  }),
  useLocalSearchParams: () => ({}),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

// Mock performance.memory pour les tests
global.performance = global.performance || {};
global.performance.memory = {
  usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  totalJSHeapSize: 100 * 1024 * 1024, // 100MB
  jsHeapSizeLimit: 500 * 1024 * 1024, // 500MB
};

// Mock performance.now
global.performance.now = jest.fn(() => Date.now());

// Mock du store cycle avec le mock du fichier stores.js
jest.mock('./src/stores/useCycleStore', () => {
  const mockStore = require('./__tests__/__mocks__/stores').mockCycleStore;
  return {
    useCycleStore: jest.fn((selector) => {
      // Si pas de selector, retourner le store complet
      if (!selector) return mockStore;
      // Si selector, l'appliquer au mockStore
      return selector(mockStore);
    }),
    getCycleData: jest.fn(() => ({
      currentPhase: 'menstrual',
      phaseInfo: { name: 'Menstruelle' },
      currentDay: 2,
      hasData: true,
      cycle: { length: 28 }
    }))
  };
});

// Mock useUserStore avec toutes les méthodes nécessaires
jest.mock('./src/stores/useUserStore', () => ({
  useUserStore: require('./__tests__/__mocks__/stores').mockUserData.useUserStore
}));

// Mock useNotebookStore avec le mock du fichier stores.js
jest.mock('./src/stores/useNotebookStore', () => {
  const mockStore = require('./__tests__/__mocks__/stores').mockNotebookStore;
  return {
    useNotebookStore: () => mockStore
  };
});

// Mock useNavigationStore avec le mock du fichier stores.js
jest.mock('./src/stores/useNavigationStore', () => {
  const mockStore = require('./__tests__/__mocks__/stores').mockNavigationStore;
  return {
    useNavigationStore: () => mockStore
  };
});

// Mock useEngagementStore avec le mock du fichier stores.js
jest.mock('./src/stores/useEngagementStore', () => {
  const mockStore = require('./__tests__/__mocks__/stores').mockEngagementStore;
  const mockHook = () => mockStore;
  mockHook.getState = () => mockStore;
  return {
    useEngagementStore: mockHook
  };
});

// Mock useChatStore avec le mock du fichier stores.js
jest.mock('./src/stores/useChatStore', () => {
  const mockStore = require('./__tests__/__mocks__/stores').mockChatStore;
  return {
    useChatStore: () => mockStore
  };
});

// ✅ Mock pour react-native-view-shot
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve('mock-screenshot-uri')),
  releaseCapture: jest.fn(),
  captureScreen: jest.fn(() => Promise.resolve('mock-screen-uri')),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => ({
    isInternetReachable: true,
    isConnected: true,
    type: 'wifi',
    details: {},
  }),
  fetch: jest.fn(() => Promise.resolve({
    isInternetReachable: true,
    isConnected: true,
    type: 'wifi',
    details: {},
  })),
}));

// Mock InsightsEngine
jest.mock('./src/services/InsightsEngine', () => ({
  getPersonalizedInsight: jest.fn((context, options) => {
    // Simuler un délai plus long pour permettre l'annulation
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Vérifier si la requête a été annulée avant de résoudre
        if (options?.signal?.aborted) {
          reject(new Error('AbortError'));
          return;
        }
        
        resolve({
          id: 'insight-1',
          content: 'Insight de base personnalisé',
          source: 'test',
          relevanceScore: 85,
          tone: 'friendly',
          jezaApproval: 0.9,
        });
      }, 50); // Délai plus long pour permettre l'annulation

      // Vérifier si la requête a été annulée
      if (options?.signal) {
        options.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('AbortError'));
        });
      }
    });
  }),
  refreshInsightsCache: jest.fn(),
}));

// Mock console pour nettoyer les logs
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};