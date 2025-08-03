import {ChangeDetectionStrategy, Component, inject, OnDestroy} from '@angular/core';
import {HeaderComponent} from '../header/header.component';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';
import {NotificationsService} from "../../core/services/notifications.service";

@Component({
  selector: 'app-secure',
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent
  ],
  templateUrl: './secure.component.html',
  styleUrl: './secure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class SecureComponent implements OnDestroy {
  #notificationsService = inject(NotificationsService);

  constructor() {
    this.#notificationsService.connect();
  }

  ngOnDestroy() {
    this.#notificationsService.disconnect();
  }
}
