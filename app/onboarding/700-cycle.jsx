//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/700-cycle.jsx
// 🎯 Status: ✅ REFACTORISÉ v3.0 - Conversationnel
// 📝 Description: Configuration cycle avec empathie
// 🔄 Version: 3.0 - 258 lignes
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '../../src/core/layout/OnboardingScreen';
import { BodyText, Caption } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useOnboardingIntelligence } from '../../src/hooks/useOnboardingIntelligence';
import { getOnboardingMessage } from '../../src/config/onboardingMessages';
import { CycleDateSelector } from '../../src/features/onboarding/cycle/CycleDateSelector';
import { CycleDurationWheel } from '../../src/features/onboarding/cycle/CycleDurationWheel';
import { 
  AnimatedOnboardingScreen,
  AnimatedRevealMessage,
  StandardOnboardingButton
} from '../../src/core/ui/animations';

// Composant principal
export default function CycleScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { updateCycle } = useCycleStore();
  const intelligence = useOnboardingIntelligence('700-cycle');
  
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [cycleLength, setCycleLength] = useState(28);
  const [isReady, setIsReady] = useState(false);
  
  // Une seule animation pour toute l'expérience
  const unifiedAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(unifiedAnim, {
      toValue: 1,
      delay: 600,
      tension: 80,
      friction: 8,
      useNativeDriver: true
    }).start(() => setIsReady(true));
  }, []);
  
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
    <OnboardingScreen currentScreen="700-cycle">
      <AnimatedOnboardingScreen>
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Message conversationnel */}
          <AnimatedRevealMessage delay={300}>
            <View style={styles.messageSection}>
              <BodyText style={styles.conversationalMessage}>
                {getConversationalMessage()}
              </BodyText>
            </View>
          </AnimatedRevealMessage>
          
          {/* Carte unifiée conversationnelle */}
          <Animated.View style={[
            styles.unifiedCard,
            {
              opacity: unifiedAnim,
              transform: [{
                scale: unifiedAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1]
                })
              }]
            }
          ]}>
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
            {isReady && (
              <AnimatedRevealMessage delay={800}>
                <View style={styles.validationSection}>
                  <Caption style={styles.validation}>
                    Parfait, j'ai tout ce qu'il me faut pour t'accompagner ✨
                  </Caption>
                </View>
              </AnimatedRevealMessage>
            )}
          </Animated.View>
        </ScrollView>
        
        {/* Bouton continuer */}
        <View style={styles.bottomSection}>
          <StandardOnboardingButton
            title="Continuer"
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </AnimatedOnboardingScreen>
    </OnboardingScreen>
  );
}

// Styles simplifiés et cohérents
const getStyles = (theme) => StyleSheet.create({
  container: { flexGrow: 1, paddingTop: theme.spacing.m, paddingBottom: 100 },
  messageSection: { paddingHorizontal: theme.spacing.xl, marginBottom: theme.spacing.l, alignItems: 'center' },
  conversationalMessage: {
    fontSize: 20, textAlign: 'center', color: theme.colors.text,
    lineHeight: 28, fontFamily: 'Quintessential_400Regular', maxWidth: 320
  },
  unifiedCard: {
    backgroundColor: theme.colors.surface + '95',
    marginHorizontal: theme.spacing.l, borderRadius: 28,
    padding: theme.spacing.l, borderWidth: 1,
    borderColor: theme.colors.border + '30',
    ...Platform.select({
      ios: { shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 }
    })
  },
  section: { marginBottom: theme.spacing.s },
  gentleQuestion: {
    fontSize: 16, color: theme.colors.text, marginBottom: theme.spacing.m,
    textAlign: 'center', fontWeight: '500', fontFamily: 'Quicksand_500Medium'
  },
  softDivider: {
    height: 1, backgroundColor: theme.colors.border + '20',
    marginVertical: theme.spacing.m, marginHorizontal: -theme.spacing.m
  },
  validationSection: { marginTop: theme.spacing.l, alignItems: 'center' },
  validation: { color: theme.colors.success, fontSize: 14, textAlign: 'center' },
  bottomSection: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.m, backgroundColor: theme.colors.background + 'F0'
  }
});