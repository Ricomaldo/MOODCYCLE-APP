//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/settings/ThemeSelector.jsx
// 🧩 Type: UI Component
// 📚 Description: Sélecteur de thème (clair/sombre/système) pour les paramètres
// 🕒 Version: 1.0 - 2025-01-15
// 🧭 Used in: ParametresModal > PreferencesTab
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { BodyText, Caption } from '../ui/Typography';

const THEME_OPTIONS = [
  { 
    key: 'light', 
    label: 'Clair', 
    icon: 'sun',
    description: 'Thème clair permanent'
  },
  { 
    key: 'dark', 
    label: 'Sombre', 
    icon: 'moon',
    description: 'Thème sombre permanent'
  },
  { 
    key: 'system', 
    label: 'Système', 
    icon: 'smartphone',
    description: 'Suit les réglages de votre appareil'
  },
];

export default function ThemeSelector({ onDataChange }) {
  const { theme, currentTheme, setTheme, systemColorScheme, isDark } = useTheme();
  const styles = getStyles(theme);
  
  const handleThemeChange = (themeKey) => {
    if (themeKey === currentTheme) return;
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setTheme(themeKey);
    
    // Notifier le parent du changement
    if (onDataChange) {
      onDataChange();
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <BodyText style={[styles.title, { color: theme.colors.text }]}>
          🌙 Apparence
        </BodyText>
        <Caption style={[styles.subtitle, { color: theme.colors.textLight }]}>
          Choisissez votre thème préféré
        </Caption>
      </View>
      
      <View style={styles.optionsContainer}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = currentTheme === option.key;
          const isSystemAndDark = option.key === 'system' && systemColorScheme === 'dark';
          
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.option,
                { 
                  backgroundColor: isSelected 
                    ? theme.colors.primary + '15' 
                    : theme.colors.background,
                  borderColor: isSelected 
                    ? theme.colors.primary 
                    : theme.colors.border,
                }
              ]}
              onPress={() => handleThemeChange(option.key)}
              activeOpacity={0.7}
            >
              <View style={styles.optionHeader}>
                <View style={[
                  styles.iconContainer,
                  { 
                    backgroundColor: isSelected 
                      ? theme.colors.primary + '20' 
                      : theme.colors.backgroundSecondary 
                  }
                ]}>
                  <Feather 
                    name={option.icon} 
                    size={18} 
                    color={isSelected 
                      ? theme.colors.primary 
                      : theme.colors.textLight
                    } 
                  />
                </View>
                
                <View style={styles.optionContent}>
                  <BodyText 
                    style={[
                      styles.optionLabel,
                      { 
                        color: isSelected 
                          ? theme.colors.primary 
                          : theme.colors.text 
                      }
                    ]}
                  >
                    {option.label}
                  </BodyText>
                  
                  <Caption 
                    style={[
                      styles.optionDescription,
                      { color: theme.colors.textLight }
                    ]}
                  >
                    {option.description}
                  </Caption>
                  
                  {/* Indicateur pour le mode système */}
                  {option.key === 'system' && (
                    <Caption 
                      style={[
                        styles.systemIndicator,
                        { color: theme.colors.primary }
                      ]}
                    >
                      Actuellement : {systemColorScheme === 'dark' ? 'Sombre' : 'Clair'}
                    </Caption>
                  )}
                </View>
                
                {/* Indicateur de sélection */}
                {isSelected && (
                  <View style={[
                    styles.selectedIndicator,
                    { backgroundColor: theme.colors.primary }
                  ]}>
                    <Feather name="check" size={12} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Aperçu du thème actuel */}
      <View style={[
        styles.preview,
        { 
          backgroundColor: theme.colors.backgroundSecondary,
          borderColor: theme.colors.border 
        }
      ]}>
        <Caption style={[styles.previewLabel, { color: theme.colors.textLight }]}>
          Aperçu actuel
        </Caption>
        <View style={styles.previewContent}>
          <View style={[
            styles.previewCard,
            { backgroundColor: theme.colors.surface }
          ]}>
            <BodyText style={[styles.previewText, { color: theme.colors.text }]}>
              Texte principal
            </BodyText>
            <Caption style={[styles.previewSubtext, { color: theme.colors.textLight }]}>
              Texte secondaire
            </Caption>
          </View>
          <View style={[
            styles.previewPhase,
            { backgroundColor: theme.colors.primary }
          ]}>
            <Caption style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
              Accent
            </Caption>
          </View>
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  
  // Options
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  option: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  systemIndicator: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Aperçu
  preview: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewCard: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
  },
  previewText: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  previewPhase: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
}); 