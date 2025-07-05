import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useScreenTracking, useButtonTracking, useTextInputTracking, useCardTracking, useScrollTracking } from '../hooks/useBehaviorAnalytics';

/**
 * Exemple d'utilisation du BehaviorAnalyticsService
 * Démontre comment tracker les interactions utilisateur
 */
export default function BehaviorTrackingExample() {
  const [text, setText] = useState('');
  const [counter, setCounter] = useState(0);

  // Hooks de tracking
  useScreenTracking('BehaviorExample', { source: 'example' });
  const { trackPress, trackLongPress } = useButtonTracking();
  const { trackInput, trackFocus, trackBlur } = useTextInputTracking();
  const { trackTap, trackSwipe, trackSave } = useCardTracking();
  const { trackScroll } = useScrollTracking('BehaviorExample');

  return (
    <ScrollView 
      style={styles.container}
      onScroll={trackScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.content}>
        <Text style={styles.title}>🎯 Behavior Analytics Demo</Text>
        
        {/* Section Boutons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Boutons Trackés</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => {
              trackPress('increment_button', { currentValue: counter });
              setCounter(counter + 1);
            }}
            onLongPress={() => {
              trackLongPress('increment_button', { action: 'reset' });
              setCounter(0);
            }}
          >
            <Text style={styles.buttonText}>Compteur: {counter}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#E91E63' }]}
            onPress={() => {
              trackPress('action_button', { action: 'primary' });
            }}
          >
            <Text style={styles.buttonText}>Action Primaire</Text>
          </TouchableOpacity>
        </View>

        {/* Section Saisie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✏️ Saisie Trackée</Text>
          
          <TextInput
            style={styles.textInput}
            placeholder="Écrivez quelque chose..."
            value={text}
            onChangeText={(newText) => {
              setText(newText);
              trackInput('demo_input', newText, 'demo');
            }}
            onFocus={() => trackFocus('demo_input')}
            onBlur={() => trackBlur('demo_input', text)}
          />
          
          <Text style={styles.info}>
            Caractères: {text.length}
          </Text>
        </View>

        {/* Section Cartes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🃏 Cartes Trackées</Text>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => {
              trackTap('demo_card_1', { type: 'insight', phase: 'follicular' });
            }}
          >
            <Text style={styles.cardTitle}>Insight Folliculaire</Text>
            <Text style={styles.cardText}>Cette carte track les interactions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: '#E8F5E8' }]}
            onPress={() => {
              trackTap('demo_card_2', { type: 'vignette', phase: 'luteal' });
            }}
          >
            <Text style={styles.cardTitle}>Vignette Lutéale</Text>
            <Text style={styles.cardText}>Tap pour tracker l'interaction</Text>
            
            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.cardAction}
                onPress={() => {
                  trackSave('demo_card_2', { type: 'vignette', phase: 'luteal' });
                }}
              >
                <Text style={styles.cardActionText}>💾 Sauver</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cardAction}
                onPress={() => {
                  trackSwipe('demo_card_2', 'right', { type: 'vignette', phase: 'luteal' });
                }}
              >
                <Text style={styles.cardActionText}>👉 Swipe</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informations</Text>
          
          <Text style={styles.info}>
            • Chaque interaction est automatiquement trackée
          </Text>
          <Text style={styles.info}>
            • Les données sont collectées en temps réel
          </Text>
          <Text style={styles.info}>
            • Utilisez le DevPanel pour voir les analytics
          </Text>
          <Text style={styles.info}>
            • Les patterns sont analysés automatiquement
          </Text>
        </View>

        {/* Espace pour le scroll */}
        <View style={{ height: 200 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#E65100',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cardAction: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cardActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
}); 