import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading2, BodyText } from '../../components/Typography';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { theme } from '../../config/theme';
import MeluneAvatar from '../../components/MeluneAvatar';
import ChatBubble from '../../components/ChatBubble';


const PREFERENCES_CONFIG = [
  {
    key: 'symptoms',
    label: 'Symptômes physiques',
    description: 'Conseils sur douleurs, énergie, bien-être corporel',
    icon: '💪',
    color: '#E53E3E'
  },
  {
    key: 'moods',
    label: 'Humeurs',
    description: 'Compréhension émotionnelle et gestion des ressentis',
    icon: '💭',
    color: '#9F7AEA'
  },
  {
    key: 'phyto',
    label: 'Phyto/HE',
    description: 'Plantes, huiles essentielles, remèdes naturels',
    icon: '🌿',
    color: '#38A169'
  },
  {
    key: 'phases',
    label: 'Énergie des phases',
    description: 'Sagesse cyclique, rythmes féminins',
    icon: '🌙',
    color: '#3182CE'
  },
  {
    key: 'lithotherapy',
    label: 'Lithothérapie',
    description: 'Cristaux, pierres, énergies subtiles',
    icon: '💎',
    color: '#D53F8C'
  },
  {
    key: 'rituals',
    label: 'Rituels bien-être',
    description: 'Pratiques, méditation, soins personnels',
    icon: '🧘‍♀️',
    color: '#DD6B20'
  }
];

