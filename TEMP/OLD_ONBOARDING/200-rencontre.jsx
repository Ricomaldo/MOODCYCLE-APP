import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BodyText } from '../../components/Typography';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { theme } from '../../config/theme';
import MeluneAvatar from '../../components/MeluneAvatar';
import ChatBubble from '../../components/ChatBubble';


export default function RencontreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateJourneyChoice } = useOnboardingStore();
  
  const [selectedChoice, setSelectedChoice] = useState(null);
  
  // Animation simple
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée simple
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const choices = [
    { id: 'body_disconnect', label: 'Je ne me reconnais plus dans mon corps' },
    { id: 'hiding_nature', label: 'Je sens que je cache ma vraie nature' },
    { id: 'emotional_control', label: 'Je veux arrêter de subir mes émotions' },
  ];

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice.id);
    
    // Sauvegarder dans le store Zustand
    updateJourneyChoice({ 
      selectedOption: choice.id,
      motivation: choice.label 
    });

    // Petit délai pour montrer la sélection, puis naviguer
    setTimeout(() => {
      router.push('/onboarding/300-confiance');
    }, 600);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>


      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Avatar Melune */}
        <View style={styles.avatarContainer}>
          <MeluneAvatar phase="menstrual" size="medium" />
        </View>

        {/* Messages de Melune */}
        <View style={styles.messagesContainer}>
          <View style={styles.messageWrapper}>
            <ChatBubble 
              message="Je te vois... cette femme puissante en toi qui attend de se révéler ✨" 
              isUser={false} 
            />
          </View>
          
          <View style={styles.messageWrapper}>
            <ChatBubble 
              message="Tu es venue chercher quelque chose, n'est-ce pas ? Quelque chose que tu sens sans pouvoir le nommer ?" 
              isUser={false} 
            />
          </View>
        </View>

        {/* Choix de réponses */}
        <View style={styles.choicesContainer}>
          {choices.map((choice) => (
            <TouchableOpacity
              key={choice.id}
              style={[
                styles.choiceButton,
                selectedChoice === choice.id && styles.selectedChoice
              ]}
              onPress={() => handleChoiceSelect(choice)}
              activeOpacity={0.8}
            >
              <BodyText 
                style={[
                  styles.choiceText,
                  selectedChoice === choice.id && styles.selectedChoiceText
                ]}
              >
                {choice.label}
              </BodyText>
            </TouchableOpacity>
          ))}
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.l,
  },
  messagesContainer: {
    marginBottom: theme.spacing.xl,
  },
  messageWrapper: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.m,
  },
  choicesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
  },
  choiceButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.primary + '40',
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedChoice: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  choiceText: {
    fontSize: 15,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  selectedChoiceText: {
    color: theme.getTextColorOn(theme.colors.primary),
    fontFamily: theme.fonts.bodyBold,
  },
});