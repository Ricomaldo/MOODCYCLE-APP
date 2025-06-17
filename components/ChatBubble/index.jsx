// components/ChatBubble/index.jsx
import { View, StyleSheet } from 'react-native';
import { BodyText } from '../Typography';
import { theme } from '../../config/theme';

export default function ChatBubble({ message, isUser = false, phase = 'menstrual' }) {
  // Calcul dynamique des couleurs pour les bulles de Melune selon la phase
  const phaseColor = theme.colors.phases[phase];
  const textColor = theme.getTextColorOn(phaseColor);
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userBubble : [styles.meluneBubble, { backgroundColor: phaseColor }]
    ]}>
      <BodyText style={isUser ? styles.userText : [styles.meluneText, { color: textColor }]}>
        {message}
      </BodyText>
    </View>
  );
}

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
