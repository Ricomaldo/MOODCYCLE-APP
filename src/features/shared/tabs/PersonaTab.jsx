//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/tabs/PersonaTab.jsx
// 🧩 Type: Tab Component
// 📚 Description: Onglet Persona - modification du style d'accompagnement
// 🕒 Version: 1.0 - 2025-01-15
// ─────────────────────────────────────────────────────────
//
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import { Heading3, BodyText, Caption } from '../../../core/ui/Typography';
import { useUserStore } from '../../../stores/useUserStore';
import MeluneAvatar from '../MeluneAvatar';

// 🎯 Personas thérapeutiques (identiques à l'onboarding 600)
const THERAPEUTIC_PERSONAS = [
  {
    id: 'emma',
    name: 'Emma',
    title: 'Exploration Bienveillante',
    description: 'Accompagnement doux pour découvrir ton cycle',
    approach: 'Je t\'accompagne avec curiosité et bienveillance dans cette exploration',
    preview: "Hey ! Comment honorer ton besoin de repos aujourd'hui ? 🌙",
    color: '#FF6B8A',
    icon: '🌸'
  },
  {
    id: 'laure',
    name: 'Laure',
    title: 'Optimisation Performance',
    description: 'Structure et efficacité pour maîtriser ton cycle',
    approach: 'J\'optimise ton quotidien selon tes phases pour plus de performance',
    preview: "Analysons : Comment structurer tes objectifs pour cette phase ?",
    color: '#3B82F6',
    icon: '📊'
  },
  {
    id: 'clara',
    name: 'Clara',
    title: 'Transformation Énergique',
    description: 'Libération dynamique de ton potentiel cyclique',
    approach: 'Je révèle ta puissance cyclique avec enthousiasme et énergie',
    preview: "Ready ? Comment exploiter au MAX cette phase de puissance ? 🚀",
    color: '#F59E0B',
    icon: '✨'
  },
  {
    id: 'sylvie',
    name: 'Sylvie',
    title: 'Sagesse Maternelle',
    description: 'Guidance douce et expérimentée',
    approach: 'Je t\'entoure d\'une présence maternelle et sage',
    preview: "En douceur, écoutons ce que ton corps te murmure...",
    color: '#10B981',
    icon: '🌿'
  },
  {
    id: 'christine',
    name: 'Christine',
    title: 'Maturité Sereine',
    description: 'Sagesse profonde pour honorer tes transitions',
    approach: 'J\'honore ta sagesse et guide tes transitions avec sérénité',
    preview: "Avec sagesse, explorons cette phase de transformation...",
    color: '#8B5CF6',
    icon: '🌙'
  }
];

const AVATAR_STYLES = [
  { value: 'classic', label: 'Classique', icon: '🎨' },
  { value: 'modern', label: 'Moderne', icon: '🌟' },
  { value: 'mystique', label: 'Mystique', icon: '🔮' }
];

