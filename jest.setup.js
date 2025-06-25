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

// Mock stores pour les tests
jest.mock('./src/stores/useUserStore', () => ({
  useUserStore: jest.fn(() => ({
    cycle: {
      lastPeriodDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      length: 28,
      periodDuration: 5,
    },
    updateCycle: jest.fn(),
    profile: { prenom: 'Test' },
    persona: { assigned: 'emma' },
  })),
}));

jest.mock('./src/stores/useNotebookStore', () => ({
  useNotebookStore: jest.fn(() => ({
    entries: [],
    getEntriesGroupedByDate: jest.fn(() => ({})),
  })),
}));

jest.mock('./src/stores/useNavigationStore', () => ({
  useNavigationStore: jest.fn(() => ({
    notebookFilters: { type: 'all', phase: null, tags: [] },
    setNotebookFilter: jest.fn(),
    toggleTag: jest.fn(),
    trackVignetteClick: jest.fn(),
  })),
}));