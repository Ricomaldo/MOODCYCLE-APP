//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/shared/MeluneAvatar.jsx
// 🧩 Type : Composant UI
// 📚 Description : Avatar Melune affiché selon la phase et le style avec animations iOS
// 🕒 Version : 4.0 - 2025-06-21
// 🧭 Utilisé dans : NotebookView, CycleView, partages
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { theme } from '../../config/theme';

export default function MeluneAvatar({ phase = 'menstrual', size = 'large', style = 'classic', animated = true }) {
  // Animations iOS-like
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pour le MVP, on utilise une seule image
  const getSource = () => {
    try {
      return require('../../assets/images/melune/default.png');
    } catch (error) {
      console.log('Erreur chargement image Melune:', error);
      return null;
    }
  };

  const sizeValue = size === 'large' ? 160 : size === 'medium' ? 120 : 80;
  const borderColor = theme.colors.phases?.[phase] || theme.colors.primary;

  useEffect(() => {
    if (animated) {
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
  }, [animated]);

  const animatedStyle = animated ? {
    opacity: opacityAnim,
    transform: [
      { scale: Animated.multiply(scaleAnim, pulseAnim) }
    ],
  } : {};

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
        source={getSource()}
        style={{ width: sizeValue, height: sizeValue }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 9999, // Cercle parfait
    padding: 4,
    overflow: 'hidden',
  },
});
