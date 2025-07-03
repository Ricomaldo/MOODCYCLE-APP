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
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useCycleStore } from '../../src/stores/useCycleStore';
import ScreenContainer from '../../src/core/layout/ScreenContainer';
import OnboardingNavigation from '../../src/features/shared/OnboardingNavigation';
import { BodyText } from '../../src/core/ui/typography';
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
    <ScreenContainer edges={['top', 'bottom']}>
      <OnboardingNavigation currentScreen="400-cycle" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <BodyText style={styles.title}>Quand ont commencé tes dernières règles ?</BodyText>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDateModal(true)}>
            <BodyText style={styles.dateButtonText}>{formatDateFrench(lastPeriodDate)}</BodyText>
          </TouchableOpacity>

          <BodyText style={styles.subtitle}>Durée habituelle de ton cycle</BodyText>
          <View style={styles.lengthOptions}>
            {[25,26,27,28,29,30,31,32,33,34,35].map((length) => (
              <TouchableOpacity
                key={length}
                style={[styles.lengthOption, cycleLength === length && styles.lengthOptionSelected]}
                onPress={() => setCycleLength(length)}
              >
                <BodyText style={[styles.lengthText, cycleLength === length && styles.lengthTextSelected]}>{length}j</BodyText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
            <BodyText style={styles.continueButtonText}>Continuer</BodyText>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: theme.spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.l,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  dateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignSelf: 'center',
    minWidth: '80%',
    marginBottom: theme.spacing.xl,
  },
  dateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  lengthOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.xl,
  },
  lengthOption: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minWidth: 50,
    margin: 2,
  },
  lengthOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  lengthText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  lengthTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
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
  },
});