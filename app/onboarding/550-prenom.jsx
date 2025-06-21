//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/550-prenom.jsx
// 🧩 Type : Composant Écran (Screen)
// 📚 Description : Écran de saisie du prénom de l'utilisatrice
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : onboarding flow (étape 7)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenContainer from "../../src/core/layout/ScreenContainer";
import { Heading1, Heading2, BodyText } from "../../src/core/ui/Typography";
import { useUserStore } from "../../src/stores/useUserStore";
import { theme } from "../../src/config/theme";
import MeluneAvatar from "../../src/features/shared/MeluneAvatar";
import ChatBubble from "../../src/features/chat/ChatBubble";

export default function PrenomScreen() {
  const router = useRouter();
  const { updateProfile, profile } = useUserStore();

  const [prenom, setPrenom] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation d'entrée douce
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation du cœur qui bat
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePrenomChange = (text) => {
    setPrenom(text);
    setShowValidation(text.length >= 2);
  };

  const handleContinue = () => {
    if (prenom.trim().length > 0) {
      updateProfile({
        prenom: prenom.trim(),
      });
      router.push("/onboarding/600-avatar");
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Avatar Melune avec expression douce */}
        <Animated.View
          style={[
            styles.avatarContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <MeluneAvatar phase="ovulatory" size="medium" />
        </Animated.View>

        {/* Messages intimes de Melune */}
        <Animated.View
          style={[
            styles.messagesContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.messageWrapper}>
            <ChatBubble
              message="Nous avons déjà partagé tant de choses ensemble... ✨"
              isUser={false}
            />
          </View>

          <View style={styles.messageWrapper}>
            <ChatBubble
              message="Pour que notre connexion soit vraiment personnelle, comment puis-je t'appeler ?"
              isUser={false}
            />
          </View>
        </Animated.View>

        {/* Section prénom avec cœur animé */}
        <Animated.View
          style={[
            styles.prenomSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.prenomHeader}>
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <BodyText style={styles.heartIcon}>💙</BodyText>
            </Animated.View>
            <Heading2 style={styles.prenomTitle}>Mon prénom est...</Heading2>
          </View>

          <TextInput
            style={styles.prenomInput}
            value={prenom}
            onChangeText={handlePrenomChange}
            placeholder="Tape ton prénom ici"
            placeholderTextColor={theme.colors.textLight}
            maxLength={12}
            autoCapitalize="words"
            autoFocus={true}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />

          <BodyText style={styles.helpText}>
            Juste ton prénom, pour que nos échanges soient plus chaleureux ✨
          </BodyText>
        </Animated.View>

        {/* Validation et bouton */}
        {showValidation && (
          <Animated.View
            style={[
              styles.validationContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.previewContainer}>
              <BodyText style={styles.previewText}>
                "Ravie de te connaître, {prenom} ! 🌸"
              </BodyText>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <BodyText style={styles.continueButtonText}>
                Parfait, continue ! ✨
              </BodyText>
            </TouchableOpacity>
          </Animated.View>
        )}
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
  prenomSection: {
    marginBottom: theme.spacing.xl,
  },
  prenomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.l,
  },
  heartIcon: {
    fontSize: 24,
    marginRight: theme.spacing.s,
  },
  prenomTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontStyle: "italic",
  },
  prenomInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.primary + "40",
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    fontSize: 18,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    textAlign: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpText: {
    textAlign: "center",
    color: theme.colors.textLight,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: theme.spacing.s,
    lineHeight: 18,
  },
  validationContainer: {
    alignItems: "center",
  },
  previewContainer: {
    backgroundColor: theme.colors.secondary + "20",
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },
  previewText: {
    fontSize: 16,
    color: theme.colors.text,
    fontStyle: "italic",
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    textAlign: "center",
  },
});
