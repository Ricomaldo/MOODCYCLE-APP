//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/ui/animations/NotebookAnimations.jsx
// 🧩 Type: Animation Components - Notebook Domain
// 📚 Description: Animations spécifiques au carnet (recherche, filtres, chargement)
// 🕒 Version: 5.0 - 2025-06-21
// 🧭 Used in: NotebookView, EntryDetailModal
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, TextInput, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { BodyText } from '../typography';
// import { useLoopAnimation } from './hooks/useLoopAnimation'; // TODO: Utiliser après migration

/**
 * Barre de recherche animée avec transitions fluides
 * @param {boolean} visible - Visibilité de la barre
 * @param {string} query - Texte de recherche
 * @param {Function} onChangeText - Callback changement de texte
 * @param {Function} onClear - Callback nettoyage
 */
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

/**
 * Pills de filtre animés avec entrée décalée
 * @param {Object} item - Objet filtre avec icon et label
 * @param {boolean} isActive - État actif du filtre
 * @param {Function} onPress - Callback appui
 * @param {number} index - Index pour délai d'animation
 */
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
            color={isActive ? theme.colors.white : theme.colors.textLight}
          />
          <BodyText
            style={[styles.filterText, { color: isActive ? theme.colors.white : theme.colors.textLight }]}
          >
            {item.label}
          </BodyText>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Skeleton de chargement pour les entrées
 * Utilisé pendant les opérations async (sync, recherche, etc.)
 */
export function EntryLoadingSkeleton() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  // TODO: Utiliser useLoopAnimation après migration complète
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

    return () => animation.stop();
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

/**
 * Animation d'entrée pour les cartes de carnet
 * @param {ReactNode} children - Contenu de la carte
 * @param {number} index - Index pour délai décalé
 */
export function AnimatedNotebookCard({ children, index = 0 }) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: translateYAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════
// 🎨 STYLES NOTEBOOK
// ═══════════════════════════════════════════════════════

const getStyles = (theme) => StyleSheet.create({
  // 🔍 Search
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

  // 🏷️ Filter Pills
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

  // 💀 Loading Skeleton
  skeletonCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
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