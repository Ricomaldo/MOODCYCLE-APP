//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/chat/ChatView.jsx - MODIFIÉ NAVIGATION
// 🧩 Type : Composant Écran (Screen)
// 📚 Description : Chat moderne iPhone 2025 avec Melune + Navigation vignettes
// 🕒 Version : 5.0 - 2025-06-21 - NAVIGATION INTÉGRÉE
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
import { theme } from "../../../src/config/theme";
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

const HEADER_HEIGHT = 60;

// Composant TypingIndicator avec animations iOS-like - FIXED MEMORY LEAK
function TypingIndicator() {
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
    
    // ✅ CLEANUP - Fix memory leak
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingBubble}>
        <View style={styles.typingIndicator}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
        </View>
      </View>
    </View>
  );
}

const MemoizedTypingIndicator = memo(TypingIndicator);

export default function ChatScreen() {
  
  // 📊 Monitoring de performance - DÉSACTIVÉ TEMPORAIREMENT
  // const renderCount = useRenderMonitoring('ChatScreen');
  
  // ✅ MEMORY MONITORING HELPER
  useEffect(() => {
    if (__DEV__) {
      const startMemory = performance.memory?.usedJSHeapSize || 0;
      console.log('💾 Chat Memory Start:', (startMemory / 1024 / 1024).toFixed(2), 'MB');
      
      const interval = setInterval(() => {
        const currentMemory = performance.memory?.usedJSHeapSize || 0;
        const delta = ((currentMemory - startMemory) / 1024 / 1024).toFixed(2);
        console.log(`💾 Chat Memory: +${delta}MB depuis démarrage`);
      }, 60000); // Log toutes les minutes
      
      return () => {
        clearInterval(interval);
        const endMemory = performance.memory?.usedJSHeapSize || 0;
        const totalDelta = ((endMemory - startMemory) / 1024 / 1024).toFixed(2);
        console.log('💾 Chat Memory End: Delta total =', totalDelta, 'MB');
      };
    }
  }, []);
  
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
  
  // ✅ STORES INITIALIZATION
  useEffect(() => {
    // Stores initialization check
  }, [profile, melune, addMessage, currentPhase, addEntry]);
  
  const phase = currentPhase;
  const prenom = profile.prenom;

  // ✅ HANDLERS MEMOIZÉS
  const memoizedHandlers = useMemo(() => ({
         handleSend: async (messageText = null) => {
       const currentInput = messageText || input.trim();
       if (!currentInput || isLoading || !refs.mounted.current) {
         return;
       }

       const userMessage = { id: Date.now(), text: currentInput, isUser: true };
       setMessages((prev) => [...prev, userMessage]);
       
       // Contexte conversation (3-4 derniers messages)
       const conversationContext = messages.slice(-3).map(m => ({
         role: m.isUser ? 'user' : 'assistant',
         content: m.text
       }));
       
       addMessage('user', currentInput, {
         sourceVignette: vignetteId || null,
         sourcePhase: sourcePhase || currentPhase,
         conversationContext // ✅ Contexte pour l'API
       });
       
       if (!messageText) setInput("");
       setIsLoading(true);
       memoizedHandlers.scrollToBottom();

       try {
         // ✅ TEST REAL API CALL WITH DETAILED ERROR HANDLING
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
           
           // Fallback en cas d'erreur API
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
             responseToVignette: vignetteId || null
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
  }), [input, isLoading, messages, initialMessage, autoSend, vignetteId, sourcePhase, currentPhase, addMessage, addEntry]);

  // ✅ FOCUS EFFECT OPTIMISÉ
  useFocusEffect(
    useCallback(() => {
      refs.mounted.current = true; // ✅ FIX: Réactiver le composant au focus
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
        // ✅ NE PAS désactiver mounted ici - seulement au unmount complet
      };
    }, [initialMessage, vignetteId, memoizedHandlers])
  );


  // ✅ CLEANUP COMPLET AU UNMOUNT
  useEffect(() => {
    return () => {
      refs.mounted.current = false;
      
      // Cleanup tous les timers
      if (refs.timer.current) {
        clearTimeout(refs.timer.current);
      }
      
      // Cleanup toutes les refs
      Object.keys(refs).forEach(key => {
        if (refs[key] && refs[key].current) {
          refs[key].current = null;
        }
      });
    };
  }, []);
  
  // ✅ LIMITATION MESSAGES EN MÉMOIRE
  useEffect(() => {
    // Garder seulement 50 derniers messages en mémoire locale
    if (messages.length > 50) {
      setMessages(prev => prev.slice(-50));
    }
  }, [messages.length]);

  // Message d'accueil personnalisé
  const generateWelcomeMessage = () => {
    const tone = melune?.tone || "friendly";
    if (prenom) {
      if (tone === "friendly") {
        return `Salut ${prenom} ! C'est Melune 💜 Comment te sens-tu aujourd'hui ?`;
      } else if (tone === "inspiring") {
        return `Bonjour ${prenom}! Je suis Melune, ta guide vers ton épanouissement cyclique ✨ Quelle énergie veux-tu cultiver aujourd'hui ?`;
      } else {
        return `Bonjour ${prenom}! Je suis Melune, votre accompagnatrice spécialisée. Comment puis-je vous aider aujourd'hui ?`;
      }
    }
    return "Bonjour! Je suis Melune, ta guide cyclique. Comment puis-je t'aider aujourd'hui?";
  };

  useEffect(() => {
    setMessages([{ id: 1, text: generateWelcomeMessage(), isUser: false }]);
  }, [prenom, melune?.tone]);

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

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      
      {/* Header aligné avec les autres pages */}
      <View style={styles.header}>
        <ParametresButton 
          color={theme.colors.primary}
          style={styles.parametresButton}
        />
        <Heading style={styles.title}>Melune</Heading>
      </View>

      {/* ✅ CONTEXTE VIGNETTE */}
      {renderVignetteContext()}

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
          
          {isLoading && <MemoizedTypingIndicator />}
        </ScrollView>

        {/* Input collé à la tabbar */}
        <View style={[styles.inputWrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Message..."
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
                color={!input.trim() || isLoading ? "#C7C7CC" : "#007AFF"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  // ✅ NOUVEAU - Contexte vignette
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
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginTop: 12,
  },
  loadingBubble: {
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '70%',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8E8E93',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
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