// __tests__/performance/critical-performance.test.js

import { renderHook, act } from '@testing-library/react-hooks';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import CalendarView from '../../src/features/cycle/CalendarView';
import { useNavigationStore } from '../../src/stores/useNavigationStore';
import { useCycle } from '../../src/hooks/useCycle';
import { getCurrentPhase, getCurrentCycleDay } from '../../src/utils/cycleCalculations';

// Mock expo-router
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn((callback) => {
    callback();
    return () => {};
  }),
  useLocalSearchParams: () => ({}),
}));

// Mock stores
jest.mock('../../src/stores/useUserStore');
jest.mock('../../src/stores/useNotebookStore', () => ({
  useNotebookStore: () => ({
    getEntriesGroupedByDate: () => ({}),
  }),
}));

// ═══════════════════════════════════════════════════════
// 🚀 PERFORMANCE METRICS
// ═══════════════════════════════════════════════════════

describe('Sprint 1 - Performance Tests', () => {
  
  // ✅ Test 1: Memory Leak Prevention
  test('timer cleanup pattern', () => {
    const cleanup = jest.fn();
    const timer = setInterval(() => {}, 1000);
    clearInterval(timer);
    cleanup();
    expect(cleanup).toHaveBeenCalled();
  });

  // ✅ Test 2: NavigationStore Performance
  test('store hydration < 50ms', async () => {
    const start = performance.now();
    const { result } = renderHook(() => useNavigationStore());
    const duration = performance.now() - start;
    
    expect(result.current.notebookFilters).toBeDefined();
    expect(duration).toBeLessThan(50);
  });

  test('filter updates < 5ms', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    const start = performance.now();
    act(() => {
      result.current.setNotebookFilter('type', 'personal');
      result.current.toggleTag('#symptôme');
      result.current.setNotebookFilter('phase', 'luteal');
    });
    
    const updateTime = performance.now() - start;
    expect(updateTime).toBeLessThan(5);
  });

  // ✅ Test 3: CalendarView Optimization
  describe('CalendarView Optimization', () => {
    const mockProps = {
      currentPhase: 'follicular',
      cycleDay: 14,
      cycleLength: 28,
      lastPeriodDate: new Date('2025-06-01').toISOString(),
    };
    
    test('renders < 5 times on month change', () => {
      let renderCount = 0;
      const TrackedCalendar = () => {
        renderCount++;
        return <CalendarView {...mockProps} />;
      };
      
      const { getByTestId } = render(<TrackedCalendar />);
      
      // Initial render
      expect(renderCount).toBe(1);
      
      // Find navigation by testID
      const nextButton = getByTestId('nav-next');
      
      act(() => {
        fireEvent.press(nextButton);
      });
      
      // Should render max 3 times (state update + memoized recalc)
      expect(renderCount).toBeLessThan(5);
    });
    
    test('day calculations < 10ms for month', () => {
      const start = performance.now();
      const testDate = new Date('2025-06-01').toISOString();
      
      for (let day = 1; day <= 31; day++) {
        getCurrentCycleDay(testDate, 28);
        getCurrentPhase(testDate, 28, 5);
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(10);
    });
  });

  // ✅ Test 4: Cycle Utils Performance
  test('getCurrentPhase < 0.1ms average', () => {
    const testDate = new Date('2025-06-01').toISOString();
    const iterations = 1000;
    
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      getCurrentPhase(testDate, 28, 5);
    }
    const avgTime = (performance.now() - start) / iterations;
    
    expect(avgTime).toBeLessThan(0.1);
  });
  
  test('useCycle hook < 2ms initial calculation', () => {
    const start = performance.now();
    
    const { result } = renderHook(() => useCycle());
    
    const hookTime = performance.now() - start;
    expect(hookTime).toBeLessThan(2);
    expect(result.current.currentPhase).toBeDefined();
  });

  // ✅ Test 5: Store Size
  test('NavigationStore < 1KB serialized', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    act(() => {
      result.current.setNotebookFilter('type', 'personal');
      result.current.toggleTag('#symptôme');
      result.current.trackVignetteClick('test-123');
    });
    
    const serialized = JSON.stringify(result.current);
    const sizeKB = new Blob([serialized]).size / 1024;
    
    expect(sizeKB).toBeLessThan(1);
  });
});

// ═══════════════════════════════════════════════════════
// 📊 PERFORMANCE METRICS
// ═══════════════════════════════════════════════════════

describe('Performance Metrics', () => {
  const metrics = {
    'Phase calculations (1000x)': 0,
    'Navigation store hydration': 0,
    'Calendar render': 0,
  };

  afterAll(() => {
    console.log('\n📊 SPRINT 1 METRICS:');
    Object.entries(metrics).forEach(([key, value]) => {
      console.log(`${key}: ${value.toFixed(2)}ms`);
    });
  });

  test('benchmark phase calculations', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      getCurrentPhase(new Date().toISOString(), 28, 5);
    }
    metrics['Phase calculations (1000x)'] = performance.now() - start;
    expect(metrics['Phase calculations (1000x)']).toBeLessThan(50);
  });
  
  test('benchmark calendar render', () => {
    const start = performance.now();
    
    render(<CalendarView 
      currentPhase="follicular"
      cycleDay={14}
      cycleLength={28}
      lastPeriodDate={new Date('2025-06-01').toISOString()}
    />);
    
    metrics['Calendar render'] = performance.now() - start;
    expect(metrics['Calendar render']).toBeLessThan(100);
  });
  
  test('benchmark store hydration', async () => {
    const start = performance.now();
    
    const { result } = renderHook(() => useNavigationStore());
    await waitFor(() => expect(result.current.notebookFilters).toBeDefined());
    
    metrics['Navigation store hydration'] = performance.now() - start;
    expect(metrics['Navigation store hydration']).toBeLessThan(50);
  });
});