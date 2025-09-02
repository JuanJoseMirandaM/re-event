import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {UserStoreFacade} from '../../core/store/facades/user-store.facade';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {
  #userStoreFacade = inject(UserStoreFacade);

  userProfile$ = toSignal(this.#userStoreFacade.userProfile$);
}
