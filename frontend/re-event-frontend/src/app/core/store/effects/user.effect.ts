import {inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, exhaustMap, map, of} from 'rxjs';
import {userActions} from '../actions/user.action';
import {UserService} from '../../services/user.service';

const loadUserProfile$ = () =>
  createEffect(
    (actions$ = inject(Actions), userService = inject(UserService)) => {
      return actions$.pipe(
        ofType(userActions.loadUserProfile),
        exhaustMap(() => userService.getCurrentUser()
          .pipe(
            map((user) =>
              userActions.loadUserProfileSuccess({user, isAdmin: false})),
            catchError((error) => of(userActions.loadUserProfileFailure({error})))
          )
        )
      );
    },
    {functional: true}
  );

export const UserEffects = {loadUserProfile$: loadUserProfile$()};
