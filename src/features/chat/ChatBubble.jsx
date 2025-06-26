//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/chat/ChatBubble.jsx
// 🧩 Type: UI Component
// 📚 Description: Bulle de message avec cross-navigation notebook
// 🕒 Version: 5.0 - 2025-06-26 - CASCADE 2.6 CROSS-NAVIGATION
// 🧭 Used in: chat screen
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BodyText } from '../../core/ui/Typography';
import { useTheme } from '../../hooks/useTheme';
import MeluneAvatar from '../shared/MeluneAvatar';
import { useUserStore } from '../../stores/useUserStore';
import { useCycle } from '../../hooks/useCycle';

export default function ChatBubble({ 
  message, 
  isUser = false, 
  phase = 'menstrual',
  onSave,
  delay = 0,
  showCrossActions = true
}) {
  const { melune } = useUserStore();
  const { theme } = useTheme();
  const { currentPhase } = useCycle();
  const styles = getStyles(theme);
  const [showActions, setShowActions] = useState(false);
  
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
      toValue: showActions ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showActions]);

  const animatedStyle = {
    opacity: opacityAnim,
    transform: [{ translateY: translateYAnim }],
  };

  const handleLongPress = () => {
    if (!isUser && onSave) {
      onSave();
    }
  };

  // ✅ NOUVEAU : Navigation vers notebook avec contexte
  const handleNotebookNavigation = () => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
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

  // ✅ NOUVEAU : Toggle actions au tap
  const handleBubblePress = () => {
    if (!isUser && showCrossActions) {
      setShowActions(!showActions);
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
            onLongPress={handleLongPress}
            onPress={handleBubblePress}
            delayLongPress={600}
            activeOpacity={0.9}
          >
            <BodyText style={[styles.meluneText, { color: theme.getTextColorOnPhase(phase) }]}>
              {message}
            </BodyText>
          </TouchableOpacity>

          {/* ✅ NOUVEAU : Actions cross-navigation */}
          {showCrossActions && (
            <Animated.View 
              style={[
                styles.crossActions,
                { opacity: actionsOpacity }
              ]}
            >
              <TouchableOpacity
                style={[styles.actionButton, styles.notebookButton]}
                onPress={handleNotebookNavigation}
              >
                <Feather name="edit-3" size={14} color={theme.colors.primary} />
                <BodyText style={styles.actionText}>Noter</BodyText>
              </TouchableOpacity>
              
              {onSave && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={onSave}
                >
                  <Feather name="bookmark" size={14} color={theme.colors.accent} />
                  <BodyText style={styles.actionText}>Sauver</BodyText>
                </TouchableOpacity>
              )}
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
    borderRadius: 20,
    borderBottomRightRadius: 6,
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
    borderRadius: 20,
    borderBottomLeftRadius: 6,
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
  
  // ✅ NOUVEAU : Styles cross-actions
  crossActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notebookButton: {
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  saveButton: {
    backgroundColor: theme.colors.accent + '15',
    borderWidth: 1,
    borderColor: theme.colors.accent + '30',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
});