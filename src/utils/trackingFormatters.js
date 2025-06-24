// src/utils/trackingFormatters.js
// Formatage élégant pour l'affichage des trackings

const MOOD_DISPLAY = {
    sad: { emoji: '😢', label: 'Maussade', color: '#9E9E9E' },
    neutral: { emoji: '😐', label: 'Moyenne', color: '#FF9800' },
    good: { emoji: '😊', label: 'Bonne', color: '#4CAF50' },
    great: { emoji: '😍', label: 'Très bonne', color: '#00BCD4' },
    amazing: { emoji: '🤩', label: 'Excellente', color: '#E91E63' }
  };
  
  const ENERGY_DISPLAY = {
    1: { icon: '🔋', label: 'Très faible', bars: '▪️▫️▫️▫️▫️' },
    2: { icon: '🔋', label: 'Faible', bars: '▪️▪️▫️▫️▫️' },
    3: { icon: '⚡', label: 'Modérée', bars: '▪️▪️▪️▫️▫️' },
    4: { icon: '⚡', label: 'Bonne', bars: '▪️▪️▪️▪️▫️' },
    5: { icon: '⚡', label: 'Excellente', bars: '▪️▪️▪️▪️▪️' }
  };
  
  const SYMPTOM_EMOJIS = {
    crampes: '🤕',
    fatigue: '😴',
    sensibilite: '🥺',
    maux_tete: '🤯',
    ballonnements: '🎈',
    irritabilite: '😤',
    anxiete: '😰',
    insomnie: '🌙',
    douleurs: '💢',
    nausees: '🤢'
  };
  
  export const formatTrackingEmotional = (entry) => {
    if (entry.type !== "tracking") return entry.content;
    
    // Parser le contenu
    const moodMatch = entry.content.match(/Humeur: ([^•]+)/);
    const energyMatch = entry.content.match(/Énergie: (\d+)/);
    
    if (!moodMatch || !energyMatch) return entry.content;
    
    const moodValue = moodMatch[1].trim();
    const energyValue = parseInt(energyMatch[1]);
    
    const mood = MOOD_DISPLAY[moodValue] || { emoji: '😐', label: moodValue };
    const energy = ENERGY_DISPLAY[energyValue] || { icon: '⚡', label: `${energyValue}/5` };
    
    // Extraire les symptômes des tags
    const symptoms = entry.tags
      ?.filter(tag => tag.startsWith('#') && SYMPTOM_EMOJIS[tag.slice(1)])
      .map(tag => {
        const symptom = tag.slice(1);
        return `${SYMPTOM_EMOJIS[symptom]} ${symptom}`;
      }) || [];
    
    // Format élégant
    let formatted = `${mood.emoji} ${mood.label} • ${energy.icon} ${energy.label}`;
    
    if (symptoms.length > 0) {
      formatted += `\n${symptoms.join(' • ')}`;
    }
    
    return formatted;
  };
  
  export const formatTrackingCompact = (entry) => {
    if (entry.type !== "tracking") return entry.content;
    
    const moodMatch = entry.content.match(/Humeur: ([^•]+)/);
    const energyMatch = entry.content.match(/Énergie: (\d+)/);
    
    if (!moodMatch || !energyMatch) return entry.content;
    
    const moodValue = moodMatch[1].trim();
    const energyValue = parseInt(energyMatch[1]);
    
    const mood = MOOD_DISPLAY[moodValue] || { emoji: '😐' };
    const energy = ENERGY_DISPLAY[energyValue] || { bars: '▪️▪️▪️▫️▫️' };
    
    return `${mood.emoji} ${energy.bars}`;
  };
  
  export const extractEnergyValue = (content) => {
    const match = content.match(/Énergie: (\d+)/);
    return match ? parseInt(match[1]) : null;
  };
  
  export const getEnergyTrendIcon = (avgEnergy) => {
    if (avgEnergy >= 4) return "⚡⚡⚡";
    if (avgEnergy >= 3) return "⚡⚡";
    return "⚡";
  };
  
  export const getMoodColor = (moodValue) => {
    return MOOD_DISPLAY[moodValue]?.color || '#757575';
  };
  
  export const formatTrendSummary = (trends) => {
    if (!trends) return null;
    
    const energyEmoji = trends.avgEnergy >= 4 ? '🔥' : 
                        trends.avgEnergy >= 3 ? '⚡' : '🔋';
    
    const trendEmoji = trends.energyTrend === 'en hausse' ? '📈' : 
                       trends.energyTrend === 'en baisse' ? '📉' : '➡️';
    
    return {
      title: `${energyEmoji} Énergie ${trendEmoji}`,
      subtitle: `Moyenne: ${trends.avgEnergy}/5`,
      detail: trends.topSymptom ? `Symptôme principal: ${SYMPTOM_EMOJIS[trends.topSymptom] || '🏥'} ${trends.topSymptom}` : null
    };
  };