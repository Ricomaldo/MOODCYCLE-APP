//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/tabs/PreferencesTab.jsx
// 🧩 Type: Tab Component
// 📚 Description: Onglet Préférences - modification des 6 dimensions thérapeutiques
// 🕒 Version: 1.0 - 2025-01-15
// ─────────────────────────────────────────────────────────
//
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { Heading3, BodyText, Caption } from '../../ui/typography';
import { useUserStore } from '../../../stores/useUserStore';
import ThemeSelector from '../ThemeSelector';
import { useTerminology, useTerminologySelector } from '../../../hooks/useTerminology';

// 🎨 Dimensions thérapeutiques identiques à l'onboarding
const THERAPEUTIC_DIMENSIONS = [
  {
    key: 'symptoms',
    title: 'Symptômes physiques',
    description: 'Conseils douleurs, énergie, bien-être',
    icon: '🌸',
    color: '#FF6B8A'
  },
  {
    key: 'moods',
    title: 'Gestion émotionnelle',
    description: 'Compréhension ressentis, équilibre',
    icon: '💫',
    color: '#8B5CF6'
  },
  {
    key: 'phyto',
    title: 'Phytothérapie',
    description: 'Plantes, huiles essentielles, naturel',
    icon: '🌿',
    color: '#10B981'
  },
  {
    key: 'phases',
    title: 'Énergie cyclique',
    description: 'Sagesse phases, rythmes féminins',
    icon: '🌙',
    color: '#3B82F6'
  },
  {
    key: 'lithotherapy',
    title: 'Lithothérapie',
    description: 'Cristaux, pierres, énergies subtiles',
    icon: '💎',
    color: '#F59E0B'
  },
  {
    key: 'rituals',
    title: 'Rituels bien-être',
    description: 'Méditation, soins, pratiques',
    icon: '🕯️',
    color: '#EC4899'
  }
];

const SLIDER_LABELS = ['Pas du tout', 'Un peu', 'Moyennement', 'Beaucoup', 'Passionnément'];

