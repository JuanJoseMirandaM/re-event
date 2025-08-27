import {computed, inject, Injectable, signal} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FloatingMenuService {
  #router = inject(Router);
  #excludedRoutes = ['/login', '/register', 'qr'];
  #isVisible = signal<boolean>(true);

  isVisible = computed(this.#isVisible);

  constructor() {
    this.#listenRouteChanges();
  }

  setVisibility(isVisible: boolean): void {
    this.#isVisible.set(isVisible);
  }

  #listenRouteChanges(): void {
    this.#router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      const isExcluded = this.#excludedRoutes.some(route => url.includes(route));
      this.#isVisible.set(!isExcluded);
    });
  }
}
