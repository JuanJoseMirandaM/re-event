import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, RouterLink} from '@angular/router';

@Component({
  selector: 'app-verify',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 're-general-padding re-flex re-flex-column'
  }
})
export default class VerifyComponent implements OnInit {
  #fb = inject(FormBuilder);
  #route = inject(ActivatedRoute);

  email = signal<string>('');

  ngOnInit(): void {
    const emailParam = this.#route.snapshot.queryParamMap.get('email') ?? '';
    this.email.set(emailParam);
  }

  codeForm = this.#fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  get cf() {
    return this.codeForm.controls;
  }

  onSubmit() {
    // UI only for now. No backend call.
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    // Could show a toast or simple visual feedback when wired.
  }
}
