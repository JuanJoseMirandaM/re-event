import { Injectable, signal, computed } from '@angular/core';

export interface SplashScreenState {
  isVisible: boolean;
  showLogo: boolean;
  showText: boolean;
  showProgress: boolean;
  progressValue: number;
  isComplete: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SplashScreenService {
  private state = signal<SplashScreenState>({
    isVisible: true,
    showLogo: false,
    showText: false,
    showProgress: false,
    progressValue: 0,
    isComplete: false
  });

  // Callback para cuando el progreso esté completo
  private onProgressComplete?: () => void;

  // Computed properties
  isVisible = computed(() => this.state().isVisible);
  showLogo = computed(() => this.state().showLogo);
  showText = computed(() => this.state().showText);
  showProgress = computed(() => this.state().showProgress);
  progressValue = computed(() => this.state().progressValue);
  isComplete = computed(() => this.state().isComplete);

  // Actions
  setShowLogo() {
    this.state.update(state => ({ ...state, showLogo: true }));
  }

  setShowText() {
    this.state.update(state => ({ ...state, showText: true }));
  }

  setShowProgress() {
    this.state.update(state => ({ ...state, showProgress: true }));
  }

  updateProgress(value: number) {
    this.state.update(state => ({ ...state, progressValue: value }));
  }

  complete() {
    this.state.update(state => ({ ...state, isComplete: true }));
  }

  hide() {
    this.state.update(state => ({ ...state, isVisible: false }));
  }

  reset() {
    this.state.set({
      isVisible: true,
      showLogo: false,
      showText: false,
      showProgress: false,
      progressValue: 0,
      isComplete: false
    });
  }

  // Configurar callback para cuando el progreso esté completo
  setProgressCompleteCallback(callback: () => void) {
    this.onProgressComplete = callback;
  }

  // Animation sequence
  startAnimation() {
    // Reset state
    this.reset();

    // Show logo
    setTimeout(() => {
      this.setShowLogo();
    }, 300);

    // Show text
    setTimeout(() => {
      this.setShowText();
    }, 800);

    // Show progress
    setTimeout(() => {
      this.setShowProgress();
      this.animateProgress();
    }, 1200);
  }

  private animateProgress() {
    const duration = 2000; // 2 segundos
    const interval = 50; // Actualizar cada 50ms
    const increment = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      const currentValue = this.state().progressValue;
      const newValue = Math.min(currentValue + increment, 100);
      
      this.updateProgress(newValue);
      
      if (newValue >= 100) {
        clearInterval(timer);
        // Notificar que el progreso está completo
        if (this.onProgressComplete) {
          console.log('SplashService: Calling progress complete callback');
          this.onProgressComplete();
        } else {
          console.log('SplashService: No progress complete callback set');
        }
      }
    }, interval);
  }
}
