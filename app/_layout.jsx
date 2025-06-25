//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/_layout.jsx
// 🧩 Type : Layout principal (Root Layout)
// 📚 Description : Définit la structure racine de l'application, SafeAreaProvider, Stack navigation, polices, etc.
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : racine de l'app (root)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Quintessential_400Regular,
} from "@expo-google-fonts/quintessential";
import {
  Quicksand_400Regular,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import { useNetworkStatus } from "../src/hooks/useNetworkStatus";
import { useTheme } from "../src/hooks/useTheme";
import DevNavigation from "../src/core/dev/DevNavigation";
import performanceMonitor from "../src/core/monitoring/PerformanceMonitor";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quintessential_400Regular,
    Quicksand_400Regular,
    Quicksand_700Bold,
  });

  // Hook pour surveiller la connexion réseau
  useNetworkStatus();
  
  // Hook pour le thème
  const { isDark } = useTheme();

  // Attendre que les polices soient chargées
  if (!fontsLoaded) {
    return null; // Ou un écran de chargement
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "auto"} />
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        
        {/* 🛠️ TOOLBOX DEV - Disponible partout */}
        <DevNavigation />
        
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
