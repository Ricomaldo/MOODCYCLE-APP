//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/InsightCard.jsx - GLASSMORPHISM
// 🧩 Type: UI Component Premium
// 📚 Description: Carte insight avec effet glassmorphism signature
// 🕒 Version: 8.0 - 2025-06-28 - GLASSMORPHISM + STYLE UNIFIÉ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
import { useTerminology } from '../../hooks/useTerminology';
import ShareableCard from '../shared/ShareableCard';

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
  const { getArchetypeLabel } = useTerminology();
  
  const [isSharing, setIsSharing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const shareCardRef = useRef();
  const saveIconAnim = useRef(new Animated.Value(1)).current;
  
  const phaseColor = theme.colors.phases[phase];
  const userName = profile?.prenom || 'toi';
  
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

        {/* Contenu insight */}
        <View style={styles.content}>
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
      // ✅ GLASSMORPHISM SIGNATURE
      backgroundColor: phaseColor + '15', // 15% opacity
      backdropFilter: 'blur(20px)',
      borderRadius: theme.borderRadius.large,
      borderWidth: 1.5,
      borderColor: phaseColor + '30',
      overflow: 'hidden',
      position: 'relative',
      
      // ✅ SHADOW PREMIUM COLORÉE
      shadowColor: phaseColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
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
      backgroundColor: phaseColor + '20',
      borderWidth: 1,
      borderColor: phaseColor + '40',
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
      backgroundColor: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(10px)',
      borderWidth: 1,
      borderColor: phaseColor + '30',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
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