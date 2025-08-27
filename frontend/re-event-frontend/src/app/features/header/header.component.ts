import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NotificationsService} from "../../core/services/notifications.service";
import {SideMenuComponent} from '../../components/side-menu/side-menu.component';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    SideMenuComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  #notificationsService = inject(NotificationsService);

  // unreadCount = this.#notificationsService.unreadCount;
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }
}
