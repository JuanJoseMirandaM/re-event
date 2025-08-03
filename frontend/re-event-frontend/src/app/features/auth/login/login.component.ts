import {ChangeDetectionStrategy, Component, effect, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from "../../../core/services/auth.service";
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of, switchMap} from 'rxjs';

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
          return of({status: 'idle', error: null})
        }

        return this.#authService.signIn(credentials.email, credentials.password).pipe(
          map(() => ({status: 'success', error: null})),
          catchError(err => {
            const msg = err?.message ?? 'An unexpected error occurred.';
            return of({status: 'error', error: msg});
          }))
      })
    ), {initialValue: {status: 'idle', error: null}}
  );

  loginStateEffect = effect(() => {
    if (this.loginState().status === 'success') {
      this.#router.navigate(['/secure/agenda']);
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

    this.#loginTrigger.set({email, password});
  }
}
