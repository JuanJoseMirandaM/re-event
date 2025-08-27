import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FloatingMenuService} from '../floating-menu.service';
import {Router} from '@angular/router';
import {SecureContainersService} from '../../../core/services/secure-containers.service';
import {ContainerNames} from '../../../utils/container-names.enum';
import {CreateEventComponent} from '../../../components/create-event/create-event.component';
import {UserService} from '../../../core/services/user.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {CreateNotificationComponent} from '../../../components/create-notification/create-notification.component';

@Component({
  selector: 'app-floating-menu',
  templateUrl: './floating-menu.component.html',
  styleUrls: ['./floating-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingMenuComponent {
  #floatingMenuService = inject(FloatingMenuService);
  #router = inject(Router);
  #secureContainer = inject(SecureContainersService);
  #userService = inject(UserService);

  isAdmin = toSignal(this.#userService.isAdmin(), {initialValue: false});
  isMenuOpen = signal<boolean>(false);
  isVisible = this.#floatingMenuService.isVisible;

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  redirectToQrScanner(): void {
    this.#router.navigate(['secure/qr']);
  }

  createEvent(): void {
    this.toggleMenu();
    this.#floatingMenuService.setVisibility(false);
    const createEventRef = this.#secureContainer.createComponent(ContainerNames.SECURE, CreateEventComponent);
    createEventRef.setInput('isVisible', true);
    createEventRef.instance.closePanel.subscribe(() => {
      this.#floatingMenuService.setVisibility(true);
      createEventRef.destroy()
    });
  }

  createNotification(): void {
    this.toggleMenu();
    this.#floatingMenuService.setVisibility(false);
    const createEventRef = this.#secureContainer.createComponent(ContainerNames.SECURE, CreateNotificationComponent);
    createEventRef.setInput('isVisible', true);
    createEventRef.instance.closePanel.subscribe(() => {
      this.#floatingMenuService.setVisibility(true);
      createEventRef.destroy()
    });
  }
}
