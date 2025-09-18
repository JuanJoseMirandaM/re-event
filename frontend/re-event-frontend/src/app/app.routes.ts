import {Routes} from '@angular/router';
import {isAuthGuard} from './core/guards/is-auth.guard';
import {redirectIfAuthGuard} from './core/guards/redirect-if-auth.guard';
import {PointsService} from './core/services/points.service';
import {UserRole} from './core/services/user.service';
import {roleGuardGuard} from './core/guards/role-guard.guard';

export const routes: Routes = [
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
        path: 'sessions',
        loadComponent: () => import('./features/sessions/sessions.component')
      },
      {
        path: 'points',
        loadComponent: () => import('./features/points/points.component')
      },
      {
        path: 'gallery',
        loadComponent: () => import('./features/gallery/gallery.component')
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
        path: 'qr-redeem',
        loadComponent: () => import('./features/qr/qr-redeem/qr-redeem.component'),
        data: {requiredRole: UserRole.ORGANIZER},
        canMatch: [roleGuardGuard]
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
        path: 'home',
        loadComponent: () => import('./features/home/home.component')
      },
      {
        path: 'redeem-points/:userId',
        loadComponent: () => import("./features/redeem-points/redeem-points.component"),
        data: {requiredRole: UserRole.ORGANIZER},
        canMatch: [roleGuardGuard]
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: '**',
        redirectTo: 'home'
      }
    ],
    canMatch: [isAuthGuard],
    providers: [PointsService]
  },
  {
    path: 'install',
    loadComponent: () => import('./features/pwa-install/pwa-install.component')
  },
  {
    path: 'qr-generator',
    loadComponent: () => import('./features/qr-generator/qr-generator.component')
  },
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {
    path: '**', redirectTo: '/login'
  },
];
