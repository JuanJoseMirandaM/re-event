import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, take } from 'rxjs';
import { eventsActions } from '../actions/events.action';
import { EventsService } from '../../services/events.service';

const loadUpcomingEvents$ = createEffect(
  (actions$ = inject(Actions), eventsService = inject(EventsService)) => {
    return actions$.pipe(
      ofType(eventsActions.loadUpcomingEvents),
      exhaustMap(({ params }) =>
        eventsService.getUpcomingEventsWithUserData(params?.limit, params?.lastKey).pipe(
          take(1),
          map((response) => eventsActions.loadUpcomingEventsSuccess({ response })),
          catchError((error) => of(eventsActions.loadUpcomingEventsFailure({ error })))
        )
      )
    );
  },
  { functional: true }
);

const loadPastEvents$ = createEffect(
  (actions$ = inject(Actions), eventsService = inject(EventsService)) => {
    return actions$.pipe(
      ofType(eventsActions.loadPastEvents),
      exhaustMap(({ params }) =>
        eventsService.getPastEventsWithUserData(params?.limit, params?.lastKey).pipe(
          take(1),
          map((response) => eventsActions.loadPastEventsSuccess({ response })),
          catchError((error) => of(eventsActions.loadPastEventsFailure({ error })))
        )
      )
    );
  },
  { functional: true }
);

const loadMoreUpcomingEvents$ = createEffect(
  (actions$ = inject(Actions), eventsService = inject(EventsService)) => {
    return actions$.pipe(
      ofType(eventsActions.loadMoreUpcomingEvents),
      switchMap(({ params }) =>
        eventsService.getUpcomingEventsWithUserData(params?.limit, params?.lastKey).pipe(
          take(1),
          map((response) => eventsActions.loadUpcomingEventsSuccess({ response })),
          catchError((error) => of(eventsActions.loadUpcomingEventsFailure({ error })))
        )
      )
    );
  },
  { functional: true }
);

const loadMorePastEvents$ = createEffect(
  (actions$ = inject(Actions), eventsService = inject(EventsService)) => {
    return actions$.pipe(
      ofType(eventsActions.loadMorePastEvents),
      switchMap(({ params }) =>
        eventsService.getPastEventsWithUserData(params?.limit, params?.lastKey).pipe(
          take(1),
          map((response) => eventsActions.loadPastEventsSuccess({ response })),
          catchError((error) => of(eventsActions.loadPastEventsFailure({ error })))
        )
      )
    );
  },
  { functional: true }
);

export const EventsEffects = {
  loadUpcomingEvents$,
  loadPastEvents$,
  loadMoreUpcomingEvents$,
  loadMorePastEvents$,
};
