// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/chat/ChatView.jsx - CASCADE 2.5 ADAPTATIF
// 🧩 Type : Composant Écran (Screen)
// 📚 Description : Chat avec interface adaptative complète selon maturité
// 🕒 Version : 7.0 - 2025-06-26 - INTERFACE ADAPTATIVE INTÉGRÉE
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

// ✅ Smart Suggestions + Interface Adaptative
import { useSmartSuggestions, useSmartChatSuggestions } from '../../../src/hooks/useSmartSuggestions';
import { useAdaptiveInterface } from '../../../src/hooks/useAdaptiveInterface';
import ParametresButton from '../../../src/features/shared/ParametresButton';

const HEADER_HEIGHT = 60;

// ✅ Composant Suggestions Rapides Adaptatif
function QuickSuggestions({ suggestions, onSuggestionPress, theme, visible, styles, maxSuggestions = 3 }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  if (!visible || !suggestions?.length) return null;

  const limitedSuggestions = suggestions.slice(0, maxSuggestions);

  return (
    <View style={[styles.suggestionsContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
      {/* Bouton ampoule pour basculer les suggestions */}
      <TouchableOpacity
        style={styles.suggestionsToggle}
        onPress={() => setShowSuggestions(!showSuggestions)}
      >
        <Feather 
          name="lightbulb" 
          size={16} 
          color={showSuggestions ? theme.colors.primary : theme.colors.textLight} 
        />
      </TouchableOpacity>
      
      {/* Suggestions conditionnelles */}
      {showSuggestions && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContent}
        >
          {limitedSuggestions.map((suggestion, index) => (
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
      )}
    </View>
  );
}

// ✅ Composant Actions Contextuelles Adaptatif
function ContextualActions({ actions, onActionPress, theme, visible, styles, showAdvanced = true }) {
  if (!visible || !actions?.length || !showAdvanced) return null;

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

// ✅ Guidance Hints Adaptatif
function GuidanceHints({ visible, guidanceLevel, theme, styles, maturityLevel }) {
  if (!visible || guidanceLevel === 'low') return null;

  const hints = {
    discovery: "💡 Pose toutes tes questions ! Je suis là pour t'accompagner dans la découverte de ton cycle.",
    learning: "🎯 Tu progresses bien ! N'hésite pas à explorer plus en profondeur.",
    autonomous: null // Pas de hints pour les expertes
  };

  const hint = hints[maturityLevel];
  if (!hint) return null;

  return (
    <View style={[styles.guidanceContainer, { backgroundColor: theme.colors.primary + '08' }]}>
      <BodyText style={[styles.guidanceText, { color: theme.colors.primary }]}>
        {hint}
      </BodyText>
    </View>
  );
}

// Composant TypingIndicator (inchangé)
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
  
  // ✅ NAVIGATION PARAMS
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
  
  // ✅ NOUVEAU : Interface Adaptative + Smart Suggestions
  const smartSuggestions = useSmartSuggestions();
  const chatSuggestions = useSmartChatSuggestions();
  const { config, layout, maturityLevel } = useAdaptiveInterface();
  
  // ✅ Stabilisation du contexte
  const intelligenceContext = useMemo(
    () => createIntelligenceContext(currentPhase, profile, smartSuggestions, chatSuggestions),
    [currentPhase, profile.persona?.assigned, smartSuggestions.hasPersonalizedData, 
     smartSuggestions.confidence, smartSuggestions.actions, chatSuggestions.prompts]
  );

  // ✅ Configuration adaptative interface
  const adaptiveConfig = useMemo(() => ({
    maxPrompts: config.guidanceLevel === 'high' ? 3 : 
                config.guidanceLevel === 'medium' ? 2 : 1,
    showAdvancedActions: config.navigationComplexity !== 'simple',
    showGuidanceHints: layout.shouldShowGuidance('hints'),
    showProgressIndicators: config.showFeatureProgress,
    guidanceIntensity: config.guidanceLevel
  }), [config, layout]);

  const phase = currentPhase;
  const prenom = profile.prenom;

  // ✅ HANDLERS MEMOIZÉS avec adaptation
  const memoizedHandlers = useMemo(() => ({
    handleSend: async (messageText = null) => {
      const currentInput = messageText || input.trim();
      if (!currentInput || isLoading || !refs.mounted.current) {
        return;
      }

      const userMessage = { id: Date.now(), text: currentInput, isUser: true };
      setMessages((prev) => [...prev, userMessage]);
      
      // ✅ Contexte conversation enrichi
      const conversationContext = messages.slice(-3).map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }));
      
      // ✅ Tracking Smart Suggestions
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
        intelligence: {
          suggestionUsed: !!messageText,
          confidence: intelligenceContext.confidence,
          persona: intelligenceContext.persona,
          maturityLevel: maturityLevel
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
            intelligence: {
              persona: response.context || intelligenceContext.persona,
              confidence: intelligenceContext.confidence,
              maturityLevel: maturityLevel
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
    
    handleSuggestionPress: (suggestion) => {
      const prompt = typeof suggestion === 'string' ? suggestion : suggestion.prompt || suggestion.title;
      
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      setInput(prompt);
      
      setTimeout(() => {
        if (refs.mounted.current) {
          memoizedHandlers.handleSend(prompt);
        }
      }, 500);
    },
    
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
          navigation.navigate('notebook', { 
            context: 'smart_suggestion',
            action: action.title
          });
          break;
        case 'phase_detail':
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
  }), [input, isLoading, messages, initialMessage, autoSend, vignetteId, sourcePhase, currentPhase, addMessage, addEntry, intelligenceContext, smartSuggestions, maturityLevel]);

  // ✅ FOCUS EFFECT
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

  // ✅ CLEANUP
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
  
  // ✅ LIMITATION MESSAGES
  useEffect(() => {
    if (messages.length > 50) {
      setMessages(prev => prev.slice(-50));
    }
  }, [messages.length]);

  // ✅ Message d'accueil personnalisé
  const generateWelcomeMessage = useCallback(() => {
    const tone = melune?.tone || "friendly";
    const persona = intelligenceContext.persona;
    const hasData = intelligenceContext.hasData;
    
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
        withData: `Bonjour ${prenom}. Je note tes progrès dans la compréhension de ton cycle. Comment puis-je t'accompagner ?`,
        newUser: `Bonjour ${prenom}. Je suis Melune, ta guide spécialisée. Comment analysons-nous ta journée ?`
      },
      sylvie: {
        withData: `Bonjour ma chère ${prenom}. Je sens que tu apprends à honorer tes rythmes. Comment te portes-tu ?`,
        newUser: `Bonjour ${prenom}. Je suis Melune, ici pour t'accompagner avec bienveillance dans ton parcours.`
      },
      christine: {
        withData: `Bonjour ${prenom}. J'observe que tu développes une meilleure compréhension. Comment allez-vous ?`,
        newUser: `Bonjour ${prenom}. Je suis Melune, ta guide spécialisée. Comment puis-je t'être utile ?`
      }
    };
    
    const personaMessages = personalizedWelcome[persona] || personalizedWelcome.emma;
    return hasData ? personaMessages.withData : personaMessages.newUser;
  }, [prenom, melune?.tone, intelligenceContext]);

  // ✅ INITIALISATION MESSAGES
  useEffect(() => {
    setMessages([{ 
      id: 1, 
      text: generateWelcomeMessage(), 
      isUser: false,
      intelligence: {
        persona: intelligenceContext.persona,
        personalized: intelligenceContext.hasData,
        maturityLevel: maturityLevel
      }
    }]);
  }, [generateWelcomeMessage, intelligenceContext.persona, maturityLevel]);

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

  // ✅ CONTEXTE VIGNETTE
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

  // ✅ LOGIQUE AFFICHAGE SUGGESTIONS ADAPTATIVE
  const shouldShowSuggestions = useMemo(() => {
    return !isLoading && 
           input.length === 0 && 
           messages.length <= 3 && 
           adaptiveConfig.showGuidanceHints &&
           (intelligenceContext.prompts.length > 0 || intelligenceContext.suggestions.length > 0);
  }, [isLoading, input.length, messages.length, adaptiveConfig.showGuidanceHints, intelligenceContext]);

  const styles = getStyles(theme);

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      
      {/* Header */}
      <View style={styles.header}>
        <Heading style={styles.title}>
          Melune {intelligenceContext.hasData && '🧠'}
          {__DEV__ && ` (${maturityLevel})`}
        </Heading>
        
        {/* ✅ BOUTON PARAMÈTRES */}
        <ParametresButton 
          color={theme.colors.primary}
          style={styles.parametresButton}
        />
        
        {__DEV__ && (
          <BodyText style={styles.debugInfo}>
            {intelligenceContext.persona} • {intelligenceContext.confidence}%
          </BodyText>
        )}
      </View>

      {/* Contexte vignette */}
      {renderVignetteContext()}

      {/* ✅ NOUVEAU : Guidance Hints */}
      <GuidanceHints
        visible={adaptiveConfig.showGuidanceHints && messages.length <= 2}
        guidanceLevel={adaptiveConfig.guidanceIntensity}
        theme={theme}
        styles={styles}
        maturityLevel={maturityLevel}
      />

      {/* ✅ Actions contextuelles adaptatives */}
      <ContextualActions
        actions={smartSuggestions.immediate}
        onActionPress={memoizedHandlers.handleActionPress}
        theme={theme}
        visible={shouldShowSuggestions && smartSuggestions.immediate.length > 0}
        styles={styles}
        showAdvanced={adaptiveConfig.showAdvancedActions}
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

        {/* ✅ Suggestions rapides adaptatives */}
        <QuickSuggestions
          suggestions={intelligenceContext.prompts}
          onSuggestionPress={memoizedHandlers.handleSuggestionPress}
          theme={theme}
          visible={shouldShowSuggestions}
          styles={styles}
          maxSuggestions={adaptiveConfig.maxPrompts}
        />

        {/* Input */}
        <View style={[styles.inputWrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={`Message...`}
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
  // ✅ NOUVEAU : Guidance Hints
  guidanceContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  guidanceText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Suggestions
  suggestionsContainer: {
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    minHeight: 44,
    position: 'relative',
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
  // Actions Contextuelles
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
  suggestionsToggle: {
    position: 'absolute',
    top: 8,
    right: 12,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 1,
  },
  parametresButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 1,
  },
});