//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/tabs/MeluneTab.jsx
// 🧩 Type: Onglet Paramètres
// 📚 Description: Personnalisation avatar et ton de Melune (SANS personas)
// 🕒 Version: 1.0 - 2025-06-24
// 🧭 Used in: ParametresModal
// ─────────────────────────────────────────────────────────
//
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { Heading, BodyText } from '../../../core/ui/Typography';
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
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [selectedAvatar, setSelectedAvatar] = useState(melune?.avatarStyle || 'classic');
  const [selectedTone, setSelectedTone] = useState(melune?.tone || 'friendly');
  const [selectedPosition, setSelectedPosition] = useState(melune?.position || 'bottom-right');
  const [isAnimated, setIsAnimated] = useState(melune?.animated !== false);
  const [hasChanges, setHasChanges] = useState(false);

  // ✅ DEBUG : Ajout de logs pour tracer le problème
  console.log('🎭 MeluneTab render:', {
    meluneFromStore: melune,
    selectedAvatar,
    selectedTone,
    hasChanges
  });

  // ✅ SYNC avec le store quand les valeurs du store changent
  useEffect(() => {
    setSelectedAvatar(melune?.avatarStyle || 'classic');
    setSelectedTone(melune?.tone || 'friendly');
    setSelectedPosition(melune?.position || 'bottom-right');
    setIsAnimated(melune?.animated !== false);
  }, [melune?.avatarStyle, melune?.tone, melune?.position, melune?.animated]);

  // Détecter les changements
  useEffect(() => {
    const hasAvatarChange = selectedAvatar !== (melune?.avatarStyle || 'classic');
    const hasToneChange = selectedTone !== (melune?.tone || 'friendly');
    const hasPositionChange = selectedPosition !== (melune?.position || 'bottom-right');
    const hasAnimationChange = isAnimated !== (melune?.animated !== false);
    const hasAnyChange = hasAvatarChange || hasToneChange || hasPositionChange || hasAnimationChange;
    
    console.log('🔄 Change detection:', {
      hasAvatarChange,
      hasToneChange,
      hasPositionChange,
      hasAnimationChange,
      hasAnyChange,
      currentStore: melune?.avatarStyle,
      selectedAvatar
    });
    
    setHasChanges(hasAnyChange);
    onDataChange?.(hasAnyChange);
  }, [selectedAvatar, selectedTone, selectedPosition, isAnimated, melune?.avatarStyle, melune?.tone, melune?.position, melune?.animated, onDataChange]);

  // ✅ Auto-save CORRIGÉ avec useCallback pour stabiliser la fonction
  const handleSave = useCallback(() => {
    console.log('💾 Saving to store:', {
      avatarStyle: selectedAvatar,
      tone: selectedTone,
      position: selectedPosition,
      animated: isAnimated
    });
    
    updateMelune({
      avatarStyle: selectedAvatar,
      tone: selectedTone,
      position: selectedPosition,
      animated: isAnimated
    });
    
    setHasChanges(false);
    onDataChange?.(false);
  }, [selectedAvatar, selectedTone, selectedPosition, isAnimated, updateMelune, onDataChange]);

  // Auto-save en temps réel - CORRECTION FINALE
  useEffect(() => {
    if (hasChanges) {
      console.log('⏰ Setting save timer...');
      const timer = setTimeout(() => {
        console.log('⏰ Timer fired, saving...');
        handleSave();
      }, 1000);
      
      return () => {
        console.log('⏰ Clearing timer');
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
          <BodyText style={styles.optionDescription}>
            {style.description}
          </BodyText>
        </View>
        
        {isSelected && (
          <View style={styles.checkmark}>
            <Feather name="check" size={20} color={theme.colors.primary} />
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
            <View style={styles.checkmark}>
              <Feather name="check" size={16} color={theme.colors.primary} />
            </View>
          )}
        </View>
        
        <BodyText style={styles.toneDescription}>
          {tone.description}
        </BodyText>
        
        <View style={styles.exampleContainer}>
          <BodyText style={styles.exampleLabel}>Exemple :</BodyText>
          <View style={styles.exampleBubble}>
            <BodyText style={styles.exampleText}>
              {tone.example}
            </BodyText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Heading style={styles.title}>Personnalise Melune</Heading>
        <BodyText style={styles.subtitle}>
          Choisis l'apparence et le style de communication qui te correspond
        </BodyText>
      </View>

      {/* Avatar Style */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="image" size={20} color={theme.colors.primary} />
          <BodyText style={styles.sectionTitle}>Style d'avatar</BodyText>
        </View>
        
        <View style={styles.avatarOptions}>
          {AVATAR_STYLES.map(renderAvatarOption)}
        </View>
      </View>

      {/* Ton de voix */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="message-circle" size={20} color={theme.colors.primary} />
          <BodyText style={styles.sectionTitle}>Ton de voix</BodyText>
        </View>
        
        <View style={styles.toneOptions}>
          {VOICE_TONES.map(renderToneOption)}
        </View>
      </View>

      {/* Position de Melune */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="map-pin" size={20} color={theme.colors.primary} />
          <BodyText style={styles.sectionTitle}>Position de Melune</BodyText>
        </View>
        
        <View style={styles.positionGrid}>
          {MELUNE_POSITIONS.map((position) => (
            <TouchableOpacity
              key={position.id}
              style={[
                styles.positionCard,
                selectedPosition === position.id && styles.positionCardSelected
              ]}
              onPress={() => setSelectedPosition(position.id)}
              activeOpacity={0.7}
            >
              <BodyText style={styles.positionIcon}>{position.icon}</BodyText>
              <BodyText style={[
                styles.positionName,
                selectedPosition === position.id && styles.positionNameSelected
              ]}>
                {position.name}
              </BodyText>
              <BodyText style={styles.positionDescription}>
                {position.description}
              </BodyText>
              {selectedPosition === position.id && (
                <View style={styles.checkmarkSmall}>
                  <Feather name="check" size={16} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Animation de Melune */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="zap" size={20} color={theme.colors.primary} />
          <BodyText style={styles.sectionTitle}>Animation</BodyText>
        </View>
        
        <TouchableOpacity
          style={[
            styles.animationToggle,
            isAnimated && styles.animationToggleActive
          ]}
          onPress={() => setIsAnimated(!isAnimated)}
          activeOpacity={0.7}
        >
          <View style={styles.animationToggleContent}>
            <View style={styles.animationInfo}>
              <BodyText style={[
                styles.animationTitle,
                isAnimated && styles.animationTitleActive
              ]}>
                🧚‍♀️ Melune animée
              </BodyText>
              <BodyText style={styles.animationDescription}>
                {isAnimated 
                  ? 'Melune bouge et flotte comme une vraie fée capricieuse'
                  : 'Melune reste statique à sa position'
                }
              </BodyText>
            </View>
            
            <View style={[
              styles.toggleSwitch,
              isAnimated && styles.toggleSwitchActive
            ]}>
              <View style={[
                styles.toggleThumb,
                isAnimated && styles.toggleThumbActive
              ]} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Aperçu personnalisé */}
      <View style={styles.previewSection}>
        <View style={styles.sectionHeader}>
          <Feather name="eye" size={20} color={theme.colors.primary} />
          <BodyText style={styles.sectionTitle}>Aperçu</BodyText>
        </View>
        
        <View style={styles.previewCard}>
          <View style={styles.previewAvatar}>
            <MeluneAvatar 
              size="large" 
              avatarStyle={selectedAvatar}
              animated={isAnimated}
            />
          </View>
          
          <View style={styles.previewMessage}>
            <BodyText style={styles.previewText}>
              {VOICE_TONES.find(t => t.id === selectedTone)?.example}
            </BodyText>
          </View>
          
          <BodyText style={styles.previewInfo}>
            Position : {MELUNE_POSITIONS.find(p => p.id === selectedPosition)?.name} • 
            Animation : {isAnimated ? 'Activée' : 'Désactivée'}
          </BodyText>
        </View>
      </View>

      {/* ✅ DEBUG : Bouton sauvegarde manuelle */}
      {__DEV__ && hasChanges && (
        <View style={styles.debugSection}>
          <TouchableOpacity 
            style={styles.debugSaveButton}
            onPress={handleSave}
          >
            <BodyText style={styles.debugSaveText}>
              💾 Sauvegarder maintenant (DEBUG)
            </BodyText>
          </TouchableOpacity>
        </View>
      )}

      {/* Espacement bottom */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    padding: theme.spacing.l,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  
  // Sections
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: theme.spacing.s,
  },
  
  // Avatar Options
  avatarOptions: {
    paddingHorizontal: theme.spacing.l,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },
  avatarPreview: {
    marginRight: theme.spacing.l,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  optionNameSelected: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  
  // Tone Options
  toneOptions: {
    paddingHorizontal: theme.spacing.l,
  },
  toneCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toneCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },
  toneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  toneName: {
    fontSize: 16,
    fontWeight: '600',
  },
  toneNameSelected: {
    color: theme.colors.primary,
  },
  toneDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.m,
  },
  exampleContainer: {
    marginTop: theme.spacing.s,
  },
  exampleLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  exampleBubble: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  exampleText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  
  // Preview
  previewSection: {
    marginBottom: theme.spacing.xl,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.l,
    alignItems: 'center',
  },
  previewAvatar: {
    marginBottom: theme.spacing.l,
  },
  previewMessage: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    maxWidth: '90%',
  },
  previewText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  previewInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: theme.spacing.m,
  },
  
  // Position Grid
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.l,
    gap: theme.spacing.m,
  },
  positionCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  positionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },
  positionIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.s,
  },
  positionName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  positionNameSelected: {
    color: theme.colors.primary,
  },
  positionDescription: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  checkmarkSmall: {
    position: 'absolute',
    top: theme.spacing.s,
    right: theme.spacing.s,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Animation Toggle
  animationToggle: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: theme.spacing.l,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  animationToggleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },
  animationToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  animationInfo: {
    flex: 1,
  },
  animationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  animationTitleActive: {
    color: theme.colors.primary,
  },
  animationDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  
  // Checkmark
  checkmark: {
    marginLeft: theme.spacing.s,
  },
  
  // ✅ DEBUG styles
  debugSection: {
    padding: theme.spacing.l,
    backgroundColor: '#ff0000',
    margin: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
  },
  debugSaveButton: {
    backgroundColor: 'white',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
  },
  debugSaveText: {
    color: '#ff0000',
    fontWeight: 'bold',
  },
}); 