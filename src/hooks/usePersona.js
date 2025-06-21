// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/usePersona.js
// ─────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useUserStore } from '../stores/useUserStore';

export function usePersona() {
  const user = useUserStore();
  
  const calculate = useCallback(() => {
    return user.calculatePersona();
  }, [user]);

  return {
    current: user.persona.assigned,
    confidence: user.persona.confidence,
    isAssigned: !!user.persona.assigned,
    lastCalculated: user.persona.lastCalculated,
    scores: user.persona.scores,
    calculate,
    set: user.setPersona
  };
}
