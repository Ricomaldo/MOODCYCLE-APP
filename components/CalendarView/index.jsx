import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Caption } from '../Typography';
import { useNotebookStore } from '../../stores/useNotebookStore';

export default function CalendarView({ 
  currentPhase = 'menstrual',
  cycleDay = 1,
  cycleLength = 28,
  lastPeriodDate,
  onPhasePress = () => {},
  onDatePress = () => {}
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Hook pour les entrées du carnet
  const { formatEntriesForCalendar } = useNotebookStore();
  const notebookEntries = formatEntriesForCalendar();
  
  // Navigation mensuelle
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Obtenir le mois actuel
  const today = new Date();
  
  // Calculs du calendrier
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = dimanche
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Noms des jours et mois
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  // Fonction pour calculer le jour de cycle à partir d'une date
  const getCycleDayForDate = (date) => {
    if (!lastPeriodDate) return null;
    
    const periodStart = new Date(lastPeriodDate);
    const daysDiff = Math.floor((date - periodStart) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return null; // Avant le dernier cycle
    
    return (daysDiff % cycleLength) + 1;
  };
  
  // Fonction pour obtenir la phase à partir du jour de cycle
  const getPhaseForCycleDay = (cycleDay) => {
    if (cycleDay <= 5) return 'menstrual';
    if (cycleDay <= 13) return 'follicular';
    if (cycleDay <= 16) return 'ovulatory';
    return 'luteal';
  };
  
  // Fonction pour obtenir le style d'un jour
  const getDayStyle = (date, dayNumber) => {
    const dayDate = new Date(currentYear, currentMonth, dayNumber);
    const cycleDayForDate = getCycleDayForDate(dayDate);
    
    if (!cycleDayForDate) {
      return {
        backgroundColor: 'transparent',
        opacity: 0.3,
        phase: null
      };
    }
    
    const phase = getPhaseForCycleDay(cycleDayForDate);
    const baseColor = theme.colors.phases[phase];
    
    // Opacity basée sur la position dans la phase (plus intense au centre)
    const phasePosition = getPhasePosition(cycleDayForDate);
    const opacity = 0.15 + (phasePosition * 0.4); // 0.15 à 0.55
    
    const isToday = dayDate.toDateString() === today.toDateString();
    
    return {
      backgroundColor: baseColor,
      opacity: opacity,
      borderWidth: isToday ? 2 : 0,
      borderColor: isToday ? baseColor : 'transparent',
      phase: phase
    };
  };
  
  // Calculer la position dans la phase (0 = début, 1 = pic, 0 = fin)
  const getPhasePosition = (cycleDay) => {
    const phases = [
      { start: 1, end: 5, peak: 3 },    // menstrual
      { start: 6, end: 13, peak: 10 },  // follicular  
      { start: 14, end: 16, peak: 15 }, // ovulatory
      { start: 17, end: 28, peak: 22 }  // luteal
    ];
    
    const currentPhase = phases.find(p => cycleDay >= p.start && cycleDay <= p.end);
    if (!currentPhase) return 0;
    
    const distanceFromPeak = Math.abs(cycleDay - currentPhase.peak);
    const maxDistance = Math.max(currentPhase.peak - currentPhase.start, currentPhase.end - currentPhase.peak);
    
    return Math.max(0, 1 - (distanceFromPeak / maxDistance));
  };

  // Obtenir les entrées du carnet pour une date
  const getEntriesForDate = (dayNumber) => {
    const dateString = new Date(currentYear, currentMonth, dayNumber).toISOString().split('T')[0];
    return notebookEntries[dateString] || [];
  };

  // Obtenir les indicateurs d'entrées pour un jour
  const getEntryIndicators = (entries) => {
    if (!entries.length) return [];
    
    const typeColors = {
      saved: theme.colors.primary,      // Rose pour sauvegardé
      personal: theme.colors.secondary, // Citron vert pour personnel
      tracking: theme.colors.phases.ovulatory // Bleu pour tracking
    };
    
    const uniqueTypes = [...new Set(entries.map(e => e.type))];
    return uniqueTypes.map(type => typeColors[type] || theme.colors.primary);
  };
  
  // Générer la grille des jours
  const generateCalendarDays = () => {
    const days = [];
    
    // Jours vides avant le premier jour du mois
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <Text style={[styles.dayText, styles.emptyDay]}></Text>
        </View>
      );
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStyle = getDayStyle(null, day);
      const dayDate = new Date(currentYear, currentMonth, day);
      const cycleDayForDate = getCycleDayForDate(dayDate);
      const dayEntries = getEntriesForDate(day);
      const entryIndicators = getEntryIndicators(dayEntries);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            {
              backgroundColor: dayStyle.backgroundColor,
              opacity: dayStyle.opacity,
              borderWidth: dayStyle.borderWidth,
              borderColor: dayStyle.borderColor,
            }
          ]}
          onPress={() => {
            if (dayEntries.length > 0) {
              onDatePress(dayDate.toISOString().split('T')[0], dayEntries);
            } else if (dayStyle.phase) {
              onPhasePress(dayStyle.phase);
            }
          }}
        >
          <Text style={styles.dayText}>
            {day}
          </Text>
          
          {/* Indicateurs d'entrées du carnet */}
          {entryIndicators.length > 0 && (
            <View style={styles.entryIndicatorsContainer}>
              {entryIndicators.slice(0, 3).map((color, index) => (
                <View
                  key={index}
                  style={[
                    styles.entryIndicator,
                    { backgroundColor: color }
                  ]}
                />
              ))}
              {entryIndicators.length > 3 && (
                <Text style={styles.moreIndicator}>+</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    }
    
    return days;
  };
  
  return (
    <View style={styles.container}>
      {/* Header du mois avec navigation */}
      <View style={styles.monthNavigationHeader}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.monthHeader}>
          {monthNames[currentMonth]} {currentYear}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Noms des jours */}
      <View style={styles.weekHeader}>
        {dayNames.map(day => (
          <View key={day} style={styles.weekDayCell}>
            <Caption style={styles.weekDayText}>{day}</Caption>
          </View>
        ))}
      </View>
      
      {/* Grille des jours */}
      <View style={styles.daysGrid}>
        {generateCalendarDays()}
      </View>
      
      {/* Légende */}
      <View style={styles.legend}>
        <Caption style={styles.legendText}>
          Intensité des couleurs = position dans la phase
        </Caption>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
            <Caption style={styles.legendItemText}>Sauvegardé</Caption>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.secondary }]} />
            <Caption style={styles.legendItemText}>Personnel</Caption>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.phases.ovulatory }]} />
            <Caption style={styles.legendItemText}>Tracking</Caption>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
  },
  monthNavigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  navButton: {
    padding: theme.spacing.xs,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.text,
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.s,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  weekDayText: {
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 jours
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.small,
    marginBottom: 2,
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  emptyDay: {
    color: 'transparent',
  },
  legend: {
    marginTop: theme.spacing.m,
    alignItems: 'center',
  },
  legendText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.xs,
  },
  legendItemText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  
  // Styles pour les indicateurs d'entrées
  entryIndicatorsContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 1,
  },
  moreIndicator: {
    fontSize: 8,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 1,
  },
});