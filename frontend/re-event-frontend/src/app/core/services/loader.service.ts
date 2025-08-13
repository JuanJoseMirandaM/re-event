import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  // Use a counter to support nested/concurrent loads
  #counter = signal(0);
  isLoading = computed(() => this.#counter() > 0);

  show(): void {
    this.#counter.update(v => v + 1);
  }

  hide(): void {
    this.#counter.update(v => (v > 0 ? v - 1 : 0));
  }

  set(loading: boolean): void {
    if (loading) this.show();
    else this.hide();
  }

  reset(): void {
    this.#counter.set(0);
  }
}
