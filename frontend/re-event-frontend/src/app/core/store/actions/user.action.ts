import {createAction, props} from '@ngrx/store';
import {User} from '../../services/user.service';

export enum UserAction {
  LOAD_USER_PROFILE = '[User Guard] Load User Profile',
  LOAD_USER_PROFILE_SUCCESS = '[User API] Load User Profile Success',
  LOAD_USER_PROFILE_FAILURE = '[User API] Load User Profile Failure',

  CHECK_USER_IS_ADMIN = '[User Effect] Check User Is Admin',
  CHECK_USER_IS_ADMIN_SUCCESS = '[User API] Check User Is Admin Success',
  CHECK_USER_IS_ADMIN_FAILURE = '[User API] Check User Is Admin Failure',

  UPDATE_USER_PROFILE = '[Profile Page] Update User Profile',
  UPDATE_USER_PROFILE_SUCCESS = '[User API] Update User Profile Success',
  UPDATE_USER_PROFILE_FAILURE = '[User API] Update User Profile Failure',
}

export const userActions = {
  loadUserProfile: createAction(UserAction.LOAD_USER_PROFILE),
  loadUserProfileSuccess: createAction(UserAction.LOAD_USER_PROFILE_SUCCESS, props<{ user: User }>()),
  loadUserProfileFailure: createAction(UserAction.LOAD_USER_PROFILE_FAILURE, props<{ error: any }>()),

  checkUserIsAdmin: createAction(UserAction.CHECK_USER_IS_ADMIN),
  checkUserIsAdminSuccess: createAction(UserAction.CHECK_USER_IS_ADMIN_SUCCESS, props<{ isAdmin: boolean }>()),
  checkUserIsAdminFailure: createAction(UserAction.CHECK_USER_IS_ADMIN_FAILURE, props<{ error: any }>()),
};
