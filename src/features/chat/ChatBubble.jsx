//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/chat/ChatBubble.jsx
// 🧩 Type: UI Component
// 📚 Description: Bulle de message pour le chat, gère l'affichage et la sauvegarde d'un message
// 🕒 Version: 3.0 - 2025-06-21
// 🧭 Used in: chat screen, notebook, shared UI
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BodyText } from '../../core/ui/Typography';
import { theme } from '../../config/theme';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useUserStore } from '../../stores/useUserStore';

export default function ChatBubble({ message, isUser = false, phase = 'menstrual' }) {
  const { addEntry } = useNotebookStore();
  const { getCurrentPhaseInfo } = useUserStore();

  // Calcul dynamique des couleurs pour les bulles de Melune selon la phase
  const phaseColor = theme.colors.phases[phase];
  const textColor = theme.getTextColorOn(phaseColor);

  const handleLongPress = () => {
    if (!isUser) {
      // Seulement pour messages Melune
      Alert.alert('💾 Sauvegarder', 'Ajouter ce conseil à ton carnet ?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Sauver',
          onPress: () => {
            const currentPhase = getCurrentPhaseInfo().phase;
            addEntry(message, 'saved', [`#${currentPhase}`, '#conseil']);
            Alert.alert('✨', 'Ajouté à ton carnet !');
          },
        },
      ]);
    }
  };

  const BubbleContainer = isUser ? View : TouchableOpacity;
  const containerProps = isUser
    ? {}
    : {
        onLongPress: handleLongPress,
        delayLongPress: 500,
        activeOpacity: 0.8,
      };

  return (
    <BubbleContainer
      style={[
        styles.container,
        isUser ? styles.userBubble : [styles.meluneBubble, { backgroundColor: phaseColor }],
      ]}
      {...containerProps}
    >
      <BodyText style={isUser ? styles.userText : [styles.meluneText, { color: textColor }]}>
        {message}
      </BodyText>
    </BubbleContainer>
  );
}

// Styles identiques à ton original
const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginVertical: theme.spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#EFEFEF',
    borderBottomRightRadius: theme.spacing.xs,
  },
  meluneBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: theme.spacing.xs,
  },
  userText: {
    color: theme.colors.text,
  },
  meluneText: {
    color: theme.getTextColorOn(theme.colors.primary),
  },
});
