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

@Component({
  selector: 'app-secure',
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent
  ],
  templateUrl: './secure.component.html',
  styleUrl: './secure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class SecureComponent implements OnDestroy {
  #secureContainersService = inject(SecureContainersService);

  secureViewContainer = viewChild('secureContainerRef', {read: ViewContainerRef});
  registerContainerEffect = effect(() => {
    const viewContainer = this.secureViewContainer();
    viewContainer && this.#secureContainersService.register(ContainerNames.SECURE, viewContainer);
  });

  ngOnDestroy(): void {
    this.#secureContainersService.unregister(ContainerNames.SECURE);
  }
}
