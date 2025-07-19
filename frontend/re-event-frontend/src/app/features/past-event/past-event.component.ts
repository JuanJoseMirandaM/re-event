import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AgendaCardComponent} from '../../components/agenda-card/agenda-card.component';

@Component({
  selector: 'app-past-event',
  imports: [
    AgendaCardComponent
  ],
  templateUrl: './past-event.component.html',
  styleUrl: './past-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PastEventComponent {

}
