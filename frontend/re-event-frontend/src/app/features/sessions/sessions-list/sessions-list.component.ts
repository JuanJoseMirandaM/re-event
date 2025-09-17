import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  input,
  OnInit,
  output,
  signal
} from '@angular/core';
import {AgendaCardComponent} from '../../../components/agenda-card/agenda-card.component';
import {RelativeDatePipe} from '../../../pipes';
import {Event, EventsService} from '../../../core/services/events.service';
import {ActivatedRoute} from '@angular/router';
import {TranslatePipe} from "@ngx-translate/core";

interface FilteredEvent extends Event {
  isCurrent?: boolean;
  isUpcoming?: boolean;
  isPast?: boolean;
}

interface EventsByDate {
  date: string;
  events: FilteredEvent[];
}

@Component({
  selector: 'app-sessions-list',
  imports: [
    AgendaCardComponent,
    RelativeDatePipe,
    TranslatePipe
  ],
  templateUrl: './sessions-list.component.html',
  styleUrl: './sessions-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:{
    class: 'flex flex--col gap-4'
  }
})
export default class SessionsListComponent implements OnInit {
  #eventsService = inject(EventsService);
  #route = inject(ActivatedRoute);

  activeFilter = input.required<string>();
  selectedTags = input.required<string[]>();

  tagsLoaded = output<string[]>();

  allEvents = signal<FilteredEvent[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  targetSessionId = signal<string | null>(null);

  // Computed properties for filtering
  filteredEvents = computed(() => {
    const events = this.allEvents();
    const filter = this.activeFilter();
    const tags = this.selectedTags();

    let filtered = events;

    // Apply status filter
    switch (filter) {
      case 'current':
        filtered = events.filter(event => event.isCurrent);
        break;
      case 'upcoming':
        filtered = events.filter(event => event.isUpcoming);
        break;
      case 'past':
        filtered = events.filter(event => event.isPast);
        break;
      case 'favorites':
        filtered = events.filter(event => event.userData?.isFavorite);
        break;
      case 'all':
      default:
        // No additional filtering needed
        break;
    }

    // Apply tag filter
    if (tags.length > 0) {
      filtered = filtered.filter(event =>
        event.tags.some(tag => tags.includes(tag))
      );
    }

    return filtered;
  });

  eventsByDate = computed(() => {
    const events = this.filteredEvents();
    const grouped = new Map<string, FilteredEvent[]>();

    events.forEach(event => {
      const date = new Date(event.startDate).toDateString();
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(event);
    });

    return Array.from(grouped.entries())
      .map(([date, events]) => ({
        date, 
        events: events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  ngOnInit() {
    this.loadAllEvents();

    // Handle query param for sessionId
    this.#route.queryParams.subscribe(params => {
      if (params['sessionId']) {
        this.targetSessionId.set(params['sessionId']);
        // Find the event and trigger rating panel
        const event = this.allEvents().find(e => e.eventId === params['sessionId']);
        if (event) {
          // This will be handled by the agenda-card component
          // We just need to ensure the event is visible
          this.scrollToEvent(params['sessionId']);
        }
      }
    });
  }

  public loadAllEvents() {
    this.loading.set(true);
    this.error.set(null);

    // Load all events with user data
    this.#eventsService.getEvents({limit: 1000, includeUserData: true}).subscribe({
      next: (response) => {
        const events = response.items.map(event => this.categorizeEvent(event));
        this.allEvents.set(events);

        // Extract unique tags
        const allTags = new Set<string>();
        events.forEach(event => {
          event.tags.forEach(tag => allTags.add(tag));
        });
        this.tagsLoaded.emit(Array.from(allTags));

        this.loading.set(false);

        // Check if we have a target sessionId after loading
        const targetId = this.targetSessionId();
        if (targetId) {
          const event = events.find(e => e.eventId === targetId);
          if (event) {
            this.scrollToEvent(targetId);
          }
        }
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error.set('Error al cargar las sesiones');
        this.loading.set(false);
      }
    });
  }

  private categorizeEvent(event: Event): FilteredEvent {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    const isCurrent = startDate <= now && endDate >= now;
    const isUpcoming = endDate > now;
    const isPast = endDate < now;

    return {
      ...event,
      isCurrent,
      isUpcoming,
      isPast
    };
  }

  private scrollToEvent(eventId: string) {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      const element = document.querySelector(`[data-event-id="${eventId}"]`);
      if (element) {
        element.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }, 100);
  }

  onFavoriteToggled(data: { eventId: string; isFavorite: boolean }) {
    // Update the event in our local state
    this.allEvents.update(events =>
      events.map(event =>
        event.eventId === data.eventId
          ? {
            ...event,
            userData: {
              ...event.userData,
              isFavorite: data.isFavorite,
              isEvaluated: event.userData?.isEvaluated ?? false
            }
          }
          : event
      )
    );
  }

  onRatingSubmitted(evaluation: any) {
    // Update the event in our local state
    this.allEvents.update(events =>
      events.map(event =>
        event.eventId === evaluation.sessionId
          ? {
            ...event,
            userData: {
              ...event.userData,
              isEvaluated: true,
              isFavorite: event.userData?.isFavorite ?? false,
              evaluation
            }
          }
          : event
      )
    );
  }
}
