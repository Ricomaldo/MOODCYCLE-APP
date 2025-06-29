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

// Mock du nouveau store cycle
jest.mock('./src/stores/useCycleStore', () => ({
  useCycleStore: jest.fn(() => ({
    lastPeriodDate: '2024-01-01T00:00:00.000Z',
    length: 28,
    periodDuration: 5,
    isRegular: true,
    trackingExperience: 'basic',
    startNewCycle: jest.fn(),
    endPeriod: jest.fn(),
    updateCycle: jest.fn(),
    resetCycle: jest.fn(),
  })),
  getCycleData: jest.fn(() => ({
    lastPeriodDate: '2024-01-01T00:00:00.000Z',
    length: 28,
    periodDuration: 5,
    isRegular: true,
    trackingExperience: 'basic',
    currentPhase: 'follicular',
    currentDay: 8,
    phaseInfo: {
      name: 'Folliculaire',
      description: 'Phase de renouveau',
      color: '#4CAF50'
    },
    hasData: true,
    nextPeriodDate: '2024-01-29T00:00:00.000Z',
    daysUntilNextPeriod: 18
  })),
  getCurrentPhaseFromStore: jest.fn(() => 'follicular'),
  getCurrentDayFromStore: jest.fn(() => 8),
}));

// Supprimer les anciennes propriétés cycle du mock useUserStore
const originalUserStoreMock = jest.requireActual('./src/stores/useUserStore');
jest.mock('./src/stores/useUserStore', () => ({
  useUserStore: jest.fn(() => ({
    profile: { prenom: 'Emma', age: 28 },
    preferences: { theme: 'auto', notifications: true },
    persona: { assigned: 'explorer', confidence: 0.8 },
    melune: { style: 'classic', unlocked: ['coach', 'sage'] },
    onboarding: { completed: false, currentStep: 'welcome' },
    updateProfile: jest.fn(),
    updatePreferences: jest.fn(),
    setPersona: jest.fn(),
    updateMelune: jest.fn(),
    completeOnboarding: jest.fn(),
    reset: jest.fn(),
    getContextForAPI: jest.fn(() => ({
      persona: 'explorer',
      preferences: { theme: 'auto' },
      profile: { prenom: 'Emma' },
    })),
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

// ✅ Mock pour react-native-view-shot
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve('mock-screenshot-uri')),
  releaseCapture: jest.fn(),
  captureScreen: jest.fn(() => Promise.resolve('mock-screen-uri')),
}));