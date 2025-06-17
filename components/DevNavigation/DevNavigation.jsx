import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

// Stores Zustand
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { useAppStore } from '../../stores/useAppStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { useChatStore } from '../../stores/useChatStore';

// Composants UI
import { Heading3, BodyText, SmallText } from '../Typography';
import PersonaSelector from './PersonaSelector';

export default function DevNavigation() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  
  // Stores
  const onboarding = useOnboardingStore();
  const app = useAppStore();
  const cycle = useCycleStore();
  const chat = useChatStore();

  if (!__DEV__ || !app.devMode) {
    return null;
  }

  const resetAllStores = () => {
    onboarding.resetOnboarding();
    app.resetApp();
    cycle.resetCycleData();
    chat.resetChatData();
  };

  const advanceCycle = () => {
    const currentCycle = cycle.currentCycle;
    if (!currentCycle.startDate) {
      // Si pas de cycle, en créer un
      const startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // Il y a 2 semaines
      cycle.updateCurrentCycle({
        startDate: startDate.toISOString(),
        currentDay: 14,
        currentPhase: 'ovulatory',
        length: 28,
      });
    } else {
      // Avancer de 7 jours
      const cycleLength = currentCycle.length || 28;
      let newDay = currentCycle.currentDay + 7;
      
      // Si on dépasse la fin du cycle, recommencer un nouveau cycle
      if (newDay > cycleLength) {
        newDay = newDay - cycleLength; // Calculer le jour dans le nouveau cycle
        // Créer un nouveau cycle
        const newStartDate = new Date(currentCycle.startDate);
        newStartDate.setDate(newStartDate.getDate() + cycleLength);
        
        cycle.updateCurrentCycle({
          startDate: newStartDate.toISOString(),
          currentDay: newDay,
          currentPhase: newDay <= 5 ? 'menstrual' : 'follicular',
          length: cycleLength,
        });
      } else {
        // Rester dans le cycle actuel
        let newPhase = 'follicular';
        
        if (newDay <= 5) newPhase = 'menstrual';
        else if (newDay <= 13) newPhase = 'follicular';
        else if (newDay <= 17) newPhase = 'ovulatory';
        else newPhase = 'luteal';
        
        cycle.updateCurrentCycle({
          ...currentCycle,
          currentDay: newDay,
          currentPhase: newPhase,
        });
      }
    }
  };

  const resetChat = () => {
    chat.resetChatData();
  };

  const addTestMessages = () => {
    const messages = [
      { type: 'user', text: "Salut Melune ! Comment ça va ?" },
      { type: 'melune', text: "Bonjour ma belle ! Je vais très bien, merci ! Et toi, comment te sens-tu aujourd'hui ? ✨", mood: 'welcoming' },
      { type: 'user', text: "J'ai des crampes aujourd'hui 😔" },
      { type: 'melune', text: "Je comprends, les crampes peuvent être difficiles. As-tu essayé une bouillotte chaude ou des tisanes anti-inflammatoires ? 🌿", mood: 'caring' },
      { type: 'user', text: "Merci pour tes conseils !" },
    ];

    messages.forEach(msg => {
      if (msg.type === 'user') {
        chat.addUserMessage(msg.text);
      } else {
        chat.addMeluneMessage(msg.text, { mood: msg.mood });
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Boutons en ligne */}
      <View style={styles.buttonsRow}>
        {/* Bouton pour montrer/cacher */}
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setIsVisible(!isVisible)}
        >
          <BodyText style={styles.toggleText}>
            🛠️ DEV
          </BodyText>
        </TouchableOpacity>

        {/* PersonaSelector */}
        <PersonaSelector />
      </View>

      {isVisible && (
        <ScrollView style={styles.panel} showsVerticalScrollIndicator={false}>
          <Heading3 style={styles.title}>Dev Navigation</Heading3>
          
          {/* États des stores */}
          <View style={styles.section}>
            <BodyText style={styles.sectionTitle}>📊 États actuels</BodyText>
            <SmallText style={styles.stateText}>
              Onboarding: {onboarding.completed ? '✅ Terminé' : '⏳ En cours'}
            </SmallText>
            <SmallText style={styles.stateText}>
              Premier lancement: {app.isFirstLaunch ? '✅ Oui' : '❌ Non'}
            </SmallText>
            <SmallText style={styles.stateText}>
              Online: {app.isOnline ? '🟢 Connecté' : '🔴 Offline'}
            </SmallText>
            <SmallText style={styles.stateText}>
              Phase actuelle: {cycle.currentCycle.currentPhase}
            </SmallText>
            <SmallText style={styles.stateText}>
              Messages chat: {chat.messages.length}
            </SmallText>
            {onboarding.persona.assigned && (
              <SmallText style={styles.personaText}>
                🎭 Persona: {onboarding.persona.assigned} {onboarding.persona.confidence ? `(${Math.round(onboarding.persona.confidence * 100)}%)` : ''}
              </SmallText>
            )}
          </View>

          {/* Navigation rapide */}
          <View style={styles.section}>
            <BodyText style={styles.sectionTitle}>🧭 Navigation</BodyText>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => router.push('/onboarding/100-promesse')}
            >
              <BodyText style={styles.navButtonText}>Onboarding</BodyText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <BodyText style={styles.navButtonText}>Home</BodyText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <BodyText style={styles.navButtonText}>Chat</BodyText>
            </TouchableOpacity>
          </View>

          {/* Pages Debug */}
          <View style={styles.section}>
            <BodyText style={styles.sectionTitle}>🧪 Debug Pages</BodyText>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => router.push('/debug/persona')}
            >
              <SmallText style={styles.debugButtonText}>🎭 Persona Debug</SmallText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => router.push('/debug/insights')}
            >
              <SmallText style={styles.debugButtonText}>💡 Insights Debug</SmallText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => router.push('/debug/chat')}
            >
              <SmallText style={styles.debugButtonText}>💬 Chat Debug</SmallText>
            </TouchableOpacity>
          </View>

          {/* Actions de test */}
          <View style={styles.section}>
            <BodyText style={styles.sectionTitle}>⚡ Actions de test</BodyText>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={advanceCycle}
            >
              <SmallText style={styles.actionButtonText}>Avancer Cycle</SmallText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={resetChat}
            >
              <SmallText style={styles.actionButtonText}>Reset Chat</SmallText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={addTestMessages}
            >
              <SmallText style={styles.actionButtonText}>Test Messages</SmallText>
            </TouchableOpacity>
          </View>

          {/* Reset */}
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetAllStores}
          >
            <BodyText style={styles.resetButtonText}>🗑️ Reset All Stores</BodyText>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 1000,
  },
  toggleButton: {
    backgroundColor: '#673AB7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  panel: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
    width: 200,
  },
  title: {
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#CDDC39',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  stateText: {
    color: 'white',
    marginBottom: 4,
    fontSize: 10,
  },
  personaText: {
    color: '#FF9800',
    marginBottom: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  navButton: {
    backgroundColor: '#E91E63',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  navButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
  actionButton: {
    backgroundColor: '#00BCD4',
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 10,
  },
  resetButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  resetButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: '#00BCD4',
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  debugButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 10,
  },
}); 