//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/_layout.jsx
// 🧩 Type : Layout de navigation (Tabs)
// 📚 Description : Définit la navigation par onglets principale de l’application (cycle, chat, carnet)
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : navigation principale (tabs)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E91E63", // Framboise chaleureuse
        tabBarInactiveTintColor: "#757575",
        tabBarStyle: {
          backgroundColor: "#FAFAFA",
          borderTopColor: "#E0E0E0",
          paddingTop: 8,
          height: 85,
          position: "absolute",
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 8,
        },
        headerShown: false,
      }}
    >
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
