import {Component, inject} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {passwordMatcherValidator} from '../../../utils/passwordMatcher.validator';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export default class RegisterComponent {
  #formBuilder = inject(FormBuilder);

  registerForm = this.#formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  }, {
    validators: passwordMatcherValidator
  });

  get rf() {
    return this.registerForm.controls;
  }
}
