import {ChangeDetectionStrategy, Component, inject, OnInit, computed} from '@angular/core';
import {NotificationCardComponent} from '../../components/notification-card/notification-card.component';
import {NotificationsService} from '../../core/services/notifications.service';
import {RelativeDatePipe} from "../../pipes";

interface GroupedNotifications {
  date: string;
  notifications: any[];
}

@Component({
  selector: 'app-notifications',
  imports: [
    NotificationCardComponent,
    RelativeDatePipe
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class NotificationsComponent implements OnInit {
  #notificationsService = inject(NotificationsService);

  notifications = this.#notificationsService.notifications;

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
}
