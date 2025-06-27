//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/shared/MeluneAvatar.jsx
// 🧩 Type : Composant UI
// 📚 Description : Avatar Melune avec dessins Jeza selon style choisi
// 🕒 Version : 5.0 - 2025-06-23
// 🧭 Utilisé dans : NotebookView, CycleView, partages, onboarding
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useEffect, useRef, useMemo } from 'react';
import { View, Image, StyleSheet, Animated, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BodyText } from '../../core/ui/Typography';
import { useUserStore } from '../../stores/useUserStore';

export default function MeluneAvatar({ phase = 'menstrual', size = 'large', style, animated = true }) {
  // Récupération du style depuis le store avec fallback sur la prop
  const { melune } = useUserStore();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const avatarStyle = style || melune?.avatarStyle || 'classic';

  // ✅ DEBUG : Log pour tracer les changements
  console.log('👤 MeluneAvatar render:', {
    styleProp: style,
    meluneFromStore: melune?.avatarStyle,
    finalAvatarStyle: avatarStyle
  });

  // Animations iOS-like
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sélection de l'image selon le style choisi - Version reactive avec useMemo
  const imageSource = useMemo(() => {
    const imagePaths = {
      classic: require('../../assets/images/melune/melune-classic.png'),
      modern: require('../../assets/images/melune/melune-modern.png'),
      mystique: require('../../assets/images/melune/melune-mystique.png'),
    };

    try {
      return imagePaths[avatarStyle] || imagePaths.classic;
    } catch (error) {
      console.warn('MeluneAvatar: Erreur chargement image', {
        style: avatarStyle,
        availableStyles: Object.keys(imagePaths),
        error: error.message
      });
      return null;
    }
  }, [avatarStyle]);

  const sizeValue = size === 'large' ? 160 : size === 'medium' ? 120 : 80;
  const borderColor = theme.colors.phases?.[phase] || theme.colors.primary;

  useEffect(() => {
    if (animated) {
      // Reset des animations pour les changements de style
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);

      // Animation d'entrée iOS-like (scale + fade)
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 180,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation de pulse subtile continue
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [animated, avatarStyle]); // Ajout de 'avatarStyle' dans les dépendances pour re-animer lors du changement

  const animatedStyle = animated ? {
    opacity: opacityAnim,
    transform: [
      { scale: Animated.multiply(scaleAnim, pulseAnim) }
    ],
  } : {};

  if (!imageSource) {
    // Fallback si aucune image disponible
    return (
      <View
        style={[
          styles.container,
          styles.fallbackContainer,
          {
            borderColor: borderColor,
            width: sizeValue + 12,
            height: sizeValue + 12,
          },
        ]}
      >
        <BodyText style={[styles.fallbackText, { fontSize: sizeValue * 0.4 }]}>🧚‍♀️</BodyText>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: borderColor,
          width: sizeValue + 12, // Pour le bord
          height: sizeValue + 12,
        },
        animatedStyle,
      ]}
    >
      <Image
        source={imageSource}
        style={{ 
          width: sizeValue, 
          height: sizeValue,
          borderRadius: sizeValue / 2, // Cercle parfait pour l'image
        }}
        resizeMode="cover" // Changé en cover pour un meilleur rendu des dessins
      />
    </Animated.View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 9999, // Cercle parfait
    padding: 4,
    overflow: 'hidden',
    backgroundColor: '#fff', // Fond blanc pour faire ressortir les dessins
  },
  fallbackContainer: {
    backgroundColor: theme.colors.primary + '20',
  },
  fallbackText: {
    textAlign: 'center',
    // fontSize sera défini dynamiquement selon size prop
  },
});