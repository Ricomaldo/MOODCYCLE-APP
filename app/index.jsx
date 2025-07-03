//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/index.jsx
// 🧩 Type : Composant Écran (Screen)
// 📚 Description : Point d'entrée principal de l'application, gère la redirection initiale
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : racine de l'app (root)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { Redirect } from "expo-router";

export default function Index() {
   return <Redirect href="/onboarding/100-bienvenue" />;
}
