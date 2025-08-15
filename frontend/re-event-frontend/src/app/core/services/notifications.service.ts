import {inject, Injectable, signal} from '@angular/core';
import {generateClient} from 'aws-amplify/api';
import {forkJoin, of, switchMap, take} from "rxjs";
import {UserRole, UserService} from "./user.service";
import {Router} from '@angular/router';
import {pushConfig} from '../config/push-config';

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
      console.log({allNotifs, userNotifs, roleNotifs});
    });
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
      console.log({allNotifs, userNotifs, roleNotifs});
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
      targetRole: notification.targetRole || 'ALL',
      link: notification.link || undefined,
      userId: notification.userId || undefined
    };

    this.notifications.update(notifications => [newNotification, ...notifications]);
    this.unreadCount.update(count => count + 1);
    this.hasNewNotifications.set(true);

    this.showBrowserNotification(newNotification);
  }

  private async showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.description || '',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        tag: notification.notificationId,
        data: {
          link: notification.link,
          notificationId: notification.notificationId
        }
      });

      // Manejar clic en la notificación
      browserNotification.onclick = (event) => {
        event.preventDefault();
        this.handleNotificationClick(notification);
        browserNotification.close();
      };
    }
  }

  private handleNotificationClick(notification: Notification) {
    // Marcar como leída
    this.markAsRead(notification.notificationId);

    // Navegar si hay un link
    if (notification.link) {
      if (notification.link.startsWith('http')) {
        // Link externo
        window.open(notification.link, '_blank');
      } else {
        // Link interno
        this.#router.navigate([notification.link]);
      }
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        this.registerServiceWorker();
      }

      return permission;
    }
    return 'denied';
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/ngsw-worker.js');
        console.log('Service Worker registrado:', registration);

        if ('PushManager' in window && this.isValidVapidKey(pushConfig.vapidPublicKey)) {
          try {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: this.urlBase64ToUint8Array(pushConfig.vapidPublicKey) as unknown as ArrayBuffer
            });
            console.log('Push subscription exitosa:', subscription);
          } catch (error) {
            console.error('Error al suscribirse a notificaciones push:', error);
          }
        } else {
          console.log('Clave VAPID no válida o PushManager no disponible. Las notificaciones del navegador seguirán funcionando.');
        }
      } catch (error) {
        console.error('Error registrando Service Worker:', error);
      }
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private isValidVapidKey(key: string): boolean {
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return Boolean(key && key.length >= 80 && base64Regex.test(key));
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
    this.subscriptions.forEach(sub => sub?.unsubscribe());
    this.subscriptions = [];
  }
}
