import {ChangeDetectionStrategy, Component, effect, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {passwordMatcherValidator} from '../../../utils/passwordMatcher.validator';
import {AuthService} from '../../../core/services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of, switchMap} from 'rxjs';
import {startWith} from 'rxjs/operators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class RegisterComponent {
  #formBuilder = inject(FormBuilder);
  #authService = inject(AuthService);
  #router = inject(Router);
  #signUpTrigger = signal<{ name: string; email: string; password: string } | null>(null);

  signUpState = toSignal(
    toObservable(this.#signUpTrigger).pipe(
      switchMap(payload => {
        if (!payload) {
          return of({status: 'idle', error: null});
        }
        const {name, email, password} = payload;
        return this.#authService.signUp(email, password, name).pipe(
          map(() => ({status: 'success', error: null})),
          catchError(err => {
            /*TODO: Implemente a toast ui*/
            const msg = err?.message ?? 'An unexpected error occurred.';
            return of({status: 'error', error: msg});
          }),
          startWith({status: 'loading', error: null} as const)
        );
      })
    ),
    {initialValue: {status: 'idle', error: null}}
  );

  signUpEffect = effect(() => {
    if (this.signUpState().status === 'success') {
      const email = this.registerForm.get('email')?.value ?? '';
      // Navigate to verify UI screen (UI only for now)
      this.#router.navigate(['/verify'], {queryParams: {email}});
    }
  });

  registerForm = this.#formBuilder.group({
    name: ['', Validators.required, Validators.minLength(3)],
    email: ['', [Validators.required, Validators.email, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  }, {
    validators: passwordMatcherValidator
  });

  get rf() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const name = this.registerForm.get('name')?.value ?? '';
    const email = this.registerForm.get('email')?.value ?? '';
    const password = this.registerForm.get('password')?.value ?? '';
    this.#authService.passwordRegister.set(password);
    this.#signUpTrigger.set({name, email, password});
  }
}
