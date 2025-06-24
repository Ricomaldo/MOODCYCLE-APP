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
        console.log('❌ Permissions notifications refusées');
        return false;
      }

      // Écouter les notifications
      this.setupListeners();

      // Nettoyer anciennes notifications
      await this.clearAllNotifications();

      console.log('✅ NotificationService initialisé');
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

      console.log('📅 Notifications phases planifiées:', notifications.length);
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
    const messages = {
      emma: {
        periodReminder: {
          title: "Hey ! Tes règles approchent 🌙",
          body3Days: "Dans 3 jours ! C'est le moment de prévoir tes protections et de ralentir un peu ✨",
          body1Day: "Demain ! Prépare ton kit cocooning et écoute ton corps 💕"
        },
        phaseChange: {
          follicular: {
            title: "Phase folliculaire ! 🌱",
            body: "Nouvelle énergie qui monte ! C'est parti pour de nouveaux projets ✨"
          },
          ovulatory: {
            title: "Phase ovulatoire ! ☀️",
            body: "Tu rayonnes ! Profite de cette énergie au max 🚀"
          },
          luteal: {
            title: "Phase lutéale 🍂",
            body: "Temps de ralentir et de t'écouter. Tu as le droit de dire non 💛"
          }
        }
      },
      laure: {
        periodReminder: {
          title: "Rappel : Règles prévues",
          body3Days: "Dans 3 jours. Planifiez vos activités en conséquence.",
          body1Day: "Demain. Adaptez votre planning et préparez le nécessaire."
        },
        phaseChange: {
          follicular: {
            title: "Phase folliculaire",
            body: "Énergie croissante. Moment optimal pour initier des projets."
          },
          ovulatory: {
            title: "Phase ovulatoire",
            body: "Pic d'énergie. Maximisez vos interactions et négociations."
          },
          luteal: {
            title: "Phase lutéale",
            body: "Énergie décroissante. Priorisez et déléguez si possible."
          }
        }
      },
      clara: {
        periodReminder: {
          title: "Tes règles arrivent ! 🌟",
          body3Days: "Dans 3 jours ! Quelle belle opportunité de ralentir 💫",
          body1Day: "Demain ! Prépare-toi à accueillir cette phase de renouveau ✨"
        },
        phaseChange: {
          follicular: {
            title: "Waouh, phase folliculaire ! 🌈",
            body: "Sens-tu cette énergie qui pétille ? Go go go ! 🚀"
          },
          ovulatory: {
            title: "Phase ovulatoire power ! ⚡",
            body: "Tu es une déesse ! Brille de mille feux 🌟"
          },
          luteal: {
            title: "Phase lutéale magique 🌙",
            body: "Temps de sagesse intérieure. Honore tes besoins 💜"
          }
        }
      }
    };

    return messages[persona] || messages.emma;
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
          data,
          sound: true
        },
        trigger: null // Immédiat
      });
    } catch (error) {
      console.error('❌ Erreur notification instantanée:', error);
    }
  }

  async sendSyncNotification(status) {
    const messages = {
      start: {
        title: "Synchronisation...",
        body: "Tes données sont en cours de synchronisation"
      },
      complete: {
        title: "Synchronisation terminée ✅",
        body: "Toutes tes données sont à jour"
      },
      error: {
        title: "Erreur de synchronisation",
        body: "Certaines données n'ont pas pu être synchronisées"
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
      console.log('📨 Notification reçue:', notification);
    });

    // Interaction avec notification
    this.responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée:', response);
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
    const phaseNotifs = this.scheduledNotifications.filter(n => n.type === 'phase');
    
    for (const notif of phaseNotifs) {
      await Notifications.cancelScheduledNotificationAsync(notif.id);
    }
    
    this.scheduledNotifications = this.scheduledNotifications.filter(n => n.type !== 'phase');
  }

  async clearAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    this.scheduledNotifications = [];
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