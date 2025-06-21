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

export default function ScreenContainer({
  children,
  style,
  edges = ["top", "bottom"],
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          paddingTop: edges.includes("top") ? insets.top : 0,
          paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
          flex: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
