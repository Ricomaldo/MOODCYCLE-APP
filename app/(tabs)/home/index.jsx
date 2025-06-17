import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../../config/theme';
import MeluneAvatar from '../../../components/MeluneAvatar';
import { Heading1, BodyText } from '../../../components/Typography';
import InsightCard from '../../../components/InsightCard';
import DevNavigation from '../../../components/DevNavigation/DevNavigation';

// Stores Zustand
import { useAppStore } from '../../../stores/useAppStore';
import { useCycleStore } from '../../../stores/useCycleStore';
import { useOnboardingStore } from '../../../stores/useOnboardingStore';

// Import du nouveau moteur d'insights API
import { getPersonalizedInsight } from '../../../services/InsightsEngine';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Stores Zustand
  const { toggleDevMode } = useAppStore();
  const { getCurrentPhaseInfo, initializeFromOnboarding } = useCycleStore();
  const { 
    userInfo, 
    cycleData, 
    preferences, 
    melune, 
    persona,
    usedInsights, 
    markInsightAsUsed, 
    resetUsedInsights,
    calculateAndAssignPersona
  } = useOnboardingStore();
  
  // Récupération du prénom ou fallback si pas encore collecté
  const prenom = userInfo.prenom || 'toi';
  
  const phaseInfo = getCurrentPhaseInfo();
  const phase = phaseInfo.phase;
  
  // 🌟 NOUVEAU : State pour insight async
  const [currentInsight, setCurrentInsight] = useState("Chargement de ton insight personnalisé...");
  const [insightResult, setInsightResult] = useState({ id: null, source: 'loading' });
  
  // 🌟 NOUVEAU : Charger insight de façon async
  useEffect(() => {
    const loadInsight = async () => {
      try {
        const result = await getPersonalizedInsight(
          phase, 
          persona.assigned || 'emma',
          preferences,
          melune,
          usedInsights,
          useOnboardingStore.getState()
        );
        
        setCurrentInsight(result.content);
        setInsightResult(result);
        
        // Marquer comme vu
        if (result.id && !usedInsights.includes(result.id)) {
          markInsightAsUsed(result.id);
        }
      } catch (error) {
        console.error('Erreur chargement insight:', error);
        setCurrentInsight(`${prenom}, belle journée à toi ! ✨`);
      }
    };
    
    loadInsight();
  }, [phase, persona.assigned, preferences, melune]); // Recharger si ces données changent
  
  // 👈 DEBUG : Cycle et Persona
  console.log('Données du cycle:', cycleData);
  console.log('Date des dernières règles:', cycleData.lastPeriodDate);
  console.log('Persona assigné:', persona.assigned);
  console.log('Insight result:', {
    content: insightResult.content?.substring(0, 50) + '...',
    source: insightResult.source,
    persona: insightResult.persona,
    relevanceScore: insightResult.relevanceScore
  });
  
  // 👈 Initialisation du cycle
  useEffect(() => {
    // Si on a une date de règles dans l'onboarding, initialiser le cycle
    if (cycleData.lastPeriodDate) {
      initializeFromOnboarding(cycleData);
    }
  }, [cycleData.lastPeriodDate]); // Se déclenche quand la date change
  
  // 🎭 S'assurer que le persona est calculé
  useEffect(() => {
    // Si on a des données d'onboarding mais pas de persona assigné, le calculer
    if (userInfo.ageRange && preferences && melune && !persona.assigned) {
      console.log('📊 Calcul automatique du persona...');
      calculateAndAssignPersona();
    }
  }, [userInfo.ageRange, preferences, melune, persona.assigned]);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* DevNavigation pour le développement */}
      <DevNavigation />
      
      <View style={styles.header}>
        <Heading1>Bonjour {prenom}</Heading1>
        <BodyText>Jour {phaseInfo.day} • Phase {phaseInfo.name}</BodyText>
        
        {/* Bouton pour activer le mode dev (triple tap) */}
        <TouchableOpacity 
          onPress={toggleDevMode}
          style={styles.devActivator}
        >
          <BodyText style={styles.devText}>🛠️</BodyText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.avatarContainer}>
        <MeluneAvatar phase={phase} size="large" />
      </View>
      
      <InsightCard insight={currentInsight} phase={phase} />
      
      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => router.push('/chat')}
      >
        <BodyText style={styles.chatButtonText}>Discuter avec Melune</BodyText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },

  avatarContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  chatButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
    padding: theme.spacing.m,
    alignItems: 'center',
    marginTop: theme.spacing.l,
  },
  chatButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  devActivator: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  devText: {
    fontSize: 12,
    opacity: 0.3,
  },
}); 