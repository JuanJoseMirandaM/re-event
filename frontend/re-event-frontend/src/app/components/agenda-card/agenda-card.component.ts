import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-agenda-card',
  imports: [],
  templateUrl: './agenda-card.component.html',
  styleUrl: './agenda-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaCardComponent {
  isPastEvent = input(false);
}
