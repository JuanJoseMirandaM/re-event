import {CanMatchFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {filter, map, take} from 'rxjs';

export const redirectIfAuthGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    filter(state => !state.loading),
    take(1),
    map(state => {
      if (state.isAuthenticated) {
        const lastVisitedUrl = localStorage.getItem('lastVisitedUrl');
        const targetUrl = lastVisitedUrl || '/secure/home';
        return router.createUrlTree([targetUrl]);
      } else {
        return true;
      }
    })
  );
};
