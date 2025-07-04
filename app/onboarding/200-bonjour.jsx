//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/onboarding/200-bonjour.jsx
// 🎯 Status: ✅ FINAL - NE PAS MODIFIER
// 📝 Description: Écran de première rencontre avec Mélune
// 🔄 Cycle: Onboarding - Étape 2/8
// ─────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Animated, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Feather } from "@expo/vector-icons";
import OnboardingScreen from '../../src/core/layout/OnboardingScreen';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { Heading2 } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';
import { 
  AnimatedRevealMessage,
  AnimatedOnboardingScreen,
  AnimatedOnboardingButton,
  ANIMATION_DURATIONS,
  ANIMATION_CONFIGS,
  ANIMATION_PRESETS
} from '../../src/core/ui/animations';
import * as Haptics from 'expo-haptics';

function TypingIndicator({ theme }) {
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(dot1Anim, { 
          toValue: 1, 
          duration: ANIMATION_DURATIONS.normal, 
          useNativeDriver: true 
        }),
        Animated.timing(dot2Anim, { 
          toValue: 1, 
          duration: ANIMATION_DURATIONS.normal, 
          useNativeDriver: true 
        }),
        Animated.timing(dot3Anim, { 
          toValue: 1, 
          duration: ANIMATION_DURATIONS.normal, 
          useNativeDriver: true 
        }),
        Animated.parallel([
          Animated.timing(dot1Anim, { 
            toValue: 0.4, 
            duration: ANIMATION_DURATIONS.normal, 
            useNativeDriver: true 
          }),
          Animated.timing(dot2Anim, { 
            toValue: 0.4, 
            duration: ANIMATION_DURATIONS.normal, 
            useNativeDriver: true 
          }),
          Animated.timing(dot3Anim, { 
            toValue: 0.4, 
            duration: ANIMATION_DURATIONS.normal, 
            useNativeDriver: true 
          }),
        ]),
      ]).start(animate);
    };
    animate();
  }, []);

  const typingStyles = StyleSheet.create({
    container: {
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    bubble: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    dots: {
      flexDirection: 'row',
      gap: 4,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.textLight,
    },
  });

  return (
    <View style={typingStyles.container}>
      <View style={typingStyles.bubble}>
        <View style={typingStyles.dots}>
          <Animated.View style={[typingStyles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[typingStyles.dot, { opacity: dot2Anim }]} />
          <Animated.View style={[typingStyles.dot, { opacity: dot3Anim }]} />
        </View>
      </View>
    </View>
  );
}

export default function BonjourScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // États
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');
  const [hasResponded, setHasResponded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [startContent, setStartContent] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputFadeAnim = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // 1. Attendre que la navigation soit en place
    const timer = setTimeout(() => {
      setStartContent(true);
    }, ANIMATION_DURATIONS.normal);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!startContent) return;

    // 2. Séquence d'introduction du contenu
    Animated.parallel([
      // Fade in de Mélune et son message
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.elegant,
        ...ANIMATION_PRESETS.smooth,
        useNativeDriver: true,
      }),
      // Translation du contenu
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: ANIMATION_DURATIONS.elegant,
        ...ANIMATION_PRESETS.smooth,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Une fois que le contenu est en place, on peut afficher l'input
      setTimeout(() => {
        Animated.timing(inputFadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.slow,
          ...ANIMATION_PRESETS.gentle,
          useNativeDriver: true,
        }).start(() => {
          setShowInput(true);
        });
      }, ANIMATION_DURATIONS.dramatic);
    });
  }, [startContent]);

  const handleSend = () => {
    if (!input.trim() || hasResponded) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setHasResponded(true);
    setIsTyping(true);
    
    // Simuler la réponse de Mélune
    setTimeout(() => {
      setIsTyping(false);
      setShowReply(true);
      
      // Transition vers l'écran suivant avec un délai plus long
      setTimeout(() => {
        // Fade out élégant avant la navigation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: ANIMATION_DURATIONS.elegant,
            ...ANIMATION_PRESETS.smooth,
            useNativeDriver: true,
          }),
          Animated.timing(inputFadeAnim, {
            toValue: 0,
            duration: ANIMATION_DURATIONS.elegant,
            ...ANIMATION_PRESETS.smooth,
            useNativeDriver: true,
          })
        ]).start(() => {
          router.push('/onboarding/250-rencontre');
        });
      }, ANIMATION_DURATIONS.dramatic * 2.5); // Augmentation significative du délai de lecture
    }, ANIMATION_DURATIONS.reveal);
  };

  return (
    <OnboardingScreen currentScreen="200-bonjour">
      <AnimatedOnboardingScreen>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
        >
          <View style={styles.mainContent}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View 
                style={[
                  styles.content, 
                  { 
                    opacity: fadeAnim,
                    transform: [{ translateY: contentTranslateY }]
                  }
                ]}
              >
                {/* Section Mélune */}
                <View style={[styles.meluneSection, !hasResponded && styles.meluneSectionExpanded]}>
                  <View style={styles.meluneContainer}>
                    <MeluneAvatar 
                      phase="follicular"
                      size="large"
                      style="classic"
                      animated={startContent}
                    />
                  </View>

                  <Animated.View style={styles.messageContainer}>
                    <AnimatedRevealMessage delay={ANIMATION_DURATIONS.welcomeFirstMessage}>
                      <Heading2 style={styles.greeting} numberOfLines={2} adjustsFontSizeToFit>
                        Bonjour,{'\n'}je suis Mélune
                      </Heading2>
                    </AnimatedRevealMessage>
                  </Animated.View>
                </View>

                {/* Zone de conversation */}
                <View style={styles.chatContainer}>
                  {hasResponded && (
                    <View style={styles.userBubble}>
                      <Animated.Text style={styles.userText}>
                        {input}
                      </Animated.Text>
                    </View>
                  )}
                  
                  {isTyping && <TypingIndicator theme={theme} />}

                  {showReply && (
                    <AnimatedRevealMessage delay={ANIMATION_DURATIONS.quick}>
                      <View style={styles.meluneBubble}>
                        <Animated.Text style={styles.meluneText}>
                          Enchantée ! Je suis ravie de faire ta connaissance. Je serai ton guide tout au long de ton voyage...
                        </Animated.Text>
                      </View>
                    </AnimatedRevealMessage>
                  )}
                </View>
              </Animated.View>
            </ScrollView>

            {/* Zone de saisie - Toujours présente mais invisible au début */}
            <Animated.View 
              style={[
                styles.inputWrapper,
                { 
                  opacity: inputFadeAnim,
                  transform: [{ 
                    translateY: inputFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }]
                }
              ]}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Dis-moi bonjour..."
                  placeholderTextColor={theme.colors.textLight}
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  editable={!hasResponded && showInput}
                  autoFocus={showInput}
                />
                <AnimatedOnboardingButton>
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={!input.trim() || hasResponded || !showInput}
                    style={[
                      styles.sendButton,
                      (!input.trim() || hasResponded || !showInput) && styles.sendButtonDisabled
                    ]}
                  >
                    <Feather 
                      name="arrow-right"
                      size={24}
                      color={(!input.trim() || hasResponded || !showInput) ? theme.colors.textLight : theme.colors.primary}
                    />
                  </TouchableOpacity>
                </AnimatedOnboardingButton>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </AnimatedOnboardingScreen>
    </OnboardingScreen>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },

  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flex: 1,
  },

  meluneSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
  },

  meluneSectionExpanded: {
    flex: 1,
    justifyContent: 'center',
  },

  meluneContainer: {
    marginBottom: theme.spacing.l,
  },

  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },

  greeting: {
    fontSize: 28,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 36,
  },

  chatContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    gap: theme.spacing.m,
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: 20,
    maxWidth: '80%',
  },

  userText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
  },

  meluneBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: 20,
    maxWidth: '80%',
  },

  meluneText: {
    color: theme.colors.text,
    fontSize: 16,
  },

  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    paddingHorizontal: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.m,
  },

  sendButton: {
    padding: theme.spacing.s,
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 