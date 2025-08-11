import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from "../../../core/services/auth.service";
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LoginComponent {
  #formGroup = inject(FormBuilder);
  #authService = inject(AuthService);
  #router = inject(Router);
  #loginTrigger = signal<{ email: string; password: string } | null>(null);

  loginState = toSignal(
    toObservable(this.#loginTrigger).pipe(
      switchMap(credentials => {
        if (!credentials) {
          return of({ status: 'idle', error: null })
        }

        return this.#authService.signIn(credentials.email, credentials.password).pipe(
          map(() => ({ status: 'success', error: null })),
          catchError(err => {
            const msg = err?.message ?? 'An unexpected error occurred.';
            return of({ status: 'error', error: msg });
          }))
      })
    ), { initialValue: { status: 'idle', error: null } }
  );

  googleLoginState = toSignal(
    this.#authService.authState$.pipe(
      map(state => ({ 
        loading: state.loading, 
        error: state.error 
      }))
    ), { initialValue: { loading: false, error: null } }
  );

  loginStateEffect = effect(() => {
    if (this.loginState().status === 'success') {
      this.#router.navigate(['/secure/agenda']);
    }
  });

  googleLoginStateEffect = effect(() => {
    const state = this.googleLoginState();
    if (state.error) {
      this.errorMessage.set(state.error);
    }
  });

  errorMessage = signal('');
  loginForm = this.#formGroup.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  get lf() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const email = this.loginForm.get('email')?.value ?? '';
    const password = this.loginForm.get('password')?.value ?? '';

    this.#loginTrigger.set({ email, password });
  }

  onGoogleSignIn(): void {
    this.errorMessage.set('');
    this.#authService.signInWithGoogle().subscribe({
      next: () => {
        console.log('Redirigiendo a Google...');
      },
      error: (error) => {
        console.error('Error al iniciar sesión con Google:', error);
        this.errorMessage.set('Error al iniciar sesión con Google. Inténtalo de nuevo.');
      }
    });
  }

  clearError(): void {
    this.errorMessage.set('');
    this.#authService.clearError();
  }
}
