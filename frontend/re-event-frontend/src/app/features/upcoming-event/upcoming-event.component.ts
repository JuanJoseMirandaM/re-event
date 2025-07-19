import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AgendaCardComponent} from '../../components/agenda-card/agenda-card.component';

@Component({
  selector: 'app-upcoming-event',
  imports: [
    AgendaCardComponent
  ],
  templateUrl: './upcoming-event.component.html',
  styleUrl: './upcoming-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class UpcomingEventComponent {

}
