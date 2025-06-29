//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/_layout.jsx
// 🧩 Type : Layout de navigation (Tabs)
// 📚 Description : Définit la navigation par onglets principale de l'application (cycle, chat, carnet)
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : navigation principale (tabs)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme"; // Importer le thème

export default function TabLayout() {
  const { theme } = useTheme();
  
return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabBar.activeTintColor,
        tabBarInactiveTintColor: theme.tabBar.inactiveTintColor,
        tabBarStyle: {
          backgroundColor: theme.tabBar.backgroundColor,
          borderTopColor: theme.tabBar.borderColor,
          paddingTop: theme.tabBar.paddingTop,
          height: theme.tabBar.height,
        },
        tabBarLabelStyle: {
          fontSize: theme.tabBar.labelSize,
          fontWeight: theme.tabBar.labelWeight,
          marginBottom: theme.tabBar.marginBottom,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cycle"
        options={{
          title: "Mon cycle",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="radio-button-on" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Melune",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notebook"
        options={{
          title: "Mon carnet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
