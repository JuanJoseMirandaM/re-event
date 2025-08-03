import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { generateClient } from 'aws-amplify/api';

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
  private subscription: any;
  #authService = inject(AuthService);

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);
  hasNewNotifications = signal<boolean>(false);


  async connect() {
    // Test HTTP query first
    await this.testHttpQuery();
    const subscriptionQuery = `
      subscription OnCreateNotification {
        onCreateNotification(targetRole: "ALL") {
          notificationId
          title
          description
          createdAt
          author
        }
      }
    `;

    try {
      const subscription = client.graphql({
        query: subscriptionQuery
      }) as any;

      subscription.subscribe({
        next: ({ data }: any) => {
          console.warn(data)
          if (data?.onCreateNotification) {
            this.addNotification(data.onCreateNotification);
          }
        },
        error: (error: any) => {
          console.error('Subscription error:', error);
        }
      });
    } catch (error) {
      console.error('Subscription error:', error);
    }
  }

  private addNotification(notification: any) {
    const newNotification: Notification = {
      ...notification,
      read: false,
      targetRole: 'ALL',
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
      new Notification(notification.title, {
        body: notification.description || '',
        icon: '/assets/icons/icon-192x192.png'
      });
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  markAsRead(notificationId: string) {
    this.notifications.update(notifications =>
      notifications.map(n => n.notificationId === notificationId ? { ...n, read: true } : n)
    );
    this.updateUnreadCount();
  }

  markAllAsRead() {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
    this.unreadCount.set(0);
    this.hasNewNotifications.set(false);
  }

  private updateUnreadCount() {
    const unread = this.notifications().filter(n => !n.read).length;
    this.unreadCount.set(unread);
    this.hasNewNotifications.set(unread > 0);
  }

  private async testHttpQuery() {
    const query = `
      query GetNotifications($role: String!, $limit: Int) {
        getNotifications(role: $role, limit: $limit) {
          notificationId
          title
          description
          createdAt
          author
        }
      }
    `;

    try {
      const result: any = await client.graphql({
        query,
        variables: { role: 'ALL', limit: 10 }
      });
      
      console.log('HTTP Query successful:', result);
      
      // Load existing notifications
      if (result.data?.getNotifications) {
        const existingNotifications = result.data.getNotifications.map((notification: any) => ({
          ...notification,
          read: false,
          targetRole: 'ALL',
          link: notification.link || undefined,
          userId: notification.userId || undefined
        }));
        
        this.notifications.set(existingNotifications);
        this.unreadCount.set(existingNotifications.length);
        this.hasNewNotifications.set(existingNotifications.length > 0);
      }
    } catch (error) {
      console.error('HTTP Query error:', error);
    }
  }

  disconnect() {
    this.subscription?.unsubscribe();
  }
}
