import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WalkthroughService } from '../../../core/services/walkthrough.service';

export interface WalkthroughStep {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

@Component({
  selector: 'app-walkthrough',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './walkthrough.component.html',
  styleUrl: './walkthrough.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalkthroughComponent implements OnInit {
  private router = inject(Router);
  private walkthroughService = inject(WalkthroughService);

  currentStep = signal<number>(0);
  
  walkthroughSteps: WalkthroughStep[] = [
    {
      id: 1,
      title: 'Descubre las Charlas del AWS Community Day',
      description: 'Explora la agenda completa del evento, encuentra charlas técnicas, workshops y sesiones especiales. Organiza tu día y no te pierdas ninguna presentación.',
      imageUrl: '/images/walkthrough-step1.png',
      imageAlt: 'Agenda y charlas del AWS Community Day'
    },
    {
      id: 2,
      title: 'Gana Puntos y Canjea Premios',
      description: 'Los speakers, sponsors y organizadores tienen puntos especiales para ti. Escanea códigos QR, participa en actividades y canjea tus puntos por premios exclusivos.',
      imageUrl: '/images/walkthrough-step2.png',
      imageAlt: 'Sistema de puntos y premios'
    },
    {
      id: 3,
      title: 'Comparte el Evento con Todos',
      description: 'Sube tus fotos, comparte momentos especiales y conecta con otros participantes. ¡Haz que el AWS Community Day Bolivia sea inolvidable para todos!',
      imageUrl: '/images/walkthrough-step3.png',
      imageAlt: 'Compartir fotos y experiencias'
    }
  ];

  ngOnInit(): void {
    // Sincronizar el total de pasos con el servicio
    this.walkthroughService.updateTotalSteps(this.walkthroughSteps.length);
  }

  get currentStepData(): WalkthroughStep {
    return this.walkthroughSteps[this.currentStep()];
  }

  get isLastStep(): boolean {
    return this.currentStep() === this.walkthroughSteps.length - 1;
  }

  get progressPercentage(): number {
    return ((this.currentStep() + 1) / this.walkthroughSteps.length) * 100;
  }

  onSkip(): void {
    this.completeWalkthrough();
  }

  onContinue(): void {
    if (this.isLastStep) {
      this.completeWalkthrough();
    } else {
      this.nextStep();
    }
  }

  private nextStep(): void {
    this.currentStep.update(current => Math.min(current + 1, this.walkthroughSteps.length - 1));
    this.walkthroughService.setCurrentStep(this.currentStep());
  }

  private completeWalkthrough(): void {
    // Marcar como completado en el servicio
    this.walkthroughService.markAsCompleted();
    
    // Navegar a la página principal
    this.router.navigate(['/']);
  }

  onDotClick(stepIndex: number): void {
    this.currentStep.set(stepIndex);
    this.walkthroughService.setCurrentStep(stepIndex);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIyMCAxMzAgMjQwIDEzMCAyNjAgMTUwQzI4MCAxNzAgMzAwIDE5MCAzMDAgMjEwQzMwMCAyMzAgMjgwIDI1MCAyNjAgMjcwQzI0MCAyOTAgMjIwIDI5MCAyMDAgMjcwQzE4MCAyNTAgMTYwIDIzMCAxNjAgMjEwQzE2MCAxOTAgMTgwIDE3MCAyMDAgMTUwWiIgZmlsbD0iI0QxRDRGQSIvPgo8dGV4dCB4PSIyMDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjc3NDhCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gZGVsIFBhc28gPC90ZXh0Pgo8dGV4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjc3NDhCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QYXNvIDwvLXRleHQ+Cjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Nzc0OEIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjEgPC90ZXh0Pgo8L3N2Zz4K';
  }
}
