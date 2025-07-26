import {ChangeDetectionStrategy, Component} from '@angular/core';
import {PointsCardComponent} from '../../components/points-card/points-card.component';

@Component({
  selector: 'app-points',
  imports: [
    PointsCardComponent
  ],
  templateUrl: './points.component.html',
  styleUrl: './points.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 're-general-padding re-flex re-flex-column '
  }
})
export default class PointsComponent {
}
