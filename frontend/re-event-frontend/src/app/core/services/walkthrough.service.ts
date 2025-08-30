import { Injectable, signal, computed } from '@angular/core';

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
  
  private state = signal<WalkthroughState>({
    isCompleted: this.checkIfCompleted(),
    currentStep: 0,
    totalSteps: 3
  });

  // Computed properties
  isCompleted = computed(() => this.state().isCompleted);
  currentStep = computed(() => this.state().currentStep);
  totalSteps = computed(() => this.state().totalSteps);
  shouldShowWalkthrough = computed(() => !this.state().isCompleted);

  constructor() {
    this.initializeWalkthrough();
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
