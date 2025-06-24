// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/usePersona.js
// ─────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useUserStore } from '../stores/useUserStore';

export function usePersona() {
  const user = useUserStore();
  
  // ✅ Protection contre persona undefined pendant l'hydratation
  const safePersona = user.persona || {
    assigned: null,
    confidence: 0,
    lastCalculated: null,
    scores: {}
  };
  
  const calculate = useCallback(() => {
    return user.calculatePersona();
  }, [user]);

  return {
    current: safePersona.assigned,
    confidence: safePersona.confidence,
    isAssigned: !!safePersona.assigned,
    lastCalculated: safePersona.lastCalculated,
    scores: safePersona.scores,
    calculate,
    set: user.setPersona
  };
}
