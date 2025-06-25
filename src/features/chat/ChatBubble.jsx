//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/chat/ChatBubble.jsx
// 🧩 Type: UI Component
// 📚 Description: Bulle de message moderne iPhone 2025 avec avatar intégré
// 🕒 Version: 4.0 - 2025-06-21
// 🧭 Used in: chat screen
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BodyText } from '../../core/ui/Typography';
import { useTheme } from '../../hooks/useTheme';
import MeluneAvatar from '../shared/MeluneAvatar';
import { useUserStore } from '../../stores/useUserStore';

export default function ChatBubble({ 
  message, 
  isUser = false, 
  phase = 'menstrual',
  onSave,
  delay = 0
}) {
  const { melune } = useUserStore();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(5)).current;

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

  const animatedStyle = {
    opacity: opacityAnim,
    transform: [{ translateY: translateYAnim }],
  };

  const handleLongPress = () => {
    if (!isUser && onSave) {
      onSave();
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
      <TouchableOpacity
        style={styles.meluneContainer}
        onLongPress={handleLongPress}
        delayLongPress={600}
        activeOpacity={0.9}
      >
        <MeluneAvatar phase={phase} size="small" />
        <View style={[styles.meluneBubble, { backgroundColor: theme.colors.phases[phase] }]}>
          <BodyText style={[styles.meluneText, { color: theme.getTextColorOnPhase(phase) }]}>
            {message}
          </BodyText>
        </View>
      </TouchableOpacity>
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
    alignItems: 'flex-end',
    marginVertical: 8,
    paddingRight: 40,
  },
  meluneBubble: {
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 8,
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
});
