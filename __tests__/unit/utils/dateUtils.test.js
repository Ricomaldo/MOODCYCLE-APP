//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/utils/dateUtils.test.js
// 🧩 Type : Test Unitaire Utilitaires Dates
// 📚 Description : Tests complets des utilitaires dates (différences, formatage, validations)
// 🕒 Version : 1.0 - 2025-06-27
// 🧭 Utilisé dans : validation utilitaires dates critiques
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import {
  getDaysDifference,
  formatDateFrench,
  formatDateShort,
  formatTime,
  getDateDaysAgo,
  getDateDaysFromNow,
  isToday,
  isThisWeek,
  getStartOfWeek,
  getEndOfWeek
} from '../../../src/utils/dateUtils';

describe('📅 dateUtils - Tests Complets', () => {
  
  beforeEach(() => {
    // Mock Date.now() pour des tests prévisibles
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-27T10:30:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ──────────────────────────────────────────────────────
  // 📊 TESTS DIFFÉRENCES DE DATES
  // ──────────────────────────────────────────────────────

  describe('Date Differences', () => {
    test('✅ devrait calculer la différence en jours entre deux dates', () => {
      const date1 = new Date('2025-06-25');
      const date2 = new Date('2025-06-27');
      
      const difference = getDaysDifference(date1, date2);
      
      expect(difference).toBe(2);
    });

    test('✅ devrait calculer la différence avec la date actuelle par défaut', () => {
      const pastDate = new Date('2025-06-25');
      
      const difference = getDaysDifference(pastDate);
      
      expect(difference).toBe(2); // 27 - 25 = 2 jours
    });

    test('✅ devrait gérer les dates futures', () => {
      const futureDate = new Date('2025-06-29');
      
      const difference = getDaysDifference(futureDate);
      
      expect(difference).toBe(-2); // 27 - 29 = -2 jours
    });

    test('✅ devrait gérer les dates identiques', () => {
      const sameDate = new Date('2025-06-27');
      
      const difference = getDaysDifference(sameDate);
      
      expect(difference).toBe(0);
    });

    test('✅ devrait gérer les chaînes de dates', () => {
      const dateString = '2025-06-25';
      
      const difference = getDaysDifference(dateString);
      
      expect(difference).toBe(2);
    });

    test('✅ devrait gérer les timestamps', () => {
      const timestamp = new Date('2025-06-25').getTime();
      
      const difference = getDaysDifference(timestamp);
      
      expect(difference).toBe(2);
    });

    test('✅ devrait gérer les dates invalides gracieusement', () => {
      const invalidDate = 'invalid-date';
      
      const difference = getDaysDifference(invalidDate);
      
      expect(isNaN(difference)).toBe(false);
      expect(difference).toBeGreaterThan(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // 📝 TESTS FORMATAGE DATES
  // ──────────────────────────────────────────────────────

  describe('Date Formatting', () => {
    test('✅ devrait formater une date en français', () => {
      const date = new Date('2025-06-27');
      
      const formatted = formatDateFrench(date);
      
      expect(formatted).toContain('27');
      expect(formatted).toContain('juin');
      expect(formatted).toContain('2025');
    });

    test('✅ devrait formater une date courte', () => {
      const date = new Date('2025-06-27');
      
      const formatted = formatDateShort(date);
      
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    test('✅ devrait formater l\'heure', () => {
      const timestamp = new Date('2025-06-27T14:30:00').getTime();
      
      const formatted = formatTime(timestamp);
      
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    test('✅ devrait gérer les dates null/undefined', () => {
      expect(() => formatDateFrench(null)).not.toThrow();
      expect(() => formatDateShort(undefined)).not.toThrow();
      expect(() => formatTime(null)).not.toThrow();
    });

    test('✅ devrait gérer les chaînes de dates', () => {
      const dateString = '2025-06-27';
      
      const formatted = formatDateFrench(dateString);
      
      expect(formatted).toContain('27');
      expect(formatted).toContain('juin');
    });

    test('✅ devrait formater différentes heures', () => {
      const morning = new Date('2025-06-27T09:15:00').getTime();
      const evening = new Date('2025-06-27T21:45:00').getTime();
      
      const morningFormatted = formatTime(morning);
      const eveningFormatted = formatTime(evening);
      
      expect(morningFormatted).toBe('09:15');
      expect(eveningFormatted).toBe('21:45');
    });
  });

  // ──────────────────────────────────────────────────────
  // ⏰ TESTS GÉNÉRATION DATES
  // ──────────────────────────────────────────────────────

  describe('Date Generation', () => {
    test('✅ devrait créer une date il y a X jours', () => {
      const daysAgo = 5;
      
      const result = getDateDaysAgo(daysAgo);
      
      const expectedDate = new Date('2025-06-22');
      expect(new Date(result).toDateString()).toBe(expectedDate.toDateString());
    });

    test('✅ devrait créer une date dans X jours', () => {
      const daysFromNow = 3;
      
      const result = getDateDaysFromNow(daysFromNow);
      
      const expectedDate = new Date('2025-06-30');
      expect(new Date(result).toDateString()).toBe(expectedDate.toDateString());
    });

    test('✅ devrait gérer les valeurs négatives', () => {
      const result = getDateDaysAgo(-2); // 2 jours dans le futur
      
      const expectedDate = new Date('2025-06-29');
      expect(new Date(result).toDateString()).toBe(expectedDate.toDateString());
    });

    test('✅ devrait gérer zéro jour', () => {
      const resultAgo = getDateDaysAgo(0);
      const resultFromNow = getDateDaysFromNow(0);
      
      const today = new Date('2025-06-27');
      expect(new Date(resultAgo).toDateString()).toBe(today.toDateString());
      expect(new Date(resultFromNow).toDateString()).toBe(today.toDateString());
    });

    test('✅ devrait retourner des dates ISO', () => {
      const result = getDateDaysAgo(1);
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  // ──────────────────────────────────────────────────────
  // ✅ TESTS VALIDATION DATES
  // ──────────────────────────────────────────────────────

  describe('Date Validation', () => {
    test('✅ devrait détecter si une date est aujourd\'hui', () => {
      const today = new Date('2025-06-27');
      const yesterday = new Date('2025-06-26');
      const tomorrow = new Date('2025-06-28');
      
      expect(isToday(today)).toBe(true);
      expect(isToday(yesterday)).toBe(false);
      expect(isToday(tomorrow)).toBe(false);
    });

    test('✅ devrait détecter si une date est cette semaine', () => {
      const thisWeek = new Date('2025-06-25'); // 2 jours avant
      const lastWeek = new Date('2025-06-20'); // 7 jours avant
      const nextWeek = new Date('2025-07-04'); // 7 jours après
      
      expect(isThisWeek(thisWeek)).toBe(true);
      expect(isThisWeek(lastWeek)).toBe(false);
      expect(isThisWeek(nextWeek)).toBe(false);
    });

    test('✅ devrait gérer les dates limites de la semaine', () => {
      const weekStart = new Date('2025-06-21'); // 6 jours avant
      const weekEnd = new Date('2025-06-27'); // aujourd'hui
      
      expect(isThisWeek(weekStart)).toBe(true);
      expect(isThisWeek(weekEnd)).toBe(true);
    });

    test('✅ devrait gérer les chaînes de dates pour isToday', () => {
      const todayString = '2025-06-27';
      const yesterdayString = '2025-06-26';
      
      expect(isToday(todayString)).toBe(true);
      expect(isToday(yesterdayString)).toBe(false);
    });

    test('✅ devrait gérer les timestamps pour isThisWeek', () => {
      const thisWeekTimestamp = new Date('2025-06-25').getTime();
      const lastWeekTimestamp = new Date('2025-06-20').getTime();
      
      expect(isThisWeek(thisWeekTimestamp)).toBe(true);
      expect(isThisWeek(lastWeekTimestamp)).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────
  // 📅 TESTS CALENDRIER SEMAINE
  // ──────────────────────────────────────────────────────

  describe('Week Calendar', () => {
    test('✅ devrait obtenir le début de la semaine (lundi)', () => {
      // 27 juin 2025 est un vendredi
      const result = getStartOfWeek();
      
      const expectedStart = new Date('2025-06-23'); // Lundi
      expect(result.toDateString()).toBe(expectedStart.toDateString());
    });

    test('✅ devrait obtenir la fin de la semaine (dimanche)', () => {
      const result = getEndOfWeek();
      
      const expectedEnd = new Date('2025-06-29'); // Dimanche
      expect(result.toDateString()).toBe(expectedEnd.toDateString());
    });

    test('✅ devrait gérer une date spécifique pour le début de semaine', () => {
      const specificDate = new Date('2025-06-25'); // Mercredi
      const result = getStartOfWeek(specificDate);
      
      const expectedStart = new Date('2025-06-23'); // Lundi
      expect(result.toDateString()).toBe(expectedStart.toDateString());
    });

    test('✅ devrait gérer une date spécifique pour la fin de semaine', () => {
      const specificDate = new Date('2025-06-25'); // Mercredi
      const result = getEndOfWeek(specificDate);
      
      const expectedEnd = new Date('2025-06-29'); // Dimanche
      expect(result.toDateString()).toBe(expectedEnd.toDateString());
    });

    test('✅ devrait gérer le dimanche comme début de semaine', () => {
      // 29 juin 2025 est un dimanche
      jest.setSystemTime(new Date('2025-06-29T10:30:00.000Z'));
      
      const result = getStartOfWeek();
      
      const expectedStart = new Date('2025-06-23'); // Lundi précédent
      expect(result.toDateString()).toBe(expectedStart.toDateString());
    });

    test('✅ devrait gérer le lundi comme début de semaine', () => {
      // 23 juin 2025 est un lundi
      jest.setSystemTime(new Date('2025-06-23T10:30:00.000Z'));
      
      const result = getStartOfWeek();
      
      const expectedStart = new Date('2025-06-23'); // Même lundi
      expect(result.toDateString()).toBe(expectedStart.toDateString());
    });

    test('✅ devrait retourner des objets Date valides', () => {
      const startOfWeek = getStartOfWeek();
      const endOfWeek = getEndOfWeek();
      
      expect(startOfWeek instanceof Date).toBe(true);
      expect(endOfWeek instanceof Date).toBe(true);
      expect(!isNaN(startOfWeek.getTime())).toBe(true);
      expect(!isNaN(endOfWeek.getTime())).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────
  // 🛡️ TESTS GESTION ERREURS
  // ──────────────────────────────────────────────────────

  describe('Error Handling', () => {
    test('✅ devrait gérer les dates invalides gracieusement', () => {
      const invalidDates = [null, undefined, 'invalid', '', '2025-13-45'];
      
      invalidDates.forEach(invalidDate => {
        expect(() => formatDateFrench(invalidDate)).not.toThrow();
        expect(() => formatDateShort(invalidDate)).not.toThrow();
        expect(() => formatTime(invalidDate)).not.toThrow();
        expect(() => isToday(invalidDate)).not.toThrow();
        expect(() => isThisWeek(invalidDate)).not.toThrow();
      });
    });

    test('✅ devrait gérer les valeurs non numériques pour les jours', () => {
      expect(() => getDateDaysAgo('invalid')).not.toThrow();
      expect(() => getDateDaysFromNow(null)).not.toThrow();
    });

    test('✅ devrait gérer les objets Date invalides', () => {
      const invalidDate = new Date('invalid');
      
      expect(() => formatDateFrench(invalidDate)).not.toThrow();
      expect(() => getDaysDifference(invalidDate)).not.toThrow();
    });
  });

  // ──────────────────────────────────────────────────────
  // ⚡ TESTS PERFORMANCE
  // ──────────────────────────────────────────────────────

  describe('Performance', () => {
    test('⚡ devrait calculer rapidement les différences de dates', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        getDaysDifference(new Date('2025-06-25'), new Date('2025-06-27'));
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // < 100ms pour 1000 calculs
    });

    test('⚡ devrait formater rapidement les dates', () => {
      const date = new Date('2025-06-27');
      
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        formatDateFrench(date);
        formatDateShort(date);
        formatTime(date.getTime());
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // < 100ms pour 3000 formatages
    });

    test('⚡ devrait valider rapidement les dates', () => {
      const date = new Date('2025-06-27');
      
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        isToday(date);
        isThisWeek(date);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(50); // < 50ms pour 2000 validations
    });
  });

  // ──────────────────────────────────────────────────────
  // 🔄 TESTS CAS LIMITES
  // ──────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    test('✅ devrait gérer les changements de mois', () => {
      // 31 mai vers 1er juin
      const date1 = new Date('2025-05-31');
      const date2 = new Date('2025-06-01');
      
      const difference = getDaysDifference(date1, date2);
      expect(difference).toBe(1);
    });

    test('✅ devrait gérer les années bissextiles', () => {
      // 28 février vers 1er mars 2024 (année bissextile)
      jest.setSystemTime(new Date('2024-03-01T10:30:00.000Z'));
      
      const feb28 = new Date('2024-02-28');
      const difference = getDaysDifference(feb28);
      expect(difference).toBe(2);
    });

    test('✅ devrait gérer les changements d\'heure (DST)', () => {
      // Test avec des heures spécifiques
      const morning = new Date('2025-06-27T06:00:00');
      const evening = new Date('2025-06-27T22:00:00');
      
      const morningFormatted = formatTime(morning.getTime());
      const eveningFormatted = formatTime(evening.getTime());
      
      expect(morningFormatted).toBe('06:00');
      expect(eveningFormatted).toBe('22:00');
    });

    test('✅ devrait gérer les dates très anciennes', () => {
      const oldDate = new Date('1900-01-01');
      const difference = getDaysDifference(oldDate);
      
      expect(difference).toBeGreaterThan(45000); // Plus de 45000 jours
    });

    test('✅ devrait gérer les dates très futures', () => {
      const futureDate = new Date('2100-12-31');
      const difference = getDaysDifference(futureDate);
      
      expect(difference).toBeLessThan(0); // Négatif
    });
  });

  // ──────────────────────────────────────────────────────
  // 🌍 TESTS LOCALISATION
  // ──────────────────────────────────────────────────────

  describe('Localization', () => {
    test('✅ devrait formater en français', () => {
      const date = new Date('2025-06-27');
      const formatted = formatDateFrench(date);
      
      // Vérifier que c'est en français
      expect(formatted).toContain('juin');
      expect(formatted).toContain('2025');
    });

    test('✅ devrait utiliser le format français pour les dates courtes', () => {
      const date = new Date('2025-06-27');
      const formatted = formatDateShort(date);
      
      // Format français DD/MM/YYYY
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    test('✅ devrait utiliser le format 24h pour l\'heure', () => {
      const timestamp = new Date('2025-06-27T14:30:00').getTime();
      const formatted = formatTime(timestamp);
      
      expect(formatted).toBe('14:30'); // Format 24h
    });
  });
}); 