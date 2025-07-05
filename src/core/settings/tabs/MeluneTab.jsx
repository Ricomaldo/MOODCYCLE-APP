//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/settings/tabs/MeluneTab.jsx
// 🧩 Type: Onglet Paramètres
// 📚 Description: Personnalisation avatar et ton de Melune
// 🕒 Version: 1.0 - 2025-01-21
// 🧭 Used in: ParametresModal, personnalisation Melune
// ─────────────────────────────────────────────────────────
//
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { Heading, BodyText } from '../../ui/typography';
import { useUserStore } from '../../../stores/useUserStore';
import MeluneAvatar from '../../../features/shared/MeluneAvatar';

// Styles d'avatar disponibles
const AVATAR_STYLES = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Style doux et bienveillant',
    icon: '🌸'
  },
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Design contemporain et épuré',
    icon: '✨'
  },
  {
    id: 'mystique',
    name: 'Mystique',
    description: 'Ambiance mystérieuse et profonde',
    icon: '🌙'
  }
];

// Tons de voix disponibles
const VOICE_TONES = [
  {
    id: 'friendly',
    name: 'Amicale',
    description: 'Chaleureuse et proche',
    example: 'Hey ! Comment ça va aujourd\'hui ? 😊'
  },
  {
    id: 'professional',
    name: 'Professionnelle',
    description: 'Structurée et efficace',
    example: 'Analysons ensemble votre ressenti du jour.'
  },
  {
    id: 'inspiring',
    name: 'Inspirante',
    description: 'Motivante et énergique',
    example: 'Tu as un potentiel incroyable ! Explorons-le ! 🚀'
  }
];

// Positions disponibles pour Melune
const MELUNE_POSITIONS = [
  {
    id: 'bottom-right',
    name: 'Bas droite',
    description: 'Position classique, accessible au pouce droit',
    icon: '↘️'
  },
  {
    id: 'bottom-left',
    name: 'Bas gauche',
    description: 'Accessible au pouce gauche',
    icon: '↙️'
  },
  {
    id: 'top-right',
    name: 'Haut droite',
    description: 'Discrète en haut à droite',
    icon: '↗️'
  },
  {
    id: 'top-left',
    name: 'Haut gauche',
    description: 'Discrète en haut à gauche',
    icon: '↖️'
  }
];

