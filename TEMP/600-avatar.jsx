import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading2, BodyText } from '../../components/Typography';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { theme } from '../../config/theme';
import MeluneAvatar from '../../components/MeluneAvatar';
import ChatBubble from '../../components/ChatBubble';


const AVATAR_STYLES = [
  {
    key: 'classic',
    label: 'Classique',
    description: 'Bienveillante et douce',
    icon: '🤗',
    color: '#E53E3E'
  },
  {
    key: 'modern',
    label: 'Moderne',
    description: 'Énergique et directe',
    icon: '⚡',
    color: '#3182CE'
  },
  {
    key: 'mystique',
    label: 'Mystique',
    description: 'Sage et spirituelle',
    icon: '🔮',
    color: '#9F7AEA'
  }
];

const COMMUNICATION_TONES = [
  {
    key: 'friendly',
    label: 'Amicale',
    description: 'Comme une sœur',
    icon: '💕',
    example: "Hey ma belle ! Tu es incroyable et je suis là pour toi 🌸"
  },
  {
    key: 'professional',
    label: 'Professionnelle',
    description: 'Conseillère experte',
    icon: '🎓',
    example: "Selon tes données, je recommande cette approche pour optimiser ton bien-être."
  },
  {
    key: 'inspiring',
    label: 'Inspirante',
    description: 'Guide motivante',
    icon: '✨',
    example: "Tu es une déesse cyclique ! Embrasse ta puissance naturelle et rayonne ✨"
  }
];

