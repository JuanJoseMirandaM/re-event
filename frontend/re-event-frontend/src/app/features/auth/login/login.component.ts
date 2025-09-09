import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from "../../../core/services/auth.service";
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, finalize, map, of, switchMap} from 'rxjs';
import {LoaderService} from '../../../core/services/loader.service';
import {PwaInstallService} from '../../../core/services/pwa-install.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LoginComponent {
  #formBuilder = inject(FormBuilder);
  #authService = inject(AuthService);
  #loader = inject(LoaderService);
  #pwaService = inject(PwaInstallService);
  #loginTrigger = signal<{ email: string; password: string } | null>(null);

  passwordVisible = signal(false);

  loginState = toSignal(
    toObservable(this.#loginTrigger).pipe(
      switchMap(credentials => {
        if (!credentials) {
          return of({status: 'idle', error: null})
        }

        this.#loader.show();
        return this.#authService.signIn(credentials.email, credentials.password).pipe(
          map(() => ({status: 'success', error: null})),
          catchError(err => {
            const msg = err?.message ?? 'An unexpected error occurred.';
            return of({status: 'error', error: msg});
          }),
          finalize(() => this.#loader.hide())
        )
      })
    ), {initialValue: {status: 'idle', error: null}}
  );

  googleLoginState = toSignal(
    this.#authService.authState$.pipe(
      map(state => ({
        loading: state.loading,
        error: state.error
      }))
    ), {initialValue: {loading: false, error: null}}
  );

  errorMessage = signal('');
  loginForm = this.#formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  get lf() {
    return this.loginForm.controls;
  }

  showInstallButton = this.#pwaService.showInstallButton;
  isIOS = this.#pwaService.isIOS;

  togglePasswordVisibility(): void {
    this.passwordVisible.update(value => !value);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const email = this.loginForm.get('email')?.value ?? '';
    const password = this.loginForm.get('password')?.value ?? '';

    this.#loginTrigger.set({email, password});
  }

  onGoogleSignIn(): void {
    this.errorMessage.set('');
    this.#loader.show();
    this.#authService.signInWithGoogle().subscribe({
      next: () => {
        // Keep loader visible until redirect occurs
        console.log('Redirigiendo a Google...');
      },
      error: (error) => {
        console.error('Error al iniciar sesión con Google:', error);
        this.errorMessage.set('Error al iniciar sesión con Google. Inténtalo de nuevo.');
        this.#loader.hide();
      }
    });
  }

  clearError(): void {
    this.errorMessage.set('');
    this.#authService.clearError();
  }

  async onInstallPwa() {
    try {
      const result = await this.#pwaService.installPwa();
      if (result.success) {
        console.log('Instalación iniciada exitosamente');
      } else {
        console.error('Error en la instalación:', result.error);
      }
    } catch (error) {
      console.error('Error inesperado durante la instalación:', error);
    }
  }
}
