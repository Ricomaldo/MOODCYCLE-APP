//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/600-avatar.jsx
// 🧩 Type: Onboarding Screen
// 📚 Description: Sélection PERSONA THÉRAPEUTIQUE (pas avatar esthétique)
// 🕒 Version: 2.0 - Intelligence Thérapeutique
// 🧭 Used in: Onboarding flow - Étape 3/4 "Ton style"
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { BodyText } from '../../src/core';
import { useTheme } from '../../src/hooks/useTheme';
import { PERSONA_PROFILES } from '../../src/config/personaProfiles';

// 🎯 TRANSFORMATION : Personas thérapeutiques, pas avatars visuels
const THERAPEUTIC_PERSONAS = [
  {
    id: 'emma',
    name: 'Emma',
    title: 'Exploration Bienveillante',
    description: 'Accompagnement doux pour découvrir ton cycle',
    approach: 'Je t\'accompagne avec curiosité et bienveillance dans cette exploration',
    preview: "Hey ! Comment honorer ton besoin de repos aujourd'hui ? 🌙",
    color: '#FF6B8A',
    icon: '🌸'
  },
  {
    id: 'laure',
    name: 'Laure',
    title: 'Optimisation Performance',
    description: 'Structure et efficacité pour maîtriser ton cycle',
    approach: 'J\'optimise ton quotidien selon tes phases pour plus de performance',
    preview: "Analysons : Comment structurer tes objectifs pour cette phase ?",
    color: '#3B82F6',
    icon: '📊'
  },
  {
    id: 'clara',
    name: 'Clara',
    title: 'Transformation Énergique',
    description: 'Libération dynamique de ton potentiel cyclique',
    approach: 'Je révèle ta puissance cyclique avec enthousiasme et énergie',
    preview: "Ready ? Comment exploiter au MAX cette phase de puissance ? 🚀",
    color: '#F59E0B',
    icon: '✨'
  },
  {
    id: 'sylvie',
    name: 'Sylvie',
    title: 'Sagesse Maternelle',
    description: 'Guidance douce et expérimentée',
    approach: 'Je t\'entoure d\'une présence maternelle et sage',
    preview: "En douceur, écoutons ce que ton corps te murmure...",
    color: '#10B981',
    icon: '🌿'
  },
  {
    id: 'christine',
    name: 'Christine',
    title: 'Maturité Sereine',
    description: 'Sagesse profonde pour honorer tes transitions',
    approach: 'J\'honore ta sagesse et guide tes transitions avec sérénité',
    preview: "Avec sagesse, explorons cette phase de transformation...",
    color: '#8B5CF6',
    icon: '🌙'
  }
];

