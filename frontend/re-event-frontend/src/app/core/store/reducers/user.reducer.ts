import {createReducer, on} from '@ngrx/store';
import {userInitialState, UserState} from '../store/user.state';
import {userActions} from '../actions/user.action';

export const userReducer = createReducer(
  userInitialState,

  on(userActions.loadUserProfile, (state: UserState) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(userActions.loadUserProfileSuccess, (state:UserState, {user}) => ({
    ...state,
    loading: false,
    userProfile: user,
  })),

  on(userActions.loadUserProfileFailure, (state, {error}) => ({
    ...state,
    loading: false,
    error,
  })),

  on(userActions.checkUserIsAdmin, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(userActions.checkUserIsAdminSuccess, (state, {isAdmin}) => ({
    ...state,
    loading: false,
    isAdmin,
  })),

  on(userActions.checkUserIsAdminFailure, (state, {error}) => ({
    ...state,
    loading: false,
    error,
  }))
);
