//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/accueil/AccueilView.jsx - INSIGHT DU JOUR CENTRAL
// 🧩 Type: Écran Principal Accueil
// 📚 Description: Page d'accueil avec insight quotidien personnalisé + vignettes prioritaires
// 🕒 Version: 1.0 - 2025-06-27 - CRÉATION NOUVELLE ARCHITECTURE
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/hooks/useTheme';
import { Heading, BodyText, Caption } from '../../../src/core/ui/Typography';
import ScreenContainer from '../../../src/core/layout/ScreenContainer';
import InsightCard from '../../../src/features/shared/InsightCard';
import { VignettesContainer } from '../../../src/features/shared/VignetteCard';
import { useCycle } from '../../../src/hooks/useCycle';
import { useVignettes } from '../../../src/hooks/useVignettes';
import { usePersonalizedInsight } from '../../../src/hooks/usePersonalizedInsight';
import { usePersona } from '../../../src/hooks/usePersona';
import { useUserStore } from '../../../src/stores/useUserStore';
import { PhaseIcon } from '../../../src/config/iconConstants';
import MeluneAvatar from '../../../src/features/shared/MeluneAvatar';
import ParametresButton from '../../../src/features/shared/ParametresButton';

export default function AccueilView() {
  const cycleData = useCycle() || {};
  const { currentPhase, currentDay, phaseInfo, hasData, cycle } = cycleData;
  const { current: persona } = usePersona();
  const { profile } = useUserStore();
  const { theme } = useTheme();

  // ✅ Protection contre profile undefined pendant l'hydratation
  const safeProfile = profile || { prenom: null };
  
  // ✅ INSIGHT DU JOUR PERSONNALISÉ
  const {
    insight,
    loading: insightLoading,
    error: insightError,
    refresh: refreshInsight
  } = usePersonalizedInsight();
  
  // ✅ ANIMATION RÉVÉLATION INSIGHT
  const insightRevealAnim = React.useRef(new Animated.Value(0)).current;
  const insightScaleAnim = React.useRef(new Animated.Value(0.95)).current;
  
  // ✅ VIGNETTES PRIORITAIRES (MAX 3)
  const {
    vignettes,
    loading: vignettesLoading, 
    error: vignettesError,
    refresh: refreshVignettes,
    trackEngagement,
    maxDisplayed
  } = useVignettes();
  
  const [refreshing, setRefreshing] = React.useState(false);

  // ✅ EFFET RÉVÉLATION QUAND INSIGHT ARRIVE
  React.useEffect(() => {
    if (insight && !insightLoading) {
      // Haptic feedback iOS
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Animation révélation douce
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
      // Reset animation pour nouveau loading
      insightRevealAnim.setValue(0);
      insightScaleAnim.setValue(0.95);
    }
  }, [insight, insightLoading]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshInsight(), refreshVignettes()]);
    setRefreshing(false);
  }, [refreshInsight, refreshVignettes]);

  // ✅ HANDLER VIGNETTE PRESS
  const handleVignettePress = (vignette) => {
    trackEngagement(vignette);
    // Navigation automatique gérée par VignetteCard
  };

  const styles = getStyles(theme);
  if (!hasData) {
    return (
      <ScreenContainer style={styles.container} hasTabs={true}>
        <View style={styles.setupContainer}>
          <MeluneAvatar size={120} style={styles.setupAvatar} />
          <Heading style={styles.setupTitle}>Bienvenue !</Heading>
          <BodyText style={styles.setupText}>
            Configure ton cycle pour découvrir tes insights personnalisés
          </BodyText>
          <TouchableOpacity style={styles.setupButton}>
            <BodyText style={styles.setupButtonText}>Commencer</BodyText>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container} hasTabs={true}>
      
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
        {/* ✅ HEADER AVEC AVATAR MELUNE */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Bouton paramètres à gauche */}
            <ParametresButton 
              color={theme.colors.primary}
              style={styles.parametresButton}
            />
            
            {/* Avatar Melune centré */}
            <MeluneAvatar size={60} style={styles.headerAvatar} />
            
            {/* Espace vide pour équilibrer */}
            <View style={styles.headerSpacer} />
          </View>
          
          {/* Salutation personnalisée */}
          <Heading style={styles.greeting}>
            {safeProfile.prenom ? `Bonjour ${safeProfile.prenom} !` : 'Bonjour !'}
          </Heading>
          
          {/* Mini status cycle */}
          <View style={styles.cycleStatus}>
            <PhaseIcon 
              phaseKey={currentPhase}
              size={16}
              color={theme.colors.phases[currentPhase]}
            />
            <Caption style={styles.cycleStatusText}>
              Jour {currentDay} • {phaseInfo.name}
            </Caption>
          </View>
        </View>

        {/* ✅ INSIGHT DU JOUR - ZONE CENTRALE */}
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
  // Protection : si pas de données cycle minimum
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

        {/* ✅ VIGNETTES PRIORITAIRES */}
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
              maxVisible={3} // Max 3 pour Accueil
              showCategories={false}
            />
          )}
          
          {(vignettes?.length === 0 || !vignettes) && !vignettesLoading && (
            <BodyText style={styles.noVignettesText}>
              Tout est calme pour aujourd'hui 🌸
            </BodyText>
          )}
        </View>

        {/* ✅ NAVIGATION RAPIDE VERS AUTRES ONGLETS */}
        <View style={styles.quickNavSection}>
          <Heading style={styles.sectionTitle}>Explorer</Heading>
          
          <View style={styles.quickNavGrid}>
            <TouchableOpacity style={styles.quickNavItem}>
              <View style={[styles.quickNavIcon, { backgroundColor: theme.colors.phases[currentPhase] + '20' }]}>
                <Feather name="target" size={24} color={theme.colors.phases[currentPhase]} />
              </View>
              <BodyText style={styles.quickNavText}>Mon Cycle</BodyText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickNavItem}>
              <View style={[styles.quickNavIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Feather name="message-circle" size={24} color={theme.colors.primary} />
              </View>
              <BodyText style={styles.quickNavText}>Chat Melune</BodyText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickNavItem}>
              <View style={[styles.quickNavIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Feather name="book" size={24} color={theme.colors.secondary} />
              </View>
              <BodyText style={styles.quickNavText}>Mon Carnet</BodyText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Espacement bottom pour tab bar */}
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
  
  // ✅ SETUP STATE (pas de données cycle)
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  setupAvatar: {
    marginBottom: theme.spacing.xl,
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
  
  // ✅ HEADER AVEC MELUNE
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.l,
  },
  parametresButton: {
    // Styles spécifiques pour le bouton paramètres
  },
  headerAvatar: {
    // Avatar Melune centré
  },
  headerSpacer: {
    width: 40, // Même largeur que le bouton paramètres pour équilibrer
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  cycleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  cycleStatusText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  
  // ✅ SECTIONS
  insightSection: {
    marginBottom: theme.spacing.xl,
  },
  vignettesSection: {
    marginBottom: theme.spacing.xl,
  },
  quickNavSection: {
    marginBottom: theme.spacing.xl,
  },
  
  // ✅ HEADERS DE SECTION
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
  
  // ✅ INSIGHT STATES
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
  insightCard: {
    // Styles supplémentaires si nécessaire
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
  
  // ✅ VIGNETTES
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
  
  // ✅ NAVIGATION RAPIDE
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