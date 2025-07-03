//
// ─────────────────────────────────────────────────────────
// 📄 File: src/services/NotificationService.js
// 🧩 Type: Service
// 📚 Description: Notifications locales pour phases et rappels
// 🕒 Version: 1.0 - 2025-01-21
// 🧭 Used in: App.js, cycle tracking
// ─────────────────────────────────────────────────────────
//
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getCurrentPhase, getNextPeriodDate, PHASE_METADATA } from '../utils/cycleCalculations';

// Configuration notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationSubscription = null;
    this.responseSubscription = null;
    this.scheduledNotifications = [];
  }

  async initialize() {
    try {
      // Demander permissions
      const permission = await this.requestPermissions();
      if (!permission) {
        console.info('❌ Permissions notifications refusées');
        return false;
      }

      // Écouter les notifications
      this.setupListeners();

      // Nettoyer anciennes notifications
      await this.clearAllNotifications();

      console.info('✅ NotificationService initialisé');
      return true;
    } catch (error) {
      console.error('❌ Erreur init notifications:', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 🔔 PERMISSIONS
  // ═══════════════════════════════════════════════════════
  
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('phases', {
        name: 'Phases du cycle',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return true;
  }

  // ═══════════════════════════════════════════════════════
  // 📅 PLANIFICATION NOTIFICATIONS
  // ═══════════════════════════════════════════════════════
  
  async schedulePhaseNotifications() {
    try {
      const { useUserStore } = require('../stores/useUserStore');
      const { cycle, persona } = useUserStore.getState();
      
      if (!cycle.lastPeriodDate) return;

      // Nettoyer anciennes
      await this.clearPhaseNotifications();

      // Calculer prochaines phases
      const notifications = this.generatePhaseNotifications(cycle, persona.assigned);
      
      // Planifier
      for (const notif of notifications) {
        const id = await Notifications.scheduleNotificationAsync({
          content: notif.content,
          trigger: notif.trigger,
          identifier: notif.identifier
        });
        
        this.scheduledNotifications.push({
          id,
          type: 'phase',
          date: notif.trigger.date
        });
      }

      console.info('📅 Notifications phases planifiées:', notifications.length);
    } catch (error) {
      console.error('❌ Erreur planification:', error);
    }
  }

  generatePhaseNotifications(cycle, persona) {
    const notifications = [];
    const now = new Date();
    
    // Messages personnalisés par persona
    const messages = this.getPersonaMessages(persona);

    // Notification prochaines règles
    const nextPeriod = getNextPeriodDate(cycle.lastPeriodDate, cycle.length);
    if (nextPeriod && nextPeriod > now) {
      // 3 jours avant
      const reminderDate = new Date(nextPeriod);
      reminderDate.setDate(reminderDate.getDate() - 3);
      
      if (reminderDate > now) {
        notifications.push({
          identifier: 'period-reminder-3d',
          content: {
            title: messages.periodReminder.title,
            body: messages.periodReminder.body3Days,
            data: { type: 'period-reminder', days: 3 }
          },
          trigger: { date: reminderDate }
        });
      }

      // 1 jour avant
      const dayBefore = new Date(nextPeriod);
      dayBefore.setDate(dayBefore.getDate() - 1);
      
      if (dayBefore > now) {
        notifications.push({
          identifier: 'period-reminder-1d',
          content: {
            title: messages.periodReminder.title,
            body: messages.periodReminder.body1Day,
            data: { type: 'period-reminder', days: 1 }
          },
          trigger: { date: dayBefore }
        });
      }
    }

    // Notifications changement de phase
    const phaseChanges = this.calculatePhaseChanges(cycle);
    
    for (const change of phaseChanges) {
      if (change.date > now) {
        const phaseMessage = messages.phaseChange[change.phase];
        
        notifications.push({
          identifier: `phase-${change.phase}`,
          content: {
            title: phaseMessage.title,
            body: phaseMessage.body,
            data: { type: 'phase-change', phase: change.phase }
          },
          trigger: { date: change.date }
        });
      }
    }

    return notifications;
  }

  calculatePhaseChanges(cycle) {
    const changes = [];
    const lastPeriod = new Date(cycle.lastPeriodDate);
    
    // Folliculaire (après règles)
    const follicularStart = new Date(lastPeriod);
    follicularStart.setDate(lastPeriod.getDate() + cycle.periodDuration);
    changes.push({ phase: 'follicular', date: follicularStart });
    
    // Ovulatoire (jour 14 environ)
    const ovulatoryStart = new Date(lastPeriod);
    ovulatoryStart.setDate(lastPeriod.getDate() + Math.floor(cycle.length * 0.5));
    changes.push({ phase: 'ovulatory', date: ovulatoryStart });
    
    // Lutéale (jour 16 environ)
    const lutealStart = new Date(lastPeriod);
    lutealStart.setDate(lastPeriod.getDate() + Math.floor(cycle.length * 0.6));
    changes.push({ phase: 'luteal', date: lutealStart });
    
    return changes;
  }

  // ═══════════════════════════════════════════════════════
  // 💬 MESSAGES PERSONNALISÉS
  // ═══════════════════════════════════════════════════════
  
  getPersonaMessages(persona = 'emma') {
    const baseMessages = {
      periodReminder: {
        title: 'Règles bientôt',
        body3Days: 'Dans 3 jours environ ✨',
        body1Day: 'Demain probablement 🌙'
      },
      phaseChange: {
        follicular: {
          title: 'Phase folliculaire',
          body: 'Nouvelle énergie en route ! 🌱'
        },
        ovulatory: {
          title: 'Phase ovulatoire', 
          body: 'Tu rayonnes aujourd\'hui ! ☀️'
        },
        luteal: {
          title: 'Phase lutéale',
          body: 'Écoute ton intuition 🌙'
        }
      }
    };

    const personaVariations = {
      emma: {
        periodReminder: {
          body3Days: 'Hey ! Tes règles arrivent dans 3 jours environ 💕',
          body1Day: 'Coucou ! Tes règles sont prévues demain 🌸'
        }
      },
      laure: {
        periodReminder: {
          body3Days: 'Cycle en approche - 3 jours estimés 📊',
          body1Day: 'Règles prévues demain selon vos données 📈'
        }
      },
      clara: {
        periodReminder: {
          body3Days: 'Ton corps se prépare ! 3 jours environ ✨',
          body1Day: 'Demain, accueille cette nouvelle lune 🌙'
        }
      }
    };

    const variation = personaVariations[persona];
    if (variation) {
      return {
        ...baseMessages,
        periodReminder: {
          ...baseMessages.periodReminder,
          ...variation.periodReminder
        }
      };
    }

    return baseMessages;
  }

  // ═══════════════════════════════════════════════════════
  // 🔔 NOTIFICATIONS INSTANTANÉES
  // ═══════════════════════════════════════════════════════
  
  async sendInstantNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data
        },
        trigger: null // Immédiat
      });
    } catch (error) {
      console.error('❌ Erreur notification instantanée:', error);
    }
  }

  async sendSyncNotification(status) {
    const messages = {
      completed: {
        title: 'Synchronisation terminée',
        body: 'Vos données sont à jour ✅'
      },
      failed: {
        title: 'Sync en attente',
        body: 'Reconnexion automatique en cours...'
      }
    };

    const message = messages[status];
    if (message) {
      await this.sendInstantNotification(message.title, message.body, { type: 'sync', status });
    }
  }

  // ═══════════════════════════════════════════════════════
  // 🎧 LISTENERS
  // ═══════════════════════════════════════════════════════
  
  setupListeners() {
    // Notification reçue
    this.notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.info('📨 Notification reçue:', notification);
    });

    // Interaction avec notification
    this.responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.info('👆 Notification cliquée:', response);
      this.handleNotificationResponse(response);
    });
  }

  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    if (data.type === 'phase-change') {
      // Navigation vers l'écran cycle
      // router.push('/cycle');
    } else if (data.type === 'period-reminder') {
      // Navigation vers carnet
      // router.push('/notebook');
    }
  }

  // ═══════════════════════════════════════════════════════
  // 🗑️ NETTOYAGE
  // ═══════════════════════════════════════════════════════
  
  async clearPhaseNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications = this.scheduledNotifications.filter(n => n.type !== 'phase');
    } catch (error) {
      console.error('❌ Erreur nettoyage notifications:', error);
    }
  }

  async clearAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications = [];
    } catch (error) {
      console.error('❌ Erreur nettoyage complet:', error);
    }
  }

  cleanup() {
    if (this.notificationSubscription) {
      this.notificationSubscription.remove();
    }
    if (this.responseSubscription) {
      this.responseSubscription.remove();
    }
  }
}

// Singleton
export default new NotificationService();