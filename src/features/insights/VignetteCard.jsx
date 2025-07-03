//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/insights/VignetteCard.jsx
// 🧩 Type: Composant Réutilisable
// 📚 Description: Carte vignette avec actions navigation complètes
// 🕒 Version: 1.1 - 2025-06-21 - DEBUG AJOUTÉ
// 🧭 Used in: CycleView, phase détails, suggestions intelligentes
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BodyText, Caption } from '../../core/ui/typography';
import { useUserStore } from '../../stores/useUserStore';
import { useEngagementStore } from '../../stores/useEngagementStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { getCurrentPhase } from '../../utils/cycleCalculations';


export default function VignetteCard({ 
  vignette, 
  onPress,
  style,
  showCategory = false,
  trackEngagement = true 
}) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  // ✅ DEBUG: Vérification données vignette
  if (!vignette) {
    console.error('🚨 VignetteCard: vignette is null/undefined');
    return null;
  }

  if (!vignette.id || !vignette.title) {
    console.error('🚨 VignetteCard: vignette malformée:', vignette);
    return null;
  }

  // ✅ HOOKS avec vérification d'erreur
  const userStore = useUserStore();
  const engagementStore = useEngagementStore();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration) || 'menstrual';

  const persona = userStore?.persona || {};
  const trackAction = engagementStore?.trackAction || (() => {});

  // ✅ ACTIONS NAVIGATION AVEC GESTION CALLBACK PRIORITAIRE
  const handlePress = async () => {
    try {


      // Haptic feedback iOS
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Tracking engagement
      if (trackEngagement && typeof trackAction === 'function') {

        trackAction('vignette_pressed', {
          vignetteId: vignette.id,
          action: vignette.action,
          phase: currentPhase,
          persona: persona.assigned,
          category: vignette.category || 'standard'
        });
      }

      // ✅ NOUVEAU: Callback prioritaire avec données complètes
      if (onPress && typeof onPress === 'function') {

        const callbackData = {
          vignette,
          currentPhase,
          persona: persona.assigned,
          action: vignette.action,
          navigationParams: getNavigationParams()
        };
        
        // Callback reçoit toutes les données et gère la navigation
        const callbackResult = onPress(callbackData);
        
        // Si callback retourne true, on continue avec navigation automatique
        // Si callback retourne false/undefined, on délègue complètement
        if (callbackResult !== true) {

          return;
        }
      }

      // ✅ FALLBACK: Navigation automatique si pas de callback ou callback accepte

      await handleNavigation();
      

    } catch (error) {
      console.error('🚨 Erreur handlePress:', error);
      // ✅ FALLBACK: Navigation simple vers cycle
      Alert.alert(
        'Navigation', 
        `Erreur navigation. Redirection vers cycle.\n\nDébug: ${error.message}`,
        [
          { text: 'OK', onPress: () => router.push('/(tabs)/cycle') }
        ]
      );
    }
  };

  // ✅ NOUVEAU: Helper pour paramètres navigation
  const getNavigationParams = () => {
    const baseParams = {
      vignetteId: vignette.id,
      sourcePhase: currentPhase,
      sourcePersona: persona.assigned,
      context: 'vignette'
    };

    switch (vignette.action) {
      case 'chat':
        return {
          pathname: '/(tabs)/notebook',
          params: {
            ...baseParams,
            mode: 'write',
            initialPrompt: vignette.prompt,
            chatMode: 'true'
          }
        };
      case 'notebook':
        return {
          pathname: '/(tabs)/notebook',
          params: {
            ...baseParams,
            mode: 'write',
            initialPrompt: vignette.prompt
          }
        };
      case 'quick_track':
        return {
          pathname: '/(tabs)/notebook',
          params: {
            ...baseParams,
            mode: 'track'
          }
        };
      case 'phase_detail':
        return {
          pathname: `/(tabs)/cycle/phases/${currentPhase}`,
          params: {
            sourceVignette: vignette.id,
            context: 'vignette'
          }
        };
      case 'insights':
        return {
          pathname: '/(tabs)/conseils',
          params: {
            phase: currentPhase,
            persona: persona.assigned,
            sourceVignette: vignette.id,
            focus: 'insights'
          }
        };
      case 'explore':
        return {
          pathname: '/(tabs)/cycle',
          params: {
            focus: vignette.focusArea || currentPhase,
            sourceVignette: vignette.id
          }
        };
      default:
        return {
          pathname: '/(tabs)/cycle',
          params: baseParams
        };
    }
  };

  const handleNavigation = async () => {
    try {


      switch (vignette.action) {
        case 'chat':

          router.push({
            pathname: '/(tabs)/notebook',
            params: {
              mode: 'write',
              initialPrompt: vignette.prompt,
              sourcePhase: currentPhase,
              sourcePersona: persona.assigned,
              vignetteId: vignette.id,
              context: 'vignette',
              chatMode: 'true'
            }
          });
          break;

        case 'notebook':

          router.push({
            pathname: '/(tabs)/notebook',
            params: {
              mode: 'write',
              initialPrompt: vignette.prompt,
              sourcePhase: currentPhase,
              sourcePersona: persona.assigned,
              vignetteId: vignette.id,
              context: 'vignette'
            }
          });
          break;

        case 'quick_track':

          router.push({
            pathname: '/(tabs)/notebook',
            params: {
              mode: 'track',
              sourcePhase: currentPhase,
              sourcePersona: persona.assigned,
              vignetteId: vignette.id,
              context: 'vignette'
            }
          });
          break;

        case 'phase_detail':

          router.push({
            pathname: `/(tabs)/cycle/phases/${currentPhase}`,
            params: {
              sourceVignette: vignette.id,
              context: 'vignette'
            }
          });
          break;

        case 'insights':

          router.push({
            pathname: '/(tabs)/conseils',
            params: {
              phase: currentPhase,
              persona: persona.assigned,
              sourceVignette: vignette.id,
              focus: 'insights'
            }
          });
          break;

        case 'explore':

          router.push({
            pathname: '/(tabs)/cycle',
            params: {
              focus: vignette.focusArea || currentPhase,
              sourceVignette: vignette.id
            }
          });
          break;

        default:
          console.warn('🚨 Action vignette non reconnue:', vignette.action);
          // ✅ AMÉLIORATION: Alert avec choix
          Alert.alert(
            'Action inconnue',
            `Action "${vignette.action}" non reconnue. Aller vers l'accueil cycle ?`,
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Accueil', onPress: () => router.push('/(tabs)/cycle') }
            ]
          );
      }
    } catch (error) {
      console.error('🚨 Erreur handleNavigation:', error);
      throw error; // Remonte l'erreur pour le catch parent
    }
  };

  // ✅ STYLES DYNAMIQUES
  const getCardStyle = () => {
    let baseStyle = styles.card;
    
    // Style selon catégorie
    if (vignette.category === 'smart_suggestion') {
      baseStyle = [baseStyle, styles.smartCard];
    } else if (vignette.priority === 'high') {
      baseStyle = [baseStyle, styles.priorityCard];
    }
    
    return baseStyle;
  };

  const getIconStyle = () => {
    if (vignette.category === 'smart_suggestion') {
      return styles.smartIcon;
    }
    return styles.icon;
  };

  // ✅ COULEUR ACTION
  const getActionColor = () => {
    const actionColors = {
      chat: theme.colors.primary,
      notebook: theme.colors.accent,
      quick_track: theme.colors.secondary,
      phase_detail: theme.colors.phases?.[currentPhase] || theme.colors.primary,
      insights: theme.colors.wisdom || theme.colors.primary,
      explore: theme.colors.nature || theme.colors.primary
    };
    
    return actionColors[vignette.action] || theme.colors.primary;
  };

  // ✅ ICÔNE ACTION
  const getActionIcon = () => {
    const actionIcons = {
      chat: 'message-circle',
      notebook: 'edit-3',
      quick_track: 'bar-chart-2',
      phase_detail: 'info',
      insights: 'lightbulb',
      explore: 'compass'
    };
    
    return actionIcons[vignette.action] || 'arrow-right';
  };

  return (
    <TouchableOpacity
      style={[getCardStyle(), style]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* ✅ DEBUG: Badge de debug */}
      {__DEV__ && (
        <View style={styles.debugBadge}>
          <Caption style={styles.debugText}>{vignette.action}</Caption>
        </View>
      )}

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Icône vignette */}
        <View style={[styles.iconContainer, getIconStyle()]}>
          <BodyText style={styles.iconEmoji}>
            {vignette.icon || '✨'}
          </BodyText>
        </View>
        
        {/* Texte */}
        <View style={styles.textContainer}>
          <View style={styles.cardHeader}>
            <BodyText style={styles.title}>{vignette.title}</BodyText>
          </View>
          
          {vignette.prompt && (
            <Caption style={styles.prompt} numberOfLines={2}>
              {vignette.prompt}
            </Caption>
          )}
          
          {showCategory && vignette.category && (
            <Caption style={styles.category}>
              {vignette.category}
            </Caption>
          )}
        </View>
        
        {/* Icône action */}
        <View style={[styles.actionIcon, { backgroundColor: getActionColor() + '20' }]}>
          <Feather 
            name={getActionIcon()} 
            size={16} 
            color={getActionColor()} 
          />
        </View>
      </View>
      
      {/* Indicateur priorité */}
      {vignette.priority === 'high' && (
        <View style={styles.priorityIndicator} />
      )}
      
      {/* Badge suggestion intelligente */}
      {vignette.category === 'smart_suggestion' && (
        <View style={styles.smartBadge}>
          <Feather name="zap" size={10} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ✅ COMPOSANT CONTAINER POUR LISTE
export function VignettesContainer({ 
  vignettes, 
  onVignettePress,
  maxVisible = 3,
  showCategories = false,
  style 
}) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // ✅ Protection contre vignettes undefined ou non-array
  const safeVignettes = Array.isArray(vignettes) ? vignettes : [];
  const visibleVignettes = safeVignettes.slice(0, maxVisible);
  
  if (visibleVignettes.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {visibleVignettes.map((vignette, index) => (
        <VignetteCard
          key={vignette.id}
          vignette={vignette}
          onPress={onVignettePress}
          showCategory={showCategories}
          style={index < visibleVignettes.length - 1 ? styles.cardSpacing : null}
        />
      ))}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  // Container
  container: {
    gap: theme.spacing.m,
  },
  
  // Card de base
  card: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  
  // Variantes cards
  smartCard: {
    borderColor: theme.colors.primary + '40',
    backgroundColor: theme.colors.primary + '05',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.1,
  },
  
  priorityCard: {
    borderColor: theme.colors.accent + '40',
    borderWidth: 1.5,
  },
  
  // Contenu
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  
  // Icône vignette
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  smartIcon: {
    ...theme.getGlassmorphismStyle(theme.colors.primary, {
      bgOpacity: theme.glassmorphism.opacity.bg,
      borderOpacity: theme.glassmorphism.opacity.border,
      borderWidth: 1,
      shadowOpacity: 0,  // Pas de shadow sur les icônes
    }),
  },
  
  iconEmoji: {
    fontSize: 20,
  },
  
  // Texte
  textContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 20,
  },
  
  prompt: {
    fontSize: 13,
    color: theme.colors.textLight,
    lineHeight: 16,
  },
  
  category: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Icône action
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Indicateurs
  priorityIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
  
  smartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  
  // Spacing
  cardSpacing: {
    marginBottom: theme.spacing.m,
  },
  
  // ✅ DEBUG STYLES
  debugBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: 'red',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});