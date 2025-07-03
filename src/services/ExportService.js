//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/ExportService.js
// 🧩 Type: Service
// 📚 Description: Export données utilisateur PDF/JSON (RGPD)
// 🕒 Version: 1.0 - 2025-01-21
// 🧭 Used in: Settings, profile export
// ─────────────────────────────────────────────────────────
//
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getCurrentPhaseInfo } from '../utils/cycleCalculations';
import { formatDateFull } from '../utils/dateUtils';
import { useCycleStore, getCycleData } from '../stores/useCycleStore';

class ExportService {
  constructor() {
    this.exportInProgress = false;
  }

  // ═══════════════════════════════════════════════════════
  // 📊 COLLECTE DONNÉES
  // ═══════════════════════════════════════════════════════
  
  async collectAllData() {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      userData: {},
      cycle: {},
      notebook: {},
      chat: {},
      preferences: {},
      engagement: {},
      intelligence: {}
    };

    try {
      // Profil utilisateur
      const { useUserStore } = require('../stores/useUserStore');
      const userState = useUserStore.getState();
      data.userData = {
        profile: userState.profile,
        persona: userState.persona,
        melune: userState.melune
      };
      data.cycle = getCycleData();
      data.preferences = userState.preferences;

      // Carnet
      const { useNotebookStore } = require('../stores/useNotebookStore');
      const notebookState = useNotebookStore.getState();
      data.notebook = {
        entries: notebookState.entries,
        quickTrackings: notebookState.quickTrackings
      };

      // Chat
      const { useChatStore } = require('../stores/useChatStore');
      const chatState = useChatStore.getState();
      data.chat = {
        messages: chatState.messages,
        stats: chatState.getMessagesCount()
      };

      // Engagement
      const { useEngagementStore } = require('../stores/useEngagementStore');
      const engagementState = useEngagementStore.getState();
      data.engagement = {
        metrics: engagementState.metrics,
        maturity: engagementState.maturity,
        score: engagementState.getEngagementScore()
      };

      // Intelligence
      const { useUserIntelligence } = require('../stores/useUserIntelligence');
      const intelligenceState = useUserIntelligence.getState();
      data.intelligence = intelligenceState.exportLearningData();

      return data;
    } catch (error) {
      console.error('❌ Erreur collecte données:', error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 📄 EXPORT JSON
  // ═══════════════════════════════════════════════════════
  
  async exportJSON() {
    if (this.exportInProgress) return;
    this.exportInProgress = true;

    try {
      const data = await this.collectAllData();
      
      // Créer fichier
      const fileName = `moodcycle_export_${Date.now()}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(data, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      // Partager
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export MoodCycle'
        });
      }

      console.info('✅ Export JSON réussi');
      return { success: true, filePath };

    } catch (error) {
      console.error('❌ Erreur export JSON:', error);
      throw error;
    } finally {
      this.exportInProgress = false;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 📄 EXPORT PDF
  // ═══════════════════════════════════════════════════════
  
  async exportPDF() {
    if (this.exportInProgress) return;
    this.exportInProgress = true;

    try {
      const data = await this.collectAllData();
      const html = this.generateHTML(data);
      
      // Générer PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });

      // Renommer
      const fileName = `moodcycle_export_${Date.now()}.pdf`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: newPath
      });

      // Partager
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newPath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export MoodCycle PDF'
        });
      }

      console.info('✅ Export PDF réussi');
      return { success: true, filePath: newPath };

    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      throw error;
    } finally {
      this.exportInProgress = false;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 🎨 GÉNÉRATION HTML
  // ═══════════════════════════════════════════════════════
  
  generateHTML(data) {
    const currentPhase = getCurrentPhaseInfo(
      data.cycle.lastPeriodDate,
      data.cycle.length,
      data.cycle.periodDuration
    );

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Export MoodCycle - ${data.userData.profile?.prenom || 'Utilisatrice'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #9C27B0;
    }
    .header {
      background: linear-gradient(135deg, #F44336 0%, #FFC107 25%, #00BCD4 50%, #673AB7 100%);
      padding: 30px;
      border-radius: 10px;
      color: white;
      margin-bottom: 30px;
    }
    .section {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .phase-info {
      display: inline-block;
      padding: 5px 15px;
      background: ${currentPhase.color}20;
      color: ${currentPhase.color};
      border-radius: 20px;
      font-weight: bold;
    }
    .entry {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      border-left: 4px solid ${currentPhase.color};
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    .stat-card {
      background: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #9C27B0;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Export MoodCycle</h1>
    <p>Bonjour ${data.userData.profile?.prenom || 'toi'} ! Voici tes données MoodCycle</p>
    <p>Export généré le ${formatDateFull(new Date())}</p>
  </div>

  <div class="section">
    <h2>📊 Ton Profil</h2>
    <p><strong>Prénom :</strong> ${data.userData.profile?.prenom || 'Non renseigné'}</p>
    <p><strong>Tranche d'âge :</strong> ${data.userData.profile?.ageRange || 'Non renseigné'}</p>
    <p><strong>Persona :</strong> ${data.userData.persona?.assigned || 'Non défini'}</p>
    <p><strong>Phase actuelle :</strong> <span class="phase-info">${currentPhase.emoji} ${currentPhase.name}</span></p>
  </div>

  <div class="section">
    <h2>📈 Statistiques d'utilisation</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${data.engagement.metrics?.daysUsed || 0}</div>
        <div>Jours d'utilisation</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.notebook.stats?.total || 0}</div>
        <div>Entrées carnet</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.chat.stats?.total || 0}</div>
        <div>Messages échangés</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.engagement.score || 0}%</div>
        <div>Score engagement</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>📝 Dernières entrées du carnet</h2>
    ${data.notebook.entries?.slice(0, 5).map(entry => `
      <div class="entry">
        <p>${entry.content}</p>
        <small>${formatDateFull(new Date(entry.timestamp))} - ${entry.tags?.join(' ') || ''}</small>
      </div>
    `).join('') || '<p>Aucune entrée</p>'}
  </div>

  <div class="section">
    <h2>💬 Conversations récentes</h2>
    ${data.chat.messages?.slice(-10).map(msg => `
      <div class="entry">
        <strong>${msg.type === 'user' ? 'Toi' : 'Melune'} :</strong> ${msg.content}
        <br><small>${formatDateFull(new Date(msg.timestamp))}</small>
      </div>
    `).join('') || '<p>Aucune conversation</p>'}
  </div>

  <div class="footer">
    <p>Cet export contient toutes tes données personnelles conformément au RGPD</p>
    <p>MoodCycle - Intelligence Cyclique Évolutive</p>
  </div>
</body>
</html>
    `;
  }

  // ═══════════════════════════════════════════════════════
  // 🗑️ SUPPRESSION DONNÉES
  // ═══════════════════════════════════════════════════════
  
  async deleteAllData() {
    const stores = [
      'useUserStore',
      'useNotebookStore',
      'useChatStore',
      'useEngagementStore',
      'useUserIntelligence',
      'useAppStore',
      'useNavigationStore'
    ];

    for (const storeName of stores) {
      try {
        const store = require(`../stores/${storeName}`);
        const storeInstance = store[storeName] || store.default;
        if (storeInstance && storeInstance.getState().reset) {
          storeInstance.getState().reset();
        }
      } catch (error) {
        console.error(`⚠️ Impossible de reset ${storeName}:`, error);
      }
    }

    // Nettoyer AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    const moodcycleKeys = keys.filter(key => 
      key.includes('user-storage') ||
      key.includes('notebook-storage') ||
      key.includes('chat-storage') ||
      key.includes('engagement-storage') ||
      key.includes('intelligence-storage') ||
      key.includes('app-storage') ||
      key.includes('navigation-storage')
    );
    
    await AsyncStorage.multiRemove(moodcycleKeys);
    
    console.info('✅ Toutes les données supprimées');
  }

  async exportData(format = 'json') {
    try {
      const { useUserStore } = require('../stores/useUserStore');
      const { useNotebookStore } = require('../stores/useNotebookStore');
      
      const userData = useUserStore.getState();
      const notebookData = useNotebookStore.getState();
      const cycleData = getCycleData();
      
      const exportData = {
        user: {
          profile: userData.profile,
          preferences: userData.preferences,
          persona: userData.persona,
          melune: userData.melune
        },
        cycle: cycleData,
        notebook: {
          entries: notebookData.entries,
          quickTrackings: notebookData.quickTrackings
        },
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0',
          format
        }
      };

      const currentPhase = getCurrentPhaseInfo(
        cycleData.lastPeriodDate,
        cycleData.length,
        cycleData.periodDuration
      );
    } catch (error) {
      console.error('Erreur export:', error);
    }
  }
}

// Singleton
export default new ExportService();