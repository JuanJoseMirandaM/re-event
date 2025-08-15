import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {CommonModule} from '@angular/common';
import {LoaderOverlayComponent} from './shared/components/loader-overlay/loader-overlay.component';
import {NotificationsService} from "./core/services/notifications.service";
import {PushNotificationService} from "./core/services/push-notification.service";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoaderOverlayComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  #notificationsService = inject(NotificationsService);
  #pushNotificationService = inject(PushNotificationService);

  constructor(public authService: AuthService) {
  }

  async ngOnInit() {
    await this.#notificationsService.requestNotificationPermission();
    await this.#pushNotificationService.initializePushNotifications();
  }
}
