//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/InsightCard.jsx - GLASSMORPHISM
// 🧩 Type: UI Component Premium
// 📚 Description: Carte insight avec effet glassmorphism signature
// 🕒 Version: 8.1 - 2025-06-29 - BLOC 2 Préfixe Observations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Share
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import { useTheme } from '../../hooks/useTheme';
import { BodyText, Caption } from '../../core/ui/typography';
import { useUserStore } from '../../stores/useUserStore';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useTerminology } from '../../hooks/useTerminology';
import ShareableCard from '../shared/ShareableCard';
// 🆕 DEBUG: Import pour tester les enrichissements
// import { debugEnrichments } from '../../services/InsightsEngine';

export default function InsightCard({ 
  insight, 
  phase = 'menstrual',
  source = 'daily',
  persona = null,
  showActions = true,
  onSave = null,
  style,
  isObservationBased = false  // 🆕 BLOC 2
}) {
  const theme = useTheme();
  const styles = getStyles(theme, phase);
  const { profile } = useUserStore();
  const { addEntry } = useNotebookStore();
  const { getArchetypeLabel } = useTerminology();
  
  // 🆕 DEBUG: Pour tester les enrichissements, décommentez ces lignes :
  // useEffect(() => {
  //   debugEnrichments({ phase, persona, profile, preferences: profile?.preferences });
  // }, [phase, persona, profile]);
  
  const [isSharing, setIsSharing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const shareCardRef = useRef();
  const saveIconAnim = useRef(new Animated.Value(1)).current;
  // 🆕 Animation pour révélations
  const revelationFadeAnim = useRef(new Animated.Value(0)).current;
  
  const phaseColor = theme.colors.phases[phase];
  const userName = profile?.prenom || 'toi';
  
  // 🆕 Animation pour révélations
  useEffect(() => {
    if (insight?.revelationLevel > 0) {
      Animated.timing(revelationFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [insight?.revelationLevel]);
  
  const getSourceLabel = () => {
    const labels = {
      daily: 'Insight du jour',
      personalized: 'Pour toi',
      phase: `${getArchetypeLabel(phase)}`,
      api: 'Conseil personnalisé',
      fallback: 'Inspiration'
    };
    return labels[source] || 'Conseil personnalisé';
  };

  const handleSave = async () => {
    try {
      if (Haptics.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const insightContent = typeof insight === 'object' && insight.content ? insight.content : insight;
      
      const entry = {
        id: Date.now().toString(),
        content: insightContent,
        type: 'saved',
        tags: [`#${phase}`, '#insight'],
        timestamp: Date.now(),
        phase,
        metadata: {
          source,
          persona,
          savedAt: Date.now()
        }
      };
      
      addEntry(entry.content, entry.type, [`#${phase}`, '#insight']);
      setIsSaved(true);
      
      if (onSave) onSave(entry);
      
    } catch (error) {
      console.error('Erreur sauvegarde insight:', error);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      if (Haptics.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      setTimeout(async () => {
        const uri = await captureRef(shareCardRef, {
          format: 'png',
          quality: 1.0,
          result: 'tmpfile',
        });

        await Share.share({
          url: uri,
          message: `Mon insight personnalisé MoodCycle 🌙`,
        });

        setIsSharing(false);
      }, 200);
    } catch (error) {
      setIsSharing(false);
      console.error('Erreur partage insight:', error);
    }
  };

  return (
    <>
      <View style={[styles.container, style]}>
        {/* Header avec source + actions */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.sourceIndicator}>
              <BodyText style={styles.sourceIcon}>✨</BodyText>
            </View>
            <Caption style={styles.sourceLabel}>
              {getSourceLabel()}
            </Caption>
            
            {insight?.revelationLevel > 0 && (
              <Animated.View style={[
                styles.aiIndicator,
                { opacity: revelationFadeAnim }
              ]}>
                <Feather 
                  name={insight.revelationLevel >= 2 ? "sparkles" : "zap"} 
                  size={12} 
                  color={phaseColor} 
                />
                <Caption style={styles.revelationBadge}>
                  {insight.revelationLevel >= 3 ? "Ultra personnalisé" : "Personnalisé"}
                </Caption>
              </Animated.View>
            )}
          </View>
          
          {showActions && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleSave}
              >
                <Animated.View style={{ transform: [{ scale: saveIconAnim }] }}>
                  <Feather 
                    name={isSaved ? "bookmark" : "bookmark"} 
                    size={16} 
                    color={phaseColor}
                    style={{ opacity: isSaved ? 1 : 0.8 }}
                  />
                </Animated.View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Feather 
                  name="share" 
                  size={16} 
                  color={phaseColor}
                  style={{ opacity: 0.8 }}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Contenu insight avec préfixe observation */}
        <View style={styles.content}>
          {/* 🆕 BLOC 2 - Préfixe observation */}
          {isObservationBased && (
            <BodyText style={styles.observationPrefix}>
              J'ai remarqué que...
            </BodyText>
          )}
          
          <BodyText style={styles.insightText}>
            {typeof insight === 'object' && insight.content ? insight.content : insight}
          </BodyText>
        </View>

        {/* Footer avec phase + persona */}
        <View style={styles.footer}>
          <View style={styles.phaseInfo}>
            <View style={[styles.phaseDot, { backgroundColor: phaseColor }]} />
            <Caption style={styles.phaseLabel}>
              {getArchetypeLabel(phase)}
            </Caption>
          </View>
          
          {persona && (
            <Caption style={styles.personaHint}>
              {userName}
            </Caption>
          )}
        </View>
      </View>

      {isSharing && (
        <ShareableCard
          ref={shareCardRef}
          message={typeof insight === 'object' && insight.content ? insight.content : insight}
          phase={phase}
          userName={userName}
          visible={true}
        />
      )}
    </>
  );
}

const getStyles = (theme, phase) => {
  const phaseColor = theme.colors.phases[phase];
  
  return StyleSheet.create({
    container: {
      // ✅ GLASSMORPHISM SIGNATURE CENTRALISÉ
      ...theme.getPhaseGlassmorphismStyle(phase, {
        borderRadius: theme.borderRadius.large,
      }),
      overflow: 'hidden',
      position: 'relative',
    },
    
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.l,
      paddingTop: theme.spacing.l,
      paddingBottom: theme.spacing.s,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
      flex: 1,
    },
    sourceIndicator: {
      width: 24,
      height: 24,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.getGlassmorphismStyle(phaseColor, {
        bgOpacity: theme.glassmorphism.opacity.medium,
        borderOpacity: theme.glassmorphism.opacity.accent,
        borderWidth: 1,
        shadowOpacity: 0,  // Pas de shadow sur les petits éléments
      }),
    },
    sourceIcon: {
      fontSize: 12,
      color: phaseColor,
    },
    sourceLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: phaseColor,
      opacity: 0.8,
    },
    aiIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.medium,
      backgroundColor: phaseColor + '20',
    },
    revelationBadge: {
      fontSize: 10,
      color: phaseColor,
      marginLeft: 4,
      fontWeight: '600',
    },
    
    // ✅ ACTIONS GLASSMORPHISM
    actionsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.s,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.getActionGlassmorphismStyle(phaseColor, {
        borderRadius: theme.borderRadius.medium,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }),
    },
    
    content: {
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.l,
    },
    // 🆕 BLOC 2 - Style préfixe observation
    observationPrefix: {
      fontSize: 15,
      lineHeight: 24,
      fontWeight: '600',
      fontFamily: theme.fonts.body,
      fontStyle: 'italic',
      color: theme.colors.secondary,
      marginBottom: theme.spacing.xs,
    },
    insightText: {
      fontSize: 17,
      lineHeight: 26,
      fontWeight: '500',
      fontFamily: theme.fonts.body,
      textAlign: 'left',
      color: theme.colors.text,
    },
    
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.l,
      paddingBottom: theme.spacing.l,
      paddingTop: theme.spacing.s,
    },
    phaseInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    phaseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      opacity: 0.8,
    },
    phaseLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: phaseColor,
      opacity: 0.8,
      textTransform: 'capitalize',
    },
    personaHint: {
      fontSize: 12,
      fontWeight: '500',
      color: phaseColor,
      opacity: 0.7,
      fontStyle: 'italic',
    },
  });
};