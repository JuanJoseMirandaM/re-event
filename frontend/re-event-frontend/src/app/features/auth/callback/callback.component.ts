import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BehaviorSubject, catchError, map, of, switchMap } from 'rxjs';
import { type AuthUser, type AuthSession } from 'aws-amplify/auth';

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
        <div class="spinner"></div>
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
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
  
  #authTrigger = signal<boolean>(true);
  
  private authStateSubject = new BehaviorSubject<AuthCallbackState>({ 
    status: 'loading' 
  });
  
  authState$ = this.authStateSubject.asObservable();
  
  errorMessage = signal<string>('');
  
  constructor() {
    this.initializeAuth();
  }
  
  private initializeAuth(): void {
    this.#authService.handleAuthRedirect().subscribe({
      next: ({ user, session }) => {
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
    this.authStateSubject.next({ status: 'loading' });
    this.initializeAuth();
  }
  
  goToLogin(): void {
    this.#router.navigate(['/login']);
  }
}
