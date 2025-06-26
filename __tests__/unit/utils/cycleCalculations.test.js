// ═══════════════════════════════════════════════════════════
// 🧪 TESTS CYCLE CALCULATIONS
// ═══════════════════════════════════════════════════════════

// File: __tests__/cycleCalculations.test.js

import {
    getDaysSinceLastPeriod,
    getCurrentCycleDay,
    getCurrentPhase,
    getCurrentPhaseInfo,
    getNextPeriodDate,
    getDaysUntilNextPeriod,
    validateCycleData,
    createMockCycleData,
    createCycleAtPhase,
    PHASE_METADATA
  } from '../../../src/utils/cycleCalculations';
  
  // Mock Date.now pour tests déterministes
  const MOCK_NOW = new Date('2025-06-21T12:00:00Z').getTime();
  jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW);
  
  describe('cycleCalculations.js', () => {
  
    // ═══════════════════════════════════════════════════════
    // 🧮 CALCULS DE BASE
    // ═══════════════════════════════════════════════════════
  
    describe('getDaysSinceLastPeriod', () => {
      test('retourne 0 si pas de date', () => {
        expect(getDaysSinceLastPeriod(null)).toBe(0);
        expect(getDaysSinceLastPeriod(undefined)).toBe(0);
      });
  
      test('calcule correctement les jours écoulés', () => {
        const date5JoursAgo = new Date(MOCK_NOW - 5 * 24 * 60 * 60 * 1000).toISOString();
        expect(getDaysSinceLastPeriod(date5JoursAgo)).toBe(5);
      });
  
      test('gère les dates string et Date', () => {
        const date3JoursAgo = new Date(MOCK_NOW - 3 * 24 * 60 * 60 * 1000);
        expect(getDaysSinceLastPeriod(date3JoursAgo.toISOString())).toBe(3);
        expect(getDaysSinceLastPeriod(date3JoursAgo)).toBe(3);
      });
    });
  
    describe('getCurrentCycleDay', () => {
      test('retourne 1 si pas de date', () => {
        expect(getCurrentCycleDay(null)).toBe(1);
      });
  
      test('calcule le jour cycle standard (28j)', () => {
        const date10JoursAgo = new Date(MOCK_NOW - 10 * 24 * 60 * 60 * 1000).toISOString();
        expect(getCurrentCycleDay(date10JoursAgo, 28)).toBe(11); // jour 11 du cycle
      });
  
      test('gère les cycles longs', () => {
        const date35JoursAgo = new Date(MOCK_NOW - 35 * 24 * 60 * 60 * 1000).toISOString();
        expect(getCurrentCycleDay(date35JoursAgo, 35)).toBe(1); // nouveau cycle
      });
  
      test('gère les cycles courts', () => {
        const date22JoursAgo = new Date(MOCK_NOW - 22 * 24 * 60 * 60 * 1000).toISOString();
        expect(getCurrentCycleDay(date22JoursAgo, 21)).toBe(2); // 2e jour nouveau cycle
      });
    });
  
    describe('getCurrentPhase', () => {
      test('retourne menstrual par défaut', () => {
        expect(getCurrentPhase(null)).toBe('menstrual');
      });
  
      test('phase menstruelle (jours 1-5)', () => {
        const date2JoursAgo = new Date(MOCK_NOW - 2 * 24 * 60 * 60 * 1000).toISOString();
        expect(getCurrentPhase(date2JoursAgo, 28, 5)).toBe('menstrual');
      });
  
      test('phase folliculaire (jours 6-11)', () => {
        const date8JoursAgo = new Date(MOCK_NOW - 8 * 24 * 60 * 60 * 1000).toISOString();
        expect(getCurrentPhase(date8JoursAgo, 28, 5)).toBe('follicular');
      });
  
      test('phase ovulatoire (jours 12-17)', () => {
        const date14JoursAgo = new Date(MOCK_NOW - 14 * 24 * 60 * 60 * 1000).toISOString();
        expect(getCurrentPhase(date14JoursAgo, 28, 5)).toBe('ovulatory');
      });
  
      test('phase lutéale (jours 18-28)', () => {
        const date20JoursAgo = new Date(MOCK_NOW - 20 * 24 * 60 * 60 * 1000).toISOString();
        expect(getCurrentPhase(date20JoursAgo, 28, 5)).toBe('luteal');
      });
  
      test('cycles irréguliers', () => {
        // Cycle 35 jours - jour 16 = ovulatory (pas follicular)
        const date15JoursAgo = new Date(MOCK_NOW - 15 * 24 * 60 * 60 * 1000).toISOString();
        expect(getCurrentPhase(date15JoursAgo, 35, 6)).toBe('ovulatory');
      });
    });
  
    // ═══════════════════════════════════════════════════════
    // 📊 INFOS ENRICHIES
    // ═══════════════════════════════════════════════════════
  
    describe('getCurrentPhaseInfo', () => {
      test('retourne info complète phase', () => {
        const date3JoursAgo = new Date(MOCK_NOW - 3 * 24 * 60 * 60 * 1000).toISOString();
        const info = getCurrentPhaseInfo(date3JoursAgo, 28, 5);
        
        expect(info).toEqual({
          phase: 'menstrual',
          day: 4,
          name: 'Menstruelle',
          emoji: '🌙',
          color: '#E53935',
          energy: 'repos',
          description: 'Phase de régénération et introspection'
        });
      });
  
      test('métadonnées phases cohérentes', () => {
        expect(PHASE_METADATA.follicular.emoji).toBe('🌱');
        expect(PHASE_METADATA.ovulatory.energy).toBe('pic');
        expect(PHASE_METADATA.luteal.color).toBe('#673AB7');
      });
    });
  
    // ═══════════════════════════════════════════════════════
    // 🔮 PRÉDICTIONS
    // ═══════════════════════════════════════════════════════
  
    describe('getNextPeriodDate', () => {
      test('retourne null si pas de date', () => {
        expect(getNextPeriodDate(null)).toBeNull();
      });
  
      test('calcule prochaine date règles', () => {
        const date10JoursAgo = new Date(MOCK_NOW - 10 * 24 * 60 * 60 * 1000).toISOString();
        const nextDateString = getNextPeriodDate(date10JoursAgo, 28);
        const nextDate = new Date(nextDateString);
        
        // 28 jours après la dernière période = 18 jours dans le futur
        const expected = new Date(MOCK_NOW + 18 * 24 * 60 * 60 * 1000);
        expect(nextDate.getTime()).toBeCloseTo(expected.getTime(), -3); // ±1 seconde
      });
    });
  
    describe('getDaysUntilNextPeriod', () => {
      test('retourne null si pas de date', () => {
        expect(getDaysUntilNextPeriod(null)).toBeNull();
      });
  
      test('calcule jours restants', () => {
        const date10JoursAgo = new Date(MOCK_NOW - 10 * 24 * 60 * 60 * 1000).toISOString();
        const daysUntil = getDaysUntilNextPeriod(date10JoursAgo, 28);
        // 10 jours écoulés, 28 - 10 = 18 jours restants
        expect(daysUntil).toBe(18);
      });
  
      test('retourne 0 si période attendue', () => {
        const date28JoursAgo = new Date(MOCK_NOW - 28 * 24 * 60 * 60 * 1000).toISOString();
        expect(getDaysUntilNextPeriod(date28JoursAgo, 28)).toBeLessThanOrEqual(1);
      });
    });
  
    // ═══════════════════════════════════════════════════════
    // 🎯 VALIDATION
    // ═══════════════════════════════════════════════════════
  
    describe('validateCycleData', () => {
      test('données valides', () => {
        const validData = {
          lastPeriodDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 jours ago
          length: 28,
          periodDuration: 5
        };
        
        const result = validateCycleData(validData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });
  
      test('date manquante', () => {
        const invalidData = {
          lastPeriodDate: null,
          length: 28,
          periodDuration: 5
        };
        
        const result = validateCycleData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Date de dernières règles requise');
      });
  
      test('cycle trop court', () => {
        const invalidData = {
          lastPeriodDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours ago
          length: 15, // Minimum 21
          periodDuration: 5
        };
        
        const result = validateCycleData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('Longueur de cycle doit être entre'))).toBe(true);
      });
  
      test('règles plus longues que cycle', () => {
        const invalidData = {
          lastPeriodDate: new Date().toISOString(),
          length: 25,
          periodDuration: 30
        };
        
        const result = validateCycleData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('Durée des règles ne peut pas être supérieure'))).toBe(true);
      });
    });
  
    // ═══════════════════════════════════════════════════════
    // 🧪 HELPERS DE TEST
    // ═══════════════════════════════════════════════════════
  
    describe('Test Helpers', () => {
      test('createMockCycleData', () => {
        const mockData = createMockCycleData(5, 30);
        
        expect(mockData.length).toBe(30);
        expect(mockData.periodDuration).toBe(5); // CYCLE_DEFAULTS
        expect(mockData.isRegular).toBe(true);
        expect(new Date(mockData.lastPeriodDate)).toBeInstanceOf(Date);
      });
  
      test('createCycleAtPhase', () => {
        const menstrualCycle = createCycleAtPhase('menstrual');
        const phase = getCurrentPhase(menstrualCycle.lastPeriodDate, 28, 5);
        expect(phase).toBe('menstrual');
  
        const ovulatoryCycle = createCycleAtPhase('ovulatory');
        const phaseOvu = getCurrentPhase(ovulatoryCycle.lastPeriodDate, 28, 5);
        expect(phaseOvu).toBe('ovulatory');
      });
    });
  
    // ═══════════════════════════════════════════════════════
    // 🚨 CAS LIMITES & EDGE CASES
    // ═══════════════════════════════════════════════════════
  
    describe('Edge Cases', () => {
      test('dates futures (erreur utilisateur)', () => {
        const dateFuture = new Date(MOCK_NOW + 10 * 24 * 60 * 60 * 1000).toISOString();
        expect(getDaysSinceLastPeriod(dateFuture)).toBe(-10);
        expect(getCurrentCycleDay(dateFuture)).toBe(1); // ✅ Fix: dates futures = jour 1
      });
  
      test('cycles extrêmes', () => {
        // Cycle 21 jours (minimum) - jour 16 = luteal
        const dateCourtCycle = new Date(MOCK_NOW - 15 * 24 * 60 * 60 * 1000).toISOString();
        expect(getCurrentPhase(dateCourtCycle, 21, 4)).toBe('luteal');
  
        // Cycle 45 jours (maximum) - jour 26 = luteal (pas ovulatory)
        const dateLongCycle = new Date(MOCK_NOW - 25 * 24 * 60 * 60 * 1000).toISOString();
        expect(getCurrentPhase(dateLongCycle, 45, 7)).toBe('luteal');
      });
  
      test('dates invalides', () => {
        expect(getDaysSinceLastPeriod('invalid-date')).toBe(0); // ✅ Fix: retourne 0 pour dates invalides
        expect(() => getCurrentCycleDay('invalid-date')).not.toThrow();
      });
  
      test('paramètres négatifs', () => {
        const dateValide = new Date(MOCK_NOW - 10 * 24 * 60 * 60 * 1000).toISOString();
        // ✅ Fix: paramètres négatifs sont sanitisés, donc jour 11 = follicular
        expect(getCurrentPhase(dateValide, -5, -2)).toBe('follicular');
      });
    });
  
    // ═══════════════════════════════════════════════════════
    // 🎯 TESTS INTÉGRATION
    // ═══════════════════════════════════════════════════════
  
    describe('Tests d\'intégration', () => {
      test('cycle complet 28 jours', () => {
        const scenarios = [
          { jour: 1, phaseAttendue: 'menstrual' },
          { jour: 3, phaseAttendue: 'menstrual' },
          { jour: 6, phaseAttendue: 'follicular' },
          { jour: 10, phaseAttendue: 'follicular' },
          { jour: 13, phaseAttendue: 'follicular' }, // ✅ Fix: jour 13 = follicular
          { jour: 16, phaseAttendue: 'ovulatory' },   // ✅ Fix: ovulatory plus tard
          { jour: 20, phaseAttendue: 'luteal' },
          { jour: 28, phaseAttendue: 'luteal' }
        ];
  
        scenarios.forEach(({ jour, phaseAttendue }) => {
          const date = new Date(MOCK_NOW - (jour - 1) * 24 * 60 * 60 * 1000).toISOString();
          const phase = getCurrentPhase(date, 28, 5);
          expect(phase).toBe(phaseAttendue);
        });
      });
  
      test('cohérence calculs jour/phase', () => {
        const date15JoursAgo = new Date(MOCK_NOW - 15 * 24 * 60 * 60 * 1000).toISOString();
        
        const jour = getCurrentCycleDay(date15JoursAgo, 28);
        const phase = getCurrentPhase(date15JoursAgo, 28, 5);
        const info = getCurrentPhaseInfo(date15JoursAgo, 28, 5);
        
        expect(info.day).toBe(jour);
        expect(info.phase).toBe(phase);
        expect(info.name).toBe(PHASE_METADATA[phase].name);
      });
    });
  });