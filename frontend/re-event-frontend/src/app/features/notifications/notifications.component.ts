import {ChangeDetectionStrategy, Component, inject, OnInit, computed, signal, effect} from '@angular/core';
import {NotificationCardComponent} from '../../components/notification-card/notification-card.component';
import {NotificationsService} from '../../core/services/notifications.service';
import {RelativeDatePipe} from "../../pipes";
import {CreateNotificationComponent} from '../../components/create-notification/create-notification.component';
import {UserService} from "../../core/services/user.service";

interface GroupedNotifications {
  date: string;
  notifications: any[];
}

@Component({
  selector: 'app-notifications',
  imports: [
    NotificationCardComponent,
    RelativeDatePipe,
    CreateNotificationComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class NotificationsComponent implements OnInit {
  #notificationsService = inject(NotificationsService);
  #userService = inject(UserService);

  isAdmin = signal<boolean>(false);
  notifications = this.#notificationsService.notifications;
  showCreatePanel = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.#userService.isAdmin().subscribe({
        next: (isAdmin) => {
          this.isAdmin.set(isAdmin);
        },
        error: (error) => {
          this.isAdmin.set(false);
        }
      });
    });
  }

  groupedNotifications = computed(() => {
    const notifications = this.notifications();
    if (!notifications.length) return [];

    const groups: { [key: string]: any[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });

    const result: GroupedNotifications[] = Object.keys(groups).map(key => ({
      date: key,
      notifications: groups[key]
    }));

    return result.sort((a, b) => {
      const dateA = new Date(a.notifications[0].createdAt);
      const dateB = new Date(b.notifications[0].createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  });

  async ngOnInit() {
    await this.#notificationsService.loadNotifications();
    this.#notificationsService.markAllAsRead();
  }

  markAsRead(notificationId: string) {
    this.#notificationsService.markAsRead(notificationId);
  }

  openCreatePanel(): void {
    this.showCreatePanel.set(true);
  }

  closeCreatePanel(): void {
    this.showCreatePanel.set(false);
  }
}
