import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {Event, EventsService} from "../../core/services/events.service";

@Component({
  selector: 'app-agenda',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AgendaComponent {
  #eventsService = inject(EventsService);

  constructor() {
    this.#eventsService.getEvents().subscribe((events: Event[]) => console.log(events));
  }
}
