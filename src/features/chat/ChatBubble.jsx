//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/chat/ChatBubble.jsx - GLASSMORPHISM
// 🧩 Type: UI Component
// 📚 Description: Bulle chat avec effet glassmorphism signature unifié
// 🕒 Version: 8.0 - 2025-06-28 - GLASSMORPHISM + STYLE UNIFIÉ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BodyText } from '../../core/ui/typography';
import { useTheme } from '../../hooks/useTheme';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { getCurrentPhase } from '../../utils/cycleCalculations';
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
  const cycleData = useCycleStore((state) => state);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const styles = getStyles(theme, phase);
  
  const [actionsVisible, setActionsVisible] = useState(true);
  
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

  const handleSave = () => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const entryId = saveFromChat(message, 'melune');
    setActionsVisible(false);
    
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
            style={styles.meluneBubble}
            onPress={handleBubblePress}
            activeOpacity={0.9}
          >
            <BodyText style={styles.meluneText}>
              {message}
            </BodyText>
          </TouchableOpacity>

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
                <Feather name="bookmark" size={16} color={theme.colors.phases[phase]} />
                <BodyText style={styles.actionText}>Épingler</BodyText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleNote}
              >
                <Feather name="edit-3" size={16} color={theme.colors.phases[phase]} />
                <BodyText style={styles.actionText}>Noter</BodyText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const getStyles = (theme, phase) => {
  const phaseColor = theme.colors.phases[phase];
  
  return StyleSheet.create({
    userContainer: {
      alignItems: 'flex-end',
      marginVertical: 4,
    },
    userBubble: {
      // ✅ GLASSMORPHISM POUR USER CENTRALISÉ
      ...theme.getGlassmorphismStyle(theme.colors.primary, {
        bgOpacity: theme.glassmorphism.opacity.medium,
        borderOpacity: theme.glassmorphism.opacity.accent,
        borderRadius: theme.borderRadius.large,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
      }),
      borderBottomRightRadius: theme.borderRadius.small,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxWidth: '75%',
    },
    userText: {
      color: theme.colors.primary,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '500',
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
      // ✅ GLASSMORPHISM SIGNATURE CENTRALISÉ
      ...theme.getPhaseGlassmorphismStyle(phase, {
        borderRadius: theme.borderRadius.large,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
      }),
      borderBottomLeftRadius: theme.borderRadius.small,
      paddingHorizontal: 16,
      paddingVertical: 12,
      maxWidth: '85%',
    },
    meluneText: {
      fontSize: 16,
      lineHeight: 22,
      color: theme.colors.text,
      fontWeight: '500',
    },
    
    // ✅ ACTIONS GLASSMORPHISM
    actionsContainer: {
      flexDirection: 'row',
      marginTop: 12,
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.getActionGlassmorphismStyle(phaseColor, {
        borderRadius: theme.borderRadius.large,
      }),
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 6,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
  });
};