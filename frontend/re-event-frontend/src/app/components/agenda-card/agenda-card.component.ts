import {ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal} from '@angular/core';
import {Event, EventsService} from '../../core/services/events.service';
import {DurationPipe} from '../../pipes';
import {RatingData, RatingPanelComponent} from '../rating-panel/rating-panel.component';
import {Evaluation, EvaluationService, SingleEvaluationResponse} from '../../core/services/evaluation.service';
import {TranslatePipe} from '@ngx-translate/core';
import {ToastService} from '../../core/services/toast.service';

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
  isFavorite = signal<boolean>(false);
  isEvaluated = signal<boolean>(false);
  evaluation = signal<SingleEvaluationResponse | null>(null);

  ratingSubmitted = output<Evaluation>();
  favoriteToggled = output<{ eventId: string; isFavorite: boolean }>();

  #evaluationService = inject(EvaluationService);
  #eventsService = inject(EventsService);
  #toast = inject(ToastService);

  ngOnInit() {
    // Initialize user data from event
    this.initializeUserData();
    
    // if (this.isPastEvent()) {
    //   // this.checkEvaluationStatus();
    // }
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
    const dayName = startDate.toLocaleDateString('es-ES', { weekday: 'long' });
    const day = startDate.getDate();
    const monthName = startDate.toLocaleDateString('es-ES', { month: 'long' });
    const time = startDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', hour12: false});
    
    // Capitalize first letter of day and month
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    
    return `${capitalizedDay}, ${day} ${capitalizedMonth}, ${time}`;
  }

  private initializeUserData(): void {
    const userData = this.event().userData;
    if (userData) {
      this.isFavorite.set(userData.isFavorite);
      this.isEvaluated.set(userData.isEvaluated);
      if (userData.evaluation) {
        this.evaluation.set(userData.evaluation);
      }
    }
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
        this.isEvaluated.set(true);
        this.ratingSubmitted.emit(response);
        this.closeRatingPanel();
      }
    });
  }

  toggleFavorite(): void {
    const eventId = this.event().eventId;
    const currentFavoriteStatus = this.isFavorite();
    const newFavoriteStatus = !currentFavoriteStatus;

    // Optimistic UI update - change color immediately
    this.isFavorite.set(newFavoriteStatus);
    this.favoriteToggled.emit({ eventId, isFavorite: newFavoriteStatus });

    if (currentFavoriteStatus) {
      // Remove from favorites
      this.#eventsService.removeFavorite(eventId).subscribe({
        next: () => {
          // Success notification
          this.#toast.success('Evento eliminado de favoritos');
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
          // Rollback on error
          this.isFavorite.set(currentFavoriteStatus);
          this.favoriteToggled.emit({ eventId, isFavorite: currentFavoriteStatus });
          this.#toast.error('Error al eliminar de favoritos');
        }
      });
    } else {
      // Add to favorites
      this.#eventsService.addFavorite(eventId).subscribe({
        next: () => {
          // Success notification
          this.#toast.success('Evento añadido a favoritos');
        },
        error: (error) => {
          console.error('Error adding favorite:', error);
          // Rollback on error
          this.isFavorite.set(currentFavoriteStatus);
          this.favoriteToggled.emit({ eventId, isFavorite: currentFavoriteStatus });
          this.#toast.error('Error al añadir a favoritos');
        }
      });
    }
  }
}