export default function AvatarScreen() {
  // 🧠 INTELLIGENCE HOOK
  const intelligence = useOnboardingIntelligence('600-avatar');
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // 🎨 Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const personasAnim = useRef(new Animated.Value(0)).current;
  
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [previewMessage, setPreviewMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: intro, 2: sélection, 3: confirmation

  // Suggestion basée sur profil
  const suggestedPersona = intelligence.userProfile.suggestedPersona || 'emma';
  const suggestedConfidence = intelligence.userProfile.personaConfidence || 0.8;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(400),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(300),
      Animated.timing(personasAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePersonaSelect = (persona) => {
    setSelectedPersona(persona.id);
    setPreviewMessage(persona.preview);
    
    // 🧠 Track choix conscient vs suggestion
    const isFollowingSuggestion = persona.id === suggestedPersona;
    
    intelligence.trackAction('persona_selected', {
      persona: persona.id,
      wassuggested: suggestedPersona,
      followedSuggestion: isFollowingSuggestion,
      confidence: isFollowingSuggestion ? suggestedConfidence : 0.5
    });
    
    // Message adaptatif
    if (isFollowingSuggestion) {
      setPreviewMessage(`Parfait ! ${persona.name} correspond exactement à ton profil.`);
    } else {
      setPreviewMessage(`Intéressant ! Tu as choisi ${persona.name}. C'est ton intuition qui guide.`);
    }
  };

  const handleConfirm = () => {
    if (!selectedPersona) return;
    
    // 🧠 Finalisation persona avec confidence
    const finalConfidence = selectedPersona === suggestedPersona ? 
      suggestedConfidence : 0.7; // Moins de confidence si différent de suggestion
    
    intelligence.setPersona(selectedPersona, finalConfidence);
    
    // 🧠 Configuration relation thérapeutique
    intelligence.updateProfile({
      assignedPersona: selectedPersona,
      personaConfidence: finalConfidence,
      therapeuticRelationship: 'active',
      personaSelectionMethod: 'conscious_choice'
    });
    
    intelligence.trackAction('persona_confirmed', {
      finalPersona: selectedPersona,
      confidence: finalConfidence,
      method: 'conscious_onboarding'
    });
    
    // Navigation
    setTimeout(() => {
      router.push('/onboarding/700-paywall');
    }, 500);
  };

  const renderPersonaCard = (persona) => {
    const isSelected = selectedPersona === persona.id;
    const isSuggested = persona.id === suggestedPersona;
    
    return (
      <TouchableOpacity
        key={persona.id}
        style={[
          styles.personaCard,
          isSelected && styles.personaCardSelected,
          isSuggested && styles.personaCardSuggested
        ]}
        onPress={() => handlePersonaSelect(persona)}
        activeOpacity={0.8}
      >
        {/* Badge suggestion */}
        {isSuggested && (
          <View style={styles.suggestionBadge}>
            <BodyText style={styles.suggestionText}>
              Recommandé pour toi ({Math.round(suggestedConfidence * 100)}%)
            </BodyText>
          </View>
        )}
        
        <View style={styles.personaHeader}>
          <View style={[styles.personaIcon, { backgroundColor: persona.color + '20' }]}>
            <BodyText style={styles.iconText}>{persona.icon}</BodyText>
          </View>
          <View style={styles.personaInfo}>
            <BodyText style={styles.personaName}>{persona.name}</BodyText>
            <BodyText style={styles.personaTitle}>{persona.title}</BodyText>
          </View>
        </View>
        
        <BodyText style={styles.personaDescription}>
          {persona.description}
        </BodyText>
        
        <View style={styles.personaApproach}>
          <BodyText style={styles.approachLabel}>Son approche :</BodyText>
          <BodyText style={styles.approachText}>"{persona.approach}"</BodyText>
        </View>
        
        {isSelected && (
          <View style={styles.previewContainer}>
            <BodyText style={styles.previewLabel}>Exemple de message :</BodyText>
            <View style={styles.previewBubble}>
              <BodyText style={styles.previewText}>{persona.preview}</BodyText>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="600-avatar" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* TopSection */}
          <View style={styles.topSection}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <MeluneAvatar 
                phase="ovulatory" 
                size="medium" 
                style="classic"
                animated={true}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.messageContainer,
                {
                  transform: [{ translateY: slideAnim }],
                  opacity: slideAnim.interpolate({
                    inputRange: [-20, 0],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            >
              <BodyText style={styles.meluneMessage}>
                {intelligence.meluneMessage}
              </BodyText>
            </Animated.View>
          </View>

          {/* MainSection */}
          <View style={styles.mainSection}>
            <Animated.View style={{ opacity: personasAnim }}>
              <BodyText style={styles.question}>
                Qui sera ton accompagnatrice ?
              </BodyText>
              
              <BodyText style={styles.subtext}>
                Chaque approche est unique, choisis celle qui te parle
              </BodyText>
            </Animated.View>

            {/* Personas List */}
            <Animated.View
              style={[
                styles.personasContainer,
                {
                  opacity: personasAnim,
                  transform: [{
                    translateY: personasAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    })
                  }]
                }
              ]}
            >
              {THERAPEUTIC_PERSONAS.map(renderPersonaCard)}
            </Animated.View>
            
            {/* Confirm Button */}
            {selectedPersona && (
              <Animated.View style={styles.confirmContainer}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                  activeOpacity={0.7}
                >
                  <BodyText style={styles.confirmText}>
                    Confirmer {THERAPEUTIC_PERSONAS.find(p => p.id === selectedPersona)?.name}
                  </BodyText>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
          
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  
  topSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.l,
    marginBottom: theme.spacing.l,
  },
  
  messageContainer: {
    marginTop: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
  },
  
  meluneMessage: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  
  mainSection: {
    flex: 1,
  },
  
  question: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
    fontWeight: '600',
  },
  
  subtext: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  
  personasContainer: {
    gap: theme.spacing.l,
  },
  
  personaCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  
  personaCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  
  personaCardSuggested: {
    borderColor: theme.colors.secondary,
  },
  
  suggestionBadge: {
    position: 'absolute',
    top: -10,
    right: theme.spacing.m,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  
  suggestionText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
  },
  
  personaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  personaIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  
  iconText: {
    fontSize: 24,
  },
  
  personaInfo: {
    flex: 1,
  },
  
  personaName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  
  personaTitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  
  personaDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.m,
  },
  
  personaApproach: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
  },
  
  approachLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  
  approachText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  
  previewContainer: {
    marginTop: theme.spacing.m,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  previewLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.s,
  },
  
  previewBubble: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
  },
  
  previewText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  
  confirmContainer: {
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  
  confirmButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  confirmText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
  },
});