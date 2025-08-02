import {ChangeDetectionStrategy, Component, inject, signal, computed} from '@angular/core';
import {AgendaCardComponent} from '../../components/agenda-card/agenda-card.component';
import {EventsService, Event} from "../../core/services/events.service";

@Component({
  selector: 'app-upcoming-event',
  imports: [
    AgendaCardComponent
  ],
  templateUrl: './upcoming-event.component.html',
  styleUrl: './upcoming-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class UpcomingEventComponent {
  #eventsService = inject(EventsService);
  
  upcomingEvents = signal<Event[]>([]);
  
  eventsByDate = computed(() => {
    const events = this.upcomingEvents();
    const grouped = new Map<string, Event[]>();
    
    events.forEach(event => {
      const date = new Date(event.startDate).toISOString().split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(event);
    });
    
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, events]) => ({
        date,
        events: events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      }));
  });
  
  constructor() {
    this.loadUpcomingEvents();
  }
  
  private loadUpcomingEvents() {
    this.#eventsService.getUpcomingEvents().subscribe({
      next: (response) => this.upcomingEvents.set(response.items),
      error: (error) => console.error('Error loading upcoming events:', error)
    });
  }
  
  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }
}
