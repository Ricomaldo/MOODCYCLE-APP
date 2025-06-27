//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/InsightCard.jsx - ACTIONS VISIBLES
// 🧩 Type: UI Component Premium
// 📚 Description: Carte insight avec actions subtiles mais visibles
// 🕒 Version: 7.0 - 2025-06-27 - ACTIONS VISIBLES + BORDER RADIUS UNIFIÉ
// 🧭 Features: Actions contrastées + BorderRadius theme + UX claire
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef } from 'react';
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
import { BodyText, Caption } from '../../core/ui/Typography';
import { useUserStore } from '../../stores/useUserStore';
import { useNotebookStore } from '../../stores/useNotebookStore';
import ShareableCard from './ShareableCard';

export default function InsightCard({ 
  insight, 
  phase = 'menstrual',
  source = 'daily',
  persona = null,
  showActions = true,
  onSave = null,
  style
}) {
  const { theme } = useTheme();
  const styles = getStyles(theme, phase);
  const { profile } = useUserStore();
  const { addEntry } = useNotebookStore();
  
  // États
  const [isSharing, setIsSharing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Refs
  const shareCardRef = useRef();
  const saveIconAnim = useRef(new Animated.Value(1)).current;
  
  // ✅ DONNÉES CALCULÉES
  const phaseColor = theme.colors.phases[phase];
  const textColor = theme.getTextColorOnPhase(phase);
  const isLightPhase = theme.phaseNeedsBlackText(phase);
  const userName = profile?.prenom || 'toi';
  
  // ✅ FORMATAGE LABEL SOURCE
  const getSourceLabel = () => {
    const labels = {
      daily: 'Insight du jour',
      personalized: 'Pour toi',
      phase: `Phase ${getPhaseDisplayName(phase)}`,
      api: 'Conseil personnalisé',
      fallback: 'Inspiration'
    };
    return labels[source] || 'Conseil personnalisé';
  };
  
  const getPhaseDisplayName = (phaseKey) => {
    const names = {
      menstrual: 'menstruelle',
      follicular: 'folliculaire', 
      ovulatory: 'ovulatoire',
      luteal: 'lutéale'
    };
    return names[phaseKey] || phaseKey;
  };

  // ✅ ACTION HANDLERS
  const handleSave = async () => {
    try {
      if (Haptics.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // ✅ Extraire le contenu textuel de l'insight
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
      
      // Callback custom
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

      // Attendre le rendu de ShareableCard
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
        {/* ✅ HEADER AVEC SOURCE + ACTIONS VISIBLES */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.sourceIndicator, { 
              backgroundColor: isLightPhase ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' 
            }]}>
              <BodyText style={{ color: textColor, fontSize: 12 }}>✨</BodyText>
            </View>
            <Caption style={[styles.sourceLabel, { color: textColor }]}>
              {getSourceLabel()}
            </Caption>
          </View>
          
          {/* ✅ ACTIONS VISIBLES ET CONTRASTÉES */}
          {showActions && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, {
                  backgroundColor: isLightPhase ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)',
                }]}
                onPress={handleSave}
              >
                <Animated.View style={{ transform: [{ scale: saveIconAnim }] }}>
                  <Feather 
                    name={isSaved ? "bookmark" : "bookmark"} 
                    size={16} 
                    color={isLightPhase ? theme.colors.primary : 'white'}
                    style={{ opacity: isSaved ? 1 : 0.8 }}
                  />
                </Animated.View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, {
                  backgroundColor: isLightPhase ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)',
                }]}
                onPress={handleShare}
              >
                <Feather 
                  name="share" 
                  size={16} 
                  color={isLightPhase ? theme.colors.secondary : 'white'}
                  style={{ opacity: 0.8 }}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ✅ CONTENU INSIGHT */}
        <View style={styles.content}>
          <BodyText style={[styles.insightText, { color: textColor }]}>
            {typeof insight === 'object' && insight.content ? insight.content : insight}
          </BodyText>
        </View>

        {/* ✅ FOOTER AVEC PHASE + PERSONA */}
        <View style={styles.footer}>
          <View style={styles.phaseInfo}>
            <View style={[styles.phaseDot, { 
              backgroundColor: textColor,
              opacity: 0.6 
            }]} />
            <Caption style={[styles.phaseLabel, { color: textColor }]}>
              {getPhaseDisplayName(phase)}
            </Caption>
          </View>
          
          {persona && (
            <Caption style={[styles.personaHint, { color: textColor }]}>
              {userName}
            </Caption>
          )}
        </View>

        {/* ✅ GRADIENT BORDER */}
        <View style={[styles.gradientBorder, { 
          backgroundColor: isLightPhase ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' 
        }]} />
      </View>

      {/* ✅ SHAREABLE CARD (HIDDEN) */}
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
  const isLightPhase = theme.phaseNeedsBlackText(phase);
  
  return StyleSheet.create({
    container: {
      backgroundColor: phaseColor,
      borderRadius: theme.borderRadius.large, // ✅ UNIFIÉ
      overflow: 'hidden',
      position: 'relative',
      
      // ✅ SHADOW PREMIUM COLORÉE
      shadowColor: phaseColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
      
      // ✅ BORDER SUBTIL
      borderWidth: 1,
      borderColor: isLightPhase ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
    },
    
    // ✅ HEADER AVEC ACTIONS VISIBLES
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
      borderRadius: theme.borderRadius.medium, // ✅ UNIFIÉ
      alignItems: 'center',
      justifyContent: 'center',
    },
    sourceLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      opacity: 0.8,
    },
    
    // ✅ ACTIONS CONTRASTÉES ET VISIBLES
    actionsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.s,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.medium, // ✅ UNIFIÉ
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    // ✅ CONTENU
    content: {
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.l,
    },
    insightText: {
      fontSize: 17,
      lineHeight: 26,
      fontWeight: '500',
      fontFamily: theme.fonts.body,
      textAlign: 'left',
    },
    
    // ✅ FOOTER
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
      borderRadius: theme.borderRadius.small, // ✅ UNIFIÉ (pill trop gros)
    },
    phaseLabel: {
      fontSize: 12,
      fontWeight: '500',
      opacity: 0.7,
      textTransform: 'capitalize',
    },
    personaHint: {
      fontSize: 12,
      fontWeight: '500',
      opacity: 0.8,
      fontStyle: 'italic',
    },
    
    // ✅ GRADIENT BORDER
    gradientBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      borderRadius: theme.borderRadius.large, // ✅ UNIFIÉ
    },
  });
};