//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/layout/SimpleHeader.jsx
// 🧩 Type : Headers spécialisés
// 📚 Description : Headers adaptatifs selon contexte page
// 🕒 Version : 1.0 - 2025-06-28 - ARCHITECTURE FINALE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Heading } from '../ui/typography';

// Header Mon Cycle avec rouage
export function CycleHeader({ onSettingsPress }) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
        <Feather name="settings" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      
      <Heading style={styles.title}>Mon Cycle</Heading>
      
      <View style={styles.spacer} />
    </View>
  );
}

// Header Conseils simple
export function ConseilsHeader() {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      <Heading style={styles.titleCentered}>Conseils</Heading>
    </View>
  );
}

// Header Notebook avec toggle et recherche
export function NotebookHeader({ 
  onToggleCalendar, 
  onToggleSearch, 
  showCalendar = false 
}) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={[styles.toggleButton, showCalendar && styles.toggleButtonActive]}
        onPress={onToggleCalendar}
      >
        <Feather 
          name={showCalendar ? "book" : "calendar"} 
          size={20} 
          color={showCalendar ? "white" : theme.colors.primary} 
        />
      </TouchableOpacity>

      <Heading style={styles.title}>Mon Carnet</Heading>

      <TouchableOpacity style={styles.actionButton} onPress={onToggleSearch}>
        <Feather name="search" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  
  titleCentered: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    flex: 1,
  },

  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },

  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.primary + '30',
  },

  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },

  spacer: {
    width: 44,
  },
});