import { createReducer, on } from '@ngrx/store';
import { eventsInitialState, EventsState } from '../store/events.state';
import { eventsActions } from '../actions/events.action';

export const eventsReducer = createReducer(
  eventsInitialState,

  on(eventsActions.loadUpcomingEvents, (state: EventsState) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(eventsActions.loadUpcomingEventsSuccess, (state: EventsState, { response }) => ({
    ...state,
    loading: false,
    upcomingEvents: response.items,
    upcomingLastKey: response.lastKey,
    upcomingCount: response.count,
  })),

  on(eventsActions.loadUpcomingEventsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(eventsActions.loadPastEvents, (state: EventsState) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(eventsActions.loadPastEventsSuccess, (state: EventsState, { response }) => ({
    ...state,
    loading: false,
    pastEvents: response.items,
    pastLastKey: response.lastKey,
    pastCount: response.count,
  })),

  on(eventsActions.loadPastEventsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(eventsActions.loadMoreUpcomingEvents, (state: EventsState) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(eventsActions.loadMorePastEvents, (state: EventsState) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(eventsActions.clearEvents, (state) => ({
    ...state,
    upcomingEvents: [],
    pastEvents: [],
    upcomingLastKey: null,
    pastLastKey: null,
    upcomingCount: 0,
    pastCount: 0,
    loading: false,
    error: null,
  }))
);
