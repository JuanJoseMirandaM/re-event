import {Routes} from '@angular/router';

export const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', loadComponent: () => import('./features/auth/login/login.component')},
  {path: 'register', loadComponent: () => import('./features/auth/register/register.component')},
  {path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component')},
  {path: '**', redirectTo: '/login'}
];
