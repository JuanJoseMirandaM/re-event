import {Event} from '../../services/events.service';

export interface EventsState {
  upcomingEvents: Event[];
  pastEvents: Event[];
  loading: boolean;
  error: any;
  upcomingLastKey: string | null;
  pastLastKey: string | null;
  upcomingCount: number;
  pastCount: number;
}

export const eventsInitialState: EventsState = {
  upcomingEvents: [],
  pastEvents: [],
  loading: false,
  error: null,
  upcomingLastKey: null,
  pastLastKey: null,
  upcomingCount: 0,
  pastCount: 0,
};
