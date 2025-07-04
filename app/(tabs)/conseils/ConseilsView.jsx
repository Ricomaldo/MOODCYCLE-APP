//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/conseils/ConseilsView.jsx
// 🧩 Type: Écran Conseils
// 📚 Description: Insights + vignettes + intelligence observation
// 🕒 Version: 1.2 - 2025-06-29
// 🧭 Used in: Navigation principale, conseils personnalisés
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Animated, Easing, Platform, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../src/hooks/useTheme';
import { Heading, BodyText, Caption } from '../../../src/core';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import { ConseilsHeader } from '../../../src/core/layout/SimpleHeader';
import InsightCard from '../../../src/features/insights/InsightCard';
import { VignettesContainer } from '../../../src/features/insights/VignetteCard';
import { useCycleStore } from '../../../src/stores/useCycleStore';
import { getCurrentPhase, getCurrentCycleDay } from '../../../src/utils/cycleCalculations';
import { useVignettes } from '../../../src/hooks/useVignettes';
import { usePersonalizedInsight } from '../../../src/hooks/usePersonalizedInsight';
import { useUserStore } from '../../../src/stores/useUserStore';
import { PhaseIcon } from '../../../src/config/iconConstants';
import { useTerminology } from '../../../src/hooks/useTerminology';
import { useUserIntelligence } from '../../../src/stores/useUserIntelligence';

