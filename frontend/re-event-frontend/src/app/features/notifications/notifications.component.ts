import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {NotificationCardComponent} from '../../components/notification-card/notification-card.component';
import {NotificationResponse, NotificationsService} from '../../core/services/notifications.service';
import {RelativeDatePipe} from "../../pipes";
import {TranslatePipe} from '@ngx-translate/core';
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
    TranslatePipe
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class NotificationsComponent implements OnInit {
  #notificationsService = inject(NotificationsService);
  #userService = inject(UserService);

  isAdmin = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  notifications = signal<NotificationResponse[]>([]);
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
    this.isLoading.set(true);

    this.#notificationsService.getNotifications().subscribe({
      next: (response) => {
        this.notifications.set(response.items);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading.set(false);
      }
    });
  }

  openCreatePanel(): void {
    this.showCreatePanel.set(true);
  }

  closeCreatePanel(): void {
    this.showCreatePanel.set(false);
  }
}
