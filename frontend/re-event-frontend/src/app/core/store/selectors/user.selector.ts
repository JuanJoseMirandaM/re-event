import {createFeatureSelector, createSelector} from '@ngrx/store';
import {UserState} from '../store/user.state';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectUserProfile = createSelector(
  selectUserState,
  (state: UserState) => state.userProfile
);

export const selectIsAdmin = createSelector(
  selectUserState,
  (state: UserState) => state.isAdmin
);