export default function ConseilsView() {
  const cycleData = useCycleStore((state) => state) || {};
  const observations = useCycleStore((state) => state.observations || []);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const currentDay = getCurrentCycleDay(cycleData.lastPeriodDate, cycleData.length);
  const hasData = !!(cycleData.lastPeriodDate && cycleData.length);
  const { profile } = useUserStore();
  const { theme } = useTheme();
  const { getPhaseLabel } = useTerminology();
  const intelligence = useUserIntelligence();

  const safeProfile = profile || { prenom: null };
  
  const hasObservations = observations.length >= 3;
  const currentPhaseObservations = observations.filter(obs => obs.phase === currentPhase);
  const isObservationBased = currentPhaseObservations.length >= 2;
  
  // 🧠 Intelligence metrics
  const confidence = intelligence.learning?.confidence || 0;
  const hasMinimumConfidence = confidence > 30;
  const patternsCount = React.useMemo(() => {
    const learning = intelligence.learning;
    if (!learning) return 0;
    
    let count = 0;
    if (learning.timePatterns?.favoriteHours?.length > 0) count++;
    if (learning.phasePatterns && Object.keys(learning.phasePatterns).length > 0) count++;
    if (learning.conversationPrefs?.successfulPrompts?.length > 0) count++;
    if (learning.cycleRegularity) count++;
    
    return count;
  }, [intelligence.learning]);
  
  const {
    insight,
    loading: insightLoading,
    error: insightError,
    refresh: refreshInsight
  } = usePersonalizedInsight();
  
  const insightRevealAnim = React.useRef(new Animated.Value(0)).current;
  const insightScaleAnim = React.useRef(new Animated.Value(0.95)).current;
  
  // 🧠 Intelligence animations
  const intelligenceOpacityAnim = React.useRef(new Animated.Value(0)).current;
  const intelligenceProgressAnim = React.useRef(new Animated.Value(0)).current;
  
  const {
    vignettes,
    loading: vignettesLoading, 
    refresh: refreshVignettes,
    trackEngagement,
  } = useVignettes();
  
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (insight && !insightLoading) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Animated.parallel([
        Animated.timing(insightRevealAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.spring(insightScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      insightRevealAnim.setValue(0);
      insightScaleAnim.setValue(0.95);
    }
  }, [insight, insightLoading]);

  // 🧠 Animation intelligence
  React.useEffect(() => {
    if (confidence > 0) {
      Animated.parallel([
        Animated.timing(intelligenceOpacityAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(intelligenceProgressAnim, {
          toValue: confidence / 100,
          duration: 1200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: false,
        })
      ]).start();
    } else {
      intelligenceOpacityAnim.setValue(0);
      intelligenceProgressAnim.setValue(0);
    }
  }, [confidence, patternsCount]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshInsight(), refreshVignettes()]);
    setRefreshing(false);
  }, [refreshInsight, refreshVignettes]);

  const handleVignettePress = async (data) => {
    const { vignette, currentPhase, persona, action, navigationParams } = data;
    
    trackEngagement(vignette);
    
    try {
      console.info('🧭 ConseilsView navigation:', action);
      
      await router.push(navigationParams);
      
    } catch (error) {
      console.error('🚨 Erreur navigation ConseilsView:', error);
      router.push('/(tabs)/cycle');
    }
    
    return false;
  };

  const handleQuickNav = (destination) => {
    router.push(`/(tabs)/${destination}`);
  };

  const styles = getStyles(theme);

  if (!hasData) {
    return (
      <ScreenContainer style={styles.container} hasTabs={true}>
        <ConseilsHeader />
        <View style={styles.setupContainer}>
          <Heading style={styles.setupTitle}>Bienvenue !</Heading>
          <BodyText style={styles.setupText}>
            Configure ton cycle pour découvrir tes conseils personnalisés
          </BodyText>
          <TouchableOpacity 
            style={styles.setupButton}
            onPress={() => router.push('/(tabs)/cycle')}
          >
            <BodyText style={styles.setupButtonText}>Commencer</BodyText>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      <ConseilsHeader />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        
        <View style={styles.cycleStatus}>
          <PhaseIcon 
            phaseKey={currentPhase}
            size={16}
            color={theme.colors.phases[currentPhase]}
          />
          <Caption style={styles.cycleStatusText}>
            Jour {currentDay} • {getPhaseLabel(currentPhase)}
          </Caption>
        </View>

        {isObservationBased && (
          <View style={styles.observationBadge}>
            <Feather name="eye" size={14} color={theme.colors.secondary} />
            <Caption style={styles.observationBadgeText}>
              Basé sur tes ressentis
            </Caption>
          </View>
        )}

        <View style={styles.insightSection}>
          {insightLoading ? (
            <View style={styles.loadingInsight}>
              <BodyText style={styles.loadingText}>Personnalisation en cours...</BodyText>
            </View>
          ) : insightError ? (
            <View style={styles.errorInsight}>
              <BodyText style={styles.errorText}>
                Impossible de charger ton insight pour aujourd'hui
              </BodyText>
              <TouchableOpacity style={styles.retryButton} onPress={refreshInsight}>
                <Caption style={styles.retryText}>Réessayer</Caption>
              </TouchableOpacity>
            </View>
          ) : insight ? (
            <Animated.View
              style={{
                opacity: insightRevealAnim,
                transform: [{ scale: insightScaleAnim }],
              }}
            >
              <InsightCard
                insight={insight}
                onPress={() => router.push(`/(tabs)/cycle/phases/${currentPhase}`)}
                animated={true}
              />
            </Animated.View>
          ) : null}
        </View>

        <View style={styles.quickNavSection}>
          <BodyText style={styles.quickNavTitle}>Actions rapides</BodyText>
          <View style={styles.quickNavGrid}>
            <TouchableOpacity 
              style={styles.quickNavItem}
              onPress={() => handleQuickNav('cycle')}
            >
              <Feather name="calendar" size={20} color={theme.colors.phases[currentPhase]} />
              <Caption style={styles.quickNavText}>Mon cycle</Caption>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickNavItem}
              onPress={() => handleQuickNav('notebook')}
            >
              <Feather name="book-open" size={20} color={theme.colors.secondary} />
              <Caption style={styles.quickNavText}>Journal</Caption>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.vignettesSection}>
          <BodyText style={styles.vignettesTitle}>
            Conseils pour toi
          </BodyText>
          
          {(isObservationBased || confidence > 0) && (
            <Animated.View 
              style={[
                styles.intelligenceIndicator,
                { opacity: intelligenceOpacityAnim }
              ]}
            >
              <View style={styles.intelligenceHeader}>
                <Feather 
                  name={confidence > 60 ? "sparkles" : "cpu"} 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Caption style={styles.intelligenceText}>
                  {isObservationBased 
                    ? "Intelligence adaptée à tes observations" 
                    : "Analyse de tes patterns en cours"
                  }
                </Caption>
              </View>
              
              {confidence > 0 && (
                <View style={styles.intelligenceMetrics}>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <Animated.View 
                        style={[
                          styles.progressBar,
                          {
                            width: intelligenceProgressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: theme.colors.primary,
                          }
                        ]}
                      />
                    </View>
                    <Caption style={styles.progressText}>
                      {Math.round(confidence)}%
                    </Caption>
                  </View>
                  
                  {hasMinimumConfidence && patternsCount > 0 && (
                    <Caption style={styles.patternsText}>
                      Patterns détectés : {patternsCount}
                    </Caption>
                  )}
                </View>
              )}
            </Animated.View>
          )}
          
          <VignettesContainer
            vignettes={vignettes}
            loading={vignettesLoading}
            onVignettePress={handleVignettePress}
            currentPhase={currentPhase}
            style={styles.vignettesContainer}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text,
  },
  setupText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  setupButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  setupButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cycleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  cycleStatusText: {
    marginLeft: 8,
    color: theme.colors.textSecondary,
  },
  observationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.secondary + '20',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  observationBadgeText: {
    marginLeft: 6,
    color: theme.colors.secondary,
    fontSize: 12,
  },
  insightSection: {
    marginBottom: 24,
  },
  loadingInsight: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  errorInsight: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  retryText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  quickNavSection: {
    marginBottom: 24,
  },
  quickNavTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.text,
  },
  quickNavGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickNavItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  quickNavText: {
    marginTop: 8,
    color: theme.colors.textSecondary,
  },
  vignettesSection: {
    marginBottom: 24,
  },
  vignettesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.text,
  },
  intelligenceIndicator: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary + '08',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  intelligenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  intelligenceText: {
    marginLeft: 8,
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  intelligenceMetrics: {
    gap: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
  patternsText: {
    color: theme.colors.primary + 'CC',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  vignettesContainer: {
    marginTop: 8,
  },
});