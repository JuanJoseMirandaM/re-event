import {inject, Injectable, signal} from '@angular/core';
import {AuthService} from './auth.service';
import {generateClient} from 'aws-amplify/api';
import {filter, forkJoin, of, switchMap, take} from "rxjs";
import {UserRole, UserService} from "./user.service";

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
      console.log({ allNotifs, userNotifs, roleNotifs });
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
      console.log({ allNotifs, userNotifs, roleNotifs });
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
