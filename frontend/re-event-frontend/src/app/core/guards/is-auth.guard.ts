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
        const url = segments.map(s => s.path).join('/');
        localStorage.setItem('lastVisitedUrl', `/${url}`);
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  );
};
