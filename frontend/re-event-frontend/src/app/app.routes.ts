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
            path: '',
            pathMatch: 'full',
            redirectTo: 'upcoming'
          }
        ]
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'notifications'
      },
    ]
  },
  {
    path: '**', redirectTo: '/login'
  }
];
