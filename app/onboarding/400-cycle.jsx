//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/400-cycle.jsx
// 🧩 Type: Écran Onboarding
// 📚 Description: Configuration cycle + observation simplifiée
// 🕒 Version: 4.0 - 2025-01-21
// 🧭 Used in: Parcours onboarding, étape cycle
// ─────────────────────────────────────────────────────────
//
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useCycleStore } from '../../src/stores/useCycleStore';
import OnboardingScreen from '../../src/core/layout/OnboardingScreen';
import { BodyText, Heading2 } from '../../src/core/ui/typography';
import { useTheme } from '../../src/hooks/useTheme';

const formatDateFrench = (date) => {
  try {
    const d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(d);
  } catch (e) {
    return '';
  }
};

export default function CycleScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { updateCycle } = useCycleStore();

  const [lastPeriodDate, setLastPeriodDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [cycleLength, setCycleLength] = useState(28);
  const [showDateModal, setShowDateModal] = useState(false);

  const handleDateConfirm = (selectedDate) => {
    setShowDateModal(false);
    if (selectedDate) {
      const d = (selectedDate instanceof Date) ? selectedDate : new Date(selectedDate);
      setLastPeriodDate(isNaN(d.getTime()) ? new Date() : d);
    }
  };

  const handleContinue = () => {
    updateCycle({
      lastPeriodDate: lastPeriodDate.toISOString(),
      length: cycleLength,
      periodDuration: 5, // Valeur par défaut
    });
    router.push('/onboarding/500-preferences');
  };

  return (
    <OnboardingScreen currentScreen="400-cycle">
      <View style={styles.content}>
        <View style={styles.glassmorphismOverlay} />

        <View style={styles.mainSection}>
          <Heading2 style={styles.title}>
            Quand ont commencé tes dernières règles ?
          </Heading2>

          <TouchableOpacity 
            style={styles.dateCard} 
            onPress={() => setShowDateModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.dateIconContainer}>
              <Text style={styles.dateIcon}>📅</Text>
            </View>
            <BodyText style={styles.dateText}>{formatDateFrench(lastPeriodDate)}</BodyText>
          </TouchableOpacity>

          <Heading2 style={styles.subtitle}>
            Durée habituelle de ton cycle
          </Heading2>

          <View style={styles.quickPicksContainer}>
            {[28, 29, 30].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.quickPick,
                  cycleLength === days && styles.quickPickSelected
                ]}
                onPress={() => setCycleLength(days)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.quickPickIcon,
                  { backgroundColor: cycleLength === days ? theme.colors.primary + '20' : theme.colors.border + '20' }
                ]}>
                  <Text style={styles.quickPickIconText}>🌙</Text>
                </View>
                <View>
                  <BodyText style={[
                    styles.quickPickDays,
                    cycleLength === days && styles.quickPickDaysSelected
                  ]}>
                    {days} jours
                  </BodyText>
                  <BodyText style={styles.quickPickLabel}>
                    {days === 28 ? 'Classique' : days === 29 ? 'Fréquent' : 'Courant'}
                  </BodyText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customLengthContainer}>
            <BodyText style={styles.customLengthLabel}>Ajuster précisément</BodyText>
            <View style={styles.customLengthControls}>
              <TouchableOpacity
                style={[styles.controlButton, cycleLength <= 25 && styles.controlButtonDisabled]}
                onPress={() => cycleLength > 25 && setCycleLength(cycleLength - 1)}
                activeOpacity={0.8}
              >
                <Text style={styles.controlButtonText}>−</Text>
              </TouchableOpacity>

              <View style={styles.lengthDisplay}>
                <BodyText style={styles.lengthNumber}>{cycleLength}</BodyText>
                <BodyText style={styles.lengthUnit}>jours</BodyText>
              </View>

              <TouchableOpacity
                style={[styles.controlButton, cycleLength >= 35 && styles.controlButtonDisabled]}
                onPress={() => cycleLength < 35 && setCycleLength(cycleLength + 1)}
                activeOpacity={0.8}
              >
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <BodyText style={styles.lengthRange}>Entre 25 et 35 jours</BodyText>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleContinue} 
          activeOpacity={0.8}
        >
          <BodyText style={styles.continueButtonText}>Continuer</BodyText>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={showDateModal}
        mode="date"
        date={lastPeriodDate instanceof Date && !isNaN(lastPeriodDate.getTime()) ? lastPeriodDate : new Date()}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDateModal(false)}
        maximumDate={new Date()}
        locale="fr-FR"
        headerTextIOS="Sélectionne la date de tes dernières règles"
        confirmTextIOS="Valider"
        cancelTextIOS="Annuler"
      />
    </OnboardingScreen>
  );
}

const getStyles = (theme) => StyleSheet.create({
  content: {
    flex: 1,
    position: 'relative',
  },

  glassmorphismOverlay: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '25%',
    ...theme.getGlassmorphismStyle(theme.colors.primary, {
      bgOpacity: '03',
      borderOpacity: '08',
      borderWidth: 0.5,
      shadowOpacity: 0,
    }),
    borderRadius: theme.borderRadius.large * 2,
    zIndex: -1,
  },

  mainSection: {
    flex: 1,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
  },

  title: {
    ...theme.typography.heading2,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.text,
  },

  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    marginBottom: theme.spacing.xxl,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },

  dateIcon: {
    fontSize: 20,
  },

  dateText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
    textTransform: 'capitalize',
    flex: 1,
  },

  subtitle: {
    ...theme.typography.heading2,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    color: theme.colors.text,
  },

  quickPicksContainer: {
    gap: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },

  quickPick: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  quickPickSelected: {
    borderColor: theme.colors.primary,
    borderLeftColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },

  quickPickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },

  quickPickIconText: {
    fontSize: 20,
  },

  quickPickDays: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },

  quickPickDaysSelected: {
    color: theme.colors.primary,
  },

  quickPickLabel: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 2,
  },

  customLengthContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },

  customLengthLabel: {
    fontSize: 15,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.m,
  },

  customLengthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.m,
  },

  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },

  controlButtonDisabled: {
    backgroundColor: theme.colors.border + '20',
    borderColor: theme.colors.border,
  },

  controlButtonText: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: '300',
    lineHeight: 28,
  },

  lengthDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },

  lengthNumber: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  lengthUnit: {
    fontSize: 14,
    color: theme.colors.textLight,
  },

  lengthRange: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: theme.spacing.m,
  },

  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.large,
    alignSelf: 'center',
    width: '85%',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});