// src/services/IntelligenceCache.js
class IntelligenceCache {
    constructor() {
      this.cache = new Map();
      this.maxSize = 100;
      this.ttl = 300000; // 5 minutes
    }
  
    getCacheKey(persona, phase, context) {
      return `${persona}-${phase}-${JSON.stringify(context)}`;
    }
  
    get(persona, phase, context) {
      const key = this.getCacheKey(persona, phase, context);
      const cached = this.cache.get(key);
      
      if (cached && Date.now() - cached.timestamp < this.ttl) {
        return cached.data;
      }
      
      return null;
    }
  
    set(persona, phase, context, data) {
      const key = this.getCacheKey(persona, phase, context);
      
      // LRU eviction si cache plein
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    }
  }

export default IntelligenceCache;