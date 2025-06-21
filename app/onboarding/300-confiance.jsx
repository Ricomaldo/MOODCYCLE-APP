//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/300-confiance.jsx
// 🧩 Type : Composant Écran (Screen)
// 📚 Description : Écran de confiance et confidentialité, explication de la protection des données
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : onboarding flow (étape 3)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import ScreenContainer from "../../src/core/layout/ScreenContainer";
import { Heading2, BodyText } from "../../src/core/ui/Typography";
import { useUserStore } from "../../src/stores/useUserStore";
import { theme } from "../../src/config/theme";
import MeluneAvatar from "../../src/features/shared/MeluneAvatar";
import ChatBubble from "../../src/features/chat/ChatBubble";

export default function ConfianceScreen() {
  const router = useRouter();
  const { updateProfile } = useUserStore();

  // Animation simple
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTrust = () => {
    // Marquer la confiance accordée
    updateProfile({
      trustGranted: true,
      trustDate: new Date().toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
      }),
    });

    setTimeout(() => {
      router.push("/onboarding/375-age");
    }, 300);
  };

  return (
    <ScreenContainer style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Avatar Melune avec expression confiante */}
        <View style={styles.avatarContainer}>
          <MeluneAvatar phase="menstrual" size="medium" />
        </View>

        {/* Messages de confiance */}
        <View style={styles.messagesContainer}>
          <View style={styles.messageWrapper}>
            <ChatBubble
              message="Pour te guider justement, j'ai besoin de te connaître intimement."
              isUser={false}
            />
          </View>

          <View style={styles.messageWrapper}>
            <ChatBubble
              message="Plus tu me fais confiance, plus mes conseils seront précis pour toi."
              isUser={false}
            />
          </View>

          <View style={styles.messageWrapper}>
            <ChatBubble
              message="Tout restera entre nous, promis ✨"
              isUser={false}
            />
          </View>
        </View>

        {/* Explication confidentialité */}
        <View style={styles.privacyContainer}>
          <View style={styles.privacyBox}>
            <BodyText style={styles.privacyIcon}>🔒</BodyText>
            <BodyText style={styles.privacyText}>
              Tes données restent sur ton téléphone et ne servent qu'à
              personnaliser tes conseils. Aucun partage, aucune publicité.
            </BodyText>
          </View>
        </View>

        {/* Bouton de confiance */}
        <TouchableOpacity
          style={styles.trustButton}
          onPress={handleTrust}
          activeOpacity={0.8}
        >
          <BodyText style={styles.trustButtonText}>
            💙 Je te fais confiance, Melune
          </BodyText>
        </TouchableOpacity>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },

  avatarContainer: {
    alignItems: "center",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.l,
  },

  messagesContainer: {
    marginBottom: theme.spacing.xl,
  },

  messageWrapper: {
    alignItems: "flex-start",
    marginBottom: theme.spacing.m,
  },

  privacyContainer: {
    marginBottom: theme.spacing.xl,
  },

  privacyBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.secondary + "20",
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },

  privacyIcon: {
    fontSize: 20,
    marginRight: theme.spacing.s,
    marginTop: 2,
  },

  privacyText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    fontStyle: "italic",
  },

  trustButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: theme.spacing.l,
  },

  trustButtonText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    textAlign: "center",
  },
});
