import {inject, Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {eventsActions} from '../actions/events.action';
import {
  selectEventsError,
  selectEventsLoading,
  selectPastCount,
  selectPastEvents,
  selectPastEventsByDate,
  selectPastLastKey,
  selectUpcomingCount,
  selectUpcomingEvents,
  selectUpcomingEventsByDate,
  selectUpcomingLastKey
} from '../selectors/events.selector';
import {EventsParams} from '../../services/events.service';

@Injectable({providedIn: 'root'})
export class EventsStoreFacade {
  readonly #eventsStore = inject(Store);

  readonly upcomingEvents$ = this.#eventsStore.select(selectUpcomingEvents);
  readonly pastEvents$ = this.#eventsStore.select(selectPastEvents);
  readonly eventsLoading$ = this.#eventsStore.select(selectEventsLoading);
  readonly eventsError$ = this.#eventsStore.select(selectEventsError);

  readonly upcomingEventsByDate$ = this.#eventsStore.select(selectUpcomingEventsByDate);
  readonly pastEventsByDate$ = this.#eventsStore.select(selectPastEventsByDate);

  readonly upcomingLastKey$ = this.#eventsStore.select(selectUpcomingLastKey);
  readonly pastLastKey$ = this.#eventsStore.select(selectPastLastKey);

  readonly upcomingCount$ = this.#eventsStore.select(selectUpcomingCount);
  readonly pastCount$ = this.#eventsStore.select(selectPastCount);

  loadUpcomingEvents(params?: EventsParams) {
    this.#eventsStore.dispatch(eventsActions.loadUpcomingEvents({params}));
  }

  loadPastEvents(params?: EventsParams) {
    this.#eventsStore.dispatch(eventsActions.loadPastEvents({params}));
  }

  loadMoreUpcomingEvents(params?: EventsParams) {
    this.#eventsStore.dispatch(eventsActions.loadMoreUpcomingEvents({params}));
  }

  loadMorePastEvents(params?: EventsParams) {
    this.#eventsStore.dispatch(eventsActions.loadMorePastEvents({params}));
  }

  clearEvents() {
    this.#eventsStore.dispatch(eventsActions.clearEvents());
  }
}
