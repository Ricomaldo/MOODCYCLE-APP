//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/onboarding/LivePersonaDemo.jsx
// 🧩 Type: Component - Value Preview
// 📚 Description: Démonstration en temps réel de l'intelligence Mélune
// 🕒 Version: 1.0 - 2025-01-27
// 🎯 ÉQUIPE 3 - Mission Paywall Intelligent
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { BodyText } from '../../core/ui/typography';
import { useTheme } from '../../hooks/useTheme';
import { getPersonalizedInsight } from '../../services/InsightsEngine';
import MeluneAvatar from '../shared/MeluneAvatar';

export default function LivePersonaDemo({ persona, phase, preferences, onComplete }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  
  // États d'animation
  const [currentStep, setCurrentStep] = useState(0);
  const [insight, setInsight] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    { text: "J'analyse tes réponses...", duration: 1500 },
    { text: "Je comprends ton rythme...", duration: 1200 },
    { text: "Je révèle ton insight...", duration: 2000 }
  ];

  useEffect(() => {
    startDemo();
  }, []);

  const startDemo = async () => {
    // Animation d'entrée
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animation continue des particules
    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Séquence de génération
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }

    // Générer l'insight personnalisé
    await generatePersonalizedInsight();
  };

  const generatePersonalizedInsight = async () => {
    try {
      const context = {
        phase: phase || 'follicular',
        persona: persona || 'emma',
        preferences: preferences || {},
        melune: { tone: 'friendly' },
        profile: { prenom: 'Tu' },
        observations: [],
        hasObservations: false
      };

      const result = await getPersonalizedInsight(context, {
        enrichWithContext: true,
        usedInsights: [],
        includeObservations: false
      });

      // Animation de frappe
      animateTyping(result.content);
      
    } catch (error) {
      console.error('Erreur génération insight:', error);
      animateTyping("Je commence à te connaître et à comprendre ton rythme unique ✨");
    }
  };

  const animateTyping = (text) => {
    setIsGenerating(false);
    let currentText = '';
    const words = text.split(' ');
    
    const typeWord = (index) => {
      if (index >= words.length) {
        onComplete?.();
        return;
      }
      
      currentText += (index > 0 ? ' ' : '') + words[index];
      setInsight(currentText);
      
      setTimeout(() => typeWord(index + 1), 150);
    };
    
    typeWord(0);
  };

  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 8; i++) {
      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: `${10 + i * 10}%`,
              top: `${20 + (i % 3) * 20}%`,
              transform: [{
                translateY: particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20 - Math.random() * 30]
                })
              }],
              opacity: particleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.8, 0]
              })
            }
          ]}
        >
          <Text style={styles.particleText}>✨</Text>
        </Animated.View>
      );
    }
    return particles;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* En-tête avec Mélune */}
      <View style={styles.header}>
        <MeluneAvatar size={60} persona={persona} />
        <View style={styles.headerText}>
          <BodyText style={styles.title}>
            Voici ce que Mélune a déjà compris de toi
          </BodyText>
        </View>
      </View>

      {/* Zone de démonstration */}
      <View style={styles.demoZone}>
        {isGenerating ? (
          <View style={styles.generatingContainer}>
            {renderParticles()}
            <Animated.View style={styles.analyzingContainer}>
              <Animated.View style={{
                transform: [{
                  rotate: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }}>
                <Text style={styles.sparkleEmoji}>✨</Text>
              </Animated.View>
              <BodyText style={styles.analyzingText}>
                {steps[currentStep]?.text || "J'analyse..."}
              </BodyText>
            </Animated.View>
          </View>
        ) : (
          <View style={styles.insightContainer}>
            <BodyText style={styles.insightText}>
              {insight}
            </BodyText>
            <View style={styles.signature}>
              <BodyText style={styles.signatureText}>
                — Mélune, qui commence à te connaître
              </BodyText>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Quintessential',
  },
  demoZone: {
    minHeight: 120,
    justifyContent: 'center',
  },
  generatingContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleText: {
    fontSize: 16,
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
  },
  sparkleEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  analyzingText: {
    fontSize: 16,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  insightContainer: {
    padding: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: 12,
  },
  signature: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  signatureText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
}); 