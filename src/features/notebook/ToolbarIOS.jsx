//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/notebook/ToolbarIOS.jsx
// 🧩 Type: UI Component
// 📚 Description: Toolbar iOS native pour actions notebook (remplace FAB)
// 🕒 Version: 1.0 - 2025-06-21
// 🧭 Used in: NotebookView, iOS-native toolbar
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { BodyText } from '../../core/ui/Typography';

export default function ToolbarIOS({ onWritePress, onTrackPress }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  const handleWritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onWritePress();
  };

  const handleTrackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onTrackPress();
  };

  return (
    <View style={[styles.toolbar, { paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.toolbarContent}>
        {/* Bouton Écrire */}
        <TouchableOpacity
          style={[styles.toolbarButton, styles.writeButton]}
          onPress={handleWritePress}
          activeOpacity={0.8}
        >
          <Feather name="edit-3" size={20} color="#FFFFFF" />
          <BodyText style={styles.writeButtonText}>Écrire</BodyText>
        </TouchableOpacity>

        {/* Bouton Tracker */}
        <TouchableOpacity
          style={[styles.toolbarButton, styles.trackButton]}
          onPress={handleTrackPress}
          activeOpacity={0.8}
        >
          <Feather name="bar-chart-2" size={20} color={theme.colors.primary} />

          <BodyText style={styles.trackButtonText}>Tracker</BodyText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent iOS
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    // Shadow iOS
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  toolbarContent: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    paddingTop: 16,
    gap: 12,
  },
  toolbarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  writeButton: {
    backgroundColor: theme.colors.primary,
    // Shadow iOS pour bouton principal
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  trackButton: {
    backgroundColor: 'rgba(216, 27, 96, 0.1)', // primary avec alpha
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  trackButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});