//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/core/dev/PersonaSelector.jsx
// 🧩 Type : Composant utilitaire (DEV)
// 📚 Description : Sélecteur de persona pour simuler différents profils utilisateurs en onboarding (DEV tools)
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : panneau de navigation développeur (DevNavigation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BodyText, SmallText } from '../ui/Typography';
import { useUserStore } from '../../stores/useUserStore';
import { theme } from '../../config/theme';
import { SIMULATION_PROFILES } from '../../config/personaProfiles';
import { getDateDaysAgo } from '../../utils/dateUtils';

const PERSONAS = [
  { name: 'Emma', emoji: '🌱' },
  { name: 'Laure', emoji: '💼' },
  { name: 'Sylvie', emoji: '🦋' },
  { name: 'Christine', emoji: '🌟' },
  { name: 'Clara', emoji: '⚡' },
];

export default function PersonaSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const {
    updateProfile,
    updatePreferences,
    updateMelune,
    updateCycle,
    calculatePersona,
    completeProfile,
  } = useUserStore();

  const simulatePersona = (personaName) => {
    const personaKey = personaName.toLowerCase();
    const simulationData = SIMULATION_PROFILES[personaKey];

    if (!simulationData) {
      Alert.alert('❌ Erreur', 'Données de simulation non trouvées pour ce persona');
      return;
    }

    try {
      // Remplir les données avec les profils de simulation
      updateProfile({
        ...simulationData.userInfo,
        prenom: personaName,
        journeyStarted: true,
        startDate: new Date().toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
        }),
      });

      updatePreferences(simulationData.preferences);

      updateMelune({
        ...simulationData.melune,
        personalityMatch: simulationData.melune.avatarStyle,
      });

      // Données de cycle basiques
      updateCycle({
        lastPeriodDate: getDateDaysAgo(7), // Il y a 7 jours
        length: 28,
        periodDuration: 5,
        isRegular: true,
        trackingExperience: 'basic',
      });

      // Calculer le persona avec l'algorithme
      const assignedPersona = calculatePersona();
      completeProfile();

      Alert.alert(
        '✅ Profil créé',
        `${personaName} simulé avec succès !\nPersona calculé: ${
          assignedPersona?.toUpperCase() || 'ERREUR'
        }`,
        [
          { text: 'Voir Profil', onPress: () => router.push('/debug/persona') },
          { text: 'OK', style: 'default' },
        ]
      );

      setIsOpen(false);
    } catch (error) {
      Alert.alert('❌ Erreur', `Erreur lors de la simulation: ${error.message}`);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.toggleButton} onPress={() => setIsOpen(!isOpen)}>
        <BodyText style={styles.toggleText}>🎭</BodyText>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.panel}>
          <BodyText style={styles.sectionTitle}>🎭 Personas</BodyText>
          {PERSONAS.map((persona) => (
            <TouchableOpacity
              key={persona.name}
              style={styles.personaButton}
              onPress={() => simulatePersona(persona.name)}
            >
              <SmallText style={styles.personaText}>
                {persona.emoji} {persona.name}
              </SmallText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    backgroundColor: '#673AB7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  panel: {
    position: 'absolute',
    top: 35,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 10,
    padding: 15,
    width: 140,
    zIndex: 1000,
  },
  sectionTitle: {
    color: '#CDDC39',
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  personaButton: {
    backgroundColor: '#00BCD4',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  personaText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
});
