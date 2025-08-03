import {CanMatchFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {map} from 'rxjs';

export const isAuthGuard: CanMatchFn = (route, segments) => {
  const isAuthService = inject(AuthService)
  const router = inject(Router);

  return isAuthService.isAuthenticated().pipe(
    map(isAuth => isAuth ? true : router.createUrlTree(['/login']))
  );
};
