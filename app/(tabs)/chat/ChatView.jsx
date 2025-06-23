//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/chat/ChatView.jsx - MODIFIÉ NAVIGATION
// 🧩 Type : Composant Écran (Screen)
// 📚 Description : Chat moderne iPhone 2025 avec Melune + Navigation vignettes
// 🕒 Version : 5.0 - 2025-06-21 - NAVIGATION INTÉGRÉE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { useState, useEffect, useRef, useCallback, memo } from "react";
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

const HEADER_HEIGHT = 60;

// Composant TypingIndicator avec animations iOS-like
function TypingIndicator() {
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animateSequence = () => {
      Animated.sequence([
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
      ]).start(() => animateSequence());
    };

    animateSequence();
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
  
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  
  // ✅ NAVIGATION PARAMS - Stabilisé
  const params = useLocalSearchParams();
  const { initialMessage, sourcePhase, sourcePersona, vignetteId, context, autoSend } = params;
  
  // ✅ TRACKER SI LA VIGNETTE A DÉJÀ ÉTÉ TRAITÉE
  const processedVignetteRef = useRef(null);
  
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
  
  const phase = currentPhase;
  const prenom = profile.prenom;

  // ✅ GESTION NAVIGATION VIGNETTES - CORRIGÉE
  useFocusEffect(
    useCallback(() => {
      setShowMessages(true);
      
      // Traitement params navigation vignettes - UNE SEULE FOIS
      if (initialMessage && processedVignetteRef.current !== vignetteId) {
        handleVignetteNavigation();
        processedVignetteRef.current = vignetteId;
      }
      
      return () => setShowMessages(false);
    }, [initialMessage, vignetteId]) // ✅ Dépendances stables
  );

  // ✅ NAVIGATION DEPUIS VIGNETTES - CORRIGÉE
  const handleVignetteNavigation = useCallback(() => {
    if (initialMessage) {
      // Pré-remplir l'input avec le prompt de la vignette
      setInput(initialMessage);
      
      // Optionnel : Envoyer automatiquement le message
      if (autoSend === 'true') {
        setTimeout(() => {
          handleSend(initialMessage);
          setInput('');
        }, 1000);
      }
    }
  }, [initialMessage, autoSend]); // ✅ Dépendances mises à jour

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

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleSaveMessage = (message) => {
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
            // ✅ INTÉGRATION STORES - Nouveau
            const vignetteContext = sourcePhase ? [`#${sourcePhase}`] : [];
            addEntry(message, 'saved', [`#${currentPhase}`, '#conseil', '#melune', ...vignetteContext]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      );
    }
  };

  // ✅ HANDLE SEND MODIFIÉ
  const handleSend = async (messageText = null) => {
    const currentInput = messageText || input.trim();
    if (!currentInput || isLoading) return;

    const userMessage = { id: Date.now(), text: currentInput, isUser: true };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // ✅ SAUVEGARDE DANS CHATSTORE
    addMessage('user', currentInput, {
      sourceVignette: vignetteId || null,
      sourcePhase: sourcePhase || currentPhase
    });
    
    if (!messageText) setInput("");
    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await ChatService.sendMessage(currentInput);
      if (response.success) {
        const meluneMessage = {
          id: Date.now() + 1,
          text: response.message,
          isUser: false,
          source: response.source,
        };
        setMessages((prev) => [...prev, meluneMessage]);
        
        // ✅ SAUVEGARDE RÉPONSE MELUNE
        addMessage('melune', response.message, {
          source: response.source,
          responseToVignette: vignetteId || null
        });
        
        scrollToBottom();
      } else {
        throw new Error("Erreur service ChatService");
      }
    } catch (error) {
      console.error("🚨 Erreur handleSend:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Désolée, je rencontre un petit souci technique. Peux-tu réessayer dans quelques instants ?",
        isUser: false,
        source: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
      scrollToBottom();
    } finally {
      setIsLoading(false);
    }
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
              onSave={!message.isUser ? () => handleSaveMessage(message.text) : undefined}
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
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
              onPress={() => handleSend()}
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