export default function MeluneTab({ onDataChange }) {
  const { melune, updateMelune } = useUserStore();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [selectedAvatar, setSelectedAvatar] = useState(melune?.avatarStyle || 'classic');
  const [selectedTone, setSelectedTone] = useState(melune?.tone || 'friendly');
  const [selectedPosition, setSelectedPosition] = useState(melune?.position || 'bottom-right');
  const [isAnimated, setIsAnimated] = useState(melune?.animated !== false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSelectedAvatar(melune?.avatarStyle || 'classic');
    setSelectedTone(melune?.tone || 'friendly');
    setSelectedPosition(melune?.position || 'bottom-right');
    setIsAnimated(melune?.animated !== false);
  }, [melune?.avatarStyle, melune?.tone, melune?.position, melune?.animated]);

  useEffect(() => {
    const hasAvatarChange = selectedAvatar !== (melune?.avatarStyle || 'classic');
    const hasToneChange = selectedTone !== (melune?.tone || 'friendly');
    const hasPositionChange = selectedPosition !== (melune?.position || 'bottom-right');
    const hasAnimationChange = isAnimated !== (melune?.animated !== false);
    const hasAnyChange = hasAvatarChange || hasToneChange || hasPositionChange || hasAnimationChange;
    
    setHasChanges(hasAnyChange);
    onDataChange?.(hasAnyChange);
  }, [selectedAvatar, selectedTone, selectedPosition, isAnimated, melune?.avatarStyle, melune?.tone, melune?.position, melune?.animated, onDataChange]);

  const handleSave = useCallback(() => {
    updateMelune({
      avatarStyle: selectedAvatar,
      tone: selectedTone,
      position: selectedPosition,
      animated: isAnimated
    });
    
    setHasChanges(false);
    onDataChange?.(false);
  }, [selectedAvatar, selectedTone, selectedPosition, isAnimated, updateMelune, onDataChange]);

  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 1000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [hasChanges, handleSave]);

  const renderAvatarOption = (style) => {
    const isSelected = selectedAvatar === style.id;
    
    return (
      <TouchableOpacity
        key={style.id}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected
        ]}
        onPress={() => setSelectedAvatar(style.id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarPreview}>
          <MeluneAvatar 
            size="medium" 
            avatarStyle={style.id}
            animated={isSelected}
          />
        </View>
        
        <View style={styles.optionInfo}>
          <BodyText style={[
            styles.optionName,
            isSelected && styles.optionNameSelected
          ]}>
            {style.icon} {style.name}
          </BodyText>
          <BodyText style={[
            styles.optionDescription,
            isSelected && styles.optionDescriptionSelected
          ]}>
            {style.description}
          </BodyText>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Feather name="check" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderToneOption = (tone) => {
    const isSelected = selectedTone === tone.id;
    
    return (
      <TouchableOpacity
        key={tone.id}
        style={[
          styles.toneCard,
          isSelected && styles.toneCardSelected
        ]}
        onPress={() => setSelectedTone(tone.id)}
        activeOpacity={0.7}
      >
        <View style={styles.toneHeader}>
          <BodyText style={[
            styles.toneName,
            isSelected && styles.toneNameSelected
          ]}>
            {tone.name}
          </BodyText>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Feather name="check" size={16} color="white" />
            </View>
          )}
        </View>
        
        <BodyText style={[
          styles.toneDescription,
          isSelected && styles.toneDescriptionSelected
        ]}>
          {tone.description}
        </BodyText>
        
        <View style={styles.exampleContainer}>
          <BodyText style={[
            styles.exampleText,
            isSelected && styles.exampleTextSelected
          ]}>
            "{tone.example}"
          </BodyText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPositionOption = (position) => {
    const isSelected = selectedPosition === position.id;
    
    return (
      <TouchableOpacity
        key={position.id}
        style={[
          styles.positionCard,
          isSelected && styles.positionCardSelected
        ]}
        onPress={() => setSelectedPosition(position.id)}
        activeOpacity={0.7}
      >
        <BodyText style={styles.positionIcon}>{position.icon}</BodyText>
        <View style={styles.positionInfo}>
          <BodyText style={[
            styles.positionName,
            isSelected && styles.positionNameSelected
          ]}>
            {position.name}
          </BodyText>
          <BodyText style={[
            styles.positionDescription,
            isSelected && styles.positionDescriptionSelected
          ]}>
            {position.description}
          </BodyText>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Feather name="check" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Heading style={styles.sectionTitle}>Style d'avatar</Heading>
        <BodyText style={styles.sectionDescription}>
          Choisis le style visuel de Melune qui te correspond
        </BodyText>
        
        <View style={styles.avatarGrid}>
          {AVATAR_STYLES.map(renderAvatarOption)}
        </View>
      </View>

      <View style={styles.section}>
        <Heading style={styles.sectionTitle}>Ton de voix</Heading>
        <BodyText style={styles.sectionDescription}>
          Définis la personnalité de Melune dans ses interactions
        </BodyText>
        
        <View style={styles.toneGrid}>
          {VOICE_TONES.map(renderToneOption)}
        </View>
      </View>

      <View style={styles.section}>
        <Heading style={styles.sectionTitle}>Position de Melune</Heading>
        <BodyText style={styles.sectionDescription}>
          Choisis où Melune apparaît sur ton écran
        </BodyText>
        
        <View style={styles.positionGrid}>
          {MELUNE_POSITIONS.map(renderPositionOption)}
        </View>
      </View>

      <View style={styles.section}>
        <Heading style={styles.sectionTitle}>Animations</Heading>
        <BodyText style={styles.sectionDescription}>
          Active ou désactive les animations de Melune
        </BodyText>
        
        <TouchableOpacity
          style={[
            styles.animationToggle,
            isAnimated && styles.animationToggleActive
          ]}
          onPress={() => setIsAnimated(!isAnimated)}
          activeOpacity={0.7}
        >
          <View style={styles.toggleContent}>
            <View style={styles.toggleLeft}>
              <BodyText style={[
                styles.toggleText,
                isAnimated && styles.toggleTextActive
              ]}>
                Animations {isAnimated ? 'activées' : 'désactivées'}
              </BodyText>
              <BodyText style={[
                styles.toggleDescription,
                isAnimated && styles.toggleDescriptionActive
              ]}>
                {isAnimated ? 'Melune bougera et réagira' : 'Melune sera statique'}
              </BodyText>
            </View>
            
            <View style={[
              styles.toggleSwitch,
              isAnimated && styles.toggleSwitchActive
            ]}>
              <View style={[
                styles.toggleBall,
                isAnimated && styles.toggleBallActive
              ]} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {hasChanges && (
        <View style={styles.saveIndicator}>
          <BodyText style={styles.saveText}>
            Sauvegarde automatique en cours...
          </BodyText>
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  avatarGrid: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  avatarPreview: {
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  optionNameSelected: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  optionDescriptionSelected: {
    color: theme.colors.primary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toneGrid: {
    gap: 12,
  },
  toneCard: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toneCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  toneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toneName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  toneNameSelected: {
    color: theme.colors.primary,
  },
  toneDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  toneDescriptionSelected: {
    color: theme.colors.primary,
  },
  exampleContainer: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
  },
  exampleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  exampleTextSelected: {
    color: theme.colors.primary,
  },
  positionGrid: {
    gap: 12,
  },
  positionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  positionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  positionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  positionInfo: {
    flex: 1,
  },
  positionName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  positionNameSelected: {
    color: theme.colors.primary,
  },
  positionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  positionDescriptionSelected: {
    color: theme.colors.primary,
  },
  animationToggle: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  animationToggleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flex: 1,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  toggleTextActive: {
    color: theme.colors.primary,
  },
  toggleDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  toggleDescriptionActive: {
    color: theme.colors.primary,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleBall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleBallActive: {
    alignSelf: 'flex-end',
  },
  saveIndicator: {
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  saveText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
}); 