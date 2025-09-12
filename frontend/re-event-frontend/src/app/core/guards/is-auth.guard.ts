import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, filter, take } from 'rxjs';

export const isAuthGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    filter(state => !state.loading),
    take(1),
    map(state => {
      if (state.isAuthenticated) {
        const currentUrl = window.location.pathname + window.location.search;
        localStorage.setItem('lastVisitedUrl', currentUrl);
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  );
};
