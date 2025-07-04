// src/features/onboarding/cycle/CycleDurationWheel.jsx
import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Caption } from '../../../core/ui/typography';
import * as Haptics from 'expo-haptics';

export const CycleDurationWheel = ({ value, onChange, persona, theme }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const styles = getStyles(theme);
  
  // Messages d'encouragement personnalisés par persona
  const getEncouragement = (length) => {
    const messages = {
      emma: {
        short: "Cycle court, c'est tout à fait normal 🌸",
        normal: "Parfait, tu es pile dans la moyenne 💫",
        long: "Cycle long, chaque femme est unique 🌙"
      },
      laure: {
        short: "Cycle court détecté - variante normale",
        normal: "Durée optimale pour la plupart des femmes",
        long: "Cycle long - reste dans la normale"
      },
      clara: {
        short: "Team cycle court ! C'est cool 🚀",
        normal: "Classic ! La plupart sont comme toi ✨",
        long: "Team cycle long ! Unique style 🌟"
      },
      sylvie: {
        short: "Ton rythme court a sa sagesse",
        normal: "Un cycle harmonieux et équilibré",
        long: "Un cycle long porte sa propre magie"
      },
      christine: {
        short: "Cycle court, parfaitement valide",
        normal: "Une durée tout à fait classique",
        long: "Cycle long, votre rythme personnel"
      }
    };
    
    const type = length < 26 ? 'short' : length > 32 ? 'long' : 'normal';
    const personaMessages = messages[persona] || messages.emma;
    return personaMessages[type];
  };
  
  const handlePress = (newValue) => {
    // Haptic feedback iOS
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animation bounce
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        tension: 200,
        friction: 3,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 5,
        useNativeDriver: true
      })
    ]).start();
    
    onChange(newValue);
  };
  
  // Animation d'entrée
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true
    }).start();
  }, []);
  
  return (
    <View style={styles.container}>
      {/* Affichage principal animé */}
      <Animated.View style={[styles.display, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.bigNumber}>{value}</Text>
        <Caption style={styles.daysLabel}>jours</Caption>
      </Animated.View>
      
      {/* Boutons rapides populaires */}
      <View style={styles.quickButtons}>
        {[25, 28, 30, 35].map(len => (
          <TouchableOpacity
            key={len}
            style={[
              styles.quickButton,
              value === len && styles.quickButtonActive
            ]}
            onPress={() => handlePress(len)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.quickButtonText,
              value === len && styles.quickButtonTextActive
            ]}>
              {len}j
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Zone d'ajustement fin avec encouragement */}
      <View style={styles.adjustSection}>
        <TouchableOpacity
          style={[styles.adjustButton, value <= 21 && styles.adjustButtonDisabled]}
          onPress={() => value > 21 && handlePress(value - 1)}
          disabled={value <= 21}
          activeOpacity={0.7}
        >
          <Text style={[styles.adjustText, value <= 21 && styles.adjustTextDisabled]}>−</Text>
        </TouchableOpacity>
        
        <Text style={styles.encouragement}>
          {getEncouragement(value)}
        </Text>
        
        <TouchableOpacity
          style={[styles.adjustButton, value >= 40 && styles.adjustButtonDisabled]}
          onPress={() => value < 40 && handlePress(value + 1)}
          disabled={value >= 40}
          activeOpacity={0.7}
        >
          <Text style={[styles.adjustText, value >= 40 && styles.adjustTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
      
      {/* Indicateur visuel de normalité */}
      <View style={styles.normalityIndicator}>
        <View style={styles.normalityBar}>
          <View style={[styles.normalityZone, styles.shortZone]} />
          <View style={[styles.normalityZone, styles.normalZone]} />
          <View style={[styles.normalityZone, styles.longZone]} />
        </View>
        <View style={[
          styles.currentIndicator,
          { left: `${((value - 21) / 19) * 100}%` }
        ]} />
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.m
  },
  display: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.l
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: 'Quicksand_700Bold'
  },
  daysLabel: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginLeft: 8
  },
  quickButtons: {
    flexDirection: 'row',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.l
  },
  quickButton: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.surface + '50',
    minWidth: 60
  },
  quickButtonActive: {
    backgroundColor: theme.colors.primary,
    transform: [{ scale: 1.05 }]
  },
  quickButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '500'
  },
  quickButtonTextActive: {
    color: theme.colors.white,
    fontWeight: '700'
  },
  adjustSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.m
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
      },
      android: {
        elevation: 2
      }
    })
  },
  adjustButtonDisabled: {
    opacity: 0.3
  },
  adjustText: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: '500'
  },
  adjustTextDisabled: {
    color: theme.colors.textLight
  },
  encouragement: {
    fontSize: 14,
    color: theme.colors.primary,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.s
  },
  normalityIndicator: {
    width: '80%',
    height: 6,
    position: 'relative',
    marginTop: theme.spacing.m
  },
  normalityBar: {
    flexDirection: 'row',
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden'
  },
  normalityZone: {
    flex: 1,
    height: '100%'
  },
  shortZone: {
    backgroundColor: theme.colors.warning + '30'
  },
  normalZone: {
    backgroundColor: theme.colors.success + '30',
    flex: 2
  },
  longZone: {
    backgroundColor: theme.colors.warning + '30'
  },
  currentIndicator: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.white,
    marginLeft: -7
  }
});