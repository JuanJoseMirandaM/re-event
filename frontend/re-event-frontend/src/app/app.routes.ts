import {Routes} from '@angular/router';

export const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', loadComponent: () => import('./features/auth/login/login.component')},
  {path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component')},
  {path: '**', redirectTo: '/login'}
];
