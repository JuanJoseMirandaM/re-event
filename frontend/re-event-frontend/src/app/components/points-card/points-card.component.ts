import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {PointsClaim} from '../../core/services/points.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-points-card',
  imports: [
    DatePipe
  ],
  templateUrl: './points-card.component.html',
  styleUrl: './points-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 're-flex re-gap-flex-1-2 re-flex-jc-center re-align-items-center'
  }
})
export class PointsCardComponent {
  pointsDetail = input.required<PointsClaim>();
}
