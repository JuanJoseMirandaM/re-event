import {CanMatchFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {UserStoreFacade} from '../store/facades/user-store.facade';
import {combineLatest, map, take} from 'rxjs';

export const roleGuardGuard: CanMatchFn = (route, segments) => {
  const userStore = inject(UserStoreFacade);
  const requiredRole = route.data?.['requiredRole'];
  return combineLatest({
    isAdmin: userStore.isAdmin$,
    userRole: userStore.userProfile$.pipe(map(user => user.role))
  }).pipe(
    take(1),
    map(({isAdmin, userRole}) => {
      const isAllowed = isAdmin || userRole === requiredRole;
      return !!isAllowed;
    })
  );
};
