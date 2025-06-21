//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/chat/ChatView.jsx
// 🧩 Type : Composant Écran (Screen)
// 📚 Description : Chat moderne iPhone 2025 avec Melune
// 🕒 Version : 4.0 - 2025-06-21
// 🧭 Utilisé dans : navigation chat (onglet)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { useState, useEffect, useRef, useCallback } from "react";
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
} from "react-native";
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import ChatBubble from "../../../src/features/chat/ChatBubble";
import { theme } from "../../../src/config/theme";
import { Heading } from "../../../src/core/ui/Typography";
import ChatService from "../../../src/services/ChatService";
import DevNavigation from "../../../src/core/dev/DevNavigation";
import ScreenContainer from "../../../src/core/layout/ScreenContainer";
import { useUserStore } from "../../../src/stores/useUserStore";
import { useNotebookStore } from "../../../src/stores/useNotebookStore";
import { useCycle } from '../../../src/hooks/useCycle';

const HEADER_HEIGHT = 60;

// Composant TypingIndicator avec animations iOS-like
function TypingIndicator() {
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Animation séquentielle iOS-like avec courbes naturelles
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

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  
  const { profile, melune } = useUserStore();
  const { currentPhase, phaseInfo } = useCycle();

  const { addEntry } = useNotebookStore();
  const phase = currentPhase;
  const prenom = profile.prenom;

  useFocusEffect(
    useCallback(() => {
      setShowMessages(true);
      return () => setShowMessages(false);
    }, [])
  );

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
            addEntry(message, 'saved', [`#${currentPhase}`, '#conseil']);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      );
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input.trim();
    const userMessage = { id: Date.now(), text: currentInput, isUser: true };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
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

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      <DevNavigation />
      
      {/* Header aligné avec les autres pages */}
      <View style={styles.header}>
        <Heading style={styles.title}>Melune</Heading>
      </View>

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
          
          {isLoading && <TypingIndicator />}
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
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Ionicons
                name="arrow-up-circle-sharp"
                size={32}
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
    marginBottom: 0, // Pas de margin pour alignement
  },
  title: {
    textAlign: 'center',
    fontSize: 20, // Taille standardisée
    fontWeight: '600',
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
    minHeight: 44, // Hauteur minimale iOS
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
