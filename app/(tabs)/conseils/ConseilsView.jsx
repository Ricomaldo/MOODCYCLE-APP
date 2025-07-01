//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/conseils/ConseilsView.jsx
// 🧩 Type: Écran Conseils avec Observations
// 📚 Description: Insights + vignettes + intelligence observation
// 🕒 Version: 1.2 - 2025-06-29 - BLOC 2 Intelligence Visible
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Animated, Easing, Platform, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../src/hooks/useTheme';
import { Heading, BodyText, Caption } from '../../../src/core/ui/Typography';
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

export default function ConseilsView() {
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state) || {};
  const observations = useCycleStore((state) => state.observations || []);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const currentDay = getCurrentCycleDay(cycleData.lastPeriodDate, cycleData.length);
  const hasData = !!(cycleData.lastPeriodDate && cycleData.length);
  const { profile } = useUserStore();
  const { theme } = useTheme();
  const { getPhaseLabel } = useTerminology();

  // Protection contre profile undefined
  const safeProfile = profile || { prenom: null };
  
  // 🆕 Détecter si les insights sont basés sur observations
  const hasObservations = observations.length >= 3;
  const currentPhaseObservations = observations.filter(obs => obs.phase === currentPhase);
  const isObservationBased = currentPhaseObservations.length >= 2;
  
  // Insight du jour personnalisé
  const {
    insight,
    loading: insightLoading,
    error: insightError,
    refresh: refreshInsight
  } = usePersonalizedInsight();
  
  // Animation révélation insight
  const insightRevealAnim = React.useRef(new Animated.Value(0)).current;
  const insightScaleAnim = React.useRef(new Animated.Value(0.95)).current;
  
  // Vignettes prioritaires
  const {
    vignettes,
    loading: vignettesLoading, 
    refresh: refreshVignettes,
    trackEngagement,
  } = useVignettes();
  
  const [refreshing, setRefreshing] = React.useState(false);

  // Animation révélation
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshInsight(), refreshVignettes()]);
    setRefreshing(false);
  }, [refreshInsight, refreshVignettes]);

  const handleVignettePress = async (data) => {
    const { vignette, currentPhase, persona, action, navigationParams } = data;
    
    // Track engagement si pas déjà fait
    trackEngagement(vignette);
    
    try {
      console.log('🧭 ConseilsView navigation:', action);
      
      // Navigation directe avec les paramètres fournis par VignetteCard
      await router.push(navigationParams);
      
    } catch (error) {
      console.error('🚨 Erreur navigation ConseilsView:', error);
      // Fallback vers cycle
      router.push('/(tabs)/cycle');
    }
    
    // Retourne false pour empêcher navigation automatique dans VignetteCard
    return false;
  };

  const handleQuickNav = (destination) => {
    router.push(`/(tabs)/${destination}`);
  };

  // ✅ Info phase via hook terminologie (phaseInfo legacy supprimé)

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
        
        {/* Mini status cycle */}
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

        {/* 🆕 Badge observation si applicable */}
        {isObservationBased && (
          <View style={styles.observationBadge}>
            <Feather name="eye" size={14} color={theme.colors.secondary} />
            <Caption style={styles.observationBadgeText}>
              Basé sur tes ressentis
            </Caption>
          </View>
        )}

        {/* Insight du jour - Zone centrale */}
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
              <TouchableOpacity onPress={refreshInsight} style={styles.retryButton}>
                <BodyText style={styles.retryText}>Réessayer</BodyText>
              </TouchableOpacity>
            </View>
          ) : insight ? (
            <Animated.View
              style={{
                opacity: insightRevealAnim,
                transform: [
                  {
                    translateY: insightRevealAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  },
                  { scale: insightScaleAnim }
                ]
              }}
            >
              <InsightCard 
                insight={insight.content} 
                phase={currentPhase}
                style={styles.insightCard}
                isObservationBased={isObservationBased}
              />
            </Animated.View>
          ) : (
            <View style={styles.fallbackInsight}>
              <BodyText style={styles.fallbackText}>
                Belle journée à toi ! ✨
              </BodyText>
            </View>
          )}
        </View>

        {/* Vignettes prioritaires */}
        <View style={styles.vignettesSection}>
          <View style={styles.sectionHeader}>
            <Feather name="star" size={20} color={theme.colors.secondary} />
            <Heading style={styles.sectionTitle}>Tes priorités</Heading>
          </View>
          
          {vignettesLoading ? (
            <View style={styles.loadingVignettes}>
              <BodyText style={styles.loadingText}>Sélection en cours...</BodyText>
            </View>
          ) : (
            <VignettesContainer
              vignettes={vignettes || []}
              onVignettePress={handleVignettePress}
              maxVisible={3}
              showCategories={false}
            />
          )}
          
          {(vignettes?.length === 0 || !vignettes) && !vignettesLoading && (
            <BodyText style={styles.noVignettesText}>
              Tout est calme pour aujourd'hui 🌸
            </BodyText>
          )}
        </View>

        {/* 🆕 Section Intelligence TOUJOURS VISIBLE - MODIFIÉ BLOC 2 */}
        <View style={styles.intelligenceSection}>
          <View style={styles.intelligenceHeader}>
            <Text style={{ fontSize: 16, color: theme.colors.primary }}>🛠️</Text>
            <Caption style={styles.intelligenceTitle}>
              Melune apprend de toi
            </Caption>
          </View>
          
          <View style={styles.intelligenceStats}>
            {observations.length === 0 ? (
              // 🌟 État invitation - 0 observations
              <View style={styles.inviteContainer}>
                <BodyText style={styles.inviteText}>
                  Commence quand tu te sens prête 🌱
                </BodyText>
              </View>
            ) : observations.length < 3 ? (
              // 🌟 État débutant - 1-2 observations
              <View style={styles.statItem}>
                <BodyText style={styles.statValue}>{observations.length}</BodyText>
                <Caption style={styles.statLabel}>
                  {observations.length === 1 ? "premier ressenti" : "premiers ressentis"}
                </Caption>
              </View>
            ) : (
              // 🌟 État confirmé - 3+ observations
              <>
                <View style={styles.statItem}>
                  <BodyText style={styles.statValue}>{observations.length}</BodyText>
                  <Caption style={styles.statLabel}>observations</Caption>
                </View>
                
                {currentPhaseObservations.length > 0 && (
                  <View style={styles.statItem}>
                    <BodyText style={styles.statValue}>
                      {currentPhaseObservations.length}
                    </BodyText>
                    <Caption style={styles.statLabel}>cette phase</Caption>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Navigation rapide */}
        <View style={styles.quickNavSection}>
          <Heading style={styles.sectionTitle}>Explorer</Heading>
          
          <View style={styles.quickNavGrid}>
            <TouchableOpacity 
              style={styles.quickNavItem}
              onPress={() => handleQuickNav('cycle')}
            >
              <View style={[styles.quickNavIcon, { backgroundColor: theme.colors.phases[currentPhase] + '20' }]}>
                <Feather name="target" size={24} color={theme.colors.phases[currentPhase]} />
              </View>
              <BodyText style={styles.quickNavText}>Mon Cycle</BodyText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickNavItem}
              onPress={() => handleQuickNav('calendrier')}
            >
              <View style={[styles.quickNavIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Feather name="calendar" size={24} color={theme.colors.secondary} />
              </View>
              <BodyText style={styles.quickNavText}>Calendrier</BodyText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickNavItem}
              onPress={() => handleQuickNav('notebook')}
            >
              <View style={[styles.quickNavIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Feather name="book" size={24} color={theme.colors.primary} />
              </View>
              <BodyText style={styles.quickNavText}>Mon Carnet</BodyText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
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
    padding: theme.spacing.l,
  },
  
  // Setup state
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  setupText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  setupButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.l,
    borderRadius: theme.borderRadius.pill,
  },
  setupButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Cycle status
  cycleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.l,
  },
  cycleStatusText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  
  // 🆕 Badge observation
  observationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.secondary + '20',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    alignSelf: 'center',
  },
  observationBadgeText: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  
  // Sections
  insightSection: {
    marginBottom: theme.spacing.xl,
  },
  vignettesSection: {
    marginBottom: theme.spacing.xl,
  },
  quickNavSection: {
    marginBottom: theme.spacing.xl,
  },
  
  // Headers de section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  
  // Insight states
  loadingInsight: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
  },
  errorInsight: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
  },
  fallbackInsight: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.l,
  },
  loadingText: {
    color: theme.colors.textLight,
    fontSize: 14,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  fallbackText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.medium,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
  
  // Vignettes
  loadingVignettes: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  noVignettesText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: 14,
    fontStyle: 'italic',
    padding: theme.spacing.l,
  },
  
  // 🆕 Intelligence section MODIFIÉE BLOC 2
  intelligenceSection: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  intelligenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.s,
    justifyContent: 'center',
  },
  intelligenceTitle: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  intelligenceStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textLight,
  },
  // 🆕 NOUVEAUX STYLES BLOC 2
  inviteContainer: {
    alignItems: 'center',
    padding: theme.spacing.s,
  },
  inviteText: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  
  // Navigation rapide
  quickNavGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickNavItem: {
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  quickNavIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickNavText: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});