import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NotificationCardComponent} from '../../components/notification-card/notification-card.component';

@Component({
  selector: 'app-notifications',
  imports: [
    NotificationCardComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class NotificationsComponent {

}
