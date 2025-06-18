// components/ChatBubble/index.jsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BodyText } from '../Typography';
import { theme } from '../../config/theme';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useCycleStore } from '../../stores/useCycleStore';

export default function ChatBubble({ message, isUser = false, phase = 'menstrual' }) {
  const { saveFromChat } = useNotebookStore();
  const { getCurrentPhaseInfo } = useCycleStore();
  
  // Calcul dynamique des couleurs pour les bulles de Melune selon la phase
  const phaseColor = theme.colors.phases[phase];
  const textColor = theme.getTextColorOn(phaseColor);
  
  const handleLongPress = () => {
    if (!isUser) { // Seulement pour messages Melune
      Alert.alert(
        "💾 Sauvegarder",
        "Ajouter ce conseil à ton carnet ?",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Sauver", 
            onPress: () => {
              const currentPhase = getCurrentPhaseInfo().phase;
              saveFromChat(message, currentPhase);
              Alert.alert("✨", "Ajouté à ton carnet !");
            }
          }
        ]
      );
    }
  };

  const BubbleContainer = isUser ? View : TouchableOpacity;
  const containerProps = isUser ? {} : { 
    onLongPress: handleLongPress,
    delayLongPress: 500,
    activeOpacity: 0.8
  };

  return (
    <BubbleContainer 
      style={[
        styles.container,
        isUser ? styles.userBubble : [styles.meluneBubble, { backgroundColor: phaseColor }]
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