export default function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updatePreferences } = useOnboardingStore();
  
  // États des préférences (0-5 pour chaque dimension)
  const [preferences, setPreferences] = useState({
    symptoms: 3,
    moods: 3,
    phyto: 3,
    phases: 3,
    lithotherapy: 3,
    rituals: 3
  });
  
  const [step, setStep] = useState(1); // 1: intro, 2: ajustements, 3: validation
  const [lastChanged, setLastChanged] = useState(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setLastChanged(key);
    
    // Passer à l'étape ajustements si on était à l'intro
    if (step === 1) {
      setStep(2);
    }
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Sauvegarder et continuer
      updatePreferences(preferences);
      
      setTimeout(() => {
        router.push('/onboarding/550-prenom');
      }, 300);
    }
  };

  const getMeluneMessage = () => {
    if (step === 1) {
      return "Comment préfères-tu que je t'accompagne ? Ajuste chaque dimension selon tes besoins 💜";
    } else if (step === 2 && lastChanged) {
      const config = PREFERENCES_CONFIG.find(p => p.key === lastChanged);
      const value = preferences[lastChanged];
      
      if (value >= 4) {
        return `Parfait ! Tu aimes ${config.label.toLowerCase()}, je te donnerai plein de conseils dans ce domaine ✨`;
      } else if (value <= 1) {
        return `Très bien ! Je respecterai ton choix de limiter ${config.label.toLowerCase()} dans mes conseils 🤗`;
      } else {
        return `C'est noté ! Un équilibre parfait pour ${config.label.toLowerCase()} 👌`;
      }
    } else if (step === 3) {
      return `Magnifique ! Je connais maintenant tes préférences. Je vais personnaliser tous mes conseils selon ton profil unique 🌟`;
    }
    return "Ajuste les curseurs selon tes préférences !";
  };

  const getContinueText = () => {
    switch (step) {
      case 1:
        return "Commencer les ajustements";
      case 2:
        return "Voir le résumé";
      case 3:
        return "Configurer mon avatar";
      default:
        return "Continuer";
    }
  };

  const getIntensityLabel = (value) => {
    const labels = ['Pas du tout', 'Très peu', 'Un peu', 'Modérément', 'Beaucoup', 'Énormément'];
    return labels[value] || 'Modérément';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>


      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Avatar Melune */}
          <View style={styles.avatarContainer}>
            <MeluneAvatar phase="menstrual" size="medium" />
          </View>

          {/* Message de Melune */}
          <Animated.View 
            style={[
              styles.messageContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <ChatBubble 
              message={getMeluneMessage()} 
              isUser={false} 
            />
          </Animated.View>

          {/* Interface selon l'étape */}
          <Animated.View 
            style={[
              styles.interactionContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            
            {/* Étape 1 & 2: Sliders des préférences */}
            {(step === 1 || step === 2) && (
              <View style={styles.preferencesContainer}>
                {PREFERENCES_CONFIG.map((config) => (
                  <View key={config.key} style={styles.preferenceItem}>
                    <View style={styles.preferenceHeader}>
                      <View style={styles.preferenceLabelContainer}>
                        <BodyText style={styles.preferenceIcon}>{config.icon}</BodyText>
                        <View style={styles.preferenceTexts}>
                          <BodyText style={styles.preferenceLabel}>{config.label}</BodyText>
                          <BodyText style={styles.preferenceDescription}>{config.description}</BodyText>
                        </View>
                      </View>
                      <BodyText style={styles.preferenceValue}>
                        {getIntensityLabel(preferences[config.key])}
                      </BodyText>
                    </View>
                    
                    {/* Slider custom */}
                    <View style={styles.sliderContainer}>
                      <View style={styles.sliderButtons}>
                        <TouchableOpacity 
                          style={styles.sliderButton}
                          onPress={() => handlePreferenceChange(config.key, Math.max(0, preferences[config.key] - 1))}
                        >
                          <BodyText style={styles.sliderButtonText}>-</BodyText>
                        </TouchableOpacity>
                        
                        <View style={[styles.sliderTrack, { backgroundColor: config.color + '30' }]}>
                          <View style={[
                            styles.sliderIndicator,
                            { 
                              left: `${(preferences[config.key] / 5) * 100}%`,
                              backgroundColor: config.color
                            }
                          ]} />
                        </View>
                        
                        <TouchableOpacity 
                          style={styles.sliderButton}
                          onPress={() => handlePreferenceChange(config.key, Math.min(5, preferences[config.key] + 1))}
                        >
                          <BodyText style={styles.sliderButtonText}>+</BodyText>
                        </TouchableOpacity>
                      </View>
                      
                      {/* Points indicateurs */}
                      <View style={styles.sliderDots}>
                        {[0,1,2,3,4,5].map(i => (
                          <View 
                            key={i} 
                            style={[
                              styles.sliderDot, 
                              preferences[config.key] === i && { backgroundColor: config.color }
                            ]} 
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Étape 3: Résumé des préférences */}
            {step === 3 && (
              <View style={styles.summaryContainer}>
                <BodyText style={styles.summaryTitle}>Ton profil de préférences</BodyText>
                
                {PREFERENCES_CONFIG.map((config) => {
                  const value = preferences[config.key];
                  return (
                    <View key={config.key} style={styles.summaryItem}>
                      <View style={styles.summaryLeft}>
                        <BodyText style={styles.summaryIcon}>{config.icon}</BodyText>
                        <BodyText style={styles.summaryLabel}>{config.label}</BodyText>
                      </View>
                      <View style={styles.summaryRight}>
                        <BodyText style={[styles.summaryValue, { color: config.color }]}>
                          {getIntensityLabel(value)}
                        </BodyText>
                        <View style={styles.summaryBar}>
                          <View style={[
                            styles.summaryBarFill,
                            { 
                              width: `${(value / 5) * 100}%`,
                              backgroundColor: config.color
                            }
                          ]} />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

          </Animated.View>

          {/* Bouton de continuation */}
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <BodyText style={styles.continueButtonText}>
              {getContinueText()}
            </BodyText>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.l,
  },
  messageContainer: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  interactionContainer: {
    marginBottom: theme.spacing.xl,
  },
  
  // Styles des préférences
  preferencesContainer: {
    gap: theme.spacing.l,
  },
  preferenceItem: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.m,
  },
  preferenceLabelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  preferenceIcon: {
    fontSize: 20,
    marginRight: theme.spacing.s,
    marginTop: 2,
  },
  preferenceTexts: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  preferenceDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  preferenceValue: {
    fontSize: 13,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
    textAlign: 'right',
    minWidth: 80,
  },
  
  // Styles des sliders
  sliderContainer: {
    alignItems: 'center',
  },
  sliderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.s,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  sliderButtonText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: theme.spacing.m,
    position: 'relative',
  },
  sliderIndicator: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  sliderDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: theme.spacing.xs,
  },
  sliderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.textLight + '40',
  },
  
  // Styles du résumé
  summaryContainer: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    fontSize: 16,
    marginRight: theme.spacing.s,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  summaryRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: theme.fonts.bodyBold,
    marginBottom: theme.spacing.xs,
  },
  summaryBar: {
    width: 60,
    height: 4,
    backgroundColor: theme.colors.textLight + '30',
    borderRadius: 2,
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  
  // Bouton de continuation
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: theme.spacing.l,
  },
  continueButtonText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    textAlign: 'center',
  },
});