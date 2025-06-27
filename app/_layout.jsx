//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/_layout.jsx
// 🧩 Type : Layout principal (Root Layout)
// 📚 Description : Définit la structure racine de l'application, SafeAreaProvider, Stack navigation, polices, etc.
// 🕒 Version : 3.1 - 2025-06-27 - PARAMETRES BUTTON GLOBAL
// 🧭 Utilisé dans : racine de l'app (root)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import 'react-native-gesture-handler';
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';
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
import ParametresButton from "../src/features/shared/ParametresButton";
import performanceMonitor from "../src/core/monitoring/PerformanceMonitor";

// ✅ Composant wrapper pour utiliser useSafeAreaInsets
function LayoutContent() {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useTheme();
  const pathname = usePathname();

  // ✅ Vérifier si on est dans les tabs (pas l'onboarding)
  const isInTabs = pathname.startsWith('/(tabs)');

  return (
    <>
      <StatusBar style={isDark ? "light" : "auto"} />
      
      {/* ✅ PARAMETRES BUTTON GLOBAL - Seulement dans les tabs */}
      {isInTabs && (
        <View style={[
          styles.parametresContainer,
          { 
            top: insets.top + 10, // 10px en dessous de la safe area
            left: insets.left + 20 // 20px depuis la gauche avec safe area
          }
        ]}>
          <ParametresButton 
            color={theme.colors.primary}
            style={styles.parametresButton}
          />
        </View>
      )}
      
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      
      {/* 🛠️ TOOLBOX DEV - Disponible partout */}
      <DevNavigation />
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
      <SafeAreaProvider>
        <LayoutContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  parametresContainer: {
    position: 'absolute',
    zIndex: 1000, // Au-dessus de tout
  },
  parametresButton: {
    // Styles spécifiques si nécessaire
  },
});
