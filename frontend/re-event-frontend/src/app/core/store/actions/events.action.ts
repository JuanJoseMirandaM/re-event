import {createAction, props} from '@ngrx/store';
import {EventsParams, EventsResponse} from '../../services/events.service';

export enum EventsAction {
  LOAD_UPCOMING_EVENTS = '[Events] Load Upcoming Events',
  LOAD_UPCOMING_EVENTS_SUCCESS = '[Events API] Load Upcoming Events Success',
  LOAD_UPCOMING_EVENTS_FAILURE = '[Events API] Load Upcoming Events Failure',

  LOAD_PAST_EVENTS = '[Events] Load Past Events',
  LOAD_PAST_EVENTS_SUCCESS = '[Events API] Load Past Events Success',
  LOAD_PAST_EVENTS_FAILURE = '[Events API] Load Past Events Failure',

  LOAD_MORE_UPCOMING_EVENTS = '[Events] Load More Upcoming Events',
  LOAD_MORE_PAST_EVENTS = '[Events] Load More Past Events',

  CLEAR_EVENTS = '[Events] Clear Events',
}

export const eventsActions = {
  loadUpcomingEvents: createAction(
    EventsAction.LOAD_UPCOMING_EVENTS,
    props<{ params?: EventsParams }>()
  ),
  loadUpcomingEventsSuccess: createAction(
    EventsAction.LOAD_UPCOMING_EVENTS_SUCCESS,
    props<{ response: EventsResponse }>()
  ),
  loadUpcomingEventsFailure: createAction(
    EventsAction.LOAD_UPCOMING_EVENTS_FAILURE,
    props<{ error: any }>()
  ),

  loadPastEvents: createAction(
    EventsAction.LOAD_PAST_EVENTS,
    props<{ params?: EventsParams }>()
  ),
  loadPastEventsSuccess: createAction(
    EventsAction.LOAD_PAST_EVENTS_SUCCESS,
    props<{ response: EventsResponse }>()
  ),
  loadPastEventsFailure: createAction(
    EventsAction.LOAD_PAST_EVENTS_FAILURE,
    props<{ error: any }>()
  ),

  loadMoreUpcomingEvents: createAction(
    EventsAction.LOAD_MORE_UPCOMING_EVENTS,
    props<{ params?: EventsParams }>()
  ),
  loadMorePastEvents: createAction(
    EventsAction.LOAD_MORE_PAST_EVENTS,
    props<{ params?: EventsParams }>()
  ),

  clearEvents: createAction(EventsAction.CLEAR_EVENTS),
};
