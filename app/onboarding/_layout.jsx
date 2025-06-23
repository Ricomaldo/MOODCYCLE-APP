//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/_layout.jsx  
// 🧩 Type: Layout Navigation
// 📚 Description: Stack navigation onboarding avec écrans ordonnés
// 🕒 Version: 1.0 - 2025-06-23
// 🧭 Used in: Onboarding flow complet (8 écrans)
// ─────────────────────────────────────────────────────────
//
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true, // Permettre swipe retour iOS
        animationTypeForReplace: 'push', // Animation cohérente
      }}
    >
      {/* Étape 1/4 : Connexion */}
      <Stack.Screen 
        name="100-promesse" 
        options={{
          gestureEnabled: false, // Pas de retour depuis le premier écran
        }}
      />
      <Stack.Screen name="200-rencontre" />
      
      {/* Étape 2/4 : Ton rythme */}
      <Stack.Screen name="300-confiance" />
      <Stack.Screen name="400-cycle" />
      
      {/* Étape 3/4 : Ton style */}
      <Stack.Screen name="500-preferences" />
      <Stack.Screen name="550-prenom" />
      <Stack.Screen name="600-avatar" />
      
      {/* Étape 4/4 : Prête ! */}
      <Stack.Screen name="700-paywall" />
      <Stack.Screen 
        name="800-cadeau"
        options={{
          gestureEnabled: false, // Pas de retour depuis la finalisation
        }}
      />
    </Stack>
  );
}