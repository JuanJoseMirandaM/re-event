import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LoginComponent {
  #formGroup = inject(FormBuilder);

  errorMessage = signal('');
  loginForm = this.#formGroup.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  get lf() {
    return this.loginForm.controls;
  }

  onSubmit() {
   /*TODO Add Logic To Login*/
  }
}
