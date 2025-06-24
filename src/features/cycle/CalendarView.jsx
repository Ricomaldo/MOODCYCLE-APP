//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/cycle/CalendarView.jsx
// 🧩 Type : Composant Vue Cycle - OPTIMISÉ
// 📚 Description : Vue calendrier du cycle menstruel et des entrées carnet
// 🕒 Version : 4.0 - 2025-06-21 - OPTIMISATIONS PERFORMANCE
// 🧭 Utilisé dans : CycleView, NotebookView
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { useState, useMemo, memo, useRef, useEffect, Profiler } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Caption } from '../../core/ui/Typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useCycle } from '../../hooks/useCycle';
import { 
  CALENDAR_CONSTANTS, 
  CALENDAR_STYLES, 
  getPhaseFromCycleDay, 
  getPhasePosition 
} from '../../config/cycleConstants';

// ✅ 1. Memoize phase calculations
const usePhaseCalculations = (lastPeriodDate, cycleLength) => {
  return useMemo(() => {
    if (!lastPeriodDate) return null;
    
    const periodStart = new Date(lastPeriodDate);
    const phaseRanges = [];
    
    // Pre-calculate all phase boundaries for the month
    for (let i = 0; i < 45; i++) { // Cover ~1.5 cycles
      const dayInCycle = (i % cycleLength) + 1;
      const phase = getPhaseFromCycleDay(dayInCycle);
      phaseRanges.push({ day: i, phase, cycleDay: dayInCycle });
    }
    
    return { periodStart, phaseRanges };
  }, [lastPeriodDate, cycleLength]);
};

// ✅ 2. Memoize calendar days generation
const CalendarView = memo(function CalendarView({
  currentPhase = 'menstrual',
  cycleDay = 1,
  cycleLength = 28,
  lastPeriodDate,
  onPhasePress = () => {},
  onDatePress = () => {},
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // ✅ Render counter for profiling
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current++;
    if (__DEV__) {
      console.log('🔄 Calendar render #', renderCount.current);
    }
  });

  // Hooks
  const { getEntriesGroupedByDate } = useNotebookStore();
  const notebookEntries = getEntriesGroupedByDate();
  
  // ✅ Use memoized calculations
  const phaseCalcs = usePhaseCalculations(lastPeriodDate, cycleLength);

  // ✅ Memoize static indicators function
  const getEntryIndicators = useMemo(() => (entries) => {
    if (!entries.length) return [];
    const typeColors = {
      saved: theme.colors.primary,
      personal: theme.colors.secondary,
      tracking: theme.colors.phases.ovulatory,
    };
    const uniqueTypes = [...new Set(entries.map((e) => e.type))];
    return uniqueTypes.map((type) => typeColors[type] || theme.colors.primary);
  }, []);

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

  // ✅ 3. Memoize calendar grid
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();

    // Empty cells before first day
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <Text style={[styles.dayText, styles.emptyDay]}></Text>
        </View>
      );
    }

    // Optimize: batch DOM operations
    const dayElements = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentYear, currentMonth, day);
      const dateString = dayDate.toISOString().split('T')[0];
      
      // ✅ Use pre-calculated phase data
      let dayStyle = { backgroundColor: 'transparent', opacity: 0.3 };
      let cycleDayForDate = null;
      
      if (phaseCalcs) {
        const daysSince = Math.floor((dayDate - phaseCalcs.periodStart) / (1000 * 60 * 60 * 24));
        if (daysSince >= 0 && daysSince < phaseCalcs.phaseRanges.length) {
          const phaseData = phaseCalcs.phaseRanges[daysSince];
          cycleDayForDate = phaseData.cycleDay;
          const phase = phaseData.phase;
          const baseColor = theme.colors.phases[phase];
          const phasePosition = getPhasePosition(cycleDayForDate);
          const opacity = CALENDAR_STYLES.PHASE_OPACITY.MIN + 
            phasePosition * CALENDAR_STYLES.PHASE_OPACITY.MULTIPLIER;
          
          dayStyle = {
            backgroundColor: baseColor,
            opacity: opacity,
            phase: phase,
          };
        }
      }

      const isToday = dayDate.toDateString() === today.toDateString();
      const dayEntries = notebookEntries[dateString] || [];
      const entryIndicators = getEntryIndicators(dayEntries);

      dayElements.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            {
              backgroundColor: dayStyle.backgroundColor,
              opacity: dayStyle.opacity,
              borderWidth: isToday ? 2 : 0,
              borderColor: isToday ? dayStyle.backgroundColor : 'transparent',
            },
          ]}
          onPress={() => {
            if (dayEntries.length > 0) {
              onDatePress(dateString, dayEntries);
            } else if (dayStyle.phase) {
              onPhasePress(dayStyle.phase);
            }
          }}
        >
          <Text style={styles.dayText}>{day}</Text>
          {entryIndicators.length > 0 && (
            <View style={styles.entryIndicatorsContainer}>
              {entryIndicators.slice(0, 3).map((color, index) => (
                <View key={index} style={[styles.entryIndicator, { backgroundColor: color }]} />
              ))}
              {entryIndicators.length > 3 && <Text style={styles.moreIndicator}>+</Text>}
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return [...days, ...dayElements];
  }, [currentMonth, currentYear, phaseCalcs, notebookEntries, onPhasePress, onDatePress]);

  return (
    <View style={styles.container}>
      {/* Header du mois avec navigation */}
      <View style={styles.monthNavigationHeader}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton} testID="nav-prev">
          <Feather name="chevron-left" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <Text style={styles.monthHeader}>
          {CALENDAR_CONSTANTS.MONTHS[currentMonth]} {currentYear}
        </Text>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton} testID="nav-next">
          <Feather name="chevron-right" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Week days */}
      <View style={styles.weekHeader}>
        {CALENDAR_CONSTANTS.DAYS_OF_WEEK.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Caption style={styles.weekDayText}>{day}</Caption>
          </View>
        ))}
      </View>

      {/* Memoized calendar grid */}
      <View style={styles.daysGrid}>{calendarDays}</View>

      {/* Legend */}
      <View style={styles.legend}>
        <Caption style={styles.legendText}>Intensité des couleurs = position dans la phase</Caption>
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
});

// ✅ Profiler wrapper for development monitoring
function ProfiledCalendarView(props) {
  const onRenderCallback = (id, phase, actualDuration) => {
    if (__DEV__) {
      console.log(`📊 Calendar ${phase}:`, {
        duration: actualDuration.toFixed(2) + 'ms',
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <Profiler id="CalendarView" onRender={onRenderCallback}>
      <CalendarView {...props} />
    </Profiler>
  );
}

export default ProfiledCalendarView;

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
