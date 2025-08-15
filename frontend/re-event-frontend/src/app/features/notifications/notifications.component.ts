import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {NotificationCardComponent} from '../../components/notification-card/notification-card.component';
import {NotificationsService} from '../../core/services/notifications.service';
import {PushNotificationService} from '../../core/services/push-notification.service';

@Component({
  selector: 'app-notifications',
  imports: [
    NotificationCardComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class NotificationsComponent implements OnInit {
  #notificationsService = inject(NotificationsService);
  #pushNotificationService = inject(PushNotificationService);

  notifications = this.#notificationsService.notifications;

  async ngOnInit() {
    await this.#notificationsService.loadNotifications();
    await this.#notificationsService.requestNotificationPermission();
    await this.#pushNotificationService.initializePushNotifications();

    this.#notificationsService.markAllAsRead();
  }

  markAsRead(notificationId: string) {
    this.#notificationsService.markAsRead(notificationId);
  }
}
