//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/shared/MeluneAvatar.jsx
// 🧩 Type : Composant UI
// 📚 Description : Avatar Melune avec dessins Jeza selon style choisi
// 🕒 Version : 5.0 - 2025-06-23
// 🧭 Utilisé dans : NotebookView, CycleView, partages, onboarding
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useEffect, useRef, useMemo, memo } from 'react';
import { View, Image, StyleSheet, Animated, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BodyText } from '../../core/ui/Typography';
import { useUserStore } from '../../stores/useUserStore';

function MeluneAvatar({ 
  phase = 'menstrual', 
  size = 'large', 
  avatarStyle,  // ✅ Renommé de 'style' en 'avatarStyle'
  style,        // ✅ Nouveau : style du conteneur
  animated = true 
}) {
  // Récupération du style depuis le store avec fallback sur la prop
  const { melune } = useUserStore();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const finalAvatarStyle = avatarStyle || melune?.avatarStyle || 'classic';

  // ✅ DEBUG : Log conditionnel (seulement si __DEV__ et changements)
  const prevStyleRef = useRef(finalAvatarStyle);
  
  if (__DEV__ && prevStyleRef.current !== finalAvatarStyle) {
    console.log('👤 MeluneAvatar style changed:', {
      from: prevStyleRef.current,
      to: finalAvatarStyle,
      source: avatarStyle ? 'prop' : 'store'
    });
    prevStyleRef.current = finalAvatarStyle;
  }

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
      return imagePaths[finalAvatarStyle] || imagePaths.classic;
    } catch (error) {
      console.warn('MeluneAvatar: Erreur chargement image', {
        style: finalAvatarStyle,
        availableStyles: Object.keys(imagePaths),
        error: error.message
      });
      return null;
    }
  }, [finalAvatarStyle]);

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
  }, [animated, finalAvatarStyle]);

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
          style  // ✅ Applique le style du conteneur
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
          width: sizeValue + 12,
          height: sizeValue + 12,
        },
        animatedStyle,
        style  // ✅ Applique le style du conteneur
      ]}
    >
      <Image
        source={imageSource}
        style={{ 
          width: sizeValue, 
          height: sizeValue,
          borderRadius: sizeValue / 2,
        }}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 9999,
    padding: 4,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  fallbackContainer: {
    backgroundColor: theme.colors.primary + '20',
  },
  fallbackText: {
    textAlign: 'center',
  },
});

// ✅ Export avec memo pour éviter les re-renders
export default memo(MeluneAvatar);