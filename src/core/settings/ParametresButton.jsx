//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/settings/ParametresButton.jsx
// 🧩 Type: UI Component
// 📚 Description: Bouton paramètres réutilisable pour la navigation
// 🕒 Version: 1.0 - 2025-01-15
// ─────────────────────────────────────────────────────────
//
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import ParametresModal from './ParametresModal';

export default function ParametresButton({ color, size = 24, style }) {
  const theme = useTheme();
  const finalColor = color || theme.colors.textLight;
  const styles = getStyles(theme);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handlePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="settings" size={size} color={finalColor} />
      </TouchableOpacity>
      
      <ParametresModal
        visible={modalVisible}
        onClose={handleClose}
      />
    </>
  );
}

const getStyles = (theme) => StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
}); 