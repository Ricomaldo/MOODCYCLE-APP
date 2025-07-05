//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/cycle/CycleProgressionIndicator.jsx
// 🧩 Type: Component
// 📚 Description: Indicateur visuel progression modes cycle
// 🕒 Version: 1.0 - Mission Beta
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Caption, SmallText } from '../../core/ui/typography';
import { useEngagementStore } from '../../stores/useEngagementStore';
import { useQuickObservation } from '../../hooks/useQuickObservation';

const PROGRESSION_STEPS = [
  { 
    key: 'discovery', 
    label: 'Découverte', 
    icon: 'compass',
    description: 'Je calcule selon tes règles'
  },
  { 
    key: 'learning', 
    label: 'Apprentissage', 
    icon: 'book-open',
    description: "J'apprends tes patterns"
  },
  { 
    key: 'autonomous', 
    label: 'Autonomie', 
    icon: 'star',
    description: 'Tu guides, je suis'
  }
];

export default function CycleProgressionIndicator({ compact = false, onPress }) {
  const theme = useTheme();
  const { maturity, getNextMilestone } = useEngagementStore();
  const { totalObservations, canSwitchToObservation } = useQuickObservation();
  
  const currentLevel = maturity?.current || 'discovery';
  const confidence = maturity?.confidence || 0;
  const nextMilestone = getNextMilestone();
  
  const currentIndex = PROGRESSION_STEPS.findIndex(s => s.key === currentLevel);
  
  const styles = getStyles(theme);
  
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPress}>
        <View style={styles.compactContent}>
          <Feather 
            name={PROGRESSION_STEPS[currentIndex].icon} 
            size={16} 
            color={theme.colors.primary} 
          />
          <SmallText style={styles.compactText}>
            {PROGRESSION_STEPS[currentIndex].label}
          </SmallText>
          <View style={styles.compactProgress}>
            <View 
              style={[
                styles.compactProgressFill,
                { width: `${confidence}%` }
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {PROGRESSION_STEPS.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = step.key === currentLevel;
          
          return (
            <View key={step.key} style={styles.stepWrapper}>
              <View style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCurrent && styles.stepCircleCurrent
              ]}>
                <Feather 
                  name={step.icon} 
                  size={16} 
                  color={isActive ? '#fff' : theme.colors.textLight} 
                />
              </View>
              
              <Caption style={[
                styles.stepLabel,
                isCurrent && styles.stepLabelCurrent
              ]}>
                {step.label}
              </Caption>
              
              {index < PROGRESSION_STEPS.length - 1 && (
                <View style={[
                  styles.connector,
                  isActive && styles.connectorActive
                ]} />
              )}
            </View>
          );
        })}
      </View>
      
      {/* Message encouragement */}
      <View style={styles.messageContainer}>
        <Caption style={styles.messageText}>
          {PROGRESSION_STEPS[currentIndex].description}
        </Caption>
        
        {nextMilestone && currentLevel !== 'autonomous' && (
          <Caption style={styles.progressText}>
            {nextMilestone.missing.days > 0 
              ? `Encore ${nextMilestone.missing.days} jours d'utilisation`
              : totalObservations < 10
              ? `${10 - totalObservations} observations pour progresser`
              : 'Continue comme ça !'
            }
          </Caption>
        )}
      </View>
      
      {/* Barre de progression */}
      {currentLevel !== 'autonomous' && (
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${confidence}%`,
                backgroundColor: theme.colors.primary 
              }
            ]} 
          />
        </View>
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: theme.colors.primary,
  },
  stepCircleCurrent: {
    borderWidth: 2,
    borderColor: theme.colors.primary + '40',
  },
  stepLabel: {
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  connector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: theme.colors.border,
    width: '100%',
  },
  connectorActive: {
    backgroundColor: theme.colors.primary,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  messageText: {
    color: theme.colors.text,
    fontSize: 13,
    textAlign: 'center',
  },
  progressText: {
    color: theme.colors.primary,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  progressBar: {
    height: 3,
    backgroundColor: theme.colors.border,
    borderRadius: 1.5,
    marginTop: theme.spacing.m,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  // Compact version
  compactContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.s,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.s,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  compactText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  compactProgress: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.border,
    borderRadius: 1,
    marginLeft: theme.spacing.s,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
  },
});