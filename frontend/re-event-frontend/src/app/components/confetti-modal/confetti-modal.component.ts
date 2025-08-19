import { ChangeDetectionStrategy, Component, input, output, signal, effect, OnDestroy } from '@angular/core';
import confetti from 'canvas-confetti';

export interface ConfettiModalConfig {
  title: string;
  description: string;
  buttonText?: string;
  icon?: string;
  points?: number;
}

@Component({
  selector: 'app-confetti-modal',
  standalone: true,
  template: `
    @if (isVisible()) {
      <div class="confetti-modal" [class.confetti-modal--visible]="isVisible()">
        <div class="confetti-modal__overlay" (click)="onClose()"></div>
        
        <div class="confetti-modal__content">
          
          <div class="modal-content">
            @if (config().icon) {
              <div class="modal-icon">
                <span class="material-symbols-outlined">{{ config().icon }}</span>
              </div>
            }
            
            @if (config().points) {
              <div class="points-badge">
                <span class="points-number">+{{ config().points }}</span>
                <span class="points-label">Puntos</span>
              </div>
            }

            <h2 class="modal-title">{{ config().title }}</h2>
            <p class="modal-description">{{ config().description }}</p>
            
            <button class="btn btn--primary" (click)="onClose()">
              {{ config().buttonText || '¡Genial!' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './confetti-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfettiModalComponent implements OnDestroy {
  isVisible = input.required<boolean>();
  config = input.required<ConfettiModalConfig>();
  
  closeModal = output<void>();

  private confettiIntervalId: number | null = null;

  constructor() {
    effect(() => {
      if (this.isVisible()) {
        this.launchCanvasConfetti();
      } else {
        this.clearConfetti();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearConfetti();
  }

  onClose(): void {
    this.clearConfetti();
    this.closeModal.emit();
  }

  private clearConfetti(): void {
    if (this.confettiIntervalId !== null) {
      clearInterval(this.confettiIntervalId);
      this.confettiIntervalId = null;
    }
  }

  private launchCanvasConfetti(): void {
    this.clearConfetti();

    const durationMs = 900;
    const animationEnd = Date.now() + durationMs;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    confetti({
      zIndex: 100000,
      startVelocity: 60,
      spread: 360,
      ticks: 70,
      particleCount: 120,
      origin: { x: 0.5, y: 1 },
      scalar: 1.1,
      disableForReducedMotion: true
    });

    this.confettiIntervalId = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        this.clearConfetti();
        return;
      }

      const particleCount = Math.floor(80 * (timeLeft / durationMs));

      // Izquierda inferior
      confetti({
        zIndex: 100000,
        angle: randomInRange(60, 120),
        spread: randomInRange(55, 85),
        particleCount,
        origin: { x: randomInRange(0.05, 0.25), y: 1 },
        startVelocity: randomInRange(45, 65),
        scalar: randomInRange(0.9, 1.2),
        disableForReducedMotion: true
      });

      // Derecha inferior
      confetti({
        zIndex: 100000,
        angle: randomInRange(60, 120),
        spread: randomInRange(55, 85),
        particleCount,
        origin: { x: randomInRange(0.75, 0.95), y: 1 },
        startVelocity: randomInRange(45, 65),
        scalar: randomInRange(0.9, 1.2),
        disableForReducedMotion: true
      });

      // Centro inferior (ráfagas más pequeñas)
      confetti({
        zIndex: 100000,
        angle: randomInRange(70, 110),
        spread: randomInRange(60, 90),
        particleCount: Math.floor(particleCount * 0.6),
        origin: { x: randomInRange(0.35, 0.65), y: 1 },
        startVelocity: randomInRange(40, 60),
        scalar: randomInRange(0.8, 1.1),
        disableForReducedMotion: true
      });
    }, 140);
  }
}
