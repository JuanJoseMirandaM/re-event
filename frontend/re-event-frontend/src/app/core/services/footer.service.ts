import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class FooterService {
  readonly #hidden = signal(false);

  readonly hidden = this.#hidden.asReadonly();

  hide(): void {
    this.#hidden.set(true);
  }

  show(): void {
    this.#hidden.set(false);
  }

  toggle(): void {
    this.#hidden.update(v => !v);
  }
}
