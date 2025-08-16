import {ChangeDetectionStrategy, Component, input, output, signal} from '@angular/core';
import {Event} from '../../core/services/events.service';
import {DurationPipe} from '../../pipes/duration.pipe';
import {RatingPanelComponent, RatingData} from '../rating-panel/rating-panel.component';

@Component({
  selector: 'app-agenda-card',
  imports: [DurationPipe, RatingPanelComponent],
  templateUrl: './agenda-card.component.html',
  styleUrl: './agenda-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaCardComponent {
  event = input.required<Event>();

  showRatingPanel = signal<boolean>(false);

  ratingSubmitted = output<RatingData>();

  isPastEvent(): boolean {
    const eventDate = new Date(this.event().startDate);
    return eventDate < new Date();
  }

  getSpeakerNames(): string {
    return this.event().speakers?.map(speaker => speaker.name).join(', ') || 'AWS UG';
  }

  getStartTime(): string {
    const startDate = new Date(this.event().startDate);
    return startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  getEndTime(): string {
    const startDate = new Date(this.event().endDate);
    return startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  openRatingPanel(): void {
    this.showRatingPanel.set(true);
  }

  closeRatingPanel(): void {
    this.showRatingPanel.set(false);
  }

  onRatingSubmitted(ratingData: RatingData): void {
    this.ratingSubmitted.emit(ratingData);
    this.closeRatingPanel();
  }
}
