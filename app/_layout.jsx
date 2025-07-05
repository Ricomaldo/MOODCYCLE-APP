//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/_layout.jsx
// 🧩 Type : Layout principal (Root Layout)
// 📚 Description : Définit la structure racine de l'application, SafeAreaProvider, Stack navigation, polices, etc.
// 🕒 Version : 3.3 - 2025-06-27 - NO SLIDE ANIMATIONS
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
import DevPanel from "../src/core/dev/DevPanel";
import performanceMonitor from "../src/core/monitoring/PerformanceMonitor";
import { initializeIntelligence } from "../src/services/IntelligenceInit";
import { useEffect } from "react";
import Config from "../src/config/appConfig";
import { AppStoreProvider } from "../src/core/AppStoreProvider";

// ✅ Composant wrapper simplifié
function LayoutContent() {
  const { isDark } = useTheme();

  // 🧠 Initialisation des services d'intelligence
  useEffect(() => {
    initializeIntelligence(Config.getIntelligenceConfig());
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "auto"} />
      
      <Stack
        screenOptions={{
          headerShown: false,
          // AUCUNE ANIMATION AU NIVEAU ROOT
          animation: 'none',
          presentation: 'card',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      >
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
            animation: 'none',
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            animation: 'none',
          }} 
        />
      </Stack>
      
      {/* 🛠️ TOOLBOX DEV - Disponible partout */}
      <DevPanel />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quintessential_400Regular,
    Quicksand_400Regular,
    Quicksand_700Bold,
  });

  // Hook pour surveiller la connexion réseau
  useNetworkStatus();

  // Attendre que les polices soient chargées
  if (!fontsLoaded) {
    return null; // Ou un écran de chargement
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStoreProvider>
        <SafeAreaProvider>
          <LayoutContent />
        </SafeAreaProvider>
      </AppStoreProvider>
    </GestureHandlerRootView>
  );
}
