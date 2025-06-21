//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/ContentManager.js
// 🧩 Type: Service
// 📚 Description: Service de gestion centralisée des contenus (insights, phases, closings) avec cache et fallback local/API
// 🕒 Version: 3.0 - 2025-06-21
// 🧭 Used in: insights engine, onboarding, notebook, API fallback
// ─────────────────────────────────────────────────────────
//
import { getApiConfig } from '../config/api.js';
import localInsights from '../data/insights.json';
import localPhases from '../data/phases.json';
import localClosings from '../data/closings.json';

class ContentManager {
  constructor() {
    this.cache = {
      insights: { data: null, timestamp: null, ttl: 2 * 60 * 60 * 1000 }, // 2h - Jeza active
      phases: { data: null, timestamp: null, ttl: 24 * 60 * 60 * 1000 }, // 24h - Stable
      closings: { data: null, timestamp: null, ttl: 7 * 24 * 60 * 60 * 1000 }, // 7j - Très stable
    };
  }

  async getInsights() {
    return this.getContent('insights', '/api/admin/insights', localInsights);
  }

  async getPhases() {
    return this.getContent('phases', '/api/admin/phases', localPhases);
  }

  async getClosings() {
    return this.getContent('closings', '/api/admin/closings', localClosings);
  }

  async getContent(type, endpoint, fallbackData) {
    const cacheEntry = this.cache[type];

    // Cache valide ?
    if (this.isCacheValid(cacheEntry)) {
      console.log(`📦 ${type} depuis cache`);
      return cacheEntry.data;
    }

    try {
      console.log(`🌐 Fetching ${type} depuis API...`);
      const { baseURL } = getApiConfig();

      const response = await fetch(`${baseURL}${endpoint}`, {
        timeout: 8000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const apiData = await response.json();
      const content = apiData.data || apiData;

      // Cache avec timestamp
      this.updateCache(type, content);

      console.log(`✅ ${type} API chargés`);
      return content;
    } catch (error) {
      console.log(`🔄 ${type} fallback local:`, error.message);

      // Cache même le fallback pour éviter de spammer l'API
      this.updateCache(type, fallbackData);
      return fallbackData;
    }
  }

  isCacheValid(cacheEntry) {
    if (!cacheEntry.data || !cacheEntry.timestamp) return false;
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  }

  updateCache(type, data) {
    this.cache[type] = {
      data,
      timestamp: Date.now(),
    };
  }

  // Force refresh - pour debug ou après modifs Jeza
  async forceRefresh(type = null) {
    if (type) {
      this.cache[type].timestamp = null;
    } else {
      Object.keys(this.cache).forEach((key) => {
        this.cache[key].timestamp = null;
      });
    }
  }
}

export default new ContentManager();
