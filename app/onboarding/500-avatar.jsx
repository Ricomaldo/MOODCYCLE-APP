//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/500-avatar.jsx
// 🎯 Status: ✅ PATTERN ABSOLU - Conforme au guide
// 📝 Description: Redirection vers le nouveau flux avatar
// 🔄 Cycle: Onboarding - Étape 6/8
// ─────────────────────────────────────────────────────────
//
import React, { useEffect } from 'react';
import { router } from 'expo-router';

export default function AvatarScreen() {
  useEffect(() => {
    // Redirection immédiate vers le nouveau flux avatar
    router.replace('/onboarding/500-avatar-style');
  }, []);

  return null; // Pas de rendu, redirection immédiate
} 