export default function PersonaTab({ onDataChange }) {
  const { persona, melune, setPersona, updateMelune, profile } = useUserStore();
  
  const [selectedPersona, setSelectedPersona] = useState(persona?.assigned || 'emma');
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState(melune?.avatarStyle || 'classic');
  const [previewMessage, setPreviewMessage] = useState('');

  useEffect(() => {
    // Sync avec le store
    setSelectedPersona(persona?.assigned || 'emma');
    setSelectedAvatarStyle(melune?.avatarStyle || 'classic');
  }, [persona, melune]);

  useEffect(() => {
    // Mettre à jour le message de preview quand la persona change
    const currentPersona = THERAPEUTIC_PERSONAS.find(p => p.id === selectedPersona);
    if (currentPersona) {
      setPreviewMessage(currentPersona.preview);
    }
  }, [selectedPersona]);

  const handlePersonaSelect = (personaId) => {
    setSelectedPersona(personaId);
    setPersona(personaId, 0.8); // Confidence élevée pour choix conscient
    onDataChange?.();
    
    // Message de feedback
    const persona = THERAPEUTIC_PERSONAS.find(p => p.id === personaId);
    if (persona) {
      setPreviewMessage(`Parfait ! ${persona.name} va maintenant t'accompagner.`);
    }
  };

  const handleAvatarStyleSelect = (style) => {
    setSelectedAvatarStyle(style);
    updateMelune({ avatarStyle: style });
    onDataChange?.();
  };

  const renderPersonaCard = (persona) => {
    const isSelected = selectedPersona === persona.id;
    
    return (
      <TouchableOpacity
        key={persona.id}
        style={[
          styles.personaCard,
          isSelected && [styles.personaCardSelected, { borderColor: persona.color }]
        ]}
        onPress={() => handlePersonaSelect(persona.id)}
      >
        <View style={styles.personaHeader}>
          <View style={[styles.personaIcon, { backgroundColor: persona.color + '20' }]}>
            <BodyText style={styles.iconText}>{persona.icon}</BodyText>
          </View>
          <View style={styles.personaInfo}>
            <BodyText style={styles.personaName}>{persona.name}</BodyText>
            <Caption style={styles.personaTitle}>{persona.title}</Caption>
          </View>
          {isSelected && (
            <View style={[styles.selectedBadge, { backgroundColor: persona.color }]}>
              <Feather name="check" size={16} color="white" />
            </View>
          )}
        </View>
        
        <BodyText style={styles.personaDescription}>
          {persona.description}
        </BodyText>
        
        <View style={styles.approachContainer}>
          <Caption style={styles.approachLabel}>Son approche :</Caption>
          <BodyText style={[styles.approachText, { color: persona.color }]}>
            "{persona.approach}"
          </BodyText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Heading3 style={styles.headerTitle}>Ton style d'accompagnement</Heading3>
        <Caption style={styles.headerDescription}>
          Choisis le persona qui résonne le mieux avec toi. 
          Tu peux changer à tout moment selon ton humeur.
        </Caption>
      </View>

      {/* Avatar Preview avec style actuel */}
      <View style={styles.previewSection}>
        <BodyText style={styles.previewLabel}>Aperçu actuel :</BodyText>
        <View style={styles.avatarPreview}>
          <MeluneAvatar 
            size="medium" 
            style={selectedAvatarStyle}
            animated={true}
          />
          <View style={styles.previewBubble}>
            <BodyText style={styles.previewText}>
              {previewMessage || "Salut ! Je suis là pour t'accompagner ✨"}
            </BodyText>
          </View>
        </View>
      </View>

      {/* Sélection Persona */}
      <View style={styles.section}>
        <Heading3 style={styles.sectionTitle}>Qui veux-tu comme guide ?</Heading3>
        <View style={styles.personasContainer}>
          {THERAPEUTIC_PERSONAS.map(renderPersonaCard)}
        </View>
      </View>

      {/* Sélection style avatar */}
      <View style={styles.section}>
        <Heading3 style={styles.sectionTitle}>Style visuel de Melune</Heading3>
        <Caption style={styles.sectionDescription}>
          Choisis le style artistique que tu préfères
        </Caption>
        
        <View style={styles.avatarStylesContainer}>
          {AVATAR_STYLES.map((style) => (
            <TouchableOpacity
              key={style.value}
              style={[
                styles.avatarStyleCard,
                selectedAvatarStyle === style.value && styles.avatarStyleCardSelected
              ]}
              onPress={() => handleAvatarStyleSelect(style.value)}
            >
              <BodyText style={styles.avatarStyleIcon}>{style.icon}</BodyText>
              <BodyText style={[
                styles.avatarStyleText,
                selectedAvatarStyle === style.value && styles.avatarStyleTextSelected
              ]}>
                {style.label}
              </BodyText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Info persona confidence */}
      {persona?.confidence && (
        <View style={styles.confidenceSection}>
          <Caption style={styles.confidenceLabel}>
            Adéquation avec ton profil : {Math.round(persona.confidence * 100)}%
          </Caption>
          <Caption style={styles.confidenceDescription}>
            Plus tu utilises l'app, plus Melune s'adapte à toi
          </Caption>
        </View>
      )}
      
      {/* Espacement pour le footer */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Header
  header: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '50',
  },
  
  headerTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  headerDescription: {
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  
  // Preview
  previewSection: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    alignItems: 'center',
  },
  
  previewLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.m,
  },
  
  avatarPreview: {
    alignItems: 'center',
  },
  
  previewBubble: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.m,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  
  previewText: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Sections
  section: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
  },
  
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  sectionDescription: {
    color: theme.colors.textLight,
    marginBottom: theme.spacing.l,
    lineHeight: 18,
  },
  
  // Personas
  personasContainer: {
    gap: theme.spacing.m,
  },
  
  personaCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  personaCardSelected: {
    borderWidth: 2,
    backgroundColor: theme.colors.primary + '05',
  },
  
  personaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  personaIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  
  iconText: {
    fontSize: 24,
  },
  
  personaInfo: {
    flex: 1,
  },
  
  personaName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  
  personaTitle: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  personaDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.m,
  },
  
  approachContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
  },
  
  approachLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  
  approachText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  
  // Avatar styles
  avatarStylesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.s,
  },
  
  avatarStyleCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  
  avatarStyleCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  
  avatarStyleIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.s,
  },
  
  avatarStyleText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  
  avatarStyleTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Confidence
  confidenceSection: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
  },
  
  confidenceLabel: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  
  confidenceDescription: {
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
}); 