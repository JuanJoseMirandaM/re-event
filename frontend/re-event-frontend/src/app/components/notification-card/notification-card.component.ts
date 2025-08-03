import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {Notification} from '../../core/services/notifications.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-notification-card',
  imports: [
    DatePipe
  ],
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCardComponent {
  notification = input.required<Notification>();
  markAsRead = output<string>();

  onMarkAsRead() {
    this.markAsRead.emit(this.notification().notificationId);
  }
}
