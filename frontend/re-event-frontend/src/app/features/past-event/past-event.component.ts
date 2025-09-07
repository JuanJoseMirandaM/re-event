import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AgendaCardComponent} from '../../components/agenda-card/agenda-card.component';
import {RelativeDatePipe} from "../../pipes";
import {EventsStoreFacade} from '../../core/store/facades/events-store.facade';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-past-event',
  imports: [
    AgendaCardComponent,
    RelativeDatePipe,
    AsyncPipe
  ],
  templateUrl: './past-event.component.html',
  styleUrl: './past-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PastEventComponent {
  #eventsStore = inject(EventsStoreFacade);

  eventsByDate$ = this.#eventsStore.pastEventsByDate$;
  loading$ = this.#eventsStore.eventsLoading$;
}
