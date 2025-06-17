import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useChatStore = create(
  persist(
    (set, get) => ({
      // Messages de la conversation actuelle
      messages: [],
      
      // Configuration de Melune (héritée de l'onboarding)
      meluneConfig: {
        avatarStyle: 'classic',
        communicationTone: 'friendly',
        personalityMatch: null,
      },
      
      // État de la conversation
      isTyping: false,
      isWaitingResponse: false,
      
      // Historique des sessions de chat
      chatSessions: [],
      currentSessionId: null,
      
      // Contexte pour les réponses intelligentes
      conversationContext: {
        currentPhase: null,
        recentMoods: [],
        topicHistory: [],
        personalityProfile: null,
      },
      
      // Suggestions prédéfinies
      suggestions: [
        "Comment je me sens aujourd'hui ?",
        "Conseils pour ma phase actuelle",
        "Aide-moi à comprendre mon cycle",
        "Rituels de bien-être",
        "Questions sur les symptômes",
      ],
      
      // Actions pour les messages
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...message,
          }],
        })),
      
      addUserMessage: (text) => {
        const { addMessage } = get();
        addMessage({
          type: 'user',
          content: text,
        });
      },
      
      addMeluneMessage: (text, options = {}) => {
        const { addMessage } = get();
        addMessage({
          type: 'melune',
          content: text,
          mood: options.mood || 'friendly',
          hasActions: options.hasActions || false,
          actions: options.actions || [],
        });
      },
      
      // Gestion des états
      setTyping: (isTyping) =>
        set(() => ({ isTyping })),
      
      setWaitingResponse: (isWaiting) =>
        set(() => ({ isWaitingResponse })),
      
      // Configuration de Melune
      updateMeluneConfig: (config) =>
        set((state) => ({
          meluneConfig: { ...state.meluneConfig, ...config },
        })),
      
      // Sessions de chat
      startNewSession: () => {
        const sessionId = Date.now().toString();
        set((state) => ({
          currentSessionId: sessionId,
          chatSessions: [...state.chatSessions, {
            id: sessionId,
            startTime: new Date().toISOString(),
            messages: [],
            topic: null,
          }],
        }));
        return sessionId;
      },
      
      endCurrentSession: () =>
        set((state) => {
          if (!state.currentSessionId) return state;
          
          return {
            currentSessionId: null,
            chatSessions: state.chatSessions.map(session =>
              session.id === state.currentSessionId
                ? { ...session, endTime: new Date().toISOString(), messages: state.messages }
                : session
            ),
            messages: [],
          };
        }),
      
      // Contexte conversationnel
      updateContext: (contextData) =>
        set((state) => ({
          conversationContext: { ...state.conversationContext, ...contextData },
        })),
      
      addTopicToHistory: (topic) =>
        set((state) => ({
          conversationContext: {
            ...state.conversationContext,
            topicHistory: [...state.conversationContext.topicHistory, {
              topic,
              timestamp: new Date().toISOString(),
            }].slice(-10), // Garde seulement les 10 derniers sujets
          },
        })),
      
      // Suggestions dynamiques
      updateSuggestions: (newSuggestions) =>
        set(() => ({ suggestions: newSuggestions })),
      
      // Utilitaires
      getLastMessages: (count = 5) => {
        const { messages } = get();
        return messages.slice(-count);
      },
      
      getMessagesByType: (type) => {
        const { messages } = get();
        return messages.filter(msg => msg.type === type);
      },
      
      getMelunePersonality: () => {
        const { meluneConfig } = get();
        const { avatarStyle, communicationTone } = meluneConfig;
        
        const personalities = {
          'classic-friendly': 'Je suis Melune, votre compagne bienveillante pour votre bien-être féminin.',
          'modern-professional': 'Salut ! Je suis Melune, votre assistante moderne pour un suivi intelligent de votre cycle.',
          'mystique-inspiring': 'Bienvenue, belle âme. Je suis Melune, gardienne de votre sagesse cyclique.',
        };
        
        const key = `${avatarStyle}-${communicationTone}`;
        return personalities[key] || personalities['classic-friendly'];
      },
      
      // Reset
      clearChat: () =>
        set(() => ({
          messages: [],
          isTyping: false,
          isWaitingResponse: false,
        })),
      
      resetChatData: () =>
        set(() => ({
          messages: [],
          chatSessions: [],
          currentSessionId: null,
          isTyping: false,
          isWaitingResponse: false,
          conversationContext: {
            currentPhase: null,
            recentMoods: [],
            topicHistory: [],
            personalityProfile: null,
          },
        })),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        meluneConfig: state.meluneConfig,
        chatSessions: state.chatSessions,
        conversationContext: state.conversationContext,
        // Ne pas persister messages et currentSessionId pour démarrer fresh à chaque fois
      }),
    }
  )
); 