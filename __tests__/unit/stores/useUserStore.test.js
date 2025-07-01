// __tests__/unit/stores/useUserStore.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useUserStore } from '../../../src/stores/useUserStore';

// Mock PersonaEngine
jest.mock('../../../src/services/PersonaEngine', () => ({
  calculatePersona: jest.fn(() => ({
    assigned: 'laure',
    confidence: 0.85,
    scores: { emma: 0.2, laure: 0.85, sylvie: 0.1 }
  }))
}));

describe('useUserStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useUserStore());
    act(() => result.current.reset());
  });

  test('updateProfile modifie correctement le profil', () => {
    const { result } = renderHook(() => useUserStore());
    
    act(() => {
      result.current.updateProfile({ 
        prenom: 'Sophie',
        ageRange: '26-35'
      });
    });

    expect(result.current.profile.prenom).toBe('Sophie');
    expect(result.current.profile.ageRange).toBe('26-35');
  });

  test('calculatePersona met à jour le persona', () => {
    const { result } = renderHook(() => useUserStore());
    
    act(() => {
      result.current.updateProfile({ ageRange: '26-35' });
      result.current.updatePreferences({ symptoms: 5, moods: 4 });
      result.current.calculatePersona();
    });

    expect(result.current.persona.assigned).toBe('laure');
    expect(result.current.persona.confidence).toBe(0.85);
  });

  test('hasMinimumData valide les données requises', () => {
    const { result } = renderHook(() => useUserStore());
    
    expect(result.current.hasMinimumData()).toBe(false);
    
    act(() => {
      result.current.updateProfile({ 
        ageRange: '26-35',
        journeyChoice: 'emotions'
      });
    });

    expect(result.current.hasMinimumData()).toBe(true);
  });

  test('getContextForAPI retourne le bon format', () => {
    const { result } = renderHook(() => useUserStore());
    
    act(() => {
      result.current.updateProfile({ prenom: 'Emma' });
      result.current.setPersona('clara', 0.9);
    });

    const context = result.current.getContextForAPI();
    expect(context).toEqual({
      persona: 'clara',
      preferences: expect.any(Object),
      profile: expect.objectContaining({ prenom: 'Emma' })
    });
  });

  test('reset réinitialise toutes les données', () => {
    const { result } = renderHook(() => useUserStore());
    
    act(() => {
      result.current.updateProfile({ prenom: 'Test' });
      result.current.updateMelune({ tone: 'professional' });
      result.current.reset();
    });

    expect(result.current.profile.prenom).toBeNull();
    expect(result.current.melune.tone).toBe('friendly');
    expect(result.current.preferences.terminology).toBe('medical');
  });
});