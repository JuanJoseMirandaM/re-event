import {ChangeDetectionStrategy, Component, effect, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of, switchMap} from 'rxjs';
import {startWith} from 'rxjs/operators';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 're-general-padding re-flex re-flex-column'
  }
})
export default class VerifyComponent implements OnInit {
  #activatedRoute = inject(ActivatedRoute);
  #auth = inject(AuthService);
  #fb = inject(FormBuilder);
  #router = inject(Router);

  email = signal<string>('');

  #confirmTrigger = signal<string | null>(null); // code

  codeForm = this.#fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  confirmState = toSignal(
    toObservable(this.#confirmTrigger).pipe(
      switchMap(code => {
        if (!code) {
          return of({status: 'idle', error: null});
        }
        const email = this.email();
        return this.#auth.confirmSignUp(email, code).pipe(
          map(() => ({status: 'success', error: null})),
          catchError(err => {
            const msg = err?.message ?? 'An unexpected error occurred.';
            return of({status: 'error', error: msg});
          }),
          startWith({status: 'loading', error: null} as const)
        );
      })
    ),
    {initialValue: {status: 'idle', error: null}}
  );

  confirmEffect = effect(() => {
    if (this.confirmState().status === 'success') {
      this.#router.navigate(['/secure/agenda']);
    }
  });

  ngOnInit(): void {
    const emailParam = this.#activatedRoute.snapshot.queryParamMap.get('email') ?? '';
    this.email.set(emailParam);
  }

  get cf() {
    return this.codeForm.controls;
  }

  onSubmit() {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    const code = this.codeForm.get('code')?.value ?? '';
    this.#confirmTrigger.set(code);
  }
}
