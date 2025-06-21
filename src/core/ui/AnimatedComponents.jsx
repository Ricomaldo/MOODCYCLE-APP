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
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { BodyText, Caption } from './Typography';

// ✅ FAB Animé Multi-Options
export function AnimatedFAB({ showOptions, onToggle, onWritePress, onTrackPress, bottom }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const optionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation rotation + options
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: showOptions ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(optionsAnim, {
        toValue: showOptions ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showOptions]);

  const handlePress = () => {
    // Animation tactile
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={[styles.fabContainer, { bottom }]}>
      {/* Options avec animation staggered */}
      <Animated.View
        style={[
          styles.fabOptions,
          {
            opacity: optionsAnim,
            transform: [
              {
                translateY: optionsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <AnimatedFabOption
          icon="edit"
          label="Écrire"
          onPress={onWritePress}
          delay={0}
          show={showOptions}
        />
        <AnimatedFabOption
          icon="bar-chart"
          label="Tracker"
          onPress={onTrackPress}
          delay={100}
          show={showOptions}
        />
      </Animated.View>

      {/* FAB principal */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [{ scale: scaleAnim }, { rotate: rotation }],
          },
        ]}
      >
        <TouchableOpacity style={styles.fabTouchable} onPress={handlePress} activeOpacity={0.8}>
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Option FAB individuelle animée
function AnimatedFabOption({ icon, label, onPress, delay, show }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: show ? 1 : 0,
      duration: 200,
      delay: show ? delay : 0,
      useNativeDriver: true,
    }).start();
  }, [show, delay]);

  return (
    <Animated.View
      style={[
        styles.fabOption,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <TouchableOpacity style={styles.fabOptionTouchable} onPress={onPress} activeOpacity={0.9}>
        <MaterialIcons name={icon} size={20} color="white" />
        <Caption style={styles.fabOptionText}>{label}</Caption>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ✅ Barre de Recherche Animée
export function AnimatedSearchBar({ visible, query, onChangeText, onClear }) {
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

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          transform: [{ scaleY: scaleYAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.searchInput}>
        <MaterialIcons name="search" size={20} color={theme.colors.textLight} />
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
            <MaterialIcons name="clear" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// ✅ Filter Pills Animés
export function AnimatedFilterPill({ item, isActive, onPress, index }) {
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
          <MaterialIcons
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
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();
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

const styles = StyleSheet.create({
  // FAB Container
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.l,
    alignItems: 'center',
  },
  fabOptions: {
    marginBottom: theme.spacing.m,
    gap: theme.spacing.s,
  },
  fabOption: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  fabOptionTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.xs,
  },
  fabOptionText: {
    color: 'white',
    fontSize: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabTouchable: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

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
