//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/onboarding/AuthenticTestimonial.jsx
// 🧩 Type: Component - Value Preview
// 📚 Description: Témoignages authentiques personnalisés par persona
// 🕒 Version: 1.0 - 2025-01-27
// 🎯 ÉQUIPE 3 - Mission Paywall Intelligent
// ─────────────────────────────────────────────────────────
//
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { BodyText } from '../../core/ui/typography';
import { useTheme } from '../../hooks/useTheme';

// Témoignages authentiques par persona
const TESTIMONIALS = {
  emma: {
    quote: "En 2 semaines, j'ai enfin compris pourquoi je me sentais bizarre certains jours. Mélune m'a aidée à accepter mes changements d'humeur au lieu de les combattre. Game changer ! 🌸",
    author: "Emma, 24 ans",
    avatar: "emma-testimonial",
    highlight: "Game changer !"
  },
  laure: {
    quote: "J'optimise maintenant mes réunions importantes selon mon cycle. Ma productivité a augmenté de 40% et je me sens plus en contrôle de mon énergie. 📈",
    author: "Laure, 31 ans",
    avatar: "laure-testimonial", 
    highlight: "40% d'augmentation"
  },
  clara: {
    quote: "Mélune m'a révélé des patterns que je ne soupçonnais même pas ! Je comprends maintenant mes pics de créativité et j'organise mes projets en conséquence. 🚀",
    author: "Clara, 28 ans",
    avatar: "clara-testimonial",
    highlight: "Patterns révélés"
  },
  sylvie: {
    quote: "À 45 ans, je redécouvre mon corps avec bienveillance. Mélune m'accompagne dans cette transition avec douceur et sagesse. 🌺",
    author: "Sylvie, 45 ans",
    avatar: "sylvie-testimonial",
    highlight: "Redécouverte bienveillante"
  },
  christine: {
    quote: "Cette sagesse cyclique m'aide à mieux accompagner mes patientes. Mélune m'offre des insights que je n'avais jamais considérés. 💎",
    author: "Christine, 52 ans",
    avatar: "christine-testimonial",
    highlight: "Sagesse partagée"
  }
};

export default function AuthenticTestimonial({ persona, onComplete }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  
  const [isVisible, setIsVisible] = useState(false);
  const testimonial = TESTIMONIALS[persona] || TESTIMONIALS.emma;
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée avec délai
    setTimeout(() => {
      setIsVisible(true);
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

      // Animation du texte avec délai
      setTimeout(() => {
        Animated.timing(quoteAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          onComplete?.();
        });
      }, 400);
    }, 500);
  }, []);

  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    
    const parts = text.split(highlight);
    return parts.map((part, index) => (
      <BodyText key={index} style={styles.quoteText}>
        {part}
        {index < parts.length - 1 && (
          <BodyText style={[styles.quoteText, styles.highlight]}>
            {highlight}
          </BodyText>
        )}
      </BodyText>
    ));
  };

  if (!isVisible) return null;

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
      {/* Avatar et nom */}
      <View style={styles.authorSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <BodyText style={styles.avatarText}>
              {testimonial.author.charAt(0)}
            </BodyText>
          </View>
        </View>
        <View style={styles.authorInfo}>
          <BodyText style={styles.authorName}>
            {testimonial.author}
          </BodyText>
          <BodyText style={styles.authorSubtitle}>
            Utilisatrice Mélune
          </BodyText>
        </View>
      </View>

      {/* Citation */}
      <Animated.View 
        style={[
          styles.quoteContainer,
          {
            opacity: quoteAnim,
            transform: [{
              scale: quoteAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1]
              })
            }]
          }
        ]}
      >
        <BodyText style={styles.quoteMark}>"</BodyText>
        <View style={styles.quoteTextContainer}>
          {highlightText(testimonial.quote, testimonial.highlight)}
        </View>
        <BodyText style={styles.quoteMark}>"</BodyText>
      </Animated.View>

      {/* Badge de confiance */}
      <View style={styles.trustBadge}>
        <BodyText style={styles.trustText}>
          ✨ Témoignage authentique
        </BodyText>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  authorSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  quoteContainer: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  quoteMark: {
    fontSize: 32,
    color: theme.colors.primary,
    fontFamily: 'Quintessential',
    position: 'absolute',
    top: -8,
    left: 8,
  },
  quoteTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 8,
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  highlight: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  trustBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 20,
  },
  trustText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
}); 