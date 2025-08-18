import {inject, Injectable, signal} from '@angular/core';
import {generateClient} from 'aws-amplify/api';
import {forkJoin, of, switchMap, take} from "rxjs";
import {UserRole, UserService} from "./user.service";
import {Router} from '@angular/router';

export interface Notification {
  notificationId: string;
  title: string;
  description?: string;
  createdAt: string;
  author: string;
  link?: string;
  targetRole: string;
  userId?: string;
  read: boolean;
}

export interface NotificationInput {
  title: string;
  description: string;
  author: string;
  targetRole: string;
  userId: string;
}

export interface CreateNotificationResponse {
  notificationId: string;
  title: string;
  description: string;
  createdAt: string;
  targetRole: string;
  userId: string;
  author: string;
}

const client = generateClient();

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private subscriptions: any[] = [];
  #userService = inject(UserService);
  #router = inject(Router);

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);
  hasNewNotifications = signal<boolean>(false);

  async connect() {
    this.disconnect();

    this.#userService.getCurrentUser().pipe(
      take(1),
      switchMap(user => {
        const userId = user.userId;
        const userRole = user.role;

        return forkJoin([
          this.subscribeToRole(UserRole.ALL),
          userId ? this.subscribeToUser(userId) : of(null),
          userRole ? this.subscribeToRole(userRole) : of(null)
        ]);
      })
    ).subscribe(([allNotifs, userNotifs, roleNotifs]) => {
      console.log('✅ Conectado a notificaciones');
    });
  }

  async createNotification(input: NotificationInput): Promise<CreateNotificationResponse> {
    const mutation = `
      mutation CreateNotification($input: NotificationInput!) {
        createNotification(input: $input) {
          notificationId
          title
          description
          createdAt
          targetRole
          userId
          author
        }
      }
    `;

    try {
      const result: any = await client.graphql({
        query: mutation,
        variables: { input }
      });

      if (result.data?.createNotification) {
        const newNotification = result.data.createNotification;
        
        return newNotification;
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  private async subscribeToRole(targetRole: string) {
    const subscriptionQuery = `
      subscription OnCreateNotification($targetRole: String!) {
        onCreateNotification(targetRole: $targetRole) {
          notificationId
          title
          description
          createdAt
          author
          link
          targetRole
          userId
        }
      }
    `;

    try {
      const subscription = client.graphql({
        query: subscriptionQuery,
        variables: {targetRole}
      }) as any;

      const sub = subscription.subscribe({
        next: ({data}: any) => {
          if (data?.onCreateNotification) {
            console.log('📨 Nueva notificación recibida:', data.onCreateNotification.title);
            this.addNotification(data.onCreateNotification);
          }
        },
        error: (error: any) => {
          console.error(`Subscription error for role ${targetRole}:`, error);
        }
      });

      this.subscriptions.push(sub);
    } catch (error) {
      console.error(`Subscription error for role ${targetRole}:`, error);
    }
  }

  private async subscribeToUser(userId: string) {
    const subscriptionQuery = `
      subscription OnCreateUserNotification($userId: String!) {
        onCreateUserNotification(userId: $userId) {
          notificationId
          title
          description
          createdAt
          author
          link
          targetRole
          userId
        }
      }
    `;

    try {
      const subscription = client.graphql({
        query: subscriptionQuery,
        variables: {userId}
      }) as any;

      const sub = subscription.subscribe({
        next: ({data}: any) => {
          if (data?.onCreateUserNotification) {
            console.log('📨 Nueva notificación de usuario recibida:', data.onCreateUserNotification.title);
            this.addNotification(data.onCreateUserNotification);
          }
        },
        error: (error: any) => {
          console.error(`Subscription error for user ${userId}:`, error);
        }
      });

      this.subscriptions.push(sub);
    } catch (error) {
      console.error(`Subscription error for user ${userId}:`, error);
    }
  }

  async loadNotifications() {
    this.#userService.getCurrentUser().pipe(
      take(1),
      switchMap(user => {
        const userId = user.userId;
        const userRole = user.role;

        return forkJoin([
          this.loadNotificationsByRole(UserRole.ALL),
          userId ? this.loadNotificationsByUser(userId) : of(null),
          userRole ? this.loadNotificationsByRole(userRole) : of(null)
        ]);
      })
    ).subscribe(([allNotifs, userNotifs, roleNotifs]) => {
      console.log('📋 Notificaciones cargadas');
    });
  }

  private async loadNotificationsByRole(role: UserRole) {
    const query = `
      query GetNotifications($role: String!, $limit: Int) {
        getNotifications(role: $role, limit: $limit) {
          notificationId
          title
          description
          createdAt
          author
          link
          targetRole
          userId
          read
        }
      }
    `;

    try {
      const result: any = await client.graphql({
        query,
        variables: {role, limit: 20}
      });

      if (result.data?.getNotifications) {
        const notifications = result.data.getNotifications.map((notification: any) => ({
          ...notification,
          link: notification.link ?? undefined,
          userId: notification.userId ?? undefined,
          read: true
        }));

        this.notifications.update(existing => {
          const combined = [...existing, ...notifications];
          return combined.filter((n, i, arr) =>
            arr.findIndex(x => x.notificationId === n.notificationId) === i
          ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });

        this.updateUnreadCount();
      }
    } catch (error) {
      console.error(`Error loading notifications for role ${role}:`, error);
    }
  }

  private async loadNotificationsByUser(userId: string) {
    const query = `
      query GetUserNotifications($userId: String!, $limit: Int) {
        getUserNotifications(userId: $userId, limit: $limit) {
          notificationId
          title
          description
          createdAt
          author
          link
          targetRole
          userId
          read
        }
      }
    `;

    try {
      const result: any = await client.graphql({
        query,
        variables: {userId, limit: 20}
      });

      if (result.data?.getUserNotifications) {
        const notifications = result.data.getUserNotifications.map((notification: any) => ({
          ...notification,
          link: notification.link ?? undefined,
          userId: notification.userId ?? undefined,
          read: true
        }));

        this.notifications.update(existing => {
          const combined = [...existing, ...notifications];
          return combined.filter((n, i, arr) =>
            arr.findIndex(x => x.notificationId === n.notificationId) === i
          ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });

        this.updateUnreadCount();
      }
    } catch (error) {
      console.error(`Error loading notifications for user ${userId}:`, error);
    }
  }

  private addNotification(notification: any) {
    const newNotification: Notification = {
      ...notification,
      read: false,
      targetRole: notification.targetRole ?? 'ALL',
      link: notification.link ?? undefined,
      userId: notification.userId ?? undefined
    };

    this.notifications.update(notifications => {
      const exists = notifications.some(n => n.notificationId === newNotification.notificationId);
      if (exists) {
        console.log('⚠️ Notificación duplicada ignorada');
        return notifications;
      }

      console.log('✅ Notificación agregada al estado');
      this.unreadCount.update(count => count + 1);
      this.hasNewNotifications.set(true);
      this.showBrowserNotification(newNotification);

      return [newNotification, ...notifications];
    });
  }

  private async showBrowserNotification(notification: Notification) {
    if (!('Notification' in window)) {
      console.log('❌ Notificaciones no soportadas en este navegador');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.log('❌ Permisos de notificación no concedidos');
      return;
    }

    try {
      console.log('🔔 Mostrando notificación del navegador');
      const browserNotification = new Notification(notification.title, {
        body: notification.description || '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: notification.notificationId,
        data: {
          link: notification.link,
          notificationId: notification.notificationId
        }
      });

      browserNotification.onclick = (event) => {
        event.preventDefault();
        this.handleNotificationClick(notification);
        browserNotification.close();
      };
    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
    }
  }

  private handleNotificationClick(notification: Notification) {
    console.log('🖱️ Notificación clickeada');
    this.markAsRead(notification.notificationId);

    const link = notification.link?.trim();
    if (!link) return;

    if (/^https?:\/\//i.test(link)) {
      window.open(link, '_blank', 'noopener');
    } else {
      this.#router.navigate([link]);
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported in this browser');
      return 'denied';
    }

    // Verificar el permiso actual
    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      await this.registerServiceWorker();
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Notification permission previously denied');
      return 'denied';
    }

    // Solicitar permiso
    console.log('🔄 Requesting notification permission...');
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      await this.registerServiceWorker();
    } else {
      console.log('❌ Notification permission denied');
    }

    return permission;
  }

  private async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported');
      return;
    }

    try {
      // Verificar si ya hay un service worker registrado
      const existingRegistration = await navigator.serviceWorker.getRegistration();

      let registration: ServiceWorkerRegistration;

      if (existingRegistration) {
        console.log('✅ Service Worker already registered');
        registration = existingRegistration;
      } else {
        console.log('🔄 Registering Service Worker...');
        registration = await navigator.serviceWorker.register('/ngsw-worker.js');
        console.log('✅ Service Worker registered successfully');
      }

      // Esperar a que esté listo
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');

      // Configurar listener para mensajes del service worker
      this.setupServiceWorkerMessageListener();

    } catch (error) {
      console.error('❌ Error with Service Worker:', error);
    }
  }

  private setupServiceWorkerMessageListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          const notificationData = event.data.data;
          if (notificationData?.notificationId) {
            this.handleNotificationClick(notificationData);
          }
        }
      });
    }
  }

  markAsRead(notificationId: string) {
    this.notifications.update(notifications =>
      notifications.map(n => n.notificationId === notificationId ? {...n, read: true} : n)
    );
    this.updateUnreadCount();
  }

  markAllAsRead() {
    this.notifications.update(notifications =>
      notifications.map(n => ({...n, read: true}))
    );
    this.unreadCount.set(0);
    this.hasNewNotifications.set(false);
  }

  private updateUnreadCount() {
    const unread = this.notifications().filter(n => !n.read).length;
    this.unreadCount.set(unread);
    this.hasNewNotifications.set(unread > 0);
  }

  disconnect() {
    console.log('🔄 Disconnecting notification subscriptions...');
    this.subscriptions.forEach(sub => {
      try {
        sub?.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
    this.subscriptions = [];
    console.log('✅ Notification subscriptions disconnected');
  }

  clearNotifications() {
    this.notifications.set([]);
    this.unreadCount.set(0);
    this.hasNewNotifications.set(false);
    console.log('🧹 Notifications cleared');
  }
}
