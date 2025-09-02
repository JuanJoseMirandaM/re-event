import {inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, exhaustMap, map, of, switchMap, take} from 'rxjs';
import {userActions} from '../actions/user.action';
import {UserService} from '../../services/user.service';

// Effect to handle loading the user profile
const loadUserProfile$ = createEffect(
  (actions$ = inject(Actions), userService = inject(UserService)) => {
    return actions$.pipe(
      ofType(userActions.loadUserProfile),
      exhaustMap(() =>
        userService.getCurrentUser().pipe(
          take(1),
          map((user) => userActions.loadUserProfileSuccess({user})),
          catchError((error) => of(userActions.loadUserProfileFailure({error})))
        )
      )
    );
  },
  {functional: true}
);

const checkUserIsAdmin$ = createEffect(
  (actions$ = inject(Actions), userService = inject(UserService)) => {
    return actions$.pipe(
      ofType(userActions.loadUserProfileSuccess),
      switchMap(() =>
        userService.isAdmin().pipe(
          take(1),
          map((isAdmin) => userActions.checkUserIsAdminSuccess({isAdmin})),
          catchError((error) => of(userActions.checkUserIsAdminFailure({error})))
        )
      )
    );
  },
  {functional: true}
);

export const UserEffects = {
  loadUserProfile$,
  checkUserIsAdmin$,
};
