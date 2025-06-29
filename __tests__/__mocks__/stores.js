//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/__mocks__/stores.js
// 🧩 Type : Mocks Réutilisables
// 📚 Description : Mocks stores Zustand standardisés pour tous les tests
// 🕒 Version : 1.0 - 2025-06-25
// 🧭 Utilisé dans : tous les tests nécessitant stores
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

export const mockUserData = {
  persona: { assigned: 'emma' },
  preferences: { 
    symptoms: 5, 
    moods: 4, 
    phyto: 2,
    phases: 3,
    rituals: 1
  },
  profile: { prenom: 'Sarah' },
  cycle: { 
    lastPeriodDate: new Date().toISOString(), 
    length: 28,
    periodDuration: 5
  },
  melune: { tone: 'friendly' }
};

export const mockIntelligence = {
  learning: {
    confidence: 45,
    timePatterns: { favoriteHours: [9, 14, 20] },
    phasePatterns: {
      menstrual: { topics: ['repos'], mood: 'challenging' },
      follicular: { topics: ['energie'], mood: 'positive' }
    },
    suggestionEffectiveness: {
      chat: { rate: 0.4, shown: 10, clicked: 4 },
      notebook: { rate: 0.3, shown: 5, clicked: 1 },
      phase_detail: { rate: 0.6, shown: 8, clicked: 5 }
    },
    conversationCount: 12
  },
  getPersonalizedPrompts: jest.fn().mockReturnValue({
    successfulPrompts: ["Comment te sens-tu ?"]
  }),
  trackSuggestionShown: jest.fn(),
  trackSuggestionClicked: jest.fn(),
  trackInteraction: jest.fn(),
  // ✅ AJOUT MÉTHODES MANQUANTES
  getOptimalInteractionTime: jest.fn().mockReturnValue({
    isOptimalNow: false,
    nextOptimal: null
  }),
  getPhasePersonalization: jest.fn().mockReturnValue({
    predictedMood: 'positive'
  })
};

export const mockChatStore = {
  messages: [],
  addMessage: jest.fn(),
  setTyping: jest.fn(),
  setWaitingResponse: jest.fn(),
  getConversationContext: jest.fn().mockReturnValue([]),
  getMessagesCount: jest.fn().mockReturnValue({ total: 0, user: 0, melune: 0 })
};

export const mockNotebookStore = {
  entries: [],
  addEntry: jest.fn(),
  updateEntry: jest.fn(),
  deleteEntry: jest.fn()
};

export const mockEngagementStore = {
  metrics: {
    daysUsed: 5, 
    vignetteEngagements: 3,
    conversationsStarted: 3,
    conversationsCompleted: 2,
    notebookEntriesCreated: 4,
    insightsSaved: 2,
    cyclesCompleted: 0,
    autonomySignals: 1,
    phasesExplored: ['menstrual', 'follicular']
  },
  maturity: { current: 'learning', confidence: 75 },
  trackAction: jest.fn(),
  getEngagementLevel: jest.fn().mockReturnValue('medium'),
  getPatterns: jest.fn().mockReturnValue({}),
  // ✅ FONCTIONS MANQUANTES POUR useAdaptiveInterface
  getEngagementScore: jest.fn().mockReturnValue(68),
  getNextMilestone: jest.fn().mockReturnValue({
    name: 'Explorer',
    missing: { days: 2, conversations: 1, entries: 0 }
  }),
  getNextSteps: jest.fn().mockReturnValue([
    { action: 'explore', priority: 'high', context: 'cycle_tracking' }
  ])
};

export const mockCycleStore = {
  lastPeriodDate: new Date().toISOString(),
  length: 28,
  periodDuration: 5,
  isRegular: true,
  trackingExperience: 'basic',
  startNewCycle: jest.fn(),
  endPeriod: jest.fn(),
  updateCycle: jest.fn(),
  resetCycle: jest.fn(),
};

export const mockCycleData = {
  lastPeriodDate: new Date().toISOString(),
  length: 28,
  periodDuration: 5,
  isRegular: true,
  trackingExperience: 'basic',
  currentPhase: 'follicular',
  currentDay: 8,
  phaseInfo: {
    name: 'Folliculaire',
    description: 'Phase de renouveau',
    color: '#4CAF50',
    emoji: '🌱'
  },
  hasData: true,
  nextPeriodDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  daysUntilNextPeriod: 20
};