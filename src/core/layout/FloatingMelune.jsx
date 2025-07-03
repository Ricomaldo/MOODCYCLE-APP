//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/layout/FloatingMelune.jsx
// 🧩 Type : Composant Layout Flottant
// 📚 Description : Melune flottante bas droite avec modal chat
// 🕒 Version : 1.0 - 2025-06-28 - ARCHITECTURE FINALE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Modal, View, Platform, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useUserStore } from '../../stores/useUserStore';
import { Heading } from '../ui/typography';
import MeluneAvatar from '../../features/shared/MeluneAvatar';
import ChatModal from '../../features/chat/ChatModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FloatingMelune({ hideInOnboarding = false }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { melune } = useUserStore();
  const [showChat, setShowChat] = useState(false);
  
  // Ne pas afficher dans l'onboarding si demandé
  if (hideInOnboarding) {
    return null;
  }
  
  // 🧚‍♀️ Animations pour une fée capricieuse
  const floatAnim = useRef(new Animated.Value(0)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const positionAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 🌟 Effet de flottement continu (mouvement vertical subtil)
  useEffect(() => {
    if (!melune?.animated) return;
    
    const floatAnimation = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000 + Math.random() * 1000, // Durée variable
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 8,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
      ]).start(() => floatAnimation());
    };
    floatAnimation();
  }, [melune?.animated]);

  // 🎭 Mouvement capricieux occasionnel (changement de position)
  useEffect(() => {
    if (!melune?.animated) return;
    
    const capriciousMovement = () => {
      const timeout = 8000 + Math.random() * 12000; // Entre 8 et 20 secondes
      
      setTimeout(() => {
        // Petits déplacements aléatoires
        const randomX = (Math.random() - 0.5) * 40; // ±20px
        const randomY = (Math.random() - 0.5) * 60; // ±30px
        
        Animated.sequence([
          // Mouvement vers nouvelle position
          Animated.parallel([
            Animated.spring(positionAnim.x, {
              toValue: randomX,
              tension: 50,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(positionAnim.y, {
              toValue: randomY,
              tension: 50,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
          // Petit délai
          Animated.delay(2000 + Math.random() * 3000),
          // Retour vers position originale
          Animated.parallel([
            Animated.spring(positionAnim.x, {
              toValue: 0,
              tension: 40,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(positionAnim.y, {
              toValue: 0,
              tension: 40,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => capriciousMovement());
      }, timeout);
    };
    
    capriciousMovement();
  }, [melune?.animated]);

  // 🎪 Petit wiggle quand on la touche
  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animation de réaction au touch
    Animated.sequence([
      Animated.parallel([
        Animated.timing(wiggleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(wiggleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    setShowChat(true);
  };

  // 🎨 Interpolations pour les animations
  const wiggleRotation = wiggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  // Calculer la position selon les préférences
  const getPositionStyle = (position) => {
    const baseDistance = 20;
    const tabBarOffset = 100;
    
    switch (position) {
      case 'bottom-left':
        return {
          bottom: tabBarOffset + insets.bottom,
          left: baseDistance,
        };
      case 'top-right':
        return {
          top: 60 + insets.top,
          right: baseDistance,
        };
      case 'top-left':
        return {
          top: 60 + insets.top,
          left: baseDistance,
        };
      case 'bottom-right':
      default:
        return {
          bottom: tabBarOffset + insets.bottom,
          right: baseDistance,
        };
    }
  };

  const styles = getStyles(theme, insets, melune?.position || 'bottom-right');

  return (
    <>
      {/* Bouton flottant animé */}
      <Animated.View
        style={[
          styles.floatingButton,
          getPositionStyle(melune?.position || 'bottom-right'),
          {
            transform: melune?.animated ? [
              { translateX: positionAnim.x },
              { translateY: Animated.add(positionAnim.y, floatAnim) },
              { rotate: wiggleRotation },
              { scale: scaleAnim },
            ] : [
              { scale: scaleAnim }, // Garde au moins le scale pour le feedback au touch
            ],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.touchableArea}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <MeluneAvatar 
            size={56} 
            avatarStyle={melune?.avatarStyle || 'classic'}
            animated={melune?.animated !== false}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Modal Chat */}
      <Modal
        visible={showChat}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChat(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header modal */}
          <View style={[styles.modalHeader, { paddingTop: insets.top }]}>
            <Heading style={styles.modalTitle}>Chat avec Melune</Heading>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowChat(false)}
            >
              <Feather name="x" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Chat */}
          <ChatModal />
        </View>
      </Modal>
    </>
  );
}

const getStyles = (theme, insets, position) => StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    ...theme.getGlassmorphismStyle(theme.colors.primary, {
      borderWidth: 2,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    }),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  touchableArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
});