// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/chat/ChatView.jsx - SMART SUGGESTIONS INTÉGRÉES
// 🧩 Type : Composant Écran (Screen)
// 📚 Description : Chat avec suggestions intelligentes persona/phase
// 🕒 Version : 6.0 - 2025-06-25 - INTELLIGENCE CONNECTÉE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
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
  Alert,
} from "react-native";
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather } from "@expo/vector-icons";
import ChatBubble from "../../../src/features/chat/ChatBubble";
import { useTheme } from "../../../src/hooks/useTheme";
import { Heading, BodyText } from "../../../src/core/ui/Typography";
import ChatService from "../../../src/services/ChatService";
import ScreenContainer from "../../../src/core/layout/ScreenContainer";
import { useUserStore } from "../../../src/stores/useUserStore";
import { useChatStore } from "../../../src/stores/useChatStore";
import { useNotebookStore } from "../../../src/stores/useNotebookStore";
import { useCycle } from '../../../src/hooks/useCycle';
import { usePersona } from '../../../src/hooks/usePersona';
import { useRenderMonitoring } from '../../../src/hooks/usePerformanceMonitoring';
import ParametresButton from '../../../src/features/shared/ParametresButton';

// ✅ NOUVEAU : Import Smart Suggestions
import { useSmartSuggestions, useSmartChatSuggestions } from '../../../src/hooks/useSmartSuggestions';

const HEADER_HEIGHT = 60;

