import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {UserService} from '../../core/services/user.service';

@Component({
  selector: 'app-agenda',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AgendaComponent {
  #userService = inject(UserService);

  isAdmin = signal<boolean>(false);
  showCreatePanel = signal<boolean>(false);

  constructor() {
    this.#userService.isAdmin().subscribe({
      next: (isAdmin) => this.isAdmin.set(isAdmin),
      error: () => this.isAdmin.set(false)
    });
  }

  openCreatePanel(): void {
    this.showCreatePanel.set(true);
  }

  closeCreatePanel(): void {
    this.showCreatePanel.set(false);
  }
}
