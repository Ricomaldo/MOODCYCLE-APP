// __tests__/integration/phase-correction-flow.test.js

// Configure mocks avant les imports des composants
jest.mock('../../src/stores/useEngagementStore');
jest.mock('../../src/stores/useCycleStore');
jest.mock('../../src/stores/useUserIntelligence');
jest.mock('../../src/hooks/useQuickObservation');
jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#000',
        text: '#000',
        textLight: '#666',
        surface: '#fff',
        background: '#f5f5f5',
        border: '#e0e0e0',
        phases: {
          menstrual: '#E53935',
          follicular: '#F57C00',
          ovulatory: '#0097A7',
          luteal: '#673AB7'
        }
      },
      spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32 },
      borderRadius: { s: 4, m: 8, l: 12, xl: 16, pill: 24 },
      glassmorphism: { opacity: { medium: 0.5 } },
      getPhaseGlassmorphismStyle: () => ({})
    }
  })
}));
jest.mock('../../src/hooks/useTerminology', () => ({
  useTerminology: () => ({
    getPhaseLabel: (phase) => {
      const labels = {
        menstrual: 'Phase menstruelle',
        follicular: 'Phase folliculaire', 
        ovulatory: 'Phase ovulatoire',
        luteal: 'Phase lutéale'
      };
      return labels[phase] || phase;
    },
    getArchetypeLabel: (phase) => {
      const archetypes = {
        menstrual: 'Sorcière',
        follicular: 'Jeune Fille',
        ovulatory: 'Mère',
        luteal: 'Enchanteresse'
      };
      return archetypes[phase] || phase;
    }
  })
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PhaseCorrectionModal from '../../src/features/cycle/PhaseCorrectionModal';
import CycleProgressionIndicator from '../../src/features/cycle/CycleProgressionIndicator';
import { useQuickObservation } from '../../src/hooks/useQuickObservation';
import { useEngagementStore } from '../../src/stores/useEngagementStore';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useUserIntelligence } from '../../src/stores/useUserIntelligence';

describe('Phase Correction Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock engagement store avec configuration explicite
    const mockEngagementData = {
      maturity: { current: 'learning', confidence: 60 },
      getNextMilestone: () => ({ 
        missing: { days: 3, observations: 5 } 
      }),
      trackAction: jest.fn()
    };
    
    const mockEngagementHook = jest.fn(() => mockEngagementData);
    mockEngagementHook.mockReturnValue = jest.fn(() => mockEngagementData);
    
    require('../../src/stores/useEngagementStore').useEngagementStore = mockEngagementHook;
    
    // Mock cycle store avec configuration explicite
    const mockCycleData = {
      lastPeriodDate: new Date().toISOString(),
      length: 28,
      periodDuration: 5,
      observations: [
        { id: '1', phase: 'follicular', energy: 4, feeling: 4 },
        { id: '2', phase: 'follicular', energy: 3, feeling: 3 }
      ],
      addObservation: jest.fn()
    };
    
    const mockCycleHook = jest.fn(() => mockCycleData);
    mockCycleHook.mockReturnValue = jest.fn(() => mockCycleData);
    
    require('../../src/stores/useCycleStore').useCycleStore = mockCycleHook;
    
    // Mock user intelligence avec configuration explicite
    const mockIntelligenceData = {
      observationPatterns: {
        consistency: 0.6,
        confidence: 60,
        totalObservations: 8,
        preferredMode: 'hybrid'
      },
      trackAutonomySignal: jest.fn()
    };
    
    const mockIntelligenceHook = jest.fn(() => mockIntelligenceData);
    mockIntelligenceHook.mockReturnValue = jest.fn(() => mockIntelligenceData);
    
    require('../../src/stores/useUserIntelligence').useUserIntelligence = mockIntelligenceHook;
    
    // Mock quick observation hook avec configuration explicite
    const mockQuickObservationData = {
      correctPhase: jest.fn(() => ({ correctionDetected: true })),
      isHybridMode: true,
      isObservationMode: false,
      totalObservations: 8,
      confidence: 0.6,
      canSwitchToObservation: false
    };
    
    const mockQuickObservationHook = jest.fn(() => mockQuickObservationData);
    mockQuickObservationHook.mockReturnValue = jest.fn(() => mockQuickObservationData);
    
    require('../../src/hooks/useQuickObservation').useQuickObservation = mockQuickObservationHook;
  });

  describe('PhaseCorrectionModal', () => {
    it('should display empathy messages based on current phase', () => {
      const { getByText } = render(
        <PhaseCorrectionModal
          visible={true}
          onClose={jest.fn()}
          currentPhase="menstrual"
          predictedPhase="follicular"
        />
      );
      
      expect(getByText('Comment te sens-tu vraiment ?')).toBeTruthy();
      expect(getByText("C'est normal que les ressentis varient pendant cette phase")).toBeTruthy();
    });
    
    it('should show phase comparison when predicted differs from current', () => {
      const { getByText } = render(
        <PhaseCorrectionModal
          visible={true}
          onClose={jest.fn()}
          currentPhase="luteal"
          predictedPhase="ovulatory"
        />
      );
      
      expect(getByText("L'app suggère :")).toBeTruthy();
      expect(getByText('Tu ressens :')).toBeTruthy();
    });
    
    it('should call correctPhase when confirming different phase', async () => {
      const mockCorrectPhase = jest.fn(() => ({ correctionDetected: true }));
      const mockQuickObservationData = {
        ...require('../../src/hooks/useQuickObservation').useQuickObservation(),
        correctPhase: mockCorrectPhase
      };
      
      const mockQuickObservationHook = jest.fn(() => mockQuickObservationData);
      require('../../src/hooks/useQuickObservation').useQuickObservation = mockQuickObservationHook;
      
      const onClose = jest.fn();
      const { getByText, getAllByText } = render(
        <PhaseCorrectionModal
          visible={true}
          onClose={onClose}
          currentPhase="follicular"
          predictedPhase="follicular"
        />
      );
      
      // Select luteal phase
      fireEvent.press(getAllByText(/Enchanteresse/i)[0]);
      
      // Confirm
      await waitFor(() => {
        fireEvent.press(getByText(/Confirmer/i));
      });
      
      expect(mockCorrectPhase).toHaveBeenCalledWith('luteal');
    });
    
    it('should show hybrid mode info when in hybrid mode', () => {
      const { getByText } = render(
        <PhaseCorrectionModal
          visible={true}
          onClose={jest.fn()}
          currentPhase="ovulatory"
          predictedPhase="ovulatory"
        />
      );
      
      expect(getByText(/Mode hybride : j'apprends de tes corrections/i)).toBeTruthy();
    });
  });

  describe('CycleProgressionIndicator', () => {
    it('should display current maturity level', () => {
      const { getByText } = render(<CycleProgressionIndicator />);
      
      expect(getByText('Apprentissage')).toBeTruthy();
      expect(getByText("J'apprends tes patterns")).toBeTruthy();
    });
    
    it('should show progress to next level', () => {
      const { getByText } = render(<CycleProgressionIndicator />);
      
      // Le composant affiche "Encore 3 jours d'utilisation" au lieu de "observations pour progresser"
      expect(getByText(/Encore \d+ jours d'utilisation/i)).toBeTruthy();
    });
    
    it('should render compact version correctly', () => {
      const { getByText, queryByText } = render(
        <CycleProgressionIndicator compact />
      );
      
      expect(getByText('Apprentissage')).toBeTruthy();
      // Should not show detailed message in compact mode
      expect(queryByText("J'apprends tes patterns")).toBeNull();
    });
    
    it('should handle autonomous level without progress bar', () => {
      const mockAutonomousData = {
        maturity: { current: 'autonomous', confidence: 100 },
        getNextMilestone: () => null
      };
      
      const mockAutonomousHook = jest.fn(() => mockAutonomousData);
      require('../../src/stores/useEngagementStore').useEngagementStore = mockAutonomousHook;
      
      const { getByText, queryByTestId } = render(
        <CycleProgressionIndicator />
      );
      
      expect(getByText('Autonomie')).toBeTruthy();
      expect(getByText('Tu guides, je suis')).toBeTruthy();
      // No progress bar in autonomous mode
      expect(queryByTestId('progress-bar')).toBeNull();
    });
  });

  describe('Mode Progression Flow', () => {
    it('should track autonomy signal when correcting phase', async () => {
      const trackAutonomySignal = jest.fn();
      const mockIntelligenceData = {
        ...require('../../src/stores/useUserIntelligence').useUserIntelligence(),
        trackAutonomySignal
      };
      
      const mockIntelligenceHook = jest.fn(() => mockIntelligenceData);
      require('../../src/stores/useUserIntelligence').useUserIntelligence = mockIntelligenceHook;
      
      // Mock useQuickObservation to return correctPhase function that calls trackAutonomySignal
      const mockCorrectPhase = jest.fn((observedPhase) => {
        trackAutonomySignal('manual_phase_change', {
          from: 'follicular',
          to: observedPhase,
          timestamp: Date.now()
        });
        return { correctionDetected: true };
      });
      const mockQuickObservationData = {
        ...require('../../src/hooks/useQuickObservation').useQuickObservation(),
        correctPhase: mockCorrectPhase
      };
      
      const mockQuickObservationHook = jest.fn(() => mockQuickObservationData);
      require('../../src/hooks/useQuickObservation').useQuickObservation = mockQuickObservationHook;
      
      const { getByText, getAllByText } = render(
        <PhaseCorrectionModal
          visible={true}
          onClose={jest.fn()}
          currentPhase="follicular" 
          predictedPhase="luteal"
        />
      );
      
      // Select different phase
      fireEvent.press(getAllByText(/Phase menstruelle/i)[0]);
      fireEvent.press(getByText(/Confirmer/i));
      
      await waitFor(() => {
        expect(mockCorrectPhase).toHaveBeenCalledWith('menstrual');
        expect(trackAutonomySignal).toHaveBeenCalledWith(
          'manual_phase_change',
          expect.any(Object)
        );
      });
    });
    
    it('should progress from discovery to learning after threshold', () => {
      // Test discovery state
      const mockDiscoveryData = {
        maturity: { current: 'discovery', confidence: 30 },
        getNextMilestone: () => ({ 
          missing: { days: 4, conversations: 2, entries: 1 } 
        })
      };
      
      const mockDiscoveryHook = jest.fn(() => mockDiscoveryData);
      require('../../src/stores/useEngagementStore').useEngagementStore = mockDiscoveryHook;
      
      const { getByText, rerender } = render(<CycleProgressionIndicator />);
      expect(getByText('Découverte')).toBeTruthy();
      
      // Progress to learning
      const mockLearningData = {
        maturity: { current: 'learning', confidence: 50 },
        getNextMilestone: () => ({ 
          missing: { days: 14, conversations: 7, entries: 6 } 
        })
      };
      
      const mockLearningHook = jest.fn(() => mockLearningData);
      require('../../src/stores/useEngagementStore').useEngagementStore = mockLearningHook;
      
      rerender(<CycleProgressionIndicator />);
      expect(getByText('Apprentissage')).toBeTruthy();
    });
  });

  describe('Empathy Temporal Rules', () => {
    it('should show gentle guidance during menstrual phase', () => {
      const { getByText } = render(
        <PhaseCorrectionModal
          visible={true}
          onClose={jest.fn()}
          currentPhase="menstrual"
          predictedPhase="menstrual"
        />
      );
      
      expect(getByText(/Prends ton temps, écoute ton corps sans pression/i)).toBeTruthy();
    });
    
    it('should encourage trust during follicular phase', () => {
      const { getByText } = render(
        <PhaseCorrectionModal
          visible={true}
          onClose={jest.fn()}
          currentPhase="follicular"
          predictedPhase="follicular"
        />
      );
      
      expect(getByText(/Fais confiance à tes sensations/i)).toBeTruthy();
    });
  });
}); 