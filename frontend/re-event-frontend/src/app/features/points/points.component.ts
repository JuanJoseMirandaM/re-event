import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {PointsCardComponent} from '../../components/points-card/points-card.component';
import {PointsHistoryResponse, PointsService} from '../../core/services/points.service';
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
    class: 'flex flex--col items-center gap-4 p-2'
  }
})
export default class PointsComponent implements OnInit {
  #pointsService = inject(PointsService);

  isLoading = signal(true);
  pointsHistory = signal<PointsHistoryResponse>(
    {
      count: 0,
      items: [],
      lastKey: null
    }
  );

  points = toSignal(this.#pointsService.getTotalPoints(), {
    initialValue: 0
  })
  itemPoints = computed(() => this.pointsHistory().items)

  ngOnInit() {
    this.loadPointsHistory();
  }

  private loadPointsHistory(): void {
    this.isLoading.set(true);

    this.#pointsService.getPointsHistory().subscribe({
      next: (response) => {
        this.pointsHistory.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoading.set(false);
      }
    })
  }
}
