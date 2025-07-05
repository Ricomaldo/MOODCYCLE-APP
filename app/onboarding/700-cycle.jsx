//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/700-cycle.jsx
// 🎯 Status: ✅ REFACTORISÉ v3.0 - Conversationnel
// 📝 Description: Configuration cycle avec empathie
// 🔄 Version: 3.0 - 258 lignes
// ─────────────────────────────────────────────────────────
//
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BodyText, Caption } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { getOnboardingMessage } from '../../src/config/onboardingMessages';
import { CycleDateSelector } from '../../src/features/onboarding/cycle/CycleDateSelector';
import { CycleDurationWheel } from '../../src/features/onboarding/cycle/CycleDurationWheel';
import OnboardingButton from '../../src/features/onboarding/shared/OnboardingButton';
import { 
  AnimatedRevealMessage,
  AnimatedCascadeCard,
  ANIMATION_DURATIONS,
  ANIMATION_PRESETS
} from '../../src/core/ui/animations';

// Composant principal
export default function CycleScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { updateCycle } = useCycleStore();
  const intelligence = useOnboardingIntelligence('700-cycle');
  
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [cycleLength, setCycleLength] = useState(28);
  
  const handleContinue = () => {
    updateCycle({
      lastPeriodDate: lastPeriodDate.toISOString(),
      length: cycleLength,
      periodDuration: 5
    });
    
    intelligence.trackAction('cycle_configured', {
      cycleLength,
      lastPeriodDate: lastPeriodDate.toISOString()
    });
    
    router.push('/onboarding/800-preferences');
  };
  
  const getConversationalMessage = () => {
    return getOnboardingMessage('700-cycle', intelligence.currentPersona, 'conversational') || 
      "Raconte-moi où tu en es dans ton cycle, on va faire ça ensemble 💕";
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Message conversationnel */}
        <View style={styles.messageSection}>
          <AnimatedRevealMessage 
            delay={ANIMATION_DURATIONS.initialMessage}
            style={styles.messageContainer}
          >
            <BodyText style={styles.conversationalMessage}>
              {getConversationalMessage()}
            </BodyText>
          </AnimatedRevealMessage>
        </View>
        
        {/* Contenu principal - ScrollView avec flex pour prendre l'espace disponible */}
        <View style={styles.mainSection}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Carte unifiée conversationnelle */}
            <AnimatedCascadeCard
              delay={ANIMATION_DURATIONS.initialMessage + 800}
              style={styles.unifiedCard}
            >
              {/* Question date avec empathie */}
              <View style={styles.section}>
                <Text style={styles.gentleQuestion}>
                  {getOnboardingMessage('700-cycle-questions', intelligence.currentPersona, 'date') || "Tes dernières règles, c'était... 🌸"}
                </Text>
                <CycleDateSelector
                  value={lastPeriodDate}
                  onChange={setLastPeriodDate}
                  persona={intelligence.currentPersona}
                  theme={theme}
                />
              </View>
              
              <View style={styles.softDivider} />
              
              {/* Question durée avec bienveillance */}
              <View style={styles.section}>
                <Text style={styles.gentleQuestion}>
                  {getOnboardingMessage('700-cycle-questions', intelligence.currentPersona, 'duration') || "Et d'habitude, ton cycle dure... 🌙"}
                </Text>
                <CycleDurationWheel
                  value={cycleLength}
                  onChange={setCycleLength}
                  persona={intelligence.currentPersona}
                  theme={theme}
                />
              </View>
              
              {/* Validation douce */}
              <AnimatedRevealMessage 
                delay={ANIMATION_DURATIONS.initialMessage + 1200}
                style={styles.validationSection}
              >
                <Caption style={styles.validation}>
                  Parfait, j'ai tout ce qu'il me faut pour t'accompagner ✨
                </Caption>
              </AnimatedRevealMessage>
            </AnimatedCascadeCard>
          </ScrollView>
        </View>
        
        {/* Bouton continuer - Fixe en bas */}
        <OnboardingButton
          title="Continuer"
          onPress={handleContinue}
          delay={ANIMATION_DURATIONS.initialMessage + 1400}
          variant="primary"
          style={styles.buttonContainer}
        />
      </View>
    </SafeAreaView>
  );
}

// Styles simplifiés et cohérents
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xxl,
  },
  
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  messageContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  
  conversationalMessage: {
    fontSize: 20,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 28,
    fontFamily: 'Quintessential',
    maxWidth: 320,
  },
  
  mainSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  
  scrollContent: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  
  unifiedCard: {
    backgroundColor: theme.colors.surface + '95',
    borderRadius: 28,
    padding: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border + '30',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  
  section: {
    marginBottom: theme.spacing.s,
  },
  
  gentleQuestion: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Quicksand_500Medium',
  },
  
  softDivider: {
    height: 1,
    backgroundColor: theme.colors.border + '20',
    marginVertical: theme.spacing.m,
    marginHorizontal: -theme.spacing.m,
  },
  
  validationSection: {
    marginTop: theme.spacing.l,
    alignItems: 'center',
  },
  
  validation: {
    color: theme.colors.success,
    fontSize: 14,
    textAlign: 'center',
  },
  
  scrollView: {
    flex: 1,
  },
  
  buttonContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
});