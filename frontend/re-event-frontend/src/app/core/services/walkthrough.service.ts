import { Injectable, signal, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface WalkthroughState {
  isCompleted: boolean;
  currentStep: number;
  totalSteps: number;
}

@Injectable({
  providedIn: 'root'
})
export class WalkthroughService {
  private readonly STORAGE_KEY = 'kinua-walkthrough-completed';
  private readonly router = inject(Router);
  
  // Rutas donde no se debe mostrar el walkthrough
  private readonly excludedRoutes = ['/install', '/qr-generator'];
  
  private currentUrl = signal<string>('/');
  private state = signal<WalkthroughState>({
    isCompleted: this.checkIfCompleted(),
    currentStep: 0,
    totalSteps: 3
  });

  // Computed properties
  isCompleted = computed(() => this.state().isCompleted);
  currentStep = computed(() => this.state().currentStep);
  totalSteps = computed(() => this.state().totalSteps);
  shouldShowWalkthrough = computed(() => {
    // No mostrar walkthrough si ya está completado
    if (this.state().isCompleted) {
      return false;
    }
    
    // No mostrar walkthrough en rutas excluidas
    const url = this.currentUrl();
    const isExcludedRoute = this.excludedRoutes.some(route => url.startsWith(route));
    
    return !isExcludedRoute;
  });

  constructor() {
    this.initializeWalkthrough();
    this.setupRouteListener();
  }

  private checkIfCompleted(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  private initializeWalkthrough(): void {
    // Si ya se completó, no mostrar
    if (this.isCompleted()) {
      return;
    }

    // Verificar si es la primera vez que se abre la app
    const hasVisited = localStorage.getItem('kinua-first-visit');
    if (!hasVisited) {
      localStorage.setItem('kinua-first-visit', 'true');
    }
  }

  private setupRouteListener(): void {
    // Escuchar cambios de ruta y actualizar la URL actual
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.url);
      });
  }

  // Método para actualizar el total de pasos dinámicamente
  updateTotalSteps(totalSteps: number): void {
    this.state.update(state => ({ ...state, totalSteps }));
  }

  markAsCompleted(): void {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    this.state.update(state => ({ ...state, isCompleted: true }));
  }

  resetWalkthrough(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.state.update(state => ({ ...state, isCompleted: false, currentStep: 0 }));
  }

  setCurrentStep(step: number): void {
    this.state.update(state => ({ ...state, currentStep: step }));
  }

  getProgressPercentage(): number {
    return ((this.currentStep() + 1) / this.totalSteps()) * 100;
  }

  isLastStep(): boolean {
    return this.currentStep() === this.totalSteps() - 1;
  }

  nextStep(): void {
    if (!this.isLastStep()) {
      this.setCurrentStep(this.currentStep() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.setCurrentStep(this.currentStep() - 1);
    }
  }
}
