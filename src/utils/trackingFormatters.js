//
// ─────────────────────────────────────────────────────────
// 📄 File: src/utils/trackingFormatters.js
// 🧩 Type: Utility Functions - FORMATAGE TRACKING SPÉCIALISÉ
// 📚 Description: Formatters pour l'affichage des données de tracking
// 🎯 Responsabilités: 
//    - Formatage humeur & énergie
//    - Affichage des symptômes
//    - Calcul et affichage des trends
//    - Résumés visuels des trackings
// 🕒 Version: 2.0 - 2025-06-26 - DOCUMENTATION & STRUCTURE
// ─────────────────────────────────────────────────────────
//

// ═══════════════════════════════════════════════════════════
// 📊 CONSTANTES DE TRACKING (Synchronisées avec QuickTrackingModal)
// ═══════════════════════════════════════════════════════════

const MOOD_OPTIONS = [
  { emoji: '😢', label: 'Maussade', value: 'sad' },
  { emoji: '😐', label: 'Moyenne', value: 'neutral' },
  { emoji: '😊', label: 'Bonne', value: 'good' },
  { emoji: '😍', label: 'Très bonne', value: 'great' },
  { emoji: '🤩', label: 'Excellente', value: 'amazing' },
];

const ENERGY_LEVELS = [
  { level: 1, icon: '🔋', color: '#F44336' },
  { level: 2, icon: '🔋', color: '#FF9800' },
  { level: 3, icon: '⚡', color: '#FFC107' },
  { level: 4, icon: '⚡', color: '#8BC34A' },
  { level: 5, icon: '⚡', color: '#4CAF50' },
];

const SYMPTOMS_ALL = [
  // Physiques
  { id: 'crampes', label: 'Crampes', emoji: '🤕' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'maux_tete', label: 'Maux de tête', emoji: '🤯' },
  { id: 'ballonnements', label: 'Ballonnements', emoji: '🎈' },
  { id: 'douleurs', label: 'Douleurs', emoji: '💢' },
  { id: 'nausees', label: 'Nausées', emoji: '🤢' },
  // Émotionnels
  { id: 'sensibilite', label: 'Sensibilité', emoji: '🥺' },
  { id: 'irritabilite', label: 'Irritabilité', emoji: '😤' },
  { id: 'anxiete', label: 'Anxiété', emoji: '😰' },
  { id: 'joie', label: 'Joie', emoji: '😊' },
  { id: 'tristesse', label: 'Tristesse', emoji: '😢' },
  { id: 'zen', label: 'Zen', emoji: '😌' },
];

// ═══════════════════════════════════════════════════════════
// 🎨 CONSTANTES LEGACY (Compatibilité)
// ═══════════════════════════════════════════════════════════

const MOOD_DISPLAY = {
  sad: { emoji: '😢', label: 'Maussade', color: '#9E9E9E' },
  neutral: { emoji: '😐', label: 'Moyenne', color: '#FF9800' },
  good: { emoji: '😊', label: 'Bonne', color: '#4CAF50' },
  great: { emoji: '😍', label: 'Très bonne', color: '#00BCD4' },
  amazing: { emoji: '🤩', label: 'Excellente', color: '#E91E63' }
};

const ENERGY_DISPLAY = {
  1: { icon: '🔋', label: 'Très faible', bars: '●○○○○' },
  2: { icon: '🔋', label: 'Faible', bars: '●●○○○' },
  3: { icon: '⚡', label: 'Modérée', bars: '●●●○○' },
  4: { icon: '⚡', label: 'Bonne', bars: '●●●●○' },
  5: { icon: '⚡', label: 'Excellente', bars: '●●●●●' }
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
  nausees: '🤢',
  joie: '😊',
  tristesse: '😢',
  zen: '😌'
};

// ═══════════════════════════════════════════════════════════
// 🎯 FORMATAGE PRINCIPAL TRACKING
// ═══════════════════════════════════════════════════════════

/**
 * ✅ NOUVEAU : Format résumé identique à QuickTrackingModal
 */
export const formatTrackingModalStyle = (entry) => {
  if (entry.type !== "tracking") return entry.content;
  
  // Parser le contenu
  const moodMatch = entry.content.match(/Humeur: ([^•]+)/);
  const energyMatch = entry.content.match(/Énergie: (\d+)/);
  
  if (!moodMatch || !energyMatch) return entry.content;
  
  const moodValue = moodMatch[1].trim();
  const energyValue = parseInt(energyMatch[1]);
  
  // Trouver les données exactes de la modale
  const mood = MOOD_OPTIONS.find(o => o.value === moodValue);
  const energy = ENERGY_LEVELS.find(l => l.level === energyValue);
  
  if (!mood || !energy) return entry.content;
  
  // Extraire les symptômes des tags
  const symptomTags = entry.tags?.filter(tag => tag.startsWith('#')) || [];
  const symptoms = symptomTags
    .map(tag => {
      const symptomId = tag.slice(1);
      return SYMPTOMS_ALL.find(s => s.id === symptomId);
    })
    .filter(Boolean);
  
  // ✅ Format EXACT du résumé de la modale
  let lines = [];
  
  // Ligne humeur
  lines.push(`${mood.emoji} ${mood.label}`);
  
  // Ligne énergie
  lines.push(`${energy.icon} Énergie : ${energyValue}/5`);
  
  // Ligne symptômes si présents
  if (symptoms.length > 0) {
    lines.push(`${symptoms.length} symptôme${symptoms.length > 1 ? 's' : ''}`);
  }
  
  return lines.join('\n');
};

// Legacy function - utilise maintenant le nouveau format
export const formatTrackingEmotional = (entry) => {
  return formatTrackingModalStyle(entry);
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