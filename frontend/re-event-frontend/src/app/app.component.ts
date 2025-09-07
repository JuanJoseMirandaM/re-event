import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {CommonModule} from '@angular/common';
import {LoaderOverlayComponent} from './shared/components/loader-overlay/loader-overlay.component';
import {filter} from 'rxjs/operators';
import {ToastContainerComponent} from './shared/components/toast-container/toast-container.component';
import {FcmService} from "./core/services/fcm.service";
import {NotificationsService} from "./core/services/notifications.service";
import {WalkthroughComponent} from './shared/components/walkthrough/walkthrough.component';
import {WalkthroughService} from './core/services/walkthrough.service';
import {TranslateService} from '@ngx-translate/core';
import {noop} from 'rxjs';
import {UserStoreFacade} from './core/store/facades/user-store.facade';
import {SplashScreenComponent} from './shared/components/splash-screen/splash-screen.component';
import {EventsStoreFacade} from './core/store/facades/events-store.facade';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoaderOverlayComponent, ToastContainerComponent, WalkthroughComponent, SplashScreenComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  #fcmService = inject(FcmService);
  #notificationService = inject(NotificationsService);
  #translate = inject(TranslateService);
  walkthroughService = inject(WalkthroughService);
  #userStoreFacade = inject(UserStoreFacade);
  #eventsStoreFacade = inject(EventsStoreFacade);

  constructor(public authService: AuthService) {
  }

  ngOnInit() {
    this.listenToAuthChanges();
    this.#detectLanguage();
  }

  listenToAuthChanges(): void {
    this.authService.authState$
      .pipe(filter(state => !state.loading))
      .subscribe({
        next: async (authState) => {
          try {
            if (authState.isAuthenticated) {
              this.#userStoreFacade.loadUserProfile()
              this.#eventsStoreFacade.loadUpcomingEvents();
              this.#eventsStoreFacade.loadPastEvents();
              await this.#fcmService.installFCMServiceWorker();
              this.#notificationService.initForegroundListener();
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

  #detectLanguage(): void {
    this.#translate.use(this.#translate.getBrowserLang() || 'en').subscribe(noop)
  }
}
