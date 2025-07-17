import {ChangeDetectionStrategy, Component, signal, WritableSignal} from '@angular/core';
import {Notification} from '../../core/notification.interface';
import {TypeNotificationClassPipe} from '../../pipes/type-notification-class.pipe';

@Component({
  selector: 'app-notification-card',
  imports: [
    TypeNotificationClassPipe
  ],
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCardComponent {
  notification: WritableSignal<Notification> = signal({
    id: '',
    title: '',
    description: '',
    timestamp: new Date(),
    read: false,
    type: 'launch'
  })
}
