// services/VignettesService.js - CORRIGÉ
import AsyncStorage from '@react-native-async-storage/async-storage';
import ContentManager from './ContentManager';

const CACHE_KEY = 'vignettes_cache_v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Données fallback intégrées
const FALLBACK_VIGNETTES = {
  menstrual: {
    emma: [
      { id: 'men_emma_1', icon: '💭', title: 'Explore tes ressentis', action: 'chat', prompt: 'Comment te sens-tu aujourd\'hui ?' },
      { id: 'men_emma_2', icon: '✍️', title: 'Note tes pensées', action: 'notebook', prompt: 'Qu\'est-ce qui te préoccupe ?' },
      { id: 'men_emma_3', icon: '🌙', title: 'Découvre ta phase', action: 'phase_detail', prompt: null }
    ],
    laure: [
      { id: 'men_laure_1', icon: '📊', title: 'Analyse tes patterns', action: 'chat', prompt: 'Quels patterns observes-tu cette phase ?' },
      { id: 'men_laure_2', icon: '📝', title: 'Plan de repos', action: 'notebook', prompt: 'Comment optimiser ton repos ?' },
      { id: 'men_laure_3', icon: '🌙', title: 'Phase détails', action: 'phase_detail', prompt: null }
    ]
  },
  follicular: {
    emma: [
      { id: 'fol_emma_1', icon: '🌱', title: 'Nouvelle énergie', action: 'chat', prompt: 'Comment canaliser cette énergie ?' },
      { id: 'fol_emma_2', icon: '✨', title: 'Capture tes idées', action: 'notebook', prompt: 'Quelles nouvelles idées émergent ?' },
      { id: 'fol_emma_3', icon: '🌱', title: 'Phase renaissance', action: 'phase_detail', prompt: null }
    ]
  }
};

class VignettesService {
  constructor() {
    this.cache = new Map();
  }

  async getVignettes(phase, persona) {
    if (!phase || !persona) {
      return this.getFallbackVignettes('menstrual', 'emma');
    }

    try {
      const cacheKey = `${phase}_${persona}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const cachedVignettes = await this.getCachedVignettes(cacheKey);
      if (cachedVignettes) {
        this.cache.set(cacheKey, cachedVignettes);
        return cachedVignettes;
      }

      // ✅ UTILISER CONTENTMANAGER AU LIEU DE FALLBACKS HARCODÉS
      const allVignettes = await ContentManager.getVignettes();
      
      if (allVignettes && allVignettes[phase]) {
        const phaseVignettes = allVignettes[phase][persona];
        
        if (phaseVignettes && Array.isArray(phaseVignettes)) {
          // Cache les vignettes trouvées
          this.cache.set(cacheKey, phaseVignettes);
          await this.cacheVignettes(cacheKey, phaseVignettes);
          return phaseVignettes;
        }
      }

      return this.getEmergencyVignettes(phase);
    } catch (error) {
      console.error('🚨 Erreur getVignettes:', error);
      return this.getEmergencyVignettes(phase);
    }
  }

  getFallbackVignettes(phase, persona) {
    try {
      if (!FALLBACK_VIGNETTES[phase]) {
        phase = 'menstrual';
      }

      if (!FALLBACK_VIGNETTES[phase][persona]) {
        persona = 'emma';
      }

      return FALLBACK_VIGNETTES[phase][persona] || this.getEmergencyVignettes(phase);
    } catch (error) {
      return this.getEmergencyVignettes(phase);
    }
  }

  getEmergencyVignettes(phase = 'menstrual') {
    const phaseEmojis = {
      menstrual: '🌙',
      follicular: '🌱', 
      ovulatory: '☀️',
      luteal: '🍂'
    };

    return [
      {
        id: `emergency_${phase}_1`,
        icon: '💭',
        title: 'Explore tes ressentis',
        action: 'chat',
        prompt: 'Comment te sens-tu en ce moment ?'
      },
      {
        id: `emergency_${phase}_2`,
        icon: '✍️',
        title: 'Note tes pensées',
        action: 'notebook',
        prompt: 'Qu\'est-ce qui te préoccupe aujourd\'hui ?'
      },
      {
        id: `emergency_${phase}_3`,
        icon: phaseEmojis[phase] || '🌟',
        title: 'Découvre ta phase',
        action: 'phase_detail',
        prompt: null
      }
    ];
  }

  async getCachedVignettes(key) {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY}_${key}`);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;
      
      if (age > CACHE_DURATION) {
        await AsyncStorage.removeItem(`${CACHE_KEY}_${key}`);
        return null;
      }
      
      return cacheData.vignettes;
    } catch (error) {
      return null;
    }
  }

  async cacheVignettes(key, vignettes) {
    try {
      const cacheData = {
        vignettes,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(`${CACHE_KEY}_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('🚨 Erreur cacheVignettes:', error);
    }
  }

  getNavigationParams(vignette, currentPhase, currentPersona) {
    const baseParams = {
      vignetteId: vignette.id,
      sourcePhase: currentPhase,
      sourcePersona: currentPersona,
      context: 'vignette'
    };

    switch (vignette.action) {
      case 'chat':
        return {
          route: '/(tabs)/chat',
          params: { ...baseParams, initialMessage: vignette.prompt }
        };
        
      case 'notebook':
        return {
          route: '/(tabs)/notebook', 
          params: { ...baseParams, initialPrompt: vignette.prompt }
        };
        
      case 'phase_detail':
        return {
          route: `/cycle/phases/${currentPhase}`,
          params: baseParams
        };
        
      default:
        return { route: '/(tabs)/cycle', params: baseParams };
    }
  }

  async clearCache() {
    this.cache.clear();
    const keys = await AsyncStorage.getAllKeys();
    const vignetteKeys = keys.filter(key => key.startsWith(CACHE_KEY));
    if (vignetteKeys.length > 0) {
      await AsyncStorage.multiRemove(vignetteKeys);
    }
  }
}

export default new VignettesService();
