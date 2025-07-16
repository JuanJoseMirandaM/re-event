import {AbstractControl, ValidationErrors} from '@angular/forms';

export const passwordMatcherValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword || password.value === null || confirmPassword.value === null) {
    return null;
  }

  if (password.value === confirmPassword.value) {
    confirmPassword.setErrors({passwordMismatch: true});
    return {passwordMismatch: true};
  } else {
    confirmPassword.setErrors(null);
    return null;
  }
};