// ✅ NOUVEAU : Composant Suggestions Rapides
function QuickSuggestions({ suggestions, onSuggestionPress, theme, visible, styles }) {
  if (!visible || !suggestions?.length) return null;

  return (
    <View style={[styles.suggestionsContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContent}
      >
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.suggestionChip, { borderColor: theme.colors.primary }]}
            onPress={() => onSuggestionPress(suggestion)}
          >
            <BodyText style={[styles.suggestionText, { color: theme.colors.primary }]}>
              {typeof suggestion === 'string' ? suggestion : suggestion.prompt || suggestion.title}
            </BodyText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ✅ NOUVEAU : Composant Actions Contextuelles
function ContextualActions({ actions, onActionPress, theme, visible, styles }) {
  if (!visible || !actions?.length) return null;

  const primaryAction = actions[0];
  
  return (
    <View style={[styles.actionsContainer, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity
        style={[styles.primaryAction, { backgroundColor: theme.colors.primary + '15' }]}
        onPress={() => onActionPress(primaryAction)}
      >
        <Feather 
          name={primaryAction.icon || 'star'} 
          size={20} 
          color={theme.colors.primary} 
        />
        <BodyText style={[styles.actionText, { color: theme.colors.primary }]}>
          {primaryAction.title}
        </BodyText>
      </TouchableOpacity>
    </View>
  );
}

// Composant TypingIndicator avec animations iOS-like - FIXED MEMORY LEAK
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
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]);
      
      animationRef.current.start((finished) => {
        if (finished) {
          animateSequence();
        }
      });
    };

    animateSequence();
    
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, []);

  const typingStyles = {
    loadingContainer: {
      alignItems: 'flex-start',
      marginVertical: 8,
    },
    loadingBubble: {
      backgroundColor: theme.colors.backgroundSecondary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderBottomLeftRadius: 4,
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.textLight,
      marginHorizontal: 1,
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

// ✅ Stabilisation du contexte d'intelligence
const createIntelligenceContext = (currentPhase, profile, smartSuggestions, chatSuggestions) => ({
  phase: currentPhase,
  persona: profile.persona?.assigned || 'emma',
  hasData: smartSuggestions.hasPersonalizedData,
  confidence: smartSuggestions.confidence,
  suggestions: smartSuggestions.actions,
  prompts: chatSuggestions.prompts
});

export default function ChatScreen() {
  
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  
  // ✅ REFS GROUPÉES POUR CLEANUP
  const refs = {
    timer: useRef(null),
    processedVignette: useRef(null),
    scrollView: scrollViewRef,
    mounted: useRef(true)
  };
  
  // ✅ NAVIGATION PARAMS - Stabilisé
  const params = useLocalSearchParams();
  const { initialMessage, sourcePhase, sourcePersona, vignetteId, context, autoSend } = params;
  
  // États chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Stores
  const { profile, melune } = useUserStore();
  const { addMessage } = useChatStore();
  const { currentPhase, phaseInfo } = useCycle();
  const { addEntry } = useNotebookStore();
  
  // ✅ NOUVEAU : Smart Suggestions Integration
  const smartSuggestions = useSmartSuggestions();
  const chatSuggestions = useSmartChatSuggestions();
  
  // ✅ Stabilisation du contexte avec useCallback
  const intelligenceContext = useMemo(
    () => createIntelligenceContext(currentPhase, profile, smartSuggestions, chatSuggestions),
    [currentPhase, profile.persona?.assigned, smartSuggestions.hasPersonalizedData, 
     smartSuggestions.confidence, smartSuggestions.actions, chatSuggestions.prompts]
  );

  // ✅ Déplacer les logs en dehors du render
  useEffect(() => {
    if (__DEV__) {
      console.log('🧠 Intelligence Context Updated:', {
        phase: intelligenceContext.phase,
        persona: intelligenceContext.persona,
        confidence: intelligenceContext.confidence,
        suggestionsCount: intelligenceContext.suggestions.length,
        promptsCount: intelligenceContext.prompts.length,
        hasPersonalizedData: intelligenceContext.hasData
      });
    }
  }, [intelligenceContext.phase, intelligenceContext.persona, intelligenceContext.confidence]);
  
  const phase = currentPhase;
  const prenom = profile.prenom;

  // ✅ HANDLERS MEMOIZÉS avec Smart Suggestions
  const memoizedHandlers = useMemo(() => ({
    handleSend: async (messageText = null) => {
      const currentInput = messageText || input.trim();
      if (!currentInput || isLoading || !refs.mounted.current) {
        return;
      }

      const userMessage = { id: Date.now(), text: currentInput, isUser: true };
      setMessages((prev) => [...prev, userMessage]);
      
      // ✅ Contexte conversation enrichi (3-4 derniers messages)
      const conversationContext = messages.slice(-3).map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }));
      
      // ✅ TRACKING SMART SUGGESTIONS
      const suggestionUsed = messageText && intelligenceContext.prompts.some(p => 
        (typeof p === 'string' ? p : p.prompt || p.title) === messageText
      );
      if (suggestionUsed) {
        smartSuggestions.trackClicked('chat', { prompt: messageText });
        console.log('📊 Smart suggestion used:', messageText);
      }
      
      addMessage('user', currentInput, {
        sourceVignette: vignetteId || null,
        sourcePhase: sourcePhase || currentPhase,
        conversationContext,
        // ✅ NOUVEAU : Intelligence metadata
        intelligence: {
          suggestionUsed: !!messageText,
          confidence: intelligenceContext.confidence,
          persona: intelligenceContext.persona
        }
      });
      
      if (!messageText) setInput("");
      setIsLoading(true);
      memoizedHandlers.scrollToBottom();

      try {
        let response;
        try {
          response = await ChatService.sendMessage(currentInput, conversationContext);
        } catch (apiError) {
          console.error('🚨 ChatService.sendMessage specific error:', {
            message: apiError.message,
            stack: apiError.stack,
            name: apiError.name,
            cause: apiError.cause
          });
          
          response = {
            success: true,
            message: "Désolée, j'ai un petit souci technique. Peux-tu réessayer dans un moment ?",
            source: "fallback_error"
          };
        }
        
        if (response.success && refs.mounted.current) {
          const meluneMessage = {
            id: Date.now() + 1,
            text: response.message,
            isUser: false,
            source: response.source,
          };
          
          setMessages((prev) => [...prev, meluneMessage]);
          
          addMessage('melune', response.message, {
            source: response.source,
            responseToVignette: vignetteId || null,
            // ✅ NOUVEAU : Response intelligence
            intelligence: {
              persona: response.context || intelligenceContext.persona,
              confidence: intelligenceContext.confidence
            }
          });
          
          memoizedHandlers.scrollToBottom();
        }
      } catch (error) {
        console.error("🚨 handleSend Error Details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        if (refs.mounted.current) {
          const errorMessage = {
            id: Date.now() + 1,
            text: "Désolée, je rencontre un petit souci technique. Peux-tu réessayer ?",
            isUser: false,
            source: "error",
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        if (refs.mounted.current) {
          setIsLoading(false);
        }
      }
    },
    
    // ✅ NOUVEAU : Handler suggestions rapides
    handleSuggestionPress: (suggestion) => {
      const prompt = typeof suggestion === 'string' ? suggestion : suggestion.prompt || suggestion.title;
      
      // Tracking et feedback haptique
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Insérer dans input ou envoyer directement
      setInput(prompt);
      
      // Auto-send après délai court
      setTimeout(() => {
        if (refs.mounted.current) {
          memoizedHandlers.handleSend(prompt);
        }
      }, 500);
    },
    
    // ✅ NOUVEAU : Handler actions contextuelles
    handleActionPress: (action) => {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      smartSuggestions.trackClicked(action.type, action);
      
      switch (action.type) {
        case 'chat':
          memoizedHandlers.handleSuggestionPress(action);
          break;
        case 'notebook':
          // Navigation vers notebook avec contexte
          navigation.navigate('notebook', { 
            context: 'smart_suggestion',
            action: action.title
          });
          break;
        case 'phase_detail':
          // Navigation vers cycle avec phase
          navigation.navigate('cycle', { 
            context: 'smart_suggestion',
            phase: currentPhase
          });
          break;
        default:
          console.log('🎯 Action non gérée:', action.type);
      }
    },
    
    handleSaveMessage: (message) => {
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
              const vignetteContext = sourcePhase ? [`#${sourcePhase}`] : [];
              addEntry(message, 'saved', [`#${currentPhase}`, '#conseil', '#melune', ...vignetteContext]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        );
      }
    },
    
    handleVignetteNavigation: () => {
      if (initialMessage && refs.mounted.current) {
        setInput(initialMessage);
        if (autoSend === 'true') {
          if (refs.timer.current) clearTimeout(refs.timer.current);
          refs.timer.current = setTimeout(() => {
            if (refs.mounted.current) {
              memoizedHandlers.handleSend(initialMessage);
              setInput('');
            }
          }, 1000);
        }
      }
    },
    
    scrollToBottom: () => {
      if (refs.scrollView.current && refs.mounted.current) {
        setTimeout(() => {
          refs.scrollView.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  }), [input, isLoading, messages, initialMessage, autoSend, vignetteId, sourcePhase, currentPhase, addMessage, addEntry, intelligenceContext, smartSuggestions]);

  // ✅ FOCUS EFFECT OPTIMISÉ
  useFocusEffect(
    useCallback(() => {
      refs.mounted.current = true;
      setShowMessages(true);
      
      if (initialMessage && refs.processedVignette.current !== vignetteId) {
        memoizedHandlers.handleVignetteNavigation();
        refs.processedVignette.current = vignetteId;
      }
      
      return () => {
        setShowMessages(false);
        refs.processedVignette.current = false;
        if (refs.timer.current) {
          clearTimeout(refs.timer.current);
          refs.timer.current = null;
        }
      };
    }, [initialMessage, vignetteId, memoizedHandlers])
  );

  // ✅ CLEANUP COMPLET AU UNMOUNT
  useEffect(() => {
    return () => {
      refs.mounted.current = false;
      
      if (refs.timer.current) {
        clearTimeout(refs.timer.current);
      }
      
      Object.keys(refs).forEach(key => {
        if (refs[key] && refs[key].current) {
          refs[key].current = null;
        }
      });
    };
  }, []);
  
  // ✅ LIMITATION MESSAGES EN MÉMOIRE
  useEffect(() => {
    if (messages.length > 50) {
      setMessages(prev => prev.slice(-50));
    }
  }, [messages.length]);

  // ✅ Message d'accueil personnalisé avec intelligence
  const generateWelcomeMessage = useCallback(() => {
    const tone = melune?.tone || "friendly";
    const persona = intelligenceContext.persona;
    const hasData = intelligenceContext.hasData;
    
    // Messages personnalisés selon persona et données
    const personalizedWelcome = {
      emma: {
        withData: `Salut ${prenom} ! 💜 Je sens que tu évolues bien avec ton cycle ! Comment te sens-tu aujourd'hui ?`,
        newUser: `Salut ${prenom} ! C'est Melune 💜 Prête à explorer ton cycle ensemble ?`
      },
      clara: {
        withData: `Bonjour ma belle ${prenom} ! ✨ Quelle belle énergie tu développes ! Raconte-moi ta journée...`,
        newUser: `Bonjour ${prenom} ! Je suis Melune, ta guide lumineuse ✨ Quelle énergie veux-tu cultiver ?`
      },
      laure: {
        withData: `Bonjour ${prenom}. Je note vos progrès dans la compréhension de votre cycle. Comment puis-je vous accompagner ?`,
        newUser: `Bonjour ${prenom}. Je suis Melune, votre accompagnatrice spécialisée. Comment analysons-nous votre journée ?`
      },
      sylvie: {
        withData: `Bonjour ma chère ${prenom}. Je sens que tu apprends à honorer tes rythmes. Comment te portes-tu ?`,
        newUser: `Bonjour ${prenom}. Je suis Melune, ici pour t'accompagner avec bienveillance dans ton parcours.`
      },
      christine: {
        withData: `Bonjour ${prenom}. J'observe que vous développez une meilleure compréhension. Comment allez-vous ?`,
        newUser: `Bonjour ${prenom}. Je suis Melune, votre guide spécialisée. Comment puis-je vous être utile ?`
      }
    };
    
    const personaMessages = personalizedWelcome[persona] || personalizedWelcome.emma;
    return hasData ? personaMessages.withData : personaMessages.newUser;
  }, [prenom, melune?.tone, intelligenceContext]);

  // ✅ INITIALISATION MESSAGES avec Welcome personnalisé
  useEffect(() => {
    setMessages([{ 
      id: 1, 
      text: generateWelcomeMessage(), 
      isUser: false,
      intelligence: {
        persona: intelligenceContext.persona,
        personalized: intelligenceContext.hasData
      }
    }]);
  }, [generateWelcomeMessage, intelligenceContext.persona]);

  useEffect(() => {
    const initializeChatService = async () => {
      try {
        await ChatService.initialize();
        if (__DEV__) console.log("✅ ChatService initialisé");
      } catch (error) {
        console.error("🚨 Erreur init ChatService:", error);
      }
    };
    initializeChatService();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // ✅ INDICATEUR CONTEXTE VIGNETTE
  const renderVignetteContext = () => {
    if (context !== 'vignette' || !sourcePhase) return null;
    
    return (
      <View style={styles.vignetteContext}>
        <Feather name="compass" size={16} color={theme.colors.primary} />
        <BodyText style={styles.vignetteContextText}>
          Guidance {sourcePhase}
        </BodyText>
      </View>
    );
  };

  // ✅ Détermine si afficher suggestions
  const shouldShowSuggestions = useMemo(() => {
    return !isLoading && 
           input.length === 0 && 
           messages.length <= 3 && 
           (intelligenceContext.prompts.length > 0 || intelligenceContext.suggestions.length > 0);
  }, [isLoading, input.length, messages.length, intelligenceContext]);

  const styles = getStyles(theme);

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      
      {/* Header aligné avec les autres pages */}
      <View style={styles.header}>
        <ParametresButton 
          color={theme.colors.primary}
          style={styles.parametresButton}
        />
        <Heading style={styles.title}>
          Melune {intelligenceContext.hasData && '🧠'}
        </Heading>
        {__DEV__ && (
          <BodyText style={styles.debugInfo}>
            {intelligenceContext.persona} • {intelligenceContext.confidence}%
          </BodyText>
        )}
      </View>

      {/* ✅ CONTEXTE VIGNETTE */}
      {renderVignetteContext()}

      {/* ✅ NOUVEAU : Actions contextuelles en haut */}
      <ContextualActions
        actions={smartSuggestions.immediate}
        onActionPress={memoizedHandlers.handleActionPress}
        theme={theme}
        visible={shouldShowSuggestions && smartSuggestions.immediate.length > 0}
        styles={styles}
      />

      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={HEADER_HEIGHT + insets.top}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.flexContainer}
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
          {showMessages && messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              phase={phase}
              delay={index * 150}
              onSave={!message.isUser ? () => memoizedHandlers.handleSaveMessage(message.text) : undefined}
            />
          ))}
          
          {isLoading && <MemoizedTypingIndicator theme={theme} />}
        </ScrollView>

        {/* ✅ NOUVEAU : Suggestions rapides au-dessus de l'input */}
        <QuickSuggestions
          suggestions={intelligenceContext.prompts}
          onSuggestionPress={memoizedHandlers.handleSuggestionPress}
          theme={theme}
          visible={shouldShowSuggestions}
          styles={styles}
        />

        {/* Input collé à la tabbar */}
        <View style={[styles.inputWrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={`Message... (${intelligenceContext.persona})`}
              placeholderTextColor="#8E8E93"
              multiline
              maxHeight={120}
              returnKeyType="send"
              onSubmitEditing={() => memoizedHandlers.handleSend()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
              onPress={() => memoizedHandlers.handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Feather
                name="send"
                size={24}
                color={!input.trim() || isLoading ? "#C7C7CC" : theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
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
  header: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    marginBottom: 0,
    position: 'relative',
  },
  parametresButton: {
    position: 'absolute',
    left: theme.spacing.l,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  debugInfo: {
    position: 'absolute',
    right: theme.spacing.l,
    fontSize: 12,
    color: theme.colors.textLight,
  },
  vignetteContext: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  vignetteContextText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  // ✅ NOUVEAU : Styles Smart Suggestions
  suggestionsContainer: {
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // ✅ NOUVEAU : Styles Actions Contextuelles
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputWrapper: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 8,
    paddingRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});