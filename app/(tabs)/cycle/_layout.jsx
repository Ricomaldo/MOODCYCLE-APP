//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/cycle/_layout.jsx
// 🧩 Type : Composant Écran
// 📚 Description : Composant affichant l’écran principal
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : /notebook cycle route
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { Stack } from "expo-router";

export default function CycleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="phases/[id]" />
    </Stack>
  );
}
