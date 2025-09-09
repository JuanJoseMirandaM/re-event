import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {UserStoreFacade} from '../../core/store/facades/user-store.facade';
import {EventsStoreFacade} from '../../core/store/facades/events-store.facade';
import {toSignal} from '@angular/core/rxjs-interop';
import {RouterLink} from '@angular/router';
import {DatePipe, SlicePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    SlicePipe,
    TranslatePipe
  ]
})
export default class HomeComponent {
  #userStoreFacade = inject(UserStoreFacade);
  #eventsStoreFacade = inject(EventsStoreFacade);

  userProfile$ = toSignal(this.#userStoreFacade.userProfile$);
  upcomingEvents$ = toSignal(this.#eventsStoreFacade.upcomingEvents$);
}
