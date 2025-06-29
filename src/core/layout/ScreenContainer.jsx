//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/layout/ScreenContainer.jsx
// 🧩 Type : Composant utilitaire (layout)
// 📚 Description : Container avec SafeArea + FloatingMelune intégrée
// 🕒 Version : 4.0 - 2025-06-28 - ARCHITECTURE FINALE + MELUNE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import FloatingMelune from "./FloatingMelune";

export default function ScreenContainer({
  children,
  style,
  edges = ["top", "bottom"],
  hasTabs = false,
  showMelune = true, // Nouvelle prop pour contrôler Melune
}) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  
  // Détecter si on est dans l'onboarding
  const isOnboarding = pathname?.startsWith('/onboarding');
  
  // Ne pas afficher Melune dans l'onboarding
  const shouldShowMelune = showMelune && !isOnboarding;

  return (
    <View
      style={[
        {
          flex: 1,
          paddingTop: edges.includes("top") ? insets.top : 0,
          paddingBottom: edges.includes("bottom") && !hasTabs ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
      {shouldShowMelune && <FloatingMelune />}
    </View>
  );
}