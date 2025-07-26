import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-points-card',
  imports: [],
  templateUrl: './points-card.component.html',
  styleUrl: './points-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 're-flex re-gap-flex-1-2 re-flex-jc-center re-align-items-center'
  }
})
export class PointsCardComponent {

}
