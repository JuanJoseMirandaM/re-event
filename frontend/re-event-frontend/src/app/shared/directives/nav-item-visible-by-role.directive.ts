import {Directive, effect, ElementRef, inject, input, Renderer2} from '@angular/core';
import {UserRole} from '../../core/services/user.service';
import {UserStoreFacade} from '../../core/store/facades/user-store.facade';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';

@Directive({
  selector: '[navItemVisibleByRole]'
})
export class NavItemVisibleByRoleDirective {
  allowedRoles = input<UserRole[]>([]);

  #userStoreFacade = inject(UserStoreFacade);
  #render2 = inject(Renderer2);

  elementRef: ElementRef<HTMLLinkElement> = inject(ElementRef);
  actualRole = toSignal(this.#userStoreFacade.userProfile$.pipe(map(user => user.role)), {initialValue: UserRole.GUEST});
  isAdmin = toSignal(this.#userStoreFacade.isAdmin$, {initialValue: false});

  detectRoleEffect = effect(() => {
    const allowed = this.allowedRoles();
    const isAllowed = allowed.length === 0 || allowed.includes(this.actualRole()) || this.isAdmin();

    if (isAllowed) {
      this.#render2.setStyle(this.elementRef.nativeElement, 'display', null);
    } else {
      this.#render2.setStyle(this.elementRef.nativeElement, 'display', 'none');
    }
  });
}
