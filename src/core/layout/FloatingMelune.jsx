//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/layout/FloatingMelune.jsx
// 🧩 Type : Composant Layout Flottant
// 📚 Description : Melune flottante bas droite avec modal chat
// 🕒 Version : 1.0 - 2025-06-28 - ARCHITECTURE FINALE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Modal, View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Heading } from '../ui/Typography';
import MeluneAvatar from '../../features/shared/MeluneAvatar';
import ChatModal from '../../features/chat/ChatModal';

export default function FloatingMelune() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showChat, setShowChat] = useState(false);

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowChat(true);
  };

  const styles = getStyles(theme, insets);

  return (
    <>
      {/* Bouton flottant */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <MeluneAvatar size={56} />
      </TouchableOpacity>

      {/* Modal Chat */}
      <Modal
        visible={showChat}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChat(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header modal */}
          <View style={[styles.modalHeader, { paddingTop: insets.top }]}>
            <Heading style={styles.modalTitle}>Chat avec Melune</Heading>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowChat(false)}
            >
              <Feather name="x" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Chat */}
          <ChatModal />
        </View>
      </Modal>
    </>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100 + insets.bottom, // Au-dessus tab bar
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
});