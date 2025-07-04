//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/_layout.jsx
// 🧩 Type : Layout navigation finale
// 📚 Description : 3 onglets équilibrés - Architecture finale
// 🕒 Version : 5.0 - 2025-06-28 - ARCHITECTURE FINALE PROPRE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";

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
        name="cycle"
        options={{
          title: "Mon Cycle",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="radio-button-on" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="conseils"
        options={{
          title: "Conseils",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notebook"
        options={{
          title: "Notes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}