//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/_layout.jsx  
// 🧩 Type: Layout Navigation
// 📚 Description: Stack navigation onboarding avec écrans ordonnés
// 🕒 Version: 3.8 - 2024-03-19 - NAVIGATION CONDITIONNELLE + SAFE AREAS
// 🧭 Used in: Onboarding flow - Révélation cyclique (9 étapes)
// ─────────────────────────────────────────────────────────
//
import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import OnboardingNavigation from "../../src/features/shared/OnboardingNavigation";

export default function OnboardingLayout() {
  const pathname = usePathname();
  const currentScreen = pathname.split('/').pop(); // Extrait '200-bonjour' de '/onboarding/200-bonjour'
  const showNavigation = currentScreen !== '100-bienvenue';

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {/* Navigation fixe en haut - sauf sur la première page */}
        {showNavigation && (
          <SafeAreaView edges={['top']}>
            <OnboardingNavigation currentScreen={currentScreen} />
          </SafeAreaView>
        )}

        {/* Stack des écrans */}
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade',
            presentation: 'card',
            animationDuration: 200,
            contentStyle: {
              backgroundColor: 'white', // ou theme.colors.background
            },
          }}
        >
          <Stack.Screen name="100-bienvenue" />
          <Stack.Screen name="200-bonjour" />
          <Stack.Screen name="250-rencontre" />
          <Stack.Screen name="300-etape-vie" />
          <Stack.Screen name="400-prenom" />
          <Stack.Screen name="500-avatar" />
          <Stack.Screen name="600-terminology" />
          <Stack.Screen name="700-cycle" />
          <Stack.Screen name="800-preferences" />
          <Stack.Screen name="900-essai" />
          <Stack.Screen name="950-demarrage" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}