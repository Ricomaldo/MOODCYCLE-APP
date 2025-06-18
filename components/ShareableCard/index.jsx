import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../config/theme';

const CARD_SIZE = 360; // 1080px équivalent en densité React Native (3x scale)

const ShareableCard = forwardRef(({ message, visible = false }, ref) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        ref={ref}
        colors={[
          theme.colors.primary + '20',
          theme.colors.phases.ovulatory + '15',
          theme.colors.secondary + '10'
        ]}
        style={styles.cardContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Logo MoodCycle top-left */}
        <View style={styles.logoContainer}>
          <MaterialIcons name="favorite" size={16} color={theme.colors.primary} />
          <Text style={styles.logoText}>MoodCycle</Text>
        </View>

        {/* Message centré */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>"{message || ''}"</Text>
        </View>

        {/* Signature Melune bottom-right */}
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureText}>- Melune 🌙</Text>
        </View>

        {/* Bordure subtile */}
        <View style={styles.border} />
      </LinearGradient>
    </View>
  );
});

export default ShareableCard;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -1000, // Hors écran pour ne pas gêner l'UI
    left: 0,
    zIndex: -1,
  },
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: theme.borderRadius.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  border: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    borderRadius: theme.borderRadius.medium,
  },
  logoContainer: {
    position: 'absolute',
    top: theme.spacing.xl,
    left: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: theme.fonts.heading,
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: theme.spacing.s,
    fontWeight: '600',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xl,
  },
  messageText: {
    fontFamily: theme.fonts.heading,
    fontSize: 24,
    lineHeight: 32,
    color: theme.colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  signatureContainer: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
  },
  signatureText: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
}); 