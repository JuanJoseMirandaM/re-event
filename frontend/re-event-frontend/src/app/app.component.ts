import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {CommonModule} from '@angular/common';
import {LoaderOverlayComponent} from './shared/components/loader-overlay/loader-overlay.component';
import {NotificationManagerService} from './core/services/notification-manager.service';
import {filter} from 'rxjs/operators';
import {ToastContainerComponent} from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoaderOverlayComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  #notificationManager = inject(NotificationManagerService);

  constructor(public authService: AuthService) {
  }

  ngOnInit() {
    this.#listenToAuthChanges();
  }

  #listenToAuthChanges(): void {
    this.authService.authState$
      .pipe(filter(state => !state.loading))
      .subscribe({
        next: async (authState) => {
          try {
            if (authState.isAuthenticated) {
              console.log('User is authenticated');
              await this.#notificationManager.initializeAfterLogin();
            } else {
              await this.#notificationManager.cleanup();
            }
          } catch (error) {
            console.error('Error handling auth state change:', error);
          }
        },
        error: (error) => {
          console.error('Error in auth state subscription:', error);
        }
      });
  }

  ngOnDestroy() {
    this.#notificationManager.cleanup();
  }
}
