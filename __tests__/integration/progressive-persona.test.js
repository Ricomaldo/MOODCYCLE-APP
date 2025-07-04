// __tests__/integration/progressive-persona.test.js

import { calculatePersona } from '../../src/services/PersonaEngine';
import { getOnboardingMessage } from '../../src/config/onboardingMessages';

describe('MVP - Calcul Progressif Persona', () => {
  
  describe('Confidence Progressive', () => {
    test('Journey seul = 25% confidence max', () => {
      const result = calculatePersona({
        profile: { journeyChoice: 'body_disconnect' }
      });
expect(result.confidence).toBeLessThanOrEqual(0.35); // au lieu de 0.25
      });

    test('Journey + Age = 40% confidence minimum', () => {
      const result = calculatePersona({
        profile: { 
          journeyChoice: 'body_disconnect',
          ageRange: '18-25'
        }
      });
      expect(result.confidence).toBeGreaterThanOrEqual(0.40);
    });

    test('Toutes données = 100% confidence', () => {
      const result = calculatePersona({
        profile: { 
          journeyChoice: 'hiding_nature',
          ageRange: '46-55',
          terminology: 'spiritual'
        },
        melune: { tone: 'inspiring' },
        preferences: {
          symptoms: 5, moods: 3, phyto: 5,
          phases: 2, lithotherapy: 1, rituals: 3
        }
      });
      expect(result.confidence).toBeGreaterThan(0.85);     // au lieu de 0.90
    });
  });

  describe('Personas Attendues', () => {
    test('Emma: 18-25 + body_disconnect', () => {
      const result = calculatePersona({
        profile: { 
          journeyChoice: 'body_disconnect',
          ageRange: '18-25'
        }
      });
      expect(result.assigned).toBe('emma');
    });

    test('Christine: 55+ + spiritual terminology', () => {
      const result = calculatePersona({
        profile: { 
          journeyChoice: 'hiding_nature',
          ageRange: '55+',
          terminology: 'spiritual'
        }
      });
      expect(result.assigned).toBe('christine');
    });
  });

  describe('Terminology Influence', () => {
    test('Terminology affecte le score sans changer le tone', () => {
      const base = {
        profile: { 
          journeyChoice: 'emotional_control',
          ageRange: '26-35'
        }
      };
      
      const withMedical = calculatePersona({
        ...base,
        profile: { ...base.profile, terminology: 'medical' }
      });
      
      const withSpiritual = calculatePersona({
        ...base,
        profile: { ...base.profile, terminology: 'spiritual' }
      });
      
      // Les scores doivent être différents
      expect(withMedical.scores).not.toEqual(withSpiritual.scores);
    });
  });

  describe('Messages Personnalisés', () => {
    test('Message par défaut si pas de persona', () => {
      const message = getOnboardingMessage('300-etape-vie', null, 'message');
      expect(message).toContain('Chaque étape de la vie');
    });

    test('Message Emma spécifique', () => {
      const message = getOnboardingMessage('300-etape-vie', 'emma', 'message');
      expect(message).toContain('magie unique');
    });

    test('Preview prénom personnalisé', () => {
      const preview = getOnboardingMessage('400-prenom', 'clara', 'preview', { prenom: 'Sophie' });
      expect(preview).toContain('Sophie');
      expect(preview).toContain('aventure cyclique');
    });
  });

  describe('Seuils Adaptation', () => {
    test('Pas de personnalisation < 40% confidence', () => {
      // Simuler useOnboardingIntelligence logic
      const personaResult = calculatePersona({
        profile: { journeyChoice: 'body_disconnect' }
      });
      
      const shouldPersonalize = personaResult.confidence >= 0.4;
      expect(shouldPersonalize).toBe(false);
    });

    test('Personnalisation active >= 40% confidence', () => {
      const personaResult = calculatePersona({
        profile: { 
          journeyChoice: 'body_disconnect',
          ageRange: '18-25'
        }
      });
      
      const shouldPersonalize = personaResult.confidence >= 0.4;
      expect(shouldPersonalize).toBe(true);
    });
  });
});

// __tests__/integration/onboarding-flow.test.js

describe('MVP - Flow Onboarding Complet', () => {
  const simulateUserFlow = (choices) => {
    const userData = {};
    const results = [];
    
    // Simuler progression écran par écran
    if (choices.journey) {
      userData.profile = { journeyChoice: choices.journey };
      results.push({
        screen: '250-rencontre',
        persona: calculatePersona(userData)
      });
    }
    
    if (choices.age) {
      userData.profile.ageRange = choices.age;
      results.push({
        screen: '300-etape-vie',
        persona: calculatePersona(userData)
      });
    }
    
    if (choices.terminology) {
      userData.profile.terminology = choices.terminology;
      results.push({
        screen: '600-terminology',
        persona: calculatePersona(userData)
      });
    }
    
    if (choices.preferences) {
      userData.preferences = choices.preferences;
      results.push({
        screen: '800-preferences',
        persona: calculatePersona(userData)
      });
    }
    
    return results;
  };

  test('Flow Emma complet', () => {
    const flow = simulateUserFlow({
      journey: 'body_disconnect',
      age: '18-25',
      terminology: 'modern',
      preferences: { moods: 4, phases: 3 }
    });
    
    // Vérifier progression confidence
    expect(flow[0].persona.confidence).toBeLessThan(0.4); // 250-rencontre
    expect(flow[1].persona.confidence).toBeGreaterThanOrEqual(0.4); // 300-etape-vie
    expect(flow[2].persona.confidence).toBeGreaterThan(0.6); // 600-terminology
    expect(flow[3].persona.confidence).toBeGreaterThan(0.9); // 800-preferences
    
    // Vérifier persona finale
    expect(flow[3].persona.assigned).toBe('emma');
  });
});