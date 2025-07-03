//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/MeluneAvatar.jsx
// 🧩 Type: Composant UI
// 📚 Description: Avatar Melune avec dessins Jeza selon style choisi
// 🕒 Version: 5.0 - 2025-06-23
// 🧭 Used in: NotebookView, CycleView, partages, onboarding
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useMemo, memo } from 'react';
import { View, Image, StyleSheet, Animated, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BodyText } from '../../core/ui/typography';
import { useUserStore } from '../../stores/useUserStore';

function MeluneAvatar({ 
  phase = 'menstrual', 
  size = 'large', 
  avatarStyle,
  style,
  animated = true 
}) {
  const { melune } = useUserStore();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const finalAvatarStyle = avatarStyle || melune?.avatarStyle || 'classic';

  const prevStyleRef = useRef(finalAvatarStyle);
  
  if (__DEV__ && prevStyleRef.current !== finalAvatarStyle) {
    console.info('👤 MeluneAvatar style changed:', {
      from: prevStyleRef.current,
      to: finalAvatarStyle,
      source: avatarStyle ? 'prop' : 'store'
    });
    prevStyleRef.current = finalAvatarStyle;
  }

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const imageSource = useMemo(() => {
    const imagePaths = {
      classic: require('../../assets/images/melune/melune-classic.png'),
      modern: require('../../assets/images/melune/melune-modern.png'),
      mystique: require('../../assets/images/melune/melune-mystique.png'),
    };

    try {
      return imagePaths[finalAvatarStyle] || imagePaths.classic;
    } catch (error) {
      console.error('MeluneAvatar: Erreur chargement image', {
        style: finalAvatarStyle,
        availableStyles: Object.keys(imagePaths),
        error: error.message
      });
      return null;
    }
  }, [finalAvatarStyle]);

  const sizeValue = size === 'large' ? 120 : size === 'medium' ? 80 : 60;
  const borderColor = theme.colors.phases?.[phase] || theme.colors.primary;

  useEffect(() => {
    if (animated) {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);

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
          style
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
        style
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

export default memo(MeluneAvatar);