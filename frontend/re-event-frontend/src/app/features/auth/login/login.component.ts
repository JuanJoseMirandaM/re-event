import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-aws-orange to-primary-600 flex items-center justify-center p-4">
      <mat-card class="w-full max-w-md">
        <mat-card-header class="text-center pb-4">
          <mat-card-title class="text-2xl font-bold text-aws-dark">
            re:Event
          </mat-card-title>
          <mat-card-subtitle>
            AWS Community Day 2025
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email es requerido
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Email inválido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Contraseña es requerida
              </mat-error>
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="w-full"
              [disabled]="loginForm.invalid || isLoading">
              {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="text-center">
          <p class="text-sm text-gray-600">
            ¿No tienes cuenta? 
            <a routerLink="/register" class="text-aws-orange hover:underline">
              Regístrate aquí
            </a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.snackBar.open('¡Bienvenido!', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open(response.error?.message || 'Error al iniciar sesión', 'Cerrar', { duration: 5000 });
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Error de conexión', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}