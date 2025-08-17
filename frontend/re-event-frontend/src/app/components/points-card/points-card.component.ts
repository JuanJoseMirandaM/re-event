import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {PointsClaim} from '../../core/services/points.service';
import {DatePipe} from '@angular/common';
import {RelativeDatePipe} from "../../pipes";

@Component({
  selector: 'app-points-card',
  imports: [
    DatePipe,
    RelativeDatePipe
  ],
  templateUrl: './points-card.component.html',
  styleUrl: './points-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex items-center gap-2',
  }
})
export class PointsCardComponent {
  pointsDetail = input.required<PointsClaim>();
}
