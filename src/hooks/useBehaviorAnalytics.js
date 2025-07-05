//
// ─────────────────────────────────────────────────────────
// 📄 File: src/hooks/useBehaviorAnalytics.js
// 🧩 Type: Custom Hook
// 📚 Description: Hook pour utiliser BehaviorAnalyticsService
// 🕒 Version: 1.0 - 2025-01-15
// 🧭 Used in: Components pour tracker behavior
// ─────────────────────────────────────────────────────────
//

import { useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import behaviorAnalytics from '../services/BehaviorAnalyticsService';

/**
 * Hook pour tracker les comportements utilisateur
 */
export function useBehaviorAnalytics() {
  
  // Méthodes de tracking
  const trackInteraction = useCallback((type, data) => {
    behaviorAnalytics.trackInteraction(type, data);
  }, []);

  const trackButtonPress = useCallback((buttonId, context) => {
    behaviorAnalytics.trackButtonPress(buttonId, context);
  }, []);

  const trackModalInteraction = useCallback((modalId, action, data) => {
    behaviorAnalytics.trackModalInteraction(modalId, action, data);
  }, []);

  const trackTextInput = useCallback((inputId, inputData) => {
    behaviorAnalytics.trackTextInput(inputId, inputData);
  }, []);

  const trackCardInteraction = useCallback((cardId, action, cardData) => {
    behaviorAnalytics.trackCardInteraction(cardId, action, cardData);
  }, []);

  const trackGesture = useCallback((gestureType, gestureData) => {
    behaviorAnalytics.trackGesture(gestureType, gestureData);
  }, []);

  const trackUserError = useCallback((errorType, errorData) => {
    behaviorAnalytics.trackUserError(errorType, errorData);
  }, []);

  const trackScroll = useCallback((screenName, scrollData) => {
    behaviorAnalytics.trackScroll(screenName, scrollData);
  }, []);

  // Méthodes d'analyse
  const analyzePatterns = useCallback(() => {
    return behaviorAnalytics.analyzePatterns();
  }, []);

  const getStats = useCallback(() => {
    return behaviorAnalytics.getStats();
  }, []);

  const getSyncData = useCallback(() => {
    return behaviorAnalytics.getSyncData();
  }, []);

  return {
    // Méthodes de tracking
    trackInteraction,
    trackButtonPress,
    trackModalInteraction,
    trackTextInput,
    trackCardInteraction,
    trackGesture,
    trackUserError,
    trackScroll,
    
    // Méthodes d'analyse
    analyzePatterns,
    getStats,
    getSyncData
  };
}

/**
 * Hook pour tracker automatiquement la navigation d'écran
 */
export function useScreenTracking(screenName, screenParams = {}) {
  const screenStartTime = useRef(null);

  useFocusEffect(
    useCallback(() => {
      // Entrée sur l'écran
      screenStartTime.current = Date.now();
      behaviorAnalytics.trackNavigation(screenName, screenParams);

      return () => {
        // Sortie de l'écran
        if (screenStartTime.current) {
          const duration = Date.now() - screenStartTime.current;
          behaviorAnalytics.trackInteraction('screen_exit', {
            screen: screenName,
            duration,
            exitType: 'navigation'
          });
        }
      };
    }, [screenName, screenParams])
  );
}

/**
 * Hook pour tracker les interactions avec les boutons
 */
export function useButtonTracking() {
  const trackPress = useCallback((buttonId, context = {}) => {
    behaviorAnalytics.trackButtonPress(buttonId, context);
  }, []);

  const trackLongPress = useCallback((buttonId, context = {}) => {
    behaviorAnalytics.trackInteraction('button_long_press', {
      buttonId,
      context,
      pressType: 'long_press'
    });
  }, []);

  return { trackPress, trackLongPress };
}

/**
 * Hook pour tracker les modales
 */
export function useModalTracking(modalId) {
  const trackOpen = useCallback((data = {}) => {
    behaviorAnalytics.trackModalInteraction(modalId, 'open', data);
  }, [modalId]);

  const trackClose = useCallback((data = {}) => {
    behaviorAnalytics.trackModalInteraction(modalId, 'close', data);
  }, [modalId]);

  const trackInteract = useCallback((data = {}) => {
    behaviorAnalytics.trackModalInteraction(modalId, 'interact', data);
  }, [modalId]);

  return { trackOpen, trackClose, trackInteract };
}

/**
 * Hook pour tracker les saisies de texte
 */
export function useTextInputTracking() {
  const trackInput = useCallback((inputId, text, inputType = 'text') => {
    behaviorAnalytics.trackTextInput(inputId, {
      text,
      type: inputType
    });
  }, []);

  const trackFocus = useCallback((inputId) => {
    behaviorAnalytics.trackInteraction('text_input_focus', {
      inputId,
      focusType: 'focus'
    });
  }, []);

  const trackBlur = useCallback((inputId, text) => {
    behaviorAnalytics.trackInteraction('text_input_blur', {
      inputId,
      textLength: text?.length || 0,
      focusType: 'blur'
    });
  }, []);

  return { trackInput, trackFocus, trackBlur };
}

/**
 * Hook pour tracker les interactions avec les cartes
 */
export function useCardTracking() {
  const trackTap = useCallback((cardId, cardData = {}) => {
    behaviorAnalytics.trackCardInteraction(cardId, 'tap', cardData);
  }, []);

  const trackSwipe = useCallback((cardId, direction, cardData = {}) => {
    behaviorAnalytics.trackCardInteraction(cardId, 'swipe', {
      ...cardData,
      direction
    });
  }, []);

  const trackSave = useCallback((cardId, cardData = {}) => {
    behaviorAnalytics.trackCardInteraction(cardId, 'save', cardData);
  }, []);

  const trackShare = useCallback((cardId, cardData = {}) => {
    behaviorAnalytics.trackCardInteraction(cardId, 'share', cardData);
  }, []);

  return { trackTap, trackSwipe, trackSave, trackShare };
}

/**
 * Hook pour tracker les gestes
 */
export function useGestureTracking() {
  const trackSwipe = useCallback((direction, velocity, distance, duration) => {
    behaviorAnalytics.trackGesture('swipe', {
      direction,
      velocity,
      distance,
      duration
    });
  }, []);

  const trackPinch = useCallback((scale, velocity, duration) => {
    behaviorAnalytics.trackGesture('pinch', {
      scale,
      velocity,
      duration
    });
  }, []);

  const trackLongPress = useCallback((duration, position) => {
    behaviorAnalytics.trackGesture('long_press', {
      duration,
      position
    });
  }, []);

  return { trackSwipe, trackPinch, trackLongPress };
}

/**
 * Hook pour tracker les erreurs utilisateur
 */
export function useErrorTracking() {
  const trackValidationError = useCallback((field, message, context = {}) => {
    behaviorAnalytics.trackUserError('validation', {
      field,
      message,
      context
    });
  }, []);

  const trackNetworkError = useCallback((endpoint, message, context = {}) => {
    behaviorAnalytics.trackUserError('network', {
      endpoint,
      message,
      context
    });
  }, []);

  const trackInputError = useCallback((inputId, message, context = {}) => {
    behaviorAnalytics.trackUserError('input', {
      inputId,
      message,
      context
    });
  }, []);

  return { trackValidationError, trackNetworkError, trackInputError };
}

/**
 * Hook pour tracker le scroll
 */
export function useScrollTracking(screenName) {
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  const trackScroll = useCallback((event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastScrollTime.current;
    const yDiff = contentOffset.y - lastScrollY.current;
    
    // Calculer la direction et la vélocité
    const direction = yDiff > 0 ? 'down' : 'up';
    const velocity = Math.abs(yDiff) / (timeDiff || 1);
    const percentage = (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;

    behaviorAnalytics.trackScroll(screenName, {
      y: contentOffset.y,
      direction,
      velocity,
      contentHeight: contentSize.height,
      percentage: Math.max(0, Math.min(100, percentage))
    });

    lastScrollY.current = contentOffset.y;
    lastScrollTime.current = currentTime;
  }, [screenName]);

  return { trackScroll };
}

export default useBehaviorAnalytics; 