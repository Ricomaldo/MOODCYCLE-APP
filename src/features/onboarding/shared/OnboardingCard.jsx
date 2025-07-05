//
// ─────────────────────────────────────────────────────────
// 📄 File: shared/OnboardingCard.jsx
// 🧩 Type: Shared Component - Onboarding Card
// �� Description: Carte réutilisable pour les écrans d'onboarding
// 🕒 Version: 1.0.0 - 2025-01-27
// 🧭 Used in: Écrans 250-rencontre, 300-etape-vie, 800-preferences
// 🎭 Design: Carte unifiée avec variants pour différents usages
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { BodyText } from '../../../core/ui/typography';
import { AnimatedCascadeCard, ANIMATION_DURATIONS } from '../../../core/ui/animations';

/**
 * Carte d'onboarding réutilisable avec animation
 * @param {string} icon - Emoji ou icône à afficher
 * @param {string} title - Titre de la carte
 * @param {string} description - Description de la carte
 * @param {Function} onPress - Callback lors du clic
 * @param {boolean} isSelected - État de sélection
 * @param {string} variant - Type de carte ('choice', 'lifecycle', 'preference')
 * @param {string} color - Couleur principale (pour lifecycle et preference)
 * @param {number} value - Valeur pour les préférences (0, 3, 5)
 * @param {number} index - Index pour animation en cascade
 * @param {number} delay - Délai supplémentaire pour l'animation
 * @param {Object} style - Styles additionnels
 */
export function OnboardingCard({
  icon,
  title,
  description,
  onPress,
  isSelected = false,
  variant = 'choice',
  color,
  value = 0,
  index = 0,
  delay = ANIMATION_DURATIONS.elegant,
  style
}) {
  const theme = useTheme();
  const styles = getStyles(theme, variant, color, value, isSelected);

  const renderIcon = () => {
    if (variant === 'lifecycle') {
      return (
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <BodyText style={styles.iconText}>{icon}</BodyText>
        </View>
      );
    }
    
    if (variant === 'preference') {
      return (
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <BodyText style={styles.iconText}>{icon}</BodyText>
        </View>
      );
    }
    
    // Variant 'choice' - icône simple
    return (
      <BodyText style={styles.choiceIcon}>{icon}</BodyText>
    );
  };

  const renderIntensityBadge = () => {
    if (variant === 'preference' && value > 0) {
      const backgroundColor = getColorWithIntensity(color, value);
      return (
        <View style={[styles.intensityBadge, { backgroundColor }]}>
          <BodyText style={styles.intensityText}>
            {value === 3 ? 'Intéressé' : 'Passionné'}
          </BodyText>
        </View>
      );
    }
    return null;
  };

  const getColorWithIntensity = (baseColor, intensity) => {
    if (intensity === 0) return theme.colors.border;
    if (intensity === 3) return baseColor + '80';
    return baseColor;
  };

  return (
    <AnimatedCascadeCard
      index={index}
      delay={delay}
      style={[styles.cardContainer, style]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          {renderIcon()}
          <View style={styles.cardInfo}>
            <BodyText style={styles.cardTitle}>{title}</BodyText>
            <BodyText style={styles.cardDescription}>{description}</BodyText>
            {renderIntensityBadge()}
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedCascadeCard>
  );
}

const getStyles = (theme, variant, color, value, isSelected) => {
  // Déterminer les couleurs de bordure selon le variant
  let borderColor = theme.colors.border;
  let backgroundColor = theme.colors.surface;
  
  if (variant === 'choice' && isSelected) {
    borderColor = theme.colors.primary;
    backgroundColor = theme.colors.primary + '08';
  } else if (variant === 'lifecycle' && isSelected) {
    borderColor = theme.colors.primary;
    backgroundColor = theme.colors.primary + '08';
  } else if (variant === 'preference' && value > 0) {
    borderColor = value === 3 ? color + '80' : color;
  }

  return StyleSheet.create({
    cardContainer: {
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    card: {
      backgroundColor,
      padding: theme.spacing.l,
      borderRadius: theme.borderRadius.large,
      borderWidth: 2,
      borderColor,
      ...(variant === 'lifecycle' && {
        borderLeftWidth: 4,
        borderLeftColor: color || theme.colors.primary,
      }),
    },
    
    cardHeader: {
      flexDirection: 'row',
      alignItems: variant === 'preference' ? 'flex-start' : 'center',
    },
    
    // Icône pour choice
    choiceIcon: {
      fontSize: 24,
      marginRight: theme.spacing.m,
      width: 48,
      height: 48,
      textAlign: 'center',
      lineHeight: 48,
    },
    
    // Conteneur d'icône pour lifecycle et preference
    iconContainer: {
      width: variant === 'lifecycle' ? 48 : 40,
      height: variant === 'lifecycle' ? 48 : 40,
      borderRadius: variant === 'lifecycle' ? 24 : 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.m,
    },
    
    iconText: {
      fontSize: variant === 'lifecycle' ? 24 : 20,
      lineHeight: variant === 'lifecycle' ? 48 : 40,
      textAlign: 'center',
    },
    
    cardInfo: {
      flex: 1,
    },
    
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: variant === 'preference' ? 2 : theme.spacing.m,
    },
    
    cardDescription: {
      fontSize: 14,
      color: theme.colors.textLight,
      lineHeight: variant === 'preference' ? 18 : 20,
    },
    
    intensityBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.small,
      marginTop: theme.spacing.s,
    },
    
    intensityText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: '600',
    },
  });
};

export default OnboardingCard;