export default function PreferencesTab({ onDataChange }) {
  const { theme } = useTheme();
  const { preferences, updatePreferences } = useUserStore();
  const { currentTerminology, options, onSelect } = useTerminologySelector();
  
  const [localPreferences, setLocalPreferences] = useState(
    preferences || {
      symptoms: 3,
      moods: 3,
      phyto: 3,
      phases: 3,
      lithotherapy: 3,
      rituals: 3
    }
  );

  useEffect(() => {
    // Sync avec le store
    setLocalPreferences(preferences || {
      symptoms: 3,
      moods: 3,
      phyto: 3,
      phases: 3,
      lithotherapy: 3,
      rituals: 3
    });
  }, [preferences]);

  const handlePreferenceChange = (key, value) => {
    const newPrefs = { ...localPreferences, [key]: value };
    setLocalPreferences(newPrefs);
    updatePreferences(newPrefs);
    onDataChange?.();
  };

  const getDominantDimensions = () => {
    return Object.entries(localPreferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([key]) => {
        const dimension = THERAPEUTIC_DIMENSIONS.find(d => d.key === key);
        return dimension?.title || key;
      });
  };

  const styles = getStyles(theme);

  const renderSlider = (dimension) => {
    const value = localPreferences[dimension.key] || 3;
    
    return (
      <View key={dimension.key} style={styles.sliderContainer}>
        {/* Header avec icône et titre */}
        <View style={styles.sliderHeader}>
          <View style={styles.sliderTitleRow}>
            <BodyText style={[styles.sliderIcon, { color: dimension.color }]}>
              {dimension.icon}
            </BodyText>
            <BodyText style={styles.sliderTitle}>{dimension.title}</BodyText>
          </View>
          <BodyText style={[styles.sliderValue, { color: dimension.color }]}>
            {value}
          </BodyText>
        </View>
        
        {/* Description */}
        <BodyText style={styles.sliderDescription}>
          {dimension.description}
        </BodyText>
        
        {/* Slider interactif */}
        <View style={styles.sliderTrack}>
          {[1, 2, 3, 4, 5].map((stepValue) => (
            <TouchableOpacity
              key={stepValue}
              style={[
                styles.sliderStep,
                {
                  backgroundColor: stepValue <= value 
                    ? dimension.color 
                    : theme.colors.border
                }
              ]}
              onPress={() => handlePreferenceChange(dimension.key, stepValue)}
            />
          ))}
        </View>
        
        {/* Labels */}
        <View style={styles.sliderLabels}>
          <Caption style={styles.sliderLabel}>Pas du tout</Caption>
          <Caption style={styles.sliderLabel}>Passionnément</Caption>
        </View>
        
        {/* Label valeur actuelle */}
        <View style={styles.currentValueContainer}>
          <Caption style={[styles.currentValueLabel, { color: dimension.color }]}>
            {SLIDER_LABELS[value - 1]}
          </Caption>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Sélecteur de thème */}
      <ThemeSelector onDataChange={onDataChange} />
      
      {/* Sélecteur de terminologie */}
      <View style={styles.terminologySection}>
        <Heading3 style={styles.sectionTitle}>Langage des phases</Heading3>
        <Caption style={styles.sectionDescription}>
          Choisis comment tu préfères nommer tes phases cycliques
        </Caption>
        
        <View style={styles.terminologyOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.terminologyOption,
                option.selected && styles.terminologyOptionSelected
              ]}
              onPress={() => {
                onSelect(option.key);
                onDataChange?.();
              }}
            >
              <BodyText style={styles.terminologyIcon}>{option.icon}</BodyText>
              <View style={styles.terminologyContent}>
                <BodyText style={[
                  styles.terminologyName,
                  option.selected && styles.terminologyNameSelected
                ]}>
                  {option.name}
                </BodyText>
                <Caption style={styles.terminologyDesc}>
                  {option.description}
                </Caption>
              </View>
              {option.selected && (
                <Feather name="check" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Header explicatif */}
      <View style={styles.header}>
        <Heading3 style={styles.headerTitle}>Tes préférences thérapeutiques</Heading3>
        <Caption style={styles.headerDescription}>
          Ajuste l'intensité de chaque dimension selon tes intérêts. 
          Ces réglages influencent les conseils de Melune.
        </Caption>
      </View>

      {/* Sliders */}
      <View style={styles.slidersContainer}>
        {THERAPEUTIC_DIMENSIONS.map(renderSlider)}
      </View>

      {/* Résumé des priorités */}
      <View style={styles.summaryContainer}>
        <Heading3 style={styles.summaryTitle}>Tes priorités actuelles</Heading3>
        <View style={styles.summaryContent}>
          {getDominantDimensions().map((title, index) => (
            <View key={title} style={styles.summaryItem}>
              <BodyText style={styles.summaryRank}>{index + 1}.</BodyText>
              <BodyText style={styles.summaryText}>{title}</BodyText>
            </View>
          ))}
        </View>
        <Caption style={styles.summaryNote}>
          Melune adaptera ses conseils en fonction de ces priorités
        </Caption>
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
  
  // Sliders
  slidersContainer: {
    paddingHorizontal: theme.spacing.l,
  },
  
  sliderContainer: {
    marginVertical: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
  },
  
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  sliderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  sliderIcon: {
    fontSize: 20,
    marginRight: theme.spacing.s,
  },
  
  sliderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  
  sliderValue: {
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  
  sliderDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.m,
    marginLeft: 28,
    lineHeight: 18,
  },
  
  // Slider interactif
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
    paddingHorizontal: theme.spacing.xs,
  },
  
  sliderStep: {
    width: 60,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.s,
  },
  
  sliderLabel: {
    fontSize: 11,
    color: theme.colors.textLight,
  },
  
  currentValueContainer: {
    alignItems: 'center',
  },
  
  currentValueLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  
  // Résumé
  summaryContainer: {
    margin: theme.spacing.l,
    padding: theme.spacing.l,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  summaryTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  
  summaryContent: {
    marginBottom: theme.spacing.m,
  },
  
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  summaryRank: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: theme.spacing.s,
    width: 20,
  },
  
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  
  summaryNote: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // 🆕 Sélecteur de terminologie
  terminologySection: {
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
    marginBottom: theme.spacing.m,
  },
  terminologyOptions: {
    gap: theme.spacing.s,
  },
  terminologyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  terminologyOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  terminologyIcon: {
    fontSize: 24,
    marginRight: theme.spacing.m,
  },
  terminologyContent: {
    flex: 1,
  },
  terminologyName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  terminologyNameSelected: {
    color: theme.colors.primary,
  },
  terminologyDesc: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
}); 