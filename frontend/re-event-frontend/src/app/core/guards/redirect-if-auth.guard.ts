import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, filter, take } from 'rxjs';

export const redirectIfAuthGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    filter(state => !state.loading),
    take(1),
    map(state => {
      if (state.isAuthenticated) {
        // Si está autenticado, redirigir al dashboard
        return router.createUrlTree(['/secure/agenda']);
      } else {
        // Si no está autenticado, permitir acceso a rutas públicas
        return true;
      }
    })
  );
};
