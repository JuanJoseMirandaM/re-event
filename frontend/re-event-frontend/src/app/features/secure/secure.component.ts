import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import {HeaderComponent} from '../header/header.component';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';
import {SecureContainersService} from '../../core/services/secure-containers.service';
import {ContainerNames} from '../../utils/container-names.enum';
import {FloatingMenuComponent} from '../shared/floating-menu/floating-menu.component';
import {SplashScreenComponent} from '../../shared/components/splash-screen/splash-screen.component';

@Component({
  selector: 'app-secure',
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent,
    FloatingMenuComponent,
    SplashScreenComponent
  ],
  templateUrl: './secure.component.html',
  styleUrl: './secure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class SecureComponent implements OnDestroy {
  secureViewContainer = viewChild('secureContainerRef', {read: ViewContainerRef});

  #secureContainersService = inject(SecureContainersService);

  registerContainerEffect = effect(() => {
    const viewContainer = this.secureViewContainer();
    viewContainer && this.#secureContainersService.register(ContainerNames.SECURE, viewContainer);
  });

  ngOnDestroy(): void {
    this.#secureContainersService.unregister(ContainerNames.SECURE);
  }
}
