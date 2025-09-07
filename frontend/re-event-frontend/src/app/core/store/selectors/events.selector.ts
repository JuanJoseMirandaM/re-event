import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventsState } from '../store/events.state';
import { Event } from '../../services/events.service';

export const selectEventsState = createFeatureSelector<EventsState>('events');

export const selectUpcomingEvents = createSelector(
  selectEventsState,
  (state: EventsState) => state.upcomingEvents
);

export const selectPastEvents = createSelector(
  selectEventsState,
  (state: EventsState) => state.pastEvents
);

export const selectEventsLoading = createSelector(
  selectEventsState,
  (state: EventsState) => state.loading
);

export const selectEventsError = createSelector(
  selectEventsState,
  (state: EventsState) => state.error
);

export const selectUpcomingLastKey = createSelector(
  selectEventsState,
  (state: EventsState) => state.upcomingLastKey
);

export const selectPastLastKey = createSelector(
  selectEventsState,
  (state: EventsState) => state.pastLastKey
);

export const selectUpcomingCount = createSelector(
  selectEventsState,
  (state: EventsState) => state.upcomingCount
);

export const selectPastCount = createSelector(
  selectEventsState,
  (state: EventsState) => state.pastCount
);

// Grouped selectors for components
export const selectUpcomingEventsByDate = createSelector(
  selectUpcomingEvents,
  (events: Event[]) => {
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
  }
);

export const selectPastEventsByDate = createSelector(
  selectPastEvents,
  (events: Event[]) => {
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
  }
);