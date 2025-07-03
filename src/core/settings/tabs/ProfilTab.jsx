//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/tabs/ProfilTab.jsx
// 🧩 Type: Tab Component
// 📚 Description: Onglet Profil - modification prénom, âge, journey
// 🕒 Version: 1.0 - 2025-01-15
// ─────────────────────────────────────────────────────────
//
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { Heading3, BodyText, Caption } from '../../ui/typography';
import { useUserStore } from '../../../stores/useUserStore';

const AGE_RANGES = [
  { value: '18-25', label: '18-25 ans' },
  { value: '26-35', label: '26-35 ans' },
  { value: '36-45', label: '36-45 ans' },
  { value: '46-55', label: '46-55 ans' },
  { value: '55+', label: '55+ ans' }
];

const JOURNEY_CHOICES = [
  { 
    value: 'body', 
    label: 'Mon corps', 
    description: 'Comprendre et honorer mon corps',
    icon: '💪'
  },
  { 
    value: 'nature', 
    label: 'La nature', 
    description: 'Connexion aux cycles naturels',
    icon: '🌿'
  },
  { 
    value: 'emotions', 
    label: 'Mes émotions', 
    description: 'Explorer ma richesse émotionnelle',
    icon: '💫'
  }
];

export default function ProfilTab({ onDataChange }) {
  const { profile, updateProfile } = useUserStore();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const [localProfile, setLocalProfile] = useState({
    prenom: profile?.prenom || '',
    ageRange: profile?.ageRange || null,
    journeyChoice: profile?.journeyChoice || null
  });

  useEffect(() => {
    // Sync avec le store quand il change
    setLocalProfile({
      prenom: profile?.prenom || '',
      ageRange: profile?.ageRange || null,
      journeyChoice: profile?.journeyChoice || null
    });
  }, [profile]);

  const handlePrenomChange = (text) => {
    const cleanText = text.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    setLocalProfile(prev => ({ ...prev, prenom: cleanText }));
    updateProfile({ prenom: cleanText });
    onDataChange?.();
  };

  const handleAgeRangeSelect = (ageRange) => {
    setLocalProfile(prev => ({ ...prev, ageRange }));
    updateProfile({ ageRange });
    onDataChange?.();
  };

  const handleJourneySelect = (journeyChoice) => {
    setLocalProfile(prev => ({ ...prev, journeyChoice }));
    updateProfile({ journeyChoice });
    onDataChange?.();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Section Prénom */}
      <View style={styles.section}>
        <Heading3 style={styles.sectionTitle}>Prénom</Heading3>
        <Caption style={styles.sectionDescription}>
          Comment Melune doit-elle t'appeler ?
        </Caption>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={localProfile.prenom}
            onChangeText={handlePrenomChange}
            placeholder="Ton prénom..."
            placeholderTextColor={theme.colors.textLight}
            maxLength={12}
          />
          <View style={styles.inputIcon}>
            <Feather name="user" size={20} color={theme.colors.textLight} />
          </View>
        </View>
        
        {localProfile.prenom.length > 0 && (
          <View style={styles.previewContainer}>
            <BodyText style={styles.previewLabel}>Aperçu :</BodyText>
            <View style={styles.previewBubble}>
              <BodyText style={styles.previewText}>
                Coucou {localProfile.prenom} ! Comment tu te sens aujourd'hui ? ✨
              </BodyText>
            </View>
          </View>
        )}
      </View>

      {/* Section Âge */}
      <View style={styles.section}>
        <Heading3 style={styles.sectionTitle}>Tranche d'âge</Heading3>
        <Caption style={styles.sectionDescription}>
          Pour personnaliser ton expérience
        </Caption>
        
        <View style={styles.optionsGrid}>
          {AGE_RANGES.map((range) => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.optionCard,
                localProfile.ageRange === range.value && styles.optionCardSelected
              ]}
              onPress={() => handleAgeRangeSelect(range.value)}
            >
              <BodyText style={[
                styles.optionText,
                localProfile.ageRange === range.value && styles.optionTextSelected
              ]}>
                {range.label}
              </BodyText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section Journey */}
      <View style={styles.section}>
        <Heading3 style={styles.sectionTitle}>Ton voyage</Heading3>
        <Caption style={styles.sectionDescription}>
          Qu'est-ce qui t'attire le plus dans cette aventure ?
        </Caption>
        
        <View style={styles.journeyContainer}>
          {JOURNEY_CHOICES.map((journey) => (
            <TouchableOpacity
              key={journey.value}
              style={[
                styles.journeyCard,
                localProfile.journeyChoice === journey.value && styles.journeyCardSelected
              ]}
              onPress={() => handleJourneySelect(journey.value)}
            >
              <View style={styles.journeyIcon}>
                <BodyText style={styles.journeyEmoji}>{journey.icon}</BodyText>
              </View>
              <View style={styles.journeyContent}>
                <BodyText style={[
                  styles.journeyTitle,
                  localProfile.journeyChoice === journey.value && styles.journeyTitleSelected
                ]}>
                  {journey.label}
                </BodyText>
                <Caption style={[
                  styles.journeyDescription,
                  localProfile.journeyChoice === journey.value && styles.journeyDescriptionSelected
                ]}>
                  {journey.description}
                </Caption>
              </View>
              {localProfile.journeyChoice === journey.value && (
                <View style={styles.selectedIcon}>
                  <Feather name="check" size={16} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Espacement pour le footer */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  section: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '50',
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
  
  // Input Prénom
  inputContainer: {
    position: 'relative',
    marginBottom: theme.spacing.m,
  },
  
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    paddingRight: 50,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  inputIcon: {
    position: 'absolute',
    right: theme.spacing.m,
    top: theme.spacing.m,
  },
  
  previewContainer: {
    marginTop: theme.spacing.m,
  },
  
  previewLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.s,
  },
  
  previewBubble: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  
  previewText: {
    fontSize: 14,
    color: theme.colors.primary,
    lineHeight: 20,
  },
  
  // Options grille (âge)
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  optionCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.s,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.s,
    alignItems: 'center',
  },
  
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  
  optionText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Journey cards
  journeyContainer: {
    gap: theme.spacing.m,
  },
  
  journeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  journeyCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  
  journeyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  
  journeyEmoji: {
    fontSize: 24,
  },
  
  journeyContent: {
    flex: 1,
  },
  
  journeyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  journeyTitleSelected: {
    color: theme.colors.primary,
  },
  
  journeyDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  
  journeyDescriptionSelected: {
    color: theme.colors.primary + 'AA',
  },
  
  selectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 