import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AgendaCardComponent} from '../../components/agenda-card/agenda-card.component';
import {RelativeDatePipe} from "../../pipes";
import {EventsStoreFacade} from '../../core/store/facades/events-store.facade';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-upcoming-event',
  imports: [
    AgendaCardComponent,
    RelativeDatePipe,
    AsyncPipe
  ],
  templateUrl: './upcoming-event.component.html',
  styleUrl: './upcoming-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class UpcomingEventComponent {
  #eventsStore = inject(EventsStoreFacade);

  eventsByDate$ = this.#eventsStore.upcomingEventsByDate$;
  loading$ = this.#eventsStore.eventsLoading$;

}
