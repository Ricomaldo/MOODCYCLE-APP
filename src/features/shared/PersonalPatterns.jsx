//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/PersonalPatterns.jsx
// 🌟 CASCADE 3.1: Révélation patterns personnels
// ─────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BodyText, Caption } from '../../core/ui/typography';
import { useUserIntelligence } from '../../stores/useUserIntelligence';
import { useEngagementStore } from '../../stores/useEngagementStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { getCurrentPhase } from '../../utils/cycleCalculations';

// ✅ INTÉGRATION DANS ACCUEILVIEW
/*
// Dans AccueilView.jsx, ajouter après l'insight du jour :

import PersonalPatterns from '../../../src/features/shared/PersonalPatterns';

// Dans le JSX, après insightSection :
<View style={styles.patternsSection}>
  <PersonalPatterns 
    style={styles.patternsCard}
    minimal={false}
  />
</View>

// Dans les styles :
patternsSection: {
  marginBottom: theme.spacing.xl,
},
patternsCard: {
  // Styles supplémentaires si nécessaire
},
*/

export default function PersonalPatterns({ style, minimal = false }) {
  const theme = useTheme();
  const { learning } = useUserIntelligence();
  const { metrics } = useEngagementStore();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  
  // Animation d'apparition
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  // ✅ ANALYSE PATTERNS DISPONIBLES
  const patternsAnalysis = React.useMemo(() => {
    const patterns = [];
    
    // 1. Patterns temporels
    if (learning.timePatterns?.favoriteHours?.length > 0) {
      const hour = learning.timePatterns.favoriteHours[0];
      let timeDescription = 'le matin';
      let icon = 'sunrise';
      
      if (hour >= 12 && hour < 17) {
        timeDescription = "l'après-midi";
        icon = 'sun';
      } else if (hour >= 17 && hour < 22) {
        timeDescription = 'le soir';
        icon = 'sunset';
      } else if (hour >= 22 || hour < 6) {
        timeDescription = 'tard le soir';
        icon = 'moon';
      }
      
      patterns.push({
        type: 'time',
        icon,
        text: `Tu es souvent active ${timeDescription} vers ${hour}h`,
        confidence: 'high',
        data: hour
      });
    }
    
    // 2. Patterns phase actuelle
    if (learning.phasePatterns?.[currentPhase]?.topics?.length > 0) {
      const topics = learning.phasePatterns[currentPhase].topics;
      const topTopic = topics[0];
      
      patterns.push({
        type: 'phase',
        icon: 'target',
        text: `En ${currentPhase}, tu explores souvent ${topTopic}`,
        confidence: topics.length >= 2 ? 'high' : 'medium',
        data: topTopic
      });
    }
    
    // 3. Patterns conversation
    if (learning.conversationPrefs?.successfulPrompts?.length >= 2) {
      const count = learning.conversationPrefs.successfulPrompts.length;
      
      patterns.push({
        type: 'conversation',
        icon: 'message-circle',
        text: `${count} conversations révèlent ta régularité`,
        confidence: count >= 5 ? 'high' : 'medium',
        data: count
      });
    }
    
    // 4. Patterns autonomie
    if (metrics.autonomySignals >= 1) {
      const signals = metrics.autonomySignals;
      let text = 'Tu commences à faire tes propres liens';
      let confidence = 'medium';
      
      if (signals >= 3) {
        text = 'Tu maîtrises tes patterns cycliques !';
        confidence = 'high';
      }
      
      patterns.push({
        type: 'autonomy',
        icon: 'award',
        text,
        confidence,
        data: signals
      });
    }
    
    // 5. Patterns engagement
    if (metrics.daysUsed >= 7) {
      patterns.push({
        type: 'engagement',
        icon: 'heart',
        text: `${metrics.daysUsed} jours de constance. Impressionnant !`,
        confidence: 'high',
        data: metrics.daysUsed
      });
    }
    
    return {
      patterns,
      totalConfidence: learning.confidence || 0,
      hasSignificantData: patterns.length >= 2
    };
  }, [learning, metrics, currentPhase]);

  // ✅ ANIMATION AU MONTAGE
  React.useEffect(() => {
    if (patternsAnalysis.patterns.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [patternsAnalysis.patterns.length]);

  // ✅ PAS ASSEZ DE DONNÉES
  if (!patternsAnalysis.hasSignificantData) {
    if (minimal) return null;
    
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyState}>
          <Feather name="eye" size={20} color={theme.colors.textLight} />
          <BodyText style={styles.emptyText}>
            J'apprends à te connaître...
          </BodyText>
          <Caption style={styles.emptyCaption}>
            Continue tes interactions pour révéler tes patterns
          </Caption>
        </View>
      </View>
    );
  }

  const styles = getStyles(theme, patternsAnalysis.totalConfidence);

  // ✅ RENDU PATTERNS
  const renderPattern = (pattern, index) => {
    const getConfidenceColor = (confidence) => {
      switch (confidence) {
        case 'high': return theme.colors.success;
        case 'medium': return theme.colors.primary;
        default: return theme.colors.textLight;
      }
    };

    return (
      <Animated.View
        key={`${pattern.type}-${index}`}
        style={[
          styles.patternItem,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <View style={[
          styles.patternIcon, 
          theme.getGlassmorphismStyle(getConfidenceColor(pattern.confidence), {
            bgOpacity: theme.glassmorphism.opacity.bg,
            borderOpacity: theme.glassmorphism.opacity.border,
            borderWidth: 1,
            shadowOpacity: 0,  // Pas de shadow sur les icônes patterns
          })
        ]}>
          <Feather 
            name={pattern.icon} 
            size={16} 
            color={getConfidenceColor(pattern.confidence)} 
          />
        </View>
        
        <BodyText style={styles.patternText}>
          {pattern.text}
        </BodyText>
        
        <View style={[styles.confidenceIndicator, { backgroundColor: getConfidenceColor(pattern.confidence) }]} />
      </Animated.View>
    );
  };

  // ✅ VERSION MINIMALE
  if (minimal) {
    const topPattern = patternsAnalysis.patterns[0];
    return (
      <View style={[styles.minimalContainer, style]}>
        {renderPattern(topPattern, 0)}
      </View>
    );
  }

  // ✅ VERSION COMPLÈTE
  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="eye" size={18} color={theme.colors.primary} />
        </View>
        <BodyText style={styles.headerText}>Ce que j'observe chez toi</BodyText>
        <View style={styles.confidenceBadge}>
          <Caption style={styles.confidenceText}>
            {patternsAnalysis.totalConfidence}% de confiance
          </Caption>
        </View>
      </View>
      
      <View style={styles.patternsContainer}>
        {patternsAnalysis.patterns.slice(0, 3).map(renderPattern)}
      </View>
      
      {patternsAnalysis.patterns.length > 3 && (
        <Caption style={styles.moreText}>
          +{patternsAnalysis.patterns.length - 3} autre{patternsAnalysis.patterns.length > 4 ? 's' : ''} pattern{patternsAnalysis.patterns.length > 4 ? 's' : ''}
        </Caption>
      )}
    </Animated.View>
  );
}

const getStyles = (theme, confidence = 0) => StyleSheet.create({
  // Container principal
  container: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: confidence > 50 ? theme.colors.primary + '20' : theme.colors.border,
  },
  
  minimalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    ...theme.getGlassmorphismStyle(theme.colors.primary, {
      bgOpacity: theme.glassmorphism.opacity.bg,
      borderOpacity: theme.glassmorphism.opacity.border,
      borderWidth: 1,
      shadowOpacity: 0,  // Pas de shadow sur l'icône header
    }),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  
  confidenceBadge: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.s,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 2,
  },
  
  confidenceText: {
    fontSize: 11,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  
  // Patterns container
  patternsContainer: {
    gap: theme.spacing.m,
  },
  
  // Pattern item
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
    paddingVertical: theme.spacing.s,
  },
  
  patternIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  patternText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    color: theme.colors.text,
  },
  
  confidenceIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.l,
    gap: theme.spacing.s,
  },
  
  emptyText: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  
  emptyCaption: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // More patterns
  moreText: {
    textAlign: 'center',
    marginTop: theme.spacing.m,
    fontSize: 12,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
});