import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {BehaviorSubject} from 'rxjs';
import {type AuthSession, type AuthUser} from 'aws-amplify/auth';

interface AuthCallbackState {
  status: 'loading' | 'success' | 'error';
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
}

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="callback-container">
      <div class="loading-spinner">
        <div class="spinner spinner--md"></div>
        <p>Completando autenticación...</p>
      </div>

      @if (errorMessage()) {
        <div class="error-message">
          <p>{{ errorMessage() }}</p>
          <button (click)="retryAuth()">Reintentar</button>
          <button (click)="goToLogin()">Ir al Login</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }

    .loading-spinner {
      text-align: center;
    }

    .error-message {
      text-align: center;
      margin-top: 2rem;
    }

    .error-message button {
      margin: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .error-message button:first-of-type {
      background-color: #3498db;
      color: white;
    }

    .error-message button:last-of-type {
      background-color: #95a5a6;
      color: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AuthCallbackComponent {
  #authService = inject(AuthService);
  #router = inject(Router);

  private authStateSubject = new BehaviorSubject<AuthCallbackState>({
    status: 'loading'
  });

  errorMessage = signal<string>('');

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    this.#authService.handleAuthRedirect().subscribe({
      next: ({user, session}) => {
        console.log('Autenticación exitosa:', user);
        this.authStateSubject.next({
          status: 'success',
          user,
          session
        });
        this.#router.navigate(['/secure/agenda']);
      },
      error: (error) => {
        console.error('Error en autenticación:', error);
        this.errorMessage.set(error.message || 'Error desconocido en la autenticación');
        this.authStateSubject.next({
          status: 'error',
          error: error.message
        });
      }
    });
  }

  retryAuth(): void {
    this.errorMessage.set('');
    this.authStateSubject.next({status: 'loading'});
    this.initializeAuth();
  }

  goToLogin(): void {
    this.#router.navigate(['/login']);
  }
}
