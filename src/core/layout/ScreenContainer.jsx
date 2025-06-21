//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/layout/ScreenContainer.jsx
// 🧩 Type : Composant utilitaire (layout)
// 📚 Description : Container centralisant la gestion du SafeArea pour tous les écrans principaux
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : tous les écrans principaux (tabs, onboarding, etc.)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../config/theme"; // Importer le thème

export default function ScreenContainer({
  children,
  style,
  edges = ["top", "bottom"],
  hasTabs = false, // Nouvelle prop pour les écrans avec tabs
}) {
  const insets = useSafeAreaInsets();

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
    </View>
  );
}
