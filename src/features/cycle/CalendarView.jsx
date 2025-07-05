//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/cycle/CalendarView.jsx
// 🧩 Type: Composant Vue
// 📚 Description: Vue calendrier du cycle menstruel et des entrées carnet
// 🕒 Version: 4.0 - 2025-06-21
// 🧭 Used in: CycleView, NotebookView
// ─────────────────────────────────────────────────────────
//
import { useState, useMemo, memo, useRef, useEffect, Profiler } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Caption } from '../../core/ui/typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { getCurrentPhase, getCurrentCycleDay } from '../../utils/cycleCalculations';
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
  onPhasePress = () => {},
  onDatePress = () => {},
}) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // ✅ Render counter for profiling
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current++;
    if (__DEV__) {
      console.info('🔄 Calendar render #', renderCount.current);
    }
  });

  // ✅ Hooks - utiliser les vraies données du store
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const currentDay = getCurrentCycleDay(cycleData.lastPeriodDate, cycleData.length);
  const cycle = cycleData;
  const { getEntriesGroupedByDate } = useNotebookStore();
  const notebookEntries = getEntriesGroupedByDate();
  
  // ✅ Use memoized calculations avec les vraies données
  const phaseCalcs = usePhaseCalculations(cycle.lastPeriodDate, cycle.length);

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
          <Text style={[
            styles.dayText, 
            dayStyle.phase && { color: theme.getTextColorOnPhase(dayStyle.phase) }
          ]}>{day}</Text>
          {entryIndicators.length > 0 && (
            <View style={styles.entryIndicatorsContainer}>
              {entryIndicators.slice(0, 3).map((color, index) => (
                <View key={index} style={[styles.entryIndicator, { backgroundColor: color }]} />
              ))}
              {entryIndicators.length > 3 && (
                <Text style={[
                  styles.moreIndicator,
                  dayStyle.phase && { color: theme.getTextColorOnPhase(dayStyle.phase) }
                ]}>+</Text>
              )}
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
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Feather name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.monthYear}>
          {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
          })}
        </Text>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Feather name="chevron-right" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Week days */}
      <View style={styles.weekDays}>
        {CALENDAR_CONSTANTS.DAYS_OF_WEEK.map((day) => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      {/* Memoized calendar grid */}
      <View style={styles.calendarGrid}>{calendarDays}</View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.phases.menstrual }]} />
          <Caption style={styles.legendText}>Règles</Caption>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.phases.follicular }]} />
          <Caption style={styles.legendText}>Folliculaire</Caption>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.phases.ovulatory }]} />
          <Caption style={styles.legendText}>Ovulation</Caption>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.phases.luteal }]} />
          <Caption style={styles.legendText}>Lutéale</Caption>
        </View>
      </View>
    </View>
  );
});

// ✅ Profiler wrapper for development monitoring
function ProfiledCalendarView(props) {
  const onRenderCallback = (id, phase, actualDuration) => {
    if (__DEV__ && actualDuration > 100) {
      console.info(`📊 Calendar ${phase}:`, {
        id,
        phase,
        duration: actualDuration.toFixed(1) + 'ms',
        performance: actualDuration > 16 ? '🐌 slow' : '⚡ fast'
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

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface + '50',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 8,
    margin: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  emptyDay: {
    opacity: 0,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
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
    marginLeft: 1,
  },
});
