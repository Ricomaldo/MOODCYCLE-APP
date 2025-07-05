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
import { Feather, Ionicons } from "@expo/vector-icons";
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import MeluneAvatar from '../../src/features/shared/MeluneAvatar';
import { Heading2, BodyText } from '../../src/core/ui/typography';
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
import { useUserStore } from '../../src/stores/useUserStore';

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
  const theme = useTheme();
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
    <ScreenContainer edges={['top', 'bottom']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 140 : 0}
      >
        <AnimatedOnboardingScreen>
          <View style={styles.mainContent}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                !hasResponded && styles.scrollContentExpanded
              ]}
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
                {/* Section Mélune encore plus compacte sur iOS */}
                <View style={[
                  styles.meluneSection, 
                  !hasResponded && styles.meluneSectionExpanded
                ]}>
                  <View style={[
                    styles.meluneContainer,
                    !hasResponded && styles.meluneContainerExpanded
                  ]}>
                    <MeluneAvatar 
                      phase="follicular"
                      size={Platform.OS === "ios" ? "medium" : "large"}
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

                {/* Zone de conversation avec padding ajusté */}
                <View style={[
                  styles.chatContainer,
                  hasResponded && styles.chatContainerExpanded
                ]}>
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

            {/* Zone de saisie avec padding optimisé */}
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
                  placeholder="Dis-moi bonjour..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  autoFocus={true}
                  autoCorrect={false}
                  autoCapitalize="none"
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !input.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={handleSend}
                  disabled={!input.trim()}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color={input.trim() ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </AnimatedOnboardingScreen>
      </KeyboardAvoidingView>
    </ScreenContainer>
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
    paddingBottom: Platform.OS === 'ios' ? 250 : theme.spacing.xxl,
  },

  scrollContentExpanded: {
    justifyContent: 'center',
  },

  content: {
    flex: 1,
  },

  meluneSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? theme.spacing.s : theme.spacing.xl,
  },

  meluneSectionExpanded: {
    flex: Platform.OS === 'ios' ? 0.25 : 0.6,
    justifyContent: 'center',
  },

  meluneContainer: {
    marginBottom: Platform.OS === 'ios' ? theme.spacing.s : theme.spacing.m,
  },

  meluneContainerExpanded: {
    marginBottom: Platform.OS === 'ios' ? theme.spacing.m : theme.spacing.l,
  },

  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },

  greeting: {
    fontSize: Platform.OS === 'ios' ? 22 : 28,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: Platform.OS === 'ios' ? 28 : 36,
  },

  chatContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.l,
    gap: theme.spacing.m,
  },

  chatContainerExpanded: {
    paddingTop: theme.spacing.xxl,
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
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.xs : theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 25,
    paddingLeft: theme.spacing.l,
    paddingRight: theme.spacing.m,
    borderWidth: 0,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.xs : theme.spacing.m,
    minHeight: Platform.OS === 'ios' ? 40 : 48,
  },

  sendButton: {
    padding: theme.spacing.xs,
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 