export default function AvatarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preferences, updateMelune, calculateMelunePersonality } = useOnboardingStore();
  
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);
  const [step, setStep] = useState(1); // 1: avatar sélection, 2: avatar confirmation, 3: ton sélection, 4: ton confirmation, 5: aperçu final
  
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

  const handleAvatarStyleSelect = (style) => {
    setSelectedAvatarStyle(style);
    if (step === 1) {
      setStep(2); // Passer à la confirmation avatar
    }
  };

  const handleToneSelect = (tone) => {
    setSelectedTone(tone);
    if (step === 3) {
      setStep(4); // Passer à la confirmation ton
    }
  };

  const handleContinue = () => {
    if (step === 2) {
      // Confirmer le choix d'avatar et passer au ton
      setStep(3);
    } else if (step === 4) {
      // Confirmer le choix de ton et passer à l'aperçu
      setStep(5);
    } else if (step === 5) {
      // Sauvegarder et continuer
      updateMelune({
        avatarStyle: selectedAvatarStyle,
        communicationTone: selectedTone
      });
      
      setTimeout(() => {
        router.push('/onboarding/700-paywall');
      }, 300);
    }
  };

  const getMeluneMessage = () => {
    switch (step) {
      case 1:
        return "Sous quelle forme veux-tu me voir ? Choisis le style qui résonne le plus avec toi 💜";
      case 2:
        if (selectedAvatarStyle) {
          const styleData = AVATAR_STYLES.find(s => s.key === selectedAvatarStyle);
          return `Parfait ! Le style ${styleData.label.toLowerCase()} te correspond bien. ${styleData.description} ✨`;
        }
        return "Comment te sens-tu avec ce style d'avatar ?";
      case 3:
        return "Maintenant, comment préfères-tu que je communique avec toi ?";
      case 4:
        if (selectedTone) {
          const toneData = COMMUNICATION_TONES.find(t => t.key === selectedTone);
          return `Excellente ! Une communication ${toneData.label.toLowerCase()}, ${toneData.description.toLowerCase()}. C'est noté ! 💜`;
        }
        return "Comment te sens-tu avec ce ton de communication ?";
      case 5:
        return getPreviewMessage();
      default:
        return "Personnalisons notre relation !";
    }
  };

  const getPreviewMessage = () => {
    const tone = COMMUNICATION_TONES.find(t => t.key === selectedTone);
    return tone ? tone.example : "Voici comment je te parlerai !";
  };

  const getContinueText = () => {
    switch (step) {
      case 1:
        return selectedAvatarStyle ? "Confirmer ce style" : "Choisir un style";
      case 2:
        return "Choisir mon ton de communication";
      case 3:
        return selectedTone ? "Confirmer ce ton" : "Choisir un ton";
      case 4:
        return "Voir l'aperçu final";
      case 5:
        return "C'est parfait !";
      default:
        return "Continuer";
    }
  };

  const canContinue = () => {
    if (step === 1 || step === 2) {
      return selectedAvatarStyle !== null;
    } else if (step === 3 || step === 4) {
      return selectedTone !== null;
    } else if (step === 5) {
      return selectedAvatarStyle !== null && selectedTone !== null;
    }
    return false;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>


      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Avatar Melune avec style sélectionné */}
          <View style={styles.avatarContainer}>
            <MeluneAvatar 
              phase="ovulatory" 
              size="large" 
              style={selectedAvatarStyle || 'classic'}
            />
            {selectedAvatarStyle && step >= 2 && (
              <View style={styles.avatarBadge}>
                <BodyText style={styles.avatarBadgeText}>
                  {AVATAR_STYLES.find(s => s.key === selectedAvatarStyle)?.label}
                </BodyText>
              </View>
            )}
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
            
            {/* Étape 1: Choix du style d'avatar */}
            {step === 1 && (
              <View style={styles.optionsContainer}>
                <BodyText style={styles.helpText}>
                  Observe l'avatar ci-dessus changer selon ton choix
                </BodyText>
                {AVATAR_STYLES.map((style) => (
                  <TouchableOpacity
                    key={style.key}
                    style={[
                      styles.optionCard,
                      selectedAvatarStyle === style.key && styles.optionCardSelected,
                      { borderColor: style.color + '40' }
                    ]}
                    onPress={() => handleAvatarStyleSelect(style.key)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionHeader}>
                      <BodyText style={[styles.optionIcon, { color: style.color }]}>
                        {style.icon}
                      </BodyText>
                      <BodyText style={[styles.optionLabel, { color: style.color }]}>
                        {style.label}
                      </BodyText>
                    </View>
                    <BodyText style={styles.optionDescription}>
                      {style.description}
                    </BodyText>
                    {selectedAvatarStyle === style.key && (
                      <View style={styles.selectedIndicator}>
                        <BodyText style={styles.selectedIcon}>✓</BodyText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Étape 2: Confirmation du style d'avatar */}
            {step === 2 && selectedAvatarStyle && (
              <View style={styles.summaryContainer}>
                <BodyText style={styles.summaryTitle}>Tu as choisi</BodyText>
                {(() => {
                  const styleData = AVATAR_STYLES.find(s => s.key === selectedAvatarStyle);
                  return (
                    <View style={styles.summaryItem}>
                      <BodyText style={[styles.summaryIcon, { color: styleData.color }]}>
                        {styleData.icon}
                      </BodyText>
                      <View style={styles.summaryTexts}>
                        <BodyText style={styles.summaryLabel}>Style d'avatar:</BodyText>
                        <BodyText style={[styles.summaryValue, { color: styleData.color }]}>
                          {styleData.label}
                        </BodyText>
                        <BodyText style={styles.summaryDescription}>
                          {styleData.description}
                        </BodyText>
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}

            {/* Étape 3: Choix du ton de communication */}
            {step === 3 && (
              <View style={styles.optionsContainer}>
                {COMMUNICATION_TONES.map((tone) => (
                  <TouchableOpacity
                    key={tone.key}
                    style={[
                      styles.optionCard,
                      selectedTone === tone.key && styles.optionCardSelected
                    ]}
                    onPress={() => handleToneSelect(tone.key)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionHeader}>
                      <BodyText style={styles.optionIcon}>
                        {tone.icon}
                      </BodyText>
                      <BodyText style={styles.optionLabel}>
                        {tone.label}
                      </BodyText>
                    </View>
                    <BodyText style={styles.optionDescription}>
                      {tone.description}
                    </BodyText>
                    {selectedTone === tone.key && (
                      <View style={styles.selectedIndicator}>
                        <BodyText style={styles.selectedIcon}>✓</BodyText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Étape 4: Confirmation du ton */}
            {step === 4 && selectedTone && (
              <View style={styles.summaryContainer}>
                <BodyText style={styles.summaryTitle}>Tu as choisi</BodyText>
                {(() => {
                  const toneData = COMMUNICATION_TONES.find(t => t.key === selectedTone);
                  return (
                    <View style={styles.summaryItem}>
                      <BodyText style={styles.summaryIcon}>
                        {toneData.icon}
                      </BodyText>
                      <View style={styles.summaryTexts}>
                        <BodyText style={styles.summaryLabel}>Ton de communication:</BodyText>
                        <BodyText style={styles.summaryValue}>
                          {toneData.label}
                        </BodyText>
                        <BodyText style={styles.summaryDescription}>
                          {toneData.description}
                        </BodyText>
                      </View>
                    </View>
                  );
                })()}
                
                <View style={styles.exampleContainer}>
                  <BodyText style={styles.exampleLabel}>Exemple de message:</BodyText>
                  <View style={styles.exampleBubble}>
                    <BodyText style={styles.exampleText}>
                      {COMMUNICATION_TONES.find(t => t.key === selectedTone)?.example}
                    </BodyText>
                  </View>
                </View>
              </View>
            )}

            {/* Étape 5: Aperçu final */}
            {step === 5 && (
              <View style={styles.previewContainer}>
                <BodyText style={styles.previewTitle}>Aperçu de notre relation</BodyText>
                
                <View style={styles.previewItem}>
                  <BodyText style={styles.previewLabel}>Style d'avatar:</BodyText>
                  <View style={styles.previewValue}>
                    <BodyText style={styles.previewIcon}>
                      {AVATAR_STYLES.find(s => s.key === selectedAvatarStyle)?.icon}
                    </BodyText>
                    <BodyText style={styles.previewText}>
                      {AVATAR_STYLES.find(s => s.key === selectedAvatarStyle)?.label}
                    </BodyText>
                  </View>
                </View>

                <View style={styles.previewItem}>
                  <BodyText style={styles.previewLabel}>Ton de communication:</BodyText>
                  <View style={styles.previewValue}>
                    <BodyText style={styles.previewIcon}>
                      {COMMUNICATION_TONES.find(t => t.key === selectedTone)?.icon}
                    </BodyText>
                    <BodyText style={styles.previewText}>
                      {COMMUNICATION_TONES.find(t => t.key === selectedTone)?.label}
                    </BodyText>
                  </View>
                </View>

                <View style={styles.exampleContainer}>
                  <BodyText style={styles.exampleLabel}>Exemple de message:</BodyText>
                  <View style={styles.exampleBubble}>
                    <BodyText style={styles.exampleText}>
                      {getPreviewMessage()}
                    </BodyText>
                  </View>
                </View>
              </View>
            )}

          </Animated.View>

          {/* Bouton de continuation */}
          {canContinue() && (
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <BodyText style={styles.continueButtonText}>
                {getContinueText()}
              </BodyText>
            </TouchableOpacity>
          )}

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
    position: 'relative',
  },
  avatarBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
    marginTop: theme.spacing.s,
  },
  avatarBadgeText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontSize: 12,
    fontFamily: theme.fonts.bodyBold,
  },
  messageContainer: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  interactionContainer: {
    marginBottom: theme.spacing.xl,
  },

  // Styles des options
  optionsContainer: {
    gap: theme.spacing.m,
  },
  helpText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: theme.spacing.l,
  },
  optionCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    borderWidth: 2,
    borderColor: theme.colors.primary + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.s,
  },
  optionLabel: {
    fontSize: 18,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.s,
    right: theme.spacing.s,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIcon: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold,
  },

  // Styles du résumé (comme dans l'écran âge)
  summaryContainer: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  summaryIcon: {
    fontSize: 24,
    marginRight: theme.spacing.m,
  },
  summaryTexts: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  summaryDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },

  // Styles de l'aperçu
  previewContainer: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  previewTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  previewLabel: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  previewValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  previewIcon: {
    fontSize: 16,
    marginRight: theme.spacing.s,
  },
  previewText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold,
    color: theme.colors.primary,
  },
  exampleContainer: {
    marginTop: theme.spacing.l,
  },
  exampleLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  exampleBubble: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  exampleText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
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