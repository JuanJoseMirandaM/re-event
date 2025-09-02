import {inject, Injectable} from '@angular/core';
import {Store} from "@ngrx/store";
import {userActions} from '../actions/user.action';
import {selectIsAdmin, selectUserProfile} from '../selectors/user.selector';

@Injectable({providedIn: 'root'})
export class UserStoreFacade {
  readonly #userStore = inject(Store);

  readonly userProfile$ = this.#userStore.select(selectUserProfile);
  readonly isAdmin$ = this.#userStore.select(selectIsAdmin);

  loadUserProfile() {
    this.#userStore.dispatch(userActions.loadUserProfile());
  }
}
