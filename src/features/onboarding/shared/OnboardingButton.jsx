//
// ─────────────────────────────────────────────────────────
// 📄 File: shared/OnboardingButton.jsx
// 🧩 Type: Shared Component - Onboarding Button
// 📚 Description: Bouton "Commencer mon voyage" réutilisable avec animation
// 🕒 Version: 1.0.0 - 2025-01-27
// 🧭 Used in: Onboarding screens, pages d'accueil
// 🎭 Design: Bouton principal avec animation d'apparition élégante
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { 
  StandardOnboardingButton, 
  AnimatedOnboardingButton,
  ANIMATION_DURATIONS 
} from '../../../core/ui/animations';

/**
 * Bouton d'onboarding réutilisable avec animation d'apparition
 * @param {Function} onPress - Callback lors du clic
 * @param {string} title - Texte du bouton (optionnel)
 * @param {Object} style - Styles additionnels
 * @param {number} delay - Délai avant apparition (ms)
 * @param {boolean} disabled - État désactivé
 * @param {boolean} loading - État de chargement
 * @param {string} variant - Variante du bouton ('primary', 'secondary')
 * @param {boolean} showAnimation - Afficher l'animation d'apparition
 * @param {ReactNode} children - Contenu personnalisé (remplace title si fourni)
 */
export function OnboardingButton({ 
  onPress, 
  title = "Commencer mon voyage",
  style,
  delay = ANIMATION_DURATIONS.welcomeButton,
  disabled = false,
  loading = false,
  variant = "primary",
  showAnimation = true,
  children
}) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const buttonContent = (
    <StandardOnboardingButton
      title={children ? undefined : title}
      onPress={onPress}
      variant={variant}
      disabled={disabled}
      loading={loading}
    >
      {children}
    </StandardOnboardingButton>
  );

  return (
    <View style={[styles.container, style]}>
      {showAnimation ? (
        <AnimatedOnboardingButton delay={delay}>
          {buttonContent}
        </AnimatedOnboardingButton>
      ) : (
        buttonContent
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    width: '100%',
  },
});

export default OnboardingButton; 