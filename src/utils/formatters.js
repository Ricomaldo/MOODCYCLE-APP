/**
 * 📝 FORMATAGE SIMPLE DONNÉES
 */

import { getCurrentPhase } from './cycleCalculations';

export const formatUserProfile = (user) => ({
    prenom: user.profile?.prenom,
    age: user.profile?.ageRange,
    phase: getCurrentPhase(user.cycle?.lastPeriodDate, user.cycle?.length, user.cycle?.periodDuration),
    persona: user.persona?.assigned
  });
  
  export const formatPreferences = (preferences) => 
    Object.entries(preferences)
      .filter(([, val]) => val >= 4)
      .map(([key]) => key);
  
  export const formatPhaseInfo = (phaseInfo) => ({
    name: phaseInfo.name,
    emoji: getPhaseEmoji(phaseInfo.phase),
    color: phaseInfo.color,
    day: `Jour ${phaseInfo.day}`
  });
  
  export const formatPersonaName = (persona) => {
    const names = {
      emma: 'Emma',
      laure: 'Laure', 
      sylvie: 'Sylvie',
      christine: 'Christine',
      clara: 'Clara'
    };
    return names[persona] || 'Melune';
  };
  
  function getPhaseEmoji(phase) {
    const emojis = {
      menstrual: '🌙',
      follicular: '🌱',
      ovulatory: '☀️',
      luteal: '🍂'
    };
    return emojis[phase] || '✨';
  }