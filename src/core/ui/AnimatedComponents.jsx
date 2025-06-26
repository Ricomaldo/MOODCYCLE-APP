//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/notebook/AnimatedComponents.jsx
// 🧩 Type: UI Component
// 📚 Description: Composants animés pour le carnet (FAB, search bar, filtres, skeletons)
// 🕒 Version: 3.0 - 2025-06-21
// 🧭 Used in: notebook screen, shared notebook UI
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, TextInput, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BodyText, Caption } from './Typography';

// ✅ FAB Animé Multi-Options


// ✅ Barre de Recherche Animée
export function AnimatedSearchBar({ visible, query, onChangeText, onClear }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const scaleYAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleYAnim, {
        toValue: visible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          transform: [{ scaleY: scaleYAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.searchInput}>
        <Feather name="search" size={20} color={theme.colors.textLight} />
        <TextInput
          style={styles.searchText}
          placeholder="Rechercher dans ton carnet..."
          value={query}
          onChangeText={onChangeText}
          placeholderTextColor={theme.colors.textLight}
          autoFocus={visible}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Feather name="x" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// ✅ Filter Pills Animés
export function AnimatedFilterPill({ item, isActive, onPress, index }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée décalée
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Animation activation
    Animated.timing(backgroundAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surface, theme.colors.primary],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress}>
        <Animated.View style={[styles.filterPill, { backgroundColor }]}>
          <Feather
            name={item.icon}
            size={16}
            color={isActive ? 'white' : theme.colors.textLight}
          />
          <BodyText
            style={[styles.filterText, { color: isActive ? 'white' : theme.colors.textLight }]}
          >
            {item.label}
          </BodyText>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ✅ Entry Loading Skeleton
export function EntryLoadingSkeleton() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonTime} />
      </View>
      <View style={styles.skeletonContent} />
      <View style={styles.skeletonContentShort} />
    </Animated.View>
  );
}

// ✅ Chat Bubble Animée
export function AnimatedChatBubble({ children, delay = 0, isUser = false }) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
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

  return (
    <Animated.View
      style={{
        transform: [{ translateY: translateYAnim }],
        opacity: opacityAnim,
      }}
    >
      {children}
    </Animated.View>
  );
}

const getStyles = (theme) => StyleSheet.create({

  // Search
  searchContainer: {
    marginBottom: theme.spacing.m,
    overflow: 'hidden',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.s,
    marginTop: theme.spacing.s,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    ...Platform.select({
      ios: { fontFamily: theme.fonts.body },
      android: { fontFamily: theme.fonts.body },
    }),
  },

  // Filter Pills
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
    gap: theme.spacing.xs,
  },
  filterText: {
    fontSize: 14,
  },

  // Loading Skeleton
  skeletonCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  skeletonIcon: {
    width: 16,
    height: 16,
    backgroundColor: theme.colors.border,
    borderRadius: 8,
  },
  skeletonTime: {
    width: 60,
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    marginLeft: theme.spacing.s,
  },
  skeletonContent: {
    width: '100%',
    height: 14,
    backgroundColor: theme.colors.border,
    borderRadius: 7,
    marginBottom: theme.spacing.xs,
  },
  skeletonContentShort: {
    width: '70%',
    height: 14,
    backgroundColor: theme.colors.border,
    borderRadius: 7,
  },
});
