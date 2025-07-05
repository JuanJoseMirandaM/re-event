import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService, User } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-aws-dark">¡Hola, {{ user?.name }}!</h1>
              <p class="text-gray-600 mt-1">Bienvenido al AWS Community Day 2025</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-aws-orange">{{ user?.points || 0 }}</div>
              <div class="text-sm text-gray-500">puntos</div>
            </div>
          </div>
        </div>

        <!-- Verification Alert -->
        <div *ngIf="!user?.verified" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <mat-icon class="text-yellow-600 mr-2">warning</mat-icon>
            <div class="flex-1">
              <h3 class="font-semibold text-yellow-800">Cuenta no verificada</h3>
              <p class="text-yellow-700 text-sm">Ingresa tu código de verificación para acceder a todas las funcionalidades.</p>
            </div>
            <button mat-raised-button color="warn" (click)="goToVerification()">
              Verificar Ahora
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <mat-card class="cursor-pointer hover:shadow-md transition-shadow" (click)="navigateTo('/sessions')">
            <mat-card-content class="text-center p-6">
              <mat-icon class="text-4xl text-aws-orange mb-2">event</mat-icon>
              <h3 class="font-semibold">Agenda</h3>
              <p class="text-sm text-gray-600">Ver sesiones</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="cursor-pointer hover:shadow-md transition-shadow" (click)="navigateTo('/points')">
            <mat-card-content class="text-center p-6">
              <mat-icon class="text-4xl text-aws-orange mb-2" [matBadge]="user?.points || 0">stars</mat-icon>
              <h3 class="font-semibold">Mis Puntos</h3>
              <p class="text-sm text-gray-600">Ver historial</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="cursor-pointer hover:shadow-md transition-shadow" (click)="navigateTo('/photos')">
            <mat-card-content class="text-center p-6">
              <mat-icon class="text-4xl text-aws-orange mb-2">photo_library</mat-icon>
              <h3 class="font-semibold">Galería</h3>
              <p class="text-sm text-gray-600">Fotos del evento</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="cursor-pointer hover:shadow-md transition-shadow" (click)="navigateTo('/qr-scanner')">
            <mat-card-content class="text-center p-6">
              <mat-icon class="text-4xl text-aws-orange mb-2">qr_code_scanner</mat-icon>
              <h3 class="font-semibold">Escanear QR</h3>
              <p class="text-sm text-gray-600">Ganar puntos</p>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Role-specific features -->
        <div *ngIf="user?.verified" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Upcoming Sessions -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Próximas Sesiones</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h4 class="font-semibold">Introducción a Serverless</h4>
                    <p class="text-sm text-gray-600">09:00 - 10:00 | Auditorio Principal</p>
                  </div>
                  <button mat-icon-button>
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h4 class="font-semibold">Containers en AWS</h4>
                    <p class="text-sm text-gray-600">10:30 - 11:30 | Sala B</p>
                  </div>
                  <button mat-icon-button>
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Leaderboard -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Top Participantes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
                    <div>
                      <p class="font-semibold">María González</p>
                      <p class="text-sm text-gray-600">AWS</p>
                    </div>
                  </div>
                  <span class="font-bold text-aws-orange">850 pts</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
                    <div>
                      <p class="font-semibold">Carlos Ruiz</p>
                      <p class="text-sm text-gray-600">Microsoft</p>
                    </div>
                  </div>
                  <span class="font-bold text-aws-orange">720 pts</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</div>
                    <div>
                      <p class="font-semibold">Ana López</p>
                      <p class="text-sm text-gray-600">Google</p>
                    </div>
                  </div>
                  <span class="font-bold text-aws-orange">680 pts</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  goToVerification(): void {
    this.router.navigate(['/verify-code']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}