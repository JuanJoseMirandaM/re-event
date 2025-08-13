import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {PointsCardComponent} from '../../components/points-card/points-card.component';
import {PointsService} from '../../core/services/points.service';
import {toSignal} from '@angular/core/rxjs-interop';

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
  #pointsService = inject(PointsService);

  pointsHistory = toSignal(this.#pointsService.getPointsHistory({limit: 20}), {
    initialValue: {
      count: 0,
      items: [],
      lastKey: null
    }
  })

  points = toSignal(this.#pointsService.getTotalPoints(), {
    initialValue: 0
  })
  itemPoints = computed(() => this.pointsHistory().items)
}
