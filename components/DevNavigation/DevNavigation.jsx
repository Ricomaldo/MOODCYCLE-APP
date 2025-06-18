import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// Stores Zustand
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { useAppStore } from '../../stores/useAppStore';
import { useChatStore } from '../../stores/useChatStore';
import { useNotebookStore } from '../../stores/useNotebookStore';
// Composants UI
import { BodyText, SmallText } from '../Typography';
import PersonaSelector from './PersonaSelector';

export default function DevNavigation() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  
  // Stores
  const { resetOnboarding } = useOnboardingStore();
  const { devMode } = useAppStore();
  const { resetChatData } = useChatStore();
  const { resetNotebook } = useNotebookStore();

  if (!__DEV__ || !devMode) {
    return null;
  }

  const resetOnboardingAction = () => {
    resetOnboarding();
    router.push('/onboarding/100-promesse');
  };

  const resetChatAction = () => {
    resetChatData();
  };

  const resetNotebookAction = () => {
    resetNotebook();
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
        <View style={styles.panel}>
          <BodyText style={styles.sectionTitle}>🧭 Navigation</BodyText>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <SmallText style={styles.navButtonText}>🏠 Accueil</SmallText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <SmallText style={styles.navButtonText}>💬 Chat</SmallText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/(tabs)/cycle')}
          >
            <SmallText style={styles.navButtonText}>🌙 Cycle</SmallText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/(tabs)/notebook')}
          >
            <SmallText style={styles.navButtonText}>📖 Carnet</SmallText>
          </TouchableOpacity>

          <BodyText style={[styles.sectionTitle, { marginTop: 10 }]}>⚡ Actions</BodyText>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={resetOnboardingAction}
          >
            <SmallText style={styles.actionButtonText}>🚀 Onboarding</SmallText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={resetChatAction}
          >
            <SmallText style={styles.actionButtonText}>🗑️ Vider Chat</SmallText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={resetNotebookAction}
          >
            <SmallText style={styles.actionButtonText}>📝 Vider Carnet</SmallText>
          </TouchableOpacity>
        </View>
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
    width: 160,
  },
  sectionTitle: {
    color: '#CDDC39',
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  navButton: {
    backgroundColor: '#E91E63',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  navButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 10,
  },
  actionButton: {
    backgroundColor: '#00BCD4',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 