import {ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal} from '@angular/core';
import {Event} from '../../core/services/events.service';
import {DurationPipe} from '../../pipes';
import {RatingData, RatingPanelComponent} from '../rating-panel/rating-panel.component';
import {Evaluation, EvaluationService, SingleEvaluationResponse} from '../../core/services/evaluation.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-agenda-card',
  imports: [DurationPipe, RatingPanelComponent, TranslatePipe],
  templateUrl: './agenda-card.component.html',
  styleUrl: './agenda-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaCardComponent implements OnInit {
  event = input.required<Event>();

  showRatingPanel = signal<boolean>(false);
  evaluation = signal<SingleEvaluationResponse | null>(null);

  ratingSubmitted = output<Evaluation>();

  #evaluationService = inject(EvaluationService);

  ngOnInit() {
    if (this.isPastEvent()) {
      this.checkEvaluationStatus();
    }
  }

  isPastEvent(): boolean {
    const eventDate = new Date(this.event().startDate);
    return eventDate < new Date();
  }

  onLocationClick(): void {
    if (this.event().locationLink) {
      console.log('Redirigiendo a ubicación:', this.event().locationLink);
    }
  }

  getStartTime(): string {
    const startDate = new Date(this.event().startDate);
    return startDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', hour12: false});
  }

  getEndTime(): string {
    const startDate = new Date(this.event().endDate);
    return startDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', hour12: false});
  }

  private checkEvaluationStatus(): void {
    this.#evaluationService.getEvaluation(this.event().eventId).subscribe({
      next: (response) => {
        this.evaluation.set(response);
      },
      error: (error) => {
        console.log('No evaluation found for session:', this.event().eventId, error);
        this.evaluation.set(null);
      }
    });
  }

  openRatingPanel(): void {
    this.showRatingPanel.set(true);
  }

  closeRatingPanel(): void {
    this.showRatingPanel.set(false);
  }

  onRatingSubmitted(ratingData: RatingData): void {
    const request = {
      sessionId: ratingData.eventId,
      rating: ratingData.rating,
      comments: ratingData.comment
    }
    this.#evaluationService.createEvaluation(request).subscribe({
      next: (response) => {
        console.log('Evaluation submitted:', response);
        this.evaluation.set(response);
        this.ratingSubmitted.emit(response);
        this.closeRatingPanel();
      }
    });
  }
}
