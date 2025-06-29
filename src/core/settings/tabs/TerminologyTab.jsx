//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/settings/tabs/TerminologyTab.jsx
// 🧩 Type: Settings Tab Component
// 📚 Description: Sélecteur de terminologie cyclique
// 🎯 Mission: Interface utilisateur pour choisir terminologie d'affichage
// 🕒 Version: 1.0 - 2025-06-28 - Architecture additive stricte
// 🧭 Used in: ParametresModal
// ─────────────────────────────────────────────────────────
//

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Heading2, BodyText, Caption } from '../../ui/Typography';
import { useTheme } from '../../../hooks/useTheme';
import { useTerminologySelector } from '../../../hooks/useTerminology';

export default function TerminologyTab({ onDataChange }) {
  const { theme } = useTheme();
  const { currentTerminology, options, onSelect } = useTerminologySelector();
  
  const handleTerminologySelect = (terminologyKey) => {
    onSelect(terminologyKey);
    onDataChange?.();
  };

  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header explicatif */}
      <View style={styles.header}>
        <Heading2 style={styles.title}>Terminologie cyclique</Heading2>
        <BodyText style={styles.description}>
          Choisis comment tu veux voir tes phases du cycle s'afficher dans l'application.
        </BodyText>
      </View>

      {/* Aperçu actuel */}
      <View style={styles.currentPreview}>
        <BodyText style={styles.previewLabel}>Aperçu actuel :</BodyText>
        <View style={styles.previewPhases}>
          {['menstrual', 'follicular', 'ovulatory', 'luteal'].map((phase, index) => {
            const selectedOption = options.find(opt => opt.selected);
            const phaseMapping = selectedOption?.key === 'medical' ? {
              menstrual: "Phase menstruelle",
              follicular: "Phase folliculaire", 
              ovulatory: "Phase ovulatoire",
              luteal: "Phase lutéale"
            } : selectedOption?.key === 'spiritual' ? {
              menstrual: "La Sorcière",
              follicular: "La Jeune Fille",
              ovulatory: "La Mère",
              luteal: "L'Enchanteresse"
            } : selectedOption?.key === 'energetic' ? {
              menstrual: "Phase d'Introspection",
              follicular: "Phase de Renaissance",
              ovulatory: "Phase de Rayonnement", 
              luteal: "Phase de Transformation"
            } : {
              menstrual: "Phase de Pause",
              follicular: "Phase de Création", 
              ovulatory: "Phase d'Expression",
              luteal: "Phase de Réflexion"
            };
            
            return (
              <Caption key={phase} style={styles.previewPhase}>
                {index > 0 && ' • '}{phaseMapping[phase]}
              </Caption>
            );
          })}
        </View>
      </View>

      {/* Options terminologies */}
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optionCard,
              option.selected && styles.optionCardSelected
            ]}
            onPress={() => handleTerminologySelect(option.key)}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionIcon}>
                <BodyText style={styles.optionEmoji}>{option.icon}</BodyText>
              </View>
              <View style={styles.optionContent}>
                <BodyText style={[
                  styles.optionName,
                  option.selected && styles.optionNameSelected
                ]}>
                  {option.name}
                </BodyText>
                <Caption style={[
                  styles.optionDescription,
                  option.selected && styles.optionDescriptionSelected
                ]}>
                  {option.description}
                </Caption>
              </View>
              {option.selected && (
                <Feather 
                  name="check-circle" 
                  size={24} 
                  color={theme.colors.primary} 
                />
              )}
            </View>
            
            {/* Exemples phases pour cette terminologie */}
            <View style={styles.optionExamples}>
              <Caption style={[
                styles.exampleLabel,
                option.selected && styles.exampleLabelSelected
              ]}>
                Exemples :
              </Caption>
              <View style={styles.examplePhases}>
                {option.key === 'medical' && (
                  <>
                    <Caption style={styles.examplePhase}>Phase menstruelle</Caption>
                    <Caption style={styles.examplePhase}>Phase ovulatoire</Caption>
                  </>
                )}
                {option.key === 'spiritual' && (
                  <>
                    <Caption style={styles.examplePhase}>La Sorcière</Caption>
                    <Caption style={styles.examplePhase}>La Mère</Caption>
                  </>
                )}
                {option.key === 'energetic' && (
                  <>
                    <Caption style={styles.examplePhase}>Introspection</Caption>
                    <Caption style={styles.examplePhase}>Rayonnement</Caption>
                  </>
                )}
                {option.key === 'modern' && (
                  <>
                    <Caption style={styles.examplePhase}>Pause</Caption>
                    <Caption style={styles.examplePhase}>Expression</Caption>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Note technique */}
      <View style={styles.footer}>
        <Caption style={styles.footerNote}>
          💡 Cette préférence change uniquement l'affichage. 
          La logique du cycle reste identique.
        </Caption>
      </View>
      
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  header: {
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textLight,
    lineHeight: 22,
  },

  currentPreview: {
    margin: theme.spacing.l,
    marginTop: 0,
    padding: theme.spacing.l,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  previewPhases: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewPhase: {
    fontSize: 13,
    color: theme.colors.primary,
  },

  optionsContainer: {
    padding: theme.spacing.l,
    paddingTop: 0,
  },
  
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  optionEmoji: {
    fontSize: 20,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionNameSelected: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  optionDescriptionSelected: {
    color: theme.colors.primary + 'CC',
  },
  
  optionExamples: {
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  exampleLabelSelected: {
    color: theme.colors.primary,
  },
  examplePhases: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  examplePhase: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },

  footer: {
    padding: theme.spacing.l,
    paddingTop: 0,
  },
  footerNote: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 