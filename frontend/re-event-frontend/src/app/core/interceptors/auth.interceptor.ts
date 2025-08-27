import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  if (shouldAddToken(request.url)) {
    return authService.getAuthToken().pipe(
      take(1),
      switchMap(token => {
        if (token) {
          const authReq = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next(authReq);
        }
        return next(request);
      })
    );
  }
  
  return next(request);
};

function shouldAddToken(url: string): boolean {
  const authUrls = [
    '/auth/',
    '/login',
    '/register',
    '/auth/callback'
  ];
  
  return !authUrls.some(authUrl => url.includes(authUrl));
}
