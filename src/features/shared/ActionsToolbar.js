//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/ActionsToolbar.jsx - PATTERN UX UNIFIÉ
// 🧩 Type: UI Component Universal
// 📚 Description: Toolbar actions réutilisable pour insights/chat/notebook
// 🕒 Version: 1.0 - 2025-06-27 - HARMONISATION UX
// 🧭 Used in: InsightCard, ChatBubble, NotebookEntry
// ─────────────────────────────────────────────────────────
//
import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Caption } from '../../core/ui/Typography';

export default function ActionsToolbar({ 
  visible = false,
  actions = [],
  style,
  direction = 'horizontal', // 'horizontal' | 'vertical'
  size = 'medium' // 'small' | 'medium' | 'large'
}) {
  const { theme } = useTheme();
  const styles = getStyles(theme, direction, size);
  
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      Animated.parallel([
        Animated.spring(opacityAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handleActionPress = (action) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(
        action.haptic || Haptics.ImpactFeedbackStyle.Medium
      );
    }
    
    if (action.onPress) {
      action.onPress();
    }
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }]
        },
        style
      ]}
    >
      {actions.map((action, index) => (
        <TouchableOpacity
          key={action.id || index}
          style={[
            styles.actionButton,
            { backgroundColor: (action.color || theme.colors.primary) + '15' },
            { borderColor: (action.color || theme.colors.primary) + '30' }
          ]}
          onPress={() => handleActionPress(action)}
          disabled={action.disabled}
        >
          <Feather
            name={action.icon}
            size={styles.iconSize}
            color={action.disabled ? theme.colors.textLight : (action.color || theme.colors.primary)}
          />
          {action.label && (
            <Caption style={[
              styles.actionLabel,
              { color: action.disabled ? theme.colors.textLight : (action.color || theme.colors.primary) }
            ]}>
              {action.label}
            </Caption>
          )}
          
          {action.badge && (
            <View style={[styles.badge, { backgroundColor: action.color || theme.colors.primary }]}>
              <Caption style={styles.badgeText}>{action.badge}</Caption>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

// ✅ ACTIONS STANDARDS PRÉDÉFINIES
export const STANDARD_ACTIONS = {
  save: (onPress, options = {}) => ({
    id: 'save',
    icon: 'bookmark',
    label: 'Sauver',
    color: '#8B5CF6', // Violet
    onPress,
    haptic: 'Medium',
    ...options
  }),
  
  share: (onPress, options = {}) => ({
    id: 'share',
    icon: 'share',
    label: 'Partager',
    color: '#10B981', // Vert
    onPress,
    haptic: 'Medium',
    ...options
  }),
  
  note: (onPress, options = {}) => ({
    id: 'note',
    icon: 'edit-3',
    label: 'Noter',
    color: '#F59E0B', // Orange
    onPress,
    haptic: 'Light',
    ...options
  }),
  
  reflect: (onPress, options = {}) => ({
    id: 'reflect',
    icon: 'message-circle',
    label: 'Réfléchir',
    color: '#3B82F6', // Bleu
    onPress,
    haptic: 'Light',
    ...options
  }),
  
  important: (onPress, options = {}) => ({
    id: 'important',
    icon: 'star',
    label: 'Important',
    color: '#EF4444', // Rouge
    onPress,
    haptic: 'Heavy',
    ...options
  }),
  
  more: (onPress, options = {}) => ({
    id: 'more',
    icon: 'more-horizontal',
    label: 'Plus',
    color: '#6B7280', // Gris
    onPress,
    haptic: 'Light',
    ...options
  })
};

// ✅ FACTORY POUR ACTIONS CONTEXTUELLES
export const createContextualActions = (context, handlers) => {
  const { type, content, phase, persona } = context;
  const actions = [];
  
  // Action Sauvegarder (toujours disponible)
  if (handlers.onSave) {
    actions.push(STANDARD_ACTIONS.save(handlers.onSave));
  }
  
  // Action Partager (sauf tracking)
  if (type !== 'tracking' && handlers.onShare) {
    actions.push(STANDARD_ACTIONS.share(handlers.onShare));
  }
  
  // Action Noter (pour insights et chat)
  if (['insight', 'chat'].includes(type) && handlers.onNote) {
    actions.push(STANDARD_ACTIONS.note(handlers.onNote));
  }
  
  // Action Réfléchir (pour insights)
  if (type === 'insight' && handlers.onReflect) {
    actions.push(STANDARD_ACTIONS.reflect(handlers.onReflect));
  }
  
  return actions;
};

const getStyles = (theme, direction, size) => {
  // Tailles selon le size
  const sizes = {
    small: { button: 32, icon: 14, gap: 6 },
    medium: { button: 40, icon: 16, gap: 8 },
    large: { button: 48, icon: 18, gap: 10 }
  };
  
  const currentSize = sizes[size];
  
  return StyleSheet.create({
    container: {
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      alignItems: 'center',
      gap: currentSize.gap,
      backgroundColor: theme.colors.surface,
      borderRadius: direction === 'horizontal' ? 24 : 16,
      padding: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.colors.border + '40',
    },
    
    actionButton: {
      width: currentSize.button,
      height: currentSize.button,
      borderRadius: direction === 'horizontal' ? currentSize.button / 2 : 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      position: 'relative',
    },
    
    actionLabel: {
      fontSize: 10,
      fontWeight: '500',
      marginTop: 2,
      textAlign: 'center',
      display: direction === 'vertical' ? 'flex' : 'none', // Label seulement en vertical
    },
    
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    
    badgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
    },
    
    iconSize: currentSize.icon,
  });
};