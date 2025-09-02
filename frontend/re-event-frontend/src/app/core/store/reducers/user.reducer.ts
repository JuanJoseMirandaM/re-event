import {createReducer, on} from '@ngrx/store';
import {userInitialState} from '../store/user.state';
import {userActions} from '../actions/user.action';

export const userReducer = createReducer(
  userInitialState,
  on(userActions.loadUserProfileSuccess, (state, {user, isAdmin}) => ({
    ...state,
    userProfile: user,
    isAdmin
  }))
)
