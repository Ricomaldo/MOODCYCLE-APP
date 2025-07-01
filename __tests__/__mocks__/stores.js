//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/__mocks__/stores.js
// 🧩 Type : Mocks Réutilisables
// 📚 Description : Mocks stores Zustand standardisés pour tous les tests
// 🕒 Version : 1.0 - 2025-06-25
// 🧭 Utilisé dans : tous les tests nécessitant stores
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

// État mutable pour le mock
let mockState = {
  profile: {
    prenom: 'Sarah',
    ageRange: '26-35', 
    journeyChoice: 'body',
    completed: true,
  },
  preferences: {
    symptoms: 5, moods: 4, phyto: 2, phases: 3,
    lithotherapy: 3, rituals: 1, terminology: 'medical',
  },
  persona: {
    assigned: 'emma', confidence: 0.8,
    lastCalculated: Date.now(), scores: {},
  },
  melune: {
    avatarStyle: 'classic', tone: 'friendly',
    personalityMatch: null, position: 'bottom-right', animated: true,
  },
  syncMetadata: { lastSyncAt: null, pendingSync: false },
};

export const mockUserData = {
  useUserStore: jest.fn(() => {
    // Retourne toujours l'état actuel avec des getters
    return {
      get profile() { return mockState.profile; },
      get preferences() { return mockState.preferences; },
      get persona() { return mockState.persona; },
      get melune() { return mockState.melune; },
      get syncMetadata() { return mockState.syncMetadata; },
      
      // Méthodes qui modifient l'état
      updateProfile: jest.fn((data) => {
        mockState.profile = { ...mockState.profile, ...data };
      }),
      updatePreferences: jest.fn((data) => {
        mockState.preferences = { ...mockState.preferences, ...data };
      }),
      updateMelune: jest.fn((data) => {
        mockState.melune = { ...mockState.melune, ...data };
      }),
      updateSyncMetadata: jest.fn((data) => {
        mockState.syncMetadata = { ...mockState.syncMetadata, ...data };
      }),
      completeProfile: jest.fn(),
      calculatePersona: jest.fn(() => {
        mockState.persona.assigned = 'laure';
        mockState.persona.confidence = 0.85;
        return 'laure';
      }),
      setPersona: jest.fn((persona, confidence) => {
        mockState.persona.assigned = persona;
        mockState.persona.confidence = confidence;
      }),
      getContextForAPI: jest.fn(() => ({
        persona: mockState.persona.assigned,
        preferences: mockState.preferences,
        profile: mockState.profile,
      })),
      hasMinimumData: jest.fn(() => {
        return !!(mockState.profile.ageRange && mockState.profile.journeyChoice);
      }),
      reset: jest.fn(() => {
        mockState = {
          profile: { prenom: null, ageRange: null, journeyChoice: null, completed: false },
          preferences: { symptoms: 3, moods: 3, phyto: 2, phases: 3, lithotherapy: 3, rituals: 1, terminology: 'medical' },
          persona: { assigned: null, confidence: 0, lastCalculated: null, scores: {} },
          melune: { avatarStyle: 'classic', tone: 'friendly', personalityMatch: null, position: 'bottom-right', animated: true },
          syncMetadata: { lastSyncAt: null, pendingSync: false },
        };
      }),
    };
  })
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

// État mutable pour le mock chat store
let mockChatState = {
  messages: [],
  isTyping: false,
  isWaitingResponse: false,
  pendingMessages: [],
  suggestions: [
    "Comment je me sens aujourd'hui ?",
    "Conseils pour ma phase actuelle",
    "Aide-moi à comprendre mon cycle",
    "Rituels de bien-être",
  ],
};

export const mockChatStore = {
  // Getters pour toujours retourner l'état actuel
  get messages() { return mockChatState.messages; },
  get isTyping() { return mockChatState.isTyping; },
  get isWaitingResponse() { return mockChatState.isWaitingResponse; },
  get pendingMessages() { return mockChatState.pendingMessages; },
  get suggestions() { return mockChatState.suggestions; },
  
  // Méthodes qui modifient l'état
  addMessage: jest.fn((type, content, metadata = {}) => {
    const id = Date.now().toString();
    const message = {
      id,
      type,
      content,
      timestamp: Date.now(),
      ...metadata
    };
    
    mockChatState.messages.push(message);
    
    // Limiter à 100 messages
    if (mockChatState.messages.length > 100) {
      mockChatState.messages = mockChatState.messages.slice(-100);
    }
    
    return id;
  }),
  
  addUserMessage: jest.fn((content, metadata = {}) => {
    return mockChatStore.addMessage('user', content, metadata);
  }),
  
  addMeluneMessage: jest.fn((content, metadata = {}) => {
    return mockChatStore.addMessage('melune', content, { isOffline: false, ...metadata });
  }),
  
  setTyping: jest.fn((isTyping) => {
    mockChatState.isTyping = isTyping;
  }),
  
  setWaitingResponse: jest.fn((isWaiting) => {
    mockChatState.isWaitingResponse = isWaiting;
  }),
  
  addPendingMessage: jest.fn((content, metadata = {}) => {
    const id = `pending-${Date.now()}-${Math.random()}`;
    const pendingMessage = {
      id,
      type: 'user',
      content,
      timestamp: Date.now(),
      status: 'pending',
      ...metadata
    };
    
    mockChatState.pendingMessages.push(pendingMessage);
    return id;
  }),
  
  markMessageSent: jest.fn((pendingId) => {
    mockChatState.pendingMessages = mockChatState.pendingMessages.filter(msg => msg.id !== pendingId);
  }),
  
  clearMessages: jest.fn(() => {
    mockChatState.messages = [];
    mockChatState.pendingMessages = [];
    mockChatState.isTyping = false;
    mockChatState.isWaitingResponse = false;
  }),
  
  getLastMessages: jest.fn((count) => {
    return mockChatState.messages.slice(-count);
  }),
  
  getMessagesByType: jest.fn((type) => {
    return mockChatState.messages.filter(msg => msg.type === type);
  }),
  
  getMessagesCount: jest.fn(() => {
    const userCount = mockChatState.messages.filter(msg => msg.type === 'user').length;
    const meluneCount = mockChatState.messages.filter(msg => msg.type === 'melune').length;
    return {
      total: mockChatState.messages.length,
      user: userCount,
      melune: meluneCount
    };
  }),
  
  updateSuggestions: jest.fn((newSuggestions) => {
    mockChatState.suggestions = newSuggestions;
  }),
  
  getContextualSuggestions: jest.fn(() => {
    const { getCurrentPhase } = require('../../src/utils/cycleCalculations');
    const currentPhase = getCurrentPhase();
    
    const phaseSuggestions = {
      menstrual: [
        "Comment soulager mes douleurs ?",
        "Rituels cocooning règles",
        "Nutrition pendant les règles",
      ],
      follicular: [
        "Énergie et projets",
        "Optimiser cette phase",
        "Nutrition énergisante",
      ],
      ovulatory: [
        "Confiance et communication",
        "Profiter de mon énergie",
        "Social et relations",
      ],
      luteal: [
        "Gérer les émotions",
        "Préparation aux règles",
        "Self-care automne",
      ]
    };
    
    return phaseSuggestions[currentPhase] || mockChatState.suggestions;
  }),
  
  saveMessageToNotebook: jest.fn((messageId) => {
    const message = mockChatState.messages.find(msg => msg.id === messageId);
    if (!message || message.type !== 'melune') {
      return false;
    }
    
    // Mock de sauvegarde dans le notebook
    const { useNotebookStore } = require('../../src/stores/useNotebookStore');
    const { getCurrentPhase } = require('../../src/utils/cycleCalculations');
    const currentPhase = getCurrentPhase();
    
    useNotebookStore.getState().addEntry(
      message.content,
      'saved',
      ['#melune', `#${currentPhase}`]
    );
    
    return true;
  }),
  
  exportConversation: jest.fn(() => {
    return {
      timestamp: new Date().toISOString(),
      messagesCount: mockChatState.messages.length,
      messages: mockChatState.messages.map(({ id, type, content, timestamp }) => ({
        id, type, content, timestamp
      }))
    };
  }),
  
  getConversationContext: jest.fn(() => []),
};

// État mutable pour le mock notebook store
let mockNotebookState = {
  entries: [],
  selectedTags: [],
  searchQuery: '',
  recentlyDeleted: []
};

export const mockNotebookStore = {
  // Getters pour toujours retourner l'état actuel
  get entries() { return mockNotebookState.entries; },
  get selectedTags() { return mockNotebookState.selectedTags; },
  get searchQuery() { return mockNotebookState.searchQuery; },
  get availableTags() { 
    const allTags = new Set();
    mockNotebookState.entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags);
  },
  
  // Méthodes CRUD
  addEntry: jest.fn((content, type = 'personal', tags = []) => {
    const entry = {
      id: Date.now().toString(),
      content,
      type,
      tags,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    mockNotebookState.entries.push(entry);
    return entry.id;
  }),
  
  addQuickTracking: jest.fn((mood, energy, symptoms = []) => {
    const entry = {
      id: Date.now().toString(),
      content: `Humeur: ${mood} • Énergie: ${energy}/5`,
      type: 'tracking',
      mood,
      energy,
      symptoms,
      tags: symptoms.map(s => `#${s}`),
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    mockNotebookState.entries.push(entry);
    return entry.id;
  }),
  
  saveFromChat: jest.fn((content, source = 'melune') => {
    // Générer un tag basé sur le contenu s'il mentionne "Melune"
    const tags = content.toLowerCase().includes('melune') ? ['#melune'] : [`#${source}`];
    
    const entry = {
      id: Date.now().toString(),
      content,
      type: 'saved',
      source,
      tags,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    mockNotebookState.entries.push(entry);
    return entry.id;
  }),
  
  updateEntry: jest.fn((entryId, updates) => {
    const index = mockNotebookState.entries.findIndex(e => e.id === entryId);
    if (index !== -1) {
      mockNotebookState.entries[index] = { ...mockNotebookState.entries[index], ...updates };
    }
  }),
  
  deleteEntry: jest.fn((entryId) => {
    const index = mockNotebookState.entries.findIndex(e => e.id === entryId);
    if (index !== -1) {
      const deleted = mockNotebookState.entries.splice(index, 1)[0];
      mockNotebookState.recentlyDeleted.push(deleted);
    }
  }),
  
  // Méthodes de recherche
  getEntriesGroupedByDate: jest.fn(() => {
    const grouped = {};
    mockNotebookState.entries.forEach(entry => {
      const date = entry.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(entry);
    });
    return grouped;
  }),
  
  getEntriesByTag: jest.fn((tag) => {
    return mockNotebookState.entries.filter(entry => 
      entry.tags && entry.tags.includes(tag)
    );
  }),
  
  getEntriesByType: jest.fn((type) => {
    return mockNotebookState.entries.filter(entry => entry.type === type);
  }),
  
  getPopularTags: jest.fn((limit = 10) => {
    const tagCounts = {};
    mockNotebookState.entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }),
  
  searchEntries: jest.fn((query, filters = {}) => {
    let results = mockNotebookState.entries;
    
    if (query) {
      results = results.filter(entry => 
        entry.content?.toLowerCase().includes(query.toLowerCase()) ||
        entry.title?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (filters.type && filters.type !== 'all') {
      results = results.filter(entry => entry.type === filters.type);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(entry => 
        entry.tags && filters.tags.some(tag => entry.tags.includes(tag))
      );
    }
    
    return results;
  }),
  
  // Méthode de reset
  reset: jest.fn(() => {
    mockNotebookState = {
      entries: [],
      selectedTags: [],
      searchQuery: '',
      recentlyDeleted: []
    };
  })
};

// État mutable pour le mock navigation store
let mockNavigationState = {
  notebookFilters: {
    type: 'all',
    phase: null,
    tags: [],
    searchQuery: '',
    sortBy: 'recent'
  },
  modalState: {
    entryDetail: {
      visible: false,
      entries: [],
      currentIndex: 0
    }
  },
  navigationHistory: {
    tabs: ['cycle', 'notebook', 'conseils'],
    lastTab: 'cycle',
    lastVignetteId: null,
    vignetteClicks: [],
    vignetteInteractions: {},
    sessionStart: Date.now()
  }
};

export const mockNavigationStore = {
  // Getters pour toujours retourner l'état actuel
  get notebookFilters() { return mockNavigationState.notebookFilters; },
  get modalState() { return mockNavigationState.modalState; },
  get navigationHistory() { return mockNavigationState.navigationHistory; },
  
  // Méthodes de filtrage
  setNotebookFilter: jest.fn((key, value) => {
    mockNavigationState.notebookFilters[key] = value;
  }),
  
  setSearchQuery: jest.fn((query) => {
    mockNavigationState.notebookFilters.searchQuery = query;
  }),
  
  toggleTag: jest.fn((tag) => {
    const tags = mockNavigationState.notebookFilters.tags;
    const index = tags.indexOf(tag);
    if (index === -1) {
      tags.push(tag);
    } else {
      tags.splice(index, 1);
    }
  }),
  
  resetFilters: jest.fn(() => {
    mockNavigationState.notebookFilters = {
      type: 'all',
      phase: null,
      tags: [],
      searchQuery: '',
      sortBy: 'recent'
    };
  }),
  
  resetNotebookFilters: jest.fn(() => {
    mockNavigationState.notebookFilters = {
      type: 'all',
      phase: null,
      tags: [],
      searchQuery: '',
      sortBy: 'recent'
    };
  }),
  
  // Méthodes de modal
  openModal: jest.fn((entries, startIndex = 0) => {
    mockNavigationState.modalState.entryDetail = {
      visible: true,
      entries,
      currentIndex: startIndex
    };
  }),
  
  openEntryDetailModal: jest.fn((entries, startIndex = 0) => {
    mockNavigationState.modalState.entryDetail = {
      visible: true,
      entries,
      currentIndex: startIndex
    };
  }),
  
  closeModal: jest.fn(() => {
    mockNavigationState.modalState.entryDetail = {
      visible: false,
      entries: [],
      currentIndex: 0
    };
  }),
  
  closeEntryDetailModal: jest.fn(() => {
    mockNavigationState.modalState.entryDetail = {
      visible: false,
      entries: [],
      currentIndex: 0
    };
  }),
  
  navigateToNext: jest.fn(() => {
    if (mockNavigationState.modalState.entryDetail.currentIndex < mockNavigationState.modalState.entryDetail.entries.length - 1) {
      mockNavigationState.modalState.entryDetail.currentIndex++;
    }
  }),
  
  navigateToPrevious: jest.fn(() => {
    if (mockNavigationState.modalState.entryDetail.currentIndex > 0) {
      mockNavigationState.modalState.entryDetail.currentIndex--;
    }
  }),
  
  navigateModalEntry: jest.fn((direction) => {
    if (direction === 'next') {
      if (mockNavigationState.modalState.entryDetail.currentIndex < mockNavigationState.modalState.entryDetail.entries.length - 1) {
        mockNavigationState.modalState.entryDetail.currentIndex++;
      }
    } else if (direction === 'previous') {
      if (mockNavigationState.modalState.entryDetail.currentIndex > 0) {
        mockNavigationState.modalState.entryDetail.currentIndex--;
      }
    }
  }),
  
  // Méthodes de tracking
  trackTabVisit: jest.fn((tabName) => {
    mockNavigationState.navigationHistory.lastTab = tabName;
    if (!mockNavigationState.navigationHistory.tabs.includes(tabName)) {
      mockNavigationState.navigationHistory.tabs.push(tabName);
    }
  }),
  
  trackVignetteClick: jest.fn((vignetteId, metadata = {}) => {
    mockNavigationState.navigationHistory.lastVignetteId = vignetteId;
    mockNavigationState.navigationHistory.vignetteInteractions[vignetteId] = 
      (mockNavigationState.navigationHistory.vignetteInteractions[vignetteId] || 0) + 1;
    
    mockNavigationState.navigationHistory.vignetteClicks.push({
      id: vignetteId,
      timestamp: Date.now(),
      ...metadata
    });
  }),
  
  // Getters utilitaires
  getCurrentModalEntry: jest.fn(() => {
    const { entries, currentIndex } = mockNavigationState.modalState.entryDetail;
    return entries[currentIndex] || null;
  }),
  
  getActiveFiltersCount: jest.fn(() => {
    const filters = mockNavigationState.notebookFilters;
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.phase) count++;
    if (filters.tags.length > 0) count++;
    if (filters.searchQuery) count++;
    return count;
  }),
  
  // Méthode de reset
  reset: jest.fn(() => {
    mockNavigationState = {
      notebookFilters: {
        type: 'all',
        phase: null,
        tags: [],
        searchQuery: '',
        sortBy: 'recent'
      },
      modalState: {
        entryDetail: {
          visible: false,
          entries: [],
          currentIndex: 0
        }
      },
      navigationHistory: {
        tabs: ['cycle', 'notebook', 'conseils'],
        lastTab: 'cycle',
        lastVignetteId: null,
        vignetteClicks: [],
        vignetteInteractions: {},
        sessionStart: Date.now()
      }
    };
  })
};

// État mutable pour le mock engagement store
let mockEngagementState = {
  metrics: {
    daysUsed: 5,
    sessionsCount: 0,
    totalTimeSpent: 0,
    lastActiveDate: null,
    conversationsStarted: 3,
    conversationsCompleted: 2,
    notebookEntriesCreated: 4,
    cycleTrackedDays: 0,
    insightsSaved: 2,
    vignettesEngaged: 0,
    phasesExplored: ['menstrual', 'follicular'],
    cyclesCompleted: 0,
    autonomySignals: 1,
  },
  maturity: {
    current: 'learning',
    confidence: 75,
    lastCalculated: null,
    thresholds: {
      discovery: { days: 0, conversations: 0, entries: 0 },
      learning: { days: 7, conversations: 3, entries: 2 },
      autonomous: { days: 21, conversations: 10, entries: 8, cycles: 1 }
    }
  }
};

export const mockEngagementStore = {
  // Getters pour toujours retourner l'état actuel
  get metrics() { return mockEngagementState.metrics; },
  set metrics(value) { mockEngagementState.metrics = { ...mockEngagementState.metrics, ...value }; },
  get maturity() { return mockEngagementState.maturity; },
  
  // Méthodes qui modifient l'état
  trackAction: jest.fn((actionType, metadata = {}) => {
    // Pour les tests : simuler un nouveau jour à chaque appel si c'est pour tracker les jours
    if (actionType === 'conversation_started' && metadata?.simulateNewDay !== false) {
      mockEngagementState.metrics.daysUsed += 1;
      mockEngagementState.metrics.sessionsCount += 1;
      mockEngagementState.metrics.lastActiveDate = new Date().toDateString();
    }
    
    // Pour les actions invalides, on incrémente quand même daysUsed mais pas les autres métriques
    if (actionType === 'invalid_action') {
      mockEngagementState.metrics.daysUsed += 1;
      mockEngagementState.metrics.sessionsCount += 1;
      mockEngagementState.metrics.lastActiveDate = new Date().toDateString();
      return; // Ne pas traiter d'autres actions
    }
    
    // Action-specific tracking
    switch (actionType) {
      case 'conversation_started':
        mockEngagementState.metrics.conversationsStarted += 1;
        break;
      case 'conversation_completed':
        mockEngagementState.metrics.conversationsCompleted += 1;
        break;
      case 'notebook_entry':
        mockEngagementState.metrics.notebookEntriesCreated += 1;
        break;
      case 'cycle_day_tracked':
        mockEngagementState.metrics.cycleTrackedDays += 1;
        break;
      case 'insight_saved':
        mockEngagementState.metrics.insightsSaved += 1;
        break;
      case 'vignette_engaged':
        mockEngagementState.metrics.vignettesEngaged += 1;
        break;
      case 'phase_explored':
        if (metadata.phase && typeof metadata.phase === 'string' && !mockEngagementState.metrics.phasesExplored.includes(metadata.phase)) {
          mockEngagementState.metrics.phasesExplored.push(metadata.phase);
        }
        break;
      case 'autonomy_signal':
        mockEngagementState.metrics.autonomySignals += 1;
        break;
    }
  }),
  
  resetEngagement: jest.fn(() => {
    mockEngagementState = {
      metrics: {
        daysUsed: 0,
        sessionsCount: 0,
        totalTimeSpent: 0,
        lastActiveDate: null,
        conversationsStarted: 0,
        conversationsCompleted: 0,
        notebookEntriesCreated: 0,
        cycleTrackedDays: 0,
        insightsSaved: 0,
        vignettesEngaged: 0,
        phasesExplored: [],
        cyclesCompleted: 0,
        autonomySignals: 0,
      },
      maturity: {
        current: 'discovery',
        confidence: 0,
        lastCalculated: null,
        thresholds: {
          discovery: { days: 0, conversations: 0, entries: 0 },
          learning: { days: 7, conversations: 3, entries: 2 },
          autonomous: { days: 21, conversations: 10, entries: 8, cycles: 1 }
        }
      }
    };
  }),
  
  calculateMaturity: jest.fn(() => {
    const { metrics } = mockEngagementState;
    const { thresholds } = mockEngagementState.maturity;
    
    let newLevel = 'discovery';
    let confidence = 0;
    
    // Calcul niveau basé sur seuils
    if (
      metrics.daysUsed >= thresholds.autonomous.days &&
      metrics.conversationsStarted >= thresholds.autonomous.conversations &&
      metrics.notebookEntriesCreated >= thresholds.autonomous.entries &&
      metrics.cyclesCompleted >= thresholds.autonomous.cycles
    ) {
      newLevel = 'autonomous';
      confidence = 70 + metrics.autonomySignals * 10; // Ne pas limiter ici
    } else if (
      metrics.daysUsed >= thresholds.learning.days &&
      metrics.conversationsStarted >= thresholds.learning.conversations &&
      metrics.notebookEntriesCreated >= thresholds.learning.entries
    ) {
      newLevel = 'learning';
      confidence = 40 + (Array.isArray(metrics.phasesExplored) ? metrics.phasesExplored.length : 0) * 15;
    } else {
      newLevel = 'discovery';
      confidence = metrics.daysUsed * 10;
    }
    
    mockEngagementState.maturity.current = newLevel;
    mockEngagementState.maturity.confidence = Math.min(100, confidence); // Limiter seulement dans le store
    mockEngagementState.maturity.lastCalculated = Date.now();
    
    return { level: newLevel, confidence }; // Retourner la valeur non limitée
  }),
  
  getEngagementScore: jest.fn(() => {
    const { metrics } = mockEngagementState;
    
    // Score composite 0-100
    const weights = {
      consistency: metrics.daysUsed * 5,
      depth: metrics.conversationsCompleted * 10,
      breadth: (Array.isArray(metrics.phasesExplored) ? metrics.phasesExplored.length : 0) * 25,
      autonomy: metrics.autonomySignals * 20
    };
    
    const total = Object.values(weights).reduce((sum, val) => sum + val, 0);
    return Math.min(100, Math.round(total / 4));
  }),
  
  getNextMilestone: jest.fn(() => {
    // Recalculer la maturité d'abord pour avoir l'état à jour
    const { metrics, thresholds } = mockEngagementState.maturity;
    
    // Recalcul du niveau actuel basé sur les métriques
    let currentLevel = 'discovery';
    if (
      mockEngagementState.metrics.daysUsed >= thresholds.autonomous.days &&
      mockEngagementState.metrics.conversationsStarted >= thresholds.autonomous.conversations &&
      mockEngagementState.metrics.notebookEntriesCreated >= thresholds.autonomous.entries &&
      mockEngagementState.metrics.cyclesCompleted >= thresholds.autonomous.cycles
    ) {
      currentLevel = 'autonomous';
    } else if (
      mockEngagementState.metrics.daysUsed >= thresholds.learning.days &&
      mockEngagementState.metrics.conversationsStarted >= thresholds.learning.conversations &&
      mockEngagementState.metrics.notebookEntriesCreated >= thresholds.learning.entries
    ) {
      currentLevel = 'learning';
    }
    
    if (currentLevel === 'autonomous') return null;
    
    const nextThresholds = thresholds[
      currentLevel === 'discovery' ? 'learning' : 'autonomous'
    ];
    
    return {
      level: currentLevel === 'discovery' ? 'learning' : 'autonomous',
      missing: {
        days: Math.max(0, nextThresholds.days - mockEngagementState.metrics.daysUsed),
        conversations: Math.max(0, nextThresholds.conversations - mockEngagementState.metrics.conversationsStarted),
        entries: Math.max(0, nextThresholds.entries - mockEngagementState.metrics.notebookEntriesCreated),
        cycles: nextThresholds.cycles ? Math.max(0, nextThresholds.cycles - mockEngagementState.metrics.cyclesCompleted) : 0
      }
    };
  }),
  
  // ✅ Nouvelle méthode pour permettre aux tests de changer la maturity
  setMaturityLevel: jest.fn((level, metrics = {}) => {
    // Mettre à jour les métriques pour correspondre au niveau demandé
    switch (level) {
      case 'autonomous':
        mockEngagementState.metrics = {
          ...mockEngagementState.metrics,
          daysUsed: 25,
          conversationsStarted: 12,
          conversationsCompleted: 10,
          notebookEntriesCreated: 15,
          cyclesCompleted: 2,
          autonomySignals: 5,
          ...metrics
        };
        mockEngagementState.maturity.current = 'autonomous';
        mockEngagementState.maturity.confidence = 90;
        break;
      case 'learning':
        mockEngagementState.metrics = {
          ...mockEngagementState.metrics,
          daysUsed: 5,
          conversationsStarted: 3,
          conversationsCompleted: 2,
          notebookEntriesCreated: 4,
          cyclesCompleted: 0,
          autonomySignals: 1,
          ...metrics
        };
        mockEngagementState.maturity.current = 'learning';
        mockEngagementState.maturity.confidence = 75;
        break;
      default: // discovery
        mockEngagementState.metrics = {
          ...mockEngagementState.metrics,
          daysUsed: 1,
          conversationsStarted: 0,
          conversationsCompleted: 0,
          notebookEntriesCreated: 0,
          cyclesCompleted: 0,
          autonomySignals: 0,
          ...metrics
        };
        mockEngagementState.maturity.current = 'discovery';
        mockEngagementState.maturity.confidence = 10;
        break;
    }
  }),
};

// État mutable pour le mock cycle store
let mockCycleState = {
  lastPeriodDate: new Date().toISOString(),
  length: 28,
  periodDuration: 5,
  isRegular: true,
  trackingExperience: 'basic',
  observations: [],
};

export const mockCycleStore = {
  // Getters pour toujours retourner l'état actuel
  get lastPeriodDate() { return mockCycleState.lastPeriodDate; },
  get length() { return mockCycleState.length; },
  get periodDuration() { return mockCycleState.periodDuration; },
  get isRegular() { return mockCycleState.isRegular; },
  get trackingExperience() { return mockCycleState.trackingExperience; },
  get observations() { return mockCycleState.observations; },
  
  // Méthodes qui modifient l'état
  startNewCycle: jest.fn((date) => {
    mockCycleState.lastPeriodDate = date || new Date().toISOString();
  }),
  endPeriod: jest.fn(),
  updateCycle: jest.fn((data) => {
    mockCycleState = { ...mockCycleState, ...data };
  }),
  resetCycle: jest.fn(() => {
    mockCycleState = {
      lastPeriodDate: null,
      length: 28,
      periodDuration: 5,
      isRegular: true,
      trackingExperience: 'basic',
      observations: [],
    };
  }),
  addObservation: jest.fn((feeling, energy, notes) => {
    // Vérifier si un cycle est initialisé
    if (!mockCycleState.lastPeriodDate) {
      console.warn('Cannot add observation: no cycle initialized');
      return;
    }
    
    // Normaliser les valeurs feeling/energy à 1-5
    // 0 ou valeurs négatives deviennent 1, valeurs > 5 deviennent 5
    const normalizedFeeling = feeling === null || feeling === undefined ? 3 : Math.max(1, Math.min(5, feeling));
    const normalizedEnergy = energy === null || energy === undefined ? 3 : Math.max(1, Math.min(5, energy));
    
    // Calculer la phase et le jour du cycle (simulation simple)
    const periodDate = new Date(mockCycleState.lastPeriodDate);
    const today = new Date();
    const daysSincePeriod = Math.floor((today - periodDate) / (1000 * 60 * 60 * 24));
    const cycleDay = (daysSincePeriod % mockCycleState.length) + 1;
    
    // Déterminer la phase basée sur le jour du cycle
    let phase = 'menstrual';
    if (cycleDay > 5 && cycleDay <= 14) phase = 'follicular';
    else if (cycleDay > 14 && cycleDay <= 21) phase = 'ovulatory';
    else if (cycleDay > 21) phase = 'luteal';
    
    const observation = {
      id: Date.now() + Math.random(),
      feeling: normalizedFeeling,
      energy: normalizedEnergy,
      notes: (notes || '').substring(0, 500),
      timestamp: new Date().toISOString(),
      phase: phase,
      cycleDay: cycleDay
    };
    
    mockCycleState.observations.push(observation);
    
    // Limiter à 90 observations maximum
    if (mockCycleState.observations.length > 90) {
      mockCycleState.observations = mockCycleState.observations.slice(-90);
    }
  }),
  
  // Méthodes de calcul et sélecteurs
  getCycleData: jest.fn(() => ({
    ...mockCycleState,
    currentPhase: mockCycleState.observations.length > 0 ? mockCycleState.observations[mockCycleState.observations.length - 1].phase : null,
    currentDay: mockCycleState.observations.length > 0 ? mockCycleState.observations[mockCycleState.observations.length - 1].cycleDay : null,
    hasData: !!mockCycleState.lastPeriodDate,
    hasObservations: mockCycleState.observations.length > 0
  })),
  getCurrentPhaseFromStore: jest.fn(() => {
    return mockCycleState.observations.length > 0 ? mockCycleState.observations[mockCycleState.observations.length - 1].phase : null;
  }),
  getCurrentDayFromStore: jest.fn(() => {
    return mockCycleState.observations.length > 0 ? mockCycleState.observations[mockCycleState.observations.length - 1].cycleDay : null;
  }),
  hasData: jest.fn(() => !!mockCycleState.lastPeriodDate),
  hasObservations: jest.fn(() => mockCycleState.observations.length > 0)
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

export const mockNetworkQueue = {
  enqueueChatMessage: jest.fn().mockResolvedValue(true),
  enqueue: jest.fn().mockResolvedValue(true),
  process: jest.fn().mockResolvedValue(true)
};