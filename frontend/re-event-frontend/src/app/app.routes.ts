import {Routes} from '@angular/router';
import {isAuthGuard} from './core/guards/is-auth.guard';
import {redirectIfAuthGuard} from './core/guards/redirect-if-auth.guard';
import {PointsService} from './core/services/points.service';
import {EventsService} from './core/services/events.service';

export const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component'),
    canMatch: [redirectIfAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component'),
    canMatch: [redirectIfAuthGuard]
  },
  {
    path: 'verify',
    loadComponent: () => import('./features/auth/verify/verify.component'),
    canMatch: [redirectIfAuthGuard]
  },
  {path: 'auth/callback', loadComponent: () => import('./features/auth/callback/callback.component')},
  {path: 'auth/logout', loadComponent: () => import('./features/auth/logout/logout.component')},
  {
    path: 'secure',
    loadComponent: () => import('./features/secure/secure.component'),
    children: [
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component')
      },
      {
        path: 'agenda',
        loadComponent: () => import('./features/agenda/agenda.component'),
        children: [
          {
            path: 'upcoming',
            loadComponent: () => import('./features/upcoming-event/upcoming-event.component'),
          },
          {
            path: 'past',
            loadComponent: () => import('./features/past-event/past-event.component'),
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'upcoming'
          }
        ]
      },
      {
        path: 'points',
        loadComponent: () => import('./features/points/points.component')
      },
      {
        path: 'account',
        loadComponent: () => import('./features/my-account/my-account.component')
      },
      {
        path: 'qr',
        loadComponent: () => import('./features/qr/qr-scanner/qr-scanner.component')
      },
      {
        path: 'claim-points',
        loadComponent: () => import('./features/claim-points/claim-points.component')
      },
      {
        path: 'my-qr',
        loadComponent: () => import('./features/my-qr/my-qr.component')
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'notifications'
      },
    ],
    canMatch: [isAuthGuard],
    providers: [PointsService, EventsService]
  },
  {
    path: '**', redirectTo: '/login'
  },
];
