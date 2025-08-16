import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {AgendaCardComponent} from '../../components/agenda-card/agenda-card.component';
import {Event, EventsService} from "../../core/services/events.service";
import {RelativeDatePipe} from "../../pipes";
import {RatingData} from '../../components/rating-panel/rating-panel.component';
import {EvaluationService} from "../../core/services/evaluation.service";

@Component({
  selector: 'app-past-event',
  imports: [
    AgendaCardComponent,
    RelativeDatePipe
  ],
  templateUrl: './past-event.component.html',
  styleUrl: './past-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PastEventComponent {
  #eventsService = inject(EventsService);
  #evalutationService = inject(EvaluationService);

  pastEvents = signal<Event[]>([]);

  eventsByDate = computed(() => {
    const events = this.pastEvents();
    const grouped = new Map<string, Event[]>();

    events.forEach(event => {
      const date = new Date(event.startDate).toISOString().split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(event);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, events]) => ({
        date,
        events: events.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      }));
  });

  constructor() {
    this.loadPastEvents();
  }

  private loadPastEvents() {
    this.#eventsService.getPastEvents().subscribe({
      next: (response) => this.pastEvents.set(response.items),
      error: (error) => console.error('Error loading past events:', error)
    });
  }

  onRatingSubmitted(ratingData: RatingData): void {
    console.log('Rating submitted:', ratingData);
    const evaluation = {
      sessionId: ratingData.eventId,
      rating: ratingData.rating,
      comments: ratingData.comment
    }
    this.#evalutationService.createEvaluation(evaluation).subscribe({
      next: () => {
        console.log('Evaluation submitted:', evaluation);
      }
    })
  }
}
