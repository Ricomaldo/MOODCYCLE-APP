//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/chat/ChatBubble.jsx - ACTIONS VISIBLES
// 🧩 Type: UI Component
// 📚 Description: Bulle chat avec actions subtiles mais visibles
// 🕒 Version: 7.0 - 2025-06-27 - ACTIONS VISIBLES + BORDER RADIUS UNIFIÉ
// 🧭 Pattern: Tap → Actions contrastées visibles
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BodyText } from '../../core/ui/Typography';
import { useTheme } from '../../hooks/useTheme';
import { useUserStore } from '../../stores/useUserStore';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useCycle } from '../../hooks/useCycle';
import MeluneAvatar from '../shared/MeluneAvatar';

export default function ChatBubble({ 
  message, 
  isUser = false, 
  phase = 'menstrual',
  onSave,
  delay = 0,
  showActions = true
}) {
  const { theme } = useTheme();
  const { saveFromChat } = useNotebookStore();
  const { currentPhase } = useCycle();
  const styles = getStyles(theme);
  
  const [actionsVisible, setActionsVisible] = useState(false);
  
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(5)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 200,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  useEffect(() => {
    Animated.timing(actionsOpacity, {
      toValue: actionsVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [actionsVisible]);

  const animatedStyle = {
    opacity: opacityAnim,
    transform: [{ translateY: translateYAnim }],
  };

  // ✅ HANDLERS STANDARDISÉS
  const handleSave = () => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const entryId = saveFromChat(message, 'melune');
    setActionsVisible(false);
    
    // Callback externe si fourni
    if (onSave) onSave(entryId);
  };

  const handleNote = () => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setActionsVisible(false);
    router.push({
      pathname: '/(tabs)/notebook',
      params: {
        mode: 'write',
        initialPrompt: `Réflexion sur ce que m'a dit Melune : "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`,
        sourcePhase: currentPhase,
        context: 'chat_reflection',
        suggestedTags: JSON.stringify([`#${currentPhase}`, '#melune', '#réflexion'])
      }
    });
  };

  // ✅ TAP POUR RÉVÉLER ACTIONS
  const handleBubblePress = () => {
    if (!isUser && showActions) {
      setActionsVisible(!actionsVisible);
    }
  };

  if (isUser) {
    return (
      <Animated.View style={animatedStyle}>
        <View style={styles.userContainer}>
          <View style={styles.userBubble}>
            <BodyText style={styles.userText}>{message}</BodyText>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <View style={styles.meluneContainer}>
        <MeluneAvatar phase={phase} size="small" />
        
        <View style={styles.bubbleAndActions}>
          <TouchableOpacity
            style={[styles.meluneBubble, { backgroundColor: theme.colors.phases[phase] }]}
            onPress={handleBubblePress}
            activeOpacity={0.9}
          >
            <BodyText style={[styles.meluneText, { color: theme.getTextColorOnPhase(phase) }]}>
              {message}
            </BodyText>
          </TouchableOpacity>

          {/* ✅ ACTIONS VISIBLES ET CONTRASTÉES */}
          {showActions && (
            <Animated.View 
              style={[
                styles.actionsContainer,
                { opacity: actionsOpacity }
              ]}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSave}
              >
                <Feather name="bookmark" size={16} color={theme.colors.primary} />
                <BodyText style={styles.actionText}>Épingler</BodyText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleNote}
              >
                <Feather name="edit-3" size={16} color={theme.colors.secondary} />
                <BodyText style={styles.actionText}>Noter</BodyText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  userContainer: {
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large, // ✅ UNIFIÉ
    borderBottomRightRadius: theme.borderRadius.small, // ✅ UNIFIÉ
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 20,
  },
  meluneContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
    paddingRight: 40,
  },
  bubbleAndActions: {
    flex: 1,
    marginLeft: 8,
  },
  meluneBubble: {
    borderRadius: theme.borderRadius.large, // ✅ UNIFIÉ
    borderBottomLeftRadius: theme.borderRadius.small, // ✅ UNIFIÉ
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  meluneText: {
    fontSize: 16,
    lineHeight: 22,
  },
  
  // ✅ ACTIONS VISIBLES ET CONTRASTÉES
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.large, // ✅ UNIFIÉ
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
});