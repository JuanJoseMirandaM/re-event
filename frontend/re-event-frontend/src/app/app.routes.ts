import {Routes} from '@angular/router';

export const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', loadComponent: () => import('./features/auth/login/login.component')},
  {path: 'register', loadComponent: () => import('./features/auth/register/register.component')},
  {
    path: 'secure',
    loadComponent: () => import('./features/secure/secure.component')
  },
  {path: '**', redirectTo: '/login'}
];
