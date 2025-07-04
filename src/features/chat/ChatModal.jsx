//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/chat/ChatModal.jsx
// 🧩 Type : Composant Modal Chat
// 📚 Description : Chat Melune polie pour modal (sans debug)
// 🕒 Version : 2.0 - 2025-06-28 - POLISH + CLEANUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActionSheetIOS,
  Animated,
  RefreshControl,
} from "react-native";
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import ChatBubble from "./ChatBubble";
import { useTheme } from "../../hooks/useTheme";
import { BodyText, Caption } from '../../core/ui/typography';
import ChatService from "../../services/ChatService";
import { useUserStore } from "../../stores/useUserStore";
import { useChatStore } from "../../stores/useChatStore";
import { useNotebookStore } from "../../stores/useNotebookStore";
import { useCycleStore } from '../../stores/useCycleStore';
import { getCurrentPhase } from '../../utils/cycleCalculations';
import { useSmartSuggestions, useSmartChatSuggestions } from '../../hooks/useSmartSuggestions';
import { useAdaptiveInterface } from '../../hooks/useAdaptiveInterface';
import NetInfo from '@react-native-community/netinfo';
import { getEndpointUrl, getApiConfig } from '../../config/api';

// Composant TypingIndicator optimisé
function TypingIndicator({ theme }) {
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    const animateSequence = () => {
      animationRef.current = Animated.sequence([
        Animated.timing(dot1Anim, { 
          toValue: 1, 
          duration: 300, 
          useNativeDriver: true 
        }),
        Animated.timing(dot2Anim, { 
          toValue: 1, 
          duration: 300, 
          useNativeDriver: true 
        }),
        Animated.timing(dot3Anim, { 
          toValue: 1, 
          duration: 300, 
          useNativeDriver: true 
        }),
        Animated.parallel([
          Animated.timing(dot1Anim, { 
            toValue: 0.4, 
            duration: 300, 
            useNativeDriver: true 
          }),
          Animated.timing(dot2Anim, { 
            toValue: 0.4, 
            duration: 300, 
            useNativeDriver: true 
          }),
          Animated.timing(dot3Anim, { 
            toValue: 0.4, 
            duration: 300, 
            useNativeDriver: true 
          }),
        ]),
      ]);
      
      animationRef.current.start((finished) => {
        if (finished) animateSequence();
      });
    };

    animateSequence();
    return () => animationRef.current?.stop();
  }, []);

  const typingStyles = {
    loadingContainer: { 
      alignItems: 'flex-start', 
      marginVertical: 8,
      paddingHorizontal: 4
    },
    loadingBubble: {
      backgroundColor: theme.colors.backgroundSecondary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      borderBottomLeftRadius: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    typingIndicator: { 
      flexDirection: 'row', 
      alignItems: 'center',
      gap: 2
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.textLight,
    },
  };

  return (
    <View style={typingStyles.loadingContainer}>
      <View style={typingStyles.loadingBubble}>
        <View style={typingStyles.typingIndicator}>
          <Animated.View style={[typingStyles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[typingStyles.dot, { opacity: dot2Anim }]} />
          <Animated.View style={[typingStyles.dot, { opacity: dot3Anim }]} />
        </View>
      </View>
    </View>
  );
}

const MemoizedTypingIndicator = memo(TypingIndicator);

// Suggestions rapides
function QuickSuggestions({ suggestions, onSuggestionPress, theme, styles }) {
  if (!suggestions?.length) return null;

  return (
    <View style={styles.suggestionsContainer}>
      <Caption style={styles.suggestionsTitle}>Suggestions rapides :</Caption>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContent}
      >
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => onSuggestionPress(suggestion)}
          >
            <BodyText style={styles.suggestionText}>
              {typeof suggestion === 'string' ? suggestion : suggestion.prompt || suggestion.title}
            </BodyText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function ChatModal() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  
  const refs = {
    mounted: useRef(true)
  };
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { profile } = useUserStore();
  const { addMessage } = useChatStore();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const { addEntry } = useNotebookStore();
  
  const smartSuggestions = useSmartSuggestions();
  const chatSuggestions = useSmartChatSuggestions();
  const { maturityLevel } = useAdaptiveInterface();

  const prenom = profile.prenom;

  // Handler envoi message
  const handleSend = useCallback(async (messageText = null) => {
    const currentInput = messageText || input.trim();
    if (!currentInput || isLoading || !refs.mounted.current) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMessage = { id: Date.now(), text: currentInput, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    
    const conversationContext = messages.slice(-3).map(m => ({
      role: m.isUser ? 'user' : 'assistant',
      content: m.text
    }));
    
    addMessage('user', currentInput, {
      sourcePhase: currentPhase,
      conversationContext,
      intelligence: { maturityLevel }
    });
    
    if (!messageText) setInput("");
    setIsLoading(true);
    scrollToBottom();

    try {
      // 🔍 DIAGNOSTIC DÉTAILLÉ
      const startTime = Date.now();
      const networkInfo = await NetInfo.fetch();
      
      console.info('🚀 Sending message:', {
        message: currentInput.substring(0, 50) + '...',
        networkConnected: networkInfo.isConnected,
        networkReachable: networkInfo.isInternetReachable,
        networkType: networkInfo.type,
        timestamp: new Date().toISOString()
      });

      const response = await ChatService.sendMessage(currentInput, conversationContext);
      const responseTime = Date.now() - startTime;
      
      console.info('✅ Response received:', {
        responseLength: response?.length || 0,
        responseTime: responseTime + 'ms',
        responsePreview: response?.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      });
      
      if (response && refs.mounted.current) {
        const meluneMessage = {
          id: Date.now() + 1,
          text: response,  // ✅ CORRECTION : response est directement le texte
          isUser: false,
          source: "api",
        };
        
        setMessages((prev) => [...prev, meluneMessage]);
        addMessage('melune', response, {
          source: "api",
          intelligence: { maturityLevel }
        });
        scrollToBottom();
      } else if (!response) {
        console.warn('⚠️ Empty response received');
      }
    } catch (error) {
      // 🔍 DIAGNOSTIC D'ERREUR DÉTAILLÉ
      const networkInfo = await NetInfo.fetch();
      console.error("💬 Chat error détaillé:", {
        error: error.message,
        stack: error.stack,
        networkConnected: networkInfo.isConnected,
        networkReachable: networkInfo.isInternetReachable,
        networkType: networkInfo.type,
        apiUrl: getEndpointUrl('chat'),
        timeout: getApiConfig().timeout,
        timestamp: new Date().toISOString()
      });
      
      if (refs.mounted.current) {
        // ✅ UTILISER LE FALLBACK INTELLIGENT
        const fallbackResponse = ChatService.getSmartFallbackResponse(currentInput);
        const errorMessage = {
          id: Date.now() + 1,
          text: fallbackResponse,
          isUser: false,
          source: "smart_fallback",
        };
        setMessages((prev) => [...prev, errorMessage]);
        addMessage('melune', fallbackResponse, {
          source: "smart_fallback",
          intelligence: { maturityLevel }
        });
      }
    } finally {
      if (refs.mounted.current) setIsLoading(false);
    }
  }, [input, isLoading, messages, currentPhase, addMessage, maturityLevel]);

  // Handler suggestions
  const handleSuggestionPress = useCallback((suggestion) => {
    const prompt = typeof suggestion === 'string' ? suggestion : suggestion.prompt || suggestion.title;
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setInput(prompt);
    
    setTimeout(() => {
      if (refs.mounted.current) {
        handleSend(prompt);
      }
    }, 300);
  }, [handleSend]);

  // Handler sauvegarde
  const handleSaveMessage = useCallback((message) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: '💾 Sauvegarder ce conseil',
          message: 'Ajouter à ton carnet pour le retrouver plus tard ?',
          options: ['Annuler', '📝 Sauver dans mon carnet'],
          cancelButtonIndex: 0,
          userInterfaceStyle: 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            addEntry(message, 'saved', [`#${currentPhase}`, '#conseil', '#melune']);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      );
    }
  }, [currentPhase, addEntry]);

  // Scroll auto
  const scrollToBottom = useCallback(() => {
    if (scrollViewRef.current && refs.mounted.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, []);

  // Message d'accueil personnalisé
  const generateWelcomeMessage = useCallback(() => {
    const persona = profile.persona?.assigned || 'emma';
    const hasData = smartSuggestions.hasPersonalizedData;
    
    const welcomeMessages = {
      emma: hasData ? 
        `Salut ${prenom} ! 💜 Comment te sens-tu aujourd'hui ?` :
        `Salut ${prenom} ! C'est Melune 💜 Prête à explorer ton cycle ?`,
      clara: hasData ?
        `Bonjour ma belle ${prenom} ! ✨ Raconte-moi ta journée...` :
        `Bonjour ${prenom} ! Je suis Melune ✨ Quelle énergie veux-tu cultiver ?`,
      laure: hasData ?
        `Bonjour ${prenom}. Comment puis-je t'accompagner aujourd'hui ?` :
        `Bonjour ${prenom}. Je suis Melune, ta guide spécialisée.`,
      sylvie: hasData ?
        `Bonjour ma chère ${prenom}. Comment te portes-tu ?` :
        `Bonjour ${prenom}. Je suis Melune, ici pour t'accompagner.`,
      christine: hasData ?
        `Bonjour ${prenom}. Comment allez-vous aujourd'hui ?` :
        `Bonjour ${prenom}. Je suis Melune, votre guide spécialisée.`
    };
    
    return welcomeMessages[persona] || welcomeMessages.emma;
  }, [prenom, profile.persona, smartSuggestions.hasPersonalizedData]);

  // Initialisation messages
  useEffect(() => {
    setMessages([{ 
      id: 1, 
      text: generateWelcomeMessage(), 
      isUser: false,
      intelligence: { persona: profile.persona?.assigned || 'emma' }
    }]);
  }, [generateWelcomeMessage]);

  // Initialisation service
  useEffect(() => {
    const initializeChatService = async () => {
      try {
        await ChatService.initialize();
      } catch (error) {
        console.error("🚨 Erreur init ChatService:", error);
      }
    };
    initializeChatService();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      refs.mounted.current = false;
    };
  }, []);

  // Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Suggestions visibles
  const showSuggestions = useMemo(() => {
    return !isLoading && 
           input.length === 0 && 
           messages.length <= 3 && 
           chatSuggestions.prompts.length > 0;
  }, [isLoading, input.length, messages.length, chatSuggestions.prompts]);

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + 60}
      >
        
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              title="Actualisation..."
              titleColor={theme.colors.textLight}
            />
          }
        >
          {messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              phase={currentPhase}
              delay={index * 100}
              onSave={!message.isUser ? () => handleSaveMessage(message.text) : undefined}
            />
          ))}
          
          {isLoading && <MemoizedTypingIndicator theme={theme} />}
        </ScrollView>

        {/* Suggestions rapides */}
        {showSuggestions && (
          <QuickSuggestions
            suggestions={chatSuggestions.prompts}
            onSuggestionPress={handleSuggestionPress}
            theme={theme}
            styles={styles}
          />
        )}

        {/* Zone de saisie */}
        <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Message..."
              placeholderTextColor={theme.colors.textLight + '80'}
              multiline
              maxHeight={120}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton, 
                (!input.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Feather
                name="send"
                size={20}
                color={(!input.trim() || isLoading) ? theme.colors.textLight + '60' : theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flexContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  
  // Suggestions
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.backgroundSecondary,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionsContent: {
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    backgroundColor: theme.colors.primary + '10',
  },
  suggestionText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  
  // Input
  inputWrapper: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 8,
    paddingRight: 8,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    ...theme.getGlassmorphismStyle(theme.colors.primary, {
      bgOpacity: theme.glassmorphism.opacity.bg,
      borderOpacity: theme.glassmorphism.opacity.border,
      borderWidth: 1,
      shadowOpacity: 0,  // Pas de shadow sur le bouton send
    }),
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
});