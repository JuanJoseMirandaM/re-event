import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { LoaderOverlayComponent } from './shared/components/loader-overlay/loader-overlay.component';
import { NotificationManagerService } from './core/services/notification-manager.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoaderOverlayComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  #notificationManager = inject(NotificationManagerService);
  #destroy$ = new Subject<void>();

  constructor(public authService: AuthService) {
  }

  async ngOnInit() {
    // Escuchar cambios en el estado de autenticación
    this.authService.authState$
      .pipe(
        filter(state => !state.loading), // Solo procesar cuando no esté cargando
        takeUntil(this.#destroy$)
      )
      .subscribe(async (authState) => {
        if (authState.isAuthenticated) {
          // Usuario autenticado - inicializar notificaciones
          console.log('✅ Usuario autenticado - Inicializando notificaciones...');
          await this.#notificationManager.initializeAfterLogin();
        } else {
          // Usuario no autenticado - limpiar notificaciones
          await this.#notificationManager.cleanup();
        }
      });
  }

  ngOnDestroy() {
    this.#destroy$.next();
    this.#destroy$.complete();
    this.#notificationManager.cleanup();
  }
}
