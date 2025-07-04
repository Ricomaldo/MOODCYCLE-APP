// src/features/onboarding/cycle/CycleDateSelector.jsx
import React, { useRef, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AnimatedRevealMessage } from '../../../core/ui/animations/OnboardingAnimations';
import * as Haptics from 'expo-haptics';

export const CycleDateSelector = ({ value, onChange, persona, theme }) => {
  const scrollRef = useRef(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Générer 30 jours
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });
  
  const isSelected = (date) => date.toDateString() === value.toDateString();
  const getDaysAgo = (date) => {
    const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    return `Il y a ${diff} jours`;
  };
  
  const handleSelect = (date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(date);
    setShowFeedback(true);
  };
  
  // Auto-scroll à la date sélectionnée
  useEffect(() => {
    const index = dates.findIndex(d => isSelected(d));
    if (index >= 0 && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: index * 65 - 100, animated: true });
      }, 100);
    }
  }, []);
  
  const styles = getStyles(theme);
  
  return (
    <View style={styles.container}>
      <Text style={styles.monthHeader}>
        {value.toLocaleDateString('fr', { month: 'long', year: 'numeric' })}
      </Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {dates.map((date, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dateItem, isSelected(date) && styles.selected]}
            onPress={() => handleSelect(date)}
            activeOpacity={0.7}
          >
            <Text style={[styles.day, isSelected(date) && styles.selectedText]}>
              {date.toLocaleDateString('fr', { weekday: 'short' }).slice(0, 3)}
            </Text>
            <Text style={[styles.number, isSelected(date) && styles.selectedText]}>
              {date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {showFeedback && (
        <AnimatedRevealMessage delay={200}>
          <Text style={styles.feedback}>{getDaysAgo(value)} 🌙</Text>
        </AnimatedRevealMessage>
      )}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { marginVertical: theme.spacing.m },
  monthHeader: { 
    textAlign: 'center', 
    fontSize: 14, 
    color: theme.colors.textLight, 
    marginBottom: theme.spacing.s,
    textTransform: 'capitalize'
  },
  scrollContent: { paddingHorizontal: theme.spacing.m },
  dateItem: {
    width: 56, height: 70, marginHorizontal: 4,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface + '50',
    alignItems: 'center', justifyContent: 'center'
  },
  selected: { backgroundColor: theme.colors.primary, transform: [{ scale: 1.05 }] },
  day: { fontSize: 12, color: theme.colors.textLight, marginBottom: 4 },
  number: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  selectedText: { color: theme.colors.white },
  feedback: { textAlign: 'center', marginTop: theme.spacing.s, color: theme.colors.primary, fontStyle: 'italic' }
});