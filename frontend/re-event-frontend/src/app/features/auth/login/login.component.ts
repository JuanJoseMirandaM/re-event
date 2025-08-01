import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from "../../../core/services/auth.service";

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

  errorMessage = signal('');
  loginForm = this.#formGroup.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  constructor() {
    const router = inject(Router);

    this.#authService.isAuthenticated().subscribe(isAuthenticated => {
      console.log(isAuthenticated);
      if (isAuthenticated) {
        router.navigate(['/secure/agenda']);
      }
    });
  }

  get lf() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const email = this.loginForm.get('email')?.value ?? '';
    const password = this.loginForm.get('password')?.value ?? '';

    this.errorMessage.set('');

    this.#authService.signIn(email, password).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {
        const msg = err?.message ?? 'An unexpected error occurred. Please try again.';
        this.errorMessage.set(msg);
        console.error('Login error:', err);
      }
    });
  }
}
