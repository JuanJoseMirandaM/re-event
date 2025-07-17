import {Routes} from '@angular/router';

export const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', loadComponent: () => import('./features/auth/login/login.component')},
  {path: 'register', loadComponent: () => import('./features/auth/register/register.component')},
  {
    path: 'secure',
    loadComponent: () => import('./features/secure/secure.component'),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'notifications'
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component')
      }
    ]
  },
  {
    path: '**', redirectTo: '/login'
  }
];
