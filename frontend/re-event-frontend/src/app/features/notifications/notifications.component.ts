import {ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy} from '@angular/core';
import {NotificationCardComponent} from '../../components/notification-card/notification-card.component';
import {NotificationsService} from '../../core/services/notifications.service';

@Component({
  selector: 'app-notifications',
  imports: [
    NotificationCardComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class NotificationsComponent implements OnInit, OnDestroy {
  #notificationsService = inject(NotificationsService);
  
  notifications = this.#notificationsService.notifications;

  async ngOnInit() {
    await this.#notificationsService.connect();
    this.#notificationsService.requestNotificationPermission();
    // this.#notificationsService.markAllAsRead();
  }

  ngOnDestroy() {
    this.#notificationsService.disconnect();
  }

  markAsRead(notificationId: string) {
    this.#notificationsService.markAsRead(notificationId);
  }
}
