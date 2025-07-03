//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/_layout.jsx  
// 🧩 Type: Layout Navigation
// 📚 Description: Stack navigation onboarding avec écrans ordonnés
// 🕒 Version: 3.1 - 2025-06-23 - STOP SLIDE ANIMATION
// 🧭 Used in: Onboarding flow - Révélation cyclique (8 étapes)
// ─────────────────────────────────────────────────────────
//
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade_from_bottom',
        transitionSpec: {
          open: {
            animation: 'spring',
            config: {
              stiffness: 800,
              damping: 35,
              mass: 1,
            },
          },
          close: {
            animation: 'spring',
            config: {
              stiffness: 800,
              damping: 35,
              mass: 1,
            },
          },
        },
      }}
    >
      <Stack.Screen name="100-bienvenue" />
      <Stack.Screen name="200-rencontre" />
      <Stack.Screen name="300-etape-vie" />
      <Stack.Screen name="400-cycle" />
      <Stack.Screen name="500-preferences" />
      <Stack.Screen name="550-prenom" />
      <Stack.Screen name="600-avatar" />
      <Stack.Screen name="650-terminology" />
      <Stack.Screen name="700-essai" />
      <Stack.Screen name="800-demarrage" />
    </Stack>
  );
}