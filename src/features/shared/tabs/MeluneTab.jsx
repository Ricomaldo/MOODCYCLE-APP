//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/tabs/MeluneTab.jsx
// 🧩 Type: Onglet Paramètres
// 📚 Description: Personnalisation avatar et ton de Melune (SANS personas)
// 🕒 Version: 1.0 - 2025-06-24
// 🧭 Used in: ParametresModal
// ─────────────────────────────────────────────────────────
//
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { Heading, BodyText } from '../../../core/ui/Typography';
import { useUserStore } from '../../../stores/useUserStore';
import MeluneAvatar from '../MeluneAvatar';

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

export default function MeluneTab({ onDataChange }) {
  const { melune, updateMelune } = useUserStore();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [selectedAvatar, setSelectedAvatar] = useState(melune?.avatarStyle || 'classic');
  const [selectedTone, setSelectedTone] = useState(melune?.tone || 'friendly');
  const [hasChanges, setHasChanges] = useState(false);

  // Détecter les changements
  useEffect(() => {
    const hasAvatarChange = selectedAvatar !== (melune?.avatarStyle || 'classic');
    const hasToneChange = selectedTone !== (melune?.tone || 'friendly');
    const hasAnyChange = hasAvatarChange || hasToneChange;
    
    setHasChanges(hasAnyChange);
    onDataChange?.(hasAnyChange);
  }, [selectedAvatar, selectedTone, melune, onDataChange]);

  // Sauvegarder les changements
  const handleSave = () => {
    updateMelune({
      avatarStyle: selectedAvatar,
      tone: selectedTone
    });
    setHasChanges(false);
    onDataChange?.(false);
  };

  // Auto-save en temps réel
  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 1000); // Auto-save après 1 seconde d'inactivité
      
      return () => clearTimeout(timer);
    }
  }, [selectedAvatar, selectedTone]);

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
            style={style.id}
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
              style={selectedAvatar}
              animated={true}
            />
          </View>
          
          <View style={styles.previewMessage}>
            <BodyText style={styles.previewText}>
              {VOICE_TONES.find(t => t.id === selectedTone)?.example}
            </BodyText>
          </View>
        </View>
      </View>

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
  
  // Checkmark
  checkmark: {
    marginLeft: theme.spacing.s,
  },
}); 