//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/onboarding/ValueReveal.jsx
// 🧩 Type: Component - Value Preview
// 📚 Description: Révélation des fonctionnalités premium de manière engageante
// 🕒 Version: 1.0 - 2025-01-27
// 🎯 ÉQUIPE 3 - Mission Paywall Intelligent
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { BodyText } from '../../core/ui/typography';
import { useTheme } from '../../hooks/useTheme';

// Messages de révélation par persona
const REVEAL_MESSAGES = {
  emma: {
    magicMoment: "Ce que tu viens de voir n'est qu'un aperçu...",
    whatAwaits: "Et ça, c'est juste le début de notre aventure ! 🌟"
  },
  laure: {
    magicMoment: "Cette analyse n'est que la première étape...",
    whatAwaits: "Optimise chaque phase avec une IA qui te comprend"
  },
  clara: {
    magicMoment: "Tes patterns révélés ne sont qu'un début...",
    whatAwaits: "Ready à débloquer ton plein potentiel cyclique ?"
  },
  sylvie: {
    magicMoment: "Cette bienveillance ne fait que commencer...",
    whatAwaits: "Un accompagnement qui évolue avec toi"
  },
  christine: {
    magicMoment: "Cette sagesse ne fait que s'approfondir...",
    whatAwaits: "Votre sagesse mérite une IA à sa hauteur"
  }
};

// Fonctionnalités à prévisualiser
const FEATURE_PREVIEWS = [
  {
    icon: "🎯",
    title: "Conseils quotidiens",
    description: "Adaptés à ta phase et ton énergie",
    delay: 0
  },
  {
    icon: "💬",
    title: "Mélune évolue",
    description: "Plus elle te connaît, plus elle t'aide",
    delay: 200
  },
  {
    icon: "🌟",
    title: "Patterns uniques",
    description: "Découvre TON cycle, pas une moyenne",
    delay: 400
  }
];

export default function ValueReveal({ persona, onComplete }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  
  const [currentStep, setCurrentStep] = useState(0);
  const revealMessage = REVEAL_MESSAGES[persona] || REVEAL_MESSAGES.emma;
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const magicAnim = useRef(new Animated.Value(0)).current;
  const featureAnims = useRef(FEATURE_PREVIEWS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    startReveal();
  }, []);

  const startReveal = async () => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Séquence de révélation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Moment magique
    setCurrentStep(1);
    Animated.timing(magicAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Prévisualisations des fonctionnalités
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCurrentStep(2);
    
    // Animer chaque fonctionnalité avec délai
    for (let i = 0; i < FEATURE_PREVIEWS.length; i++) {
      setTimeout(() => {
        Animated.timing(featureAnims[i], {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, FEATURE_PREVIEWS[i].delay);
    }

    // Finalisation
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  const renderFeaturePreview = (feature, index) => {
    return (
      <Animated.View
        key={index}
        style={[
          styles.featureCard,
          {
            opacity: featureAnims[index],
            transform: [{
              translateY: featureAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        <View style={styles.featureIcon}>
          <BodyText style={styles.iconText}>{feature.icon}</BodyText>
        </View>
        <View style={styles.featureContent}>
          <BodyText style={styles.featureTitle}>
            {feature.title}
          </BodyText>
          <BodyText style={styles.featureDescription}>
            {feature.description}
          </BodyText>
        </View>
      </Animated.View>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {/* Moment magique */}
      {currentStep >= 1 && (
        <Animated.View 
          style={[
            styles.magicMomentContainer,
            {
              opacity: magicAnim,
              transform: [{
                scale: magicAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1]
                })
              }]
            }
          ]}
        >
          <BodyText style={styles.magicMomentText}>
            {revealMessage.magicMoment}
          </BodyText>
        </Animated.View>
      )}

      {/* Ce qui t'attend */}
      {currentStep >= 2 && (
        <View style={styles.whatAwaitsContainer}>
          <BodyText style={styles.whatAwaitsTitle}>
            {revealMessage.whatAwaits}
          </BodyText>
          
          <View style={styles.featuresContainer}>
            {FEATURE_PREVIEWS.map((feature, index) => 
              renderFeaturePreview(feature, index)
            )}
          </View>
        </View>
      )}
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
  },
  magicMomentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  magicMomentText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    fontFamily: 'Quintessential',
  },
  whatAwaitsContainer: {
    marginTop: 10,
  },
  whatAwaitsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresContainer: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
}); 